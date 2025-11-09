-- Create content_history table for storing generated content
CREATE TABLE public.content_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  thumbnail_image TEXT,
  content_length TEXT NOT NULL,
  content_tone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own content history" 
ON public.content_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content history" 
ON public.content_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content history" 
ON public.content_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to limit content history to 30 items per user
CREATE OR REPLACE FUNCTION public.limit_content_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete oldest entries if user has more than 30
  DELETE FROM public.content_history
  WHERE id IN (
    SELECT id FROM public.content_history
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    OFFSET 30
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to maintain 30 item limit
CREATE TRIGGER limit_content_history_trigger
AFTER INSERT ON public.content_history
FOR EACH ROW
EXECUTE FUNCTION public.limit_content_history();

-- Create index for better query performance
CREATE INDEX idx_content_history_user_created ON public.content_history(user_id, created_at DESC);