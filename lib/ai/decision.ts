'use server';

import { openai } from '@/lib/openai';
import type { FlapSuggestion, VisionSummary } from '@/types/ai';
import type { Case } from '@/types/cases';

const SYSTEM_PROMPT = `Sen yüz bölgesi cilt defektleri için rekonstrüksiyon karar destek asistanısın.
Hasta metadata'sı ve görüntü analizi özeti alıyorsun.

YAPMAN GEREKENLER:
1. Lokal flep seçenekleri öner ve her flep için detaylı cerrahi teknik bilgisi sağla.
2. Her flep için şunları sağla: flap_name, suitability_score (0–100), category (en_uygun | uygun | alternatif), why, advantages, cautions, alternatives, aesthetic_risk, surgical_technique, flap_drawing.
3. Yüz rekonstrüksiyonu ve estetik alt birimlerin temel prensiplerini takip et.
4. Her flep için ADIM ADIM cerrahi teknik açıkla: insizyon çizgileri, flep mobilizasyonu, defekt kapatma, dikiş teknikleri.
5. Her flep için fotoğraf üzerinde flep çizimi için koordinatlar sağla (flap_drawing).

Çıktı saf JSON formatında: { "flap_suggestions": [ ... ] }.

Her flep önerisi şunları içermeli:
- flap_name: string (Türkçe flep adı, örn: "Transpozisyon flebi", "Rotasyon flebi", "Bilobed flep")
- suitability_score: number (0-100)
- category: "en_uygun" | "uygun" | "alternatif"
- why: string (kısa açıklama - TÜRKÇE)
- advantages: string[] (avantajlar dizisi - TÜRKÇE)
- cautions: string[] (dikkat edilmesi gerekenler dizisi - TÜRKÇE)
- alternatives: string[] (alternatif flep isimleri dizisi - TÜRKÇE)
- aesthetic_risk: "düşük" | "orta" | "yüksek"
- surgical_technique: string (DETAYLI CERRAHİ TEKNİK - Türkçe, adım adım, şunları içermeli: insizyon planlaması, flep tasarımı, disseksiyon, mobilizasyon, defekt kapatma, dikiş teknikleri, postoperatif bakım önerileri)
- video_link: string (YouTube uygulama videosu linki - örn: "https://www.youtube.com/watch?v=..." veya "https://youtu.be/..." - EĞER BULABİLİRSEN, yoksa boş string)
- flap_drawing: { defect_area, incision_lines, flap_areas, donor_area, arrows } - PROFESYONEL CERRAHİ ÇİZİM (aşağıda detaylı açıklama)

surgical_technique ÖRNEK:
"1. İnsizyon Planlaması: Defektin yanında uygun bir donor alan belirlenir. İnsizyon çizgisi natural skin tension lines (RSTL) boyunca planlanır.
2. Flep Tasarımı: Transpozisyon flebi, defekt boyutunun 1.5-2 katı genişliğinde ve uygun uzunlukta tasarlanır.
3. Disseksiyon: Deri ve subkutanöz doku tabakası altında, fasya seviyesinde disseksiyon yapılır.
4. Mobilizasyon: Flep, donor alandan yeterli mobilite kazanana kadar mobilize edilir.
5. Defekt Kapatma: Flep, defekt alanına transpoze edilir ve uygun pozisyonda yerleştirilir.
6. Dikiş: Subkutanöz ve deri sütürleri ile kapatılır. Monofilament non-absorbable veya absorbable sütürler kullanılır.
7. Donor Alan: Donor alan direkt kapatma veya graft ile kapatılabilir.
8. Postoperatif: Kompresyon, lokal bakım ve dikiş kontrolü önerilir."

flap_drawing formatı - PROFESYONEL CERRAHİ ÇİZİM (ÇOK ÖNEMLİ - CERRAH GİBİ DÜZGÜN VE PLANLI):
Çizimler CERRAH TARZI profesyonel, planlı, ayrıntılı ve anatomik olarak doğru olmalı.

{
  "defect_area": {
    "points": [{"x": 400, "y": 300}, {"x": 500, "y": 300}, {"x": 500, "y": 400}, {"x": 400, "y": 400}],
    "color": "#FF0000",
    "label": "Defekt Alanı"
  },
  "incision_lines": [
    {
      "points": [{"x": 400, "y": 300}, {"x": 350, "y": 250}, {"x": 300, "y": 220}, {"x": 250, "y": 200}],
      "color": "#0066FF",
      "label": "Ana Kesi Çizgisi",
      "lineStyle": "dashed",
      "lineWidth": 4
    },
    {
      "points": [{"x": 250, "y": 200}, {"x": 230, "y": 180}, {"x": 220, "y": 160}],
      "color": "#0066FF",
      "label": "Flep Pedikülü",
      "lineStyle": "solid",
      "lineWidth": 3
    }
  ],
  "flap_areas": [
    {
      "points": [{"x": 250, "y": 200}, {"x": 350, "y": 210}, {"x": 380, "y": 280}, {"x": 400, "y": 300}],
      "color": "#00CC66",
      "label": "Flep Alanı",
      "fillOpacity": 0.25
    }
  ],
  "donor_area": {
    "points": [{"x": 180, "y": 160}, {"x": 280, "y": 170}, {"x": 300, "y": 210}, {"x": 220, "y": 200}],
    "color": "#FF8800",
    "label": "Donor Alan"
  },
  "arrows": [
    {
      "from": {"x": 320, "y": 250},
      "to": {"x": 450, "y": 350},
      "color": "#9900FF",
      "label": "Flep Rotasyonu"
    }
  ]
}

CERRAHİ ÇİZİM STANDARTLARI (ÇOK ÖNEMLİ):
1. incision_lines (Kesi Çizgileri):
   - Kesikli çizgi (dashed) kullan - tam olarak nereden kesileceğini göster
   - Natural skin tension lines (RSTL) boyunca planla
   - Birden fazla kesi çizgisi ekle: ana kesi, pedikül kesisi, modifikasyonlar
   - Koordinatlar SMOOTH ve AKICI olmalı - keskin köşeler yok, kavisli çizgiler
   - Her kesi çizgisi anatomik olarak mantıklı olmalı
   - Line width: 3-4px (kalın, belirgin)

2. flap_areas (Flep Alanları):
   - Defekt boyutunun 1.5-2 katı genişlikte planla
   - Yarı saydam (fillOpacity: 0.2-0.3) - altındaki anatomiyi göster
   - Koordinatlar defekt alanına YAKIN ve UYGUN olmalı
   - Birden fazla flep alanı varsa (bilobed, trilobed) hepsini çiz
   - Köşeler yumuşak, kavisli olmalı - anatomik yapıya uygun

3. donor_area (Donor Alan):
   - Flep alanından SONRA göster
   - Donor alanın nasıl kapatılacağını göster (direkt kapatma veya graft alanı)
   - Turuncu renk (#FF8800)

4. arrows (Yön Okları):
   - Flep hareket yönünü GÖSTER - defekt alanına doğru
   - Rotasyon, transpozisyon, advancement yönünü belirt
   - Birden fazla ok ekle - flep mobilizasyonunu açıkça göster

5. defect_area (Defekt Alanı):
   - Manuel işaretlenen konumu AYNEN kullan
   - Kırmızı, belirgin, dolu renk

GENEL KURALLAR:
- TÜM koordinatlar anatomik olarak MANTIKLI olmalı
- Çizgiler SMOOTH, AKICI, PROFESYONEL görünmeli
- Köşeler YUMUŞAK, kavisli - keskin köşeler yok
- Her flep tipine göre (transpozisyon, rotasyon, advancement, bilobed) uygun çizim
- Çizimler CERRAH TARZI - ameliyat planı gibi görünmeli
- Koordinatlar 0-1000 normalize, defekt konumuna göre HİZALANMIŞ
- Çok detaylı ol - her flep için 5-10+ koordinat noktası kullan

TÜM ÇIKTI TÜRKÇE OLMALI. Flep isimleri, açıklamalar, avantajlar, dikkat edilmesi gerekenler, cerrahi teknik - hepsi Türkçe olmalı.`;

export async function suggestFlaps(
  caseData: Case,
  visionSummary: VisionSummary,
  medicalSourcesContext?: string
): Promise<FlapSuggestion[]> {
  // Log defect location for debugging
  if (visionSummary.defect_location) {
    console.log('Defect location from vision:', visionSummary.defect_location);
  } else {
    console.warn('⚠️ No defect_location found in vision summary - drawings may not align correctly!');
  }
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key bulunamadı. Lütfen .env.local dosyasında OPENAI_API_KEY değişkenini ayarlayın.');
  }

  console.log('Starting flap suggestion analysis...');
  console.log('OpenAI API key present:', !!process.env.OPENAI_API_KEY);

  try {
    const userPrompt = `Bu olguyu analiz et ve lokal flep seçenekleri öner:

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
- Tespit edilen kritik yapılar: ${visionSummary.critical_structures.join(', ') || 'Yok'}
- Estetik zon: ${visionSummary.aesthetic_zone ? 'Evet' : 'Hayır'}
${visionSummary.defect_location ? `
KRİTİK - Defekt Konumu (KULLANICI TARAFINDAN MANUEL İŞARETLENMİŞ):
Bu koordinatlar kullanıcının manuel olarak işaretlediği lezyon konumudur. VİZYON MODEL'İN TAHMİNLERİNİ DİKKATE ALMA!

Koordinat sistemi: 0-1000 normalize (görüntünün görünen boyutuna göre)
- Defekt Merkezi: (${visionSummary.defect_location.center_x}, ${visionSummary.defect_location.center_y})
- Defekt Boyutu: ${visionSummary.defect_location.width} x ${visionSummary.defect_location.height}
${visionSummary.defect_location.points ? `- Defekt Poligon Noktaları (MANUEL, 0-1000 normalize): ${JSON.stringify(visionSummary.defect_location.points)}` : ''}

ÇOK ÖNEMLİ - KOORDINAT SİSTEMİ:
- Tüm koordinatlar 0-1000 arası normalize edilmiş (görüntünün görünen boyutuna göre)
- defect_area'nın koordinatları yukarıdaki defect_location.points'e TAM OLARAK uymalıdır
- Kesi çizgileri, flep alanları ve donor alan BU MANUEL İŞARETLENMİŞ konuma göre planlanmalıdır
- VİZYON MODEL'İN defect_location tahmini görmezden gelinmeli, SADECE bu manuel koordinatlar kullanılmalıdır!
- defect_location.points dizisindeki koordinatları AYNEN kullan - değiştirme!
` : ''}

  Uygun lokal flep seçeneklerini uygunluk skorları ve kategorileriyle birlikte öner.

EĞER BULABİLİRSEN, her flep tipi için YouTube'da cerrahi uygulama videosu linki ekle (video_link alanı).
Örnek: "https://www.youtube.com/watch?v=..." veya "https://youtu.be/..."
Bu videolar flep tekniğinin nasıl uygulandığını gösteren gerçek cerrahi videolar olmalı.
Eğer uygun video bulamazsan, video_link alanını boş string ("") olarak bırak.

${medicalSourcesContext || ''}

ÇOK ÖNEMLİ - flap_drawing için (MANUEL İŞARETLENMİŞ KONUM KULLANILMALI):
KOORDINAT SİSTEMİ: Tüm koordinatlar 0-1000 arası normalize (görüntünün görünen boyutuna göre)

1. Defekt alanını (defect_area) yukarıdaki MANUEL defect_location.points koordinatlarına TAM OLARAK göre çiz.
   - defect_location.points dizisini AYNEN KULLAN - bu kullanıcının manuel işaretlediği alandır!
   - Bu koordinatlar 0-1000 normalize, kullanıcı tarafından belirlenmiş, DEĞİŞTİRME!
   - Örnek: defect_area.points = defect_location.points (aynı koordinatlar)
   
2. Kesi çizgilerini (incision_lines) BU MANUEL İŞARETLENMİŞ defekt konumuna göre planla
   - Kesi çizgileri defekt alanının kenarlarından başlamalı (0-1000 normalize koordinatlar)
   - Tam olarak nereden kesileceğini göster (mavi, kesikli çizgi - dashed)
   - Koordinatlar defect_location.points'e göre hesaplanmalı
   
3. Flep alanlarını (flap_areas) BU MANUEL İŞARETLENMİŞ defekt konumuna göre yerleştir
   - Flep alanları defekt alanının yanında olmalı (0-1000 normalize koordinatlar)
   - Yeşil, yarı saydam
   
4. Donor alanı (donor_area) BU MANUEL İŞARETLENMİŞ defekt ve flep konumuna göre göster
   - Donor alan flep alanının arkasında olmalı (0-1000 normalize koordinatlar)
   - Turuncu
   
5. Flep hareket/rotasyon yönünü oklarla göster (arrows - mor)
   - Flep alanından defekt alanına doğru ok çiz (0-1000 normalize koordinatlar)

ÖNEMLİ KURALLAR:
- VİZYON MODEL'İN tahmin ettiği defekt konumunu DİKKATE ALMA!
- SADECE yukarıdaki MANUEL defect_location.points koordinatlarını kullan!
- defect_location.points = [{x, y}, {x, y}, {x, y}, {x, y}] - bu 4 noktayı AYNEN defect_area.points olarak kullan
- TÜM çizimler bu MANUEL koordinatlara göre hizalanmalıdır
- Koordinat sistemi: 0-1000 normalize (görüntünün görünen boyutuna göre)
- Çizimler anatomik olarak doğru, estetik, profesyonel ve cerrahi olarak uygulanabilir olmalı 

ÖNEMLİ: Her flep için flap_drawing objesi MUTLAKA şunları içermeli:
- defect_area: Defekt alanını göster (kırmızı, koordinatlar fotoğraftaki gerçek defekt alanına uygun)
- incision_lines: KESİ ÇİZGİLERİNİ göster (mavi, kesikli çizgi). Tam olarak nereden kesileceğini, kesi yolunu detaylı göster.
- flap_areas: Flep alanlarını göster (yeşil, yarı saydam)
- donor_area: Donor alanı göster (turuncu)
- arrows: Flep hareket/rotasyon yönünü göster (mor ok)

Çizimler anatomik olarak doğru, profesyonel ve estetik olmalı. Kesi çizgileri kesikli (dashed), flep alanları dolu (solid) olmalı.

TÜM YANIT TÜRKÇE OLMALI.`;

    console.log('Calling OpenAI Decision API...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 6000, // Increased for detailed surgical drawings with coordinates
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    console.log('OpenAI Decision API response received:', {
      hasChoices: !!response.choices,
      choicesLength: response.choices?.length || 0,
      finishReason: response.choices?.[0]?.finish_reason,
      hasContent: !!response.choices[0]?.message?.content,
      contentLength: response.choices[0]?.message?.content?.length || 0,
      contentPreview: response.choices[0]?.message?.content?.substring(0, 100),
    });

    const content = response.choices[0]?.message?.content;
    
    // Finish reason "stop" is actually success - but content might be empty
    if (!content || content.trim() === '') {
      console.error('No content in decision response (even though finish_reason might be stop):', {
        finishReason: response.choices[0]?.finish_reason,
        message: response.choices[0]?.message,
        fullResponse: JSON.stringify(response, null, 2).substring(0, 500),
      });
      throw new Error(`Decision model yanıt verdi ama içerik boş. Finish reason: ${response.choices[0]?.finish_reason || 'unknown'}`);
    }
    
    console.log('Decision content received successfully, length:', content.length);

    console.log('Decision response content received:', content.substring(0, 200) + '...');
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError: any) {
      console.error('JSON parse error in decision:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error(`Decision model yanıtı parse edilemedi: ${parseError.message}`);
    }
    
    const suggestions = parsed.flap_suggestions || [];
    
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      console.warn('No flap suggestions in response:', parsed);
      throw new Error("Decision model tarafından flep önerisi dönmedi. Lütfen tekrar deneyin.");
    }
    
    // Validate and normalize suggestions
    return suggestions.map((flap: any) => ({
      flap_name: flap.flap_name || 'Bilinmeyen flep',
      suitability_score: Math.max(0, Math.min(100, flap.suitability_score || 50)),
      category: ['en_uygun', 'uygun', 'alternatif'].includes(flap.category) 
        ? flap.category 
        : 'alternatif',
      why: flap.why || 'Açıklama sağlanmadı',
      advantages: Array.isArray(flap.advantages) ? flap.advantages : [],
      cautions: Array.isArray(flap.cautions) ? flap.cautions : [],
      alternatives: Array.isArray(flap.alternatives) ? flap.alternatives : [],
      aesthetic_risk: ['düşük', 'orta', 'yüksek'].includes(flap.aesthetic_risk)
        ? flap.aesthetic_risk
        : 'orta',
      surgical_technique: flap.surgical_technique || flap.cerrahi_teknik || undefined,
      video_link: flap.video_link || flap.youtube_link || undefined,
      flap_drawing: (() => {
        // CRITICAL: Always use defect_location.points for defect_area if it exists (manual annotation)
        // This ensures manual annotation is ALWAYS used, not AI's own detection
        const manualDefectArea = visionSummary.defect_location?.points ? {
          points: visionSummary.defect_location.points,
          color: '#FF0000',
          label: 'Defekt Alanı (Manuel)',
        } : undefined;
        
        // If AI provided flap_drawing, use it but FORCE defect_area to use manual annotation
        if (flap.flap_drawing) {
          return {
            // ALWAYS use manual defect_location for defect_area - user's manual drawing takes priority
            defect_area: manualDefectArea || flap.flap_drawing.defect_area || undefined,
            incision_lines: Array.isArray(flap.flap_drawing.incision_lines) ? flap.flap_drawing.incision_lines : [],
            flap_areas: Array.isArray(flap.flap_drawing.flap_areas) ? flap.flap_drawing.flap_areas : [],
            donor_area: flap.flap_drawing.donor_area || undefined,
            arrows: Array.isArray(flap.flap_drawing.arrows) ? flap.flap_drawing.arrows : [],
          };
        }
        
        // If no flap_drawing from AI, create minimal one with manual defect location
        if (manualDefectArea) {
          return {
            defect_area: manualDefectArea,
            incision_lines: [],
            flap_areas: [],
            arrows: [],
          };
        }
        
        return undefined;
      })(),
    }));
  } catch (error: any) {
    console.error('Decision suggestion error:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      statusCode: error?.statusCode,
      stack: error?.stack,
      response: error?.response,
    });
    
    // Handle OpenAI API key errors specifically
    const errorMessage = error?.message || '';
    const errorStatus = error?.status || error?.statusCode;
    
    if (errorStatus === 401 || errorMessage.includes('Incorrect API key') || errorMessage.includes('401')) {
      throw new Error(
        'OpenAI API key geçersiz veya eksik. ' +
        'Lütfen Vercel Dashboard\'da OPENAI_API_KEY environment variable\'ını kontrol edin. ' +
        'API key\'inizi https://platform.openai.com/account/api-keys adresinden alabilirsiniz.'
      );
    }
    
    // Handle quota/rate limit errors
    if (errorStatus === 429 || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      throw new Error(
        'OpenAI API quota/rate limit aşıldı. ' +
        'Lütfen https://platform.openai.com/account/billing adresinden quota durumunuzu kontrol edin.'
      );
    }
    
    // Re-throw error instead of returning fallback so orchestrator can handle it properly
    throw new Error(`Flep önerisi oluşturulamadı: ${errorMessage || 'Bilinmeyen hata'}`);
  }
}

