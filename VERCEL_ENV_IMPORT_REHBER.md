# 📋 Vercel Environment Variables Import Rehberi

## 📄 Dosya: vercel-env-import.json

Bu dosyayı kullanarak Vercel'e environment variables'ları toplu olarak ekleyebilirsiniz.

---

## 🔧 Adım 1: Dosyayı Düzenleyin

1. **`vercel-env-import.json` dosyasını açın**
   - Notepad veya herhangi bir metin editörü ile

2. **Değerleri doldurun:**
   - `BURAYA_SUPABASE_ANON_KEY_YAZIN` → Supabase anon key'inizi yazın
   - `BURAYA_SUPABASE_SERVICE_ROLE_KEY_YAZIN` → Supabase service role key'inizi yazın
   - `BURAYA_OPENAI_API_KEY_YAZIN` → OpenAI API key'inizi yazın
   - `BURAYA_ANTHROPIC_API_KEY_YAZIN` → Anthropic API key'inizi yazın
   - `admin@example.com` → Kendi admin email adresinizi yazın

3. **Dosyayı kaydedin**

---

## 🚀 Adım 2: Vercel'e Import Edin

### Yöntem 1: Vercel Dashboard (Önerilen)

1. **Vercel Dashboard'a gidin:**
   - https://vercel.com/dashboard
   - Projenizi seçin

2. **Settings → Environment Variables**

3. **"Import" butonuna tıklayın**

4. **Dosyayı seçin:**
   - `vercel-env-import.json` dosyasını seçin

5. **"Import" butonuna tıklayın**

### Yöntem 2: Vercel CLI

1. **Vercel CLI kurulumu (eğer yoksa):**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Import:**
   ```bash
   cd "C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje"
   vercel env pull .env.local
   vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
   ```
   (Her değişken için tek tek eklemeniz gerekir)

---

## 📝 Önemli Notlar

1. **Key'leri nereden alacağım?**
   - **Supabase:** Supabase Dashboard → Settings → API
   - **OpenAI:** https://platform.openai.com/api-keys
   - **Anthropic:** https://console.anthropic.com/settings/keys

2. **ADMIN_EMAILS:**
   - Virgülle ayrılmış email adresleri
   - Örnek: `admin@example.com,admin2@example.com`

3. **AUTO_APPROVE_USERS:**
   - `true` = Yeni kullanıcılar otomatik onaylanır
   - `false` = Manuel onay gerekir

---

## ✅ Kontrol

Import işleminden sonra:
1. Vercel Dashboard → Settings → Environment Variables
2. Tüm değişkenlerin eklendiğini kontrol edin
3. Production, Preview ve Development için ayrı ayrı eklendiğini kontrol edin

---

## 🐛 Sorun Giderme

### Import başarısız
- JSON formatını kontrol edin
- Tırnak işaretlerini kontrol edin
- Virgülleri kontrol edin

### Değerler yanlış
- Her değişkeni tek tek kontrol edin
- Key'lerin doğru olduğundan emin olun

---

## 🎉 Tamamlandı!

Environment variables eklendikten sonra deploy edebilirsiniz!

