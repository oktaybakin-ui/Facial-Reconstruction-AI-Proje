# OpenAI API Key Oluşturma ve Güncelleme Rehberi

## 🎯 OpenAI API Key Nasıl Oluşturulur?

### Adım 1: OpenAI Platform'a Giriş Yapın
1. https://platform.openai.com/ adresine gidin
2. Hesabınıza giriş yapın (veya yeni hesap oluşturun)

### Adım 2: API Keys Sayfasına Gidin
1. Sol menüden **API keys** seçeneğine tıklayın
   - Veya direkt: https://platform.openai.com/api-keys

### Adım 3: Yeni API Key Oluşturun
1. **"+ Create new secret key"** butonuna tıklayın
2. Key için bir isim verin (örn: "LocalFlaps Production")
3. **"Create secret key"** butonuna tıklayın
4. ⚠️ **ÖNEMLİ:** Key'i hemen kopyalayın! Bir daha gösterilmeyecek!

### Adım 4: API Key Formatı Kontrolü
Yeni key şu formatta olmalı:
- `sk-proj-...` (yeni format)
- veya `sk-...` (eski format)
- Uzunluk: ~150-200 karakter

## 🔧 Vercel'e API Key Ekleme

### Yöntem 1: Vercel Dashboard (Önerilen)
1. https://vercel.com/dashboard adresine gidin
2. Projenizi seçin: **Facial-Reconstruction-AI-Proje**
3. **Settings** → **Environment Variables** sekmesine gidin
4. **Add New** butonuna tıklayın
5. Şu bilgileri girin:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Yeni oluşturduğunuz API key'i yapıştırın
   - **Environment:** Production, Preview, Development (hepsini seçin)
6. **Save** butonuna tıklayın
7. ⚠️ **ÖNEMLİ:** Değişikliklerin aktif olması için yeni bir deployment yapın!

### Yöntem 2: Vercel CLI (Alternatif)
```bash
vercel env add OPENAI_API_KEY production
# Key'i yapıştırın
```

## 🔄 Deployment Yenileme
API key'i ekledikten sonra:
1. Vercel Dashboard → **Deployments** sekmesine gidin
2. En son deployment'ın yanındaki **"..."** menüsüne tıklayın
3. **"Redeploy"** seçeneğini seçin
4. Veya yeni bir commit push edin

## ✅ Kontrol
Deployment tamamlandıktan sonra:
1. https://www.localflaps.com/api/debug/env adresine gidin
2. `"hasOpenAI": true` görüyor olmalısınız
3. `"startsWith": "sk-proj"` veya `"sk-"` olmalı

## 🚨 Olası Sorunlar ve Çözümleri

### Sorun 1: "Incorrect API key provided"
**Çözüm:**
- Key'i tekrar kopyalayın (boşluk olmamalı)
- Vercel'de doğru environment variable adını kullandığınızdan emin olun
- Deployment'ı yenileyin

### Sorun 2: "You exceeded your current quota"
**Çözüm:**
1. https://platform.openai.com/account/billing adresine gidin
2. Billing sekmesinde kredi durumunu kontrol edin
3. Ödeme yöntemi ekleyin
4. Usage limits'i kontrol edin

### Sorun 3: "Rate limit exceeded"
**Çözüm:**
- Birkaç dakika bekleyin
- Rate limit ayarlarınızı kontrol edin: https://platform.openai.com/account/rate-limits

### Sorun 4: Key çalışmıyor
**Kontrol Listesi:**
- [ ] Key doğru kopyalandı mı? (başında/sonunda boşluk yok)
- [ ] Vercel'de doğru environment'a eklendi mi? (Production)
- [ ] Deployment yenilendi mi?
- [ ] Key aktif mi? (OpenAI platform'da silinmemiş mi?)
- [ ] Billing aktif mi?

## 📝 Key Türleri

### 1. Secret Key (Önerilen)
- Format: `sk-proj-...` veya `sk-...`
- Tüm API'lere erişim
- Production için kullanın

### 2. Service Account Key
- Format: `sk-svcacct-...`
- Özel service account'lar için
- Daha yüksek limitler

## 🔐 Güvenlik İpuçları

1. **Key'i asla commit etmeyin!**
   - `.env.local` dosyası `.gitignore`'da olmalı
   - Key'leri GitHub'a push etmeyin

2. **Key'i düzenli olarak rotate edin**
   - Her 3-6 ayda bir yeni key oluşturun
   - Eski key'i silin

3. **Key'e isim verin**
   - Hangi proje için olduğunu belirtin
   - Örn: "LocalFlaps-Production-2024"

4. **Usage'ı takip edin**
   - https://platform.openai.com/usage adresinden kullanımı kontrol edin
   - Anormal kullanımı tespit edin

## 📞 Yardım

Sorun devam ederse:
1. OpenAI Support: https://help.openai.com/
2. Vercel Support: https://vercel.com/support
3. Debug endpoint: https://www.localflaps.com/api/debug/env

