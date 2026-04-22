"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { EditorialPanel } from "@/app/components/shell/EditorialPanel";
import { SignupProgressHeader } from "@/app/components/krowe/SignupProgressHeader";
import {
  SIGNUP_STEPS,
  SIGNUP_STEP_LABELS,
  getCompletedSignupSteps,
  getSignupStepNumber,
  type StepKey,
} from "@/lib/signupSteps";

type SignupStepLayoutProps = {
  progressPercent?: number;
  /** When set, shows stepped progress + section name (onboarding chrome). */
  stepKey?: StepKey;
  children: ReactNode;
};

function isSignupStepKey(k: StepKey | undefined): k is StepKey {
  return k !== undefined && SIGNUP_STEPS.includes(k);
}

/**
 * Split shell: editorial left (same family as auth) + scrollable step workspace on the right.
 */
export default function SignupStepLayout({ progressPercent = 0, stepKey, children }: SignupStepLayoutProps) {
  const showRich = isSignupStepKey(stepKey);
  const currentStep = stepKey ? getSignupStepNumber(stepKey) : 1;
  const sectionName = stepKey ? SIGNUP_STEP_LABELS[stepKey] : "Onboarding";
  const completed = stepKey ? getCompletedSignupSteps(stepKey) : [];
  const est = `~${Math.max(1, SIGNUP_STEPS.length - currentStep + 1)} min`;

  return (
    <div className="signup-shell-layout flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden font-sans md:flex-row">
      <div className="signup-editorial-left flex min-h-[32vh] max-md:max-h-[50dvh] max-md:shrink-0 max-md:overflow-y-auto flex-[1_1_42%] flex-col md:max-w-[48%] lg:flex-[0_0_44%]">
        <EditorialPanel
          title="Shape your validation journey."
          subtitle="Honest answers help us tune your interview workspace and roadmap."
        />
      </div>

      <div className="signup-step-workspace relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <a
          href="#signup-main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[var(--radius-md)] focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background"
        >
          Skip to form
        </a>

        <header className="shrink-0 border-b border-border bg-background">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Image src="/KroweLogo.png" alt="Krowe" width={160} height={48} className="h-8 w-auto shrink-0 md:h-10" priority />
            </div>
            <Link
              href="/interviews"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:bg-surface-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Exit
            </Link>
          </div>
          {showRich ? (
            <SignupProgressHeader
              currentStep={currentStep}
              totalSteps={SIGNUP_STEPS.length}
              sectionName={sectionName}
              estimatedTimeRemaining={est}
              completedSteps={completed}
            />
          ) : (
            <div className="mx-auto w-full max-w-6xl px-4 pb-4 md:px-8">
              <div
                className="h-2 w-full max-w-md overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Onboarding progress"
              >
                <div
                  className="signup-progress-fill h-full rounded-full bg-primary-soft"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </header>

        <main
          id="signup-main"
          tabIndex={-1}
          className="min-h-0 flex-1 scroll-mt-4 overflow-y-auto px-4 py-8 outline-none md:px-10 md:py-12"
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <footer className="shrink-0 border-t border-border/60 bg-background py-5">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center md:px-8">
            <div className="flex max-w-lg items-start justify-center gap-2 text-sm text-muted-foreground sm:items-center">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" aria-hidden />
              <span>Your intellectual property is private and encrypted.</span>
            </div>
            <p className="text-xs text-muted-foreground tracking-wide">© 2026 Krowe Technologies Inc.</p>
          </div>
        </footer>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .signup-shell-layout { flex-direction: column !important; }
          .signup-editorial-left { flex: 0 0 auto !important; max-width: none !important; min-height: 32vh; }
          .signup-step-workspace { flex: 1 1 0% !important; min-height: 0 !important; }
        }
      `}</style>
    </div>
  );
}
