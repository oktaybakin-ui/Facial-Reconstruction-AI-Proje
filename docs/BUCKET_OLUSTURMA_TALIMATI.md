# 🪣 Supabase Storage Bucket Oluşturma - Hızlı Talimat

"Bucket not found" hatası alıyorsanız, aşağıdaki adımlardan birini takip edin:

## Yöntem 1: SQL Script ile Bucket Oluşturma ⚡

1. **Supabase Dashboard**'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **"SQL Editor"** seçin
4. **"New query"** butonuna tıklayın
5. `create_medical_sources_storage.sql` dosyasının içeriğini kopyalayın
6. SQL Editor'e yapıştırın
7. **"Run"** butonuna tıklayın (veya `Ctrl+Enter`)
8. ✅ Bucket oluşturuldu mesajını görmelisiniz

### Policy'leri Dashboard'dan Ekleme (Gerekli)

Bucket oluşturulduktan sonra policy'leri eklemeniz gerekiyor:

1. **Storage** > **Policies** sayfasına gidin
2. **"New Policy"** butonuna tıklayın
3. Aşağıdaki 4 policy'yi sırayla ekleyin:

#### Policy 1: Upload (INSERT)
- **Policy name:** `medical_sources_upload_policy`
- **Allowed operation:** `INSERT`
- **Policy definition:**
  ```sql
  bucket_id = 'medical-sources'
  AND auth.uid()::text = (storage.foldername(name))[1]
  ```

#### Policy 2: Select (SELECT) - Public Read
- **Policy name:** `medical_sources_select_policy`
- **Allowed operation:** `SELECT`
- **Policy definition:**
  ```sql
  bucket_id = 'medical-sources'
  ```

#### Policy 3: Delete (DELETE)
- **Policy name:** `medical_sources_delete_policy`
- **Allowed operation:** `DELETE`
- **Policy definition:**
  ```sql
  bucket_id = 'medical-sources'
  AND auth.uid()::text = (storage.foldername(name))[1]
  ```

#### Policy 4: Update (UPDATE)
- **Policy name:** `medical_sources_update_policy`
- **Allowed operation:** `UPDATE`
- **Policy definition:**
  ```sql
  bucket_id = 'medical-sources'
  AND auth.uid()::text = (storage.foldername(name))[1]
  ```

## Yöntem 2: Dashboard'dan Manuel Oluşturma 🖱️

1. **Supabase Dashboard** > Projeniz
2. Sol menüden **"Storage"** seçin
3. **"New bucket"** butonuna tıklayın
4. Şu bilgileri girin:
   - **Name:** `medical-sources`
   - **Public bucket:** ✅ **Evet** (işaretleyin)
   - **File size limit:** 10 MB (veya istediğiniz limit)
   - **Allowed MIME types:** `application/pdf` (veya boş bırakın)
5. **"Create bucket"** butonuna tıklayın

### Manuel Oluşturma Sonrası Policy'leri Ekleyin

Bucket'ı manuel oluşturduysanız, yukarıdaki **"Policy'leri Dashboard'dan Ekleme"** bölümündeki adımları takip edin.

## ✅ Kontrol Etme

Bucket'ın oluşturulduğunu kontrol etmek için:

1. **Storage** > **Buckets** sayfasına gidin
2. `medical-sources` bucket'ını görmelisiniz
3. Public olarak işaretlenmiş olmalı (yeşil kilit ikonu)

## 🔄 Sonraki Adım

Bucket oluşturulduktan sonra:
- PDF yükleme işlemi çalışmalı
- Hata mesajı kaybolmalı
- PDF'ler başarıyla yüklenebilmeli

## ❓ Sorun Devam Ederse

- Supabase Dashboard'da bucket'ın göründüğünden emin olun
- Bucket'ın **public** olduğundan emin olun
- Tarayıcı konsolunda (F12) hata mesajlarını kontrol edin
- Supabase projenizin aktif olduğundan emin olun

