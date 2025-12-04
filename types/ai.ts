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

export interface FlapSuggestion {
  flap_name: string;
  suitability_score: number; // 0-100
  category: FlapCategory;
  why: string;
  advantages: string[];
  cautions: string[];
  alternatives: string[];
  aesthetic_risk: AestheticRisk;
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

export interface AIResult {
  id: string;
  case_id: string;
  vision_summary: VisionSummary;
  flap_suggestions: FlapSuggestion[];
  safety_review: SafetyReview;
  created_at: string;
}

