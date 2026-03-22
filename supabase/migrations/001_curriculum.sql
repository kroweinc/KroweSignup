-- Plan A: curriculum + roadmap progress tables
-- Run this in the Supabase SQL Editor (or via supabase db push if you use the CLI).
-- Requires existing public.signup_sessions(id uuid).

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.signup_curricula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.signup_sessions (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'failed')),
  curriculum_version text NOT NULL,
  payload jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT signup_curricula_session_id_unique UNIQUE (session_id)
);

CREATE TABLE IF NOT EXISTS public.signup_roadmap_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.signup_sessions (id) ON DELETE CASCADE,
  unlocked_stage_max integer NOT NULL DEFAULT 1 CHECK (
    unlocked_stage_max >= 1
    AND unlocked_stage_max <= 6
  ),
  completed_task_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT signup_roadmap_progress_session_id_unique UNIQUE (session_id)
);

CREATE INDEX IF NOT EXISTS signup_curricula_session_id_idx ON public.signup_curricula (session_id);
CREATE INDEX IF NOT EXISTS signup_roadmap_progress_session_id_idx ON public.signup_roadmap_progress (session_id);

COMMENT ON TABLE public.signup_curricula IS 'Generated curriculum JSON per signup session; one row per session.';
COMMENT ON TABLE public.signup_roadmap_progress IS 'Roadmap unlock/completion state; join key is session_id until user_id is added.';

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.signup_curriculum_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS signup_curricula_set_updated_at ON public.signup_curricula;
CREATE TRIGGER signup_curricula_set_updated_at
  BEFORE UPDATE ON public.signup_curricula
  FOR EACH ROW
  EXECUTE FUNCTION public.signup_curriculum_touch_updated_at();

DROP TRIGGER IF EXISTS signup_roadmap_progress_set_updated_at ON public.signup_roadmap_progress;
CREATE TRIGGER signup_roadmap_progress_set_updated_at
  BEFORE UPDATE ON public.signup_roadmap_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.signup_curriculum_touch_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
-- The signup app server currently uses the Supabase anon key (see lib/supabaseServer.ts).
-- Service role bypasses RLS entirely; anon does not, so we add permissive policies
-- so API routes can read/write these tables. Replace with auth.uid()-scoped or
-- service-role-only writes before production.

ALTER TABLE public.signup_curricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signup_roadmap_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "signup_curricula_allow_all" ON public.signup_curricula;
CREATE POLICY "signup_curricula_allow_all"
  ON public.signup_curricula
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "signup_roadmap_progress_allow_all" ON public.signup_roadmap_progress;
CREATE POLICY "signup_roadmap_progress_allow_all"
  ON public.signup_roadmap_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);
