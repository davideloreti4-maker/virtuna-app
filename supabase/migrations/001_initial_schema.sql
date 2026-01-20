-- Virtuna Database Schema
-- Run this in Supabase SQL Editor if tables don't exist

-- ============================================
-- PROFILES TABLE
-- Extends auth.users with app-specific data
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  analyses_count INTEGER DEFAULT 0,
  analyses_limit INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- ANALYSES TABLE
-- Stores video analysis results
-- ============================================
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  hook_score INTEGER CHECK (hook_score >= 0 AND hook_score <= 100),
  trend_score INTEGER CHECK (trend_score >= 0 AND trend_score <= 100),
  audio_score INTEGER CHECK (audio_score >= 0 AND audio_score <= 100),
  timing_score INTEGER CHECK (timing_score >= 0 AND timing_score <= 100),
  hashtag_score INTEGER CHECK (hashtag_score >= 0 AND hashtag_score <= 100),
  metadata JSONB DEFAULT '{}',
  suggestions JSONB DEFAULT '[]',
  processing_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view own analyses" ON public.analyses;
CREATE POLICY "Users can view own analyses" ON public.analyses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own analyses" ON public.analyses;
CREATE POLICY "Users can create own analyses" ON public.analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own analyses" ON public.analyses;
CREATE POLICY "Users can delete own analyses" ON public.analyses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_overall_score ON public.analyses(overall_score DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment analyses_count after insert
CREATE OR REPLACE FUNCTION public.increment_analyses_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET analyses_count = analyses_count + 1,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for incrementing count
DROP TRIGGER IF EXISTS on_analysis_created ON public.analyses;
CREATE TRIGGER on_analysis_created
  AFTER INSERT ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.increment_analyses_count();

-- Decrement analyses_count after delete
CREATE OR REPLACE FUNCTION public.decrement_analyses_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET analyses_count = GREATEST(0, analyses_count - 1),
      updated_at = NOW()
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for decrementing count
DROP TRIGGER IF EXISTS on_analysis_deleted ON public.analyses;
CREATE TRIGGER on_analysis_deleted
  AFTER DELETE ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.decrement_analyses_count();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamp
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
