# 🔑 Vercel'de OpenAI API Key Ekleme Rehberi

## Yöntem 1: Vercel Dashboard (Önerilen) ⭐

### Adımlar:

1. **Vercel Dashboard'a gidin**
   - https://vercel.com/dashboard
   - Projenizi seçin: `Facial-Reconstruction-AI-Proje`

2. **Settings'e gidin**
   - Proje sayfasında üst menüden **"Settings"** tıklayın

3. **Environment Variables bölümüne gidin**
   - Sol menüden **"Environment Variables"** seçin

4. **Yeni variable ekleyin**
   - **"Add New"** butonuna tıklayın
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `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`
   - **Environments:** Tümünü seçin (Production, Preview, Development)
   - **"Save"** tıklayın

5. **Diğer key'leri de ekleyin** (gerekirse):
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAILS`

6. **Redeploy yapın**
   - **"Deployments"** sekmesine gidin
   - Son deployment'ın yanındaki **"..."** menüsünden **"Redeploy"** seçin

---

## Yöntem 2: Otomatik Script (Hızlı) 🚀

### PowerShell Script ile:

```powershell
cd "C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje"
powershell -ExecutionPolicy Bypass -File OTOMATIK_VERCEL_KEY_YUKLE.ps1
```

Bu script `vercel-env.txt` dosyasındaki tüm key'leri otomatik olarak Vercel'e yükler.

**Gereksinimler:**
- Vercel CLI yüklü olmalı: `npm install -g vercel`
- Proje bağlı olmalı: `vercel link` (ilk kez)

---

## Yöntem 3: Vercel CLI (Terminal) 💻

### Tek tek ekleme:

```bash
# Vercel CLI ile key ekleme
echo "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" | vercel env add OPENAI_API_KEY production preview development
```

---

## 📋 Eklenmesi Gereken Tüm Environment Variables

Vercel Dashboard'da şu değişkenleri ekleyin:

| Key | Value | Environments |
|-----|-------|--------------|
| `OPENAI_API_KEY` | `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` | All |
| `ANTHROPIC_API_KEY` | `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` | All |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://clcztcmxkmhrtnajciqd.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_ROlWeValB-FekXr5OeoXRQ_o9YUvIPX` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_hfeRqks9ycj-_lkmOXp45g_v9dhJ1u6` | All |
| `ADMIN_EMAILS` | `oktaybakin@gmail.com` | All |
| `AUTO_APPROVE_USERS` | `false` | All |

---

## ✅ Kontrol

Key'leri ekledikten sonra:

1. **Deployments** sekmesine gidin
2. **"Redeploy"** yapın (veya yeni bir commit push edin)
3. Build log'larında key'lerin yüklendiğini kontrol edin

---

## 🆘 Sorun Giderme

### Key ekledim ama hala hata veriyor

1. **Redeploy yaptınız mı?**
   - Key ekledikten sonra mutlaka redeploy yapın

2. **Doğru environment'ları seçtiniz mi?**
   - Production, Preview ve Development'ı seçin

3. **Key formatı doğru mu?**
   - `OPENAI_API_KEY` `sk-` ile başlamalı
   - Boşluk veya tırnak işareti olmamalı

4. **Build log'larını kontrol edin**
   - Vercel Dashboard > Deployments > Build Logs
   - Key'lerin yüklendiğini görmelisiniz

---

## 📸 Görsel Rehber

1. Vercel Dashboard > Projeniz > Settings
2. Sol menü: Environment Variables
3. "Add New" butonu
4. Key ve Value girin
5. Environments seçin (Production, Preview, Development)
6. Save
7. Redeploy

---

**Not:** Key'ler eklendikten sonra mutlaka **Redeploy** yapın! 🔄

