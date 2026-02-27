/**
 * Flap Drawing Validation Types
 * Anatomik doğruluk ve güvenilirlik skorlama sistemi için type tanımları
 */

export interface FaceLandmarks {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  noseTip: { x: number; y: number };
  noseBase: { x: number; y: number };
  leftMouthCorner: { x: number; y: number };
  rightMouthCorner: { x: number; y: number };
  chin: { x: number; y: number };
  leftEarTop: { x: number; y: number } | null;
  rightEarTop: { x: number; y: number } | null;
  leftEarBottom: { x: number; y: number } | null;
  rightEarBottom: { x: number; y: number } | null;
  // Additional landmarks for detailed analysis
  leftEyebrow: { x: number; y: number } | null;
  rightEyebrow: { x: number; y: number } | null;
  foreheadCenter: { x: number; y: number } | null;
}

export interface SymmetryMetrics {
  horizontalTilt: number; // Gözler arası çizginin yatay eksene açısı (derece)
  verticalAlignment: number; // Burun ve çene ucunun dikey hizası (0-100)
  leftRightBalance: number; // Sol-sağ yüz yarısı simetri skoru (0-100)
  overallSymmetry: number; // Genel simetri puanı (0-100)
  issues: string[]; // Tespit edilen simetri sorunları
}

export interface ProportionMetrics {
  faceDivision: {
    forehead: number; // Alın yüksekliği oranı
    nose: number; // Burun yüksekliği oranı
    lowerFace: number; // Alt yüz yüksekliği oranı
    ideal: { forehead: number; nose: number; lowerFace: number }; // İdeal oranlar
  };
  eyeSpacing: {
    actual: number; // Gözler arası mesafe
    ideal: number; // İdeal mesafe (yüz genişliğine göre)
    ratio: number; // Actual/ideal oranı
  };
  noseWidth: {
    actual: number;
    ideal: number;
    ratio: number;
  };
  goldenRatio: {
    score: number; // Altın orana uyum skoru (0-100)
    deviations: Array<{ feature: string; deviation: number }>; // Sapmalar
  };
  overallProportion: number; // Genel oran puanı (0-100)
  issues: string[]; // Tespit edilen oran sorunları
}

export interface FlapPositionMetrics {
  defectCoverage: number; // Defekt kapsama oranı (0-100)
  donorPosition: {
    correct: boolean; // Donör alan doğru yerde mi
    distanceFromDefect: number; // Defekte mesafe (normalize)
    issues: string[];
  };
  flapAlignment: {
    correct: boolean; // Flap doğru hizada mı
    angle: number; // Flap açısı (derece)
    issues: string[];
  };
  criticalStructureOverlap: {
    hasOverlap: boolean; // Kritik yapılarla çakışma var mı
    overlappedStructures: string[]; // Çakışan yapılar
  };
  overallPosition: number; // Genel pozisyon puanı (0-100)
  issues: string[];
}

export interface ValidationResult {
  // Anatomik Tutarlılık Puanı (0-100)
  anatomicalConsistency: {
    score: number; // Genel skor
    symmetry: SymmetryMetrics;
    proportions: ProportionMetrics;
    flapPosition: FlapPositionMetrics;
    breakdown: {
      symmetry: number; // Simetri ağırlıklı skoru
      proportions: number; // Oran ağırlıklı skoru
      flapPosition: number; // Pozisyon ağırlıklı skoru
    };
  };
  
  // AI Çizim Güven Skoru
  aiConfidence: {
    score: number; // 0-100
    level: 'düşük' | 'orta' | 'yüksek';
    factors: Array<{
      name: string;
      score: number;
      weight: number;
    }>;
  };
  
  // Tespit edilen sorunlar
  detectedIssues: Array<{
    severity: 'düşük' | 'orta' | 'yüksek';
    category: 'simetri' | 'oran' | 'pozisyon' | 'genel';
    message: string;
    suggestion?: string; // Düzeltme önerisi
  }>;
  
  // Landmark verileri
  landmarks: FaceLandmarks | null;

  // Klinik dogrulama raporu
  clinicalReport?: ClinicalValidationReport;

  // Validasyon zamanı
  validatedAt: string;
}

export interface ValidationFeedback {
  flapSuggestionId: string;
  userRating: 'yetersiz' | 'orta' | 'iyi' | 'mükemmel';
  userComments?: string;
  specificIssues?: string[]; // Kullanıcının belirttiği sorunlar
  timestamp: string;
}

export interface VectorizationResult {
  svgUrl: string; // Oluşturulan SVG dosyasının URL'i
  originalFormat: 'raster' | 'vector';
  quality: 'düşük' | 'orta' | 'yüksek';
  fileSize: number; // Bytes
  layers: Array<{
    name: string;
    type: 'contour' | 'shading' | 'color';
  }>;
}

export interface AnatomicalOverlay {
  type: 'golden-ratio' | 'muscle-map' | 'bone-map' | 'guide-lines';
  visible: boolean;
  opacity: number; // 0-1
  color: string;
  data: Record<string, unknown>; // Overlay'e özel veri
}

/**
 * Klinik Guvenlik Kontrolu
 * Trafik isigi sistemi ile risk degerlendirmesi
 */
export interface ClinicalSafetyCheck {
  name: string;
  status: 'yeşil' | 'sarı' | 'kırmızı';
  description: string;
  detail: string;
}

/**
 * Simetri Analizi
 * Yuz orta hattina gore flap simetri degerlendirmesi
 */
export interface SymmetryAnalysis {
  midlineDeviation: number;  // 0-100
  flapSymmetry: number;      // 0-100
  description: string;
}

/**
 * Doku Uygunlugu Analizi
 * Donor alan yeterliligi ve defekt kapsama degerlendirmesi
 */
export interface TissueAvailability {
  donorSiteAdequacy: number;  // 0-100
  estimatedDonorArea: number;
  requiredDefectArea: number;
  isAdequate: boolean;
  concerns: string[];
}

/**
 * Klinik Dogrulama Raporu
 * Tum klinik kontrollerin ozet raporu
 */
export interface ClinicalValidationReport {
  safetyChecks: ClinicalSafetyCheck[];
  symmetryAnalysis?: SymmetryAnalysis;
  tissueAvailability?: TissueAvailability;
  overallRisk: 'düşük' | 'orta' | 'yüksek';
  recommendations: string[];
}

