# Vercel'de API Key Güncelleme - Adım Adım

## ⚠️ ÖNEMLİ: Hala Eski Key Kullanılıyor!

Test sonucu gösteriyor ki Vercel'de hala eski `sk-svcacct-...` key'i kullanılıyor.

## 🔧 Vercel'de Key Güncelleme (Detaylı)

### Adım 1: Vercel Dashboard'a Gidin
1. https://vercel.com/dashboard
2. Giriş yapın
3. **Facial-Reconstruction-AI-Proje** projesini seçin

### Adım 2: Environment Variables Sayfasına Gidin
1. Üst menüden **Settings** sekmesine tıklayın
2. Sol menüden **Environment Variables** seçeneğine tıklayın

### Adım 3: OPENAI_API_KEY'i Bulun
1. Listede `OPENAI_API_KEY` değişkenini bulun
2. **Edit** (kalem ikonu) butonuna tıklayın

### Adım 4: Key'i Güncelleyin
1. **Mevcut değeri tamamen silin** (eski `sk-svcacct-...` key'i)
2. **Yeni secret key'i yapıştırın** (`sk-proj-...` formatında)
3. ⚠️ **Boşluk olmamalı!** Key'in başında/sonunda boşluk yok mu kontrol edin
4. **Environment seçimi:** 
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
   - (Hepsini seçin!)

### Adım 5: Kaydedin
1. **Save** butonuna tıklayın
2. Onay mesajını bekleyin

### Adım 6: Deployment Yenileyin (ÇOK ÖNEMLİ!)
Environment variable değişiklikleri için **mutlaka** deployment yenilenmeli:

**Yöntem 1: Redeploy (Hızlı)**
1. Üst menüden **Deployments** sekmesine gidin
2. En son deployment'ı bulun
3. Sağ taraftaki **"..."** (üç nokta) menüsüne tıklayın
4. **"Redeploy"** seçeneğini seçin
5. Onaylayın

**Yöntem 2: Yeni Commit (Alternatif)**
1. Herhangi bir dosyada küçük bir değişiklik yapın
2. Commit edin ve push edin
3. Vercel otomatik deploy edecek

### Adım 7: Bekleyin
- Deployment genellikle 1-3 dakika sürer
- Deployment tamamlanana kadar bekleyin

### Adım 8: Test Edin
Deployment tamamlandıktan sonra:
```
https://www.localflaps.com/api/debug/test-openai
```

**Başarılı olursa:**
```json
{
  "success": true,
  "message": "OpenAI API key is working!"
}
```

## 🔍 Kontrol Listesi

- [ ] Yeni secret key oluşturuldu (`sk-proj-...` formatında, service account DEĞİL)
- [ ] Vercel Dashboard → Settings → Environment Variables açıldı
- [ ] `OPENAI_API_KEY` bulundu ve Edit'e tıklandı
- [ ] Eski key tamamen silindi
- [ ] Yeni key yapıştırıldı (başında/sonunda boşluk yok)
- [ ] Environment'lar seçildi (Production, Preview, Development)
- [ ] Save butonuna tıklandı
- [ ] Deployment yenilendi (Redeploy veya yeni commit)
- [ ] Deployment tamamlandı (1-3 dakika beklendi)
- [ ] Test endpoint'i başarılı sonuç verdi

## ❌ Yaygın Hatalar

### Hata 1: Key güncellendi ama deployment yenilenmedi
**Çözüm:** Mutlaka Redeploy yapın!

### Hata 2: Key'in başında/sonunda boşluk var
**Çözüm:** Key'i tekrar kopyalayın, boşlukları temizleyin

### Hata 3: Yanlış environment seçildi
**Çözüm:** Production, Preview, Development hepsini seçin

### Hata 4: Hala service account key kullanılıyor
**Çözüm:** Yeni bir **secret key** oluşturun (service account değil!)

## 📞 Hala Çalışmıyorsa

1. Vercel Dashboard'da key'in gerçekten güncellendiğini kontrol edin
2. Deployment log'larını kontrol edin (Deployments → Son deployment → Logs)
3. Test endpoint'ini tekrar çalıştırın
4. Sonucu paylaşın

