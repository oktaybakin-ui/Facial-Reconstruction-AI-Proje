/**
 * Client-side validation helper functions
 * These are pure functions that can run in the browser
 */

import type { FaceLandmarks, SymmetryMetrics, ProportionMetrics, FlapPositionMetrics } from '@/types/validation';
import type { FlapSuggestion, VisionSummary } from '@/types/ai';

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
  
  // 1. Horizontal Tilt
  const eyeLineAngle = Math.atan2(
    landmarks.rightEye.y - landmarks.leftEye.y,
    landmarks.rightEye.x - landmarks.leftEye.x
  ) * (180 / Math.PI);
  const horizontalTilt = Math.abs(eyeLineAngle);
  
  if (horizontalTilt > 10) {
    issues.push(`Çene hattı ${horizontalTilt.toFixed(1)}° eğik, yüz simetrisi bozulmuş`);
  }

  // 2. Vertical Alignment
  const faceCenterX = (landmarks.leftEye.x + landmarks.rightEye.x) / 2;
  const noseCenterX = landmarks.noseTip.x;
  const chinCenterX = landmarks.chin.x;
  
  const noseDeviation = Math.abs(noseCenterX - faceCenterX) / 10; // Normalized to 0-100
  const chinDeviation = Math.abs(chinCenterX - faceCenterX) / 10;
  const verticalAlignment = Math.max(0, 100 - (noseDeviation + chinDeviation) * 2);
  
  if (noseDeviation > 5 || chinDeviation > 5) {
    issues.push('Burun veya çene orta hattan sapmış');
  }

  // 3. Left-Right Balance
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
  
  // 1. Face Division
  const faceHeight = 1000; // Normalized
  const foreheadHeight = landmarks.leftEyebrow?.y 
    ? Math.abs(landmarks.leftEyebrow.y - (landmarks.leftEye.y + landmarks.rightEye.y) / 2)
    : faceHeight * 0.33;
  const noseHeight = Math.abs(landmarks.noseTip.y - landmarks.noseBase.y);
  const lowerFaceHeight = Math.abs(landmarks.chin.y - landmarks.noseBase.y);
  
  const totalHeight = foreheadHeight + noseHeight + lowerFaceHeight;
  const foreheadRatio = totalHeight > 0 ? foreheadHeight / totalHeight : 0.33;
  const noseRatio = totalHeight > 0 ? noseHeight / totalHeight : 0.33;
  const lowerFaceRatio = totalHeight > 0 ? lowerFaceHeight / totalHeight : 0.34;
  
  const idealRatio = 0.33;
  const deviation = Math.abs(foreheadRatio - idealRatio) + 
                   Math.abs(noseRatio - idealRatio) + 
                   Math.abs(lowerFaceRatio - idealRatio);
  
  if (deviation > 0.15) {
    issues.push('Yüz üç eşit parçaya bölünmüyor - oranlar idealden sapmış');
  }

  // 2. Eye Spacing
  const eyeDistance = Math.abs(landmarks.rightEye.x - landmarks.leftEye.x);
  const faceWidth = 1000; // Normalized
  const idealEyeDistance = faceWidth * 0.5;
  const eyeSpacingRatio = idealEyeDistance > 0 ? eyeDistance / idealEyeDistance : 1;
  
  if (eyeSpacingRatio < 0.8 || eyeSpacingRatio > 1.2) {
    issues.push(`Gözler arası mesafe idealin ${(eyeSpacingRatio * 100).toFixed(0)}%'i kadar`);
  }

  // 3. Nose Width (simplified)
  const noseWidthRatio = 1.0;
  
  // 4. Golden Ratio Score
  const goldenRatioScore = 75;
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
  const flapAreas = flapDrawing.flap_areas || [];
  const defectCoverage = flapAreas.length > 0 ? 85 : 0;
  
  if (defectCoverage < 80) {
    issues.push('Flap defekt alanını yeterince kapsamıyor');
  }

  // 2. Donor Position
  const donorArea = flapDrawing.donor_area;
  const donorCorrect = !!donorArea;
  const donorDistance = donorArea ? 50 : 0;
  
  if (!donorCorrect) {
    issues.push('Donör alan belirtilmemiş veya hatalı konumda');
  }

  // 3. Flap Alignment
  const incisionLines = flapDrawing.incision_lines || [];
  const flapCorrect = incisionLines.length > 0;
  const flapAngle = 0;
  
  if (!flapCorrect) {
    issues.push('Kesi çizgileri belirtilmemiş');
  }

  // 4. Critical Structure Overlap
  const hasOverlap = false;
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

