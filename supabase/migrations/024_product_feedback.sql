CREATE TABLE IF NOT EXISTS public.product_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  message text NOT NULL,
  category text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  page_path text NOT NULL,
  project_id uuid NULL,
  submitter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submitter_name_snapshot text NULL,
  submitter_email_snapshot text NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS product_feedback_submitter_created_idx
  ON public.product_feedback(submitter_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS product_feedback_project_created_idx
  ON public.product_feedback(project_id, created_at DESC);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'interview_projects'
      AND c.relkind = 'r'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'product_feedback_project_id_fkey'
    ) THEN
      ALTER TABLE public.product_feedback
        ADD CONSTRAINT product_feedback_project_id_fkey
        FOREIGN KEY (project_id)
        REFERENCES public.interview_projects(id)
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

ALTER TABLE public.product_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own product feedback" ON public.product_feedback;
CREATE POLICY "Users see own product feedback"
  ON public.product_feedback
  FOR SELECT
  USING (auth.uid() = submitter_user_id);

DROP POLICY IF EXISTS "Users insert own product feedback" ON public.product_feedback;
CREATE POLICY "Users insert own product feedback"
  ON public.product_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = submitter_user_id);
