-- Add flap feedback table for user feedback and regeneration requests
CREATE TABLE IF NOT EXISTS flap_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  flap_suggestion_id TEXT NOT NULL, -- ID from AI result JSON
  user_rating TEXT NOT NULL CHECK (user_rating IN ('yetersiz', 'orta', 'iyi', 'mükemmel')),
  user_comments TEXT,
  specific_issues TEXT[], -- Array of specific issues mentioned by user
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_flap_feedback_case_id ON flap_feedback(case_id);
CREATE INDEX IF NOT EXISTS idx_flap_feedback_suggestion_id ON flap_feedback(flap_suggestion_id);
CREATE INDEX IF NOT EXISTS idx_flap_feedback_created_at ON flap_feedback(created_at DESC);

-- Add regeneration fields to ai_results table
ALTER TABLE ai_results
ADD COLUMN IF NOT EXISTS needs_regeneration BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS regeneration_reason TEXT;

-- Add index for regeneration queries
CREATE INDEX IF NOT EXISTS idx_ai_results_needs_regeneration ON ai_results(needs_regeneration) WHERE needs_regeneration = TRUE;

-- Add comment
COMMENT ON TABLE flap_feedback IS 'User feedback for flap suggestions, used for improving AI drawings and triggering regeneration';

