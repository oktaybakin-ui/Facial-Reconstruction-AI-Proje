/**
 * Utility functions for 3D face reconstruction
 */

import sharp from 'sharp';

/**
 * Downloads and preprocesses an image from URL
 */
export async function downloadAndPreprocessImage(imageUrl: string): Promise<Buffer> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Resize and normalize image using sharp
    const processedBuffer = await sharp(buffer)
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();
    
    return processedBuffer;
  } catch (error: any) {
    throw new Error(`Image preprocessing failed: ${error.message}`);
  }
}

/**
 * Face landmarks detection using Python service (MediaPipe)
 * Falls back to null if Python service is unavailable
 */
import { detectFaceLandmarksPython, type FaceLandmarksResponse } from './face3d-python-client';

export interface FaceLandmarks {
  keypoints: Array<{ x: number; y: number; z?: number; name?: string }>;
  confidence: number;
  bounding_box?: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
    width: number;
    height: number;
  };
  pose_angles?: {
    yaw: number;
    pitch: number;
    roll: number;
  };
}

/**
 * Detect face landmarks from image URL using Python service
 * Note: imageBuffer parameter is kept for backward compatibility but not used
 * The Python service needs image URLs, not buffers
 */
export async function detectFaceLandmarks(
  imageBuffer: Buffer,
  imageUrl?: string
): Promise<FaceLandmarks | null> {
  // If imageUrl is provided, use Python service
  if (imageUrl) {
    try {
      const result = await detectFaceLandmarksPython(imageUrl);
      if (result) {
        // Convert Python service response to our format
        return {
          keypoints: result.landmarks.map((lm, idx) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            name: `landmark_${idx}`,
          })),
          confidence: result.confidence,
          bounding_box: result.bounding_box,
          pose_angles: result.pose_angles,
        };
      }
    } catch (error: any) {
      console.warn('Python service face detection failed, using fallback:', error.message);
    }
  }
  
  // Fallback: return null if Python service unavailable or imageUrl not provided
  // This allows the mesh generation to work with a basic structure
  return null;
}

/**
 * Generates a simple 3D mesh from face landmarks
 * This is a placeholder - in production, would use multi-view reconstruction
 */
export function generateFaceMesh(landmarks: FaceLandmarks[]): {
  vertices: Float32Array;
  indices: Uint16Array;
  normals: Float32Array;
} {
  // Placeholder: Generate a simple face-shaped mesh
  // In production, would use multiple views for better accuracy
  
  // Simple face mesh structure (basic approximation)
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  
  // Generate a basic face shape (ellipsoid-like)
  const segments = 32;
  const rings = 16;
  
  for (let ring = 0; ring <= rings; ring++) {
    const theta = (ring / rings) * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    for (let seg = 0; seg <= segments; seg++) {
      const phi = (seg / segments) * 2 * Math.PI;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      
      // Face-shaped ellipsoid (slightly flattened)
      const x = 0.5 * cosPhi * sinTheta;
      const y = 0.5 * cosTheta;
      const z = 0.4 * sinPhi * sinTheta;
      
      vertices.push(x, y, z);
      
      // Normal (pointing outward)
      const length = Math.sqrt(x * x + y * y + z * z);
      if (length > 0) {
        normals.push(x / length, y / length, z / length);
      } else {
        normals.push(0, 1, 0);
      }
    }
  }
  
  // Generate indices for faces
  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const first = ring * (segments + 1) + seg;
      const second = first + segments + 1;
      
      // Two triangles per quad
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }
  
  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
    normals: new Float32Array(normals),
  };
}
