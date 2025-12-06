# 🚀 GitHub Desktop ile Yükleme - Adım Adım

## ✅ GitHub Desktop Yüklendi - Şimdi Ne Yapmalı?

### Adım 1: GitHub Desktop'u Aç

1. GitHub Desktop uygulamasını açın
2. İlk açılışta GitHub hesabınızla giriş yapın
   - Eğer GitHub hesabınız yoksa: "Create your free account" tıklayın

### Adım 2: Repository Oluştur

1. GitHub Desktop'ta **"File"** → **"Add Local Repository"** tıklayın
2. **"Choose..."** butonuna tıklayın
3. Şu klasörü seçin:
   ```
   C:\Users\oktay\Desktop\OKO YAPAY ZEKA\Facial-Reconstruction-AI-Dokumantasyon\Proje-Kaynak-Dosyalari
   ```
4. **"Add repository"** butonuna tıklayın

### Adım 3: İlk Commit

1. Sol altta değişiklikler listelenecek
2. Sol üstte **"Summary"** alanına şunu yazın:
   ```
   Initial commit: Facial Reconstruction AI project
   ```
3. **"Commit to main"** butonuna tıklayın

### Adım 4: GitHub'a Yükle

1. Üst menüde **"Publish repository"** butonuna tıklayın
2. Açılan pencerede:
   - **Name**: `facial-reconstruction-ai` (veya istediğiniz isim)
   - **Description**: "AI Destekli Yüz Rekonstrüksiyon Platformu"
   - **☑ Keep this code private** (Güvenlik için önemli!)
3. **"Publish Repository"** butonuna tıklayın

### ✅ Tamamlandı!

Kodlarınız GitHub'da! Şimdi Vercel'e bağlayabilirsiniz.

---

## 🎯 Sonraki Adım: Vercel'e Deploy

1. [vercel.com](https://vercel.com) → GitHub ile giriş yapın
2. **"Add New..."** → **"Project"** seçin
3. Repository'nizi seçin (`facial-reconstruction-ai`)
4. **Root Directory**: `Proje-Kaynak-Dosyalari` yazın
5. **Environment Variables** ekleyin (`.env.local` dosyanızdaki değerler)
6. **"Deploy"** butonuna tıklayın

---

## 📝 Environment Variables (Vercel'de Eklenecek)

Vercel'de şu environment variable'ları ekleyin:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

Her birini `.env.local` dosyanızdan kopyalayıp Vercel'e ekleyin.

---

## 🆘 Sorun mu var?

- **"Repository already exists"** hatası: GitHub'da zaten bir repository var, farklı isim kullanın
- **"Authentication failed"**: GitHub Desktop'ta tekrar giriş yapın
- **Dosyalar görünmüyor**: `.gitignore` dosyası bazı dosyaları gizliyor olabilir (normal)

