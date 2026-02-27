'use server';

import type { FlapSuggestion, VisionSummary, AnatomicalLandmarks } from '@/types/ai';
import type {
  ValidationResult,
  FaceLandmarks,
  SymmetryMetrics,
  ProportionMetrics,
  FlapPositionMetrics,
  ClinicalValidationReport,
  ClinicalSafetyCheck,
  SymmetryAnalysis,
  TissueAvailability,
} from '@/types/validation';
import {
  polygonArea,
  polygonsOverlap,
  polygonCentroid,
  pointDistance,
} from '@/lib/utils/polygon';

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
    
    return null;
  } catch (error: unknown) {
    console.error('Landmark detection failed:', error);
    return null;
  }
}

/**
 * Calculates face symmetry metrics
 */
export async function calculateSymmetry(
  landmarks: FaceLandmarks | null,
  imageWidth: number,
  _imageHeight: number
): Promise<SymmetryMetrics> {
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
  
  const noseDeviation = imageWidth > 0 ? Math.abs(noseCenterX - faceCenterX) / imageWidth * 100 : 0;
  const chinDeviation = imageWidth > 0 ? Math.abs(chinCenterX - faceCenterX) / imageWidth * 100 : 0;
  const verticalAlignment = Math.max(0, 100 - (noseDeviation + chinDeviation) * 2);
  
  if (noseDeviation > 5 || chinDeviation > 5) {
    issues.push('Burun veya çene orta hattan sapmış');
  }

  // 3. Left-Right Balance (Sol-sağ yüz yarısı simetrisi)
  const leftFaceWidth = Math.abs(landmarks.leftEye.x - landmarks.leftMouthCorner.x);
  const rightFaceWidth = Math.abs(landmarks.rightEye.x - landmarks.rightMouthCorner.x);
  const maxFaceWidth = Math.max(leftFaceWidth, rightFaceWidth);
  const widthBalance = maxFaceWidth > 0 ? Math.min(leftFaceWidth, rightFaceWidth) / maxFaceWidth * 100 : 50;
  
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
export async function calculateProportions(
  landmarks: FaceLandmarks | null,
  imageWidth: number,
  imageHeight: number
): Promise<ProportionMetrics> {
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
export async function validateFlapPosition(
  flapDrawing: FlapSuggestion['flap_drawing'],
  defectLocation: VisionSummary['defect_location'],
  _criticalStructures: string[]
): Promise<FlapPositionMetrics> {
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
 * Klinik Dogrulama
 * Flap ciziminin klinik guvenlik kontrollerini yapar:
 * - Kritik yapilara yakinlik (goz, burun, agiz)
 * - Donor-defekt cakisma kontrolu
 * - Flap erisim kontrolu
 * - Simetri analizi
 * - Doku yeterliligi
 */
export async function performClinicalValidation(
  flapDrawing: FlapSuggestion['flap_drawing'],
  defectLocation: VisionSummary['defect_location'],
  landmarks?: AnatomicalLandmarks,
  criticalStructures?: string[]
): Promise<ClinicalValidationReport> {
  const safetyChecks: ClinicalSafetyCheck[] = [];
  const recommendations: string[] = [];
  let symmetryAnalysis: SymmetryAnalysis | undefined;
  let tissueAvailability: TissueAvailability | undefined;

  // --- Defekt poligonunu olustur ---
  const defectPolygon: Array<{ x: number; y: number }> = defectLocation?.points || [];
  if (defectPolygon.length === 0 && defectLocation) {
    const cx = defectLocation.center_x;
    const cy = defectLocation.center_y;
    const hw = defectLocation.width / 2;
    const hh = defectLocation.height / 2;
    defectPolygon.push(
      { x: cx - hw, y: cy - hh },
      { x: cx + hw, y: cy - hh },
      { x: cx + hw, y: cy + hh },
      { x: cx - hw, y: cy + hh }
    );
  }

  // --- Flap poligonlarini topla ---
  const allFlapPoints: Array<{ x: number; y: number }> = [];
  const flapAreas = flapDrawing?.flap_areas || [];
  for (const area of flapAreas) {
    allFlapPoints.push(...area.points);
  }

  // --- Kesi cizgisi noktalarini topla ---
  const allIncisionPoints: Array<{ x: number; y: number }> = [];
  const incisionLines = flapDrawing?.incision_lines || [];
  for (const line of incisionLines) {
    allIncisionPoints.push(...line.points);
  }

  // --- Donor poligonu ---
  const donorPolygon = flapDrawing?.donor_area?.points || [];

  // =========================================================
  // KONTROL 1: Kritik yapilara yakinlik
  // =========================================================
  if (landmarks && allIncisionPoints.length > 0) {
    const criticalZones: Array<{
      name: string;
      position: { x: number; y: number };
      threshold: number;
      label: string;
    }> = [
      {
        name: 'Sol Goz',
        position: landmarks.leftEye,
        threshold: 40,
        label: 'Goz bolgesi',
      },
      {
        name: 'Sag Goz',
        position: landmarks.rightEye,
        threshold: 40,
        label: 'Goz bolgesi',
      },
      {
        name: 'Burun Ucu',
        position: landmarks.noseTip,
        threshold: 30,
        label: 'Burun bolgesi',
      },
      {
        name: 'Burun Tabani',
        position: landmarks.noseBase,
        threshold: 30,
        label: 'Burun bolgesi',
      },
      {
        name: 'Sol Agiz Kosesi',
        position: landmarks.leftMouthCorner,
        threshold: 25,
        label: 'Agiz bolgesi',
      },
      {
        name: 'Sag Agiz Kosesi',
        position: landmarks.rightMouthCorner,
        threshold: 25,
        label: 'Agiz bolgesi',
      },
    ];

    for (const zone of criticalZones) {
      let minDist = Infinity;
      for (const pt of allIncisionPoints) {
        const d = pointDistance(pt, zone.position);
        if (d < minDist) minDist = d;
      }

      let status: ClinicalSafetyCheck['status'];
      let detail: string;

      if (minDist < zone.threshold * 0.5) {
        status = 'kırmızı';
        detail = `Kesi cizgisi ${zone.name} yapisindan ${minDist.toFixed(0)} birim uzaklikta - tehlikeli yakinlikta!`;
        recommendations.push(
          `${zone.name} yapisina cok yakin kesi cizgisi tespit edildi. Kesi hattini yeniden degerlendirin.`
        );
      } else if (minDist < zone.threshold) {
        status = 'sarı';
        detail = `Kesi cizgisi ${zone.name} yapisindan ${minDist.toFixed(0)} birim uzaklikta - dikkatli olunmali.`;
        recommendations.push(
          `${zone.name} yapisina yakin kesi planlandi. Cerrahi sirasinda dikkatli olunmalidir.`
        );
      } else {
        status = 'yeşil';
        detail = `Kesi cizgisi ${zone.name} yapisindan ${minDist.toFixed(0)} birim uzaklikta - guvenli mesafe.`;
      }

      safetyChecks.push({
        name: `Kritik Yapi Yakinligi: ${zone.name}`,
        status,
        description: `${zone.label} icin guvenlik kontrolu`,
        detail,
      });
    }
  } else {
    safetyChecks.push({
      name: 'Kritik Yapi Yakinligi',
      status: 'sarı',
      description: 'Landmark veya kesi cizgisi verisi eksik',
      detail: 'Anatomik referans noktalari veya kesi cizgileri bulunamadi. Kritik yapi yakinlik kontrolu yapilamadi.',
    });
    if (!landmarks) {
      recommendations.push('Anatomik referans noktalari (landmark) tespit edilemedi. Manuel kontrol onerilir.');
    }
  }

  // =========================================================
  // KONTROL 2: Donor-defekt cakisma kontrolu
  // =========================================================
  if (donorPolygon.length >= 3 && defectPolygon.length >= 3) {
    const overlap = polygonsOverlap(donorPolygon, defectPolygon);
    if (overlap) {
      safetyChecks.push({
        name: 'Donor-Defekt Cakisma',
        status: 'kırmızı',
        description: 'Donor alan ve defekt alani cakisma kontrolu',
        detail: 'Donor alan defekt alani ile cakisiyor. Donor alan defekt disinda olmalidir.',
      });
      recommendations.push(
        'Donor alan defekt bolgesinden ayrilmalidir. Farkli bir donor alan secimi veya flap tasarimi dusunulmelidir.'
      );
    } else {
      safetyChecks.push({
        name: 'Donor-Defekt Cakisma',
        status: 'yeşil',
        description: 'Donor alan ve defekt alani cakisma kontrolu',
        detail: 'Donor alan defekt alanindan bagimsiz - uygun konum.',
      });
    }
  } else {
    safetyChecks.push({
      name: 'Donor-Defekt Cakisma',
      status: 'sarı',
      description: 'Donor alan ve defekt alani cakisma kontrolu',
      detail: 'Donor alan veya defekt alan verileri yetersiz. Cakisma kontrolu yapilamadi.',
    });
  }

  // =========================================================
  // KONTROL 3: Flap erisim kontrolu (flap defekte ulasabiliyor mu?)
  // =========================================================
  if (flapAreas.length > 0 && defectPolygon.length >= 3) {
    let flapReachesDefect = false;
    for (const area of flapAreas) {
      if (area.points.length >= 3 && polygonsOverlap(area.points, defectPolygon)) {
        flapReachesDefect = true;
        break;
      }
    }

    if (flapReachesDefect) {
      safetyChecks.push({
        name: 'Flap Erisim Kontrolu',
        status: 'yeşil',
        description: 'Flap alani defekt alanini kapsama kontrolu',
        detail: 'Flap alani defekt bolgesine ulasabiliyor - yeterli kapsama.',
      });
    } else {
      safetyChecks.push({
        name: 'Flap Erisim Kontrolu',
        status: 'kırmızı',
        description: 'Flap alani defekt alanini kapsama kontrolu',
        detail: 'Flap alani defekt bolgesine ulasamiyor. Flap boyutu veya yonu yetersiz olabilir.',
      });
      recommendations.push(
        'Flap alani defekt bolgesini kapsayamiyor. Flap boyutunu artirmayi veya farkli bir flap turu secmeyi degerlendirin.'
      );
    }
  } else {
    safetyChecks.push({
      name: 'Flap Erisim Kontrolu',
      status: 'sarı',
      description: 'Flap alani defekt alanini kapsama kontrolu',
      detail: 'Flap alani veya defekt alan verileri yetersiz. Erisim kontrolu yapilamadi.',
    });
  }

  // =========================================================
  // KONTROL 4: Simetri analizi (yuz orta hattina gore)
  // =========================================================
  if (landmarks && flapAreas.length > 0) {
    const midlineX = (landmarks.facialMidline.topX + landmarks.facialMidline.bottomX) / 2;

    // Flap centroidinin orta hattan sapmasini hesapla
    const flapCentroid = polygonCentroid(allFlapPoints);
    const midlineDev = Math.abs(flapCentroid.x - midlineX);
    // Normalize (0-1000 koordinat sisteminde)
    const midlineDeviation = Math.min(100, (midlineDev / 500) * 100);

    // Defekt centroidi
    const defectCentroid = defectPolygon.length >= 3
      ? polygonCentroid(defectPolygon)
      : { x: defectLocation?.center_x || 500, y: defectLocation?.center_y || 500 };

    // Flap simetrisini defekt merkezine gore karsilastir
    const flapDistFromMidline = Math.abs(flapCentroid.x - midlineX);
    const defectDistFromMidline = Math.abs(defectCentroid.x - midlineX);
    const symmetryDiff = Math.abs(flapDistFromMidline - defectDistFromMidline);
    const flapSymmetry = Math.max(0, Math.min(100, 100 - (symmetryDiff / 500) * 100));

    let description: string;
    if (flapSymmetry >= 80) {
      description = 'Flap yerlesimi yuz orta hattina gore simetrik ve uyumlu.';
    } else if (flapSymmetry >= 50) {
      description = 'Flap yerlesimi orta hattan belirgin sapma gosteriyor. Estetik sonuc dikkatle degerlendirilmeli.';
    } else {
      description = 'Flap yerlesimi asimetrik. Simetri iyilestirmesi icin flap pozisyonu gozden gecirilmeli.';
    }

    symmetryAnalysis = {
      midlineDeviation: Math.round(midlineDeviation),
      flapSymmetry: Math.round(flapSymmetry),
      description,
    };

    if (flapSymmetry < 50) {
      safetyChecks.push({
        name: 'Simetri Kontrolu',
        status: 'kırmızı',
        description: 'Yuz orta hattina gore flap simetri degerlendirmesi',
        detail: description,
      });
      recommendations.push('Flap pozisyonu asimetrik. Yuz orta hattina gore simetri saglayacak sekilde yeniden planlayin.');
    } else if (flapSymmetry < 80) {
      safetyChecks.push({
        name: 'Simetri Kontrolu',
        status: 'sarı',
        description: 'Yuz orta hattina gore flap simetri degerlendirmesi',
        detail: description,
      });
    } else {
      safetyChecks.push({
        name: 'Simetri Kontrolu',
        status: 'yeşil',
        description: 'Yuz orta hattina gore flap simetri degerlendirmesi',
        detail: description,
      });
    }
  }

  // =========================================================
  // KONTROL 5: Doku yeterliligi (donor alan vs defekt alan)
  // =========================================================
  if (donorPolygon.length >= 3 && defectPolygon.length >= 3) {
    const estimatedDonorArea = polygonArea(donorPolygon);
    const requiredDefectArea = polygonArea(defectPolygon);
    const concerns: string[] = [];

    // Donor alan en az defekt alaninin %100'u olmali, ideal olarak %110-120
    const adequacyRatio = requiredDefectArea > 0 ? estimatedDonorArea / requiredDefectArea : 0;
    const donorSiteAdequacy = Math.min(100, Math.round(adequacyRatio * 100));
    const isAdequate = adequacyRatio >= 1.0;

    if (adequacyRatio < 0.8) {
      concerns.push('Donor alan defekt alaninin %80\'inden kucuk. Ciddi yetersizlik.');
      recommendations.push('Donor alan yetersiz. Daha buyuk bir donor alan veya ek doku transferi dusunulmelidir.');
    } else if (adequacyRatio < 1.0) {
      concerns.push('Donor alan defekt alanindan biraz kucuk. Gerginlik riski mevcut.');
      recommendations.push('Donor alan sinirda yeterli. Kapama sirasinda gerginlik olabilir.');
    } else if (adequacyRatio < 1.1) {
      concerns.push('Donor alan yeterli ancak guvenlik marjini dusuk.');
    }

    if (adequacyRatio > 2.0) {
      concerns.push('Donor alan defekt alaninin 2 katindan buyuk. Gereksiz doku hasari olabilir.');
      recommendations.push('Donor alan normalden buyuk. Donor morbiditesini azaltmak icin donor alani kucultmeyi degerlendirin.');
    }

    tissueAvailability = {
      donorSiteAdequacy,
      estimatedDonorArea: Math.round(estimatedDonorArea),
      requiredDefectArea: Math.round(requiredDefectArea),
      isAdequate,
      concerns,
    };

    let tissueStatus: ClinicalSafetyCheck['status'];
    if (isAdequate && concerns.length === 0) {
      tissueStatus = 'yeşil';
    } else if (isAdequate) {
      tissueStatus = 'sarı';
    } else {
      tissueStatus = 'kırmızı';
    }

    safetyChecks.push({
      name: 'Doku Yeterliligi',
      status: tissueStatus,
      description: 'Donor alan buyuklugu ve defekt kapsama yeterliligi',
      detail: `Donor alan: ${Math.round(estimatedDonorArea)} birim kare, Defekt alan: ${Math.round(requiredDefectArea)} birim kare (oran: %${donorSiteAdequacy})`,
    });
  } else {
    safetyChecks.push({
      name: 'Doku Yeterliligi',
      status: 'sarı',
      description: 'Donor alan buyuklugu ve defekt kapsama yeterliligi',
      detail: 'Donor alan veya defekt alan verileri yetersiz. Doku yeterliligi hesaplanamadi.',
    });
  }

  // =========================================================
  // KONTROL 6: Kullanici belirttiği kritik yapilar (opsiyonel)
  // =========================================================
  if (criticalStructures && criticalStructures.length > 0 && landmarks) {
    // Kritik yapilari landmark isimlerine eslestir
    const structureMap: Record<string, { x: number; y: number } | undefined> = {
      'göz': landmarks.leftEye, // Genel goz referansi
      'sol göz': landmarks.leftEye,
      'sağ göz': landmarks.rightEye,
      'burun': landmarks.noseTip,
      'ağız': landmarks.leftMouthCorner,
      'çene': landmarks.chin,
    };

    for (const structure of criticalStructures) {
      const normalizedName = structure.toLowerCase().trim();
      let matchedPosition: { x: number; y: number } | undefined;

      for (const [key, pos] of Object.entries(structureMap)) {
        if (normalizedName.includes(key) && pos) {
          matchedPosition = pos;
          break;
        }
      }

      if (matchedPosition && allIncisionPoints.length > 0) {
        let minDist = Infinity;
        for (const pt of allIncisionPoints) {
          const d = pointDistance(pt, matchedPosition);
          if (d < minDist) minDist = d;
        }

        if (minDist < 30) {
          safetyChecks.push({
            name: `Kritik Yapi: ${structure}`,
            status: 'kırmızı',
            description: `Kullanici belirttigi kritik yapi kontrolu`,
            detail: `Kesi cizgisi "${structure}" yapisindan ${minDist.toFixed(0)} birim uzaklikta - tehlikeli!`,
          });
          recommendations.push(`"${structure}" yapisina cok yakin kesi tespit edildi. Plan gozden gecirilmeli.`);
        }
      }
    }
  }

  // =========================================================
  // Genel risk degerlendirmesi
  // =========================================================
  const redCount = safetyChecks.filter(c => c.status === 'kırmızı').length;
  const yellowCount = safetyChecks.filter(c => c.status === 'sarı').length;

  let overallRisk: ClinicalValidationReport['overallRisk'];
  if (redCount > 0) {
    overallRisk = 'yüksek';
    if (recommendations.length === 0) {
      recommendations.push('Yuksek riskli uyarilar tespit edildi. Cerrahi plan detayli olarak gozden gecirilmelidir.');
    }
  } else if (yellowCount >= 3) {
    overallRisk = 'orta';
    if (recommendations.length === 0) {
      recommendations.push('Birden fazla dikkat gerektiren bulgu mevcut. Cerrahi plan dogrulanmalidir.');
    }
  } else {
    overallRisk = 'düşük';
    if (recommendations.length === 0) {
      recommendations.push('Klinik dogrulama kontrolleri basariyla tamamlandi. Onemli bir risk tespit edilmedi.');
    }
  }

  return {
    safetyChecks,
    symmetryAnalysis,
    tissueAvailability,
    overallRisk,
    recommendations,
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
  // Step 1: Detect landmarks
  const landmarks = await detectFaceLandmarks(imageUrl);
  
  // Step 2: Calculate symmetry
  const symmetry = await calculateSymmetry(landmarks, imageWidth, imageHeight);

  // Step 3: Calculate proportions
  const proportions = await calculateProportions(landmarks, imageWidth, imageHeight);

  // Step 4: Validate flap position
  const flapPosition = await validateFlapPosition(
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
    level: (aiConfidenceScore >= 80 ? 'yüksek' : aiConfidenceScore >= 60 ? 'orta' : 'düşük') as 'düşük' | 'orta' | 'yüksek',
    factors: [
      { name: 'Anatomik Tutarlılık', score: anatomicalConsistency.score, weight: 0.7 },
      { name: 'Flep Uygunluk Skoru', score: flapSuggestion.suitability_score, weight: 0.3 },
    ],
  };
  
  // Step 7: Perform clinical validation
  const clinicalReport = await performClinicalValidation(
    flapSuggestion.flap_drawing,
    visionSummary.defect_location,
    visionSummary.anatomical_landmarks,
    visionSummary.critical_structures
  );

  // Step 8: Collect all issues
  const allIssues: Array<{
    severity: 'düşük' | 'orta' | 'yüksek';
    category: 'simetri' | 'oran' | 'pozisyon' | 'genel';
    message: string;
    suggestion?: string;
  }> = [
    ...symmetry.issues.map(msg => ({ severity: 'orta' as const, category: 'simetri' as const, message: msg })),
    ...proportions.issues.map(msg => ({ severity: 'düşük' as const, category: 'oran' as const, message: msg })),
    ...flapPosition.issues.map(msg => ({
      severity: 'yüksek' as const,
      category: 'pozisyon' as const,
      message: msg,
      suggestion: 'Flap pozisyonunu gözden geçirin ve gerekirse yeniden çizim isteyin',
    })),
  ];

  // Klinik rapordan yuksek riskli bulgulari da sorunlara ekle
  for (const check of clinicalReport.safetyChecks) {
    if (check.status === 'kırmızı') {
      allIssues.push({
        severity: 'yüksek' as const,
        category: 'genel' as const,
        message: `${check.name}: ${check.detail}`,
        suggestion: clinicalReport.recommendations[0] || 'Cerrahi plani gozden gecirin',
      });
    }
  }

  return {
    anatomicalConsistency,
    aiConfidence,
    detectedIssues: allIssues,
    landmarks,
    clinicalReport,
    validatedAt: new Date().toISOString(),
  };
}

