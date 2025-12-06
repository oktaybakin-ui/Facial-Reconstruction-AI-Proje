-- Olgulara yeni alanlar ekleme
-- Vaka günü, saati, süre ve hasta özelliği bilgileri

-- Yeni kolonları ekle
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS case_date DATE,
ADD COLUMN IF NOT EXISTS case_time TIME,
ADD COLUMN IF NOT EXISTS case_duration_minutes INTEGER, -- Dakika cinsinden
ADD COLUMN IF NOT EXISTS patient_special_condition TEXT; -- Hastanın özel durumu (metin alanı)

-- Açıklamalar ekle
COMMENT ON COLUMN cases.case_date IS 'Vaka tarihi';
COMMENT ON COLUMN cases.case_time IS 'Vaka saati';
COMMENT ON COLUMN cases.case_duration_minutes IS 'Vaka süresi (dakika)';
COMMENT ON COLUMN cases.patient_special_condition IS 'Hastanın özel durumu/özelliği (varsa)';

-- Index ekle (tarih bazlı sorgular için)
CREATE INDEX IF NOT EXISTS idx_cases_case_date ON cases(case_date);

