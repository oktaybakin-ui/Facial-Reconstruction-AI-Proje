# 🔍 Vercel Key Debug Rehberi

## 🎯 Sorun: Key Güncellendi Ama Hala Çalışmıyor

### Adım 1: Debug Endpoint ile Kontrol

**Vercel'de deploy edilmiş sitenizde:**

1. Tarayıcıda şu URL'ye gidin:
   ```
   https://your-site.vercel.app/api/debug/env
   ```

2. **Response'u kontrol edin:**
   ```json
   {
     "keys": {
       "OPENAI_API_KEY": {
         "present": true/false,
         "length": 167,
         "startsWith": "sk-svcacct",
         "endsWith": "...BYKJ0A"
       }
     }
   }
   ```

**Eğer `present: false` görüyorsanız:**
- Key Vercel'de yüklenmemiş
- Key yanlış environment'da seçilmiş
- Key formatında sorun var

### Adım 2: Vercel Dashboard Kontrolü

**1. Environment Variables Kontrolü:**

Vercel Dashboard → Settings → Environment Variables:

- `OPENAI_API_KEY` değişkenini bulun
- **"..."** menüsünden **"View"** tıklayın
- Key'in tamamını görüntüleyin

**Kontrol edin:**
- ✅ Key'in tamamı görünüyor mu?
- ✅ Key'in başında/sonunda boşluk var mı?
- ✅ Key tırnak içinde mi?

**2. Environment Seçimi:**

`OPENAI_API_KEY` değişkeninin yanında:
- ✅ Production seçili mi?
- ✅ Preview seçili mi?
- ✅ Development seçili mi?

**Hepsi seçili olmalı!**

### Adım 3: Build Log Kontrolü

**Vercel Dashboard → Deployments → Build Logs:**

Arayın:
```
🔐 API Key'ler otomatik olarak ayarlanıyor...
✅ vercel-env.txt dosyası bulundu
✓ OPENAI_API_KEY ayarlandı
```

**Veya:**
```
🔐 Vercel ortamı tespit edildi
✅ OPENAI_API_KEY: Yüklendi
```

**Eğer görünmüyorsa:**
- `setup-env.js` çalışmıyor olabilir
- Key Vercel environment variable'larında yok

### Adım 4: Runtime Log Kontrolü

**Vercel Dashboard → Deployments → Runtime Logs:**

AI analiz yaparken:
```
OpenAI API key present: true
Starting vision analysis...
```

**Eğer `false` görüyorsanız:**
- Key runtime'da yüklenmemiş
- Environment variable doğru environment'da seçilmemiş

---

## 🔧 Çözüm Adımları

### Çözüm 1: Key'i Yeniden Ekleyin

1. **Vercel Dashboard:**
   - Settings → Environment Variables
   - `OPENAI_API_KEY` değişkenini **SİLİN**
   - **"Add New"** ile yeniden ekleyin
   - Key'i **manuel olarak yazın** (dikkatli!)
   - **Environments:** Production, Preview, Development (hepsini seçin)
   - Save

2. **Redeploy:**
   - Deployments → Redeploy
   - **"Use existing Build Cache"** KAPATIN
   - Redeploy

### Çözüm 2: Key Formatını Kontrol Edin

**Yaygın Hatalar:**

❌ `OPENAI_API_KEY = sk-...` (eşittir etrafında boşluk)  
❌ `OPENAI_API_KEY="sk-..."` (tırnak içinde)  
❌ `OPENAI_API_KEY= sk-...` (eşittir sonrası boşluk)  
❌ Key'in sonunda görünmez karakterler

✅ `OPENAI_API_KEY=sk-...` (doğru format)

### Çözüm 3: Tüm Environment'ları Seçin

**Vercel'de key eklerken:**

- ✅ Production
- ✅ Preview
- ✅ Development

**Hepsi seçili olmalı!**

### Çözüm 4: Yeni Key Oluşturun

**Eğer key gerçekten kaybolduysa:**

1. **OpenAI Platform:**
   - https://platform.openai.com/api-keys
   - "Create new secret key"
   - Yeni key'i kopyalayın

2. **Vercel'e ekleyin:**
   - Settings → Environment Variables
   - `OPENAI_API_KEY` → Edit
   - Yeni key'i yapıştırın
   - Tüm environment'ları seçin
   - Save

3. **Redeploy:**
   - Build cache'i kapatarak redeploy

---

## 📋 Debug Checklist

- [ ] Debug endpoint'te key görünüyor mu? (`/api/debug/env`)
- [ ] Vercel Dashboard'da key var mı?
- [ ] Key'in formatı doğru mu? (boşluk, tırnak yok)
- [ ] Tüm environment'lar seçili mi? (Production, Preview, Development)
- [ ] Build log'larında key görünüyor mu?
- [ ] Runtime log'larında `key present: true` görünüyor mu?
- [ ] Redeploy yaptınız mı? (cache kapalı)
- [ ] Yeni key oluşturdunuz mu? (gerekirse)

---

## 🆘 Hala Çalışmıyorsa

**Lütfen şunları paylaşın:**

1. **Debug endpoint response:**
   - `https://your-site.vercel.app/api/debug/env` sonucu

2. **Vercel build log'ları:**
   - `setup-env.js` çıktıları
   - Hata mesajları

3. **Vercel runtime log'ları:**
   - AI analiz sırasında log'lar
   - Hata mesajları

4. **Hangi hata mesajını alıyorsunuz?**
   - Tam hata mesajı
   - Hangi sayfada/ne zaman

---

**Debug endpoint ile key'in runtime'da yüklenip yüklenmediğini kontrol edin!** 🔍

