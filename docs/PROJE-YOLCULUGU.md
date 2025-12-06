# Facial Reconstruction AI Platform - Proje Yolculuğu

## 📋 Proje Özeti

**Facial Reconstruction AI**, yüz bölgesi cilt defektleri için lokal flep rekonstrüksiyon kararlarında sağlık profesyonellerine AI destekli öneriler sunan, tam özellikli bir web platformudur.

### Teknoloji Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI Services**: 
  - OpenAI GPT-4o/GPT-5o Vision (görüntü analizi ve flep önerileri)
  - Anthropic Claude 3.5 Sonnet (güvenlik incelemesi)
- **Validation**: Zod

---

## 🎯 Proje Amaçları

1. Sağlık profesyonellerine (plastik cerrahi, KBB, dermatoloji, CMF) yüz defekt rekonstrüksiyonunda AI destekli karar verme yardımı
2. Lokal flep seçeneklerini analiz edip önerme
3. Görüntü analizi ile lezyon konumunu tespit etme
4. Flep çizimlerini fotoğraf üzerinde göstererek cerrahi planlama desteği
5. Tıbbi kaynak bilgi tabanı ile RAG (Retrieval-Augmented Generation) özelliği
6. Olgu takibi ve hatırlatmalar

---

## 📅 Proje Geliştirme Süreci

### 1. İlk Aşama: Temel Yapı ve Kimlik Doğrulama

**Tamamlanan İşler:**
- Next.js 14 projesi kurulumu (App Router, TypeScript)
- Supabase entegrasyonu (Auth, Database, Storage)
- Kullanıcı kayıt/giriş sistemi
  - Email + şifre ile kayıt
  - TC Kimlik No metadata'sında saklama
  - Kurum kimlik kartı yükleme
  - KVKK/GDPR onayı
- Kullanıcı profil yönetimi (full_name, specialty, institution, vb.)
- Email doğrulama sistemi (`is_verified` kontrolü)

**Oluşturulan Dosyalar:**
- `app/auth/register/page.tsx` - Kayıt sayfası
- `app/auth/login/page.tsx` - Giriş sayfası
- `app/api/auth/register/route.ts` - Kayıt API
- `app/api/auth/login/route.ts` - Giriş API
- `lib/auth.ts` - Auth utility fonksiyonları
- `lib/supabaseClient.ts` - Supabase client yapılandırması
- `types/cases.ts` - TypeScript type tanımları
- `lib/validators.ts` - Zod validation schema'ları

### 2. İkinci Aşama: Olgu Yönetimi (Cases)

**Tamamlanan İşler:**
- Olgu oluşturma formu
  - Olgu kodu, yaş, cinsiyet, bölge
  - Defekt boyutları (genişlik, yükseklik, derinlik)
  - Önceki cerrahi/radyoterapi öyküsü
  - Kritik yapılar, estetik zon bilgisi
  - Pre-op fotoğraf yükleme
- Dashboard
  - Olgu listesi
  - İstatistikler (toplam, planlı, opere, takip)
  - Filtreleme ve arama
- Olgu detay sayfası
- Olgu düzenleme ve silme

**Veritabanı Şeması:**
```sql
-- cases tablosu
- id, user_id, case_code
- age, sex, region
- width_mm, height_mm, depth
- previous_surgery, previous_radiotherapy
- pathology_suspected, critical_structures
- high_aesthetic_zone, status
- created_at, updated_at

-- case_photos tablosu
- id, case_id, type (preop/postop)
- url, created_at
```

**Oluşturulan Dosyalar:**
- `app/cases/new/page.tsx` - Yeni olgu formu
- `app/cases/[id]/page.tsx` - Olgu detay sayfası
- `app/cases/[id]/edit/page.tsx` - Olgu düzenleme
- `app/dashboard/page.tsx` - Dashboard (server component)
- `app/dashboard/DashboardContent.tsx` - Dashboard client component
- `app/api/cases/route.ts` - Olgu CRUD API
- `app/api/cases/[id]/route.ts` - Tekil olgu API

### 3. Üçüncü Aşama: AI Entegrasyonu

**AI Pipeline Mimarisi:**

1. **Vision Analysis** (`lib/ai/vision.ts`)
   - OpenAI GPT-4o Vision API kullanımı
   - Pre-op fotoğraf analizi
   - Anatomik bölge tespiti
   - Defekt boyutu tahmini
   - Kritik yapılar tespiti
   - Estetik zon sınıflandırması
   - Lezyon konumu tespiti (manuel veya otomatik)

2. **Decision Making** (`lib/ai/decision.ts`)
   - OpenAI GPT-4o ile flep önerileri
   - Her flep için:
     - Uygunluk skoru (0-100)
     - Kategori (en_uygun, uygun, alternatif)
     - Avantajlar, dezavantajlar, dikkat edilmesi gerekenler
     - Cerrahi teknik detayları
     - Flep çizim koordinatları
     - YouTube video linkleri

3. **Safety Review** (`lib/ai/safety.ts`)
   - Anthropic Claude 3.5 Sonnet ile güvenlik kontrolü
   - Halüsinasyon riski değerlendirmesi
   - Tehlikeli önerileri filtreleme
   - Yasal uyarılar ekleme

4. **Orchestrator** (`lib/ai/orchestrator.ts`)
   - Tüm AI modüllerini koordine eder
   - Manuel lezyon işaretleme desteği
   - Hata yönetimi ve fallback mekanizmaları
   - Sonuçları veritabanına kaydetme

**Önemli Özellikler:**
- Manuel lezyon işaretleme (rectangle, circle, polygon)
- AI'ın lezyon konumunu kullanıcı işaretlemesiyle eşleştirme
- Flep çizimleri fotoğraf üzerinde gösterimi
- Detaylı cerrahi teknik açıklamaları
- Video link entegrasyonu

**Oluşturulan Dosyalar:**
- `lib/ai/vision.ts` - Görüntü analizi
- `lib/ai/decision.ts` - Flep önerileri
- `lib/ai/safety.ts` - Güvenlik incelemesi
- `lib/ai/orchestrator.ts` - AI orchestration
- `app/api/cases/[id]/analyze/route.ts` - AI analiz API
- `app/cases/[id]/UnifiedImageOverlay.tsx` - Görüntü üzerinde çizim komponenti

**AI Sonuç Şeması:**
```sql
-- ai_results tablosu
- id, case_id
- vision_summary (JSONB)
- flap_suggestions (JSONB)
- safety_review (JSONB)
- created_at
```

### 4. Dördüncü Aşama: Manuel Lezyon İşaretleme ve Gelişmiş Çizimler

**Tamamlanan İşler:**
- Canvas API ile lezyon işaretleme
  - Rectangle, circle, polygon şekilleri
  - Drag & drop ile çizim
  - Manuel koordinat girişi
- Flep çizimlerinin fotoğraf üzerinde gösterimi
  - Defekt alanı (kırmızı)
  - Kesi çizgileri (mavi, kesikli)
  - Flep alanları (yeşil, yarı saydam)
  - Donor alanı (turuncu)
  - Oklar (flep hareket yönü)
- AI'ın manuel işaretlemeyi kullanması
  - Vision model atlanır, manuel koordinatlar kullanılır
  - Flep önerileri manuel konuma göre hizalanır

**Oluşturulan Dosyalar:**
- `app/cases/[id]/UnifiedImageOverlay.tsx` - Görüntü overlay komponenti
- `app/cases/[id]/CaseDetailContent.tsx` - Olgu detay içeriği (güncellendi)

### 5. Beşinci Aşama: Tıbbi Bilgi Tabanı ve RAG

**Tamamlanan İşler:**
- Tıbbi kaynak yönetimi sistemi
  - Kaynak ekleme (metin, makale, kitap, kılavuz, araştırma, PDF)
  - Düzenleme ve silme
  - Toplu yükleme (JSON)
- Admin yetki sistemi
  - Sadece admin kullanıcılar kaynak ekleyebilir
  - Environment variable ile admin email listesi
- RAG (Retrieval-Augmented Generation) entegrasyonu
  - Bölge ve anahtar kelimeye göre kaynak arama
  - AI prompt'larına ilgili kaynakları ekleme
  - Flep önerilerini tıbbi kaynaklarla destekleme

**Veritabanı Şeması:**
```sql
-- medical_sources tablosu
- id, user_id (admin)
- title, content, source_type
- source_url, keywords
- region_focus, flap_types
- is_active, created_at, updated_at
```

**Oluşturulan Dosyalar:**
- `types/medical.ts` - Medical source type tanımları
- `lib/medical/sources.ts` - Kaynak yönetimi fonksiyonları
- `lib/auth/admin.ts` - Admin yetki kontrolü
- `app/api/admin/check/route.ts` - Admin durumu API
- `app/api/medical-sources/route.ts` - Kaynak CRUD API
- `app/api/medical-sources/[id]/route.ts` - Tekil kaynak API
- `app/knowledge-base/page.tsx` - Bilgi tabanı listesi
- `app/knowledge-base/new/page.tsx` - Yeni kaynak formu
- `app/knowledge-base/bulk-upload/page.tsx` - Toplu yükleme sayfası

### 6. Altıncı Aşama: Olgu Takibi ve Hatırlatmalar

**Tamamlanan İşler:**
- Vaka bilgileri genişletildi
  - Vaka tarihi ve saati
  - Vaka süresi (dakika)
  - Hasta özel durumu/özelliği
- Operasyon ve takip bilgileri
  - Operasyon tarihi
  - Kontrol süresi (operasyondan kaç gün sonra, varsayılan 21)
- Patoloji takibi
  - Patoloji sonucu çıktı mı?
  - Patoloji sonuç tarihi
  - Patoloji sonucu detayı
- Dashboard hatırlatmaları
  - Kontrol günü gelen vakalar için uyarı
  - Operasyondan 21+ gün geçmiş vakalar için patoloji uyarısı
  - Olgu listesinde badge'ler

**Yeni Veritabanı Alanları:**
```sql
ALTER TABLE cases ADD COLUMN:
- case_date (DATE)
- case_time (TIME)
- case_duration_minutes (INTEGER)
- patient_special_condition (TEXT)
- operation_date (DATE)
- followup_days (INTEGER, DEFAULT 21)
- pathology_result_available (BOOLEAN)
- pathology_result_date (DATE)
- pathology_result (TEXT)
```

**Oluşturulan/Güncellenen Dosyalar:**
- `lib/utils/followup.ts` - Takip ve hatırlatma utility fonksiyonları
- `app/dashboard/DashboardContent.tsx` - Hatırlatma UI'ları eklendi
- `app/cases/new/page.tsx` - Yeni alanlar eklendi
- `app/cases/[id]/edit/page.tsx` - Yeni alanlar eklendi
- SQL dosyaları:
  - `add_case_fields.sql` - Vaka bilgileri alanları
  - `add_followup_fields.sql` - Takip ve patoloji alanları

---

## 🔐 Güvenlik Özellikleri

1. **Kimlik Doğrulama**
   - Supabase Auth ile email + şifre
   - JWT token tabanlı oturum yönetimi
   - Email doğrulama zorunluluğu

2. **Yetkilendirme**
   - Row Level Security (RLS) politikaları
   - Kullanıcılar sadece kendi olgularını görebilir/düzenleyebilir
   - Admin yetkisi ile kaynak yönetimi

3. **Veri Validasyonu**
   - Zod schema ile tüm API input validasyonu
   - TypeScript ile tip güvenliği
   - XSS ve SQL injection koruması (Supabase)

4. **Yasal Uyarılar**
   - KVKK/GDPR onayı zorunluluğu
   - Tıbbi karar destek uyarıları
   - AI önerilerinde yasal sorumluluk reddi

---

## 🎨 UI/UX Özellikleri

1. **Tasarım**
   - Modern, minimal, med-tech estetiği
   - Glassmorphism efektleri
   - Gradient arka planlar
   - Responsive tasarım (mobil uyumlu)

2. **Dil Desteği**
   - UI metinleri Türkçe
   - Kod ve değişken isimleri İngilizce
   - AI çıktıları Türkçe

3. **Kullanıcı Deneyimi**
   - Drag & drop ile lezyon işaretleme
   - Görsel flep çizimleri
   - Video link entegrasyonu
   - Hatırlatma bildirimleri
   - Yükleme animasyonları

---

## 📊 Veritabanı Yapısı

### Ana Tablolar

1. **user_profiles**
   - Kullanıcı profil bilgileri
   - Uzmanlık, kurum, telefon, vb.

2. **cases**
   - Olgu bilgileri
   - Vaka, operasyon, takip bilgileri

3. **case_photos**
   - Pre-op ve post-op fotoğraflar
   - Supabase Storage URL'leri

4. **ai_results**
   - AI analiz sonuçları
   - Vision summary, flap suggestions, safety review

5. **medical_sources**
   - Tıbbi bilgi tabanı kaynakları
   - RAG için kullanılır

### İlişkiler
- `cases.user_id` → `user_profiles.id`
- `case_photos.case_id` → `cases.id`
- `ai_results.case_id` → `cases.id`
- `medical_sources.user_id` → `user_profiles.id`

---

## 🔧 Kurulum ve Yapılandırma

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı
- OpenAI API key
- Anthropic API key

### Adımlar

1. **Projeyi Klonla/İndir**
```bash
cd facial-reconstruction-ai/facial-reconstruction-ai
npm install
```

2. **Environment Variables**
`.env.local` dosyasını oluştur:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# Admin
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

3. **Veritabanı Kurulumu**
- Supabase Dashboard'da SQL Editor'ü aç
- `add_case_fields.sql` dosyasını çalıştır
- `add_followup_fields.sql` dosyasını çalıştır
- RLS politikalarını ayarla

4. **Storage Bucket Oluştur**
- Supabase Dashboard'da Storage bölümüne git
- `case-photos` bucket'ı oluştur
- Public access ayarla

5. **Uygulamayı Başlat**
```bash
npm run dev
```

---

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş

### Cases
- `GET /api/cases` - Tüm olgular (kullanıcıya ait)
- `POST /api/cases` - Yeni olgu oluştur
- `GET /api/cases/[id]` - Olgu detayı
- `PUT /api/cases/[id]` - Olgu güncelle
- `DELETE /api/cases/[id]` - Olgu sil
- `POST /api/cases/[id]/analyze` - AI analizi çalıştır
- `POST /api/cases/[id]/postop` - Post-op foto yükle

### Medical Sources (Admin Only)
- `GET /api/medical-sources` - Tüm kaynaklar
- `POST /api/medical-sources` - Yeni kaynak
- `PUT /api/medical-sources/[id]` - Kaynak güncelle
- `DELETE /api/medical-sources/[id]` - Kaynak sil

### Admin
- `GET /api/admin/check?email=...` - Admin durumu kontrol et

---

## 🚀 Özellikler

### Tamamlanan Özellikler ✅
- [x] Kullanıcı kayıt/giriş sistemi
- [x] Olgu yönetimi (CRUD)
- [x] Pre-op/post-op fotoğraf yükleme
- [x] AI görüntü analizi
- [x] AI flep önerileri
- [x] Güvenlik incelemesi
- [x] Manuel lezyon işaretleme
- [x] Flep çizimleri fotoğraf üzerinde
- [x] Cerrahi teknik detayları
- [x] Video link entegrasyonu
- [x] Tıbbi bilgi tabanı (RAG)
- [x] Admin yetki sistemi
- [x] Toplu kaynak yükleme
- [x] Vaka takip bilgileri
- [x] Kontrol günü hatırlatmaları
- [x] Patoloji takibi uyarıları
- [x] Dashboard istatistikleri

### Gelecek Özellikler 💡
- [ ] Email bildirimleri (kontrol günü, patoloji)
- [ ] PDF rapor oluşturma
- [ ] Olgu karşılaştırma
- [ ] Analitik ve raporlama
- [ ] Multi-tenant (kurumsal) yapı
- [ ] Mobil uygulama
- [ ] Vector embeddings ile gelişmiş RAG

---

## 📚 Kullanılan Teknolojiler

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Styling
- **React Canvas** - Görüntü çizimleri

### Backend
- **Next.js API Routes** - Serverless API
- **Supabase** - Backend as a Service
  - PostgreSQL veritabanı
  - Authentication
  - Storage
  - Row Level Security

### AI Services
- **OpenAI GPT-4o Vision** - Görüntü analizi
- **OpenAI GPT-4o** - Flep önerileri
- **Anthropic Claude 3.5 Sonnet** - Güvenlik incelemesi

### Validation & Utilities
- **Zod** - Schema validation
- **Buffer** - Base64 encoding (AI image handling)

---

## 🎯 Kullanım Senaryoları

1. **Yeni Olgu Ekleme**
   - Doktor olgu bilgilerini girer
   - Pre-op fotoğraf yükler
   - Manuel olarak lezyonu işaretler
   - AI analizi çalıştırır
   - Flep önerilerini inceler
   - Cerrahi planını oluşturur

2. **Operasyon Sonrası**
   - Operasyon tarihini girer
   - Kontrol süresini ayarlar (varsayılan 21 gün)
   - Post-op fotoğraf yükler
   - Patoloji sonuçlarını girer

3. **Takip**
   - Dashboard'da hatırlatmaları görür
   - Kontrol günü gelen vakaları takip eder
   - Patoloji sonucu beklenen vakaları kontrol eder

4. **Bilgi Tabanı Yönetimi (Admin)**
   - Yeni tıbbi kaynak ekler
   - Toplu yükleme yapar
   - Kaynakları düzenler/siler

---

## 🐛 Bilinen Sorunlar ve Çözümler

1. **Supabase Storage Public Access**
   - Çözüm: Storage bucket'ında public access açık olmalı
   - Veya signed URL kullanılmalı

2. **AI API Rate Limits**
   - OpenAI ve Anthropic rate limit'leri göz önünde bulundurulmalı
   - Retry mekanizması implementasyonu önerilir

3. **Image Upload Size**
   - Büyük görüntü dosyaları için compression gerekebilir
   - Client-side resize önerilir

---

## 📞 Destek ve İletişim

Bu proje, sağlık profesyonellerine AI destekli karar verme yardımı sağlamak amacıyla geliştirilmiştir. 

**Önemli Notlar:**
- Bu platform bir karar destek sistemidir, tıbbi tavsiye değildir
- Tüm AI önerileri doktorun kendi klinik değerlendirmesi ile birlikte kullanılmalıdır
- KVKK/GDPR gerekliliklerine uygun kullanım zorunludur

---

## 📄 Lisans

Bu proje özel bir projedir. Kullanım hakları sahibine aittir.

---

## 🙏 Teşekkürler

- OpenAI ve Anthropic'e sağladıkları AI servisleri için
- Supabase ekibine sağladıkları harika altyapı için
- Next.js ve React topluluğuna

---

**Son Güncelleme:** Aralık 2024
**Proje Durumu:** Aktif Geliştirme
**Versiyon:** 1.0.0

