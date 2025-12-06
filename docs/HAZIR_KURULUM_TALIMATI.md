# 🚀 PDF Kaynak Sistemi - Hazır Kurulum

Bu kılavuz, PDF kaynak sistemini **5 dakikada** kurmanızı sağlar.

## ⚡ Hızlı Kurulum (Tek Adım)

### 1. Supabase SQL Editor'de Çalıştırın

1. **Supabase Dashboard**'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **"SQL Editor"** seçin
4. **"New query"** butonuna tıklayın
5. `KURULUM_TAMAMLAMA.sql` dosyasını açın
6. **Tüm içeriği** kopyalayın
7. SQL Editor'e yapıştırın
8. **"Run"** butonuna tıklayın (veya `Ctrl+Enter`)

### 2. Sonuçları Kontrol Edin

Script çalıştıktan sonra, sonuçlar bölümünde şunları görmelisiniz:

```
✅ medical_sources tablosu oluşturuldu
✅ Bucket oluşturuldu
✅ 4 storage policy eklendi
✅ Tablo policy'leri eklendi
```

Eğer ❌ görürseniz, hata mesajlarını kontrol edin.

### 3. Manuel Kontrol (Opsiyonel)

1. **Table Editor** > **medical_sources** tablosunu kontrol edin
   - Tablo görünmeli ve kolonlar doğru olmalı

2. **Storage** > **Buckets** sayfasına gidin
   - `medical-sources` bucket'ını görmelisiniz
   - **Public** olarak işaretlenmiş olmalı (yeşil kilit ikonu)

3. **Storage** > **Policies** sayfasına gidin
   - 4 policy görmelisiniz:
     - `medical_sources_upload_policy`
     - `medical_sources_select_policy`
     - `medical_sources_delete_policy`
     - `medical_sources_update_policy`

### 4. Test Edin

1. Tarayıcıyı yenileyin (F5)
2. **Bilgi Tabanı** > **Yeni Kaynak Ekle**
3. **Kaynak Türü:** PDF seçin
4. Bir PDF dosyası yükleyin
5. ✅ Başarılı olmalı!

## ❌ Hata Alırsanız

### "must be owner of relation objects" Hatası

Bu hata, SQL ile policy oluşturma yetkiniz olmadığı anlamına gelir.

**Çözüm:** Policy'leri Dashboard'dan manuel ekleyin:

1. **Storage** > **Policies** > **New Policy**
2. Aşağıdaki 4 policy'yi ekleyin:

#### Policy 1: Upload
- **Name:** `medical_sources_upload_policy`
- **Operation:** INSERT
- **Definition:**
  ```
  bucket_id = 'medical-sources'
  AND auth.uid()::text = (storage.foldername(name))[1]
  ```

#### Policy 2: Select
- **Name:** `medical_sources_select_policy`
- **Operation:** SELECT
- **Definition:**
  ```
  bucket_id = 'medical-sources'
  ```

#### Policy 3: Delete
- **Name:** `medical_sources_delete_policy`
- **Operation:** DELETE
- **Definition:**
  ```
  bucket_id = 'medical-sources'
  AND auth.uid()::text = (storage.foldername(name))[1]
  ```

#### Policy 4: Update
- **Name:** `medical_sources_update_policy`
- **Operation:** UPDATE
- **Definition:**
  ```
  bucket_id = 'medical-sources'
  AND auth.uid()::text = (storage.foldername(name))[1]
  ```

### "Bucket not found" Hatası

Bucket oluşturulmamış demektir.

**Çözüm:** 
1. **Storage** > **Buckets** > **New Bucket**
2. **Name:** `medical-sources`
3. **Public:** ✅ Evet
4. **Create**

## ✅ Kurulum Tamamlandı!

Artık PDF kaynak ekleyebilirsiniz. Sorun yaşarsanız `SORUN_GIDERME_PDF.md` dosyasına bakın.

