# Manuel Vercel Key Güncelleme (Browser ile)

Eğer Vercel CLI çalışmıyorsa, browser'dan manuel olarak yapabilirsiniz:

## Adım 1: Vercel Dashboard'a Gidin
1. https://vercel.com/dashboard
2. Giriş yapın

## Adım 2: Projeyi Seçin
1. **Facial-Reconstruction-AI-Proje** projesine tıklayın

## Adım 3: Environment Variables Sayfasına Gidin
1. Üst menüden **Settings** sekmesine tıklayın
2. Sol menüden **Environment Variables** seçeneğine tıklayın

## Adım 4: Eski Key'i Silin
1. Listede `OPENAI_API_KEY` değişkenini bulun
2. Sağ taraftaki **"..."** (üç nokta) menüsüne tıklayın
3. **"Delete"** seçeneğini seçin
4. Onaylayın

## Adım 5: Yeni Key'i Ekleyin
1. **"+ Add New"** butonuna tıklayın
2. **Key:** `OPENAI_API_KEY` yazın
3. **Value:** Yeni OpenAI secret key'inizi yapıştırın
4. **Environment:** 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   - (Hepsini seçin!)
5. **"Save"** butonuna tıklayın

## Adım 6: Deployment Yenileyin
1. Üst menüden **Deployments** sekmesine gidin
2. En son deployment'ı bulun
3. Sağ taraftaki **"..."** (üç nokta) menüsüne tıklayın
4. **"Redeploy"** seçeneğini seçin
5. **"Use existing Build Cache"** seçeneğini **KAPATIN** (önemli!)
6. **"Redeploy"** butonuna tıklayın
7. 2-3 dakika bekleyin

## Adım 7: Test Edin
1. https://www.localflaps.com/api/debug/env
   - `"startsWith": "sk-proj"` görünmeli (service account değil!)
2. https://www.localflaps.com/api/debug/test-openai
   - `"success": true` görünmeli

## ⚠️ Önemli Notlar
- Service Account Key (`sk-svcacct-...`) kullanmayın!
- Secret Key (`sk-proj-...`) kullanın!
- Build cache'i temizleyin!
- Tüm environment'ları seçin!

