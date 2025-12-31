export interface VisionSummary {
  detected_region: string;
  estimated_width_mm: number;
  estimated_height_mm: number;
  depth_estimation: string;
  critical_structures: string[];
  aesthetic_zone: boolean;
  defect_location?: {
    center_x: number; // 0-1000 normalized
    center_y: number; // 0-1000 normalized
    width: number; // 0-1000 normalized
    height: number; // 0-1000 normalized
    points?: Array<{ x: number; y: number }>; // Defect polygon points
  };
}

// Note: This type was removed as it was duplicate - use Case type from cases.ts

export type FlapCategory = 'en_uygun' | 'uygun' | 'alternatif';

export type AestheticRisk = 'düşük' | 'orta' | 'yüksek';
export type FunctionalRisk = 'düşük' | 'orta' | 'yüksek';
export type ComplicationRisk = 'düşük' | 'orta' | 'yüksek';
export type DonorSiteMorbidity = 'minimal' | 'moderate' | 'significant';
export type ComplexityLevel = 'basit' | 'orta' | 'kompleks';
export type TechnicalDifficulty = 'başlangıç' | 'orta' | 'ileri' | 'uzman';
export type EvidenceLevel = 'yüksek' | 'orta' | 'düşük';

export interface ComparisonWithAlternatives {
  better_than: string[]; // Bu flep hangi durumlarda alternatiflerden daha iyi
  worse_than: string[]; // Bu flep hangi durumlarda alternatiflerden daha kötü
  similar_to: string[]; // Benzer performans gösteren flepler
}

export interface PostoperativeCare {
  immediate: string[]; // İlk 24 saat bakım önerileri
  early: string[]; // İlk hafta bakım önerileri
  late: string[]; // İlk ay bakım önerileri
  long_term: string[]; // 3+ ay bakım önerileri
}

export interface FollowUpSchedule {
  day_1: string; // İlk gün kontrolü
  day_7: string; // 7. gün kontrolü
  day_14: string; // 14. gün kontrolü
  month_1: string; // 1. ay kontrolü
  month_3: string; // 3. ay kontrolü
}

export interface FlapSuggestion {
  flap_name: string;
  suitability_score: number; // 0-100
  category: FlapCategory;
  why: string;
  advantages: string[];
  cautions: string[];
  alternatives: string[];
  aesthetic_risk: AestheticRisk;
  functional_risk: FunctionalRisk; // Fonksiyonel risk - hareket kısıtlaması, fonksiyon kaybı riski
  complication_risk: ComplicationRisk; // Genel komplikasyon riski
  expected_complications: string[]; // Olası komplikasyonlar
  prevention_strategies: string[]; // Komplikasyon önleme stratejileri
  donor_site_morbidity: DonorSiteMorbidity; // Donor alan morbiditesi
  contraindications: string[]; // Mutlak kontrendikasyonlar
  relative_contraindications: string[]; // Göreceli kontrendikasyonlar
  when_to_avoid: string; // Ne zaman kullanılmamalı
  comparison_with_alternatives: ComparisonWithAlternatives; // Alternatif fleplerle karşılaştırma
  postoperative_care: PostoperativeCare; // Postoperatif bakım planı
  follow_up_schedule: FollowUpSchedule; // Takip programı
  estimated_surgery_time: string; // Tahmini cerrahi süresi
  estimated_cost_range: string; // Tahmini maliyet aralığı
  complexity_level: ComplexityLevel; // Cerrahi kompleksite seviyesi
  technical_difficulty: TechnicalDifficulty; // Teknik zorluk seviyesi
  evidence_level: EvidenceLevel; // Kanıt seviyesi
  success_rate: string; // Başarı oranı
  surgical_technique?: string; // Cerrahi teknik açıklaması (Türkçe)
  video_link?: string; // YouTube uygulama videosu linki (opsiyonel)
  flap_drawing?: {
    defect_area?: {
      points: Array<{ x: number; y: number }>;
      color: string;
      label: string;
    };
    incision_lines: Array<{
      points: Array<{ x: number; y: number }>;
      color: string;
      label: string;
      lineStyle: 'dashed' | 'solid';
      lineWidth?: number;
    }>;
    flap_areas: Array<{
      points: Array<{ x: number; y: number }>;
      color: string;
      label: string;
      fillOpacity?: number;
    }>;
    donor_area?: {
      points: Array<{ x: number; y: number }>;
      color: string;
      label: string;
    };
    arrows?: Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
      color: string;
      label?: string;
    }>;
  };
}

export interface SafetyReview {
  hallucination_risk: 'düşük' | 'orta' | 'yüksek';
  comments: string[];
  legal_disclaimer: string;
}

// 3D Face Model Types
export type Face3DStatus = 'pending' | 'completed' | 'failed';
export type Face3DConfidence = 'düşük' | 'orta' | 'yüksek';

export interface Face3DModel {
  status: Face3DStatus;
  confidence: Face3DConfidence | null;
  model_url: string | null;
  images_3d: string[]; // URLs of the 9 face images used
}

export interface AIResult {
  id: string;
  case_id: string;
  vision_summary: VisionSummary;
  flap_suggestions: FlapSuggestion[];
  safety_review: SafetyReview;
  created_at: string;
  // 3D Face Model fields (optional for backward compatibility)
  enable_3d?: boolean;
  face_3d?: Face3DModel;
}

