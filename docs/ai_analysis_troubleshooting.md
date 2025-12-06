# AI Analiz Hata Giderme Rehberi

## Sorun: "Analiz sırasında hata oluştu"

Bu hata genellikle şu nedenlerden kaynaklanır:

### 1. API Key'ler Eksik veya Yanlış

**Kontrol:**
- `.env.local` dosyasını açın (proje kök dizininde)
- Şu değişkenlerin olduğundan emin olun:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

**Çözüm:**
1. OpenAI API key almak için: https://platform.openai.com/api-keys
2. Anthropic API key almak için: https://console.anthropic.com/

### 2. API Key'ler Doğru mu?

**Test:**
Terminal'de (npm run dev çalıştığı yerde) şu log'ları kontrol edin:
- `OpenAI API key present: true/false`
- `Anthropic API key present: true/false`

Eğer `false` görüyorsanız, API key'ler yüklenmemiş demektir.

### 3. Server Yeniden Başlatma

API key'leri ekledikten sonra:
1. `npm run dev` sunucusunu durdurun (Ctrl+C)
2. Yeniden başlatın: `npm run dev`
3. Sayfayı yenileyin

### 4. Hata Mesajları

Şimdi daha detaylı hata mesajları göreceksiniz:
- "OpenAI API key bulunamadı" → OPENAI_API_KEY eksik
- "Anthropic API key bulunamadı" → ANTHROPIC_API_KEY eksik
- "Görüntü analizi başarısız" → Vision API hatası
- "Flep önerisi başarısız" → Decision API hatası
- "Güvenlik incelemesi başarısız" → Safety API hatası

### 5. Terminal Log'ları

Terminal'de (npm run dev) şu log'ları göreceksiniz:
```
Starting Step 1: Vision analysis...
OpenAI API key present: true
Starting Step 2: Flap decision suggestions...
Starting Step 3: Safety review...
Anthropic API key present: true
```

Eğer bu log'lar görünmüyorsa, orchestrator'a ulaşmıyor demektir.

### 6. Browser Console

Browser console'da (F12) şu log'ları göreceksiniz:
- `Starting AI analysis for case: ...`
- `Request body to send: ...`
- Eğer hata varsa: Detaylı hata mesajı

## Hızlı Test

1. `.env.local` dosyasını kontrol edin
2. API key'lerin varlığını doğrulayın
3. Sunucuyu yeniden başlatın
4. Tarayıcı console'unu açın (F12)
5. Terminal log'larını izleyin
6. AI analiz butonuna tıklayın
7. Hata mesajlarını kontrol edin

## Sonraki Adımlar

Eğer hala hata alıyorsanız:
1. Terminal'deki son 20 satırı paylaşın
2. Browser console'daki hata mesajını paylaşın
3. `.env.local` dosyasında API key'lerin olduğunu doğrulayın (değerleri paylaşmayın, sadece var olduklarını söyleyin)

