-- Migration 002: Add saved_hooks table and leaderboard columns
-- Run this in Supabase SQL Editor

-- ============================================
-- ENSURE PROFILES HAS REQUIRED COLUMNS
-- ============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_viral_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- ============================================
-- DROP AND RECREATE SAVED_HOOKS TABLE
-- ============================================
DROP TABLE IF EXISTS public.saved_hooks CASCADE;

CREATE TABLE public.saved_hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hook_text TEXT NOT NULL,
  hook_type TEXT DEFAULT 'other' CHECK (hook_type IN ('question', 'statement', 'story', 'shock', 'challenge', 'other')),
  effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saved_hooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own hooks" ON public.saved_hooks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own hooks" ON public.saved_hooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hooks" ON public.saved_hooks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hooks" ON public.saved_hooks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES (after table is confirmed created)
-- ============================================
CREATE INDEX idx_saved_hooks_user_id ON public.saved_hooks(user_id);
CREATE INDEX idx_saved_hooks_created_at ON public.saved_hooks(created_at DESC);
CREATE INDEX idx_saved_hooks_type ON public.saved_hooks(hook_type);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON public.profiles(streak_days DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_viral ON public.profiles(total_viral_count DESC);

-- ============================================
-- XP AND LEVELING FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_level(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, (xp_amount / 100) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.award_xp(user_uuid UUID, xp_amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    xp = COALESCE(xp, 0) + xp_amount,
    level = public.calculate_level(COALESCE(xp, 0) + xp_amount),
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_viral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.overall_score >= 80 THEN
    UPDATE public.profiles
    SET
      total_viral_count = COALESCE(total_viral_count, 0) + 1,
      updated_at = NOW()
    WHERE id = NEW.user_id;
    PERFORM public.award_xp(NEW.user_id, 25);
  END IF;
  PERFORM public.award_xp(NEW.user_id, 10);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_analysis_viral ON public.analyses;
CREATE TRIGGER on_analysis_viral
  AFTER INSERT ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_viral_count();

-- ============================================
-- UPDATE EXISTING PROFILES WITH DEFAULT VALUES
-- ============================================
UPDATE public.profiles
SET
  xp = COALESCE(analyses_count, 0) * 10,
  level = public.calculate_level(COALESCE(analyses_count, 0) * 10),
  streak_days = 0,
  total_viral_count = 0,
  badges = '{}'
WHERE xp IS NULL;
