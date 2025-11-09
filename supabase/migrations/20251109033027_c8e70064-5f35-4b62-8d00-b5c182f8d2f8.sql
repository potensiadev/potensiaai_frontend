-- Create table for SEO titles history from keyword research
CREATE TABLE public.seo_titles_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  seo_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.seo_titles_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own SEO titles history" 
ON public.seo_titles_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SEO titles history" 
ON public.seo_titles_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SEO titles history" 
ON public.seo_titles_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_seo_titles_history_user_id ON public.seo_titles_history(user_id);
CREATE INDEX idx_seo_titles_history_created_at ON public.seo_titles_history(created_at DESC);