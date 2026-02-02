-- RUN THIS IN SUPABASE SQL EDITOR TO FIX UPLOAD ERRORS

-- 1. Create Buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('news', 'news', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('questions', 'questions', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true) ON CONFLICT (id) DO NOTHING;

-- 2. Enable Public Access Policies (Drop first to avoid duplicates)

-- AVATARS
DROP POLICY IF EXISTS "Public Avatars View" ON storage.objects;
DROP POLICY IF EXISTS "Public Avatars Upload" ON storage.objects;
CREATE POLICY "Public Avatars View" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public Avatars Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- NEWS
DROP POLICY IF EXISTS "Public News View" ON storage.objects;
DROP POLICY IF EXISTS "Public News Upload" ON storage.objects;
CREATE POLICY "Public News View" ON storage.objects FOR SELECT USING (bucket_id = 'news');
CREATE POLICY "Public News Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'news');

-- STORIES
DROP POLICY IF EXISTS "Public Stories View" ON storage.objects;
DROP POLICY IF EXISTS "Public Stories Upload" ON storage.objects;
CREATE POLICY "Public Stories View" ON storage.objects FOR SELECT USING (bucket_id = 'stories');
CREATE POLICY "Public Stories Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'stories');

-- QUESTIONS
DROP POLICY IF EXISTS "Public Questions View" ON storage.objects;
DROP POLICY IF EXISTS "Public Questions Upload" ON storage.objects;
CREATE POLICY "Public Questions View" ON storage.objects FOR SELECT USING (bucket_id = 'questions');
CREATE POLICY "Public Questions Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'questions');

-- LISTINGS
DROP POLICY IF EXISTS "Public Listings View" ON storage.objects;
DROP POLICY IF EXISTS "Public Listings Upload" ON storage.objects;
CREATE POLICY "Public Listings View" ON storage.objects FOR SELECT USING (bucket_id = 'listings');
CREATE POLICY "Public Listings Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listings');
