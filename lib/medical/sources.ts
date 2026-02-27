import { createServerClient } from '@/lib/supabaseClient';
import type { MedicalSource, MedicalSourceInput, MedicalSourceSearchParams } from '@/types/medical';

/**
 * Scored medical source with multi-factor relevance scoring
 */
export interface ScoredMedicalSource {
  id: string;
  title: string;
  content: string;
  source_type: string;
  source_url?: string;
  keywords?: string[];
  region_focus?: string[];
  flap_types?: string[];
  relevanceScore: number;
  scoreBreakdown: {
    regionMatch: number;
    flapTypeMatch: number;
    keywordOverlap: number;
    sourceTypePriority: number;
    contentRelevance: number;
  };
}

/**
 * Region to expected flap type mapping for intelligent scoring
 */
const REGION_FLAP_MAP: Record<string, string[]> = {
  'burun': ['bilobed', 'nasolabial', 'paramedian forehead', 'dorsal nasal'],
  'alın': ['advancement', 'rotasyon', 'a-t'],
  'yanak': ['advancement', 'rotasyon', 'cervicofacial'],
  'göz kapağı': ['advancement', 'semicircular', 'tenzel'],
  'dudak': ['advancement', 'abbe', 'karapandzic'],
  'kulak': ['postauricular', 'preauricular'],
  'şakak': ['rotasyon', 'advancement'],
  'boyun': ['cervicoplasty', 'advancement'],
  'burun kanadı': ['bilobed', 'nasolabial', 'melolabial'],
  'çene': ['submental', 'advancement'],
};

/**
 * Source type priority scores
 */
const SOURCE_TYPE_PRIORITY: Record<string, number> = {
  'guideline': 100,
  'research': 85,
  'book': 75,
  'article': 65,
  'text': 50,
  'pdf': 50,
};

/**
 * Score a single medical source against case parameters using multi-factor scoring.
 *
 * Weights:
 *   - Region match: 0.35
 *   - Flap type match: 0.25
 *   - Keyword overlap: 0.20
 *   - Source type priority: 0.10
 *   - Content relevance: 0.10
 */
function scoreMedicalSource(
  source: MedicalSource,
  region: string,
  keywords?: string[],
  criticalStructures?: string[],
  caseDescription?: string
): ScoredMedicalSource {
  // --- Region match (weight 0.35) ---
  let regionMatch = 0;
  const sourceRegions = (source.region_focus || []).map(r => r.toLowerCase());
  const normalizedRegion = region.toLowerCase();

  if (sourceRegions.includes(normalizedRegion)) {
    regionMatch = 100;
  } else {
    // Partial match: check if region is a substring of any source region or vice versa
    const hasPartial = sourceRegions.some(
      sr => sr.includes(normalizedRegion) || normalizedRegion.includes(sr)
    );
    if (hasPartial) {
      regionMatch = 60;
    }
  }

  // --- Flap type match (weight 0.25) ---
  let flapTypeMatch = 0;
  const sourceFlapTypes = (source.flap_types || []).map(f => f.toLowerCase());

  // Get expected flap types for this region from the mapping
  const expectedFlaps = REGION_FLAP_MAP[normalizedRegion] || [];

  if (sourceFlapTypes.length > 0 && expectedFlaps.length > 0) {
    const matchCount = sourceFlapTypes.filter(sf =>
      expectedFlaps.some(ef => sf.includes(ef) || ef.includes(sf))
    ).length;

    if (matchCount > 0) {
      // Scale: at least one match = 60, more matches = higher score up to 100
      flapTypeMatch = Math.min(100, 60 + (matchCount - 1) * 20);
    }
  } else if (sourceFlapTypes.length > 0) {
    // Source has flap types but no mapping for this region; give a small base score
    flapTypeMatch = 20;
  }

  // --- Keyword overlap (weight 0.20) ---
  let keywordOverlap = 0;
  const sourceKeywords = (source.keywords || []).map(k => k.toLowerCase());

  // Combine caller-provided keywords and critical structures
  const caseTerms: string[] = [
    ...(keywords || []).map(k => k.toLowerCase()),
    ...(criticalStructures || []).map(cs => cs.toLowerCase()),
  ];

  if (sourceKeywords.length > 0 && caseTerms.length > 0) {
    const matchCount = caseTerms.filter(ct =>
      sourceKeywords.some(sk => sk.includes(ct) || ct.includes(sk))
    ).length;

    if (matchCount > 0) {
      // Normalize: proportion of case terms matched, scaled to 100
      keywordOverlap = Math.min(100, Math.round((matchCount / caseTerms.length) * 100));
    }
  }

  // --- Source type priority (weight 0.10) ---
  const sourceTypePriority = SOURCE_TYPE_PRIORITY[source.source_type] ?? 50;

  // --- Content relevance (weight 0.10) ---
  let contentRelevance = 0;
  if (caseDescription && source.content) {
    const descWords = caseDescription
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3); // Only consider words longer than 3 chars
    const contentLower = source.content.toLowerCase();

    if (descWords.length > 0) {
      const matchingWords = descWords.filter(w => contentLower.includes(w));
      contentRelevance = Math.min(100, Math.round((matchingWords.length / descWords.length) * 100));
    }
  }

  // --- Weighted total ---
  const relevanceScore = Math.round(
    regionMatch * 0.35 +
    flapTypeMatch * 0.25 +
    keywordOverlap * 0.20 +
    sourceTypePriority * 0.10 +
    contentRelevance * 0.10
  );

  return {
    id: source.id,
    title: source.title,
    content: source.content,
    source_type: source.source_type,
    source_url: source.source_url,
    keywords: source.keywords,
    region_focus: source.region_focus,
    flap_types: source.flap_types,
    relevanceScore,
    scoreBreakdown: {
      regionMatch,
      flapTypeMatch,
      keywordOverlap,
      sourceTypePriority,
      contentRelevance,
    },
  };
}

/**
 * Get medical sources for a user
 */
export async function getMedicalSources(userId: string): Promise<MedicalSource[]> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('medical_sources')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching medical sources:', error);
    throw new Error(`Tıbbi kaynaklar alınamadı: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Search medical sources by keywords, region, and flap type
 */
export async function searchMedicalSources(
  userId: string,
  params: MedicalSourceSearchParams
): Promise<MedicalSource[]> {
  const supabase = createServerClient();
  
  const { keywords, region, flap_type, limit = 5 } = params;
  
  // Use the search function in Supabase
  const { data, error } = await supabase.rpc('search_medical_sources', {
    p_user_id: userId,
    p_keywords: keywords || null,
    p_region: region || null,
    p_flap_type: flap_type || null,
    p_limit: limit,
  });
  
  if (error) {
    console.error('Error searching medical sources:', error);
    throw new Error(`Tıbbi kaynak araması başarısız: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get relevant medical sources for a case using multi-factor relevance scoring.
 *
 * Phase 1: Fetch ALL active sources (limit 50) from Supabase
 * Phase 2: Score each source with scoreMedicalSource()
 * Phase 3: Filter out sources with relevanceScore below 15
 * Phase 4: Sort by relevanceScore desc, return top 5
 *
 * Backward-compatible: old callers passing (userId, region, keywords?) still work.
 */
export async function getRelevantSourcesForCase(
  userId: string,
  region: string,
  keywords?: string[],
  criticalStructures?: string[],
  caseDescription?: string
): Promise<ScoredMedicalSource[]> {
  const supabase = createServerClient();

  // Phase 1: Fetch all active sources (broad fetch, score locally)
  const { data, error } = await supabase
    .from('medical_sources')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching relevant sources:', error);
    return [];
  }

  const allSources: MedicalSource[] = data || [];

  if (allSources.length === 0) {
    return [];
  }

  // Phase 2: Score each source
  const scored = allSources.map(source =>
    scoreMedicalSource(source, region, keywords, criticalStructures, caseDescription)
  );

  // Phase 3: Filter out low-relevance sources (score < 15)
  const filtered = scored.filter(s => s.relevanceScore >= 15);

  // Phase 4: Sort by relevanceScore desc, return top 5
  filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return filtered.slice(0, 5);
}

/**
 * Create a new medical source
 */
export async function createMedicalSource(
  userId: string,
  source: MedicalSourceInput
): Promise<MedicalSource> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('medical_sources')
    .insert({
      user_id: userId,
      ...source,
      is_active: true,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating medical source:', error);
    throw new Error(`Tıbbi kaynak oluşturulamadı: ${error.message}`);
  }
  
  return data;
}

/**
 * Update a medical source
 */
export async function updateMedicalSource(
  userId: string,
  sourceId: string,
  updates: Partial<MedicalSourceInput>
): Promise<MedicalSource> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('medical_sources')
    .update(updates)
    .eq('id', sourceId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating medical source:', error);
    throw new Error(`Tıbbi kaynak güncellenemedi: ${error.message}`);
  }
  
  return data;
}

/**
 * Delete a medical source (soft delete)
 */
export async function deleteMedicalSource(userId: string, sourceId: string): Promise<void> {
  const supabase = createServerClient();
  
  const { error } = await supabase
    .from('medical_sources')
    .update({ is_active: false })
    .eq('id', sourceId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error deleting medical source:', error);
    throw new Error(`Tıbbi kaynak silinemedi: ${error.message}`);
  }
}

/**
 * Format medical sources for AI prompt context.
 *
 * Accepts both ScoredMedicalSource[] (new) and MedicalSource[] (legacy) for
 * backward compatibility. When a source has a relevanceScore, it is included
 * in the output along with region_focus and flap_types metadata.
 */
export function formatSourcesForPrompt(sources: (ScoredMedicalSource | MedicalSource)[]): string {
  if (sources.length === 0) {
    return '';
  }

  let context = '\n\n=== TIBBİ KAYNAK REFERANSLARI ===\n';
  context += 'Aşağıdaki tıbbi kaynaklar bu olgu için önerilen flep tekniklerini desteklemektedir:\n\n';

  sources.forEach((source, index) => {
    context += `${index + 1}. [${source.source_type.toUpperCase()}] ${source.title}`;

    // Include relevance score if available (ScoredMedicalSource)
    if ('relevanceScore' in source && typeof source.relevanceScore === 'number') {
      context += ` (Uygunluk: %${source.relevanceScore})`;
    }
    context += '\n';

    // Region focus
    if (source.region_focus && source.region_focus.length > 0) {
      context += `   Bölge Odağı: ${source.region_focus.join(', ')}\n`;
    }

    // Flap types
    if (source.flap_types && source.flap_types.length > 0) {
      context += `   Flep Tipleri: ${source.flap_types.join(', ')}\n`;
    }

    // Keywords
    if (source.keywords && source.keywords.length > 0) {
      context += `   Anahtar Kelimeler: ${source.keywords.join(', ')}\n`;
    }

    // Content (truncated at 500 chars)
    if (source.content.length > 500) {
      context += `   İçerik: ${source.content.substring(0, 500)}...\n`;
    } else {
      context += `   İçerik: ${source.content}\n`;
    }
    context += '\n';
  });

  context += 'Bu kaynakları referans alarak flep önerilerinizi destekleyin.\n';
  context += 'Eğer önerdiğiniz flep tekniği bu kaynaklarda bahsedilmişse, bunu belirtin.\n';

  return context;
}

