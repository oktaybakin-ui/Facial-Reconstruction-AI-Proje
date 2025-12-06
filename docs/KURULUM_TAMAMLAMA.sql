-- ==========================================
-- MEDICAL SOURCES - TAM KURULUM (TABLO + STORAGE)
-- ==========================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- Tüm tablo, bucket ve policy'leri otomatik oluşturur
-- ==========================================

-- ==========================================
-- 1. MEDICAL_SOURCES TABLOSU OLUŞTUR
-- ==========================================
CREATE TABLE IF NOT EXISTS medical_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('text', 'pdf', 'article', 'book', 'guideline', 'research')),
  source_url TEXT,
  keywords TEXT[],
  region_focus TEXT[],
  flap_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_medical_sources_user_id ON medical_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_sources_keywords ON medical_sources USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_medical_sources_region_focus ON medical_sources USING GIN(region_focus);
CREATE INDEX IF NOT EXISTS idx_medical_sources_flap_types ON medical_sources USING GIN(flap_types);
CREATE INDEX IF NOT EXISTS idx_medical_sources_active ON medical_sources(is_active) WHERE is_active = true;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_medical_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_medical_sources_updated_at ON medical_sources;
CREATE TRIGGER trigger_update_medical_sources_updated_at
  BEFORE UPDATE ON medical_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_sources_updated_at();

-- RLS Policies
ALTER TABLE medical_sources ENABLE ROW LEVEL SECURITY;

-- Mevcut policy'leri temizle
DROP POLICY IF EXISTS "Users can view their own medical sources" ON medical_sources;
DROP POLICY IF EXISTS "Users can insert their own medical sources" ON medical_sources;
DROP POLICY IF EXISTS "Users can update their own medical sources" ON medical_sources;
DROP POLICY IF EXISTS "Users can delete their own medical sources" ON medical_sources;
DROP POLICY IF EXISTS "Service role can manage all medical sources" ON medical_sources;

-- RLS Policy'leri oluştur
CREATE POLICY "Users can view their own medical sources"
  ON medical_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical sources"
  ON medical_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical sources"
  ON medical_sources FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical sources"
  ON medical_sources FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all medical sources"
  ON medical_sources
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ayrıca herkes aktif kaynakları görebilir (admin kaynakları için)
CREATE POLICY "Everyone can view active medical sources"
  ON medical_sources FOR SELECT
  USING (is_active = true);

-- Search function
CREATE OR REPLACE FUNCTION search_medical_sources(
  p_user_id UUID,
  p_keywords TEXT[] DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_flap_type TEXT DEFAULT NULL,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  source_type TEXT,
  relevance_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ms.id,
    ms.title,
    ms.content,
    ms.source_type,
    (
      CASE 
        WHEN p_keywords IS NOT NULL THEN
          (
            SELECT COUNT(*)::REAL
            FROM unnest(p_keywords) AS keyword
            WHERE ms.keywords @> ARRAY[keyword]
            OR ms.content ILIKE '%' || keyword || '%'
          ) / GREATEST(array_length(p_keywords, 1), 1)::REAL
        ELSE 0
      END +
      CASE 
        WHEN p_region IS NOT NULL AND ms.region_focus @> ARRAY[p_region] THEN 0.5
        ELSE 0
      END +
      CASE 
        WHEN p_flap_type IS NOT NULL AND ms.flap_types @> ARRAY[p_flap_type] THEN 0.5
        ELSE 0
      END
    ) AS relevance_score
  FROM medical_sources ms
  WHERE ms.is_active = true
    AND (
      p_keywords IS NULL OR
      ms.keywords && p_keywords OR
      EXISTS (
        SELECT 1 FROM unnest(p_keywords) AS keyword
        WHERE ms.content ILIKE '%' || keyword || '%'
      )
    )
    AND (p_region IS NULL OR ms.region_focus @> ARRAY[p_region])
    AND (p_flap_type IS NULL OR ms.flap_types @> ARRAY[p_flap_type])
  ORDER BY relevance_score DESC, ms.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_medical_sources TO authenticated;
GRANT EXECUTE ON FUNCTION search_medical_sources TO service_role;

-- ==========================================
-- 2. STORAGE BUCKET OLUŞTUR
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-sources', 'medical-sources', true)
ON CONFLICT (id) DO UPDATE 
SET public = true; -- Eğer varsa public yap

-- ==========================================
-- 2. MEVCUT POLICY'LERİ TEMİZLE (Varsa)
-- ==========================================
DROP POLICY IF EXISTS "medical_sources_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "medical_sources_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "medical_sources_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "medical_sources_update_policy" ON storage.objects;

-- ==========================================
-- 3. POLICY'LERİ OLUŞTUR
-- ==========================================

-- Upload Policy: Kullanıcılar kendi user_id klasörüne PDF yükleyebilir
CREATE POLICY "medical_sources_upload_policy"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-sources'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Select Policy: Herkes public PDF'leri görüntüleyebilir
CREATE POLICY "medical_sources_select_policy"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'medical-sources');

-- Delete Policy: Kullanıcılar kendi PDF'lerini silebilir
CREATE POLICY "medical_sources_delete_policy"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'medical-sources'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update Policy: Kullanıcılar kendi PDF'lerini güncelleyebilir
CREATE POLICY "medical_sources_update_policy"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'medical-sources'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ==========================================
-- 4. KONTROL SORGUSU
-- ==========================================
-- Aşağıdaki sorgu çalıştıktan sonra sonuçları kontrol edin

SELECT 
  'Tablo Kontrolü' as kontrol,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_sources') 
    THEN '✅ medical_sources tablosu oluşturuldu'
    ELSE '❌ Tablo bulunamadı'
  END as durum
UNION ALL
SELECT 
  'Bucket Kontrolü' as kontrol,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'medical-sources') 
    THEN '✅ Bucket oluşturuldu'
    ELSE '❌ Bucket bulunamadı'
  END as durum
UNION ALL
SELECT 
  'Storage Policy Kontrolü' as kontrol,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE schemaname = 'storage' 
          AND tablename = 'objects'
          AND policyname LIKE '%medical_sources%') = 4
    THEN '✅ 4 storage policy eklendi'
    ELSE '❌ Storage policy eksik - ' || 
         (SELECT COUNT(*)::text FROM pg_policies 
          WHERE schemaname = 'storage' 
          AND tablename = 'objects'
          AND policyname LIKE '%medical_sources%') || ' policy bulundu'
  END as durum
UNION ALL
SELECT 
  'Table Policy Kontrolü' as kontrol,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = 'medical_sources') >= 5
    THEN '✅ Tablo policy''leri eklendi'
    ELSE '❌ Tablo policy eksik - ' || 
         (SELECT COUNT(*)::text FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = 'medical_sources') || ' policy bulundu'
  END as durum;

