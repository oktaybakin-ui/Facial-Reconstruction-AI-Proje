export interface MedicalSource {
  id: string;
  user_id: string;
  title: string;
  content: string;
  source_type: 'text' | 'pdf' | 'article' | 'book' | 'guideline' | 'research';
  source_url?: string;
  keywords?: string[];
  region_focus?: string[];
  flap_types?: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface MedicalSourceSearchParams {
  keywords?: string[];
  region?: string;
  flap_type?: string;
  limit?: number;
}

export interface MedicalSourceInput {
  title: string;
  content: string;
  source_type: 'text' | 'pdf' | 'article' | 'book' | 'guideline' | 'research';
  source_url?: string;
  keywords?: string[];
  region_focus?: string[];
  flap_types?: string[];
}

