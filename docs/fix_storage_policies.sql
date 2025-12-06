-- Storage RLS Policy Düzeltmeleri

-- Önce mevcut policy'leri temizle
DROP POLICY IF EXISTS "Users can upload their own institution card" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own institution card" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload photos for their own cases" ON storage.objects;
DROP POLICY IF EXISTS "Users can view photos of their own cases" ON storage.objects;

-- Storage bucket'larını kontrol et ve oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('institution-cards', 'institution-cards', false),
  ('case-photos', 'case-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Case photos için daha esnek upload policy
-- Kullanıcılar kendi user_id klasörüne fotoğraf yükleyebilir
CREATE POLICY "Users can upload case photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'case-photos' 
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Case photos için view policy - user_id klasöründeki tüm dosyaları görebilir
CREATE POLICY "Users can view their case photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'case-photos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Case photos delete policy
CREATE POLICY "Users can delete their case photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'case-photos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Institution cards için upload policy
CREATE POLICY "Users can upload institution cards"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'institution-cards' 
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Institution cards için view policy
CREATE POLICY "Users can view institution cards"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'institution-cards'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

