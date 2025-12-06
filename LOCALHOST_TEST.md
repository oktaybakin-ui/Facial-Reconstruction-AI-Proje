# 🧪 Localhost Test Rehberi

## ✅ Key Kontrolü

Key dosyada mevcut ve formatı doğru:
- ✅ `.env.local` dosyası mevcut
- ✅ `OPENAI_API_KEY` bulundu
- ✅ Key formatı doğru (`sk-` ile başlıyor)
- ✅ Key uzunluğu: 167 karakter

## 🚀 Localhost'ta Test

### 1. Sunucuyu Başlatın

```bash
cd "C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje"
npm run dev
```

### 2. Terminal'de Kontrol Edin

Sunucu başladığında terminal'de şu log'ları görmelisiniz:

```
🔐 API Key'ler otomatik olarak ayarlanıyor...
✅ vercel-env.txt dosyası bulundu
✅ .env.local dosyası oluşturuldu!
  ✓ OPENAI_API_KEY ayarlandı
```

### 3. Tarayıcıda Test

1. **Ana sayfaya gidin:**
   - http://localhost:3000

2. **Giriş yapın:**
   - Giriş yapın veya yeni hesap oluşturun

3. **Yeni olgu oluşturun:**
   - "Yeni Olgu" butonuna tıklayın
   - Pre-op fotoğraf yükleyin
   - Olgu bilgilerini doldurun
   - Kaydedin

4. **AI Analiz yapın:**
   - Olgu detay sayfasına gidin
   - "AI Analiz" butonuna tıklayın
   - Terminal'de log'ları izleyin

### 4. Terminal Log'larını İzleyin

AI analiz sırasında terminal'de şu log'ları görmelisiniz:

```
Starting vision analysis with image URL: ...
OpenAI API key present: true
Starting Step 1: Vision analysis...
Starting Step 2: Flap decision suggestions...
OpenAI API key present: true
```

**Eğer hata görürseniz:**
- `OpenAI API key present: false` → Key yüklenmemiş
- `401 Incorrect API key` → Key geçersiz
- `429 rate limit` → Quota/rate limit sorunu

## 🔍 Sorun Giderme

### Key Yüklenmemiş

**Kontrol:**
```bash
# .env.local dosyasını kontrol edin
Get-Content .env.local | Select-String "OPENAI_API_KEY"
```

**Çözüm:**
```bash
# Key'leri yeniden ayarlayın
node setup-env.js
```

### Key Geçersiz

**Kontrol:**
- Key'in tamamı kopyalanmış mı?
- Key'de boşluk var mı?
- Key'in sonunda satır sonu var mı?

**Çözüm:**
1. `vercel-env.txt` dosyasını kontrol edin
2. Key'i manuel olarak düzeltin
3. `node setup-env.js` çalıştırın

### Sunucu Yeniden Başlatma

Key'i güncelledikten sonra:
1. Sunucuyu durdurun (Ctrl+C)
2. Yeniden başlatın: `npm run dev`

## 📋 Test Senaryosu

1. ✅ Sunucu başladı mı? (http://localhost:3000 açılıyor mu?)
2. ✅ Giriş yapabildiniz mi?
3. ✅ Yeni olgu oluşturabildiniz mi?
4. ✅ Pre-op fotoğraf yükleyebildiniz mi?
5. ✅ AI Analiz butonu görünüyor mu?
6. ✅ AI Analiz çalışıyor mu?
7. ✅ Terminal'de hata var mı?

## 🆘 Hata Mesajları

| Hata | Anlamı | Çözüm |
|------|--------|-------|
| `OpenAI API key bulunamadı` | Key yüklenmemiş | `node setup-env.js` çalıştırın |
| `401 Incorrect API key` | Key geçersiz | Yeni key oluşturun |
| `429 rate limit` | Quota aşıldı | Biraz bekleyin veya billing kontrol edin |

---

**Test sonuçlarını paylaşın:**
- Terminal'de hangi log'lar görünüyor?
- Hangi hata mesajını alıyorsunuz?
- AI analiz çalışıyor mu?

