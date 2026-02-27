'use server';

import type { Face3DStatus, Face3DConfidence } from '@/types/ai';
import { downloadAndPreprocessImage, detectFaceLandmarks, generateFaceMesh } from './face3d-utils';
import { multiViewReconstructionPython, checkPythonService } from './face3d-python-client';
import { createGLBFromMesh } from './glb-generator';
import { uploadGLBToStorage } from './storage-utils';

/**
 * 3D Face Reconstruction Service
 * 
 * This service generates a 3D face model from multiple angle photographs.
 * Uses face landmarks detection and mesh generation to create GLB models.
 */

export interface Face3DReconstructionResult {
  status: Face3DStatus;
  confidence: Face3DConfidence;
  model_url: string | null;
  error?: string;
}

/**
 * Reconstruction source indicates which pipeline produced the landmarks.
 * Used to differentiate confidence levels.
 */
type ReconstructionSource = 'python' | 'vision' | 'ellipsoid';

/**
 * Calculates confidence based on reconstruction quality metrics and source.
 *
 * Confidence tiers:
 * - 'yüksek': Python MediaPipe service with successful reconstruction
 * - 'orta':   GPT-4o vision fallback with good landmarks (>20 points)
 * - 'düşük':  Basic ellipsoid fallback or very few landmarks
 */
function calculateConfidence(
  landmarksDetected: number,
  totalImages: number,
  meshQuality: number,
  source: ReconstructionSource = 'ellipsoid',
  bestKeypointCount: number = 0
): Face3DConfidence {
  // Python service + successful reconstruction => high confidence possible
  if (source === 'python') {
    const detectionRate = landmarksDetected / totalImages;
    const averageQuality = (detectionRate + meshQuality) / 2;
    if (averageQuality >= 0.7) {
      return 'yüksek';
    }
    return 'orta';
  }

  // GPT-4o vision fallback with good landmarks
  if (source === 'vision') {
    if (bestKeypointCount > 20 && meshQuality >= 0.5) {
      return 'orta';
    }
    return 'düşük';
  }

  // Basic ellipsoid fallback
  return 'düşük';
}

/**
 * Generates a 3D face model from 9 different angle photographs
 * 
 * @param imageUrls Array of 9 image URLs (from different angles)
 * @param caseId Case ID for organizing files in storage
 * @returns Promise with reconstruction result
 * 
 * Required angles:
 * - Front (0°)
 * - Right 30°, Left 30°
 * - Right 45°, Left 45°
 * - Right 60°, Left 60°
 * - Right profile (90°), Left profile (90°)
 */
export async function generate3DFaceModel(
  imageUrls: string[],
  caseId?: string
): Promise<Face3DReconstructionResult> {
  // Validation: Must have exactly 9 images
  if (!imageUrls || imageUrls.length !== 9) {
    return {
      status: 'failed',
      confidence: 'düşük',
      model_url: null,
      error: `3D model oluşturmak için tam olarak 9 adet fotoğraf gereklidir. Sağlanan: ${imageUrls?.length || 0} adet.`,
    };
  }

  // Validate all URLs are accessible
  for (const url of imageUrls) {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return {
        status: 'failed',
        confidence: 'düşük',
        model_url: null,
        error: 'Geçersiz görüntü URL\'si tespit edildi.',
      };
    }
  }

  try {
    // Step 1: Download and preprocess images
    const settledResults = await Promise.allSettled(
      imageUrls.map(async (url) => {
        return await downloadAndPreprocessImage(url);
      })
    );

    // Filter fulfilled results, log failures
    const processedImages: Awaited<ReturnType<typeof downloadAndPreprocessImage>>[] = [];
    settledResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        processedImages.push(result.value);
      } else {
        console.error(`Image ${index + 1} işlenemedi:`, result.reason);
      }
    });

    if (processedImages.length < 3) {
      return {
        status: 'failed',
        confidence: 'düşük',
        model_url: null,
        error: `Yetersiz görüntü: ${processedImages.length}/${imageUrls.length} başarılı (minimum 3 gerekli)`,
      };
    }

    // Step 2: Multi-view reconstruction using Python service (if available)
    let landmarksDetected = 0;
    const landmarksResults: Array<import('./face3d-utils').FaceLandmarks> = [];
    let reconstructionQuality = 0.5; // Default quality
    let reconstructionSource: ReconstructionSource = 'ellipsoid';

    // Try to use Python service for multi-view reconstruction
    try {
      const pythonServiceAvailable = await checkPythonService();
      if (pythonServiceAvailable) {
        const multiViewResult = await multiViewReconstructionPython(imageUrls);
        if (multiViewResult && multiViewResult.landmarks_list.length > 0) {
          reconstructionSource = 'python';

          // Convert Python service response to our format
          for (const landmarksResp of multiViewResult.landmarks_list) {
            landmarksResults.push({
              keypoints: landmarksResp.landmarks.map((lm, idx) => ({
                x: lm.x,
                y: lm.y,
                z: lm.z,
                name: `landmark_${idx}`,
              })),
              confidence: landmarksResp.confidence,
              bounding_box: landmarksResp.bounding_box,
              pose_angles: landmarksResp.pose_angles,
            });
          }

          landmarksDetected = multiViewResult.landmarks_list.length;
          reconstructionQuality = multiViewResult.reconstruction_quality;

          if (multiViewResult.warnings.length > 0) {
            console.warn('Multi-view reconstruction warnings:', multiViewResult.warnings);
          }
        }
      }
    } catch (error: unknown) {
      console.warn('Python service error, falling back to individual detection:', error instanceof Error ? error.message : error);
    }

    // Fallback: Detect face landmarks individually if Python service did not produce results.
    // detectFaceLandmarks internally tries Python first, then GPT-4o vision fallback.
    if (reconstructionSource === 'ellipsoid' || landmarksResults.length === 0) {
      for (let i = 0; i < processedImages.length; i++) {
        try {
          const landmarks = await detectFaceLandmarks(processedImages[i], imageUrls[i]);
          if (landmarks) {
            landmarksDetected++;
            landmarksResults.push(landmarks);
            // If any landmark detection succeeded via the individual path,
            // it's either Python single-image or GPT-4o vision.
            // We mark as 'vision' since multi-view Python already failed above.
            if (reconstructionSource === 'ellipsoid') {
              reconstructionSource = 'vision';
            }
          }
        } catch (error: unknown) {
          console.warn(`Face detection failed for image ${i + 1}:`, error instanceof Error ? error.message : error);
          // Continue with other images
        }
      }
    }

    // Step 3: Generate 3D mesh
    let mesh;
    
    if (landmarksResults.length > 0) {
      // Use detected landmarks to generate mesh
      // If we have multiple views, we can use them for better reconstruction
      mesh = generateFaceMesh(landmarksResults);
    } else {
      // Fallback: Generate a basic face-shaped mesh
      mesh = generateFaceMesh([]);
    }

    // Step 4: Export to GLB format
    const glbBuffer = await createGLBFromMesh(mesh, {
      name: 'Face 3D Model',
      author: 'Facial Reconstruction AI',
    });

    // Step 5: Use provided case ID or extract from URL
    // The case ID is needed for organizing files in storage
    let finalCaseId = caseId;
    if (!finalCaseId) {
      // Try to extract from first image URL
      const caseIdMatch = imageUrls[0]?.match(/cases\/([^/]+)/);
      finalCaseId = caseIdMatch ? caseIdMatch[1] : `temp-${Date.now()}`;
    }

    // Step 6: Upload to Supabase Storage
    const modelUrl = await uploadGLBToStorage(glbBuffer, finalCaseId);

    // Step 7: Calculate confidence
    // Use reconstruction quality from Python service if available, otherwise estimate
    const meshQuality = reconstructionSource === 'python' && reconstructionQuality > 0
      ? reconstructionQuality
      : (landmarksResults.length > 0 ? 0.7 : 0.4);

    // Find the best keypoint count across all landmark sets (for vision quality assessment)
    const bestKeypointCount = landmarksResults.reduce(
      (max, lr) => Math.max(max, lr.keypoints.length),
      0
    );

    const confidence = calculateConfidence(
      landmarksDetected,
      imageUrls.length,
      meshQuality,
      reconstructionSource,
      bestKeypointCount
    );

    return {
      status: 'completed',
      confidence,
      model_url: modelUrl,
    };
  } catch (error: unknown) {
    console.error('3D face reconstruction failed:', error);
    return {
      status: 'failed',
      confidence: 'düşük',
      model_url: null,
      error: error instanceof Error ? error.message : '3D model oluşturma sırasında bilinmeyen bir hata oluştu.',
    };
  }
}

/**
 * Validates that images are from different angles
 * This is a placeholder - in production, would use face pose estimation
 * 
 * @param imageUrls Array of image URLs
 * @returns true if validation passes, false otherwise
 */
export async function validateImageAngles(
  imageUrls: string[]
): Promise<{ valid: boolean; message?: string }> {
  // TODO: Implement actual angle validation using face pose estimation
  // For now, we trust the user to upload correct angles
  // Future: Use MediaPipe or similar to detect face pose angles
  
  if (imageUrls.length !== 9) {
    return {
      valid: false,
      message: 'Tam olarak 9 adet fotoğraf gereklidir.',
    };
  }

  // Placeholder: Always return valid for now
  // In production, would analyze each image to detect face angle
  return { valid: true };
}

