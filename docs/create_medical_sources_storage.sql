-- Medical Sources Storage Bucket Oluşturma
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- NOT: Policy'leri Dashboard'dan manuel olarak eklemeniz gerekecek (aşağıdaki talimatlara bakın)

-- ==========================================
-- 1. STORAGE BUCKET OLUŞTUR
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-sources', 'medical-sources', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. STORAGE POLICY'LERİ
-- ==========================================
-- NOT: Policy'leri SQL ile oluşturmak için özel yetki gerektiğinden,
-- aşağıdaki policy'leri Supabase Dashboard'dan manuel olarak eklemeniz gerekiyor.
-- 
-- Dashboard > Storage > Policies > New Policy
-- Her policy için aşağıdaki bilgileri kullanın:
--
-- POLICY 1: Upload Policy
--   - Policy name: medical_sources_upload_policy
--   - Allowed operation: INSERT
--   - Policy definition:
--     bucket_id = 'medical-sources'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--
-- POLICY 2: Select Policy (Public Read)
--   - Policy name: medical_sources_select_policy
--   - Allowed operation: SELECT
--   - Policy definition:
--     bucket_id = 'medical-sources'
--
-- POLICY 3: Delete Policy
--   - Policy name: medical_sources_delete_policy
--   - Allowed operation: DELETE
--   - Policy definition:
--     bucket_id = 'medical-sources'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--
-- POLICY 4: Update Policy
--   - Policy name: medical_sources_update_policy
--   - Allowed operation: UPDATE
--   - Policy definition:
--     bucket_id = 'medical-sources'
--     AND auth.uid()::text = (storage.foldername(name))[1]

