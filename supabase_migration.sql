-- Add new columns to content_history table
-- Run this in Supabase SQL Editor

ALTER TABLE content_history
ADD COLUMN IF NOT EXISTS focus_keyphrase TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN content_history.focus_keyphrase IS 'SEO focus keyphrase for the content';
COMMENT ON COLUMN content_history.slug IS 'URL slug for the content';
COMMENT ON COLUMN content_history.meta_description IS 'Meta description for SEO';
COMMENT ON COLUMN content_history.tags IS 'Array of tags/keywords';
