# 🔧 Vercel'de Key Güncellendi Ama Çalışmıyor - Çözüm

## 🔍 Sorun Analizi

Localhost'ta çalışıyor ama Vercel'de çalışmıyor. Bu genellikle şu nedenlerden kaynaklanır:

1. **Build Cache Sorunu** - Eski key cache'de kalmış
2. **Key Format Sorunu** - Boşluk, tırnak, satır sonu
3. **Environment Seçimi** - Tüm environment'lar seçilmemiş
4. **Runtime'da Key Yüklenmemiş** - Build'de var ama runtime'da yok

---

## ✅ Adım Adım Çözüm

### 1. Vercel'de Key'i Kontrol Edin

**Vercel Dashboard:**
1. Settings → Environment Variables
2. `OPENAI_API_KEY` değişkenini bulun
3. **"..."** menüsünden **"View"** tıklayın
4. Key'in tamamını görüntüleyin

**Kontrol edin:**
- ✅ Key'in tamamı görünüyor mu?
- ✅ Key'in başında/sonunda boşluk var mı?
- ✅ Key tırnak içinde mi?
- ✅ Key'de satır sonu var mı?

### 2. Key'i Silip Yeniden Ekleyin

**Eğer format sorunu varsa:**

1. `OPENAI_API_KEY` değişkenini **SİLİN**
2. **"Add New"** ile yeniden ekleyin
3. Key'i **manuel olarak yazın** (kopyala-yapıştır yerine dikkatli yazın):
   ```
   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
   ```
4. **Environments:** Production, Preview, Development (hepsini seçin)
5. **Save**

### 3. Build Cache'i Temizleyin

**Çok Önemli!**

1. **Deployments** → Son deployment
2. **"..."** menüsünden **"Redeploy"**
3. **"Use existing Build Cache"** seçeneğini **MUTLAKA KAPATIN** ⚠️
4. **"Redeploy"** butonuna tıklayın

**Alternatif: Yeni Commit**

Eğer redeploy çalışmazsa:
1. Boş bir değişiklik yapın (örn: README'ye bir satır ekleyin)
2. Commit + Push yapın
3. Otomatik deploy olacak (cache temizlenecek)

### 4. Build Log'larını Kontrol Edin

**Deployments → Build Logs:**

Şu satırları arayın:
```
🔐 API Key'ler otomatik olarak ayarlanıyor...
✅ vercel-env.txt dosyası bulundu
✓ OPENAI_API_KEY ayarlandı
```

**Eğer görünmüyorsa:**
- `vercel-env.txt` dosyası Git'e commit edilmemiş olabilir
- Ama bu sorun değil, Vercel environment variable'ları otomatik yüklüyor

### 5. Runtime Log'larını Kontrol Edin

**Deployments → Runtime Logs:**

AI analiz yaparken şu log'ları görmelisiniz:
```
OpenAI API key present: true
Starting vision analysis...
```

**Eğer `false` görüyorsanız:**
- Key runtime'da yüklenmemiş
- Environment variable doğru environment'da seçilmemiş olabilir

---

## 🆘 Hala Çalışmıyorsa

### Çözüm 1: Key'i Farklı Environment'larda Kontrol Edin

Vercel'de key'in **tüm environment'larda** olduğundan emin olun:

1. Settings → Environment Variables
2. `OPENAI_API_KEY` değişkenini bulun
3. **"Edit"** tıklayın
4. **Environments** bölümünde:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
   - Hepsini seçin!

### Çözüm 2: Key Formatını Düzeltin

**Yaygın Format Hataları:**

❌ `OPENAI_API_KEY = sk-...` (eşittir etrafında boşluk)  
❌ `OPENAI_API_KEY="sk-..."` (tırnak içinde)  
❌ `OPENAI_API_KEY= sk-...` (eşittir sonrası boşluk)  
❌ Key'in sonunda görünmez karakterler

✅ `OPENAI_API_KEY=sk-...` (doğru format)

### Çözüm 3: Yeni Deployment Yapın

Redeploy çalışmazsa:

1. **Yeni bir commit yapın:**
   ```bash
   # Boş bir değişiklik
   echo "" >> README.md
   git add README.md
   git commit -m "Trigger redeploy"
   git push
   ```

2. Vercel otomatik deploy yapacak
3. Build cache temizlenecek

### Çözüm 4: Vercel CLI ile Kontrol Edin

**Yerel terminal'de:**

```bash
# Vercel CLI yüklü olmalı
npm install -g vercel

# Vercel'e bağlanın
vercel login

# Environment variable'ları kontrol edin
vercel env ls

# Key'i görüntüleyin (maskelenmiş)
vercel env pull .env.vercel
cat .env.vercel | grep OPENAI_API_KEY
```

---

## 🔍 Debug Adımları

### 1. Build Log Kontrolü

Vercel Dashboard → Deployments → Build Logs:

Arayın:
- `OPENAI_API_KEY` kelimesi
- `setup-env.js` çıktıları
- Hata mesajları

### 2. Runtime Log Kontrolü

Vercel Dashboard → Deployments → Runtime Logs:

AI analiz yaparken:
- `OpenAI API key present: true/false`
- Hata mesajları
- API çağrıları

### 3. Network Tab Kontrolü

Tarayıcıda (F12 → Network):
- `/api/cases/[id]/analyze` endpoint'ine istek
- Response'da hata mesajı
- Status code (401, 500, vs.)

---

## 📋 Kontrol Listesi

- [ ] Vercel Dashboard'da key var mı?
- [ ] Key'in formatı doğru mu? (boşluk, tırnak yok)
- [ ] Tüm environment'lar seçili mi? (Production, Preview, Development)
- [ ] Redeploy yaptınız mı?
- [ ] **Build Cache'i kapattınız mı?** ⚠️
- [ ] Build log'larında key görünüyor mu?
- [ ] Runtime log'larında `key present: true` görünüyor mu?
- [ ] Test ettiniz ve hala çalışmıyor mu?

---

## 🎯 En Olası Sorun

**Build Cache!** 

Vercel'de key'i güncelledikten sonra redeploy yaparken **mutlaka** "Use existing Build Cache" seçeneğini kapatın. Aksi halde eski key kullanılır.

---

## 💡 Hızlı Test

1. Vercel Dashboard → Settings → Environment Variables
2. `OPENAI_API_KEY` → Edit
3. Key'i **tamamen silin** ve **yeniden yazın**
4. Save
5. Deployments → Redeploy (cache kapalı)
6. Test edin

---

**Hala çalışmıyorsa, lütfen şunları paylaşın:**
- Vercel build log'ları (özellikle `setup-env.js` çıktıları)
- Vercel runtime log'ları (AI analiz sırasında)
- Hangi hata mesajını alıyorsunuz?

