# 🚀 GitHub'a Yükleme - Adım Adım Rehber

## 📋 Adım 1: GitHub'da Repository Oluşturma

1. **GitHub'a gidin:**
   - Tarayıcıda açın: https://github.com/new
   - GitHub hesabınızla giriş yapın (eğer yapmadıysanız)

2. **Repository bilgilerini doldurun:**
   - **Repository name:** `facial-reconstruction-ai` (veya istediğiniz isim)
   - **Description:** (opsiyonel) "AI destekli yüz rekonstrüksiyon platformu"
   - **Public** veya **Private** seçin (istediğinizi seçebilirsiniz)

3. **ÖNEMLİ - Bu seçenekleri İŞARETLEMEYİN:**
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license

4. **"Create repository" butonuna tıklayın**

5. **Repository URL'ini kopyalayın:**
   - Örnek: `https://github.com/KULLANICIADI/facial-reconstruction-ai.git`
   - Bu URL'yi not edin (sonra kullanacağız)

---

## 📋 Adım 2: GitHub Desktop'ta Repository Ekleme

1. **GitHub Desktop'ı açın**
   - Eğer yoksa: https://desktop.github.com/

2. **Local Repository Ekle:**
   - Menüden: **File** → **Add Local Repository**
   - VEYA: **Ctrl + Shift + O**

3. **Klasörü seçin:**
   - "Choose..." butonuna tıklayın
   - Şu klasörü seçin:
     ```
     C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje
     ```
   - "Add repository" butonuna tıklayın

---

## 📋 Adım 3: Remote Repository Bağlama

1. **Repository Settings açın:**
   - GitHub Desktop'ta: **Repository** → **Repository Settings**
   - VEYA: **Ctrl + ,** (virgül)

2. **Remote bölümüne gidin:**
   - Sol menüden **Remote** seçeneğine tıklayın

3. **Primary remote repository ekleyin:**
   - "Primary remote repository" bölümünde
   - Adım 1'de kopyaladığınız URL'i yapıştırın:
     ```
     https://github.com/KULLANICIADI/facial-reconstruction-ai.git
     ```
   - "Save" butonuna tıklayın

---

## 📋 Adım 4: İlk Commit ve Push

1. **Değişiklikleri kontrol edin:**
   - GitHub Desktop'ta sol panelde tüm dosyaları göreceksiniz
   - "Changes" sekmesinde dosyalar listelenmiş olmalı

2. **Commit mesajı yazın:**
   - Alt kısımda "Summary" alanına şunu yazın:
     ```
     Initial commit: Vercel deployment hazır
     ```
   - (Description alanı opsiyonel, boş bırakabilirsiniz)

3. **Commit yapın:**
   - "Commit to main" butonuna tıklayın
   - Dosyalar commit edilecek

4. **Push yapın:**
   - Üst kısımda "Push origin" butonunu göreceksiniz
   - "Push origin" butonuna tıklayın
   - Dosyalar GitHub'a yüklenecek (birkaç dakika sürebilir)

---

## 📋 Adım 5: Kontrol

1. **GitHub Web'de kontrol edin:**
   - Tarayıcıda repository'nizi açın
   - Dosyaların yüklendiğini görün
   - Örnek: `https://github.com/KULLANICIADI/facial-reconstruction-ai`

2. **GitHub Desktop'ta kontrol:**
   - "History" sekmesine bakın
   - Commit'inizi görmelisiniz
   - "Push origin" butonu artık görünmemeli (zaten push edildi)

---

## ✅ Başarı Kontrol Listesi

- [ ] GitHub'da repository oluşturuldu
- [ ] GitHub Desktop'ta local repository eklendi
- [ ] Remote repository bağlandı
- [ ] İlk commit yapıldı
- [ ] Push yapıldı
- [ ] GitHub Web'de dosyalar görünüyor

---

## 🐛 Sorun Giderme

### "Repository bulunamadı" hatası
- Remote URL'yi kontrol edin
- GitHub'da repository'nin var olduğundan emin olun
- URL formatı doğru mu kontrol edin

### "Push failed" hatası
- İnternet bağlantınızı kontrol edin
- GitHub hesabınızla giriş yaptığınızdan emin olun
- Tekrar deneyin

### Dosyalar görünmüyor
- "Changes" sekmesine bakın
- Tüm dosyalar seçili mi kontrol edin
- Commit yaptığınızdan emin olun

---

## 🎉 Tamamlandı!

Artık projeniz GitHub'da! Sonraki adım: Vercel'e bağlama.

