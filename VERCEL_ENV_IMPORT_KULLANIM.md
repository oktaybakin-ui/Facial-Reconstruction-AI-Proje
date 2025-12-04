# 📋 Vercel Environment Variables Import - Kullanım

## 📄 Dosyalar

1. **vercel-env.txt** - Vercel Dashboard'dan import için
2. **.env.vercel** - Alternatif format

---

## 🔧 Adım 1: Dosyayı Düzenleyin

1. **`vercel-env.txt` dosyasını açın**
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

### Vercel Dashboard'dan:

1. **Vercel Dashboard'a gidin:**
   - https://vercel.com/dashboard
   - Projenizi seçin (veya yeni proje oluşturun)

2. **Settings → Environment Variables**

3. **"Import" butonuna tıklayın**

4. **Dosyayı seçin:**
   - `vercel-env.txt` dosyasını seçin
   - VEYA `.env.vercel` dosyasını seçin

5. **"Import" butonuna tıklayın**

6. **Environment seçin:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   - (Hepsini seçin)

7. **"Save" butonuna tıklayın**

---

## 📝 Örnek Doldurulmuş Dosya

```
NEXT_PUBLIC_SUPABASE_URL=https://clcztcmxkmhrtnajciqd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
ADMIN_EMAILS=oktay@example.com,admin@example.com
AUTO_APPROVE_USERS=false
```

---

## 🔑 Key'leri Nereden Alacağım?

### Supabase:
1. Supabase Dashboard → Settings → API
2. **Project URL:** `NEXT_PUBLIC_SUPABASE_URL` için
3. **anon public key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` için
4. **service_role secret key:** `SUPABASE_SERVICE_ROLE_KEY` için

### OpenAI:
1. https://platform.openai.com/api-keys
2. "Create new secret key" butonuna tıklayın
3. Key'i kopyalayın

### Anthropic:
1. https://console.anthropic.com/settings/keys
2. "Create Key" butonuna tıklayın
3. Key'i kopyalayın

---

## ✅ Kontrol

Import işleminden sonra:
1. Vercel Dashboard → Settings → Environment Variables
2. Tüm değişkenlerin eklendiğini kontrol edin
3. Her değişken için Production, Preview ve Development seçili olduğunu kontrol edin

---

## 🎉 Tamamlandı!

Environment variables eklendikten sonra deploy edebilirsiniz!

