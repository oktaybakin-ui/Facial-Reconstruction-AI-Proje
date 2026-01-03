'use client';

import { detectLandmarks, convertToFaceLandmarks } from './landmarks';
import type { FaceLandmarks } from '@/types/validation';
import type { FlapSuggestion, VisionSummary } from '@/types/ai';
import {
  calculateSymmetry,
  calculateProportions,
  validateFlapPosition,
} from '@/lib/ai/validation-client-helpers';

/**
 * Client-side validation function
 * Detects landmarks and validates flap drawing
 */
export async function validateFlapDrawingClient(
  imageElement: HTMLImageElement | HTMLCanvasElement,
  flapSuggestion: FlapSuggestion,
  visionSummary: VisionSummary
): Promise<import('@/types/validation').ValidationResult> {
  console.log('Starting client-side flap drawing validation...');
  
  // Step 1: Detect landmarks
  const faces = await detectLandmarks(imageElement);
  let landmarks: FaceLandmarks | null = null;
  
  if (faces && faces.length > 0) {
    const imageWidth = imageElement instanceof HTMLImageElement 
      ? imageElement.naturalWidth 
      : imageElement.width;
    const imageHeight = imageElement instanceof HTMLImageElement 
      ? imageElement.naturalHeight 
      : imageElement.height;
    
    landmarks = convertToFaceLandmarks(faces[0], imageWidth, imageHeight);
    console.log('✅ Landmarks detected:', landmarks);
  } else {
    console.warn('⚠️ No faces detected, using placeholder landmarks');
  }
  
  // Step 2: Calculate metrics
  const imageWidth = imageElement instanceof HTMLImageElement 
    ? imageElement.naturalWidth 
    : imageElement.width;
  const imageHeight = imageElement instanceof HTMLImageElement 
    ? imageElement.naturalHeight 
    : imageElement.height;
  
  const symmetry = calculateSymmetry(landmarks, imageWidth, imageHeight);
  const proportions = calculateProportions(landmarks, imageWidth, imageHeight);
  const flapPosition = validateFlapPosition(
    flapSuggestion.flap_drawing,
    visionSummary.defect_location,
    visionSummary.critical_structures
  );
  
  // Step 3: Calculate scores
  const anatomicalConsistency = {
    score: Math.round(
      symmetry.overallSymmetry * 0.3 +
      proportions.overallProportion * 0.3 +
      flapPosition.overallPosition * 0.4
    ),
    symmetry,
    proportions,
    flapPosition,
    breakdown: {
      symmetry: symmetry.overallSymmetry,
      proportions: proportions.overallProportion,
      flapPosition: flapPosition.overallPosition,
    },
  };
  
  const aiConfidenceScore = Math.round(
    anatomicalConsistency.score * 0.7 +
    flapSuggestion.suitability_score * 0.3
  );
  
  const aiConfidence = {
    score: aiConfidenceScore,
    level: aiConfidenceScore >= 80 ? 'yüksek' as const : aiConfidenceScore >= 60 ? 'orta' as const : 'düşük' as const,
    factors: [
      { name: 'Anatomik Tutarlılık', score: anatomicalConsistency.score, weight: 0.7 },
      { name: 'Flep Uygunluk Skoru', score: flapSuggestion.suitability_score, weight: 0.3 },
    ],
  };
  
  // Step 4: Collect issues
  const allIssues = [
    ...symmetry.issues.map(msg => ({ 
      severity: 'orta' as const, 
      category: 'simetri' as const, 
      message: msg 
    })),
    ...proportions.issues.map(msg => ({ 
      severity: 'düşük' as const, 
      category: 'oran' as const, 
      message: msg 
    })),
    ...flapPosition.issues.map(msg => ({ 
      severity: 'yüksek' as const, 
      category: 'pozisyon' as const, 
      message: msg,
      suggestion: 'Flap pozisyonunu gözden geçirin ve gerekirse yeniden çizim isteyin',
    })),
  ];
  
  return {
    anatomicalConsistency,
    aiConfidence,
    detectedIssues: allIssues,
    landmarks,
    validatedAt: new Date().toISOString(),
  };
}

