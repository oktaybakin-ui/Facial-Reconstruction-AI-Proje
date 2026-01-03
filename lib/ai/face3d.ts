'use server';

import type { Face3DStatus, Face3DConfidence } from '@/types/ai';
import { downloadAndPreprocessImage, detectFaceLandmarks, generateFaceMesh } from './face3d-utils';
import { multiViewReconstructionPython, checkPythonService } from './face3d-python-client';
import { createGLBFromMesh } from './glb-generator';
import { uploadGLBToStorage } from './storage-utils';
import { createServerClient } from '@/lib/supabaseClient';

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
 * Calculates confidence based on reconstruction quality metrics
 */
function calculateConfidence(
  landmarksDetected: number,
  totalImages: number,
  meshQuality: number
): Face3DConfidence {
  // Simple confidence calculation
  const detectionRate = landmarksDetected / totalImages;
  const averageQuality = (detectionRate + meshQuality) / 2;

  if (averageQuality >= 0.8) {
    return 'yüksek';
  } else if (averageQuality >= 0.5) {
    return 'orta';
  } else {
    return 'düşük';
  }
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
    console.log('Starting 3D face reconstruction...');
    console.log(`Processing ${imageUrls.length} images`);

    // Step 1: Download and preprocess images
    console.log('Step 1: Downloading and preprocessing images...');
    const processedImages = await Promise.all(
      imageUrls.map(async (url, index) => {
        try {
          console.log(`Processing image ${index + 1}/${imageUrls.length}...`);
          return await downloadAndPreprocessImage(url);
        } catch (error: any) {
          console.error(`Error processing image ${index + 1}:`, error);
          throw new Error(`Image ${index + 1} işlenemedi: ${error.message}`);
        }
      })
    );

    // Step 2: Multi-view reconstruction using Python service (if available)
    console.log('Step 2: Multi-view face reconstruction...');
    let landmarksDetected = 0;
    const landmarksResults: Array<any> = [];
    let reconstructionQuality = 0.5; // Default quality
    let usePythonService = false;

    // Try to use Python service for multi-view reconstruction
    try {
      const pythonServiceAvailable = await checkPythonService();
      if (pythonServiceAvailable) {
        console.log('Python service available, using multi-view reconstruction...');
        usePythonService = true;
        
        const multiViewResult = await multiViewReconstructionPython(imageUrls);
        if (multiViewResult && multiViewResult.landmarks_list.length > 0) {
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
      } else {
        console.log('Python service not available, using fallback detection...');
      }
    } catch (error: any) {
      console.warn('Python service error, falling back to basic detection:', error.message);
    }

    // Fallback: Detect face landmarks individually if Python service not used
    if (!usePythonService || landmarksResults.length === 0) {
      console.log('Step 2 (fallback): Detecting face landmarks individually...');
      for (let i = 0; i < processedImages.length; i++) {
        try {
          const landmarks = await detectFaceLandmarks(processedImages[i], imageUrls[i]);
          if (landmarks) {
            landmarksDetected++;
            landmarksResults.push(landmarks);
          }
        } catch (error: any) {
          console.warn(`Face detection failed for image ${i + 1}:`, error.message);
          // Continue with other images
        }
      }
    }

    // Step 3: Generate 3D mesh
    console.log('Step 3: Generating 3D mesh...');
    let mesh;
    
    if (landmarksResults.length > 0) {
      // Use detected landmarks to generate mesh
      // If we have multiple views, we can use them for better reconstruction
      mesh = generateFaceMesh(landmarksResults);
    } else {
      // Fallback: Generate a basic face-shaped mesh
      console.log('No landmarks detected, using basic face mesh generation...');
      mesh = generateFaceMesh([]);
    }

    // Step 4: Export to GLB format
    console.log('Step 4: Exporting to GLB format...');
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
    console.log('Step 5: Uploading to storage...');
    const modelUrl = await uploadGLBToStorage(glbBuffer, finalCaseId);

    // Step 7: Calculate confidence
    // Use reconstruction quality from Python service if available, otherwise estimate
    const meshQuality = usePythonService && reconstructionQuality > 0 
      ? reconstructionQuality 
      : (landmarksResults.length > 0 ? 0.7 : 0.4);
    
    const confidence = calculateConfidence(
      landmarksDetected,
      imageUrls.length,
      meshQuality
    );

    console.log('✅ 3D face reconstruction completed successfully');
    console.log(`Model URL: ${modelUrl}`);
    console.log(`Confidence: ${confidence}`);

    return {
      status: 'completed',
      confidence,
      model_url: modelUrl,
    };
  } catch (error: any) {
    console.error('❌ 3D face reconstruction failed:', error);
    return {
      status: 'failed',
      confidence: 'düşük',
      model_url: null,
      error: error.message || '3D model oluşturma sırasında bilinmeyen bir hata oluştu.',
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

