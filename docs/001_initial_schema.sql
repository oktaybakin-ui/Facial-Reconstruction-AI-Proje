-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE sex_type AS ENUM ('M', 'F', 'Other');
CREATE TYPE depth_category AS ENUM ('skin', 'skin+subcutis', 'muscle', 'mucosa');
CREATE TYPE case_status AS ENUM ('planned', 'operated', 'postop_follow', 'completed');
CREATE TYPE photo_type AS ENUM ('preop', 'postop');
CREATE TYPE specialty_type AS ENUM ('Plastik Cerrahi', 'KBB', 'Dermatoloji', 'CMF', 'Diğer');

-- Create user_profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  tc_kimlik_no TEXT NOT NULL UNIQUE,
  specialty specialty_type NOT NULL,
  institution_name TEXT NOT NULL,
  institution_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT DEFAULT 'physician',
  is_verified BOOLEAN DEFAULT false,
  institution_id_card_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_code TEXT NOT NULL,
  age INTEGER,
  sex sex_type,
  region TEXT NOT NULL,
  width_mm NUMERIC,
  height_mm NUMERIC,
  depth depth_category,
  previous_surgery BOOLEAN DEFAULT false,
  previous_radiotherapy BOOLEAN DEFAULT false,
  pathology_suspected TEXT,
  critical_structures TEXT[],
  high_aesthetic_zone BOOLEAN DEFAULT false,
  status case_status DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT cases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create case_photos table
CREATE TABLE IF NOT EXISTS case_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type photo_type NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_results table
CREATE TABLE IF NOT EXISTS ai_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  vision_summary JSONB NOT NULL,
  flap_suggestions JSONB NOT NULL,
  safety_review JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_photos_case_id ON case_photos(case_id);
CREATE INDEX IF NOT EXISTS idx_case_photos_type ON case_photos(type);
CREATE INDEX IF NOT EXISTS idx_ai_results_case_id ON ai_results(case_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tc_kimlik_no ON user_profiles(tc_kimlik_no);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_results ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Cases policies
CREATE POLICY "Users can view their own cases"
  ON cases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cases"
  ON cases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases"
  ON cases FOR UPDATE
  USING (auth.uid() = user_id);

-- Case photos policies
CREATE POLICY "Users can view photos of their own cases"
  ON case_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_photos.case_id
      AND cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for their own cases"
  ON case_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_photos.case_id
      AND cases.user_id = auth.uid()
    )
  );

-- AI results policies
CREATE POLICY "Users can view AI results of their own cases"
  ON ai_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = ai_results.case_id
      AND cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert AI results"
  ON ai_results FOR INSERT
  WITH CHECK (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('institution-cards', 'institution-cards', false),
  ('case-photos', 'case-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for institution-cards bucket
CREATE POLICY "Users can upload their own institution card"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'institution-cards' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own institution card"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'institution-cards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for case-photos bucket
CREATE POLICY "Users can upload photos for their own cases"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'case-photos'
    AND EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id::text = (storage.foldername(name))[1]
      AND cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view photos of their own cases"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'case-photos'
    AND EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id::text = (storage.foldername(name))[1]
      AND cases.user_id = auth.uid()
    )
  );

