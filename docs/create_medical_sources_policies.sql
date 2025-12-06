-- Medical Sources Storage Policies (Alternatif - Eğer yetkiniz varsa)
-- Bu dosyayı sadece yeterli yetkiye sahipseniz çalıştırın
-- Aksi halde Dashboard'dan manuel olarak ekleyin (BUCKET_OLUSTURMA_TALIMATI.md'ye bakın)

-- Önce mevcut policy'leri temizle (varsa)
DROP POLICY IF EXISTS "medical_sources_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "medical_sources_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "medical_sources_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "medical_sources_update_policy" ON storage.objects;

-- Upload policy: Kullanıcılar kendi user_id klasörüne PDF yükleyebilir
CREATE POLICY "medical_sources_upload_policy"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-sources'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Select policy: Herkes public PDF'leri görüntüleyebilir (bucket public olduğu için)
CREATE POLICY "medical_sources_select_policy"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'medical-sources');

-- Delete policy: Kullanıcılar kendi PDF'lerini silebilir
CREATE POLICY "medical_sources_delete_policy"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'medical-sources'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update policy: Kullanıcılar kendi PDF'lerini güncelleyebilir
CREATE POLICY "medical_sources_update_policy"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'medical-sources'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

