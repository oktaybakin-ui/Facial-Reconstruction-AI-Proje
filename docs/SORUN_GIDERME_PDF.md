# 🔧 PDF Yükleme Sorun Giderme Kılavuzu

PDF yükleme çalışmıyorsa, aşağıdaki adımları takip edin:

## 1. Bucket Kontrolü ✅

Bucket'ın oluşturulduğunu kontrol edin:

1. **Supabase Dashboard** > **Storage** > **Buckets**
2. `medical-sources` bucket'ını görmelisiniz
3. Bucket **public** olarak işaretlenmiş olmalı (yeşil kilit ikonu)

### Bucket yoksa:
- `create_medical_sources_storage.sql` dosyasını SQL Editor'de çalıştırın

## 2. Policy Kontrolü 🔐

Policy'lerin eklenip eklenmediğini kontrol edin:

1. **Storage** > **Policies** sayfasına gidin
2. Aşağıdaki 4 policy'yi görmelisiniz:
   - `medical_sources_upload_policy` (INSERT)
   - `medical_sources_select_policy` (SELECT)
   - `medical_sources_delete_policy` (DELETE)
   - `medical_sources_update_policy` (UPDATE)

### Policy'ler eksikse:

#### Yöntem A: Dashboard'dan Ekleme (Önerilen)
1. **Storage** > **Policies** > **New Policy**
2. Her policy için:
   - **Policy name:** `medical_sources_upload_policy`
   - **Allowed operation:** `INSERT`
   - **Policy definition:**
     ```
     bucket_id = 'medical-sources'
     AND auth.uid()::text = (storage.foldername(name))[1]
     ```
3. Diğer 3 policy için de aynı işlemi tekrarlayın (SELECT, DELETE, UPDATE)

#### Yöntem B: SQL ile Ekleme
- `create_medical_sources_policies.sql` dosyasını çalıştırın
- **Not:** Yeterli yetkiye sahip olmanız gerekir

## 3. SQL Test Script'i Çalıştırma 🧪

Bucket ve policy'lerin durumunu kontrol etmek için:

1. **SQL Editor**'e gidin
2. `test_medical_sources_bucket.sql` dosyasını çalıştırın
3. Sonuçları kontrol edin:
   - Bucket görünüyor mu?
   - 4 policy var mı?
   - Bucket public mi?

## 4. Tarayıcı Konsolunu Kontrol Etme 🖥️

PDF yükleme sırasında hata alıyorsanız:

1. Tarayıcıda **F12** tuşuna basın
2. **Console** sekmesine gidin
3. PDF yükleme işlemini tekrar deneyin
4. Hata mesajlarını kontrol edin

### Yaygın Hatalar:

#### "Bucket not found"
- Bucket oluşturulmamış
- **Çözüm:** `create_medical_sources_storage.sql` çalıştırın

#### "new row violates row-level security policy" veya "403 Forbidden"
- Policy'ler eksik veya yanlış
- **Çözüm:** Policy'leri Dashboard'dan ekleyin

#### "File size exceeds limit"
- Dosya çok büyük
- **Çözüm:** Daha küçük bir PDF deneyin (maksimum 10MB)

## 5. Manuel Test 🧪

Bucket ve policy'lerin çalıştığını test etmek için:

1. **Storage** > **Buckets** > **medical-sources**
2. **Upload file** butonuna tıklayın
3. Bir PDF dosyası seçin
4. Yükleme başarılı olmalı

Eğer burada da hata alıyorsanız, policy'ler eksik veya yanlış demektir.

## 6. Kod Tarafında Kontrol 🔍

Eğer hala çalışmıyorsa:

1. Tarayıcı konsolunda (F12) hata mesajlarını kontrol edin
2. Hata mesajını not edin
3. Hata mesajına göre yukarıdaki adımları tekrar kontrol edin

## 7. Son Kontroller ✅

- ✅ Bucket oluşturuldu mu? (Storage > Buckets)
- ✅ Bucket public mi? (Yeşil kilit ikonu)
- ✅ 4 policy eklendi mi? (Storage > Policies)
- ✅ Kullanıcı giriş yaptı mı? (Auth kontrolü)
- ✅ Dosya boyutu 10MB'dan küçük mü?
- ✅ Dosya formatı PDF mi?

## 📞 Hala Çalışmıyorsa

1. Tarayıcı konsolundaki tam hata mesajını kopyalayın
2. Supabase Dashboard'da Storage > Policies sayfasının ekran görüntüsünü alın
3. `test_medical_sources_bucket.sql` script'inin sonuçlarını kontrol edin

Bu bilgilerle sorunu daha detaylı çözebiliriz.

