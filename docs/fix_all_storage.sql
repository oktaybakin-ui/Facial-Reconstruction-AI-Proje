-- STORAGE RLS POLICY DÜZELTMELERİ - TÜM DÜZELTMELER
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- ==========================================
-- 1. MEVCUT POLICY'LERİ TEMİZLE
-- ==========================================

DROP POLICY IF EXISTS "Users can upload their own institution card" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own institution card" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload photos for their own cases" ON storage.objects;
DROP POLICY IF EXISTS "Users can view photos of their own cases" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload case photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their case photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their case photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload institution cards" ON storage.objects;
DROP POLICY IF EXISTS "Users can view institution cards" ON storage.objects;
DROP POLICY IF EXISTS "case_photos_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "case_photos_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "case_photos_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "institution_cards_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "institution_cards_select_policy" ON storage.objects;

-- ==========================================
-- 2. STORAGE BUCKET'LARINI OLUŞTUR
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('institution-cards', 'institution-cards', false),
  ('case-photos', 'case-photos', false)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 3. CASE PHOTOS STORAGE POLICY'LERİ
-- ==========================================

-- Upload policy: Kullanıcılar kendi user_id klasörüne fotoğraf yükleyebilir
CREATE POLICY "case_photos_upload_policy"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'case-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- View policy: Kullanıcılar kendi user_id klasöründeki fotoğrafları görebilir
CREATE POLICY "case_photos_select_policy"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'case-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete policy: Kullanıcılar kendi user_id klasöründeki fotoğrafları silebilir
CREATE POLICY "case_photos_delete_policy"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'case-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ==========================================
-- 4. INSTITUTION CARDS STORAGE POLICY'LERİ
-- ==========================================

-- Upload policy: Kullanıcılar kendi user_id klasörüne kurum kimlik kartı yükleyebilir
CREATE POLICY "institution_cards_upload_policy"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'institution-cards' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- View policy: Kullanıcılar kendi user_id klasöründeki kurum kimlik kartını görebilir
CREATE POLICY "institution_cards_select_policy"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'institution-cards'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ==========================================
-- 5. KONTROL KOMUTLARI (Opsiyonel)
-- ==========================================

-- Policy'lerin doğru oluşturulup oluşturulmadığını kontrol et
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

