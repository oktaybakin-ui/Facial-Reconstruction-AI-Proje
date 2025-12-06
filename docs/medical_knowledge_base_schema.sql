-- Medical Knowledge Base Schema for Tıbbi Kaynak Yönetimi
-- This allows users to upload and manage medical sources that AI can reference

-- Create medical_sources table
CREATE TABLE IF NOT EXISTS medical_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Full text content of the source
  source_type TEXT NOT NULL CHECK (source_type IN ('text', 'pdf', 'article', 'book', 'guideline', 'research')),
  source_url TEXT, -- Optional URL if source is online
  keywords TEXT[], -- Array of keywords for search
  region_focus TEXT[], -- Array of regions this source is relevant for (e.g., ['Alın', 'Burun', 'Göz kapağı'])
  flap_types TEXT[], -- Array of flap types this source covers (e.g., ['Transpozisyon', 'Rotasyon', 'Bilobed'])
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true -- Allow soft delete
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_medical_sources_user_id ON medical_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_sources_keywords ON medical_sources USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_medical_sources_region_focus ON medical_sources USING GIN(region_focus);
CREATE INDEX IF NOT EXISTS idx_medical_sources_flap_types ON medical_sources USING GIN(flap_types);
CREATE INDEX IF NOT EXISTS idx_medical_sources_active ON medical_sources(is_active) WHERE is_active = true;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_medical_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_medical_sources_updated_at
  BEFORE UPDATE ON medical_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_sources_updated_at();

-- RLS Policies
ALTER TABLE medical_sources ENABLE ROW LEVEL SECURITY;

-- Users can view their own sources
CREATE POLICY "Users can view their own medical sources"
  ON medical_sources FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sources
CREATE POLICY "Users can insert their own medical sources"
  ON medical_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sources
CREATE POLICY "Users can update their own medical sources"
  ON medical_sources FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sources
CREATE POLICY "Users can delete their own medical sources"
  ON medical_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can do everything (for API access)
CREATE POLICY "Service role can manage all medical sources"
  ON medical_sources
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to search medical sources by keywords and region
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
      -- Simple relevance scoring based on keyword matches
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
  WHERE ms.user_id = p_user_id
    AND ms.is_active = true
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_medical_sources TO authenticated;
GRANT EXECUTE ON FUNCTION search_medical_sources TO service_role;

COMMENT ON TABLE medical_sources IS 'Tıbbi kaynaklar (text, PDF, makale, kitap, guideline, araştırma) - AI referans kaynakları';
COMMENT ON FUNCTION search_medical_sources IS 'Kullanıcının tıbbi kaynaklarını anahtar kelime, bölge ve flep tipine göre arayan fonksiyon';

