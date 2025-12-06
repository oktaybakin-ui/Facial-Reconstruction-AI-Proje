# 🚀 Proje Yayınlama Rehberi

Bu rehber, Facial Reconstruction AI projenizi GitHub'a yükleyip Vercel üzerinden yayınlamanız için adım adım talimatlar içerir.

## ⚠️ ÖNEMLİ: GitHub Pages Next.js için uygun değil!

**GitHub Pages sadece statik siteler için çalışır.** Next.js projeniz server-side rendering ve API routes kullandığı için GitHub Pages'de çalışmaz.

**Önerilen Çözüm**: GitHub'a kod yükleyin, Vercel ile hosting yapın (otomatik ve ücretsiz).

Detaylar için `GITHUB_PAGES_ALTERNATIF.md` dosyasına bakın.

## 📋 İçindekiler

1. [GitHub'a Yükleme](#1-githuba-yükleme)
2. [Vercel'e Deploy Etme](#2-vercele-deploy-etme)
3. [Environment Variables Ayarlama](#3-environment-variables-ayarlama)
4. [Supabase Ayarları](#4-supabase-ayarları)
5. [Son Kontroller](#5-son-kontroller)

---

## 1. GitHub'a Yükleme

### Adım 1.1: .gitignore Dosyası Kontrolü

Proje klasöründe `.gitignore` dosyası olduğundan emin olun. Eğer yoksa oluşturun:

```bash
cd Proje-Kaynak-Dosyalari
```

`.gitignore` dosyası şunları içermeli:
```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
```

### Adım 1.2: Git Repository Oluşturma

```bash
# Git başlat (eğer daha önce başlatılmadıysa)
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: Facial Reconstruction AI project"
```

### Adım 1.3: GitHub Repository Oluşturma

1. GitHub.com'a gidin ve giriş yapın
2. Sağ üstteki **"+"** butonuna tıklayın → **"New repository"**
3. Repository adı: `facial-reconstruction-ai` (veya istediğiniz isim)
4. **Public** veya **Private** seçin (önerilen: Private - API key'leriniz için)
5. **"Create repository"** butonuna tıklayın

### Adım 1.4: GitHub'a Push Etme

GitHub'da oluşturduğunuz repository'nin sayfasında gösterilen komutları kullanın:

```bash
# Remote repository ekle (YOUR_USERNAME ve REPO_NAME'i değiştirin)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Branch adını main yap (eğer master ise)
git branch -M main

# GitHub'a push et
git push -u origin main
```

---

## 2. Vercel'e Deploy Etme

### Adım 2.1: Vercel Hesabı Oluşturma

1. [vercel.com](https://vercel.com) adresine gidin
2. **"Sign Up"** butonuna tıklayın
3. **"Continue with GitHub"** seçeneğini seçin (GitHub hesabınızla giriş yapın)

### Adım 2.2: Projeyi Import Etme

1. Vercel dashboard'da **"Add New..."** → **"Project"** seçin
2. GitHub repository'nizi seçin
3. **"Import"** butonuna tıklayın

### Adım 2.3: Proje Ayarları

Vercel otomatik olarak Next.js projesini algılayacaktır. Ayarlar:

- **Framework Preset**: Next.js (otomatik)
- **Root Directory**: `Proje-Kaynak-Dosyalari` (eğer proje alt klasördeyse)
- **Build Command**: `npm run build` (otomatik)
- **Output Directory**: `.next` (otomatik)
- **Install Command**: `npm install` (otomatik)

**ÖNEMLİ**: Eğer proje `Proje-Kaynak-Dosyalari` klasöründeyse:
- **Root Directory** alanına `Proje-Kaynak-Dosyalari` yazın

---

## 3. Environment Variables Ayarlama

### Adım 3.1: Vercel'de Environment Variables Ekleme

1. Vercel proje sayfasında **"Settings"** → **"Environment Variables"** seçin
2. Aşağıdaki environment variable'ları ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**Her birini eklemek için:**
- **Name**: Variable adı (yukarıdaki listeden)
- **Value**: Gerçek değer (`.env.local` dosyanızdan)
- **Environment**: Production, Preview, Development (hepsini seçin)
- **"Save"** butonuna tıklayın

### Adım 3.2: Environment Variables Listesi

Aşağıdaki tüm değişkenleri ekleyin:

| Variable Name | Açıklama | Örnek |
|--------------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'iniz | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGc...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...` |

---

## 4. Supabase Ayarları

### Adım 4.1: Supabase CORS Ayarları

Vercel'de deploy ettiğinizde yeni bir domain alacaksınız (örn: `your-project.vercel.app`). Bu domain'i Supabase'e eklemeniz gerekiyor:

1. [Supabase Dashboard](https://app.supabase.com) → Projenizi seçin
2. **Settings** → **API** → **CORS** bölümüne gidin
3. Yeni domain'i ekleyin: `https://your-project.vercel.app`
4. **Save** butonuna tıklayın

### Adım 4.2: Supabase Storage Bucket Ayarları

Storage bucket'larınızın public olduğundan emin olun:

1. Supabase Dashboard → **Storage**
2. Her bucket için (örn: `case-photos`, `medical-sources`):
   - **Settings** → **Public bucket** seçeneğinin aktif olduğundan emin olun

---

## 5. Son Kontroller

### Adım 5.1: İlk Deploy

1. Vercel'de **"Deploy"** butonuna tıklayın
2. Deploy işlemi 2-5 dakika sürebilir
3. Deploy tamamlandığında **"Visit"** butonuna tıklayarak sitenizi görüntüleyin

### Adım 5.2: Test Etme

Deploy edilen sitede şunları test edin:

- ✅ Ana sayfa açılıyor mu?
- ✅ Giriş yapabiliyor musunuz?
- ✅ Yeni olgu oluşturabiliyor musunuz?
- ✅ Fotoğraf yükleyebiliyor musunuz?
- ✅ AI analizi çalışıyor mu?

### Adım 5.3: Hata Ayıklama

Eğer hata alırsanız:

1. Vercel Dashboard → **Deployments** → Son deployment'a tıklayın
2. **"Logs"** sekmesine bakın - hata mesajlarını göreceksiniz
3. **"Functions"** sekmesine bakın - API route'larındaki hataları göreceksiniz

### Adım 5.4: Custom Domain (Opsiyonel)

Kendi domain'inizi eklemek isterseniz:

1. Vercel Dashboard → **Settings** → **Domains**
2. Domain'inizi ekleyin
3. DNS ayarlarını yapın (Vercel size talimat verecek)

---

## 🔒 Güvenlik Notları

1. **API Key'leri asla GitHub'a yüklemeyin**
   - `.env.local` dosyası `.gitignore`'da olmalı
   - Environment variables sadece Vercel'de tanımlanmalı

2. **Supabase RLS Policies**
   - Tüm tablolarınızda Row Level Security (RLS) aktif olmalı
   - Kullanıcılar sadece kendi verilerine erişebilmeli

3. **Rate Limiting**
   - OpenAI ve Anthropic API'lerinde rate limit'ler olabilir
   - Production'da rate limiting eklemeyi düşünün

---

## 📝 Ek Notlar

### Otomatik Deploy

GitHub'a her push yaptığınızda Vercel otomatik olarak yeni bir deploy yapacaktır.

### Preview Deployments

Her pull request için Vercel otomatik olarak preview URL'i oluşturur.

### Analytics

Vercel Analytics'i aktif ederek site trafiğinizi takip edebilirsiniz.

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

## ✅ Başarıyla Deploy Edildi!

Artık projeniz canlıda! 🎉

URL'iniz: `https://your-project.vercel.app`

Her GitHub push'unda otomatik olarak güncellenecektir.

