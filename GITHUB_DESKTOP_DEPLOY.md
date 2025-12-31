# 🚀 GitHub Desktop ile Deploy Rehberi

## 📋 Adım 1: Git Repository Oluştur (GitHub Desktop)

### Yöntem 1: Mevcut Klasörü Repository Yap

1. **GitHub Desktop'ı açın**
2. **File → Add Local Repository** tıklayın
3. **Browse** butonuna tıklayın
4. Proje klasörünüzü seçin:
   ```
   C:\Users\oktay\Desktop\projeler ÖNEMLİ\Facial-Reconstruction-AI-Proje
   ```
5. **Add Repository** butonuna tıklayın
6. GitHub Desktop size "This directory does not appear to be a Git repository" diyecek
7. **"create a repository"** linkine tıklayın
8. **Repository name:** `Facial-Reconstruction-AI-Proje` (veya istediğiniz isim)
9. **Description:** (opsiyonel) "Yüz cilt defekti rekonstrüksiyon karar destek sistemi"
10. **Git ignore:** `.gitignore` dosyası otomatik oluşturulacak
11. **License:** (opsiyonel) None seçin
12. **"Create Repository"** butonuna tıklayın

### Yöntem 2: GitHub'da Yeni Repository Oluştur, Sonra Clone Et

1. **GitHub.com'a gidin** ve yeni repository oluşturun
2. **Repository name:** `Facial-Reconstruction-AI-Proje`
3. **Public/Private** seçin
4. **"Create repository"** butonuna tıklayın
5. **GitHub Desktop'ta:** File → Clone Repository
6. **GitHub.com** sekmesinde yeni repository'nizi bulun
7. **Local path** seçin (mevcut proje klasörünüz)
8. **Clone** butonuna tıklayın

---

## 📋 Adım 2: Değişiklikleri Commit Et

1. **GitHub Desktop'ta** sol panelde değişikliklerinizi göreceksiniz
2. **Summary** alanına commit mesajı yazın:
   ```
   Update: Flap evaluation prompt güncellendi - yeni spesifikasyonlar
   ```
3. **Description** alanına (opsiyonel):
   ```
   - Medikal kaynak önceliği kuralları eklendi
   - Çizim negatif kuralları (defekt üzerinden kesi olmaz, donör-defekt çakışmaması)
   - Belirsizlik durumu yönetimi
   - Uygunluk skoru hesaplama metodolojisi
   - Karşı-argüman ve gerekçelendirme
   - Son kontrol ve tutarlılık kontrolleri
   ```
4. **"Commit to main"** butonuna tıklayın

---

## 📋 Adım 3: GitHub'a Push Et

1. **GitHub Desktop'ta** üst menüden **"Publish repository"** veya **"Push origin"** butonuna tıklayın
2. Eğer ilk kez push ediyorsanız:
   - **"Publish repository"** butonuna tıklayın
   - Repository'nin **Public** mi **Private** mi olacağını seçin
   - **"Publish Repository"** butonuna tıklayın
3. Eğer zaten publish edilmişse:
   - **"Push origin"** butonuna tıklayın
   - Veya üst menüden **Repository → Push**

---

## 📋 Adım 4: Vercel'e Bağla

### Yöntem 1: Vercel Dashboard (Önerilen)

1. **Vercel Dashboard'a gidin:** https://vercel.com/dashboard
2. **"Add New Project"** butonuna tıklayın
3. **GitHub** ile giriş yapın (eğer yapmadıysanız)
4. **Repository listesinden** `Facial-Reconstruction-AI-Proje` seçin
5. **"Import"** butonuna tıklayın

### Yöntem 2: Vercel CLI

```powershell
# Terminal'de:
npm install -g vercel
vercel login
vercel --prod
```

---

## 📋 Adım 5: Environment Variables Ekle

1. **Vercel Dashboard** → Projeniz → **Settings** → **Environment Variables**
2. Şu değişkenleri ekleyin:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   Değer: (Supabase URL'niz)
   
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   Değer: (Supabase Anon Key)
   
   SUPABASE_SERVICE_ROLE_KEY
   Değer: (Supabase Service Role Key)
   
   OPENAI_API_KEY
   Değer: (OpenAI API Key)
   
   ANTHROPIC_API_KEY
   Değer: (Anthropic API Key)
   
   ADMIN_EMAILS
   Değer: admin@example.com
   
   AUTO_APPROVE_USERS
   Değer: false
   ```

3. Her değişken için:
   - ✅ **Production** işaretleyin
   - ✅ **Preview** işaretleyin
   - ✅ **Development** işaretleyin
   - **Save** butonuna tıklayın

---

## 📋 Adım 6: İlk Deploy

1. **Vercel Dashboard** → Projeniz
2. **"Deploy"** butonuna tıklayın (eğer environment variables ekledikten sonra)
3. Veya **otomatik deploy** başlayacak (GitHub'a push ettikten sonra)
4. **Build işlemi** 5-10 dakika sürebilir
5. **Deploy tamamlandığında** URL'nizi alacaksınız: `https://your-project.vercel.app`

---

## 📋 Adım 7: Sonraki Deploy'lar (Otomatik)

Artık her değişiklik yaptığınızda:

1. **GitHub Desktop'ta** değişiklikleri commit edin
2. **Push** edin
3. **Vercel otomatik olarak** yeni deploy başlatacak
4. **Vercel Dashboard** → Deployments'tan durumu takip edebilirsiniz

---

## ✅ Kontrol Listesi

- [ ] GitHub Desktop'ta repository oluşturuldu
- [ ] Değişiklikler commit edildi
- [ ] GitHub'a push edildi
- [ ] Vercel'e repository bağlandı
- [ ] Environment variables eklendi
- [ ] İlk deploy başlatıldı
- [ ] Build başarılı
- [ ] Site çalışıyor

---

## 🧪 Test

Deploy tamamlandıktan sonra:

1. **Vercel URL'nizi açın**
2. **Login/Register** test edin
3. **Yeni case oluşturun**
4. **Pre-op fotoğraf yükleyin**
5. **AI Analiz** butonuna tıklayın
6. **Flap önerilerini** kontrol edin:
   - ✅ Çizimler doğru mu? (defekt üzerinden kesi olmamalı)
   - ✅ Medikal kaynak bilgileri kullanılıyor mu?
   - ✅ Belirsizlik durumları belirtiliyor mu?

---

## 🐛 Sorun Giderme

### GitHub Desktop'ta "Publish" butonu görünmüyor

**Çözüm:** Repository zaten publish edilmiş olabilir. **"Push origin"** butonunu kullanın.

### Vercel'de build hatası

**Çözüm:**
1. Vercel Dashboard → Deployments → Build Logs
2. Hataları kontrol edin
3. Local'de test edin: `npm run build`

### Environment variables çalışmıyor

**Çözüm:**
1. Vercel Dashboard → Settings → Environment Variables
2. Değişkenlerin doğru olduğundan emin olun
3. **Redeploy** yapın (Deployments → ... → Redeploy)

---

## 🎉 Başarı!

Artık her değişiklik yaptığınızda:
1. GitHub Desktop'ta commit + push
2. Vercel otomatik deploy
3. Site güncellenmiş olacak!

**Başarılar! 🚀**

