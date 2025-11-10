-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add wordpress_post_id and publish_status to content_history
ALTER TABLE public.content_history
ADD COLUMN IF NOT EXISTS wordpress_post_id text,
ADD COLUMN IF NOT EXISTS publish_status text DEFAULT 'pending' CHECK (publish_status IN ('pending', 'published'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_content_history_user_status 
ON public.content_history(user_id, publish_status);