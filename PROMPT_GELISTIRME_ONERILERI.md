# Flep Önerisi Prompt Geliştirme Önerileri

## 🎯 Mevcut Prompt'un Güçlü Yönleri

✅ **İyi Olanlar:**
- Detaylı cerrahi teknik açıklamaları
- Koordinat tabanlı çizim sistemi
- Manuel işaretleme desteği
- Türkçe çıktı
- Tıbbi kaynak entegrasyonu (RAG)
- Video link desteği

## 🚀 Geliştirme Önerileri

### 1. **Daha Spesifik Tıbbi Bilgi Ekleme**

**Mevcut Durum:** Prompt genel yüz rekonstrüksiyon prensiplerinden bahsediyor.

**Öneri:** Bölge-spesifik bilgiler ekleyin:

```typescript
const SYSTEM_PROMPT = `Sen yüz bölgesi cilt defektleri için rekonstrüksiyon karar destek asistanısın.
Hasta metadata'sı ve görüntü analizi özeti alıyorsun.

BÖLGE-SPESİFİK BİLGİLER:
- Alın bölgesi: Geniş mobilizasyon imkanı, RSTL horizontal, estetik önemi yüksek
- Burun: Estetik alt birimler kritik, küçük defektler için lokal flepler, büyük defektler için interpolasyon flepleri
- Yanak: Geniş donor alan, advancement flepler uygun, estetik zon dikkat
- Göz kapağı: Fonksiyonel kritik, full-thickness defektler için özel yaklaşım
- Ağız çevresi: Vermillion border korunmalı, fonksiyonel hareket dikkat
- Çene: Estetik önemi düşük, geniş flepler uygun

... (mevcut prompt devam ediyor)
```

### 2. **Flep Seçim Kriterlerini Netleştirme**

**Mevcut Durum:** "Uygun flep seçenekleri öner" - belirsiz.

**Öneri:** Kriterleri sıralayın:

```typescript
FLAP SEÇİM KRİTERLERİ (Öncelik Sırasına Göre):
1. Defekt Boyutu:
   - Küçük (< 1.5cm): Direkt kapatma, advancement, rotasyon
   - Orta (1.5-3cm): Transpozisyon, bilobed, rhomboid
   - Büyük (> 3cm): Interpolasyon flepleri, serbest flepler

2. Bölge Özellikleri:
   - Estetik zon: Minimal skar, RSTL uyumu kritik
   - Fonksiyonel zon: Hareket kısıtlaması yok, fonksiyon korunmalı
   - Donor alan: Yeterli doku, minimal morbidite

3. Hasta Faktörleri:
   - Yaş: Genç hastalarda estetik öncelik, yaşlılarda fonksiyon
   - Önceki cerrahi: Skar dokusu, vaskülarite değerlendirmesi
   - Radyoterapi: Vaskülarite azalması, özel dikkat

4. Patoloji:
   - Malign: Geniş margin, onkolojik güvenlik
   - Benign: Minimal margin, estetik öncelik
```

### 3. **Komplikasyon ve Risk Analizi Ekleme**

**Mevcut Durum:** Sadece `aesthetic_risk` var.

**Öneri:** Daha detaylı risk analizi:

```typescript
Her flep önerisi şunları içermeli:
...
- aesthetic_risk: "düşük" | "orta" | "yüksek"
- functional_risk: "düşük" | "orta" | "yüksek"  // YENİ
- complication_risk: "düşük" | "orta" | "yüksek"  // YENİ
- expected_complications: string[]  // YENİ - Olası komplikasyonlar
- prevention_strategies: string[]  // YENİ - Komplikasyon önleme stratejileri
- donor_site_morbidity: "minimal" | "moderate" | "significant"  // YENİ
```

### 4. **Flep Karşılaştırma Tablosu**

**Öneri:** Her flep için karşılaştırmalı bilgi:

```typescript
Her flep önerisi şunları içermeli:
...
- comparison_with_alternatives: {  // YENİ
    better_than: string[],  // Bu flep hangi durumlarda alternatiflerden daha iyi
    worse_than: string[],  // Bu flep hangi durumlarda alternatiflerden daha kötü
    similar_to: string[]   // Benzer performans gösteren flepler
  }
```

### 5. **Postoperatif Takip Planı**

**Mevcut Durum:** Sadece genel postoperatif bakım var.

**Öneri:** Detaylı takip planı:

```typescript
- postoperative_care: {  // YENİ
    immediate: string[],  // İlk 24 saat
    early: string[],      // İlk hafta
    late: string[],       // İlk ay
    long_term: string[]   // 3+ ay
  }
- follow_up_schedule: {  // YENİ
    day_1: string,
    day_7: string,
    day_14: string,
    month_1: string,
    month_3: string
  }
```

### 6. **Maliyet ve Zaman Tahmini**

**Öneri:** Pratik bilgiler:

```typescript
- estimated_surgery_time: string  // YENİ - "45-60 dakika"
- estimated_cost_range: string   // YENİ - "Orta seviye" veya "Yüksek"
- complexity_level: "basit" | "orta" | "kompleks"  // YENİ
```

### 7. **Kanıt Seviyesi ve Referanslar**

**Öneri:** Bilimsel dayanak:

```typescript
- evidence_level: "yüksek" | "orta" | "düşük"  // YENİ
- supporting_literature: string[]  // YENİ - İlgili makaleler/kitap bölümleri
- success_rate: string  // YENİ - ">90% başarı oranı"
```

### 8. **Hasta Yaşına Özel Öneriler**

**Mevcut Durum:** Yaş bilgisi var ama kullanılmıyor.

**Öneri:** Yaş-spesifik öneriler:

```typescript
YAŞ-SPESİFİK ÖNERİLER:
- Çocuk (<18): Büyüme faktörü, minimal skar, gelecek estetik
- Genç erişkin (18-40): Estetik öncelik, minimal skar
- Orta yaş (40-65): Fonksiyon ve estetik dengesi
- Yaşlı (>65): Fonksiyon öncelik, hızlı iyileşme, minimal komplikasyon

Her flep önerisinde yaş faktörünü değerlendir ve uygun öneriler yap.
```

### 9. **Flep Kombinasyonları**

**Öneri:** Kompleks defektler için:

```typescript
- can_be_combined_with: string[]  // YENİ - Hangi fleplerle kombinlenebilir
- combination_scenarios: string[]   // YENİ - Kombinasyon senaryoları
```

### 10. **Görsel Çizim İyileştirmeleri**

**Mevcut Durum:** Koordinat sistemi var.

**Öneri:** Daha detaylı çizim talimatları:

```typescript
ÇİZİM İYİLEŞTİRMELERİ:
- Anatomik landmark'ları göster (göz, burun, ağız köşesi)
- Vasküler pedikülü çiz (varsa)
- Tension lines'ı göster (RSTL)
- Flep rotasyon açısını belirt
- Donor alan kapatma yöntemini göster (direkt/graft)
- Birden fazla flep varsa (bilobed, trilobed) her lob'u ayrı çiz
```

### 11. **Tıbbi Kaynak Entegrasyonunu Güçlendirme**

**Mevcut Durum:** `medicalSourcesContext` var ama pasif.

**Öneri:** Daha aktif kullanım:

```typescript
TIBBİ KAYNAK KULLANIMI:
${medicalSourcesContext ? `
Aşağıdaki tıbbi kaynaklar bu olgu için ilgili bilgiler içermektedir. 
Bu kaynakları MUTLAKA referans al ve önerilerinde kullan:

${medicalSourcesContext}

ÖNEMLİ:
- Bu kaynaklardaki spesifik teknikleri öncelikle kullan
- Kaynaklardaki kontrendikasyonları dikkate al
- Kaynaklardaki başarı oranlarını belirt
- Kaynaklardaki komplikasyon bilgilerini ekle
` : ''}
```

### 12. **Flep Öncelik Sıralaması**

**Öneri:** Daha net sıralama:

```typescript
FLAP ÖNCELİK SIRALAMASI:
1. En uygun (suitability_score: 85-100): İlk seçenek, en yüksek başarı oranı
2. Uygun (suitability_score: 60-84): İyi alternatif, dikkatli değerlendirme gerekli
3. Alternatif (suitability_score: 40-59): Son çare, özel durumlar için

Her kategori için minimum 1, maksimum 3 flep öner.
```

### 13. **Kontrendikasyonlar**

**Öneri:** Net kontrendikasyon listesi:

```typescript
- contraindications: string[]  // YENİ - Bu flep için kontrendikasyonlar
- relative_contraindications: string[]  // YENİ - Göreceli kontrendikasyonlar
- when_to_avoid: string  // YENİ - Ne zaman kullanılmamalı
```

### 14. **Teknik Zorluk Seviyesi**

**Öneri:** Cerrah için bilgi:

```typescript
- technical_difficulty: "başlangıç" | "orta" | "ileri" | "uzman"  // YENİ
- learning_curve: string  // YENİ - "Orta seviye cerrahlar için uygun"
- required_experience: string  // YENİ - "En az 20 vaka deneyimi önerilir"
```

### 15. **Hasta Memnuniyeti ve Sonuç Beklentisi**

**Öneri:** Hasta bilgilendirmesi:

```typescript
- expected_outcome: string  // YENİ - Beklenen sonuç
- patient_satisfaction: "yüksek" | "orta" | "düşük"  // YENİ
- scar_appearance: string  // YENİ - Skar görünümü beklentisi
- functional_outcome: string  // YENİ - Fonksiyonel sonuç beklentisi
```

## 📊 Öncelik Sırasına Göre Uygulama

### Yüksek Öncelik (Hemen Eklenmeli)
1. ✅ Bölge-spesifik bilgiler
2. ✅ Flep seçim kriterleri
3. ✅ Komplikasyon analizi
4. ✅ Tıbbi kaynak entegrasyonu güçlendirme

### Orta Öncelik (Yakın Zamanda)
5. ✅ Postoperatif takip planı
6. ✅ Flep karşılaştırma
7. ✅ Görsel çizim iyileştirmeleri
8. ✅ Kontrendikasyonlar

### Düşük Öncelik (Gelecekte)
9. ✅ Maliyet/zaman tahmini
10. ✅ Kanıt seviyesi
11. ✅ Teknik zorluk seviyesi
12. ✅ Hasta memnuniyeti

## 🔧 Uygulama Örneği

Geliştirilmiş prompt'un bir kısmı:

```typescript
const SYSTEM_PROMPT = `Sen yüz bölgesi cilt defektleri için rekonstrüksiyon karar destek asistanısın.
Hasta metadata'sı ve görüntü analizi özeti alıyorsun.

BÖLGE-SPESİFİK BİLGİLER:
[Yukarıdaki bölge bilgileri]

FLAP SEÇİM KRİTERLERİ:
[Yukarıdaki kriterler]

YAPMAN GEREKENLER:
1. Lokal flep seçenekleri öner ve her flep için detaylı cerrahi teknik bilgisi sağla.
2. Her flep için şunları sağla: 
   - [Mevcut alanlar]
   - functional_risk: "düşük" | "orta" | "yüksek"
   - complication_risk: "düşük" | "orta" | "yüksek"
   - expected_complications: string[]
   - prevention_strategies: string[]
   - contraindications: string[]
   - technical_difficulty: "başlangıç" | "orta" | "ileri" | "uzman"
   - postoperative_care: { immediate, early, late, long_term }
   - [Diğer yeni alanlar]
...
```

## 📝 Sonuç

Bu geliştirmelerle prompt:
- ✅ Daha spesifik ve bilimsel olacak
- ✅ Daha pratik bilgiler sağlayacak
- ✅ Risk analizi daha detaylı olacak
- ✅ Cerrahlar için daha kullanışlı olacak
- ✅ Hasta bilgilendirmesi daha iyi olacak

Hangi geliştirmeleri öncelikli olarak eklemek istersiniz?

