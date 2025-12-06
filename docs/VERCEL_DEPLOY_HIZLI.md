# ⚡ Vercel'e Hızlı Deploy Rehberi

GitHub'a yükleme tamamlandıktan sonra bu adımları takip edin.

## 🚀 Adım 1: Vercel'e Giriş

1. [vercel.com](https://vercel.com) adresine gidin
2. **"Sign Up"** veya **"Log In"** butonuna tıklayın
3. **"Continue with GitHub"** seçeneğini seçin
4. GitHub hesabınızla giriş yapın

## 📦 Adım 2: Projeyi Import Et

1. Vercel dashboard'da **"Add New..."** → **"Project"** tıklayın
2. GitHub repository'leriniz listelenecek
3. **`facial-reconstruction-ai`** repository'sini bulun ve **"Import"** tıklayın

## ⚙️ Adım 3: Proje Ayarları

Vercel otomatik olarak Next.js'i algılayacak. Şunları kontrol edin:

- **Framework Preset**: Next.js ✅
- **Root Directory**: `Proje-Kaynak-Dosyalari` ⚠️ **ÖNEMLİ!**
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

**ÖNEMLİ**: Root Directory alanına `Proje-Kaynak-Dosyalari` yazın!

## 🔐 Adım 4: Environment Variables

**"Environment Variables"** bölümüne tıklayın ve şunları ekleyin:

### 1. Supabase Variables

```
NEXT_PUBLIC_SUPABASE_URL
```
- Value: Supabase proje URL'iniz (`.env.local`'den)
- Environment: Production, Preview, Development (hepsini seçin)

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- Value: Supabase anon key (`.env.local`'den)
- Environment: Production, Preview, Development

```
SUPABASE_SERVICE_ROLE_KEY
```
- Value: Supabase service role key (`.env.local`'den)
- Environment: Production, Preview, Development

### 2. AI API Keys

```
OPENAI_API_KEY
```
- Value: OpenAI API key (`.env.local`'den)
- Environment: Production, Preview, Development

```
ANTHROPIC_API_KEY
```
- Value: Anthropic API key (`.env.local`'den)
- Environment: Production, Preview, Development

**Her birini ekledikten sonra "Save" butonuna tıklayın!**

## 🚀 Adım 5: Deploy

1. Tüm ayarları kontrol edin
2. **"Deploy"** butonuna tıklayın
3. Deploy işlemi 2-5 dakika sürebilir
4. Tamamlandığında **"Visit"** butonuna tıklayarak sitenizi görüntüleyin!

## ✅ Başarılı!

Artık siteniz canlıda! URL: `https://your-project.vercel.app`

---

## 🔧 Son Ayarlar

### Supabase CORS

1. [Supabase Dashboard](https://app.supabase.com) → Projenizi seçin
2. **Settings** → **API** → **CORS** bölümüne gidin
3. Vercel domain'inizi ekleyin: `https://your-project.vercel.app`
4. **Save** tıklayın

### Test Etme

Deploy edilen sitede şunları test edin:
- ✅ Ana sayfa açılıyor mu?
- ✅ Giriş yapabiliyor musunuz?
- ✅ Yeni olgu oluşturabiliyor musunuz?
- ✅ Fotoğraf yükleyebiliyor musunuz?
- ✅ AI analizi çalışıyor mu?

---

## 🆘 Sorun Giderme

### Build Hatası

- **Hata**: `Module not found`
  - **Çözüm**: `package.json`'da tüm dependencies'in olduğundan emin olun

### Environment Variable Hatası

- **Hata**: `Environment variable not found`
  - **Çözüm**: Vercel'de tüm environment variable'ları eklediğinizden emin olun

### Supabase Bağlantı Hatası

- **Hata**: `Failed to fetch`
  - **Çözüm**: Supabase CORS ayarlarında Vercel domain'inizi eklediğinizden emin olun

---

## 🎉 Tebrikler!

Projeniz artık canlıda! Her GitHub push'unda otomatik olarak güncellenecektir.

