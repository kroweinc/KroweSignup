ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS current_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS alternatives_used JSONB NOT NULL DEFAULT '[]'::jsonb;
