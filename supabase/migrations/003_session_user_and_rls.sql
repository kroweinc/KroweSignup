-- Plan C: link signup sessions to auth.users + session_link_tokens + authenticated SELECT policies.
-- Run after 001 and 002. Requires service role for mint/link APIs (session_link_tokens has no anon policies).

-- -----------------------------------------------------------------------------
-- signup_sessions.user_id
-- -----------------------------------------------------------------------------

ALTER TABLE public.signup_sessions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS signup_sessions_user_id_idx ON public.signup_sessions (user_id);

COMMENT ON COLUMN public.signup_sessions.user_id IS 'Set when the founder links this session to a Supabase Auth user (platform).';

-- -----------------------------------------------------------------------------
-- session_link_tokens (minted by signup app, consumed on platform after login)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.session_link_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.signup_sessions (id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS session_link_tokens_token_idx ON public.session_link_tokens (token);
CREATE INDEX IF NOT EXISTS session_link_tokens_session_id_idx ON public.session_link_tokens (session_id);

COMMENT ON TABLE public.session_link_tokens IS 'One-time tokens to attach a guest signup session to an authenticated user. Use service role only.';

ALTER TABLE public.session_link_tokens ENABLE ROW LEVEL SECURITY;
-- No policies: anon/authenticated denied; service role bypasses RLS.

-- -----------------------------------------------------------------------------
-- signup_reports RLS (if table exists without RLS, enable + dual policies)
-- -----------------------------------------------------------------------------

ALTER TABLE public.signup_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "signup_reports_allow_anon" ON public.signup_reports;
CREATE POLICY "signup_reports_allow_anon"
  ON public.signup_reports
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "signup_reports_select_authenticated_own" ON public.signup_reports;
CREATE POLICY "signup_reports_select_authenticated_own"
  ON public.signup_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.signup_sessions s
      WHERE s.id = signup_reports.session_id
        AND s.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- signup_curricula / signup_roadmap_progress: add authenticated SELECT; keep anon ALL
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "signup_curricula_select_authenticated_own" ON public.signup_curricula;
CREATE POLICY "signup_curricula_select_authenticated_own"
  ON public.signup_curricula
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.signup_sessions s
      WHERE s.id = signup_curricula.session_id
        AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "signup_roadmap_progress_select_authenticated_own" ON public.signup_roadmap_progress;
CREATE POLICY "signup_roadmap_progress_select_authenticated_own"
  ON public.signup_roadmap_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.signup_sessions s
      WHERE s.id = signup_roadmap_progress.session_id
        AND s.user_id = auth.uid()
    )
  );

-- signup_sessions: authenticated users can read their linked rows
ALTER TABLE public.signup_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "signup_sessions_allow_anon" ON public.signup_sessions;
CREATE POLICY "signup_sessions_allow_anon"
  ON public.signup_sessions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "signup_sessions_select_authenticated_own" ON public.signup_sessions;
CREATE POLICY "signup_sessions_select_authenticated_own"
  ON public.signup_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "signup_sessions_update_link_user" ON public.signup_sessions;
CREATE POLICY "signup_sessions_update_link_user"
  ON public.signup_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id IS NULL)
  WITH CHECK (user_id = auth.uid());
