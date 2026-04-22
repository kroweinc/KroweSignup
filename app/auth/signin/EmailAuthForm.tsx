"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { KroweButton } from "@/app/components/krowe/KroweButton";
import { KroweInput } from "@/app/components/krowe/KroweInput";

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export default function EmailAuthForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function clearErrors() {
    setApiError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
  }

  async function getPostLoginDestination(next?: string) {
    const qp = next?.startsWith("/") ? `?next=${encodeURIComponent(next)}` : "";
    const res = await fetch(`/api/auth/post-login-destination${qp}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to resolve post-login destination");
    const json = await res.json();
    if (!json?.destination || typeof json.destination !== "string") {
      throw new Error("Invalid post-login destination response");
    }
    return json.destination;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();
    setMessage(null);

    if (!email || !password) {
      if (!email) setEmailError("Required");
      if (!password) setPasswordError("Required");
      return;
    }
    if (password.length < 8) {
      setPasswordError("At least 8 characters");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setLoading(false);
        setApiError(signInError.message);
      } else {
        try {
          const destination = await getPostLoginDestination(redirectTo);
          setLoading(false);
          router.push(destination);
        } catch (destinationError: unknown) {
          setLoading(false);
          setApiError(getErrorMessage(destinationError, "Unable to determine where to send you."));
        }
      }
    } else {
      const origin = window.location.origin;
      const callbackUrl = `${origin}/api/auth/callback`;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callbackUrl },
      });
      setLoading(false);
      if (signUpError) {
        setApiError(signUpError.message);
      } else if (signUpData.session) {
        try {
          const destination = await getPostLoginDestination(redirectTo);
          router.push(destination);
        } catch (destinationError: unknown) {
          setApiError(getErrorMessage(destinationError, "Unable to determine where to send you."));
        }
      } else {
        setMessage("Check your email to confirm your account.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <KroweInput
        type="email"
        name="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError(null);
          setApiError(null);
        }}
        icon={<Mail size={18} aria-hidden />}
        state={emailError ? "error" : "default"}
        helperText={emailError ?? undefined}
        required
      />

      <div className={mode === "signup" ? "" : "mb-1"}>
        <KroweInput
          type="password"
          name="password"
          label="Password"
          placeholder="••••••••"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(null);
            setApiError(null);
          }}
          state={passwordError || apiError ? "error" : "default"}
          helperText={passwordError ?? undefined}
          required
        />
      </div>

      {mode === "signup" ? (
        <KroweInput
          type="password"
          name="confirmPassword"
          label="Confirm password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setConfirmError(null);
            setApiError(null);
          }}
          state={confirmError ? "error" : "default"}
          helperText={confirmError ?? undefined}
          required
        />
      ) : null}

      {apiError ? (
        <p className="rounded-[var(--radius-md)] border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
          {apiError}
        </p>
      ) : null}

      {message ? <p className="text-sm text-success">{message}</p> : null}

      <KroweButton
        type="submit"
        variant="primary"
        loading={loading}
        className="w-full justify-center"
        style={{ width: "100%", borderRadius: "var(--radius-md)" }}
      >
        {mode === "signin" ? "Sign in" : "Create account"}
      </KroweButton>

      <p className="mt-2 text-center text-sm text-muted-foreground">
        {mode === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:text-[color:var(--primary-hover)]"
              onClick={() => {
                setMode("signup");
                clearErrors();
                setMessage(null);
              }}
            >
              Start validating
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:text-[color:var(--primary-hover)]"
              onClick={() => {
                setMode("signin");
                clearErrors();
                setMessage(null);
              }}
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </form>
  );
}
