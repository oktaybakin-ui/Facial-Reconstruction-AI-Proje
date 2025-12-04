# 🚀 Vercel'e Bağlama - Adım Adım

## ✅ GitHub'a Yükleme Tamamlandı!

Artık Vercel'e bağlayabilirsiniz.

---

## 📋 Adım 1: Vercel Dashboard'a Gidin

1. **Tarayıcıda açın:**
   - https://vercel.com/dashboard
   - Vercel hesabınızla giriş yapın (eğer yapmadıysanız)

2. **GitHub ile giriş:**
   - Eğer ilk kez kullanıyorsanız, "Continue with GitHub" butonuna tıklayın
   - GitHub hesabınızla giriş yapın

---

## 📋 Adım 2: Yeni Proje Oluşturun

1. **"Add New Project" butonuna tıklayın**
   - Ana sayfada büyük buton olarak görünecek

2. **GitHub Repository'nizi seçin:**
   - Repository listesinden `facial-reconstruction-ai` seçin
   - VEYA arama kutusuna yazın: `facial-reconstruction-ai`

3. **"Import" butonuna tıklayın**

---

## 📋 Adım 3: Proje Ayarları

1. **Framework Preset:**
   - Otomatik olarak "Next.js" seçilecek ✅
   - Değiştirmeyin

2. **Root Directory:**
   - `./` olarak bırakın (proje root'ta)
   - VEYA eğer alt klasördeyse: `Proje-Kaynak-Dosyalari` yazın
   - **Bizim durumumuzda:** `./` bırakın

3. **Build Command:**
   - `npm run build` (otomatik) ✅

4. **Output Directory:**
   - `.next` (otomatik) ✅

5. **Install Command:**
   - `npm install` (otomatik) ✅

6. **"Deploy" butonuna tıklamayın henüz!** (Önce environment variables ekleyelim)

---

## 📋 Adım 4: Environment Variables Ekleme

1. **"Environment Variables" bölümüne gidin**
   - Proje ayarları sayfasında
   - VEYA deploy sayfasında "Environment Variables" sekmesi

2. **Her değişkeni ekleyin:**
   - "Add New" butonuna tıklayın
   - Name ve Value'yu girin
   - ✅ **Production**, ✅ **Preview**, ✅ **Development** seçeneklerini işaretleyin
   - "Save" butonuna tıklayın

3. **Eklenecek Değişkenler:**

   ```
   NEXT_PUBLIC_SUPABASE_URL
   Değer: https://clcztcmxkmhrtnajciqd.supabase.co
   
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   Değer: (Supabase Dashboard'dan alın)
   
   SUPABASE_SERVICE_ROLE_KEY
   Değer: (Supabase Dashboard'dan alın)
   
   OPENAI_API_KEY
   Değer: (OpenAI Dashboard'dan alın)
   
   ANTHROPIC_API_KEY
   Değer: (Anthropic Dashboard'dan alın)
   
   ADMIN_EMAILS
   Değer: admin@example.com,admin2@example.com
   (Virgülle ayrılmış admin email adresleri)
   
   AUTO_APPROVE_USERS
   Değer: false
   ```

4. **Tüm değişkenleri ekledikten sonra:**
   - "Deploy" butonuna tıklayın

---

## 📋 Adım 5: İlk Deploy

1. **"Deploy" butonuna tıklayın**
   - Build işlemi başlayacak

2. **Build Süreci:**
   - Build işlemi 5-10 dakika sürebilir
   - İlk deploy daha uzun sürer
   - Build loglarını takip edebilirsiniz

3. **Build Tamamlandığında:**
   - ✅ "Ready" durumunu göreceksiniz
   - Site URL'iniz hazır: `https://your-project.vercel.app`

---

## 📋 Adım 6: Siteyi Test Edin

1. **URL'yi tarayıcıda açın:**
   - Vercel size bir URL verecek
   - Örnek: `https://facial-reconstruction-ai.vercel.app`

2. **Kontrol edin:**
   - Site açılıyor mu?
   - Login/Register çalışıyor mu?
   - Database bağlantısı çalışıyor mu?

---

## ✅ Başarı Kontrol Listesi

- [ ] Vercel Dashboard'a giriş yapıldı
- [ ] GitHub repository bağlandı
- [ ] Proje ayarları yapıldı
- [ ] Environment variables eklendi
- [ ] İlk deploy başlatıldı
- [ ] Build başarılı
- [ ] Site çalışıyor

---

## 🎉 Tamamlandı!

Artık siteniz canlıda! Her GitHub push'unda otomatik deploy yapılacak.

---

## 📝 Notlar

- **Environment Variables:** Supabase ve API key'lerinizi Supabase/OpenAI/Anthropic dashboard'larından alın
- **Build Hataları:** Vercel Dashboard → Deployments → Build Logs'tan kontrol edin
- **Custom Domain:** Vercel Dashboard → Settings → Domains'den ekleyebilirsiniz

