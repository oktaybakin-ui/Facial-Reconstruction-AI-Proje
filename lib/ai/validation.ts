'use server';

import type { FlapSuggestion, VisionSummary } from '@/types/ai';
import type { 
  ValidationResult, 
  FaceLandmarks, 
  SymmetryMetrics, 
  ProportionMetrics, 
  FlapPositionMetrics 
} from '@/types/validation';

// Note: Landmark detection is now client-side only
// This function is kept for server-side compatibility but will return null
// Use the client-side detectLandmarks from lib/face-detection/landmarks.ts instead

/**
 * Flap Drawing Validation Service
 * 
 * Anatomik doğruluk ve güvenilirlik skorlama sistemi
 * - Yüz simetri analizi
 * - Oran kontrolü (altın oran, antropometrik)
 * - Flap pozisyon doğrulaması
 * - Landmark tespiti
 */

/**
 * Detects face landmarks from an image
 * TODO: Integrate with MediaPipe or TensorFlow.js FaceLandmarksDetection
 * Currently returns placeholder landmarks
 */
export async function detectFaceLandmarks(
  imageUrl: string
): Promise<FaceLandmarks | null> {
  try {
    // TODO: Implement actual landmark detection
    // Option 1: MediaPipe Face Mesh (468 points)
    // Option 2: TensorFlow.js FaceLandmarksDetection
    // Option 3: OpenCV Haar Cascade + Dlib
    
    // Placeholder: Return null for now
    // In production, this would:
    // 1. Load image from URL
    // 2. Run landmark detection model
    // 3. Extract key points (eyes, nose, mouth, chin, etc.)
    // 4. Return normalized coordinates (0-1000)
    
    console.log('Landmark detection called for:', imageUrl);
    return null;
  } catch (error: any) {
    console.error('Landmark detection failed:', error);
    return null;
  }
}

/**
 * Calculates face symmetry metrics
 */
export function calculateSymmetry(
  landmarks: FaceLandmarks | null,
  imageWidth: number,
  imageHeight: number
): SymmetryMetrics {
  if (!landmarks) {
    return {
      horizontalTilt: 0,
      verticalAlignment: 50,
      leftRightBalance: 50,
      overallSymmetry: 50,
      issues: ['Landmark tespiti yapılamadı'],
    };
  }

  const issues: string[] = [];
  
  // 1. Horizontal Tilt (Gözler arası çizginin yatay eksene açısı)
  const eyeLineAngle = Math.atan2(
    landmarks.rightEye.y - landmarks.leftEye.y,
    landmarks.rightEye.x - landmarks.leftEye.x
  ) * (180 / Math.PI);
  const horizontalTilt = Math.abs(eyeLineAngle);
  
  if (horizontalTilt > 10) {
    issues.push(`Çene hattı ${horizontalTilt.toFixed(1)}° eğik, yüz simetrisi bozulmuş`);
  }

  // 2. Vertical Alignment (Burun ve çene ucunun dikey hizası)
  const faceCenterX = (landmarks.leftEye.x + landmarks.rightEye.x) / 2;
  const noseCenterX = landmarks.noseTip.x;
  const chinCenterX = landmarks.chin.x;
  
  const noseDeviation = Math.abs(noseCenterX - faceCenterX) / imageWidth * 100;
  const chinDeviation = Math.abs(chinCenterX - faceCenterX) / imageWidth * 100;
  const verticalAlignment = Math.max(0, 100 - (noseDeviation + chinDeviation) * 2);
  
  if (noseDeviation > 5 || chinDeviation > 5) {
    issues.push('Burun veya çene orta hattan sapmış');
  }

  // 3. Left-Right Balance (Sol-sağ yüz yarısı simetrisi)
  const leftFaceWidth = Math.abs(landmarks.leftEye.x - landmarks.leftMouthCorner.x);
  const rightFaceWidth = Math.abs(landmarks.rightEye.x - landmarks.rightMouthCorner.x);
  const widthBalance = Math.min(leftFaceWidth, rightFaceWidth) / Math.max(leftFaceWidth, rightFaceWidth) * 100;
  
  const leftRightBalance = widthBalance;
  
  if (widthBalance < 85) {
    issues.push('Yüzün sol ve sağ yarısı arasında belirgin asimetri var');
  }

  // 4. Overall Symmetry Score
  const overallSymmetry = (
    (100 - Math.min(horizontalTilt * 2, 100)) * 0.3 +
    verticalAlignment * 0.3 +
    leftRightBalance * 0.4
  );

  return {
    horizontalTilt,
    verticalAlignment,
    leftRightBalance,
    overallSymmetry: Math.round(overallSymmetry),
    issues,
  };
}

/**
 * Calculates face proportion metrics
 */
export function calculateProportions(
  landmarks: FaceLandmarks | null,
  imageWidth: number,
  imageHeight: number
): ProportionMetrics {
  if (!landmarks) {
    return {
      faceDivision: {
        forehead: 0.33,
        nose: 0.33,
        lowerFace: 0.34,
        ideal: { forehead: 0.33, nose: 0.33, lowerFace: 0.34 },
      },
      eyeSpacing: { actual: 0, ideal: 0, ratio: 1 },
      noseWidth: { actual: 0, ideal: 0, ratio: 1 },
      goldenRatio: { score: 50, deviations: [] },
      overallProportion: 50,
      issues: ['Landmark tespiti yapılamadı'],
    };
  }

  const issues: string[] = [];
  
  // 1. Face Division (Üç eşit parça: alın, burun, alt yüz)
  const faceHeight = imageHeight;
  const foreheadHeight = landmarks.leftEyebrow?.y 
    ? Math.abs(landmarks.leftEyebrow.y - (landmarks.leftEye.y + landmarks.rightEye.y) / 2)
    : faceHeight * 0.33;
  const noseHeight = Math.abs(landmarks.noseTip.y - landmarks.noseBase.y);
  const lowerFaceHeight = Math.abs(landmarks.chin.y - landmarks.noseBase.y);
  
  const totalHeight = foreheadHeight + noseHeight + lowerFaceHeight;
  const foreheadRatio = foreheadHeight / totalHeight;
  const noseRatio = noseHeight / totalHeight;
  const lowerFaceRatio = lowerFaceHeight / totalHeight;
  
  const idealRatio = 0.33;
  const deviation = Math.abs(foreheadRatio - idealRatio) + 
                   Math.abs(noseRatio - idealRatio) + 
                   Math.abs(lowerFaceRatio - idealRatio);
  
  if (deviation > 0.15) {
    issues.push('Yüz üç eşit parçaya bölünmüyor - oranlar idealden sapmış');
  }

  // 2. Eye Spacing
  const eyeDistance = Math.abs(landmarks.rightEye.x - landmarks.leftEye.x);
  const faceWidth = imageWidth;
  const idealEyeDistance = faceWidth * 0.5; // İdeal: yüz genişliğinin %50'si
  const eyeSpacingRatio = eyeDistance / idealEyeDistance;
  
  if (eyeSpacingRatio < 0.8 || eyeSpacingRatio > 1.2) {
    issues.push(`Gözler arası mesafe idealin ${(eyeSpacingRatio * 100).toFixed(0)}%'i kadar`);
  }

  // 3. Nose Width (simplified - would need nose landmarks)
  const noseWidthRatio = 1.0; // Placeholder
  
  // 4. Golden Ratio Score
  // Marquardt mask comparison would go here
  const goldenRatioScore = 75; // Placeholder
  const goldenRatioDeviations: Array<{ feature: string; deviation: number }> = [];
  
  // 5. Overall Proportion Score
  const faceDivisionScore = Math.max(0, 100 - deviation * 200);
  const eyeSpacingScore = Math.max(0, 100 - Math.abs(eyeSpacingRatio - 1) * 100);
  const overallProportion = (faceDivisionScore * 0.5 + eyeSpacingScore * 0.3 + goldenRatioScore * 0.2);

  return {
    faceDivision: {
      forehead: foreheadRatio,
      nose: noseRatio,
      lowerFace: lowerFaceRatio,
      ideal: { forehead: idealRatio, nose: idealRatio, lowerFace: idealRatio },
    },
    eyeSpacing: {
      actual: eyeDistance,
      ideal: idealEyeDistance,
      ratio: eyeSpacingRatio,
    },
    noseWidth: {
      actual: 0,
      ideal: 0,
      ratio: noseWidthRatio,
    },
    goldenRatio: {
      score: goldenRatioScore,
      deviations: goldenRatioDeviations,
    },
    overallProportion: Math.round(overallProportion),
    issues,
  };
}

/**
 * Validates flap position and coverage
 */
export function validateFlapPosition(
  flapDrawing: FlapSuggestion['flap_drawing'],
  defectLocation: VisionSummary['defect_location'],
  criticalStructures: string[]
): FlapPositionMetrics {
  if (!flapDrawing || !defectLocation) {
    return {
      defectCoverage: 0,
      donorPosition: { correct: false, distanceFromDefect: 0, issues: ['Veri eksik'] },
      flapAlignment: { correct: false, angle: 0, issues: ['Veri eksik'] },
      criticalStructureOverlap: { hasOverlap: false, overlappedStructures: [] },
      overallPosition: 0,
      issues: ['Flap çizimi veya defekt konumu bulunamadı'],
    };
  }

  const issues: string[] = [];
  
  // 1. Defect Coverage
  const defectArea = defectLocation.points || [
    { x: defectLocation.center_x - defectLocation.width / 2, y: defectLocation.center_y - defectLocation.height / 2 },
    { x: defectLocation.center_x + defectLocation.width / 2, y: defectLocation.center_y - defectLocation.height / 2 },
    { x: defectLocation.center_x + defectLocation.width / 2, y: defectLocation.center_y + defectLocation.height / 2 },
    { x: defectLocation.center_x - defectLocation.width / 2, y: defectLocation.center_y + defectLocation.height / 2 },
  ];
  
  const flapAreas = flapDrawing.flap_areas || [];
  // Simplified: Check if flap areas overlap with defect
  // In production, would use polygon intersection algorithms
  const defectCoverage = flapAreas.length > 0 ? 85 : 0; // Placeholder
  
  if (defectCoverage < 80) {
    issues.push('Flap defekt alanını yeterince kapsamıyor');
  }

  // 2. Donor Position
  const donorArea = flapDrawing.donor_area;
  const donorCorrect = !!donorArea;
  const donorDistance = donorArea ? 50 : 0; // Placeholder
  
  if (!donorCorrect) {
    issues.push('Donör alan belirtilmemiş veya hatalı konumda');
  }

  // 3. Flap Alignment
  const incisionLines = flapDrawing.incision_lines || [];
  const flapCorrect = incisionLines.length > 0;
  const flapAngle = 0; // Placeholder - would calculate from incision lines
  
  if (!flapCorrect) {
    issues.push('Kesi çizgileri belirtilmemiş');
  }

  // 4. Critical Structure Overlap
  // Check if flap overlaps with critical structures
  const hasOverlap = false; // Placeholder - would check against critical structure locations
  const overlappedStructures: string[] = [];
  
  if (hasOverlap) {
    issues.push(`Flap kritik yapılarla çakışıyor: ${overlappedStructures.join(', ')}`);
  }

  // 5. Overall Position Score
  const overallPosition = (
    defectCoverage * 0.5 +
    (donorCorrect ? 25 : 0) +
    (flapCorrect ? 15 : 0) +
    (hasOverlap ? 0 : 10)
  );

  return {
    defectCoverage,
    donorPosition: {
      correct: donorCorrect,
      distanceFromDefect: donorDistance,
      issues: !donorCorrect ? ['Donör alan belirtilmemiş'] : [],
    },
    flapAlignment: {
      correct: flapCorrect,
      angle: flapAngle,
      issues: !flapCorrect ? ['Kesi çizgileri belirtilmemiş'] : [],
    },
    criticalStructureOverlap: {
      hasOverlap,
      overlappedStructures,
    },
    overallPosition: Math.round(overallPosition),
    issues,
  };
}

/**
 * Main validation function
 * Validates a flap drawing for anatomical accuracy
 */
export async function validateFlapDrawing(
  imageUrl: string,
  flapSuggestion: FlapSuggestion,
  visionSummary: VisionSummary,
  imageWidth: number = 1000,
  imageHeight: number = 1000
): Promise<ValidationResult> {
  console.log('Starting flap drawing validation...');
  
  // Step 1: Detect landmarks
  const landmarks = await detectFaceLandmarks(imageUrl);
  
  // Step 2: Calculate symmetry
  const symmetry = calculateSymmetry(landmarks, imageWidth, imageHeight);
  
  // Step 3: Calculate proportions
  const proportions = calculateProportions(landmarks, imageWidth, imageHeight);
  
  // Step 4: Validate flap position
  const flapPosition = validateFlapPosition(
    flapSuggestion.flap_drawing,
    visionSummary.defect_location,
    visionSummary.critical_structures
  );
  
  // Step 5: Calculate overall anatomical consistency score
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
  
  // Step 6: Calculate AI confidence score
  // Based on validation metrics and flap suggestion quality
  const aiConfidenceScore = Math.round(
    anatomicalConsistency.score * 0.7 +
    flapSuggestion.suitability_score * 0.3
  );
  
  const aiConfidence = {
    score: aiConfidenceScore,
    level: aiConfidenceScore >= 80 ? 'yüksek' : aiConfidenceScore >= 60 ? 'orta' : 'düşük',
    factors: [
      { name: 'Anatomik Tutarlılık', score: anatomicalConsistency.score, weight: 0.7 },
      { name: 'Flep Uygunluk Skoru', score: flapSuggestion.suitability_score, weight: 0.3 },
    ],
  };
  
  // Step 7: Collect all issues
  const allIssues = [
    ...symmetry.issues.map(msg => ({ severity: 'orta' as const, category: 'simetri' as const, message: msg })),
    ...proportions.issues.map(msg => ({ severity: 'düşük' as const, category: 'oran' as const, message: msg })),
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

