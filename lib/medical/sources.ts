import { createServerClient } from '@/lib/supabaseClient';
import type { MedicalSource, MedicalSourceInput, MedicalSourceSearchParams } from '@/types/medical';

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
 * Get relevant medical sources for a case (based on region and context)
 * Now searches all active sources (not just user's sources) since only admins can add sources
 */
export async function getRelevantSourcesForCase(
  userId: string,
  region: string,
  keywords?: string[]
): Promise<MedicalSource[]> {
  const supabase = createServerClient();
  
  // Search all active medical sources (since only admins can add them, all sources are available to everyone)
  const { data, error } = await supabase
    .from('medical_sources')
    .select('*')
    .eq('is_active', true)
    .contains('region_focus', [region])
    .order('created_at', { ascending: false })
    .limit(3);
  
  if (error) {
    console.error('Error fetching relevant sources:', error);
    return [];
  }
  
  return data || [];
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
 * Format medical sources for AI prompt context
 */
export function formatSourcesForPrompt(sources: MedicalSource[]): string {
  if (sources.length === 0) {
    return '';
  }
  
  let context = '\n\n=== TIBBİ KAYNAK REFERANSLARI ===\n';
  context += 'Aşağıdaki tıbbi kaynaklar bu olgu için önerilen flep tekniklerini desteklemektedir:\n\n';
  
  sources.forEach((source, index) => {
    context += `${index + 1}. [${source.source_type.toUpperCase()}] ${source.title}\n`;
    if (source.keywords && source.keywords.length > 0) {
      context += `   Anahtar Kelimeler: ${source.keywords.join(', ')}\n`;
    }
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

