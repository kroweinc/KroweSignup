"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ChevronRightIcon, LogOutIcon } from "lucide-react";
import { EmberGlyph } from "@/app/components/krowe/EmberGlyph";

type AppHeaderProps = {
  backHref?: string;
  backLabel?: string;
};

export default function AppHeader({ backHref, backLabel }: AppHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/auth/signin");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 shadow-[var(--shadow-1)] backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        {/* Logo + breadcrumb */}
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/interviews"
            className="group relative flex items-center gap-2.5 rounded-[11px] border border-transparent px-2 py-1.5 transition-all duration-[var(--duration-fast)] hover:border-border/60 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <span className="relative isolate flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-border/80 bg-card shadow-[var(--shadow-1)]">
              <Image
                src="/KroweIcon.png"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 rounded-[5px] object-contain"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute -bottom-0.5 -right-0.5 rounded-full bg-background p-[2px] ring-[1.5px] ring-background"
                aria-hidden
              >
                <EmberGlyph size={8} />
              </span>
            </span>
            <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">
              Krowe
            </span>
          </Link>

          {backHref && (
            <>
              <ChevronRightIcon
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
                aria-hidden
              />
              <Link
                href={backHref}
                className="truncate text-sm font-medium text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              >
                {backLabel ?? "Back"}
              </Link>
            </>
          )}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-[var(--shadow-1)] transition-all duration-[var(--duration-fast)] hover:border-danger/30 hover:bg-danger-soft/40 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
        >
          <LogOutIcon size={13} aria-hidden />
          Log out
        </button>
      </div>
    </header>
  );
}
