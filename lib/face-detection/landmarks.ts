'use client';

import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

/**
 * Face Landmark Detection Service
 * Uses TensorFlow.js FaceLandmarksDetection model
 * Detects 468 facial landmarks
 */

let model: faceLandmarksDetection.FaceLandmarksDetector | null = null;
let isModelLoading = false;

/**
 * Load the face landmarks detection model
 */
export async function loadLandmarkModel(): Promise<faceLandmarksDetection.FaceLandmarksDetector> {
  if (model) {
    return model;
  }

  if (isModelLoading) {
    // Wait for existing load to complete
    while (isModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (model) return model;
  }

  isModelLoading = true;
  try {
    console.log('Loading face landmarks detection model...');
    model = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: true,
        maxFaces: 1,
      }
    );
    console.log('✅ Face landmarks model loaded');
    return model;
  } catch (error: any) {
    console.error('Failed to load face landmarks model:', error);
    isModelLoading = false;
    throw error;
  } finally {
    isModelLoading = false;
  }
}

/**
 * Detect face landmarks from an image
 */
export async function detectLandmarks(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<faceLandmarksDetection.Face[] | null> {
  try {
    const detector = await loadLandmarkModel();
    const faces = await detector.estimateFaces(imageElement, {
      flipHorizontal: false,
      staticImageMode: true,
    });
    
    if (faces.length === 0) {
      console.warn('No faces detected in image');
      return null;
    }

    return faces;
  } catch (error: any) {
    console.error('Landmark detection failed:', error);
    return null;
  }
}

/**
 * Convert MediaPipe landmarks to our FaceLandmarks format
 */
export function convertToFaceLandmarks(
  face: faceLandmarksDetection.Face,
  imageWidth: number,
  imageHeight: number
): import('@/types/validation').FaceLandmarks {
  // MediaPipe Face Mesh has 468 landmarks
  // Key indices (approximate, may vary):
  // Left eye: 33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
  // Right eye: 362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398
  // Nose tip: 1
  // Nose base: 2
  // Mouth corners: 61, 291
  // Chin: 175
  // Left eyebrow: 107
  // Right eyebrow: 336
  // Forehead: 10

  const keypoints = face.keypoints;
  
  // Helper to get point or null
  const getPoint = (index: number) => {
    const point = keypoints[index];
    if (!point) return null;
    // Normalize to 0-1000 range
    return {
      x: (point.x / imageWidth) * 1000,
      y: (point.y / imageHeight) * 1000,
    };
  };

  // Get key landmarks
  const leftEyeCenter = keypoints[33] || keypoints[7];
  const rightEyeCenter = keypoints[362] || keypoints[382];
  const noseTip = keypoints[1];
  const noseBase = keypoints[2];
  const leftMouthCorner = keypoints[61];
  const rightMouthCorner = keypoints[291];
  const chin = keypoints[175];
  const leftEyebrow = keypoints[107];
  const rightEyebrow = keypoints[336];
  const forehead = keypoints[10];

  // Calculate centers if needed
  const leftEye = leftEyeCenter ? {
    x: (leftEyeCenter.x / imageWidth) * 1000,
    y: (leftEyeCenter.y / imageHeight) * 1000,
  } : { x: 0, y: 0 };

  const rightEye = rightEyeCenter ? {
    x: (rightEyeCenter.x / imageWidth) * 1000,
    y: (rightEyeCenter.y / imageHeight) * 1000,
  } : { x: 0, y: 0 };

  return {
    leftEye,
    rightEye,
    noseTip: noseTip ? {
      x: (noseTip.x / imageWidth) * 1000,
      y: (noseTip.y / imageHeight) * 1000,
    } : { x: 0, y: 0 },
    noseBase: noseBase ? {
      x: (noseBase.x / imageWidth) * 1000,
      y: (noseBase.y / imageHeight) * 1000,
    } : { x: 0, y: 0 },
    leftMouthCorner: leftMouthCorner ? {
      x: (leftMouthCorner.x / imageWidth) * 1000,
      y: (leftMouthCorner.y / imageHeight) * 1000,
    } : { x: 0, y: 0 },
    rightMouthCorner: rightMouthCorner ? {
      x: (rightMouthCorner.x / imageWidth) * 1000,
      y: (rightMouthCorner.y / imageHeight) * 1000,
    } : { x: 0, y: 0 },
    chin: chin ? {
      x: (chin.x / imageWidth) * 1000,
      y: (chin.y / imageHeight) * 1000,
    } : { x: 0, y: 0 },
    leftEarTop: getPoint(234),
    rightEarTop: getPoint(454),
    leftEarBottom: getPoint(234),
    rightEarBottom: getPoint(454),
    leftEyebrow: leftEyebrow ? {
      x: (leftEyebrow.x / imageWidth) * 1000,
      y: (leftEyebrow.y / imageHeight) * 1000,
    } : null,
    rightEyebrow: rightEyebrow ? {
      x: (rightEyebrow.x / imageWidth) * 1000,
      y: (rightEyebrow.y / imageHeight) * 1000,
    } : null,
    foreheadCenter: forehead ? {
      x: (forehead.x / imageWidth) * 1000,
      y: (forehead.y / imageHeight) * 1000,
    } : null,
  };
}

