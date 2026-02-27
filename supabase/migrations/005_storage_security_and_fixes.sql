-- ============================================================
-- Migration 005: Storage Security + Database Fixes
-- ============================================================
-- 1. flap_feedback updated_at trigger
-- 2. Storage RLS policy fixes (match actual path structure)
-- ============================================================

-- ============================================================
-- 1. flap_feedback: Add updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_flap_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_flap_feedback_updated_at ON flap_feedback;
CREATE TRIGGER trigger_update_flap_feedback_updated_at
  BEFORE UPDATE ON flap_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_flap_feedback_updated_at();

-- ============================================================
-- 2. Fix storage RLS policies for case-photos bucket
--    Current code uploads to: {userId}/{fileName}
--    Old RLS expects: {caseId}/{fileName} (wrong!)
--    Fix: Allow user-folder-based access
-- ============================================================

-- Drop old case-based policies (if they exist)
DROP POLICY IF EXISTS "Users can upload photos for their own cases" ON storage.objects;
DROP POLICY IF EXISTS "Users can view photos of their own cases" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own case photos" ON storage.objects;

-- Create user-folder-based policies for case-photos
CREATE POLICY "case_photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'case-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "case_photos_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'case-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "case_photos_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'case-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Service role needs unrestricted access for AI processing
CREATE POLICY "service_role_case_photos_all"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'case-photos')
  WITH CHECK (bucket_id = 'case-photos');
