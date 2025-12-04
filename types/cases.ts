export type Sex = 'M' | 'F' | 'Other';

export type DepthCategory = 'skin' | 'skin+subcutis' | 'muscle' | 'mucosa';

export type CaseStatus = 'planned' | 'operated' | 'postop_follow' | 'completed';

export type PhotoType = 'preop' | 'postop';

export type Specialty = 
  | 'Plastik Cerrahi' 
  | 'KBB' 
  | 'Dermatoloji' 
  | 'CMF' 
  | 'Diğer';

export interface Case {
  id: string;
  user_id: string;
  case_code: string;
  age?: number;
  sex?: Sex;
  region: string;
  width_mm?: number;
  height_mm?: number;
  depth?: DepthCategory;
  previous_surgery?: boolean;
  previous_radiotherapy?: boolean;
  pathology_suspected?: string;
  critical_structures?: string[];
  high_aesthetic_zone?: boolean;
  case_date?: string; // Vaka tarihi (YYYY-MM-DD)
  case_time?: string; // Vaka saati (HH:MM)
  case_duration_minutes?: number; // Vaka süresi (dakika)
  patient_special_condition?: string; // Hastanın özel durumu
  operation_date?: string; // Operasyon tarihi (YYYY-MM-DD)
  followup_days?: number; // Kontrol süresi (operasyondan kaç gün sonra, varsayılan 21)
  pathology_result_available?: boolean; // Patoloji sonucu çıktı mı?
  pathology_result_date?: string; // Patoloji sonuç tarihi (YYYY-MM-DD)
  pathology_result?: string; // Patoloji sonucu (detay)
  status: CaseStatus;
  created_at: string;
  updated_at: string;
}

export interface CasePhoto {
  id: string;
  case_id: string;
  type: PhotoType;
  url: string;
  created_at: string;
}

export interface CreateCaseInput {
  case_code: string;
  age?: number;
  sex?: Sex;
  region: string;
  width_mm?: number;
  height_mm?: number;
  depth?: DepthCategory;
  previous_surgery?: boolean;
  previous_radiotherapy?: boolean;
  pathology_suspected?: string;
  critical_structures?: string[];
  high_aesthetic_zone?: boolean;
  case_date?: string; // Vaka tarihi (YYYY-MM-DD)
  case_time?: string; // Vaka saati (HH:MM)
  case_duration_minutes?: number; // Vaka süresi (dakika)
  patient_special_condition?: string; // Hastanın özel durumu
  operation_date?: string; // Operasyon tarihi (YYYY-MM-DD)
  followup_days?: number; // Kontrol süresi (operasyondan kaç gün sonra, varsayılan 21)
  pathology_result_available?: boolean; // Patoloji sonucu çıktı mı?
  pathology_result_date?: string; // Patoloji sonuç tarihi (YYYY-MM-DD)
  pathology_result?: string; // Patoloji sonucu (detay)
  preop_photo_url?: string;
}

