# Flap Drawing Validation & Reliability System

## Genel Bakış

Bu sistem, AI tarafından üretilen flap çizimlerinin anatomik doğruluğunu ve güvenilirliğini değerlendirmek için geliştirilmiştir. Sistem, çizimlerin simetri, oran ve pozisyon açısından doğruluğunu otomatik olarak analiz eder ve kullanıcıya skorlar ve tespit edilen sorunlar hakkında bilgi verir.

## Tamamlanan Özellikler

### 1. ✅ Otomatik Görsel Doğruluk Denetimi

**Dosya:** `lib/ai/validation.ts`

- **Yüz Simetri Analizi:**
  - Yatay eğiklik tespiti (gözler arası çizginin açısı)
  - Dikey hizalama kontrolü (burun ve çene)
  - Sol-sağ yüz yarısı simetri skoru
  - Genel simetri puanı (0-100)

- **Yüz Oranları Kontrolü:**
  - Üç eşit parça kontrolü (alın, burun, alt yüz)
  - Gözler arası mesafe analizi
  - Altın oran uyum skoru (placeholder)
  - Genel oran puanı (0-100)

- **Flap Pozisyon Kontrolü:**
  - Defekt kapsama oranı
  - Donör alan pozisyon doğrulaması
  - Flap hizalama kontrolü
  - Kritik yapılarla çakışma tespiti
  - Genel pozisyon puanı (0-100)

### 2. ✅ Validasyon Skorlama Sistemi

**Dosya:** `types/validation.ts`

- **Anatomik Tutarlılık Puanı (0-100):**
  - Simetri skoru (ağırlık: %30)
  - Oran skoru (ağırlık: %30)
  - Pozisyon skoru (ağırlık: %40)
  - Detaylı breakdown gösterimi

- **AI Güven Skoru:**
  - Anatomik tutarlılık + uygunluk skoru kombinasyonu
  - Seviye: düşük / orta / yüksek
  - Faktör bazlı ağırlıklı hesaplama

### 3. ✅ UI Component'leri

**Dosyalar:**
- `components/ui/ValidationScoreBadge.tsx` - Skorları gösteren badge component
- `components/ui/ValidationIssuesList.tsx` - Tespit edilen sorunları listeleyen component

**Özellikler:**
- Renk kodlu skor gösterimi (yeşil/amber/kırmızı)
- Detaylı sorun listesi
- Öneri ve düzeltme ipuçları
- Compact ve full view modları

### 4. ✅ Orchestrator Entegrasyonu

**Dosya:** `lib/ai/orchestrator.ts`

- Flap önerileri oluşturulduktan sonra otomatik validasyon
- Her flap için ayrı validasyon sonucu
- Hata toleranslı (validation başarısız olsa bile analiz devam eder)
- Validation sonuçları flap suggestion'a eklenir

### 5. ✅ CaseDetailContent Entegrasyonu

**Dosya:** `app/cases/[id]/CaseDetailContent.tsx`

- Her flap önerisinde validation skorları gösterimi
- Tespit edilen sorunların listelenmesi
- Kullanıcı dostu görsel arayüz

## Kalan Özellikler (TODO)

### 1. ⏳ Landmark Tespiti Servisi

**Durum:** Placeholder implementasyon

**Gereksinimler:**
- MediaPipe Face Mesh entegrasyonu (468 nokta)
- Veya TensorFlow.js FaceLandmarksDetection
- Veya OpenCV Haar Cascade + Dlib

**Dosya:** `lib/ai/validation.ts` → `detectFaceLandmarks()` fonksiyonu

**Not:** Şu anda landmark tespiti yapılamadığı için validasyon skorları placeholder değerler kullanıyor.

### 2. ⏳ Vektörel Dönüştürme

**Durum:** Henüz başlanmadı

**Gereksinimler:**
- Raster görüntüden SVG çıktı
- Potrace veya Inkscape entegrasyonu
- VectorFusion (opsiyonel - araştırma aşaması)

**Planlanan Dosya:** `lib/ai/vectorization.ts`

**Kullanım Senaryosu:**
- Kullanıcı "SVG olarak indir" butonuna tıklar
- Sistem raster çizimi SVG'ye dönüştürür
- İndirilebilir SVG dosyası sunulur

### 3. ⏳ Anatomik Referans Overlay

**Durum:** Henüz başlanmadı

**Gereksinimler:**
- Altın oran maskesi (Marquardt mask)
- Yüz kas haritası overlay
- Kemik yapı overlay
- Antropometrik kılavuz çizgiler

**Planlanan Dosya:** `components/ui/AnatomicalOverlay.tsx`

**Özellikler:**
- Toggle ile açma/kapama
- Opacity ayarı
- Renk seçenekleri
- Export'ta dahil etme seçeneği

### 4. ⏳ Post-Processing Pipeline

**Durum:** Henüz başlanmadı

**Gereksinimler:**
- Flap pozisyon düzeltme algoritması
- Vektörel overlay ile düzeltme
- 3D model tabanlı yeniden çizim (opsiyonel)

**Planlanan Dosya:** `lib/ai/postprocessing.ts`

**Özellikler:**
- Otomatik düzeltme önerileri
- Kullanıcı onayı ile düzeltme
- Önceki ve sonraki karşılaştırma

### 5. ⏳ Geri Bildirim Döngüsü

**Durum:** Henüz başlanmadı

**Gereksinimler:**
- Kullanıcı değerlendirme sistemi
- Yeniden çizim isteği
- Öğrenme mekanizması (opsiyonel)

**Planlanan Dosyalar:**
- `lib/ai/feedback.ts` - Geri bildirim işleme
- `components/ui/FeedbackDialog.tsx` - Kullanıcı arayüzü
- Database schema güncellemesi (feedback tablosu)

**Özellikler:**
- "Yetersiz" işaretleme
- Özel yorum ekleme
- Otomatik yeniden çizim talebi
- İyileşme skorları karşılaştırması

## Kullanım

### Validasyon Sonuçlarını Görüntüleme

1. Bir case için AI analizi çalıştırın
2. Flap önerileri sayfasında, her flap kartında "Çizim Doğruluk Analizi" bölümü görünecektir
3. Skorlar ve tespit edilen sorunlar otomatik olarak gösterilir

### Skor Yorumlama

- **80-100:** Mükemmel - Anatomik olarak kusursuza yakın
- **60-79:** İyi - Küçük düzeltmeler gerekebilir
- **0-59:** Dikkat Gerekli - Önemli sorunlar tespit edildi

## Teknik Detaylar

### Validasyon Akışı

```
1. Flap önerileri oluşturulur (decision.ts)
2. Her flap için validasyon çağrılır (orchestrator.ts)
3. Landmark tespiti yapılır (validation.ts)
4. Simetri, oran ve pozisyon metrikleri hesaplanır
5. Anatomik tutarlılık ve AI güven skoru hesaplanır
6. Tespit edilen sorunlar toplanır
7. ValidationResult oluşturulur ve flap'e eklenir
8. UI'da gösterilir
```

### Type Definitions

Tüm type tanımları `types/validation.ts` dosyasında:
- `ValidationResult` - Ana validasyon sonucu
- `SymmetryMetrics` - Simetri metrikleri
- `ProportionMetrics` - Oran metrikleri
- `FlapPositionMetrics` - Pozisyon metrikleri
- `FaceLandmarks` - Yüz landmark'ları

## Gelecek Geliştirmeler

1. **Gerçek Landmark Tespiti:** MediaPipe veya TensorFlow.js entegrasyonu
2. **Gelişmiş Simetri Analizi:** Daha detaylı landmark'lar kullanarak
3. **Altın Oran Hesaplama:** Marquardt mask implementasyonu
4. **Flap Kapsama Hesaplama:** Polygon intersection algoritmaları
5. **Vektörel Export:** SVG çıktı özelliği
6. **Overlay Sistemi:** Anatomik referans şablonları
7. **Post-Processing:** Otomatik düzeltme önerileri
8. **Geri Bildirim Sistemi:** Kullanıcı değerlendirmesi ve yeniden çizim

## Notlar

- Validasyon sistemi şu anda placeholder landmark'lar kullanıyor
- Gerçek landmark tespiti entegre edildiğinde skorlar daha doğru olacak
- Tüm validasyon metrikleri normalize edilmiş koordinatlar (0-1000) kullanıyor
- Sistem hata toleranslıdır - validasyon başarısız olsa bile analiz devam eder

