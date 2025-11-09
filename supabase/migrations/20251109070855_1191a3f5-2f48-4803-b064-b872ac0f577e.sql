-- Add UPDATE policy for content_history table
CREATE POLICY "Users can update their own content history"
ON public.content_history
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);