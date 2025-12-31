# Flap Değerlendirme Algoritması - Detaylı Teknik Dokümantasyon

## 📋 İçindekiler
1. [Genel Mimari](#genel-mimari)
2. [Algoritma Akışı](#algoritma-akışı)
3. [Adım 1: Görüntü Analizi (Vision Analysis)](#adım-1-görüntü-analizi)
4. [Adım 2: Flap Önerisi (Decision Making)](#adım-2-flap-önerisi)
5. [Adım 3: Güvenlik İncelemesi (Safety Review)](#adım-3-güvenlik-incelemesi)
6. [Koordinat Sistemi](#koordinat-sistemi)
7. [Prompt Mühendisliği](#prompt-mühendisliği)
8. [Veri Yapıları](#veri-yapıları)
9. [Hata Yönetimi](#hata-yönetimi)

---

## Genel Mimari

### Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    Kullanıcı Arayüzü                        │
│              (Case Detail Page / Analyze Button)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              API Endpoint: /api/cases/[id]/analyze          │
│                      (route.ts)                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Orchestrator: runCaseAnalysis()                │
│                    (orchestrator.ts)                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Step 1:    │  │   Step 2:    │  │   Step 3:    │     │
│  │   Vision     │→ │   Flap       │→ │   Safety     │     │
│  │   Analysis   │  │   Decision   │  │   Review    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Veritabanı (Supabase)                     │
│              (ai_results tablosuna kayıt)                    │
└─────────────────────────────────────────────────────────────┘
```

### Teknoloji Stack

- **AI Modelleri:**
  - OpenAI GPT-4o (Vision + Decision)
  - Anthropic Claude 3.5 Sonnet (Safety Review)

- **Backend:**
  - Next.js 14+ (Server Actions)
  - TypeScript
  - Supabase (PostgreSQL)

- **Koordinat Sistemi:**
  - Normalize edilmiş koordinatlar (0-1000)
  - Canvas-based rendering

---

## Algoritma Akışı

### Yüksek Seviye Akış Diyagramı

```
START
  │
  ├─► Case ID ve User ID doğrulama
  │
  ├─► Pre-op fotoğraf çekme (Supabase)
  │
  ├─► Manuel annotation kontrolü
  │   ├─► VAR: Manuel annotation kullan (Vision model atla)
  │   └─► YOK: Vision model çalıştır
  │
  ├─► [STEP 1] Vision Analysis
  │   ├─► Görüntü analizi (GPT-4o Vision)
  │   ├─► Bölge tespiti
  │   ├─► Boyut tahmini
  │   ├─► Derinlik kategorisi
  │   ├─► Kritik yapılar
  │   └─► Defekt konumu koordinatları
  │
  ├─► [STEP 1.5] Tıbbi Kaynak Entegrasyonu
  │   ├─► İlgili medical_sources sorgusu
  │   └─► Prompt'a ekleme
  │
  ├─► [STEP 2] Flap Decision
  │   ├─► GPT-4o Decision API çağrısı
  │   ├─► 4-6 flep önerisi üretimi
  │   ├─► Her flep için detaylı bilgi
  │   └─► Cerrahi çizim koordinatları
  │
  ├─► [STEP 3] Safety Review
  │   ├─► Claude 3.5 Sonnet güvenlik kontrolü
  │   ├─► Hallucination risk değerlendirmesi
  │   └─► Güvenlik yorumları
  │
  ├─► Veritabanına kayıt (UPSERT)
  │
  └─► Sonuç döndürme
END
```

---

## Adım 1: Görüntü Analizi (Vision Analysis)

### Dosya: `lib/ai/vision.ts`

### Fonksiyon: `analyzeVision()`

#### Girdiler:
```typescript
{
  imageUrl: string,           // Pre-op fotoğraf URL'i (Supabase Storage)
  caseMetadata: Partial<Case>  // Olgu metadata'sı
}
```

#### İşlem Adımları:

**1. API Key Kontrolü**
```typescript
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OpenAI API key bulunamadı...');
}
```

**2. Görüntü Erişilebilirlik Kontrolü**
```typescript
const imageCheck = await fetch(imageUrl, { method: 'HEAD' });
if (!imageCheck.ok) {
  throw new Error('Image URL erişilemiyor...');
}
```

**3. Görüntüyü Base64'e Çevirme**
```typescript
const imageResponse = await fetch(imageUrl);
const imageBuffer = await imageResponse.arrayBuffer();
const base64String = Buffer.from(imageBuffer).toString('base64');
const imageContent = `data:${contentType};base64,${base64String}`;
```

**4. OpenAI Vision API Çağrısı**

**System Prompt:**
```
You are a medical-grade computer vision assistant.
Input: a pre-operative clinical photograph of a facial skin defect after tumor excision, plus structured metadata.

Your tasks:
1. Identify the anatomical region of the defect on the face.
2. Estimate defect width and height in millimeters using metadata as context.
3. Estimate depth category: skin only / skin+subcutis / involving muscle / involving mucosa.
4. List nearby critical structures (alar rim, eyelid margin, lip commissure, etc.).
5. Classify whether this is a high-aesthetic-impact zone.
6. CRITICAL: Detect the EXACT location of the defect on the image and provide coordinates.
```

**User Prompt Örneği:**
```
Analyze this pre-operative photograph of a facial skin defect.

Case Metadata:
- Region: Burun
- Width (mm): 15
- Height (mm): 12
- Depth: skin+subcutis
- Critical structures mentioned: Alar rim, Nasal tip
- High aesthetic zone: Yes

CRITICAL TASK: 
Please identify the EXACT location of the defect/lesion on the image. Provide defect_location with:
- center_x, center_y: The center coordinates of the defect (normalized 0-1000)
- width, height: The size of the defect (normalized 0-1000)
- points: Array of polygon points outlining the defect boundary (normalized 0-1000)
```

**API Çağrısı:**
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        { type: 'text', text: userPrompt },
        {
          type: 'image_url',
          image_url: { url: imageContent }, // Base64 data URI
        },
      ],
    },
  ],
  max_tokens: 1500,
  response_format: { type: 'json_object' },
});
```

#### Çıktı: `VisionSummary`

```typescript
interface VisionSummary {
  detected_region: string;              // "Burun", "Yanak", vb.
  estimated_width_mm: number;            // Milimetre cinsinden genişlik
  estimated_height_mm: number;           // Milimetre cinsinden yükseklik
  depth_estimation: string;              // "skin", "skin+subcutis", vb.
  critical_structures: string[];         // ["Alar rim", "Nasal tip"]
  aesthetic_zone: boolean;               // true/false
  defect_location?: {                   // Opsiyonel: Manuel annotation varsa
    center_x: number;                    // 0-1000 normalize
    center_y: number;                    // 0-1000 normalize
    width: number;                       // 0-1000 normalize
    height: number;                      // 0-1000 normalize
    points?: Array<{ x: number; y: number }>; // Poligon noktaları
  };
}
```

### Manuel Annotation Önceliği

**Dosya: `lib/ai/orchestrator.ts`**

Eğer kullanıcı manuel olarak defekt alanını işaretlemişse:

```typescript
if (manualAnnotation) {
  // Vision model ATLANIR
  // Manuel annotation kullanılır
  
  const shape = manualAnnotation.shape || 'rectangle';
  
  if (shape === 'circle') {
    // Daire: merkez ve yarıçap hesapla
    centerX = manualAnnotation.x + (manualAnnotation.width / 2);
    centerY = manualAnnotation.y + (manualAnnotation.height / 2);
    const radius = Math.max(Math.abs(manualAnnotation.width), 
                           Math.abs(manualAnnotation.height)) / 2;
    
    // 16 noktalı poligon oluştur
    const numPoints = 16;
    points = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
  } else {
    // Dikdörtgen: 4 köşe noktası
    points = [
      { x: manualAnnotation.x, y: manualAnnotation.y },
      { x: manualAnnotation.x + manualAnnotation.width, y: manualAnnotation.y },
      { x: manualAnnotation.x + manualAnnotation.width, 
        y: manualAnnotation.y + manualAnnotation.height },
      { x: manualAnnotation.x, 
        y: manualAnnotation.y + manualAnnotation.height },
    ];
  }
  
  // Vision summary oluştur (metadata + manuel annotation)
  visionSummary = {
    detected_region: caseData.region || 'Belirtilmemiş',
    estimated_width_mm: caseData.width_mm || 0,
    estimated_height_mm: caseData.height_mm || 0,
    depth_estimation: caseData.depth || 'Belirtilmemiş',
    critical_structures: caseData.critical_structures || [],
    aesthetic_zone: caseData.high_aesthetic_zone ?? false,
    defect_location: {
      center_x: centerX,
      center_y: centerY,
      width: width,
      height: height,
      points: points,
    },
  };
}
```

---

## Adım 2: Flap Önerisi (Decision Making)

### Dosya: `lib/ai/decision.ts`

### Fonksiyon: `suggestFlaps()`

#### Girdiler:
```typescript
{
  caseData: Case,                    // Tam olgu verisi
  visionSummary: VisionSummary,       // Vision analiz sonucu
  medicalSourcesContext?: string      // İlgili tıbbi kaynaklar (opsiyonel)
}
```

### Detaylı Sistem Prompt'u

Sistem prompt'u (`SYSTEM_PROMPT`) çok kapsamlıdır ve şunları içerir:

#### 1. Bölge-Spesifik Bilgiler

```typescript
BÖLGE-SPESİFİK BİLGİLER:
- Alın bölgesi: Geniş mobilizasyon imkanı, RSTL horizontal, estetik önemi yüksek. 
  Advancement flepler, rotasyon flepleri uygun. Glabella bölgesi için özel dikkat.

- Burun: Estetik alt birimler kritik (dorsum, sidewall, tip, ala). 
  Küçük defektler için lokal flepler (bilobed, trilobed, nasolabial), 
  büyük defektler için interpolasyon flepleri (paramedian forehead, nasolabial). 
  RSTL dikey.

- Yanak: Geniş donor alan, advancement flepler uygun. 
  Estetik zon dikkat (malar prominence). 
  RSTL horizontal-vertikal karışık. Büyük defektler için interpolasyon flepleri.

- Göz kapağı: Fonksiyonel kritik, full-thickness defektler için özel yaklaşım. 
  Lokal flepler (advancement, rotasyon), graft kombinasyonları. RSTL horizontal.

- Ağız çevresi: Vermillion border korunmalı, fonksiyonel hareket dikkat. 
  Advancement flepler, rotasyon flepleri. RSTL horizontal.

- Çene: Estetik önemi düşük, geniş flepler uygun. 
  Advancement, rotasyon flepleri. RSTL horizontal.
```

#### 2. Flap Seçim Kriterleri (Öncelik Sırasına Göre)

**Kriter 1: Defekt Boyutu**
```
- Küçük (< 1.5cm): 
  Direkt kapatma, advancement, rotasyon, transpozisyon

- Orta (1.5-3cm): 
  Transpozisyon, bilobed, trilobed, rhomboid, advancement

- Büyük (> 3cm): 
  Interpolasyon flepleri (paramedian forehead, nasolabial), 
  serbest flepler, kombinasyon teknikleri
```

**Kriter 2: Bölge Özellikleri**
```
- Estetik zon: Minimal skar, RSTL uyumu kritik, estetik alt birim prensipleri
- Fonksiyonel zon: Hareket kısıtlaması yok, fonksiyon korunmalı
- Donor alan: Yeterli doku, minimal morbidite, uygun vaskülarite
```

**Kriter 3: Hasta Faktörleri**
```
- Yaş: 
  * Genç hastalarda estetik öncelik
  * Yaşlılarda fonksiyon ve hızlı iyileşme

- Önceki cerrahi: 
  Skar dokusu, vaskülarite değerlendirmesi, mevcut flep kullanımı

- Radyoterapi: 
  Vaskülarite azalması, özel dikkat, geniş pedikül gerekli
```

**Kriter 4: Patoloji**
```
- Malign: Geniş margin, onkolojik güvenlik, frozen section kontrolü
- Benign: Minimal margin, estetik öncelik, konservatif yaklaşım
```

#### 3. Flap Öncelik Sıralaması

```
- En uygun (suitability_score: 85-100): 
  İlk seçenek, en yüksek başarı oranı - EN AZ 1 flep

- Uygun (suitability_score: 60-84): 
  İyi alternatif, dikkatli değerlendirme gerekli - EN AZ 2 flep

- Alternatif (suitability_score: 40-59): 
  Son çare, özel durumlar için - EN AZ 1 flep

TOPLAM: Her olgu için MİNİMUM 4-6 farklı flep önerisi
```

### User Prompt Oluşturma

```typescript
const userPrompt = `Bu olguyu analiz et ve lokal flep seçenekleri öner:

Olgu Bilgileri:
- Bölge: ${caseData.region}
- Yaş: ${caseData.age || 'Belirtilmemiş'}
- Cinsiyet: ${caseData.sex || 'Belirtilmemiş'}
- Defekt boyutu: ${caseData.width_mm || visionSummary.estimated_width_mm}mm x 
                  ${caseData.height_mm || visionSummary.estimated_height_mm}mm
- Derinlik: ${caseData.depth || visionSummary.depth_estimation}
- Önceki cerrahi: ${caseData.previous_surgery ? 'Evet' : 'Hayır'}
- Önceki radyoterapi: ${caseData.previous_radiotherapy ? 'Evet' : 'Hayır'}
- Şüpheli patoloji: ${caseData.pathology_suspected || 'Belirtilmemiş'}
- Kritik yapılar: ${caseData.critical_structures?.join(', ') || 'Yok'}
- Yüksek estetik zon: ${caseData.high_aesthetic_zone ?? visionSummary.aesthetic_zone ? 'Evet' : 'Hayır'}

Görüntü Analizi:
- Tespit edilen bölge: ${visionSummary.detected_region}
- Tahmini boyut: ${visionSummary.estimated_width_mm}mm x ${visionSummary.estimated_height_mm}mm
- Derinlik tahmini: ${visionSummary.depth_estimation}
- Tespit edilen kritik yapılar: ${visionSummary.critical_structures.join(', ') || 'Yok'}
- Estetik zon: ${visionSummary.aesthetic_zone ? 'Evet' : 'Hayır'}

${visionSummary.defect_location ? `
KRİTİK - Defekt Konumu (KULLANICI TARAFINDAN MANUEL İŞARETLENMİŞ):
Koordinat sistemi: 0-1000 normalize (görüntünün görünen boyutuna göre)
- Defekt Merkezi: (${visionSummary.defect_location.center_x}, ${visionSummary.defect_location.center_y})
- Defekt Boyutu: ${visionSummary.defect_location.width} x ${visionSummary.defect_location.height}
- Defekt Poligon Noktaları: ${JSON.stringify(visionSummary.defect_location.points)}

ÇOK ÖNEMLİ - KOORDINAT SİSTEMİ:
- Tüm koordinatlar 0-1000 arası normalize edilmiş
- defect_area'nın koordinatları yukarıdaki defect_location.points'e TAM OLARAK uymalıdır
- VİZYON MODEL'İN defect_location tahmini görmezden gelinmeli, 
  SADECE bu manuel koordinatlar kullanılmalıdır!
` : ''}

${medicalSourcesContext ? `
TIBBİ KAYNAK BİLGİLERİ (ÇOK ÖNEMLİ - MUTLAKA KULLAN):
${medicalSourcesContext}

ÖNEMLİ KURALLAR:
- Bu kaynaklardaki spesifik teknikleri öncelikle kullan
- Kaynaklardaki kontrendikasyonları dikkate al
- Kaynaklardaki başarı oranlarını belirt
` : ''}

MUTLAKA BİRDEN FAZLA flep seçeneği öner - EN AZ 4-6 farklı flep önerisi yapmalısın.

Öneriler şunları içermeli:
- EN AZ 1 "en_uygun" kategorisinde flep (suitability_score: 85-100)
- EN AZ 2 "uygun" kategorisinde flep (suitability_score: 60-84)
- EN AZ 1 "alternatif" kategorisinde flep (suitability_score: 40-59)

Farklı flep tiplerini öner: transpozisyon, rotasyon, advancement, bilobed, 
trilobed, interpolasyon flepleri, rhomboid, vb.

ÇOK ÖNEMLİ - flap_drawing için (MANUEL İŞARETLENMİŞ KONUM KULLANILMALI):
KOORDINAT SİSTEMİ: Tüm koordinatlar 0-1000 arası normalize

1. Defekt alanını (defect_area) yukarıdaki MANUEL defect_location.points 
   koordinatlarına TAM OLARAK göre çiz.
   - defect_location.points dizisini AYNEN KULLAN - bu kullanıcının manuel 
     işaretlediği alandır!
   - Örnek: defect_area.points = defect_location.points (aynı koordinatlar)
   
2. Kesi çizgilerini (incision_lines) BU MANUEL İŞARETLENMİŞ defekt konumuna göre planla
   - Kesi çizgileri defekt alanının kenarlarından başlamalı (0-1000 normalize koordinatlar)
   - Tam olarak nereden kesileceğini göster (mavi, kesikli çizgi - dashed)
   
3. Flep alanlarını (flap_areas) BU MANUEL İŞARETLENMİŞ defekt konumuna göre yerleştir
   - Flep alanları defekt alanının yanında olmalı (0-1000 normalize koordinatlar)
   - Yeşil, yarı saydam
   
4. Donor alanı (donor_area) BU MANUEL İŞARETLENMİŞ defekt ve flep konumuna göre göster
   - Donor alan flep alanının arkasında olmalı (0-1000 normalize koordinatlar)
   - Turuncu
   
5. Flep hareket/rotasyon yönünü oklarla göster (arrows - mor)
   - Flep alanından defekt alanına doğru ok çiz (0-1000 normalize koordinatlar)

TÜM YANIT TÜRKÇE OLMALI.`;
```

### API Çağrısı

```typescript
const openai = getOpenAIClient();
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ],
  max_tokens: 6000, // Detaylı cerrahi çizimler için yüksek token limiti
  response_format: { type: 'json_object' },
  temperature: 0.7, // Yaratıcılık dengesi
});
```

### Çıktı İşleme ve Validasyon

```typescript
// JSON parse
const parsed = JSON.parse(content);
const suggestions = parsed.flap_suggestions || [];

// Her flep önerisini validate et ve normalize et
return suggestions.map((flap: any) => ({
  flap_name: flap.flap_name || 'Bilinmeyen flep',
  suitability_score: Math.max(0, Math.min(100, flap.suitability_score || 50)),
  category: ['en_uygun', 'uygun', 'alternatif'].includes(flap.category) 
    ? flap.category 
    : 'alternatif',
  why: flap.why || 'Açıklama sağlanmadı',
  advantages: Array.isArray(flap.advantages) ? flap.advantages : [],
  cautions: Array.isArray(flap.cautions) ? flap.cautions : [],
  // ... diğer alanlar
  
  // KRİTİK: flap_drawing işleme
  flap_drawing: (() => {
    // Manuel annotation'ı MUTLAKA kullan
    const manualDefectArea = visionSummary.defect_location?.points ? {
      points: visionSummary.defect_location.points,
      color: '#FF0000',
      label: 'Defekt Alanı (Manuel)',
    } : undefined;
    
    // AI'dan gelen flap_drawing varsa kullan, ama defect_area'yı manuel ile değiştir
    if (flap.flap_drawing) {
      return {
        defect_area: manualDefectArea || flap.flap_drawing.defect_area,
        incision_lines: Array.isArray(flap.flap_drawing.incision_lines) 
          ? flap.flap_drawing.incision_lines 
          : [],
        flap_areas: Array.isArray(flap.flap_drawing.flap_areas) 
          ? flap.flap_drawing.flap_areas 
          : [],
        donor_area: flap.flap_drawing.donor_area || undefined,
        arrows: Array.isArray(flap.flap_drawing.arrows) 
          ? flap.flap_drawing.arrows 
          : [],
      };
    }
    
    // Eğer AI'dan flap_drawing gelmediyse, sadece manuel defect_area ile minimal çizim
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
```

### Flap Drawing Formatı

```typescript
flap_drawing: {
  defect_area: {
    points: [
      { x: 400, y: 300 },
      { x: 500, y: 300 },
      { x: 500, y: 400 },
      { x: 400, y: 400 }
    ],
    color: "#FF0000",
    label: "Defekt Alanı"
  },
  incision_lines: [
    {
      points: [
        { x: 400, y: 300 },
        { x: 350, y: 250 },
        { x: 300, y: 220 },
        { x: 250, y: 200 }
      ],
      color: "#0066FF",
      label: "Ana Kesi Çizgisi",
      lineStyle: "dashed",  // veya "solid"
      lineWidth: 4
    }
  ],
  flap_areas: [
    {
      points: [
        { x: 250, y: 200 },
        { x: 350, y: 210 },
        { x: 380, y: 280 },
        { x: 400, y: 300 }
      ],
      color: "#00CC66",
      label: "Flep Alanı",
      fillOpacity: 0.25
    }
  ],
  donor_area: {
    points: [
      { x: 180, y: 160 },
      { x: 280, y: 170 },
      { x: 300, y: 210 },
      { x: 220, y: 200 }
    ],
    color: "#FF8800",
    label: "Donor Alan"
  },
  arrows: [
    {
      from: { x: 320, y: 250 },
      to: { x: 450, y: 350 },
      color: "#9900FF",
      label: "Flep Rotasyonu"
    }
  ]
}
```

### Cerrahi Çizim Standartları

**1. incision_lines (Kesi Çizgileri):**
- Kesikli çizgi (dashed) kullan - tam olarak nereden kesileceğini göster
- Natural skin tension lines (RSTL) boyunca planla
- Birden fazla kesi çizgisi ekle: ana kesi, pedikül kesisi, modifikasyonlar
- Koordinatlar SMOOTH ve AKICI olmalı - keskin köşeler yok, kavisli çizgiler
- Line width: 3-4px (kalın, belirgin)

**2. flap_areas (Flep Alanları):**
- Defekt boyutunun 1.5-2 katı genişlikte planla
- Yarı saydam (fillOpacity: 0.2-0.3) - altındaki anatomiyi göster
- Koordinatlar defekt alanına YAKIN ve UYGUN olmalı
- Birden fazla flep alanı varsa (bilobed, trilobed) hepsini çiz
- Köşeler yumuşak, kavisli olmalı - anatomik yapıya uygun

**3. donor_area (Donor Alan):**
- Flep alanından SONRA göster
- Donor alanın nasıl kapatılacağını göster (direkt kapatma veya graft alanı)
- Turuncu renk (#FF8800)

**4. arrows (Yön Okları):**
- Flep hareket yönünü GÖSTER - defekt alanına doğru
- Rotasyon, transpozisyon, advancement yönünü belirt
- Birden fazla ok ekle - flep mobilizasyonunu açıkça göster

**5. defect_area (Defekt Alanı):**
- Manuel işaretlenen konumu AYNEN kullan
- Kırmızı, belirgin, dolu renk

---

## Adım 3: Güvenlik İncelemesi (Safety Review)

### Dosya: `lib/ai/safety.ts`

### Fonksiyon: `reviewSafety()`

#### Girdiler:
```typescript
{
  visionSummary: VisionSummary,
  flapSuggestions: FlapSuggestion[]
}
```

### İşlem Adımları

**1. Anthropic API Key Kontrolü**
```typescript
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Anthropic API key bulunamadı...');
}
```

**2. System Prompt**
```
You are a safety and consistency checker for medical decision support JSON.

Tasks:
1. Review surgical techniques for safety - ensure they are appropriate and 
   follow standard medical practice.
2. Flag any dangerous advice, inappropriate techniques, or highly speculative claims.
3. DO NOT remove surgical techniques - they are requested by the user. 
   Only flag safety concerns in comments.
4. If you see inconsistencies or obvious hallucinations, lower suitability_score 
   and add notes in comments.
5. Ensure a safety_review object with fields: hallucination_risk, comments, 
   legal_disclaimer.
6. The legal disclaimer must state: 'This is for decision support only and does 
   not replace clinical judgment or training.'

Output the same JSON structure plus an added safety_review field.
```

**3. Claude API Çağrısı**
```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4000,
  system: SYSTEM_PROMPT,
  messages: [
    {
      role: 'user',
      content: `Review this medical decision support JSON for safety, 
               consistency, and appropriateness:

${JSON.stringify(inputData, null, 2)}

Check for:
- Any step-by-step surgical instructions (remove or flag)
- Dangerous advice or speculative claims
- Inconsistencies or hallucinations
- Appropriate disclaimers

Return the same JSON structure but:
1. Add a safety_review object at the root level
2. Adjust suitability_scores if you find issues
3. Add comments in the safety_review if concerns exist`,
    },
  ],
});
```

**4. Çıktı İşleme**
```typescript
const text = content.text;
// Markdown code block'lardan JSON çıkar
const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
const jsonText = jsonMatch[1] || text;
const parsed = JSON.parse(jsonText);

// Safety review ve validated suggestions çıkar
const safetyReview: SafetyReview = parsed.safety_review || {
  hallucination_risk: 'orta' as const,
  comments: ['Güvenlik incelemesi tamamlandı'],
  legal_disclaimer: 'Bu öneriler yalnızca karar destek amaçlıdır...',
};

const validatedSuggestions: FlapSuggestion[] = 
  parsed.flap_suggestions || flapSuggestions;

return {
  ...safetyReview,
  flapSuggestions: validatedSuggestions,
};
```

### Hata Yönetimi

Eğer safety review başarısız olursa:

```typescript
// Orchestrator'da fallback mekanizması
try {
  safetyResult = await reviewSafety(visionSummary, flapSuggestions);
} catch (error: any) {
  // Minimal safety review oluştur
  safetyResult = {
    hallucination_risk: 'orta' as const,
    comments: [`Güvenlik incelemesi tamamlanamadı: ${errorMsg}`],
    legal_disclaimer: 'Bu öneriler yalnızca karar destek amaçlıdır...',
    flapSuggestions: flapSuggestions, // Orijinal önerileri kullan
  };
}
```

---

## Koordinat Sistemi

### Normalizasyon

Tüm koordinatlar **0-1000 arası normalize edilmiş** değerlerdir.

**Neden normalize?**
- Farklı görüntü boyutlarına uyum sağlar
- Responsive rendering için uygun
- Canvas çiziminde ölçekleme kolaylığı

### Koordinat Dönüşümü

**Frontend'de (FlapDrawingOverlay.tsx):**

```typescript
// Normalize koordinatları (0-1000) canvas koordinatlarına çevir
const toCanvasCoords = (point: { x: number; y: number }) => {
  // 1. Normalize koordinatları doğal görüntü boyutuna çevir
  const naturalX = (point.x / 1000) * naturalWidth;
  const naturalY = (point.y / 1000) * naturalHeight;
  
  // 2. Doğal boyuttan görüntülenen (canvas) boyuta ölçekle
  const scaleX = displayedWidth / naturalWidth;
  const scaleY = displayedHeight / naturalHeight;
  
  return {
    x: naturalX * scaleX,
    y: naturalY * scaleY,
  };
};
```

**Örnek:**
```
Normalize koordinat: { x: 500, y: 300 }  // 0-1000 arası
Doğal görüntü: 2000x1500 piksel
Görüntülenen boyut: 800x600 piksel

1. Doğal boyuta çevir:
   naturalX = (500 / 1000) * 2000 = 1000
   naturalY = (300 / 1000) * 1500 = 450

2. Canvas boyutuna ölçekle:
   scaleX = 800 / 2000 = 0.4
   scaleY = 600 / 1500 = 0.4
   
   canvasX = 1000 * 0.4 = 400
   canvasY = 450 * 0.4 = 180
```

### Manuel Annotation Formatı

Kullanıcıdan gelen manuel annotation:

```typescript
{
  x: number,              // Piksel cinsinden X koordinatı
  y: number,              // Piksel cinsinden Y koordinatı
  width: number,          // Piksel cinsinden genişlik
  height: number,         // Piksel cinsinden yükseklik
  image_width: number,    // Görüntünün görünen genişliği
  image_height: number,   // Görüntünün görünen yüksekliği
  shape?: 'rectangle' | 'circle'  // Şekil tipi
}
```

**Normalize edilmiş formata çevirme:**

```typescript
// Dikdörtgen için
const normalizedPoints = [
  { 
    x: (manualAnnotation.x / image_width) * 1000,
    y: (manualAnnotation.y / image_height) * 1000
  },
  { 
    x: ((manualAnnotation.x + manualAnnotation.width) / image_width) * 1000,
    y: (manualAnnotation.y / image_height) * 1000
  },
  { 
    x: ((manualAnnotation.x + manualAnnotation.width) / image_width) * 1000,
    y: ((manualAnnotation.y + manualAnnotation.height) / image_height) * 1000
  },
  { 
    x: (manualAnnotation.x / image_width) * 1000,
    y: ((manualAnnotation.y + manualAnnotation.height) / image_height) * 1000
  }
];
```

---

## Prompt Mühendisliği

### Sistem Prompt Tasarım Prensipleri

**1. Rol Tanımlama**
```
Sen yüz bölgesi cilt defektleri için rekonstrüksiyon karar destek asistanısın.
```
- AI'ya net bir rol verir
- Beklentileri belirler

**2. Yapılandırılmış Bilgi**
- Bölge-spesifik bilgiler tablo formatında
- Öncelik sıralaması açıkça belirtilmiş
- Kriterler numaralandırılmış

**3. Zorunlu Çıktı Formatı**
```
MUTLAKA BİRDEN FAZLA flep seçeneği öner - EN AZ 3-5 farklı flep önerisi yapmalısın.
```
- Minimum gereksinimler açıkça belirtilmiş
- "MUTLAKA", "EN AZ" gibi güçlü ifadeler kullanılmış

**4. Örnekler ve Şablonlar**
```
surgical_technique ÖRNEK:
"1. İnsizyon Planlaması: ...
 2. Flep Tasarımı: ...
"
```
- AI'ya format beklentisini gösterir
- Tutarlı çıktı sağlar

**5. Koordinat Sistemi Açıklaması**
```
KOORDINAT SİSTEMİ: Tüm koordinatlar 0-1000 arası normalize
```
- Teknik detaylar açıkça belirtilmiş
- Hata önleme için kritik

### User Prompt Stratejisi

**1. Bağlamsal Bilgi Birleştirme**
```typescript
const userPrompt = `
Olgu Bilgileri:
- Bölge: ${caseData.region}
- Yaş: ${caseData.age || 'Belirtilmemiş'}
...

Görüntü Analizi:
- Tespit edilen bölge: ${visionSummary.detected_region}
...
`;
```
- Tüm ilgili bilgileri birleştirir
- Fallback değerler sağlar

**2. Kritik Bilgi Vurgulama**
```
KRİTİK - Defekt Konumu (KULLANICI TARAFINDAN MANUEL İŞARETLENMİŞ):
```
- Büyük harflerle vurgulama
- Öncelik sırası belirtme

**3. Koşullu İçerik**
```typescript
${visionSummary.defect_location ? `
  KRİTİK - Defekt Konumu...
` : ''}

${medicalSourcesContext ? `
  TIBBİ KAYNAK BİLGİLERİ...
` : ''}
```
- Sadece gerekli bilgileri ekler
- Prompt uzunluğunu optimize eder

### Temperature ve Token Ayarları

**Vision Analysis:**
```typescript
{
  max_tokens: 1500,
  response_format: { type: 'json_object' },
  // temperature belirtilmemiş (default: 1.0)
}
```
- Daha konservatif, doğru tespit için

**Flap Decision:**
```typescript
{
  max_tokens: 6000,  // Detaylı çizimler için yüksek
  response_format: { type: 'json_object' },
  temperature: 0.7,  // Yaratıcılık dengesi
}
```
- Daha yaratıcı, çeşitli öneriler için
- Yüksek token limiti (çizim koordinatları için)

**Safety Review:**
```typescript
{
  max_tokens: 4000,
  // temperature belirtilmemiş (default: 1.0)
}
```
- Güvenlik için konservatif yaklaşım

---

## Veri Yapıları

### Case Interface

```typescript
interface Case {
  id: string;
  user_id: string;
  case_code: string;
  age?: number;
  sex?: 'M' | 'F' | 'Other';
  region: string;                    // "Burun", "Yanak", vb.
  width_mm?: number;
  height_mm?: number;
  depth?: 'skin' | 'skin+subcutis' | 'muscle' | 'mucosa';
  previous_surgery?: boolean;
  previous_radiotherapy?: boolean;
  pathology_suspected?: string;
  critical_structures?: string[];      // ["Alar rim", "Nasal tip"]
  high_aesthetic_zone?: boolean;
  status: 'planned' | 'operated' | 'postop_follow' | 'completed';
  created_at: string;
  updated_at: string;
}
```

### VisionSummary Interface

```typescript
interface VisionSummary {
  detected_region: string;
  estimated_width_mm: number;
  estimated_height_mm: number;
  depth_estimation: string;
  critical_structures: string[];
  aesthetic_zone: boolean;
  defect_location?: {
    center_x: number;        // 0-1000 normalize
    center_y: number;       // 0-1000 normalize
    width: number;          // 0-1000 normalize
    height: number;        // 0-1000 normalize
    points?: Array<{ x: number; y: number }>;  // Poligon noktaları
  };
}
```

### FlapSuggestion Interface

```typescript
interface FlapSuggestion {
  // Temel Bilgiler
  flap_name: string;                    // "Transpozisyon flebi"
  suitability_score: number;            // 0-100
  category: 'en_uygun' | 'uygun' | 'alternatif';
  why: string;                         // Kısa açıklama
  
  // Avantajlar ve Dikkatler
  advantages: string[];
  cautions: string[];
  alternatives: string[];
  
  // Risk Değerlendirmeleri
  aesthetic_risk: 'düşük' | 'orta' | 'yüksek';
  functional_risk: 'düşük' | 'orta' | 'yüksek';
  complication_risk: 'düşük' | 'orta' | 'yüksek';
  
  // Komplikasyon Bilgileri
  expected_complications: string[];
  prevention_strategies: string[];
  donor_site_morbidity: 'minimal' | 'moderate' | 'significant';
  
  // Kontrendikasyonlar
  contraindications: string[];
  relative_contraindications: string[];
  when_to_avoid: string;
  
  // Karşılaştırma
  comparison_with_alternatives: {
    better_than: string[];
    worse_than: string[];
    similar_to: string[];
  };
  
  // Bakım Planı
  postoperative_care: {
    immediate: string[];    // İlk 24 saat
    early: string[];         // İlk hafta
    late: string[];          // İlk ay
    long_term: string[];    // 3+ ay
  };
  
  follow_up_schedule: {
    day_1: string;
    day_7: string;
    day_14: string;
    month_1: string;
    month_3: string;
  };
  
  // Cerrahi Bilgileri
  estimated_surgery_time: string;      // "45-60 dakika"
  estimated_cost_range: string;        // "Düşük seviye"
  complexity_level: 'basit' | 'orta' | 'kompleks';
  technical_difficulty: 'başlangıç' | 'orta' | 'ileri' | 'uzman';
  evidence_level: 'yüksek' | 'orta' | 'düşük';
  success_rate: string;                 // ">90% başarı oranı"
  surgical_technique?: string;          // Detaylı cerrahi teknik
  video_link?: string;                  // YouTube linki
  
  // Cerrahi Çizim
  flap_drawing?: {
    defect_area?: {
      points: Array<{ x: number; y: number }>;
      color: string;
      label: string;
    };
    incision_lines: Array<{
      points: Array<{ x: number; y: number }>;
      color: string;
      label: string;
      lineStyle: 'dashed' | 'solid';
      lineWidth?: number;
    }>;
    flap_areas: Array<{
      points: Array<{ x: number; y: number }>;
      color: string;
      label: string;
      fillOpacity?: number;
    }>;
    donor_area?: {
      points: Array<{ x: number; y: number }>;
      color: string;
      label: string;
    };
    arrows?: Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
      color: string;
      label?: string;
    }>;
  };
}
```

### SafetyReview Interface

```typescript
interface SafetyReview {
  hallucination_risk: 'düşük' | 'orta' | 'yüksek';
  comments: string[];
  legal_disclaimer: string;
}
```

### AIResult Interface

```typescript
interface AIResult {
  id: string;
  case_id: string;
  vision_summary: VisionSummary;
  flap_suggestions: FlapSuggestion[];
  safety_review: SafetyReview;
  created_at: string;
}
```

---

## Hata Yönetimi

### Hata Hiyerarşisi

```
1. Validation Errors (400)
   - Geçersiz case ID
   - Geçersiz user ID
   - Eksik parametreler

2. Authentication Errors (401)
   - API key eksik/geçersiz
   - Kullanıcı yetkisi yok

3. Resource Errors (404)
   - Olgu bulunamadı
   - Pre-op fotoğraf bulunamadı

4. API Errors (500)
   - OpenAI API hatası
   - Anthropic API hatası
   - Veritabanı hatası

5. Rate Limit Errors (429)
   - API quota aşıldı
   - Rate limit aşıldı
```

### Hata Yakalama Stratejisi

**1. API Key Kontrolü**
```typescript
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OpenAI API key bulunamadı...');
}
```

**2. API Hata Yönetimi**
```typescript
try {
  const response = await openai.chat.completions.create({...});
} catch (error: any) {
  const errorStatus = error?.status || error?.statusCode;
  
  if (errorStatus === 401) {
    throw new Error('OpenAI API key geçersiz veya eksik...');
  }
  
  if (errorStatus === 429) {
    throw new Error('OpenAI API quota/rate limit aşıldı...');
  }
  
  throw new Error(`Flep önerisi oluşturulamadı: ${errorMessage}`);
}
```

**3. Fallback Mekanizmaları**

**Vision Analysis:**
- Manuel annotation varsa vision model atlanır
- Hata durumunda manuel annotation kullanılır

**Safety Review:**
- Hata durumunda minimal safety review oluşturulur
- Analiz devam eder, sadece güvenlik incelemesi atlanır

**4. Veritabanı Hata Yönetimi**
```typescript
// UPSERT işlemi için retry mekanizması
if (saveError?.message?.includes('duplicate key')) {
  // Önce sil, sonra tekrar dene
  await supabase.from('ai_results').delete().eq('case_id', caseId);
  await new Promise(resolve => setTimeout(resolve, 500)); // Race condition önleme
  // Tekrar insert dene
}
```

### Logging Stratejisi

```typescript
console.log('Starting flap suggestion analysis...');
console.log('OpenAI API key present:', !!process.env.OPENAI_API_KEY);
console.log('Decision content received successfully, length:', content.length);
console.error('❌ Flap suggestion failed:', error);
console.warn('⚠️ No defect_location found in vision summary...');
```

**Log Seviyeleri:**
- `console.log`: Normal işlem akışı
- `console.warn`: Uyarılar (devam edilebilir)
- `console.error`: Hatalar (kritik)

---

## Performans Optimizasyonları

### 1. Paralel İşlemler

**Şu anki durum:** Sıralı işlem
```
Vision → Medical Sources → Flap Decision → Safety Review
```

**Potansiyel optimizasyon:**
```
Vision → Flap Decision (paralel)
Medical Sources ↗
```

### 2. Caching Stratejisi

- Aynı case için tekrar analiz önleme
- Medical sources cache
- Vision summary cache

### 3. Token Optimizasyonu

- Gereksiz bilgi kaldırma
- Prompt compression
- Selective context inclusion

---

## Güvenlik Kontrolleri

### 1. Kullanıcı Yetkilendirmesi

```typescript
// Orchestrator'da
if (caseData.user_id !== userId) {
  throw new Error('Bu olguya erişim yetkiniz yok...');
}
```

### 2. Input Validation

```typescript
if (!caseId || caseId === 'undefined' || caseId.trim() === '') {
  throw new Error('Geçersiz case ID...');
}
```

### 3. API Key Güvenliği

- Environment variables kullanımı
- Server-side only (client'a expose edilmez)
- Vercel environment variables

### 4. Legal Disclaimer

Her safety review'da:
```
Bu öneriler yalnızca karar destek amaçlıdır; nihai karar, 
hastayı değerlendiren klinik ekibe aittir. Bu platform klinik muayene, 
cerrahi deneyim ve multidisipliner değerlendirmelerin yerine geçmez.
```

---

## Sonuç

Bu algoritma, **çok katmanlı bir AI karar destek sistemi** olarak çalışır:

1. **Vision Layer**: Görüntü analizi ve defekt tespiti
2. **Decision Layer**: Flap önerileri ve cerrahi planlama
3. **Safety Layer**: Güvenlik kontrolü ve doğrulama

Her katman kendi sorumluluğunu yerine getirir ve sonuçlar birleştirilerek kapsamlı bir analiz sağlanır.

**Önemli Özellikler:**
- ✅ Manuel annotation önceliği
- ✅ Normalize koordinat sistemi
- ✅ Detaylı cerrahi çizimler
- ✅ Çoklu flep önerileri (4-6 adet)
- ✅ Güvenlik kontrolleri
- ✅ Hata toleransı
- ✅ Türkçe çıktı

---

*Son güncelleme: 2024*

