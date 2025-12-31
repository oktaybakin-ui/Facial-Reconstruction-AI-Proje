-- Migration: Add 3D Face Model fields to ai_results table
-- Created: 2024
-- Description: Adds support for 3D face reconstruction feature

-- Create enum type for 3D status
CREATE TYPE face_3d_status_type AS ENUM ('pending', 'completed', 'failed');

-- Create enum type for 3D confidence
CREATE TYPE face_3d_confidence_type AS ENUM ('düşük', 'orta', 'yüksek');

-- Add new columns to ai_results table
ALTER TABLE ai_results
  ADD COLUMN IF NOT EXISTS enable_3d BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS face_images_3d TEXT[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS face_3d_status face_3d_status_type DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS face_3d_confidence face_3d_confidence_type DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS face_3d_model_url TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN ai_results.enable_3d IS 'Whether 3D face reconstruction was enabled for this analysis';
COMMENT ON COLUMN ai_results.face_images_3d IS 'Array of URLs/paths to 9 face images from different angles used for 3D reconstruction';
COMMENT ON COLUMN ai_results.face_3d_status IS 'Status of 3D model generation: pending, completed, or failed';
COMMENT ON COLUMN ai_results.face_3d_confidence IS 'Confidence/quality level of the generated 3D model: düşük, orta, yüksek';
COMMENT ON COLUMN ai_results.face_3d_model_url IS 'URL to the generated 3D model file (e.g., .glb, .obj)';

-- Create index for 3D enabled analyses (for filtering)
CREATE INDEX IF NOT EXISTS idx_ai_results_enable_3d ON ai_results(enable_3d) WHERE enable_3d = true;

