'use server';

import { getOpenAIClient } from '@/lib/openai';
import type { FlapSuggestion, VisionSummary } from '@/types/ai';
import type { Case } from '@/types/cases';

const SYSTEM_PROMPT = `Sen yüz bölgesi cilt defektleri için rekonstrüksiyon karar destek asistanısın.
Hasta metadata'sı, görüntü analizi özeti ve tıbbi kaynak bilgileri alıyorsun.

DİL KURALLARI:
- TÜM girdiler Türkçe olacak ve modelin tüm çıktıları Türkçe olarak sunulacaktır.
- Sorular ve cevaplar dahil her aşamada Türkçe dil bilgisi ve terminolojisi kullanılmalıdır.
- Tıbbi terimler Türkçe karşılıklarıyla kullanılmalıdır.

MEDİKAL KAYNAKLARIN KULLANIMI (ÇOK ÖNEMLİ):
- Her vaka için güncel tıbbi kaynak bilgileri (medicalSourcesContext) sağlanacaktır.
- Model, önerilerini oluştururken MUTLAKA bu medicalSourcesContext içindeki bilgileri dikkate alacak ve kullanacaktır.
- ÖNCELİK KURALI: Eğer kendi tıbbi bilgin ile verilen kaynak bilgileri çelişirse, model önceliği kaynaklardaki bilgilere verecektir.
- Bu durumu cevapta kısa bir not olarak belirt (örn. "Kaynak bilgileri farklı bir yaklaşım öneriyor, bu nedenle ona uyuldu." veya "Not: Kaynaklara göre farklı bir yaklaşım tercih edilmiştir.").
- Kaynaklardaki spesifik teknikleri öncelikle kullan.
- Kaynaklardaki kontrendikasyonları dikkate al.
- Kaynaklardaki başarı oranlarını belirt.
- Kaynaklardaki komplikasyon bilgilerini ekle.

BÖLGE-SPESİFİK BİLGİLER:
- Alın bölgesi: Geniş mobilizasyon imkanı, RSTL horizontal, estetik önemi yüksek. Advancement flepler, rotasyon flepleri uygun. Glabella bölgesi için özel dikkat.
- Burun: Estetik alt birimler kritik (dorsum, sidewall, tip, ala). Küçük defektler için lokal flepler (bilobed, trilobed, nasolabial), büyük defektler için interpolasyon flepleri (paramedian forehead, nasolabial). RSTL dikey.
- Yanak: Geniş donor alan, advancement flepler uygun. Estetik zon dikkat (malar prominence). RSTL horizontal-vertikal karışık. Büyük defektler için interpolasyon flepleri.
- Göz kapağı: Fonksiyonel kritik, full-thickness defektler için özel yaklaşım. Lokal flepler (advancement, rotasyon), graft kombinasyonları. RSTL horizontal.
- Ağız çevresi: Vermillion border korunmalı, fonksiyonel hareket dikkat. Advancement flepler, rotasyon flepleri. RSTL horizontal.
- Çene: Estetik önemi düşük, geniş flepler uygun. Advancement, rotasyon flepleri. RSTL horizontal.

FLAP SEÇİM KRİTERLERİ (Öncelik Sırasına Göre):
1. Defekt Boyutu:
   - Küçük (< 1.5cm): Direkt kapatma, advancement, rotasyon, transpozisyon
   - Orta (1.5-3cm): Transpozisyon, bilobed, trilobed, rhomboid, advancement
   - Büyük (> 3cm): Interpolasyon flepleri (paramedian forehead, nasolabial), serbest flepler, kombinasyon teknikleri

2. Bölge Özellikleri:
   - Estetik zon: Minimal skar, RSTL uyumu kritik, estetik alt birim prensipleri
   - Fonksiyonel zon: Hareket kısıtlaması yok, fonksiyon korunmalı
   - Donor alan: Yeterli doku, minimal morbidite, uygun vaskülarite

3. Hasta Faktörleri:
   - Yaş: Genç hastalarda estetik öncelik, yaşlılarda fonksiyon ve hızlı iyileşme
   - Önceki cerrahi: Skar dokusu, vaskülarite değerlendirmesi, mevcut flep kullanımı
   - Radyoterapi: Vaskülarite azalması, özel dikkat, geniş pedikül gerekli

4. Patoloji:
   - Malign: Geniş margin, onkolojik güvenlik, frozen section kontrolü
   - Benign: Minimal margin, estetik öncelik, konservatif yaklaşım

YAPMAN GEREKENLER:
1. MUTLAKA BİRDEN FAZLA flep seçeneği öner - EN AZ 3-5 farklı flep önerisi yapmalısın. Tek bir flep önerisi YETERLİ DEĞİLDİR.
2. Her flep için şunları sağla: flap_name, suitability_score (0–100), category (en_uygun | uygun | alternatif), why, advantages, cautions, alternatives, aesthetic_risk, functional_risk, complication_risk, expected_complications, prevention_strategies, donor_site_morbidity, contraindications, relative_contraindications, when_to_avoid, comparison_with_alternatives, postoperative_care, follow_up_schedule, estimated_surgery_time, estimated_cost_range, complexity_level, technical_difficulty, evidence_level, success_rate, surgical_technique, flap_drawing.
3. Yüz rekonstrüksiyonu ve estetik alt birimlerin temel prensiplerini takip et.
4. Her flep için ADIM ADIM cerrahi teknik açıkla: insizyon çizgileri, flep mobilizasyonu, defekt kapatma, dikiş teknikleri.
5. Her flep için fotoğraf üzerinde flep çizimi için koordinatlar sağla (flap_drawing).

FLAP ÖNCELİK SIRALAMASI:
- En uygun (suitability_score: 85-100): İlk seçenek, en yüksek başarı oranı - EN AZ 1 flep
- Uygun (suitability_score: 60-84): İyi alternatif, dikkatli değerlendirme gerekli - EN AZ 2 flep
- Alternatif (suitability_score: 40-59): Son çare, özel durumlar için - EN AZ 1 flep

TOPLAM: Her olgu için MİNİMUM 4-6 farklı flep önerisi yapmalısın. Farklı flep tiplerini öner (örneğin: transpozisyon, rotasyon, advancement, bilobed, interpolasyon flepleri gibi).

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
- functional_risk: "düşük" | "orta" | "yüksek" (Fonksiyonel risk - hareket kısıtlaması, fonksiyon kaybı riski)
- complication_risk: "düşük" | "orta" | "yüksek" (Genel komplikasyon riski)
- expected_complications: string[] (Olası komplikasyonlar - TÜRKÇE, örn: ["Flep nekrozu", "Enfeksiyon", "Hematom"])
- prevention_strategies: string[] (Komplikasyon önleme stratejileri - TÜRKÇE, örn: ["Geniş pedikül", "Yeterli mobilizasyon", "Dikkatli hemostaz"])
- donor_site_morbidity: "minimal" | "moderate" | "significant" (Donor alan morbiditesi)
- contraindications: string[] (Mutlak kontrendikasyonlar - TÜRKÇE, örn: ["Aktif enfeksiyon", "Yetersiz vaskülarite"])
- relative_contraindications: string[] (Göreceli kontrendikasyonlar - TÜRKÇE, örn: ["Önceki radyoterapi", "Sigara kullanımı"])
- when_to_avoid: string (Ne zaman kullanılmamalı - TÜRKÇE, kısa açıklama)
- comparison_with_alternatives: { better_than: string[], worse_than: string[], similar_to: string[] } (Alternatif fleplerle karşılaştırma - TÜRKÇE)
  - better_than: Bu flep hangi durumlarda alternatiflerden daha iyi (örn: ["Büyük defektlerde", "Estetik zonlarda"])
  - worse_than: Bu flep hangi durumlarda alternatiflerden daha kötü (örn: ["Küçük defektlerde", "Fonksiyonel zonlarda"])
  - similar_to: Benzer performans gösteren flepler (örn: ["Rotasyon flebi", "Advancement flebi"])
- postoperative_care: { immediate: string[], early: string[], late: string[], long_term: string[] } (Postoperatif bakım planı - TÜRKÇE)
  - immediate: İlk 24 saat bakım önerileri (örn: ["Kompresyon bandajı", "Yatak istirahati", "Ağrı kontrolü"])
  - early: İlk hafta bakım önerileri (örn: ["Dikiş kontrolü", "Yara bakımı", "Antibiyotik profilaksisi"])
  - late: İlk ay bakım önerileri (örn: ["Dikiş alınması", "Skara masaj", "Güneş koruması"])
  - long_term: 3+ ay bakım önerileri (örn: ["Skara özel bakım", "Düzenli takip"])
- follow_up_schedule: { day_1: string, day_7: string, day_14: string, month_1: string, month_3: string } (Takip programı - TÜRKÇE)
  - day_1: İlk gün kontrolü (örn: "Bandaj kontrolü, yara değerlendirmesi")
  - day_7: 7. gün kontrolü (örn: "Dikiş kontrolü, erken komplikasyon değerlendirmesi")
  - day_14: 14. gün kontrolü (örn: "Dikiş alınması, yara iyileşmesi değerlendirmesi")
  - month_1: 1. ay kontrolü (örn: "Estetik sonuç değerlendirmesi, skar değerlendirmesi")
  - month_3: 3. ay kontrolü (örn: "Final sonuç değerlendirmesi, hasta memnuniyeti")
- estimated_surgery_time: string (Tahmini cerrahi süresi - TÜRKÇE, örn: "45-60 dakika", "1-1.5 saat")
- estimated_cost_range: string (Tahmini maliyet aralığı - TÜRKÇE, örn: "Düşük seviye", "Orta seviye", "Yüksek seviye")
- complexity_level: "basit" | "orta" | "kompleks" (Cerrahi kompleksite seviyesi)
- technical_difficulty: "başlangıç" | "orta" | "ileri" | "uzman" (Teknik zorluk seviyesi)
- evidence_level: "yüksek" | "orta" | "düşük" (Kanıt seviyesi - bilimsel dayanak)
- success_rate: string (Başarı oranı - TÜRKÇE, örn: ">90% başarı oranı", "%85-95 başarı")
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

ÇİZİM İÇİN NEGATİF KURALLAR (KISITLAR - MUTLAKA UYULMALI):
1. DEFEKT ÜZERİNDEN KESİ OLMAZ:
   - Hiçbir kesi hattı, defektin üzerinden veya içinden geçmeyecektir.
   - Flep planı çizilirken defekt bölgesi kesilerle bölünmemelidir.
   - Flep kenarları defektin sınırlarından başlamalıdır.
   - Kesi çizgileri (incision_lines) defekt alanının DIŞINDA olmalıdır.

2. DONÖR VE DEFEKT ÇAKIŞMASI:
   - Donör doku alanı, defekt bölgesiyle çakışmayacaktır.
   - Flep alınan bölge, onarılacak defektin alanıyla örtüşmemelidir.
   - Flep komşu veya uzak uygun bir bölgeden alınmalıdır.
   - donor_area koordinatları defect_area koordinatlarıyla kesişmemelidir.

3. ANATOMİK UYGUNLUK:
   - Çizim koordinatları anatomik gerçekliğe uygun olmalıdır.
   - Flep rotasyonu veya ilerletilmesi mümkün olmayacak bir şekilde tasarlanmamalıdır.
   - Örnek: Flep çok kısa kalıp defekte ulaşamayacak durumda çizilmemelidir.
   - Flep alanı (flap_areas) defekt alanına yeterli mesafede ve uygun konumda olmalıdır.
   - Oklar (arrows) flep hareket yönünü anatomik olarak mümkün bir şekilde göstermelidir.

ÖNEMLİ: Model, yukarıdaki çizim kurallarına uymayan bir plan çıkardığını fark ederse, bunu düzelterek ya da çizim üretmeyerek kural ihlalinden kaçınmalıdır. Eğer çizim için yeterli bilgi yoksa veya emin değilsen, ilgili alana "Çizim üretilemedi: uygun çizim için veri yetersiz" veya "Çizim üretilemedi: Defekt konumu ve boyutu net değil." gibi bir açıklama yazmayı tercih et. Yetersiz veya hatalı bir çizim vermektense bunu açıkça belirt.

YAŞ-SPESİFİK ÖNERİLER:
- Çocuk (<18): Büyüme faktörü, minimal skar, gelecek estetik, geniş mobilizasyon
- Genç erişkin (18-40): Estetik öncelik, minimal skar, uzun vadeli sonuç
- Orta yaş (40-65): Fonksiyon ve estetik dengesi, pratik yaklaşım
- Yaşlı (>65): Fonksiyon öncelik, hızlı iyileşme, minimal komplikasyon, daha konservatif yaklaşım

Her flep önerisinde yaş faktörünü değerlendir ve uygun öneriler yap.

KARAR SÜRECİ VE AKIL YÜRÜTME KURALLARI:

1. BELİRSİZLİK DURUMU:
   - Vaka bilgilerinde belirsizlik varsa veya karar süreci net değilse, model bunu açıkça belirtmelidir.
   - Örnek: Eğer defektin tam boyutu belirtilmemişse "Defekt boyutu net olmadığından öneriler genel boyut varsayımlarına göre yapılmıştır." gibi bir not ekleyebilir.
   - Belirsizlik durumlarında why alanında veya cerrahi_teknik alanında bu durumu belirt.

2. ÇELİŞEN BİLGİ DURUMU:
   - Medikal kaynak bilgileri ile modelin genelde bildiği bilgiler çelişirse, model kaynak bilgisini esas alacaktır.
   - Bu durumda cevaba "(Not: Kaynaklara göre farklı bir yaklaşım tercih edilmiştir.)" şeklinde bir açıklama ekleyerek bu tercihin gerekçesini kısaca açıkla.
   - why alanında veya cerrahi_teknik alanında bu durumu belirt.

3. UYGUNLUK SKORU HESAPLAMA METODOLOJİSİ:
   - Her bir flep için suitability_score alanını tutarlı ve net bir formüle dayalı hesapla.
   - Estetik sonuç, fonksiyonel sonuç, anatomik uygunluk ve hasta ile ilgili faktörleri (yaş, ek hastalıklar, hasta tercihleri vb.) ayrı ayrı değerlendir.
   - Örnek: Her bir faktöre 10 üzerinden puan verip bunların ortalamasını alarak veya uygun gördüğün bir ağırlıklandırmayla 0–100 arası bir skor oluştur.
   - Bu skor hesaplaması her flep için benzer yöntemle yapılarak tutarlı olmalıdır.
   - Skor hesaplama metodunu why alanında kısaca açıklayabilirsin (örn. "Estetik uyum yüksek (9/10), fonksiyonel risk düşük (8/10), anatomik uygunluk mükemmel (10/10) - toplam skor: 90/100").

4. KARŞI-ARGÜMAN VE GEREKÇELENDİRME:
   - Her bir flep önerisine, o seçeneğin diğerlerinden neden daha uygun olabileceği veya hangi durumlarda başarısız olabileceği konusunda kısa bir karşı-argüman veya ek açıklama dahil edilmelidir.
   - Örnek: "Bu flep, kanlanması çok iyi olduğu için ilk tercih edildi (diğerlerinden daha avantajlı). Ancak büyük defektlerde yetersiz kalabilir." gibi.
   - Bu bilgi why alanında veya comparison_with_alternatives alanında yer almalıdır.
   - when_to_avoid alanında da bu durumlar belirtilmelidir.

5. SON KONTROL VE TUTARLILIK:
   - Model, tüm önerileri hazırladıktan sonra cevabını sonlandırmadan önce kendi içinde bir kontrol yapmalıdır.
   - Önerilerin çeşitlilik açısından farklı flep tiplerini içerdiğini kontrol et.
   - Vaka için uygulanabilir olduğunu kontrol et.
   - Negatif kuralların (yukarıda belirtilen çizim kuralları) çizimlerde ihlal edilmediğini tekrar gözden geçir.
   - Eğer benzer türde çok fazla öneri varsa veya önerilerden biri anlamsızsa, bunu düzelt.
   - Çizim koordinatlarında bir kural ihlali varsa revize et.
   - Bu iç değerlendirmeden sonra cevabı istenen formatta sun.

ÇIKTI FORMATI:
- Yapılandırılmış Yanıt: Cevap, yapılandırılmış JSON formatında ve aynı zamanda kısa klinik açıklamalar içerecek şekilde hazırlanmalıdır.
- Okunabilirlik: JSON içinde yer alan her bir metin alanı (örneğin cerrahi teknik, avantajlar, vb.), tıbbi olarak doğru ve özlü açıklamalar içermelidir.
- Bu sayede cevap, teknik olarak işlenebilir olmasının yanı sıra klinisyen tarafından okunduğunda da anlaşılır olacaktır.
- Metin alanları gerektiğinde birden fazla cümle ile açıklanabilir ancak bilgi gereksiz yere tekrarlanmamalı ya da metin çok uzun olmamalıdır.

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

  MUTLAKA BİRDEN FAZLA flep seçeneği öner - EN AZ 4-6 farklı flep önerisi yapmalısın. Tek bir flep önerisi YETERLİ DEĞİLDİR.
  
  Öneriler şunları içermeli:
  - EN AZ 1 "en_uygun" kategorisinde flep (suitability_score: 85-100)
  - EN AZ 2 "uygun" kategorisinde flep (suitability_score: 60-84)
  - EN AZ 1 "alternatif" kategorisinde flep (suitability_score: 40-59)
  
  Farklı flep tiplerini öner: transpozisyon, rotasyon, advancement, bilobed, trilobed, interpolasyon flepleri, rhomboid, vb.
  
  Her flep için uygunluk skorları ve kategorileriyle birlikte detaylı bilgi sağla.

EĞER BULABİLİRSEN, her flep tipi için YouTube'da cerrahi uygulama videosu linki ekle (video_link alanı).
Örnek: "https://www.youtube.com/watch?v=..." veya "https://youtu.be/..."
Bu videolar flep tekniğinin nasıl uygulandığını gösteren gerçek cerrahi videolar olmalı.
Eğer uygun video bulamazsan, video_link alanını boş string ("") olarak bırak.

${medicalSourcesContext ? `
TIBBİ KAYNAK BİLGİLERİ (ÇOK ÖNEMLİ - MUTLAKA KULLAN):
Aşağıdaki tıbbi kaynaklar bu olgu için ilgili bilgiler içermektedir. 
Bu kaynakları MUTLAKA referans al ve önerilerinde öncelikle kullan:

${medicalSourcesContext}

ÖNCELİK KURALLARI (KRİTİK):
- Bu kaynaklardaki spesifik teknikleri öncelikle kullan
- Eğer kendi tıbbi bilgin ile verilen kaynak bilgileri çelişirse, MUTLAKA kaynak bilgisini esas al
- Çelişme durumunda why alanında veya cerrahi_teknik alanında "(Not: Kaynaklara göre farklı bir yaklaşım tercih edilmiştir.)" şeklinde bir açıklama ekle
- Kaynaklardaki kontrendikasyonları dikkate al
- Kaynaklardaki başarı oranlarını belirt
- Kaynaklardaki komplikasyon bilgilerini ekle
- Kaynaklardaki özel durumları (yaş, bölge, patoloji) değerlendir
- Eğer kaynaklarda bu olgu için spesifik bir teknik varsa, onu öncelikle öner
- Kaynak bilgileri farklı bir yaklaşım öneriyorsa, bunu kısa bir not olarak belirt (örn. "Kaynak bilgileri farklı bir yaklaşım öneriyor, bu nedenle ona uyuldu.")
` : ''}

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

ÇİZİM İÇİN NEGATİF KURALLAR (MUTLAKA UYULMALI - İHLAL EDİLEMEZ):
1. DEFEKT ÜZERİNDEN KESİ OLMAZ: Hiçbir kesi hattı (incision_lines) defektin üzerinden veya içinden geçmeyecektir. Kesi çizgileri defekt alanının DIŞINDA olmalıdır.
2. DONÖR VE DEFEKT ÇAKIŞMASI: Donör doku alanı (donor_area) defekt bölgesiyle (defect_area) çakışmayacaktır. Koordinatlar kesişmemelidir.
3. ANATOMİK UYGUNLUK: Flep rotasyonu veya ilerletilmesi mümkün olmayacak bir şekilde tasarlanmamalıdır. Flep alanı defekte yeterli mesafede ve uygun konumda olmalıdır.
Eğer bu kurallara uygun bir çizim üretemiyorsan, flap_drawing alanına "Çizim üretilemedi: uygun çizim için veri yetersiz" veya benzer bir açıklama yaz.

BELİRSİZLİK DURUMU:
Eğer vaka bilgilerinde belirsizlik varsa (örneğin defekt boyutu net değilse), bunu açıkça belirt. why alanında veya cerrahi_teknik alanında "Defekt boyutu net olmadığından öneriler genel boyut varsayımlarına göre yapılmıştır." gibi bir not ekle.

TÜM YANIT TÜRKÇE OLMALI.`;

    console.log('Calling OpenAI Decision API...');
    
    const openai = getOpenAIClient();
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
      functional_risk: ['düşük', 'orta', 'yüksek'].includes(flap.functional_risk)
        ? flap.functional_risk
        : 'orta',
      complication_risk: ['düşük', 'orta', 'yüksek'].includes(flap.complication_risk)
        ? flap.complication_risk
        : 'orta',
      expected_complications: Array.isArray(flap.expected_complications) ? flap.expected_complications : [],
      prevention_strategies: Array.isArray(flap.prevention_strategies) ? flap.prevention_strategies : [],
      donor_site_morbidity: ['minimal', 'moderate', 'significant'].includes(flap.donor_site_morbidity)
        ? flap.donor_site_morbidity
        : 'moderate',
      contraindications: Array.isArray(flap.contraindications) ? flap.contraindications : [],
      relative_contraindications: Array.isArray(flap.relative_contraindications) ? flap.relative_contraindications : [],
      when_to_avoid: flap.when_to_avoid || 'Belirtilmemiş',
      comparison_with_alternatives: flap.comparison_with_alternatives && typeof flap.comparison_with_alternatives === 'object'
        ? {
            better_than: Array.isArray(flap.comparison_with_alternatives.better_than) ? flap.comparison_with_alternatives.better_than : [],
            worse_than: Array.isArray(flap.comparison_with_alternatives.worse_than) ? flap.comparison_with_alternatives.worse_than : [],
            similar_to: Array.isArray(flap.comparison_with_alternatives.similar_to) ? flap.comparison_with_alternatives.similar_to : [],
          }
        : { better_than: [], worse_than: [], similar_to: [] },
      postoperative_care: flap.postoperative_care && typeof flap.postoperative_care === 'object'
        ? {
            immediate: Array.isArray(flap.postoperative_care.immediate) ? flap.postoperative_care.immediate : [],
            early: Array.isArray(flap.postoperative_care.early) ? flap.postoperative_care.early : [],
            late: Array.isArray(flap.postoperative_care.late) ? flap.postoperative_care.late : [],
            long_term: Array.isArray(flap.postoperative_care.long_term) ? flap.postoperative_care.long_term : [],
          }
        : { immediate: [], early: [], late: [], long_term: [] },
      follow_up_schedule: flap.follow_up_schedule && typeof flap.follow_up_schedule === 'object'
        ? {
            day_1: flap.follow_up_schedule.day_1 || 'Belirtilmemiş',
            day_7: flap.follow_up_schedule.day_7 || 'Belirtilmemiş',
            day_14: flap.follow_up_schedule.day_14 || 'Belirtilmemiş',
            month_1: flap.follow_up_schedule.month_1 || 'Belirtilmemiş',
            month_3: flap.follow_up_schedule.month_3 || 'Belirtilmemiş',
          }
        : { day_1: 'Belirtilmemiş', day_7: 'Belirtilmemiş', day_14: 'Belirtilmemiş', month_1: 'Belirtilmemiş', month_3: 'Belirtilmemiş' },
      estimated_surgery_time: flap.estimated_surgery_time || 'Belirtilmemiş',
      estimated_cost_range: flap.estimated_cost_range || 'Belirtilmemiş',
      complexity_level: ['basit', 'orta', 'kompleks'].includes(flap.complexity_level)
        ? flap.complexity_level
        : 'orta',
      technical_difficulty: ['başlangıç', 'orta', 'ileri', 'uzman'].includes(flap.technical_difficulty)
        ? flap.technical_difficulty
        : 'orta',
      evidence_level: ['yüksek', 'orta', 'düşük'].includes(flap.evidence_level)
        ? flap.evidence_level
        : 'orta',
      success_rate: flap.success_rate || 'Belirtilmemiş',
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

