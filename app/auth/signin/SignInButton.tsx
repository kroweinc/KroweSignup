"use client";

import { useCallback, useRef, type MouseEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";

function resolveCallbackOrigin() {
  const envOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN?.trim();

  if (process.env.NODE_ENV !== "production" && envOrigin) {
    try {
      const parsed = new URL(envOrigin);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.origin;
      }
    } catch {
      // Fall back to the browser origin when env origin is malformed.
    }
  }

  return window.location.origin;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function SignInButton({ redirectTo }: { redirectTo?: string }) {
  const shimmerRef = useRef<HTMLSpanElement>(null);

  const runShimmer = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const el = shimmerRef.current;
    if (!el) return;
    el.classList.remove("auth-google-shimmer-animate");
    void el.offsetWidth;
    el.classList.add("auth-google-shimmer-animate");
    e.currentTarget.addEventListener(
      "mouseleave",
      () => {
        el.classList.remove("auth-google-shimmer-animate");
      },
      { once: true }
    );
  }, []);

  async function handleGoogleSignIn() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const callbackOrigin = resolveCallbackOrigin();
    const callbackUrl = redirectTo
      ? `${callbackOrigin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`
      : `${callbackOrigin}/api/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      onMouseEnter={runShimmer}
      className="relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-[var(--radius-md)] border border-border bg-background py-3.5 pl-6 pr-6 font-sans text-base font-semibold text-foreground transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:border-primary hover:shadow-[var(--shadow-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span
        ref={shimmerRef}
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[rgba(249,115,22,0.07)] to-transparent"
        aria-hidden
      />
      <span className="relative flex items-center gap-3">
        <GoogleIcon />
        Continue with Google
      </span>
    </button>
  );
}
