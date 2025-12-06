-- Medical Sources Bucket Kontrol ve Test Script
-- Bu script bucket ve policy'lerin doğru kurulup kurulmadığını kontrol eder

-- ==========================================
-- 1. BUCKET KONTROLÜ
-- ==========================================
SELECT 
  id, 
  name, 
  public,
  created_at
FROM storage.buckets 
WHERE id = 'medical-sources';

-- Eğer sonuç boşsa, bucket oluşturulmamış demektir
-- create_medical_sources_storage.sql dosyasını çalıştırın

-- ==========================================
-- 2. POLICY KONTROLÜ
-- ==========================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%medical_sources%'
ORDER BY policyname;

-- Eğer sonuç boşsa veya 4 policy yoksa, policy'ler eksik demektir
-- Storage > Policies sayfasından manuel olarak ekleyin veya
-- create_medical_sources_policies.sql dosyasını çalıştırın

-- ==========================================
-- 3. BUCKET AYARLARI KONTROLÜ
-- ==========================================
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'medical-sources';

-- public = true olmalı
-- file_size_limit = null veya yeterli bir değer olmalı (örn: 10485760 = 10MB)

-- ==========================================
-- 4. MEVCUT DOSYALAR (TEST)
-- ==========================================
SELECT 
  name,
  bucket_id,
  created_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'medical-sources'
ORDER BY created_at DESC
LIMIT 10;

