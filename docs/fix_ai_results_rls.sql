-- AI Results RLS politikalarını kontrol et ve düzelt

-- Önce mevcut politikaları kontrol et
SELECT * FROM pg_policies WHERE tablename = 'ai_results';

-- Eğer RLS politikası sorunlu ise, yeniden oluştur
DROP POLICY IF EXISTS "Users can view AI results of their own cases" ON ai_results;

CREATE POLICY "Users can view AI results of their own cases"
  ON ai_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = ai_results.case_id
      AND cases.user_id = auth.uid()
    )
  );

-- Test sorgusu (kendi case'leriniz için)
-- SELECT ar.* 
-- FROM ai_results ar
-- JOIN cases c ON ar.case_id = c.id
-- WHERE c.user_id = auth.uid();

