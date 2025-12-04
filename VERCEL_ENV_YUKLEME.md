# 📤 Vercel Environment Variables Yükleme

## 📄 Dosya Konumu

**Dosya:** `vercel-env.txt`  
**Konum:** `C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje\vercel-env.txt`

---

## 🚀 Vercel'e Yükleme Adımları

### Yöntem 1: Vercel Dashboard'dan Import (Önerilen)

1. **Vercel Dashboard'a gidin:**
   - https://vercel.com/dashboard
   - Projenizi seçin (veya yeni proje oluşturun)

2. **Settings → Environment Variables:**
   - Sol menüden "Settings" seçin
   - "Environment Variables" sekmesine tıklayın

3. **Import butonuna tıklayın:**
   - "Import" butonunu bulun
   - Tıklayın

4. **Dosyayı seçin:**
   - "Choose File" veya "Browse" butonuna tıklayın
   - Şu dosyayı seçin:
     ```
     C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje\vercel-env.txt
     ```

5. **Environment seçin:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   - (Hepsini işaretleyin)

6. **"Import" veya "Save" butonuna tıklayın**

---

### Yöntem 2: Manuel Ekleme (Alternatif)

Eğer import çalışmazsa, her değişkeni tek tek ekleyin:

1. **Vercel Dashboard → Settings → Environment Variables**

2. **"Add New" butonuna tıklayın**

3. **Her değişken için:**
   - **Key:** (dosyadaki değişken adı)
   - **Value:** (dosyadaki değer)
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
   - **"Save" tıklayın**

4. **Tüm değişkenleri ekleyin:**
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENAI_API_KEY
   - ANTHROPIC_API_KEY
   - ADMIN_EMAILS
   - AUTO_APPROVE_USERS

---

## 📋 Dosya İçeriği (Kontrol İçin)

Dosyada şu değişkenler var:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ OPENAI_API_KEY
- ✅ ANTHROPIC_API_KEY
- ✅ ADMIN_EMAILS
- ✅ AUTO_APPROVE_USERS

---

## ✅ Kontrol

Import işleminden sonra:
1. Vercel Dashboard → Settings → Environment Variables
2. Tüm 7 değişkenin eklendiğini kontrol edin
3. Her değişken için Production, Preview ve Development seçili olduğunu kontrol edin

---

## 🎉 Tamamlandı!

Environment variables eklendikten sonra deploy edebilirsiniz!

