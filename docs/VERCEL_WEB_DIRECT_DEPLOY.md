# 🌐 Vercel Web'den Direkt Deploy (GitHub Olmadan)

## 🚀 Adım 1: Vercel'e Giriş

1. Tarayıcınızda [vercel.com](https://vercel.com) adresine gidin
2. **"Sign Up"** veya **"Log In"** butonuna tıklayın
3. **"Continue with GitHub"** seçeneğini seçin (GitHub hesabınızla giriş yapın)

## 📦 Adım 2: Projeyi Yükle

1. Vercel dashboard'da **"Add New..."** → **"Project"** tıklayın
2. **Üstte "Deploy" sekmesine** tıklayın (Git import değil!)
3. **Proje klasörünüzü sürükleyip bırakın** veya **"Browse"** ile seçin:
   ```
   C:\Users\oktay\Desktop\OKO YAPAY ZEKA\Facial-Reconstruction-AI-Dokumantasyon\Proje-Kaynak-Dosyalari
   ```

## ⚙️ Adım 3: Proje Ayarları

Vercel otomatik olarak Next.js'i algılayacak. Şunları kontrol edin:

- **Framework Preset**: Next.js ✅
- **Root Directory**: `.` (nokta) ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅

## 🔐 Adım 4: Environment Variables (ÇOK ÖNEMLİ!)

**"Environment Variables"** bölümüne tıklayın ve şu 5 değişkeni ekleyin:

### 1. Supabase Variables

**NEXT_PUBLIC_SUPABASE_URL**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `.env.local` dosyanızdan kopyalayın
- Environment: ☑ Production ☑ Preview ☑ Development (hepsini seçin)
- **"Save"** tıklayın

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `.env.local` dosyanızdan kopyalayın
- Environment: ☑ Production ☑ Preview ☑ Development
- **"Save"** tıklayın

**SUPABASE_SERVICE_ROLE_KEY**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: `.env.local` dosyanızdan kopyalayın
- Environment: ☑ Production ☑ Preview ☑ Development
- **"Save"** tıklayın

### 2. AI API Keys

**OPENAI_API_KEY**
- Name: `OPENAI_API_KEY`
- Value: `.env.local` dosyanızdan kopyalayın
- Environment: ☑ Production ☑ Preview ☑ Development
- **"Save"** tıklayın

**ANTHROPIC_API_KEY**
- Name: `ANTHROPIC_API_KEY`
- Value: `.env.local` dosyanızdan kopyalayın
- Environment: ☑ Production ☑ Preview ☑ Development
- **"Save"** tıklayın

## 🚀 Adım 5: Deploy!

1. Tüm 5 environment variable'ı ekledikten sonra
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
2. ✅ "Add New Project" → **"Deploy" sekmesi** (Git değil!)
3. ✅ Proje klasörünüzü sürükle-bırak
4. ✅ Environment Variables ekle (5 tane)
5. ✅ Deploy!

**Toplam süre: 5-10 dakika!** 🚀

---

## 🆘 "Deploy" Sekmesi Bulamıyorsanız

Eğer "Deploy" sekmesi görünmüyorsa:

1. **"Add New..."** → **"Project"** tıklayın
2. Üstte **"Import Git Repository"** ve **"Deploy"** sekmeleri olmalı
3. **"Deploy"** sekmesine tıklayın
4. Veya direkt olarak: [vercel.com/new](https://vercel.com/new) adresine gidin

