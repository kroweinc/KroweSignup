"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CreditCardIcon, KeyRoundIcon, ShieldIcon, SparklesIcon, UserRoundIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ContentHeader } from "@/app/components/krowe/ContentHeader";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import { KroweButton } from "@/app/components/krowe/KroweButton";
import LogoutButton from "../LogoutButton";
import { KROWE_EASE } from "@/lib/motion/kroweEase";
import { InterviewsPageWidth } from "@/app/interviews/_components/InterviewsPageWidth";

const TABS = ["profile", "security", "billing"] as const;

export type AccountTab = (typeof TABS)[number];

const TAB_META: Record<
  AccountTab,
  { plate: string; title: string; blurb: string; icon: typeof UserRoundIcon }
> = {
  profile: {
    plate: "01",
    title: "Identity",
    blurb: "How Krowe greets you across workspaces and exports.",
    icon: UserRoundIcon,
  },
  security: {
    plate: "02",
    title: "Guardrails",
    blurb: "Passwords, sessions, and the front door to your research vault.",
    icon: ShieldIcon,
  },
  billing: {
    plate: "03",
    title: "Ledger",
    blurb: "Plans, invoices, and the commercial spine when you turn the dial.",
    icon: CreditCardIcon,
  },
};

const HERO_HEADLINE = "Identity, guardrails, and ledger—each with its own surface.";
const HERO_SUBCOPY =
  "Three plates so nothing important hides in a generic settings pile. Jump into the active plate or wire integrations from here.";

type Props = {
  activeTab: AccountTab;
  fullName: string;
  email: string;
  headerActions: ReactNode;
};

function tabSummaryLabel(tab: AccountTab): string {
  if (tab === "profile") return "Identity & display";
  if (tab === "security") return "Sessions & credentials";
  return "Plans & commercial";
}

export function AccountPageClient({ activeTab, fullName, email, headerActions }: Props) {
  const reduceMotion = useReducedMotion();
  const words = HERO_HEADLINE.split(" ");
  const headlineWordCount = words.length;
  const clipStart = 0.1;
  const perWordDelay = 0.038;
  const clipDuration = 0.24;
  const headlineEnd = clipStart + (headlineWordCount - 1) * perWordDelay + clipDuration;
  const supportingDelay = headlineEnd + 0.04;
  const buttonsDelay = supportingDelay + 0.1;
  const overviewBlockDelay = buttonsDelay + 0.05;
  const tabCount = TABS.length;
  const queueTitleDelay = overviewBlockDelay + 0.16 + tabCount * 0.022;
  const panelSectionDelay = queueTitleDelay + 0.06;
  const accessSectionDelay = panelSectionDelay + 0.1;

  const scrollToActivePlate = () => {
    document.getElementById("account-active-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (reduceMotion) {
    return (
      <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-12 pt-3 sm:-mx-4 sm:px-4">
        <InterviewsPageWidth className="space-y-8">
          <ContentHeader
            breadcrumbs={[
              { label: "Interviews", href: "/interviews" },
              { label: "Account" },
            ]}
            title="Account studio"
            description="One charter for who you are on the platform, how you lock the door, and how billing eventually rides alongside your interview corpus."
            actions={headerActions}
          />

          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-gradient-to-br from-primary-soft via-background to-card shadow-[var(--shadow-1)]">
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse at 80% 40%, color-mix(in oklch, var(--primary) 18%, transparent) 0%, transparent 72%)",
              }}
            />
            <div className="relative px-6 py-8 sm:px-8 sm:py-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold text-primary shadow-[var(--shadow-1)] backdrop-blur-sm">
                <SparklesIcon size={14} className="shrink-0" aria-hidden />
                Account studio
              </span>
              <h2 className="krowe-display-m mt-4 max-w-3xl text-pretty text-foreground">
                Identity, guardrails, and ledger—each with its own{" "}
                <span className="text-primary">surface.</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{HERO_SUBCOPY}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={scrollToActivePlate}
                  className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-4)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:-translate-y-px active:translate-y-px"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Jump to active plate
                </button>
                <Link
                  href="/interviews/imports"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow-1)] transition-colors duration-[var(--duration-fast)] hover:border-primary hover:bg-surface-subtle"
                >
                  Imports & connections
                </Link>
              </div>
            </div>
          </div>

          <AccountTabNavStatic activeTab={activeTab} />

          <AccountPanelStatic activeTab={activeTab} fullName={fullName} email={email} />

          <AccountAccessSectionStatic />
        </InterviewsPageWidth>
      </div>
    );
  }

  return (
    <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-12 pt-3 sm:-mx-4 sm:px-4">
      <InterviewsPageWidth className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: KROWE_EASE }}
        >
          <ContentHeader
            breadcrumbs={[
              { label: "Interviews", href: "/interviews" },
              { label: "Account" },
            ]}
            title="Account studio"
            description="One charter for who you are on the platform, how you lock the door, and how billing eventually rides alongside your interview corpus."
            actions={headerActions}
          />
        </motion.div>

        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-gradient-to-br from-primary-soft via-background to-card shadow-[var(--shadow-1)]">
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at 80% 40%, color-mix(in oklch, var(--primary) 18%, transparent) 0%, transparent 72%)",
            }}
          />
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.03, ease: KROWE_EASE }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold text-primary shadow-[var(--shadow-1)] backdrop-blur-sm"
            >
              <SparklesIcon size={14} className="shrink-0" aria-hidden />
              Account studio
            </motion.span>

            <h2 className="krowe-display-m mt-4 max-w-3xl text-pretty text-foreground">
              {words.map((word, i) => {
                const isAccent = i === words.length - 1;
                return (
                  <motion.span
                    key={`${word}-${i}`}
                    initial={{ clipPath: "inset(0 100% 0 0)", opacity: 1 }}
                    animate={{ clipPath: "inset(0 0% 0 0)" }}
                    transition={{
                      delay: clipStart + i * perWordDelay,
                      duration: clipDuration,
                      ease: KROWE_EASE,
                    }}
                    className={isAccent ? "text-primary" : undefined}
                    style={{ display: "inline-block", marginRight: "0.28em" }}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: supportingDelay, duration: 0.26, ease: KROWE_EASE }}
              className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground"
            >
              {HERO_SUBCOPY}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: buttonsDelay, duration: 0.24, ease: KROWE_EASE }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <button
                type="button"
                onClick={scrollToActivePlate}
                className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-4)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:-translate-y-px active:translate-y-px"
                style={{ background: "var(--gradient-primary)" }}
              >
                Jump to active plate
              </button>
              <Link
                href="/interviews/imports"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow-1)] transition-colors duration-[var(--duration-fast)] hover:border-primary hover:bg-surface-subtle"
              >
                Imports & connections
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.nav
          aria-label="Account sections"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: overviewBlockDelay, duration: 0.28, ease: KROWE_EASE }}
          className="grid gap-3 sm:grid-cols-3"
        >
          {(TABS as readonly AccountTab[]).map((tab, i) => {
            const meta = TAB_META[tab];
            const Icon = meta.icon;
            const active = activeTab === tab;
            return (
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: overviewBlockDelay + 0.04 + i * 0.034,
                  duration: 0.22,
                  ease: KROWE_EASE,
                }}
              >
                <Link
                  href={`/interviews/account?tab=${tab}`}
                  className={`group relative flex h-full overflow-hidden rounded-[var(--radius-lg)] border px-4 py-4 shadow-[var(--shadow-1)] transition-[border-color,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none ${
                    active
                      ? "border-primary/45 bg-gradient-to-b from-primary-soft/95 to-card ring-1 ring-primary/20"
                      : "border-border/70 bg-card hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-2)] motion-reduce:hover:translate-y-0"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`font-mono text-[10px] font-bold tabular-nums ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {meta.plate}
                    </span>
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      }`}
                      aria-hidden
                    />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{meta.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{meta.blurb}</p>
                  <span
                    className={`mt-3 inline-flex text-[10px] font-bold uppercase tracking-[0.12em] ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {tab === "profile" ? "Profile" : tab === "security" ? "Security" : "Billing"}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        <motion.section
          id="account-active-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: panelSectionDelay, duration: 0.28, ease: KROWE_EASE }}
          className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card shadow-[var(--shadow-1)]"
          aria-labelledby="account-panel-heading"
        >
          <div className="border-b border-border/60 bg-surface-subtle/90 px-4 py-3 sm:px-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Active plate</p>
            <h2 id="account-panel-heading" className="mt-0.5 text-base font-semibold text-foreground">
              {TAB_META[activeTab].title}
              <span className="font-normal text-muted-foreground"> · {tabSummaryLabel(activeTab)}</span>
            </h2>
          </div>

          <div className="px-4 py-6 sm:px-6 sm:py-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: KROWE_EASE }}
            >
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block space-y-2" htmlFor="account-full-name">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Full name
                      </span>
                      <input
                        id="account-full-name"
                        name="full_name"
                        type="text"
                        defaultValue={fullName}
                        placeholder="Ada Lovelace"
                        autoComplete="name"
                        className="w-full rounded-xl border border-border/80 bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/60 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15"
                      />
                    </label>
                    <label className="block space-y-2" htmlFor="account-email">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</span>
                      <input
                        id="account-email"
                        name="email"
                        type="email"
                        defaultValue={email}
                        disabled
                        aria-describedby="account-email-hint"
                        className="w-full cursor-not-allowed rounded-xl border border-border/60 bg-muted/35 px-3 py-2.5 text-sm text-muted-foreground"
                      />
                      <p id="account-email-hint" className="text-xs leading-relaxed text-muted-foreground">
                        Primary sign-in address. Changing it requires the auth provider flow.
                      </p>
                    </label>
                  </div>
                  <div className="rounded-xl border border-dashed border-border/80 bg-background/80 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                    Profile save wiring can connect to Supabase user metadata next—this layout is ready for a single PATCH
                    when you wire the API route.
                  </div>
                  <KroweButton type="button" variant="primary" size="sm" disabled title="Save not wired yet">
                    Save changes
                  </KroweButton>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-5">
                  <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                    Password rotation and provider-linked identities still live in the hosted auth surface. Krowe keeps a
                    thin seam so you never hunt for the escape hatch.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <KroweLinkButton href="/auth/signin" variant="primary">
                      Open auth settings
                    </KroweLinkButton>
                    <KroweLinkButton href="/interviews" variant="secondary">
                      Back to overview
                    </KroweLinkButton>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-5">
                  <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                    Commercial rails are staged—not hidden. When Stripe or a ledger lands, this plate becomes the control
                    room instead of a surprise modal.
                  </p>
                  <KroweLinkButton href="mailto:support@krowe.com" variant="secondary">
                    Contact support
                  </KroweLinkButton>
                </div>
              )}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: accessSectionDelay, duration: 0.28, ease: KROWE_EASE }}
          className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border/70 bg-gradient-to-r from-background via-card to-primary-soft/40 px-5 py-6 shadow-[var(--shadow-1)] sm:px-7"
          aria-labelledby="account-access-heading"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-[0.12]"
            style={{
              background: "radial-gradient(circle at center, var(--primary) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-[1] space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Platform access
                </p>
                <h2 id="account-access-heading" className="krowe-display-m mt-1 text-foreground">
                  Sessions & side doors
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  The sidebar pod is the fast lane for profile shortcuts—this block is the charter: integrations, exits,
                  and the keys you will eventually mint for automations.
                </p>
              </div>
              <KeyRoundIcon className="hidden h-10 w-10 shrink-0 text-primary/35 sm:block" aria-hidden />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: accessSectionDelay + 0.05, duration: 0.22, ease: KROWE_EASE }}
                className="rounded-xl border border-border/70 bg-background/85 p-4 shadow-[var(--shadow-1)] backdrop-blur-[2px]"
              >
                <p className="text-xs font-semibold text-foreground">Connected tools</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Granola, imports, and future webhooks share one front door.
                </p>
                <KroweLinkButton href="/interviews/imports" variant="secondary" className="mt-4 !px-4 !py-2 !text-xs">
                  Open imports & connections
                </KroweLinkButton>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: accessSectionDelay + 0.09, duration: 0.22, ease: KROWE_EASE }}
                className="rounded-xl border border-border/70 bg-background/85 p-4 shadow-[var(--shadow-1)] backdrop-blur-[2px]"
              >
                <p className="text-xs font-semibold text-foreground">Session & exit</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  End this browser session or jump straight to credential hygiene.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <LogoutButton variant="pill" />
                  <KroweLinkButton href="/interviews/account?tab=security" variant="secondary" className="!px-4 !py-2 !text-xs">
                    Security plate
                  </KroweLinkButton>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
              <span className="rounded-md border border-border/60 bg-card px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-foreground">
                API keys
              </span>
              <span>Programmatic access is on the roadmap—when it ships, keys will be minted here with rotation logs.</span>
            </div>
          </div>
        </motion.section>
      </InterviewsPageWidth>
    </div>
  );
}

function AccountTabNavStatic({ activeTab }: { activeTab: AccountTab }) {
  return (
    <nav aria-label="Account sections" className="grid gap-3 sm:grid-cols-3">
      {(TABS as readonly AccountTab[]).map((tab) => {
        const meta = TAB_META[tab];
        const Icon = meta.icon;
        const active = activeTab === tab;
        return (
          <Link
            key={tab}
            href={`/interviews/account?tab=${tab}`}
            className={`group relative overflow-hidden rounded-[var(--radius-lg)] border px-4 py-4 shadow-[var(--shadow-1)] transition-[border-color,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none ${
              active
                ? "border-primary/45 bg-gradient-to-b from-primary-soft/95 to-card ring-1 ring-primary/20"
                : "border-border/70 bg-card hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-2)] motion-reduce:hover:translate-y-0"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`font-mono text-[10px] font-bold tabular-nums ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {meta.plate}
              </span>
              <Icon
                className={`h-5 w-5 shrink-0 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                }`}
                aria-hidden
              />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">{meta.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{meta.blurb}</p>
            <span
              className={`mt-3 inline-flex text-[10px] font-bold uppercase tracking-[0.12em] ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {tab === "profile" ? "Profile" : tab === "security" ? "Security" : "Billing"}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function AccountPanelStatic({
  activeTab,
  fullName,
  email,
}: {
  activeTab: AccountTab;
  fullName: string;
  email: string;
}) {
  return (
    <section
      id="account-active-panel"
      className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card shadow-[var(--shadow-1)]"
      aria-labelledby="account-panel-heading"
    >
      <div className="border-b border-border/60 bg-surface-subtle/90 px-4 py-3 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Active plate</p>
        <h2 id="account-panel-heading" className="mt-0.5 text-base font-semibold text-foreground">
          {TAB_META[activeTab].title}
          <span className="font-normal text-muted-foreground"> · {tabSummaryLabel(activeTab)}</span>
        </h2>
      </div>

      <div className="px-4 py-6 sm:px-6 sm:py-8">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2" htmlFor="account-full-name-static">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full name</span>
                <input
                  id="account-full-name-static"
                  name="full_name"
                  type="text"
                  defaultValue={fullName}
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/60 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15"
                />
              </label>
              <label className="block space-y-2" htmlFor="account-email-static">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</span>
                <input
                  id="account-email-static"
                  name="email"
                  type="email"
                  defaultValue={email}
                  disabled
                  aria-describedby="account-email-hint-static"
                  className="w-full cursor-not-allowed rounded-xl border border-border/60 bg-muted/35 px-3 py-2.5 text-sm text-muted-foreground"
                />
                <p id="account-email-hint-static" className="text-xs leading-relaxed text-muted-foreground">
                  Primary sign-in address. Changing it requires the auth provider flow.
                </p>
              </label>
            </div>
            <div className="rounded-xl border border-dashed border-border/80 bg-background/80 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              Profile save wiring can connect to Supabase user metadata next—this layout is ready for a single PATCH when you
              wire the API route.
            </div>
            <KroweButton type="button" variant="primary" size="sm" disabled title="Save not wired yet">
              Save changes
            </KroweButton>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-5">
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              Password rotation and provider-linked identities still live in the hosted auth surface. Krowe keeps a thin
              seam so you never hunt for the escape hatch.
            </p>
            <div className="flex flex-wrap gap-3">
              <KroweLinkButton href="/auth/signin" variant="primary">
                Open auth settings
              </KroweLinkButton>
              <KroweLinkButton href="/interviews" variant="secondary">
                Back to overview
              </KroweLinkButton>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-5">
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              Commercial rails are staged—not hidden. When Stripe or a ledger lands, this plate becomes the control room
              instead of a surprise modal.
            </p>
            <KroweLinkButton href="mailto:support@krowe.com" variant="secondary">
              Contact support
            </KroweLinkButton>
          </div>
        )}
      </div>
    </section>
  );
}

function AccountAccessSectionStatic() {
  return (
    <section
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border/70 bg-gradient-to-r from-background via-card to-primary-soft/40 px-5 py-6 shadow-[var(--shadow-1)] sm:px-7"
      aria-labelledby="account-access-heading-static"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-[0.12]"
        style={{
          background: "radial-gradient(circle at center, var(--primary) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-[1] space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Platform access</p>
            <h2 id="account-access-heading-static" className="krowe-display-m mt-1 text-foreground">
              Sessions & side doors
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              The sidebar pod is the fast lane for profile shortcuts—this block is the charter: integrations, exits, and
              the keys you will eventually mint for automations.
            </p>
          </div>
          <KeyRoundIcon className="hidden h-10 w-10 shrink-0 text-primary/35 sm:block" aria-hidden />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-background/85 p-4 shadow-[var(--shadow-1)] backdrop-blur-[2px]">
            <p className="text-xs font-semibold text-foreground">Connected tools</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Granola, imports, and future webhooks share one front door.
            </p>
            <KroweLinkButton href="/interviews/imports" variant="secondary" className="mt-4 !px-4 !py-2 !text-xs">
              Open imports & connections
            </KroweLinkButton>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/85 p-4 shadow-[var(--shadow-1)] backdrop-blur-[2px]">
            <p className="text-xs font-semibold text-foreground">Session & exit</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              End this browser session or jump straight to credential hygiene.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <LogoutButton variant="pill" />
              <KroweLinkButton href="/interviews/account?tab=security" variant="secondary" className="!px-4 !py-2 !text-xs">
                Security plate
              </KroweLinkButton>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <span className="rounded-md border border-border/60 bg-card px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-foreground">
            API keys
          </span>
          <span>Programmatic access is on the roadmap—when it ships, keys will be minted here with rotation logs.</span>
        </div>
      </div>
    </section>
  );
}
