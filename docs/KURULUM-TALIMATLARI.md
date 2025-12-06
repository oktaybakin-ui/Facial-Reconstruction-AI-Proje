# Facial Reconstruction AI - Kurulum Talimatları

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler

- Node.js 18 veya üzeri
- npm veya yarn
- Git (opsiyonel)
- Supabase hesabı (ücretsiz)
- OpenAI API key
- Anthropic API key

### 2. Projeyi Kurma

```bash
# Proje dizinine git
cd facial-reconstruction-ai/facial-reconstruction-ai

# Bağımlılıkları yükle
npm install

# Veya yarn kullanıyorsanız
yarn install
```

### 3. Environment Variables Ayarlama

`.env.local` dosyasını proje root dizininde oluşturun:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-api03-...

# Admin Configuration (virgülle ayırarak birden fazla ekleyebilirsiniz)
ADMIN_EMAILS=admin@example.com,oktaybakin@gmail.com
```

**Not:** `.env.local` dosyası Git'e commit edilmemelidir. Zaten `.gitignore` dosyasında olmalıdır.

### 4. Supabase Kurulumu

#### 4.1. Veritabanı Tablolarını Oluşturma

Supabase Dashboard > SQL Editor'e gidin ve sırasıyla şu SQL dosyalarını çalıştırın:

1. **Temel Tablolar** (Supabase Dashboard'dan oluşturulmalı veya mevcut SQL scriptlerini kullanın):
   - `user_profiles` tablosu
   - `cases` tablosu
   - `case_photos` tablosu
   - `ai_results` tablosu
   - `medical_sources` tablosu

2. **Yeni Alanları Ekleme:**
   - `add_case_fields.sql` - Vaka bilgileri alanları
   - `add_followup_fields.sql` - Takip ve patoloji alanları

#### 4.2. Storage Bucket Oluşturma

1. Supabase Dashboard > Storage'a gidin
2. Yeni bucket oluştur:
   - **Bucket Name:** `case-photos`
   - **Public bucket:** ✅ Evet
   - **File size limit:** İstediğiniz maksimum boyut (örn: 10MB)
   - **Allowed MIME types:** `image/*`

#### 4.3. Row Level Security (RLS) Politikaları

Supabase Dashboard > Authentication > Policies'ten şu politikaları oluşturun:

**cases tablosu:**
- Users can only see their own cases
- Users can only insert their own cases
- Users can only update their own cases
- Users can only delete their own cases

**case_photos tablosu:**
- Users can only see photos of their own cases
- Users can only insert photos for their own cases

**ai_results tablosu:**
- Users can only see AI results of their own cases
- Service role can insert/update AI results

**medical_sources tablosu:**
- Everyone can read active sources
- Only admins can insert/update/delete (app layer'da kontrol ediliyor)

### 5. Uygulamayı Başlatma

```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

---

## 📋 Adım Adım Test

### 1. İlk Kullanıcı Kaydı

1. `http://localhost:3000/auth/register` adresine gidin
2. Formu doldurun:
   - Email ve şifre
   - TC Kimlik No
   - Ad Soyad
   - Uzmanlık alanı
   - Kurum bilgileri
   - KVKK/GDPR onayı
3. Kurum kimlik kartı yükleyin
4. Kayıt olun

### 2. Admin Yetkisi Verme

`.env.local` dosyasındaki `ADMIN_EMAILS` değişkenine email adresinizi ekleyin:

```env
ADMIN_EMAILS=your-email@example.com
```

Uygulamayı yeniden başlatın.

### 3. İlk Olgu Ekleme

1. Dashboard'a gidin (`/dashboard`)
2. "Yeni Olgu Ekle" butonuna tıklayın
3. Olgu bilgilerini doldurun
4. Pre-op fotoğraf yükleyin
5. Kaydedin

### 4. AI Analizi Çalıştırma

1. Olgu detay sayfasına gidin
2. Fotoğraf üzerinde lezyonu işaretleyin (opsiyonel)
3. "AI Analizi Çalıştır" butonuna tıklayın
4. Sonuçları inceleyin

### 5. Bilgi Tabanı Kaynağı Ekleme (Admin)

1. "Bilgi Tabanı" linkine tıklayın
2. "Yeni Kaynak Ekle" butonuna tıklayın
3. Kaynak bilgilerini doldurun
4. Kaydedin

---

## 🔧 Troubleshooting

### Sorun: "Supabase connection error"

**Çözüm:**
- `.env.local` dosyasındaki Supabase URL ve key'lerin doğru olduğundan emin olun
- Supabase projenizin aktif olduğunu kontrol edin

### Sorun: "Storage bucket not found"

**Çözüm:**
- Supabase Dashboard'da `case-photos` bucket'ının oluşturulduğundan emin olun
- Bucket'ın public olduğunu kontrol edin

### Sorun: "AI API error"

**Çözüm:**
- OpenAI ve Anthropic API key'lerinin geçerli olduğundan emin olun
- API quota'nızın yeterli olduğunu kontrol edin
- Rate limit hatası alıyorsanız, biraz bekleyip tekrar deneyin

### Sorun: "Admin yetkisi yok"

**Çözüm:**
- `.env.local` dosyasında email adresinizin `ADMIN_EMAILS` listesinde olduğundan emin olun
- Uygulamayı yeniden başlatın (environment variables değişikliği için)

### Sorun: "Database column does not exist"

**Çözüm:**
- SQL dosyalarını (`add_case_fields.sql`, `add_followup_fields.sql`) Supabase'de çalıştırdığınızdan emin olun
- Supabase Dashboard > Table Editor'den tablo yapısını kontrol edin

---

## 📦 Production Deployment

### Vercel (Önerilen)

1. GitHub'a push edin
2. Vercel'e import edin
3. Environment variables'ı ekleyin
4. Deploy edin

### Diğer Platformlar

- **Netlify:** Next.js build komutlarını kullanın
- **Railway:** Docker veya direkt Node.js deployment
- **AWS/Google Cloud:** Container veya serverless deployment

**Önemli Production Ayarları:**
- Environment variables'ı platform dashboard'undan ekleyin
- Supabase production URL'lerini kullanın
- Rate limiting ve caching ayarlarını yapın

---

## 🔐 Güvenlik Kontrol Listesi

- [ ] `.env.local` dosyası Git'e commit edilmedi
- [ ] Production'da farklı Supabase projesi kullanılıyor
- [ ] API key'ler güvenli şekilde saklanıyor
- [ ] RLS politikaları doğru ayarlandı
- [ ] Storage bucket'ı doğru izinlerle ayarlandı
- [ ] Admin email listesi güvenli tutuluyor
- [ ] HTTPS kullanılıyor (production)
- [ ] CORS ayarları yapıldı (gerekirse)

---

## 📞 Destek

Sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Supabase Dashboard'daki error loglarını inceleyin
3. Browser Developer Tools'u açın
4. Network tab'ından API isteklerini kontrol edin

---

**Son Güncelleme:** Aralık 2024

