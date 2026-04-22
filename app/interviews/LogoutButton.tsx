"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LogOutIcon } from "lucide-react";

type Props = {
  /** `pill` = old top-bar style; `row` = sidebar account list (default for new layout). */
  variant?: "pill" | "row";
  className?: string;
};

export default function LogoutButton({ variant = "row", className = "" }: Props) {
  const router = useRouter();

  async function logout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/auth/signin");
  }

  const pillStyles =
    "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-[var(--shadow-1)] transition-all duration-[var(--duration-fast)] hover:border-primary/35 hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35";

  const rowStyles =
    "flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-sm font-medium text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:bg-danger-soft/55 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30";

  return (
    <button type="button" onClick={() => void logout()} className={`${variant === "pill" ? pillStyles : rowStyles} ${className}`}>
      <LogOutIcon size={variant === "pill" ? 14 : 18} className="shrink-0 opacity-80" aria-hidden />
      Log out
    </button>
  );
}
