'use server';

import { getAnthropicClient } from '@/lib/anthropic';
import { withRetry } from './retry';
import { extractJson, attemptJsonRepair } from './json-repair';
import type { FlapSuggestion, VisionSummary } from '@/types/ai';
import type { Case } from '@/types/cases';

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT - Optimize edilmiş, tekrarsız, 6 bölüm
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Sen yüz bölgesi cilt defektleri için rekonstrüksiyon karar destek asistanısın.
TÜM çıktın Türkçe olmalı. Tıbbi terimler Türkçe karşılıklarıyla kullanılmalı.

Eğer tıbbi kaynak bilgileri (medicalSourcesContext) verilirse, MUTLAKA öncelikli olarak kullan. Kendi bilginle çelişirse kaynak bilgisini esas al ve why alanında "(Not: Kaynaklara göre farklı bir yaklaşım tercih edilmiştir.)" notu ekle.

## BÖLÜM 1: KLİNİK BİLGİ

BÖLGE-SPESİFİK:
- Alın: Geniş mobilizasyon, RSTL horizontal, estetik önemli. Advancement/rotasyon uygun. Glabella dikkat.
- Burun: Estetik alt birimler kritik (dorsum, sidewall, tip, ala). Küçük: bilobed, trilobed, nasolabial. Büyük: paramedian forehead, nasolabial interpolasyon. RSTL dikey.
- Yanak: Geniş donor, advancement uygun. Malar prominence dikkat. RSTL karışık. Büyük: interpolasyon.
- Göz kapağı: Fonksiyonel kritik, full-thickness özel yaklaşım. Advancement, rotasyon, graft kombinasyonu. RSTL horizontal.
- Ağız çevresi: Vermillion border korunmalı, fonksiyonel hareket dikkat. Advancement, rotasyon. RSTL horizontal.
- Çene: Estetik önemi düşük, geniş flepler uygun. RSTL horizontal.

DEFEKT BOYUTU KRİTERLERİ:
- Küçük (<1.5cm): Direkt kapatma, advancement, rotasyon, transpozisyon
- Orta (1.5-3cm): Transpozisyon, bilobed, trilobed, rhomboid, advancement
- Büyük (>3cm): İnterpolasyon (paramedian forehead, nasolabial), serbest flep, kombinasyon

HASTA FAKTÖRLERİ:
- Yaş: Çocuk (<18) büyüme+estetik, genç (18-40) estetik öncelik, orta yaş (40-65) denge, yaşlı (>65) fonksiyon+hızlı iyileşme
- Önceki cerrahi/radyoterapi: Vaskülarite değerlendirmesi, geniş pedikül
- Patoloji: Malign → geniş margin, frozen section. Benign → minimal margin, estetik öncelik.

## BÖLÜM 2: ÇIKTI ŞEMASI

4-6 farklı flep önerisi üret. Dağılım: en az 1 "en_uygun" (skor 85-100), en az 2 "uygun" (60-84), en az 1 "alternatif" (40-59). Farklı tiplerde öner (transpozisyon, rotasyon, advancement, bilobed, interpolasyon, rhomboid vb.).

Çıktı formatı: { "flap_suggestions": [ ... ] } — saf JSON, markdown yok.

Her flep şunları içermeli:
- flap_name: string (Türkçe ad)
- suitability_score: number (0-100, tutarlı formülle hesapla: estetik/fonksiyonel/anatomik uygunluk/hasta faktörleri)
- category: "en_uygun" | "uygun" | "alternatif"
- why: string (skor gerekçesi dahil, karşı-argüman dahil)
- advantages: string[]
- cautions: string[]
- alternatives: string[]
- aesthetic_risk / functional_risk / complication_risk: "düşük" | "orta" | "yüksek"
- expected_complications: string[]
- prevention_strategies: string[]
- donor_site_morbidity: "minimal" | "moderate" | "significant"
- contraindications: string[] (mutlak)
- relative_contraindications: string[] (göreceli)
- when_to_avoid: string
- comparison_with_alternatives: { better_than: string[], worse_than: string[], similar_to: string[] }
- postoperative_care: { immediate: string[], early: string[], late: string[], long_term: string[] }
- follow_up_schedule: { day_1, day_7, day_14, month_1, month_3: string }
- estimated_surgery_time: string
- estimated_cost_range: string
- complexity_level: "basit" | "orta" | "kompleks"
- technical_difficulty: "başlangıç" | "orta" | "ileri" | "uzman"
- evidence_level: "yüksek" | "orta" | "düşük"
- success_rate: string
- surgical_technique: string (adım adım: insizyon planlaması, flep tasarımı, disseksiyon, mobilizasyon, defekt kapatma, dikiş teknikleri)
- flap_drawing: obje (aşağıdaki çizim spesifikasyonuna göre)

## BÖLÜM 3: ÇİZİM SPESİFİKASYONU

Koordinat sistemi: 0-1000 normalize. Tüm çizimler profesyonel cerrahi atlas kalitesinde olmalı.

RENK STANDARTLARI (zorunlu):
- Defekt: "#DC2626" (kırmızı), hatching: "cross"
- Kesi çizgileri: "#1E40AF" (koyu mavi), lineStyle: "dashed", purpose: "planned_incision"
- Sütür hattı: "#6B7280" (gri), lineStyle: "dotted", purpose: "suture_line"
- Flep alanı: "#2563EB" (mavi), fillOpacity: 0.20-0.25
- İkinci lob: "#0891B2" (turkuaz)
- Donor alan: "#16A34A" (yeşil), hatching: "single"
- Bürow üçgeni: "#7C3AED" (mor)
- Oklar: "#15803D" (koyu yeşil)

flap_drawing yapısı:
{
  "defect_area": { "points": [{x,y},...], "color": "#DC2626", "label": "Defekt Alanı", "hatching": "cross" },
  "incision_lines": [{ "points": [{x,y},...], "color": "#1E40AF", "label": "...", "lineStyle": "dashed", "lineWidth": 3, "purpose": "planned_incision" }],
  "flap_areas": [{ "points": [{x,y},...], "color": "#2563EB", "label": "Flep Alanı", "fillOpacity": 0.22 }],
  "donor_area": { "points": [{x,y},...], "color": "#16A34A", "label": "Donor Alan", "hatching": "single" },
  "arrows": [{ "from": {x,y}, "to": {x,y}, "color": "#15803D", "label": "...", "type": "curved|straight|transposition", "pivotPoint": {x,y} }],
  "pivot_point": { "position": {x,y}, "label": "Pivot" },
  "burow_triangles": [{ "points": [{x,y},...], "color": "#7C3AED", "label": "Bürow Üçgeni" }]
}

ÇİZİM KURALLARI:
- Kesi çizgileri: RSTL boyunca, her biri 5-8+ nokta (kavisli), defekt alanının DIŞINDA
- Flep alanları: defekt boyutunun 1.5-2x genişlik, yarı saydam
- Oklar: rotasyon → "curved" + pivotPoint, transpozisyon → "transposition", advancement → "straight"
- Pivot: rotasyon/transpozisyon fleplerinde mutlaka belirt
- Bürow üçgeni: dog-ear düzeltmesi gereken yerlerde

NEGATİF KURALLAR (İHLAL EDİLEMEZ):
1. Kesi çizgileri defekt üzerinden/içinden GEÇMEZ
2. Donor alan defekt bölgesiyle ÇAKIŞMAZ
3. Flep rotasyonu/ilerlemesi anatomik olarak MÜMKÜN olmalı
Eğer uygun çizim üretemiyorsan: flap_drawing alanına null koy.

## BÖLÜM 4: AKIL YÜRÜTME

- Belirsizlik varsa why alanında açıkça belirt
- Suitability_score'u tutarlı formülle hesapla (estetik 0-10, fonksiyonel 0-10, anatomik 0-10, hasta faktörleri 0-10 → normalize 0-100)
- Her flepe karşı-argüman dahil et (why veya comparison_with_alternatives'ta)
- Tüm önerileri ürettikten sonra iç kontrol yap: çeşitlilik, uygulanabilirlik, çizim kuralları, tutarlılık
- Sorun varsa düzelt, sonra JSON olarak sun`;

export async function suggestFlaps(
  caseData: Case,
  visionSummary: VisionSummary,
  medicalSourcesContext?: string
): Promise<FlapSuggestion[]> {
  if (!visionSummary.defect_location) {
    console.warn('No defect_location found in vision summary - drawings may not align correctly');
  }

  const anthropic = getAnthropicClient();

  // ─── User Prompt: Sadece vaka-spesifik data ───
  const userPrompt = buildUserPrompt(caseData, visionSummary, medicalSourcesContext);

  try {
    const response = await withRetry(
      () => anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
        temperature: 0.3,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      { maxRetries: 2, initialDelayMs: 2000 }
    );

    // Extract text content
    const rawText = response.content
      .filter(block => block.type === 'text')
      .map(block => {
        if (block.type === 'text') return block.text;
        return '';
      })
      .join('');

    if (!rawText || rawText.trim() === '') {
      throw new Error(`Decision model yanıt verdi ama içerik boş. Stop reason: ${response.stop_reason || 'unknown'}`);
    }

    // Truncation detection
    let contentToParse = rawText;
    if (response.stop_reason === 'max_tokens') {
      console.warn('Decision model response was truncated at max_tokens. Attempting JSON repair...');
      const repaired = attemptJsonRepair(rawText);
      if (repaired) {
        contentToParse = repaired;
        console.info('JSON repair successful');
      } else {
        throw new Error('Decision model yanıtı truncate oldu ve onarılamadı. Lütfen tekrar deneyin.');
      }
    }

    // Parse JSON (handle markdown fences etc.)
    const cleanJson = extractJson(contentToParse);
    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (parseError: unknown) {
      // Attempt repair on parse failure too
      const repaired = attemptJsonRepair(contentToParse);
      if (repaired) {
        parsed = JSON.parse(repaired);
      } else {
        console.error('Decision JSON parse error:', parseError);
        throw new Error(`Decision model yanıtı parse edilemedi: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
    }

    const suggestions = parsed.flap_suggestions || [];

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      console.warn('No flap suggestions in response:', parsed);
      throw new Error("Decision model tarafından flep önerisi dönmedi. Lütfen tekrar deneyin.");
    }

    // Validate and normalize suggestions
    return suggestions.map((flap: Record<string, unknown>) => normalizeFlapSuggestion(flap, visionSummary));

  } catch (error: unknown) {
    console.error('Decision suggestion error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errObj = error as Record<string, unknown>;
    const errorStatus = errObj?.status as number | undefined;

    // Anthropic-specific error handling
    if (errorStatus === 401 || errorMessage.includes('authentication_error') || errorMessage.includes('invalid x-api-key')) {
      throw new Error(
        'Anthropic API key geçersiz veya eksik. ' +
        'Lütfen Vercel Dashboard\'da ANTHROPIC_API_KEY environment variable\'ını kontrol edin.'
      );
    }

    if (errorStatus === 429 || errorMessage.includes('rate_limit')) {
      throw new Error(
        'Anthropic API istek limiti aşıldı. Lütfen bir süre bekleyip tekrar deneyin.'
      );
    }

    if (errorStatus === 529 || errorMessage.includes('overloaded')) {
      throw new Error(
        'Anthropic servisi şu anda yoğun. Lütfen birkaç dakika sonra tekrar deneyin.'
      );
    }

    throw new Error(`Flep önerisi oluşturulamadı: ${errorMessage || 'Bilinmeyen hata'}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// User prompt builder - sadece vaka-spesifik data, tekrar yok
// ─────────────────────────────────────────────────────────────────────────────
function buildUserPrompt(
  caseData: Case,
  visionSummary: VisionSummary,
  medicalSourcesContext?: string
): string {
  const parts: string[] = [];

  // Olgu bilgileri
  parts.push(`Bu olguyu analiz et ve lokal flep seçenekleri öner:

Olgu Bilgileri:
- Bölge: ${caseData.region}
- Yaş: ${caseData.age || 'Belirtilmemiş'}
- Cinsiyet: ${caseData.sex || 'Belirtilmemiş'}
- Defekt boyutu: ${caseData.width_mm || visionSummary.estimated_width_mm}mm x ${caseData.height_mm || visionSummary.estimated_height_mm}mm
- Derinlik: ${caseData.depth || visionSummary.depth_estimation}
- Önceki cerrahi: ${caseData.previous_surgery ? 'Evet' : 'Hayır'}
- Önceki radyoterapi: ${caseData.previous_radiotherapy ? 'Evet' : 'Hayır'}
- Şüpheli patoloji: ${caseData.pathology_suspected || 'Belirtilmemiş'}
- Kritik yapılar: ${caseData.critical_structures?.join(', ') || visionSummary.critical_structures.join(', ') || 'Yok'}
- Yüksek estetik zon: ${caseData.high_aesthetic_zone ?? visionSummary.aesthetic_zone ? 'Evet' : 'Hayır'}

Görüntü Analizi:
- Tespit edilen bölge: ${visionSummary.detected_region}
- Tahmini boyut: ${visionSummary.estimated_width_mm}mm x ${visionSummary.estimated_height_mm}mm
- Derinlik tahmini: ${visionSummary.depth_estimation}
- Kritik yapılar: ${visionSummary.critical_structures.join(', ') || 'Yok'}
- Estetik zon: ${visionSummary.aesthetic_zone ? 'Evet' : 'Hayır'}`);

  // Manuel defekt konumu
  if (visionSummary.defect_location) {
    const loc = visionSummary.defect_location;
    parts.push(`
DEFEKT KONUMU (Manuel işaretlenmiş - bu koordinatları AYNEN kullan):
- Merkez: (${loc.center_x}, ${loc.center_y})
- Boyut: ${loc.width} x ${loc.height}
${loc.points ? `- Poligon noktaları: ${JSON.stringify(loc.points)}` : ''}
defect_area.points = bu noktalar. Tüm çizimler bu konuma göre hizalanmalı.`);
  }

  // Anatomik landmark'lar
  if (visionSummary.anatomical_landmarks) {
    const lm = visionSummary.anatomical_landmarks;
    parts.push(`
ANATOMİK REFERANS NOKTALARI (0-1000 normalize):
- Sol Göz: (${lm.leftEye.x}, ${lm.leftEye.y}), Sağ Göz: (${lm.rightEye.x}, ${lm.rightEye.y})
- Burun Ucu: (${lm.noseTip.x}, ${lm.noseTip.y}), Burun Kökü: (${lm.noseBase.x}, ${lm.noseBase.y})
- Sol Ağız: (${lm.leftMouthCorner.x}, ${lm.leftMouthCorner.y}), Sağ Ağız: (${lm.rightMouthCorner.x}, ${lm.rightMouthCorner.y})
- Çene: (${lm.chin.x}, ${lm.chin.y})
${lm.foreheadCenter ? `- Alın: (${lm.foreheadCenter.x}, ${lm.foreheadCenter.y})` : ''}
- Göz Hattı Y: ${lm.eyeLine.y}, Ağız Hattı Y: ${lm.mouthLine.y}
- Yüz Orta Hattı: Üst=${lm.facialMidline.topX}, Alt=${lm.facialMidline.bottomX}
Kesi çizgileri göz hattını kesmemeli (göz kapağı flebi hariç). İnsizyon RSTL'lere paralel planlanmalı.`);
  }

  // Tıbbi kaynaklar
  if (medicalSourcesContext) {
    parts.push(`
TIBBİ KAYNAKLAR (öncelikli kullan):
${medicalSourcesContext}`);
  }

  return parts.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Flap suggestion normalizer
// ─────────────────────────────────────────────────────────────────────────────
function normalizeFlapSuggestion(
  flap: Record<string, unknown>,
  visionSummary: VisionSummary
): FlapSuggestion {
  const compAlts = flap.comparison_with_alternatives && typeof flap.comparison_with_alternatives === 'object'
    ? flap.comparison_with_alternatives as Record<string, unknown>
    : null;
  const postCare = flap.postoperative_care && typeof flap.postoperative_care === 'object'
    ? flap.postoperative_care as Record<string, unknown>
    : null;
  const followUp = flap.follow_up_schedule && typeof flap.follow_up_schedule === 'object'
    ? flap.follow_up_schedule as Record<string, unknown>
    : null;
  const drawing = flap.flap_drawing && typeof flap.flap_drawing === 'object'
    ? flap.flap_drawing as Record<string, unknown>
    : null;

  return {
    flap_name: (flap.flap_name as string) || 'Bilinmeyen flep',
    suitability_score: Math.max(0, Math.min(100, (flap.suitability_score as number) || 50)),
    category: (['en_uygun', 'uygun', 'alternatif'].includes(flap.category as string)
      ? flap.category as string
      : 'alternatif') as FlapSuggestion['category'],
    why: (flap.why as string) || 'Açıklama sağlanmadı',
    advantages: Array.isArray(flap.advantages) ? flap.advantages : [],
    cautions: Array.isArray(flap.cautions) ? flap.cautions : [],
    alternatives: Array.isArray(flap.alternatives) ? flap.alternatives : [],
    aesthetic_risk: (['düşük', 'orta', 'yüksek'].includes(flap.aesthetic_risk as string)
      ? flap.aesthetic_risk as string
      : 'orta') as FlapSuggestion['aesthetic_risk'],
    functional_risk: (['düşük', 'orta', 'yüksek'].includes(flap.functional_risk as string)
      ? flap.functional_risk as string
      : 'orta') as FlapSuggestion['functional_risk'],
    complication_risk: (['düşük', 'orta', 'yüksek'].includes(flap.complication_risk as string)
      ? flap.complication_risk as string
      : 'orta') as FlapSuggestion['complication_risk'],
    expected_complications: Array.isArray(flap.expected_complications) ? flap.expected_complications : [],
    prevention_strategies: Array.isArray(flap.prevention_strategies) ? flap.prevention_strategies : [],
    donor_site_morbidity: (['minimal', 'moderate', 'significant'].includes(flap.donor_site_morbidity as string)
      ? flap.donor_site_morbidity as string
      : 'moderate') as FlapSuggestion['donor_site_morbidity'],
    contraindications: Array.isArray(flap.contraindications) ? flap.contraindications : [],
    relative_contraindications: Array.isArray(flap.relative_contraindications) ? flap.relative_contraindications : [],
    when_to_avoid: (flap.when_to_avoid as string) || 'Belirtilmemiş',
    comparison_with_alternatives: compAlts
      ? {
          better_than: Array.isArray(compAlts.better_than) ? compAlts.better_than as string[] : [],
          worse_than: Array.isArray(compAlts.worse_than) ? compAlts.worse_than as string[] : [],
          similar_to: Array.isArray(compAlts.similar_to) ? compAlts.similar_to as string[] : [],
        }
      : { better_than: [], worse_than: [], similar_to: [] },
    postoperative_care: postCare
      ? {
          immediate: Array.isArray(postCare.immediate) ? postCare.immediate as string[] : [],
          early: Array.isArray(postCare.early) ? postCare.early as string[] : [],
          late: Array.isArray(postCare.late) ? postCare.late as string[] : [],
          long_term: Array.isArray(postCare.long_term) ? postCare.long_term as string[] : [],
        }
      : { immediate: [], early: [], late: [], long_term: [] },
    follow_up_schedule: followUp
      ? {
          day_1: (followUp.day_1 as string) || 'Belirtilmemiş',
          day_7: (followUp.day_7 as string) || 'Belirtilmemiş',
          day_14: (followUp.day_14 as string) || 'Belirtilmemiş',
          month_1: (followUp.month_1 as string) || 'Belirtilmemiş',
          month_3: (followUp.month_3 as string) || 'Belirtilmemiş',
        }
      : { day_1: 'Belirtilmemiş', day_7: 'Belirtilmemiş', day_14: 'Belirtilmemiş', month_1: 'Belirtilmemiş', month_3: 'Belirtilmemiş' },
    estimated_surgery_time: (flap.estimated_surgery_time as string) || 'Belirtilmemiş',
    estimated_cost_range: (flap.estimated_cost_range as string) || 'Belirtilmemiş',
    complexity_level: (['basit', 'orta', 'kompleks'].includes(flap.complexity_level as string)
      ? flap.complexity_level as string
      : 'orta') as FlapSuggestion['complexity_level'],
    technical_difficulty: (['başlangıç', 'orta', 'ileri', 'uzman'].includes(flap.technical_difficulty as string)
      ? flap.technical_difficulty as string
      : 'orta') as FlapSuggestion['technical_difficulty'],
    evidence_level: (['yüksek', 'orta', 'düşük'].includes(flap.evidence_level as string)
      ? flap.evidence_level as string
      : 'orta') as FlapSuggestion['evidence_level'],
    success_rate: (flap.success_rate as string) || 'Belirtilmemiş',
    surgical_technique: (flap.surgical_technique as string) || (flap.cerrahi_teknik as string) || undefined,
    flap_drawing: buildFlapDrawing(drawing, visionSummary),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Flap drawing builder - manual annotation priority
// ─────────────────────────────────────────────────────────────────────────────
function buildFlapDrawing(
  drawing: Record<string, unknown> | null,
  visionSummary: VisionSummary
): FlapSuggestion['flap_drawing'] {
  // CRITICAL: Always use defect_location.points for defect_area (manual annotation priority)
  const manualDefectArea = visionSummary.defect_location?.points ? {
    points: visionSummary.defect_location.points,
    color: '#DC2626',
    label: 'Defekt Alanı',
    hatching: 'cross' as const,
  } : undefined;

  if (drawing) {
    return {
      defect_area: manualDefectArea || (drawing.defect_area as FlapSuggestion['flap_drawing'] extends undefined ? never : NonNullable<FlapSuggestion['flap_drawing']>['defect_area']) || undefined,
      incision_lines: Array.isArray(drawing.incision_lines) ? drawing.incision_lines : [],
      flap_areas: Array.isArray(drawing.flap_areas) ? drawing.flap_areas : [],
      donor_area: (drawing.donor_area as NonNullable<FlapSuggestion['flap_drawing']>['donor_area']) || undefined,
      arrows: Array.isArray(drawing.arrows) ? drawing.arrows : [],
      pivot_point: (drawing.pivot_point as NonNullable<FlapSuggestion['flap_drawing']>['pivot_point']) || undefined,
      burow_triangles: Array.isArray(drawing.burow_triangles) ? drawing.burow_triangles : undefined,
      undermining_zone: (drawing.undermining_zone as NonNullable<FlapSuggestion['flap_drawing']>['undermining_zone']) || undefined,
    };
  }

  // No AI drawing but manual defect exists
  if (manualDefectArea) {
    return {
      defect_area: manualDefectArea,
      incision_lines: [],
      flap_areas: [],
      arrows: [],
    };
  }

  return undefined;
}
