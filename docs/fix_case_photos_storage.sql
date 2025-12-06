-- Case-photos Storage Erişim Düzeltmesi
-- Bu script case-photos bucket'ını public yapar ve gerekli policy'leri ayarlar

-- 1. Mevcut bucket durumunu kontrol et
SELECT id, name, public FROM storage.buckets WHERE id = 'case-photos';

-- 2. Bucket'ı public yap (eğer yoksa oluştur)
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-photos', 'case-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Alternatif: Sadece update (eğer bucket zaten varsa)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'case-photos';

-- 3. Kontrol: Bucket'ın public olduğunu doğrula
SELECT id, name, public FROM storage.buckets WHERE id = 'case-photos';

-- 4. Public erişim için policy ekle (ek güvenlik için)
-- Bu policy, case-photos bucket'ındaki tüm dosyalara public erişim sağlar
-- RLS policy'leri zaten güvenliği sağlıyor

DROP POLICY IF EXISTS "Public can view case photos" ON storage.objects;

CREATE POLICY "Public can view case photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'case-photos');

-- 5. Mevcut storage policy'lerini kontrol et
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%case%photo%';

-- 6. Son kontrol: Bucket ve policy'ler doğru mu?
SELECT 
  b.id as bucket_id,
  b.name as bucket_name,
  b.public as is_public,
  COUNT(p.policyname) as policy_count
FROM storage.buckets b
LEFT JOIN pg_policies p ON p.schemaname = 'storage' 
  AND p.tablename = 'objects'
  AND p.policyname LIKE '%case%photo%'
WHERE b.id = 'case-photos'
GROUP BY b.id, b.name, b.public;

