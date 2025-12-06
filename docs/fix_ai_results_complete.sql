-- AI Results UPSERT için RLS Policy Düzeltmesi (Tek Dosya)
-- Bu script tüm gerekli policy'leri ekler

-- Mevcut policy'leri kontrol et
SELECT * FROM pg_policies WHERE tablename = 'ai_results';

-- Service role için UPDATE policy ekle
DROP POLICY IF EXISTS "Service role can update AI results" ON ai_results;

CREATE POLICY "Service role can update AI results"
  ON ai_results FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Service role için DELETE policy ekle
DROP POLICY IF EXISTS "Service role can delete AI results" ON ai_results;

CREATE POLICY "Service role can delete AI results"
  ON ai_results FOR DELETE
  USING (true);

-- Kontrol: Tüm policy'ler
SELECT * FROM pg_policies WHERE tablename = 'ai_results';

-- NOT: Kod tarafında zaten DELETE + INSERT mantığı var
-- Bu policy'ler ek güvenlik için

