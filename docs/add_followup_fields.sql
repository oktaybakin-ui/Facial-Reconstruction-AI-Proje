-- Olgulara kontrol tarihi ve patoloji takibi alanları ekleme

-- Yeni kolonları ekle
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS operation_date DATE, -- Operasyon tarihi
ADD COLUMN IF NOT EXISTS followup_days INTEGER DEFAULT 21, -- Kontrol süresi (operasyondan kaç gün sonra, varsayılan 21)
ADD COLUMN IF NOT EXISTS pathology_result_available BOOLEAN DEFAULT false, -- Patoloji sonucu çıktı mı?
ADD COLUMN IF NOT EXISTS pathology_result_date DATE, -- Patoloji sonuç tarihi
ADD COLUMN IF NOT EXISTS pathology_result TEXT; -- Patoloji sonucu (metin)

-- Hesaplanmış kontrol tarihini kolay sorgulamak için index
CREATE INDEX IF NOT EXISTS idx_cases_operation_date ON cases(operation_date) WHERE operation_date IS NOT NULL;

-- Açıklamalar ekle
COMMENT ON COLUMN cases.operation_date IS 'Operasyon tarihi';
COMMENT ON COLUMN cases.followup_days IS 'Kontrol süresi (operasyondan kaç gün sonra)';
COMMENT ON COLUMN cases.pathology_result_available IS 'Patoloji sonucu mevcut mu?';
COMMENT ON COLUMN cases.pathology_result_date IS 'Patoloji sonuç tarihi';
COMMENT ON COLUMN cases.pathology_result IS 'Patoloji sonucu (detay)';

-- Kontrol tarihini hesaplayan bir view (opsiyonel - kolay sorgulama için)
CREATE OR REPLACE VIEW cases_with_followup_dates AS
SELECT 
  *,
  CASE 
    WHEN operation_date IS NOT NULL AND followup_days IS NOT NULL 
    THEN operation_date + (followup_days || ' days')::INTERVAL::DATE
    ELSE NULL
  END AS calculated_followup_date,
  CASE 
    WHEN operation_date IS NOT NULL AND followup_days IS NOT NULL 
    THEN (operation_date + (followup_days || ' days')::INTERVAL::DATE) <= CURRENT_DATE
    ELSE false
  END AS followup_due
FROM cases;

