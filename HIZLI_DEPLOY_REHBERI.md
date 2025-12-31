# 🚀 Hızlı Deploy Rehberi - Güncellenmiş Prompt ile Test

## 📋 Önkoşullar

1. ✅ Kod değişiklikleri yapıldı (`lib/ai/decision.ts` güncellendi)
2. ⚠️ Git repository kontrolü gerekli
3. ⚠️ Vercel hesabı gerekli

---

## 🔄 Seçenek 1: Vercel'e İlk Kez Deploy (Yeni Proje)

### Adım 1: Git Repository Hazırlığı

```bash
# Eğer git repository yoksa:
git init
git add .
git commit -m "Update: Flap evaluation prompt güncellendi - yeni spesifikasyonlar eklendi"
```

### Adım 2: GitHub'a Push

```bash
# GitHub'da yeni repository oluşturun (github.com)
# Sonra:
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git branch -M main
git push -u origin main
```

### Adım 3: Vercel'e Bağlama

1. **Vercel Dashboard'a gidin:** https://vercel.com/dashboard
2. **"Add New Project"** butonuna tıklayın
3. **GitHub repository'nizi seçin**
4. **Import** butonuna tıklayın

### Adım 4: Environment Variables Ekleme

Vercel proje ayarlarında **Environment Variables** bölümüne gidin ve şunları ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
ADMIN_EMAILS=admin@example.com
AUTO_APPROVE_USERS=false
```

**Önemli:** Her değişken için ✅ **Production**, ✅ **Preview**, ✅ **Development** seçeneklerini işaretleyin.

### Adım 5: Deploy

1. **"Deploy"** butonuna tıklayın
2. Build işlemi 5-10 dakika sürebilir
3. Deploy tamamlandığında URL'nizi alacaksınız

---

## 🔄 Seçenek 2: Mevcut Vercel Projesine Güncelleme

### Adım 1: Değişiklikleri Commit Et

```bash
git add lib/ai/decision.ts
git commit -m "Update: Flap evaluation prompt - yeni spesifikasyonlar eklendi

- Medikal kaynak önceliği kuralları
- Çizim negatif kuralları (defekt üzerinden kesi olmaz, donör-defekt çakışmaması)
- Belirsizlik durumu yönetimi
- Uygunluk skoru hesaplama metodolojisi
- Karşı-argüman ve gerekçelendirme
- Son kontrol ve tutarlılık kontrolleri"
```

### Adım 2: GitHub'a Push

```bash
git push origin main
```

### Adım 3: Otomatik Deploy

Vercel otomatik olarak yeni push'u algılayacak ve deploy başlatacak.

**Vercel Dashboard'dan kontrol:**
- https://vercel.com/dashboard → Projeniz → Deployments
- Yeni deployment'ı göreceksiniz
- Build loglarını takip edebilirsiniz

---

## 🔄 Seçenek 3: Vercel CLI ile Manuel Deploy

### Adım 1: Vercel CLI Kurulumu

```bash
npm install -g vercel
```

### Adım 2: Vercel'e Login

```bash
vercel login
```

### Adım 3: Deploy

```bash
# Production deploy
vercel --prod

# VEYA preview deploy (test için)
vercel
```

---

## 🧪 Test Etme

### 1. Localhost'ta Test (Önerilen - Önce Bu)

```bash
# Terminal'de:
npm run dev
```

Tarayıcıda: http://localhost:3000

**Test Adımları:**
1. ✅ Site açılıyor mu?
2. ✅ Login/Register çalışıyor mu?
3. ✅ Yeni case oluşturabiliyor musunuz?
4. ✅ Pre-op fotoğraf yükleyebiliyor musunuz?
5. ✅ **AI Analiz** butonuna tıklayın
6. ✅ Flap önerileri geliyor mu?
7. ✅ Yeni prompt kuralları çalışıyor mu? (çizimler, medikal kaynak önceliği, vb.)

### 2. Production'da Test

Deploy tamamlandıktan sonra:

1. **Vercel URL'nizi açın:** `https://your-project.vercel.app`
2. **Aynı test adımlarını tekrarlayın**
3. **Özellikle kontrol edin:**
   - ✅ Flap önerileri geliyor mu?
   - ✅ Çizimler doğru mu? (defekt üzerinden kesi olmamalı)
   - ✅ Medikal kaynak bilgileri kullanılıyor mu?
   - ✅ Belirsizlik durumları belirtiliyor mu?

---

## 🐛 Sorun Giderme

### Build Hatası

**Hata:** `Module not found` veya `Type error`

**Çözüm:**
```bash
# Local'de test edin:
npm run build

# Hataları düzeltin, sonra tekrar push edin
```

### Environment Variables Eksik

**Hata:** `OPENAI_API_KEY bulunamadı`

**Çözüm:**
1. Vercel Dashboard → Settings → Environment Variables
2. Eksik değişkenleri ekleyin
3. **Redeploy** yapın (Deployments → ... → Redeploy)

### API Key Hataları

**Hata:** `401 Unauthorized` veya `Incorrect API key`

**Çözüm:**
1. API key'lerinizi kontrol edin
2. Vercel'de environment variables'ı güncelleyin
3. Redeploy yapın

---

## 📊 Deploy Durumunu Kontrol

### Vercel Dashboard

1. https://vercel.com/dashboard
2. Projenizi seçin
3. **Deployments** sekmesine gidin
4. Son deployment'ın durumunu kontrol edin:
   - ✅ **Ready**: Başarılı
   - ⏳ **Building**: Devam ediyor
   - ❌ **Error**: Hata var (logları kontrol edin)

### Build Logları

1. Deployment'a tıklayın
2. **Build Logs** sekmesine gidin
3. Hataları kontrol edin

---

## ✅ Başarı Kontrol Listesi

- [ ] Git repository hazır
- [ ] Değişiklikler commit edildi
- [ ] GitHub'a push edildi
- [ ] Vercel projesi bağlandı
- [ ] Environment variables eklendi
- [ ] Deploy başlatıldı
- [ ] Build başarılı
- [ ] Site çalışıyor
- [ ] AI analiz test edildi
- [ ] Yeni prompt kuralları çalışıyor

---

## 🎯 Hızlı Komutlar

```bash
# Git durumunu kontrol
git status

# Değişiklikleri ekle
git add .

# Commit
git commit -m "Update: Prompt güncellendi"

# Push
git push origin main

# Local test
npm run dev

# Build test
npm run build
```

---

## 📝 Notlar

- **İlk deploy:** 5-10 dakika sürebilir
- **Sonraki deploys:** 2-5 dakika (sadece değişiklikler)
- **Environment variables:** Her değişiklikten sonra redeploy gerekir
- **Build cache:** Vercel otomatik cache kullanır, hızlı build sağlar

---

## 🆘 Yardım

Sorun yaşarsanız:
1. Build loglarını kontrol edin
2. Local'de `npm run build` çalıştırın
3. Environment variables'ı kontrol edin
4. Vercel dokümantasyonuna bakın: https://vercel.com/docs

---

**Başarılar! 🚀**

