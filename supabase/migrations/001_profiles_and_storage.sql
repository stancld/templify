-- =====================================================
-- Templify Database Migration: Profiles & Storage
-- =====================================================
-- This migration adds:
-- 1. Profiles table with auto-creation trigger
-- 2. Storage buckets for avatars and docx files
-- 3. docx_path column to templates table
-- 4. RLS policies for all tables and storage
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for re-running migration)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =====================================================
-- 2. TEMPLATES TABLE UPDATE
-- =====================================================

-- Add docx_path column for Storage-based templates
ALTER TABLE templates ADD COLUMN IF NOT EXISTS docx_path TEXT;


-- =====================================================
-- 3. STORAGE BUCKETS
-- =====================================================

-- Create avatars bucket (public for viewing)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create templates-docx bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('templates-docx', 'templates-docx', false)
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- 4. STORAGE RLS POLICIES
-- =====================================================

-- Avatars bucket policies
-- Users can upload/update their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');


-- Templates docx bucket policies
-- Users can manage their own template files
CREATE POLICY "Users can upload own templates"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'templates-docx' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own templates"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'templates-docx' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own templates"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'templates-docx' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own templates"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'templates-docx' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );


-- =====================================================
-- 5. TABLE RLS POLICIES (verify/create)
-- =====================================================
-- Note: These policies may already exist from a previous migration.
-- We drop them first to ensure idempotent migration.

-- Enable RLS on all tables
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_rows ENABLE ROW LEVEL SECURITY;

-- Templates policies (drop if exists, then create)
DROP POLICY IF EXISTS "Users can view own templates" ON templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON templates;
DROP POLICY IF EXISTS "Users can update own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON templates;

CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  USING (auth.uid() = user_id);


-- Data sessions policies (drop if exists, then create)
DROP POLICY IF EXISTS "Users can view own sessions" ON data_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON data_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON data_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON data_sessions;

CREATE POLICY "Users can view own sessions"
  ON data_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON data_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON data_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON data_sessions FOR DELETE
  USING (auth.uid() = user_id);


-- Data rows policies (drop if exists, then create)
DROP POLICY IF EXISTS "Users can view own rows" ON data_rows;
DROP POLICY IF EXISTS "Users can insert own rows" ON data_rows;
DROP POLICY IF EXISTS "Users can update own rows" ON data_rows;
DROP POLICY IF EXISTS "Users can delete own rows" ON data_rows;

CREATE POLICY "Users can view own rows"
  ON data_rows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rows"
  ON data_rows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rows"
  ON data_rows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rows"
  ON data_rows FOR DELETE
  USING (auth.uid() = user_id);


-- =====================================================
-- 6. SUPABASE DASHBOARD CONFIGURATION
-- =====================================================
-- IMPORTANT: You must also configure the following in the Supabase dashboard:
--
-- 1. Authentication > URL Configuration > Redirect URLs:
--    Add: https://your-domain.vercel.app/reset-password
--
-- 2. Authentication > Email Templates > Reset Password:
--    Update the link to point to your reset password page
--
-- =====================================================
