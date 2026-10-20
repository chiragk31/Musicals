-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('user', 'artist');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create songs table
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Create playlists table
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Create playlist_songs junction table
CREATE TABLE public.playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (playlist_id, song_id)
);

ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Create liked_songs table
CREATE TABLE public.liked_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, song_id)
);

ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;

-- Create playback_state table for session persistence
CREATE TABLE public.playback_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
  position FLOAT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.playback_state ENABLE ROW LEVEL SECURITY;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for songs
CREATE POLICY "Anyone can view songs" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload songs" ON public.songs FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can delete own songs" ON public.songs FOR DELETE USING (auth.uid() = uploaded_by);

-- RLS Policies for playlists
CREATE POLICY "Users can view own playlists" ON public.playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own playlists" ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own playlists" ON public.playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own playlists" ON public.playlists FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for playlist_songs
CREATE POLICY "Users can view songs in their playlists" ON public.playlist_songs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.playlists WHERE playlists.id = playlist_id AND playlists.user_id = auth.uid())
);
CREATE POLICY "Users can add songs to their playlists" ON public.playlist_songs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.playlists WHERE playlists.id = playlist_id AND playlists.user_id = auth.uid())
);
CREATE POLICY "Users can remove songs from their playlists" ON public.playlist_songs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.playlists WHERE playlists.id = playlist_id AND playlists.user_id = auth.uid())
);

-- RLS Policies for liked_songs
CREATE POLICY "Users can view own liked songs" ON public.liked_songs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can like songs" ON public.liked_songs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike songs" ON public.liked_songs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for playback_state
CREATE POLICY "Users can view own playback state" ON public.playback_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own playback state" ON public.playback_state FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own playback state" ON public.playback_state FOR UPDATE USING (auth.uid() = user_id);

-- Storage policies for audio files
CREATE POLICY "Anyone can view audio files" ON storage.objects FOR SELECT USING (bucket_id = 'audio-files');
CREATE POLICY "Authenticated users can upload audio files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'audio-files' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Users can delete own audio files" ON storage.objects FOR DELETE USING (
  bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for thumbnails
CREATE POLICY "Anyone can view thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');
CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'thumbnails' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Users can delete own thumbnails" ON storage.objects FOR DELETE USING (
  bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();