-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX ALL UPLOAD ERRORS

-- 1. Ensure Profiles Table Exists and is Public
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  phone TEXT,
  location_district TEXT,
  language_preference TEXT DEFAULT 'en',
  is_verified BOOLEAN DEFAULT false,
  stats JSONB DEFAULT '{"questions":0, "answers":0, "listings":0, "trust_score":0}',
  username_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Fix 'questions' table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  crop TEXT,
  image_url TEXT,
  is_solved BOOLEAN DEFAULT false,
  -- Ensure profile_id exists
  profile_id UUID REFERENCES public.profiles(id)
);

-- Safe column add if table exists but column is missing or named wrong
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='profile_id') THEN
        ALTER TABLE public.questions ADD COLUMN profile_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- 3. Fix 'listings' table (Market)
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  price_unit TEXT,
  location_text TEXT,
  type TEXT, -- 'buy', 'sell', 'rent'
  status TEXT DEFAULT 'active',
  image_url TEXT,
  profile_id UUID REFERENCES public.profiles(id)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='profile_id') THEN
        ALTER TABLE public.listings ADD COLUMN profile_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- 4. Fix 'stories' table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT, -- Caption
  src TEXT, -- Video URL
  image_url TEXT, -- Thumbnail
  -- role is NOT stored here, it comes from profile
  profile_id UUID REFERENCES public.profiles(id)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stories' AND column_name='profile_id') THEN
        ALTER TABLE public.stories ADD COLUMN profile_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- 5. Fix 'news' table
CREATE TABLE IF NOT EXISTS public.news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  image_url TEXT,
  profile_id UUID REFERENCES public.profiles(id)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='profile_id') THEN
        ALTER TABLE public.news ADD COLUMN profile_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- 6. Enable RLS (Security) - Optional but recommended
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- 7. Grant access (Drop first to avoid "already exists" errors)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;
DROP POLICY IF EXISTS "Authenticated users can upload questions" ON public.questions;

CREATE POLICY "Questions are viewable by everyone" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload questions" ON public.questions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
DROP POLICY IF EXISTS "Authenticated users can upload listings" ON public.listings;

CREATE POLICY "Listings are viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload listings" ON public.listings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Stories are viewable by everyone" ON public.stories;
DROP POLICY IF EXISTS "Authenticated users can upload stories" ON public.stories;

CREATE POLICY "Stories are viewable by everyone" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload stories" ON public.stories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "News is viewable by everyone" ON public.news;
DROP POLICY IF EXISTS "Authenticated users can upload news" ON public.news;

CREATE POLICY "News is viewable by everyone" ON public.news FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload news" ON public.news FOR INSERT WITH CHECK (auth.role() = 'authenticated');
