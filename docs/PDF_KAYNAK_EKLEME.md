# 📄 PDF Kaynak Ekleme Kılavuzu

Bu kılavuz, tıbbi kaynak olarak PDF dosyası ekleme işlemini açıklar.

## 🚀 Hızlı Başlangıç

### 1. Supabase Storage Bucket'ını Oluşturma

PDF dosyalarını yüklemek için önce Supabase'de storage bucket'ını oluşturmanız gerekiyor:

1. **Supabase Dashboard**'a gidin
2. **SQL Editor**'e gidin
3. `create_medical_sources_storage.sql` dosyasının içeriğini kopyalayıp yapıştırın
4. **Run** butonuna tıklayın

Bu işlem:
- `medical-sources` adında bir public storage bucket oluşturur
- Gerekli güvenlik politikalarını (upload, view, delete) ayarlar

### 2. PDF Kaynağı Ekleme

1. **Dashboard**'dan **"📚 Bilgi Tabanı"** linkine tıklayın
2. **"➕ Yeni Kaynak Ekle"** butonuna tıklayın
3. **Kaynak Türü** olarak **"📑 PDF"** seçin
4. **Başlık** alanını doldurun
5. **PDF Dosyası Yükle** bölümünden PDF dosyanızı seçin (maksimum 10MB)
6. İsteğe bağlı olarak:
   - **İçerik** alanına PDF özeti veya notlar ekleyebilirsiniz
   - **PDF URL** alanına harici bir PDF linki girebilirsiniz (PDF dosyası yüklemediyseniz)
   - **İlgili Bölgeler** seçin
   - **İlgili Flep Tipleri** seçin
   - **Anahtar Kelimeler** ekleyin
7. **"💾 Kaydet"** butonuna tıklayın

### 3. PDF Görüntüleme

Eklenen PDF kaynaklarını görüntülemek için:

1. **Bilgi Tabanı** sayfasına gidin
2. PDF kaynağının kartında **"📄 PDF'i Görüntüle"** butonuna tıklayın
3. PDF bir modal pencerede açılır
4. İstediğiniz zaman **"✕ Kapat"** butonuyla kapatabilirsiniz

## 📋 Özellikler

- ✅ **Dosya Yükleme**: PDF dosyalarını doğrudan yükleyebilirsiniz
- ✅ **URL Desteği**: Harici PDF linklerini de ekleyebilirsiniz
- ✅ **Önizleme**: Yüklemeden önce PDF'i önizleyebilirsiniz
- ✅ **Görüntüleme**: Eklenen PDF'leri tarayıcıda görüntüleyebilirsiniz
- ✅ **Güvenlik**: Sadece yöneticiler PDF kaynağı ekleyebilir
- ✅ **Organizasyon**: PDF'ler kullanıcı ID'sine göre klasörlenir

## ⚠️ Önemli Notlar

1. **Dosya Boyutu**: PDF dosyaları maksimum 10MB olabilir
2. **Dosya Formatı**: Sadece PDF formatı kabul edilir (`.pdf`)
3. **Yönetici Yetkisi**: PDF kaynağı eklemek için yönetici yetkisi gereklidir
4. **Public Bucket**: PDF'ler public olarak saklanır, herkes görüntüleyebilir
5. **İçerik Alanı**: PDF dosyası yüklediğinizde içerik alanı opsiyoneldir, ancak PDF özeti veya notlar eklemeniz önerilir (AI için faydalıdır)

## 🔧 Sorun Giderme

### PDF yüklenmiyor
- Supabase Storage bucket'ının oluşturulduğundan emin olun
- Dosya boyutunun 10MB'dan küçük olduğundan emin olun
- Dosya formatının PDF olduğundan emin olun
- Tarayıcı konsolunda hata mesajlarını kontrol edin

### PDF görüntülenmiyor
- PDF URL'inin geçerli olduğundan emin olun
- Supabase Storage bucket'ının public olduğundan emin olun
- Tarayıcı konsolunda hata mesajlarını kontrol edin

### Yönetici yetkisi hatası
- `.env.local` dosyasında `ADMIN_EMAILS` değişkeninin doğru ayarlandığından emin olun
- Email adresinizin admin listesinde olduğundan emin olun

## 📝 Örnek Kullanım

```typescript
// PDF kaynağı ekleme örneği
{
  title: "Yüz Rekonstrüksiyon Teknikleri",
  source_type: "pdf",
  content: "Bu PDF, yüz bölgesi rekonstrüksiyon tekniklerini detaylı olarak açıklar...",
  region_focus: ["Alın", "Burun", "Yanak"],
  flap_types: ["Transpozisyon", "Rotasyon", "Bilobed"],
  keywords: ["rekonstrüksiyon", "flep", "yüz cerrahisi"]
}
```

## 🎯 Sonraki Adımlar

PDF kaynaklarınız eklendikten sonra:
- AI analizlerinde bu kaynaklar otomatik olarak referans olarak kullanılacaktır
- Kaynaklar bölge ve flep tipine göre filtrelenebilir
- Kaynaklar anahtar kelimelere göre aranabilir

