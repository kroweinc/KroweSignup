-- Add `processing` to signup_curricula.status (parity with signup_reports).
-- Run after 001_curriculum.sql.

ALTER TABLE public.signup_curricula
  DROP CONSTRAINT IF EXISTS signup_curricula_status_check;

ALTER TABLE public.signup_curricula
  ADD CONSTRAINT signup_curricula_status_check
  CHECK (status IN ('pending', 'processing', 'ready', 'failed'));
