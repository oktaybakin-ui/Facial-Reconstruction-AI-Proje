import { getAnthropicClient } from '@/lib/anthropic';
import { withRetry } from './retry';
import { extractJson, attemptJsonRepair } from './json-repair';
import type { FlapSuggestion, SafetyReview, VisionSummary } from '@/types/ai';

const SYSTEM_PROMPT = `Sen tıbbi karar destek JSON çıktısı için güvenlik ve tutarlılık denetçisisin.

Görevlerin:
1. Cerrahi teknikleri güvenlik açısından incele - standart tıbbi pratiğe uygun olduklarından emin ol.
2. Tehlikeli tavsiyeler, uygunsuz teknikler veya aşırı spekülatif iddiaları işaretle.
3. surgical_technique alanını KALDIRMA - sadece güvenlik endişelerini comments'te belirt.
4. Tutarsızlıklar veya belirgin halüsinasyonlar görürsen suitability_score'u düşür ve comments'e not ekle.
5. safety_review objesi oluştur: hallucination_risk, comments, legal_disclaimer alanlarıyla.
6. legal_disclaimer şunu belirtmeli: "Bu öneriler yalnızca karar destek amaçlıdır; nihai karar, hastayı değerlendiren klinik ekibe aittir."

Aynı JSON yapısını döndür + safety_review alanı ekle.

ÖNEMLİ: Cerrahi teknik açıklamalarını ASLA silme veya değiştirme. Sadece güvenlik endişelerini raporla.
TÜM comments Türkçe olmalı.`;

export async function reviewSafety(
  visionSummary: VisionSummary,
  flapSuggestions: FlapSuggestion[]
): Promise<SafetyReview & { flapSuggestions: FlapSuggestion[] }> {
  const anthropic = getAnthropicClient();

  try {
    const inputData = {
      vision_summary: visionSummary,
      flap_suggestions: flapSuggestions,
    };

    const userPrompt = `Bu tıbbi karar destek JSON'ını güvenlik, tutarlılık ve uygunluk açısından incele:

${JSON.stringify(inputData, null, 2)}

Kontrol et:
- Tehlikeli tavsiyeler veya spekülatif iddialar
- Tutarsızlıklar veya halüsinasyonlar
- Cerrahi tekniklerin güvenliği (silme, sadece incele ve raporla)
- Uygun yasal uyarılar

Aynı JSON yapısını döndür ama:
1. Kök seviyede safety_review objesi ekle
2. Sorun bulursan suitability_score'ları düzelt
3. Endişeler varsa safety_review.comments'e ekle`;

    const response = await withRetry(
      () => anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      { maxRetries: 3, initialDelayMs: 1000 }
    );

    const rawText = response.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('');

    if (!rawText || rawText.trim() === '') {
      throw new Error('Güvenlik incelemesi boş yanıt döndü');
    }

    // Handle truncation
    let contentToParse = rawText;
    if (response.stop_reason === 'max_tokens') {
      console.warn('Safety review response was truncated. Attempting JSON repair...');
      const repaired = attemptJsonRepair(rawText);
      if (repaired) {
        contentToParse = repaired;
      }
    }

    const cleanJson = extractJson(contentToParse);
    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (parseError: unknown) {
      // Attempt repair on parse failure
      console.warn('Safety JSON parse failed, attempting repair...');
      const repaired = attemptJsonRepair(contentToParse);
      if (repaired) {
        parsed = JSON.parse(repaired);
      } else {
        console.error('Safety JSON repair failed:', parseError);
        // Return minimal safety review instead of crashing
        return {
          hallucination_risk: 'orta' as const,
          comments: ['Güvenlik incelemesi JSON parse hatası nedeniyle tamamlanamadı. Manuel kontrol önerilir.'],
          legal_disclaimer: 'Bu öneriler yalnızca karar destek amaçlıdır; nihai karar, hastayı değerlendiren klinik ekibe aittir.',
          flapSuggestions: flapSuggestions,
        };
      }
    }

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
  } catch (error: unknown) {
    console.error('Safety review error:', error);
    throw new Error(`Güvenlik incelemesi başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
}
