# 🌐 Vercel Web Arayüzü ile Deploy - En Kolay Yol

## 🚀 Adım 1: Vercel'e Giriş

1. Tarayıcınızda [vercel.com](https://vercel.com) adresine gidin
2. **"Sign Up"** veya **"Log In"** butonuna tıklayın
3. **"Continue with GitHub"** seçeneğini seçin
4. GitHub hesabınızla giriş yapın

## 📦 Adım 2: Projeyi Yükle (Git Olmadan!)

1. Vercel dashboard'da **"Add New..."** → **"Project"** tıklayın
2. **"Deploy"** sekmesine gidin (üstte)
3. **"Browse"** veya **"Drag & Drop"** ile proje klasörünüzü seçin:
   ```
   C:\Users\oktay\Desktop\OKO YAPAY ZEKA\Facial-Reconstruction-AI-Dokumantasyon\Proje-Kaynak-Dosyalari
   ```
4. Klasörü sürükleyip bırakın veya "Browse" ile seçin

## ⚙️ Adım 3: Proje Ayarları

Vercel otomatik olarak Next.js'i algılayacak. Şunları kontrol edin:

- **Framework Preset**: Next.js ✅
- **Root Directory**: `.` (nokta - zaten doğru klasördeyiz) ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅

## 🔐 Adım 4: Environment Variables (ÇOK ÖNEMLİ!)

**"Environment Variables"** bölümüne tıklayın ve şunları ekleyin:

### 1. Supabase Variables

**NEXT_PUBLIC_SUPABASE_URL**
- Value: `.env.local` dosyanızdan kopyalayın
- Environment: Production, Preview, Development (hepsini seçin) ✅
- **Save** tıklayın

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Value: `.env.local` dosyanızdan kopyalayın
- Environment: Production, Preview, Development ✅
- **Save** tıklayın

**SUPABASE_SERVICE_ROLE_KEY**
- Value: `.env.local` dosyanızdan kopyalayın
- Environment: Production, Preview, Development ✅
- **Save** tıklayın

### 2. AI API Keys

**OPENAI_API_KEY**
- Value: `.env.local` dosyanızdan kopyalayın
- Environment: Production, Preview, Development ✅
- **Save** tıklayın

**ANTHROPIC_API_KEY**
- Value: `.env.local` dosyanızdan kopyalayın
- Environment: Production, Preview, Development ✅
- **Save** tıklayın

## 🚀 Adım 5: Deploy!

1. Tüm environment variable'ları ekledikten sonra
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

---

## 📝 Özet

1. ✅ [vercel.com](https://vercel.com) → GitHub ile giriş
2. ✅ "Add New Project" → "Deploy" sekmesi
3. ✅ Proje klasörünüzü sürükle-bırak
4. ✅ Environment Variables ekle (5 tane)
5. ✅ Deploy!

**Toplam süre: 5-10 dakika!** 🚀

