# 🔧 OpenAI API Key Hata Giderme Rehberi

## ❌ Hata Alıyorsunuz Ama Key Doğru Görünüyor?

### 🔍 Kontrol Listesi

#### 1. Vercel'de Key Kontrolü

**Vercel Dashboard'da kontrol edin:**
1. https://vercel.com/dashboard → Projeniz
2. **Settings** → **Environment Variables**
3. `OPENAI_API_KEY` değişkenini bulun
4. **Edit** tıklayın ve kontrol edin:

   ✅ **Key adı:** Tam olarak `OPENAI_API_KEY` (büyük harf, alt çizgi)
   ✅ **Value:** Key'in tamamı kopyalanmış mı?
   ✅ **Boşluk yok:** Key'in başında/sonunda boşluk var mı?
   ✅ **Tırnak yok:** Key tırnak içinde değil mi?
   ✅ **Environments:** Production, Preview, Development **hepsi seçili mi?**

**Yaygın Hatalar:**
- ❌ `OPENAI_API_KEY = sk-...` (eşittir etrafında boşluk)
- ❌ `OPENAI_API_KEY="sk-..."` (tırnak içinde)
- ❌ `OPENAI_API_KEY= sk-...` (eşittir sonrası boşluk)
- ❌ Key'in sonunda görünmez karakterler

#### 2. Redeploy Kontrolü

**Key ekledikten sonra mutlaka redeploy yapın:**
1. **Deployments** sekmesine gidin
2. Son deployment'ı bulun
3. **"..."** menüsünden **"Redeploy"** seçin
4. **"Use existing Build Cache"** seçeneğini **KAPATIN** (önemli!)
5. Redeploy yapın

**Neden?** Vercel build cache kullanıyorsa, eski environment variable'ları kullanabilir.

#### 3. Key Format Kontrolü

**Key'iniz şu formatta olmalı:**
```
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
```

**Kontrol:**
- ✅ `sk-` ile başlıyor mu?
- ✅ Key'in tamamı kopyalanmış mı? (200+ karakter)
- ✅ Key'de satır sonu (newline) var mı?

#### 4. Build Log Kontrolü

**Vercel Build Log'larını kontrol edin:**
1. **Deployments** → Son deployment → **"Build Logs"**
2. Şu satırları arayın:
   ```
   🔐 API Key'ler otomatik olarak ayarlanıyor...
   ✅ vercel-env.txt dosyası bulundu
   ✓ OPENAI_API_KEY ayarlandı
   ```

**Eğer görünmüyorsa:**
- `setup-env.js` çalışmıyor olabilir
- `vercel-env.txt` dosyası Git'e commit edilmemiş olabilir

#### 5. Runtime Log Kontrolü

**Vercel Runtime Log'larını kontrol edin:**
1. **Deployments** → Son deployment → **"Runtime Logs"**
2. Hata mesajını arayın:
   - `OpenAI API key bulunamadı`
   - `401 Incorrect API key`
   - `429 rate limit`
   - `quota exceeded`

#### 6. Key'in Aktif Olduğunu Kontrol Edin

**OpenAI Platform'da kontrol:**
1. https://platform.openai.com/api-keys
2. Key'inizin yanında **"Active"** yazıyor mu?
3. Key silinmiş veya deaktive edilmiş olabilir

#### 7. Billing/Quota Kontrolü

**OpenAI Billing kontrolü:**
1. https://platform.openai.com/account/billing
2. **Usage** sekmesinde:
   - Kredi var mı?
   - Quota limiti aşılmış mı?
   - Ödeme yöntemi ekli mi?

**Hata mesajları:**
- `429 You exceeded your current quota` → Billing sorunu
- `401 Incorrect API key` → Key yanlış veya deaktif

---

## 🛠️ Adım Adım Çözüm

### Çözüm 1: Key'i Yeniden Ekleyin

1. **Vercel Dashboard:**
   - Settings → Environment Variables
   - `OPENAI_API_KEY` değişkenini **SİLİN**
   - **"Add New"** ile yeniden ekleyin
   - Key'i **manuel olarak yazın** (kopyala-yapıştır yerine)
   - Tüm environment'ları seçin
   - Save

2. **Redeploy:**
   - Deployments → Redeploy
   - **"Use existing Build Cache"** KAPATIN
   - Redeploy

### Çözüm 2: Key Formatını Düzeltin

**Key'inizde şunlar olmamalı:**
- Başında/sonunda boşluk
- Tırnak işaretleri
- Satır sonları (newline)
- Görünmez karakterler

**Temiz key örneği:**
```
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
```

### Çözüm 3: Yeni Key Oluşturun

Eğer hala çalışmıyorsa:

1. **Yeni key oluşturun:**
   - https://platform.openai.com/api-keys
   - **"Create new secret key"**
   - Key'i kopyalayın

2. **Vercel'de güncelleyin:**
   - Settings → Environment Variables
   - `OPENAI_API_KEY` → Edit
   - Yeni key'i yapıştırın
   - Save

3. **Redeploy:**
   - Build cache'i kapatarak redeploy

---

## 🔍 Debug Komutları

### Yerel Test

```bash
# .env.local dosyasını kontrol edin
cd "C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje"
node setup-env.js

# Key'in varlığını kontrol edin
node -e "console.log('Key:', process.env.OPENAI_API_KEY ? 'Var' : 'Yok')"
```

### Vercel CLI ile Test

```bash
# Vercel environment variable'ları kontrol edin
vercel env ls

# Key'i görüntüleyin (maskelenmiş)
vercel env pull .env.vercel
cat .env.vercel | grep OPENAI_API_KEY
```

---

## 📋 Hata Mesajları ve Çözümleri

| Hata Mesajı | Neden | Çözüm |
|------------|-------|-------|
| `OpenAI API key bulunamadı` | Key environment variable'da yok | Vercel'de ekleyin, redeploy |
| `401 Incorrect API key` | Key yanlış veya deaktif | Key'i kontrol edin, yeni key oluşturun |
| `429 rate limit` | Çok fazla istek | Biraz bekleyin, quota kontrol edin |
| `quota exceeded` | Billing sorunu | OpenAI billing'e ödeme yöntemi ekleyin |

---

## ✅ Son Kontrol

Key ekledikten sonra:

1. ✅ Vercel'de key var mı? (Settings → Environment Variables)
2. ✅ Tüm environment'lar seçili mi? (Production, Preview, Development)
3. ✅ Key formatı doğru mu? (başında/sonunda boşluk yok)
4. ✅ Redeploy yaptınız mı? (Build cache kapalı)
5. ✅ Build log'larında key görünüyor mu?
6. ✅ Runtime log'larında hata var mı?

---

**Hala çalışmıyorsa, lütfen şunları paylaşın:**
- Vercel build log'ları (hata mesajı)
- Vercel runtime log'ları (hata mesajı)
- Hangi sayfada/ne zaman hata alıyorsunuz?

