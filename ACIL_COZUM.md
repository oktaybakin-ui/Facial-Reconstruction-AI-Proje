# 🚨 ACİL ÇÖZÜM: OpenAI API Key Hatası

## ❌ Sorun
API key geçersiz: `401 Incorrect API key provided`
- Mevcut key: `sk-svcacct-...` (Service Account Key)
- Bu key çalışmıyor!

## ✅ Çözüm: Yeni Secret Key Oluşturun

### Adım 1: Yeni API Key Oluşturma
1. **https://platform.openai.com/api-keys** adresine gidin
2. **"+ Create new secret key"** butonuna tıklayın
3. Key için bir isim verin: **"LocalFlaps Production"**
4. **"Create secret key"** butonuna tıklayın
5. ⚠️ **ÖNEMLİ:** Key'i hemen kopyalayın! Bir daha gösterilmeyecek!
6. Key formatı: `sk-proj-...` veya `sk-...` olmalı (service account DEĞİL!)

### Adım 2: Vercel'e Ekleme
1. **https://vercel.com/dashboard** → Projenizi seçin
2. **Settings** → **Environment Variables**
3. `OPENAI_API_KEY` değişkenini bulun
4. **Edit** butonuna tıklayın
5. Yeni key'i yapıştırın (eski key'i silin, yeni key'i yazın)
6. **Save** butonuna tıklayın

### Adım 3: Deployment Yenileme
1. Vercel Dashboard → **Deployments** sekmesi
2. En son deployment'ın yanındaki **"..."** menüsü
3. **"Redeploy"** seçeneğini seçin
4. Veya yeni bir commit push edin

### Adım 4: Test
Deployment tamamlandıktan sonra:
```
https://www.localflaps.com/api/debug/test-openai
```

**Başarılı olursa:**
```json
{
  "success": true,
  "message": "OpenAI API key is working!",
  ...
}
```

## 🔍 Kontrol Listesi

- [ ] Yeni secret key oluşturuldu (`sk-proj-...` formatında)
- [ ] Vercel'de `OPENAI_API_KEY` güncellendi
- [ ] Deployment yenilendi (Redeploy)
- [ ] Test endpoint'i başarılı sonuç verdi

## ⚠️ Önemli Notlar

1. **Service Account Key kullanmayın!** → Normal Secret Key kullanın
2. **Key'i kopyalarken boşluk olmamalı**
3. **Deployment mutlaka yenilenmeli** (environment variable değişiklikleri için)
4. **Key formatı:** `sk-proj-...` veya `sk-...` olmalı

## 📞 Hala Çalışmıyorsa

1. OpenAI Dashboard'da key'in **aktif** olduğundan emin olun
2. Billing'de **kredi** olduğundan emin olun
3. Key'in **silinmediğinden** emin olun
4. Test endpoint'ini tekrar çalıştırın ve sonucu paylaşın

