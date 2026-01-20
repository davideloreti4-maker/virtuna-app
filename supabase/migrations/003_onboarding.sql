-- Migration 003: Add onboarding tracking to profiles
-- Run this in Supabase SQL Editor

-- ============================================
-- ADD ONBOARDING COLUMN TO PROFILES
-- ============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_seen_onboarding BOOLEAN DEFAULT FALSE;

-- ============================================
-- UPDATE EXISTING USERS
-- Users with analyses have implicitly completed onboarding
-- ============================================
UPDATE public.profiles
SET has_seen_onboarding = TRUE
WHERE analyses_count > 0;
