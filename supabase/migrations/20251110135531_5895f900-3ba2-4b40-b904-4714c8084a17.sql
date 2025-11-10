-- Create wordpress_settings table for storing WordPress API credentials
CREATE TABLE public.wordpress_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  site_url TEXT NOT NULL,
  username TEXT NOT NULL,
  application_password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_wordpress_settings UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.wordpress_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own WordPress settings" 
ON public.wordpress_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WordPress settings" 
ON public.wordpress_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WordPress settings" 
ON public.wordpress_settings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WordPress settings" 
ON public.wordpress_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_wordpress_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_wordpress_settings_updated_at
BEFORE UPDATE ON public.wordpress_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_wordpress_settings_updated_at();