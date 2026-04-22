"use client";

import { motion, useReducedMotion } from "motion/react";
import { EditorialPanel } from "@/app/components/shell/EditorialPanel";
import SignInButton from "./SignInButton";
import EmailAuthForm from "./EmailAuthForm";

const STAGGER = 0.065;
const EASE = [0.16, 1, 0.3, 1] as const;

type AuthSignInClientProps = {
  redirectTo?: string;
  oauthError?: string;
};

export function AuthSignInClient({ redirectTo, oauthError }: AuthSignInClientProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="auth-layout flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden font-sans md:flex-row">
      <div className="auth-left flex min-h-[38vh] max-md:max-h-[50dvh] max-md:shrink-0 max-md:overflow-y-auto flex-[1_1_50%] flex-col md:max-w-[52%] lg:flex-[0_0_50%]">
        <EditorialPanel title="Welcome back." subtitle={"Let's see where your ideas stand."} />
      </div>

      <div className="auth-right flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain bg-background px-[clamp(1.25rem,5vw,3rem)] py-10 md:flex-[1_1_50%] md:px-[clamp(3rem,6vw,6rem)] md:py-[clamp(3rem,6vw,6rem)]">
        <div className="mx-auto flex min-h-full w-full max-w-[380px] flex-col justify-center py-2 md:py-0">
          {oauthError ? (
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-[var(--radius-md)] border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
              role="alert"
            >
              Sign-in failed. Please try again.
            </motion.div>
          ) : null}

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0, duration: 0.28, ease: EASE }}
          >
            <SignInButton redirectTo={redirectTo} />
          </motion.div>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : STAGGER, duration: 0.28, ease: EASE }}
            className="my-5 flex items-center gap-4"
          >
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </motion.div>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : STAGGER * 2, duration: 0.28, ease: EASE }}
          >
            <EmailAuthForm redirectTo={redirectTo} />
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .auth-layout { flex-direction: column !important; }
          .auth-left { flex: 0 0 auto !important; min-height: 40vh; max-width: none !important; }
          .auth-right { flex: 1 1 0% !important; min-height: 0 !important; }
        }
      `}</style>
    </div>
  );
}
