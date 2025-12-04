import Anthropic from '@anthropic-ai/sdk';
import type { FlapSuggestion, SafetyReview, VisionSummary } from '@/types/ai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a safety and consistency checker for medical decision support JSON.

Tasks:
1. Review surgical techniques for safety - ensure they are appropriate and follow standard medical practice.
2. Flag any dangerous advice, inappropriate techniques, or highly speculative claims.
3. DO NOT remove surgical techniques - they are requested by the user. Only flag safety concerns in comments.
4. If you see inconsistencies or obvious hallucinations, lower suitability_score and add notes in comments.
5. Ensure a safety_review object with fields: hallucination_risk, comments, legal_disclaimer.
6. The legal disclaimer must state: 'This is for decision support only and does not replace clinical judgment or training.'

Output the same JSON structure plus an added safety_review field.

DO NOT remove surgical_technique field - only review it for safety concerns and add comments if needed.`;

export async function reviewSafety(
  visionSummary: VisionSummary,
  flapSuggestions: FlapSuggestion[]
): Promise<SafetyReview & { flapSuggestions: FlapSuggestion[] }> {
  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key bulunamadı. Lütfen .env.local dosyasında ANTHROPIC_API_KEY değişkenini ayarlayın.');
  }

  console.log('Starting safety review...');
  console.log('Anthropic API key present:', !!process.env.ANTHROPIC_API_KEY);

  try {
    const inputData = {
      vision_summary: visionSummary,
      flap_suggestions: flapSuggestions,
    };

    const userPrompt = `Review this medical decision support JSON for safety, consistency, and appropriateness:

${JSON.stringify(inputData, null, 2)}

Check for:
- Any step-by-step surgical instructions (remove or flag)
- Dangerous advice or speculative claims
- Inconsistencies or hallucinations
- Appropriate disclaimers

Return the same JSON structure but:
1. Add a safety_review object at the root level
2. Adjust suitability_scores if you find issues
3. Add comments in the safety_review if concerns exist`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const text = content.text;
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
    const jsonText = jsonMatch[1] || text;
    
    const parsed = JSON.parse(jsonText);
    
    // Extract safety review and validated suggestions
    const safetyReview: SafetyReview = parsed.safety_review || {
      hallucination_risk: 'orta' as const,
      comments: ['Güvenlik incelemesi tamamlandı'],
      legal_disclaimer: 'Bu öneriler yalnızca karar destek amaçlıdır; nihai karar, hastayı değerlendiren klinik ekibe aittir. Bu platform klinik muayene, cerrahi deneyim ve multidisipliner değerlendirmelerin yerine geçmez.',
    };

    const validatedSuggestions: FlapSuggestion[] = parsed.flap_suggestions || flapSuggestions;

    return {
      ...safetyReview,
      flapSuggestions: validatedSuggestions,
    };
  } catch (error: any) {
    console.error('Safety review error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      response: error?.response,
    });
    // Re-throw error instead of returning fallback so orchestrator can handle it properly
    throw new Error(`Güvenlik incelemesi başarısız: ${error?.message || 'Bilinmeyen hata'}`);
  }
}

