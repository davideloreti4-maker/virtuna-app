-- Migration: Add saved_scripts table for My Scripts history
-- Date: 2026-01-20

-- Create saved_scripts table
CREATE TABLE IF NOT EXISTS public.saved_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Script metadata
  title TEXT NOT NULL,
  niche TEXT NOT NULL,
  topic TEXT NOT NULL,
  style TEXT NOT NULL CHECK (style IN ('educational', 'entertaining', 'promotional', 'storytelling', 'tutorial')),
  duration TEXT NOT NULL CHECK (duration IN ('short', 'medium', 'long')),
  tone TEXT NOT NULL CHECK (tone IN ('casual', 'professional', 'humorous', 'inspirational')),

  -- Generated script content
  hook TEXT NOT NULL,
  body JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of body sections
  call_to_action TEXT NOT NULL,
  estimated_duration INTEGER NOT NULL,
  suggested_hashtags JSONB DEFAULT '[]'::jsonb,
  suggested_sounds JSONB DEFAULT '[]'::jsonb,
  tips_for_delivery JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user queries
CREATE INDEX IF NOT EXISTS idx_saved_scripts_user_id ON public.saved_scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_scripts_created_at ON public.saved_scripts(created_at DESC);

-- Enable RLS
ALTER TABLE public.saved_scripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own scripts
CREATE POLICY "Users can view own scripts"
  ON public.saved_scripts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own scripts
CREATE POLICY "Users can insert own scripts"
  ON public.saved_scripts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own scripts
CREATE POLICY "Users can update own scripts"
  ON public.saved_scripts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own scripts
CREATE POLICY "Users can delete own scripts"
  ON public.saved_scripts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_saved_scripts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_saved_scripts_updated_at
  BEFORE UPDATE ON public.saved_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_scripts_updated_at();
