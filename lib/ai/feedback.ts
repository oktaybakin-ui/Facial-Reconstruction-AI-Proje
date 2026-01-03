'use server';

import { createServerClient } from '@/lib/supabaseClient';
import type { ValidationFeedback } from '@/types/validation';

/**
 * Feedback Service
 * Handles user feedback and triggers re-generation of flap drawings
 */

/**
 * Save user feedback for a flap suggestion
 */
export async function saveFeedback(
  caseId: string,
  flapSuggestionId: string,
  feedback: Omit<ValidationFeedback, 'timestamp'>
): Promise<void> {
  const supabase = createServerClient();
  
  const { error } = await supabase
    .from('flap_feedback')
    .insert({
      case_id: caseId,
      flap_suggestion_id: flapSuggestionId,
      user_rating: feedback.userRating,
      user_comments: feedback.userComments || null,
      specific_issues: feedback.specificIssues || null,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Failed to save feedback:', error);
    throw new Error('Geri bildirim kaydedilemedi');
  }
}

/**
 * Get feedback for a flap suggestion
 */
export async function getFeedback(
  flapSuggestionId: string
): Promise<ValidationFeedback | null> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('flap_feedback')
    .select('*')
    .eq('flap_suggestion_id', flapSuggestionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    flapSuggestionId: data.flap_suggestion_id,
    userRating: data.user_rating,
    userComments: data.user_comments || undefined,
    specificIssues: data.specific_issues || undefined,
    timestamp: data.created_at,
  };
}

/**
 * Request re-generation of a flap drawing
 */
export async function requestRegeneration(
  caseId: string,
  flapSuggestionId: string,
  feedback: ValidationFeedback
): Promise<{ success: boolean; message: string }> {
  try {
    // Save feedback first
    await saveFeedback(caseId, flapSuggestionId, feedback);

    // Mark for regeneration (this would trigger a background job in production)
    const supabase = createServerClient();
    
    const { error } = await supabase
      .from('ai_results')
      .update({
        needs_regeneration: true,
        regeneration_reason: feedback.userRating === 'yetersiz' 
          ? 'Kullanıcı çizimi yetersiz buldu'
          : 'Kullanıcı geri bildirimi',
      })
      .eq('case_id', caseId);

    if (error) {
      console.error('Failed to mark for regeneration:', error);
      return { success: false, message: 'Yeniden çizim talebi kaydedilemedi' };
    }

    return {
      success: true,
      message: 'Yeniden çizim talebi kaydedildi. Analiz sayfasından yeniden çizim isteyebilirsiniz.',
    };
  } catch (error: any) {
    console.error('Regeneration request failed:', error);
    return { success: false, message: error.message || 'Yeniden çizim talebi başarısız' };
  }
}

