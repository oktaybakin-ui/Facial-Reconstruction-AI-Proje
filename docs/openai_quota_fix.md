# OpenAI API Quota Hatası Çözümü

## Hata Mesajı
```
429 You exceeded your current quota, please check your plan and billing details.
```

## Sorun
OpenAI API hesabınızda quota/kredi limitine ulaşılmış.

## Çözüm Adımları

### 1. OpenAI Hesabınızı Kontrol Edin
1. https://platform.openai.com/account/billing adresine gidin
2. Giriş yapın
3. **Billing** sekmesinde:
   - Mevcut kredinizi kontrol edin
   - Kullanım geçmişini inceleyin
   - Ödeme yöntemi ekleyin (gerekirse)

### 2. Ödeme Yöntemi Ekleyin
1. Billing Dashboard'da **Payment methods** bölümüne gidin
2. Kredi kartı veya başka bir ödeme yöntemi ekleyin
3. Otomatik ödeme açın (isteğe bağlı)

### 3. Quota Limitini Kontrol Edin
1. **Usage limits** bölümüne gidin
2. Rate limits ve usage limits'i kontrol edin
3. Gerekirse limit artırma talebinde bulunun

### 4. Yeni API Key Oluşturun (İsteğe Bağlı)
1. https://platform.openai.com/api-keys adresine gidin
2. **Create new secret key** butonuna tıklayın
3. Yeni key'i kopyalayın
4. `.env.local` dosyasındaki `OPENAI_API_KEY` değerini güncelleyin
5. Sunucuyu yeniden başlatın

### 5. Sunucuyu Yeniden Başlatın
```bash
Ctrl+C (durdur)
npm run dev (yeniden başlat)
```

## Alternatif Çözümler

### Geçici Çözüm: Rate Limiting
Eğer rate limit hatası alıyorsanız:
- Biraz bekleyin (birkaç dakika)
- Sonra tekrar deneyin

### API Key Değiştirme
1. Yeni bir API key oluşturun
2. `.env.local` dosyasını güncelleyin
3. Sunucuyu yeniden başlatın

## Kontrol Listesi

- [ ] OpenAI hesabında kredi var mı kontrol edildi
- [ ] Ödeme yöntemi eklendi
- [ ] API key aktif mi kontrol edildi
- [ ] `.env.local` dosyası doğru mu kontrol edildi
- [ ] Sunucu yeniden başlatıldı mı

## Yardımcı Linkler

- OpenAI Billing: https://platform.openai.com/account/billing
- API Keys: https://platform.openai.com/api-keys
- Usage Dashboard: https://platform.openai.com/usage
- Error Codes: https://platform.openai.com/docs/guides/error-codes

## Önemli Notlar

- Free tier kullanıyorsanız, sınırlı quota'nız vardır
- Ödeme yöntemi eklemek quota limitinizi artırabilir
- API key'lerinizi asla paylaşmayın veya public repository'lerde saklamayın

