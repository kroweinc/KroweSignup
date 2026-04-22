"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Building2Icon, SparklesIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ContentHeader } from "@/app/components/krowe/ContentHeader";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import { KroweButton } from "@/app/components/krowe/KroweButton";
import { KROWE_EASE } from "@/lib/motion/kroweEase";
import { dashboardQueueTitleDelay, getDashboardPageEntranceTiming } from "@/lib/motion/dashboardPageEntrance";
import { InterviewsPageWidth } from "@/app/interviews/_components/InterviewsPageWidth";

type OnboardingAnswer = {
  value: unknown;
  finalSource: string | null;
  confirmedAt: string | null;
};

type BusinessProfileResponse = {
  meta: {
    source: "onboarding";
    answerCount: number;
  };
  onboarding: {
    mode: "manual" | "webscraper" | null;
    completedAt: string | null;
    sourceUrl: string | null;
    sourceUpdatedAt: string | null;
  };
  answers: Record<string, OnboardingAnswer>;
};

type FieldKind = "text" | "chip-single" | "chips" | "list" | "kv" | "pricing" | "number";

type FieldConfig = {
  label: string;
  group: "founder" | "product";
  order: number;
  kind: FieldKind;
};

const FIELD_CONFIG: Record<string, FieldConfig> = {
  idea:            { label: "Idea",                  group: "founder", order: 1, kind: "text" },
  problem:         { label: "Problem",               group: "founder", order: 2, kind: "text" },
  target_customer: { label: "Target Customer",       group: "founder", order: 3, kind: "text" },
  startup_stage:   { label: "Startup Stage",         group: "founder", order: 4, kind: "chip-single" },
  industry:        { label: "Industry",              group: "founder", order: 5, kind: "kv" },
  product_type:    { label: "Product Type",          group: "product", order: 1, kind: "chip-single" },
  features:        { label: "Features",              group: "product", order: 2, kind: "list" },
  competitors:     { label: "Competitors",           group: "product", order: 3, kind: "chips" },
  alternatives:    { label: "Alternatives",          group: "product", order: 4, kind: "list" },
  pricing_model:   { label: "Pricing Model",         group: "product", order: 5, kind: "pricing" },
  interview_count: { label: "Interview Count Goal",  group: "product", order: 6, kind: "number" },
};

function formatDateTime(value: string | null): string {
  if (!value) return "Not completed";
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return "Not completed";
  return d.toLocaleString();
}

function timeAgo(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function isFieldEmpty(value: unknown, kind: FieldKind): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return !value.trim();
  if (typeof value === "number") return value === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    if (kind === "pricing") {
      const obj = value as Record<string, unknown>;
      const models = obj.pricingModels;
      return !Array.isArray(models) || models.length === 0;
    }
    return Object.keys(value as object).length === 0;
  }
  return false;
}

function computeSignal(value: unknown, kind: FieldKind): number {
  if (isFieldEmpty(value, kind)) return 0;
  if (kind === "text" && typeof value === "string") {
    const len = value.trim().length;
    if (len > 150) return 5;
    if (len > 80) return 4;
    if (len > 40) return 3;
    if (len > 10) return 2;
    return 1;
  }
  if (kind === "list" && Array.isArray(value)) return Math.min(5, Math.max(1, Math.ceil(value.length / 2)));
  if (kind === "chips" && Array.isArray(value)) return Math.min(5, Math.max(1, value.length));
  return 3;
}

function SignalBars({ strength, max = 5 }: { strength: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5 items-end" title={`Signal strength ${strength}/${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const on = i < strength;
        return (
          <span
            key={i}
            className="rounded-[1.5px] inline-block"
            style={{
              width: 4,
              height: 9,
              background: on ? "var(--interview-brand)" : "var(--track)",
            }}
          />
        );
      })}
    </span>
  );
}

function SourceChip({ src }: { src: string | null }) {
  if (!src) return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground">
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      No source
    </span>
  );
  const map: Record<string, [string, string]> = {
    user_edited:  ["bg-primary-soft text-primary border border-primary/25", "User edit"],
    webscraper:   ["bg-[color-mix(in_srgb,var(--tertiary)_14%,var(--background))] text-tertiary border border-tertiary/20", "Web scrape"],
    ai_suggested: ["bg-[color-mix(in_srgb,var(--interview-brand)_14%,var(--background))] text-interview-brand border border-interview-brand/25", "AI inferred"],
    original:     ["bg-muted text-muted-foreground", "User"],
  };
  const [cls, label] = map[src] ?? ["bg-muted text-muted-foreground", src];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function CompletionRing({ pct, size = 82, stroke = 7, color = "var(--interview-brand)" }: {
  pct: number; size?: number; stroke?: number; color?: string;
}) {
  const r = size / 2 - stroke;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function FieldValue({ kind, value, isEditing, editText, onEditChange }: {
  kind: FieldKind;
  value: unknown;
  isEditing: boolean;
  editText: string;
  onEditChange: (v: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus();
  }, [isEditing]);

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={editText}
        onChange={(e) => onEditChange(e.target.value)}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm leading-relaxed text-foreground outline-none resize-y min-h-[70px] bg-background focus:border-interview-brand"
        style={{ boxShadow: "0 0 0 3px color-mix(in srgb, var(--interview-brand) 16%, transparent)" }}
      />
    );
  }

  if (kind === "text" && typeof value === "string") {
    return <p className="text-[13.5px] text-foreground leading-relaxed break-words">{value}</p>;
  }

  if (kind === "chip-single" && typeof value === "string") {
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
        style={{ background: "color-mix(in srgb, var(--interview-brand) 10%, #fff)", color: "var(--interview-brand)", border: "1px solid color-mix(in srgb, var(--interview-brand) 30%, transparent)" }}
      >
        {value}
      </span>
    );
  }

  if (kind === "chips" && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {(value as string[]).map((v, i) => (
          <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border/80">
            {v}
          </span>
        ))}
      </div>
    );
  }

  if (kind === "list" && Array.isArray(value)) {
    return (
      <ul className="space-y-1.5 list-none p-0 m-0">
        {(value as unknown[]).map((v, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-foreground">
            <span className="w-1 h-1 rounded-full mt-[7px] shrink-0" style={{ background: "var(--interview-brand)" }} />
            {String(v)}
          </li>
        ))}
      </ul>
    );
  }

  if (kind === "kv" && typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    return (
      <div className="space-y-1.5">
        {Object.entries(obj).map(([k, v]) => (
          <div key={k} className="flex gap-3 text-[13px]">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground min-w-[80px] pt-0.5">{k}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-foreground border border-border/70">{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (kind === "pricing" && typeof value === "object" && value !== null) {
    const obj = value as { pricingModels?: string[]; estimatedPrice?: unknown };
    return (
      <div className="space-y-1.5">
        <div className="flex gap-3 text-[13px]">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground min-w-[80px] pt-0.5">Models</span>
          <div className="flex flex-wrap gap-1">
            {(obj.pricingModels ?? []).map((m, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: "color-mix(in srgb, var(--interview-brand) 10%, #fff)", color: "var(--interview-brand)", border: "1px solid color-mix(in srgb, var(--interview-brand) 30%, transparent)" }}>{m}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-3 text-[13px]">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground min-w-[80px] pt-0.5">Price</span>
          <span className="text-muted-foreground italic text-xs">{obj.estimatedPrice != null ? String(obj.estimatedPrice) : "Not estimated"}</span>
        </div>
      </div>
    );
  }

  if (kind === "number") {
    return <span className="text-[13.5px] font-mono text-foreground">{String(value)}</span>;
  }

  return <span className="text-[13.5px] text-foreground">{String(value ?? "—")}</span>;
}

function FieldCard({ config, answer, isEditing, editText, onEditStart, onEditChange, onSave, onCancel }: {
  config: FieldConfig;
  answer: OnboardingAnswer | undefined;
  isEditing: boolean;
  editText: string;
  onEditStart: () => void;
  onEditChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const value = answer?.value;
  const empty = isFieldEmpty(value, config.kind);
  const signal = computeSignal(value, config.kind);

  return (
    <div
      className="group relative rounded-xl bg-card transition-all duration-150"
      style={{
        border: isEditing
          ? "1px solid var(--interview-brand)"
          : "1px solid color-mix(in srgb, var(--border) 70%, transparent)",
        boxShadow: isEditing
          ? "0 0 0 3px color-mix(in srgb, var(--interview-brand) 15%, transparent)"
          : hovered ? "var(--shadow-soft)" : undefined,
        padding: "14px 16px",
        background: empty ? undefined : "var(--card)",
        backgroundImage: empty
          ? "repeating-linear-gradient(135deg, var(--background) 0 6px, color-mix(in srgb, var(--muted) 60%, var(--background)) 6px 7px)"
          : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Label row */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{config.label}</span>
        <span className="ml-auto">
          <SignalBars strength={signal} />
        </span>
      </div>

      {/* Value */}
      {empty && !isEditing ? (
        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground italic">
          <span className="material-symbols-outlined text-[15px] text-muted-foreground">radio_button_unchecked</span>
          Not set
          <button
            type="button"
            onClick={onEditStart}
            className="ml-1 not-italic font-semibold text-[12.5px] text-interview-brand hover:underline"
            style={{ color: "var(--interview-brand)" }}
          >
            Add {config.label.toLowerCase()} →
          </button>
        </div>
      ) : (
        <FieldValue
          kind={config.kind}
          value={value}
          isEditing={isEditing}
          editText={editText}
          onEditChange={onEditChange}
        />
      )}

      {/* Footer */}
      <div
        className="flex items-center gap-2 mt-2.5 pt-2"
        style={{ borderTop: "1px dashed color-mix(in srgb, var(--border) 80%, transparent)" }}
      >
        <SourceChip src={answer?.finalSource ?? null} />
        <span className="flex-1" />
        {isEditing ? (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-surface-subtle"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md text-white"
              style={{ background: "linear-gradient(135deg, var(--interview-brand), var(--interview-brand-end))" }}
            >
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onEditStart}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground opacity-100 transition-opacity duration-150 hover:text-interview-brand max-sm:min-h-11 max-sm:items-center sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1 focus-visible:ring-offset-card"
          >
            <span className="material-symbols-outlined text-[14px]" aria-hidden>
              edit
            </span>
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

function GroupHeader({ num, title, count, signalPct }: {
  num: string; title: string; count: number; signalPct: number;
}) {
  return (
    <div className="flex items-center gap-3 mt-6 mb-3 mx-0.5">
      <span
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold font-mono shrink-0"
        style={{ background: "color-mix(in srgb, var(--interview-brand) 14%, #fff)", color: "var(--interview-brand)" }}
      >
        {num}
      </span>
      <h3 className="text-sm font-semibold tracking-tight m-0">{title}</h3>
      <span className="text-[11px] text-muted-foreground font-mono">{count} fields · {signalPct}% signal</span>
      <span className="flex-1 h-px" style={{ background: "color-mix(in srgb, var(--border) 70%, transparent)" }} />
    </div>
  );
}

const HERO_HEADLINE = "Sharpen the portrait that powers synthesis.";
const HERO_SUBCOPY =
  "Founder and product fields flow into interview clustering, feature scoring, and decision rationale. Edit inline or refresh from your site.";

export function BusinessProfileTab({ projectId, projectName }: { projectId: string; projectName: string }) {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<BusinessProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceUrlInput, setSourceUrlInput] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [localOverrides, setLocalOverrides] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/interviews/project/${projectId}/business-profile`);
      const payload = (await res.json()) as BusinessProfileResponse & { error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Failed to load onboarding profile");
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load onboarding profile");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!data?.onboarding.sourceUrl) return;
    setSourceUrlInput(data.onboarding.sourceUrl);
  }, [data?.onboarding.sourceUrl]);

  async function handleScrape() {
    const normalized = sourceUrlInput.trim();
    if (!normalized) { setScrapeMessage("Enter a website URL first."); return; }
    setScrapeMessage(null);
    setScraping(true);
    try {
      const res = await fetch(`/api/interviews/project/${projectId}/business-profile/onboarding-url`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Failed to scrape website.");
      setScrapeMessage("Website analyzed. Business Profile was updated from your site.");
      await load();
    } catch (err) {
      setScrapeMessage(err instanceof Error ? err.message : "Failed to scrape website.");
    } finally {
      setScraping(false);
    }
  }

  function startEdit(key: string, value: unknown) {
    setEditingKey(key);
    const str = typeof value === "string" ? value
      : value === null || value === undefined ? ""
      : JSON.stringify(value, null, 2);
    setEditText(str);
  }

  function cancelEdit() {
    setEditingKey(null);
    setEditText("");
  }

  function saveEdit() {
    if (!editingKey) return;
    const config = FIELD_CONFIG[editingKey];
    let parsed: unknown = editText;
    if (config && (config.kind === "list" || config.kind === "chips" || config.kind === "kv" || config.kind === "pricing")) {
      try { parsed = JSON.parse(editText); } catch { parsed = editText; }
    }
    setLocalOverrides((prev) => ({ ...prev, [editingKey]: parsed }));
    setEditingKey(null);
    setEditText("");
  }

  const shell = (children: ReactNode) => (
    <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
      <InterviewsPageWidth className="space-y-8">{children}</InterviewsPageWidth>
    </div>
  );

  if (loading) {
    return shell(
      <>
        <ContentHeader
          breadcrumbs={[
            { label: "Interviews", href: "/interviews" },
            { label: projectName, href: `/interviews/${projectId}` },
            { label: "Business profile" },
          ]}
          title="Business profile"
          description="Loading your onboarding snapshot…"
          actions={
            <KroweLinkButton href={`/interviews/${projectId}`} variant="secondary">
              Workspace
            </KroweLinkButton>
          }
        />
        <div className="rounded-[var(--radius-lg)] border border-border/80 bg-card p-8 text-sm text-muted-foreground shadow-[var(--shadow-1)]">
          <p className="font-medium text-foreground">Preparing profile canvas</p>
          <p className="mt-2">Pulling founder and product fields from your workspace…</p>
        </div>
      </>,
    );
  }

  if (!data) {
    return shell(
      <>
        <ContentHeader
          breadcrumbs={[
            { label: "Interviews", href: "/interviews" },
            { label: projectName, href: `/interviews/${projectId}` },
            { label: "Business profile" },
          ]}
          title="Business profile"
          description="We could not load this profile."
          actions={
            <KroweLinkButton href={`/interviews/${projectId}`} variant="secondary">
              Back to workspace
            </KroweLinkButton>
          }
        />
        <div className="rounded-[var(--radius-lg)] border border-danger/40 bg-danger-soft p-6 text-sm text-danger shadow-[var(--shadow-1)]">
          {error ?? "Unable to load business profile."}
        </div>
      </>,
    );
  }

  const answers = data.answers;

  // Merge local overrides into displayed answers
  const mergedAnswers: Record<string, OnboardingAnswer> = { ...answers };
  for (const [key, val] of Object.entries(localOverrides)) {
    mergedAnswers[key] = { ...(answers[key] ?? { finalSource: null, confirmedAt: null }), value: val };
  }

  // Compute completion stats
  const allKeys = Object.keys(FIELD_CONFIG);
  const filledCount = allKeys.filter((k) => {
    const config = FIELD_CONFIG[k]!;
    const val = mergedAnswers[k]?.value;
    return !isFieldEmpty(val, config.kind);
  }).length;
  const totalCount = allKeys.length;
  const completionPct = Math.round((filledCount / totalCount) * 100);

  function groupFields(group: "founder" | "product") {
    return allKeys
      .filter((k) => FIELD_CONFIG[k]?.group === group)
      .sort((a, b) => (FIELD_CONFIG[a]?.order ?? 0) - (FIELD_CONFIG[b]?.order ?? 0));
  }

  function groupSignalPct(keys: string[]) {
    const total = keys.reduce((acc, k) => {
      const config = FIELD_CONFIG[k];
      if (!config) return acc;
      return acc + computeSignal(mergedAnswers[k]?.value, config.kind);
    }, 0);
    return Math.round((total / (keys.length * 5)) * 100);
  }

  const founderKeys = groupFields("founder");
  const productKeys = groupFields("product");
  const founderSig = groupSignalPct(founderKeys);
  const productSig = groupSignalPct(productKeys);

  const profileHeader = (
    <ContentHeader
      breadcrumbs={[
        { label: "Interviews", href: "/interviews" },
        { label: projectName, href: `/interviews/${projectId}` },
        { label: "Business profile" },
      ]}
      title="Business profile"
      description="Founder and product snapshot from onboarding—editable inline, refreshable from your site. Richer fields sharpen interview synthesis and decision rationale."
      actions={
        <>
          <KroweLinkButton href={`/interviews/${projectId}/script`} variant="secondary">
            Interview script
          </KroweLinkButton>
          <KroweLinkButton href={`/interviews/${projectId}`} variant="secondary">
            Workspace
          </KroweLinkButton>
        </>
      }
    />
  );

  const words = HERO_HEADLINE.split(" ");
  const { clipStart, perWordDelay, clipDuration, supportingDelay, buttonsDelay, overviewBlockDelay } =
    getDashboardPageEntranceTiming(words.length);
  const founderSectionDelay = dashboardQueueTitleDelay(overviewBlockDelay, 4);
  const productSectionDelay = founderSectionDelay + 0.1 + founderKeys.length * 0.018;
  const snapshotDelay = overviewBlockDelay + 0.08;
  const scrapeSectionDelay = overviewBlockDelay + 0.16;

  const scrollToFounderFields = () => {
    document.getElementById("bp-founder-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const portraitCallout = (
    <div className="noise-surface relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-gradient-to-r from-primary-soft/90 via-background to-card px-5 py-4 shadow-[var(--shadow-1)] sm:px-7">
      <div className="relative z-[2] flex flex-wrap items-center gap-3">
        <Building2Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <p className="text-sm font-medium text-foreground">
          <span className="text-primary">Portrait mode</span>
          <span className="text-muted-foreground">
            {" "}
            — One orange accent per surface: interview-brand signal bars and CTAs carry the heat; everything else stays
            warm-neutral and legible.
          </span>
        </p>
      </div>
    </div>
  );

  const snapshotSection = (
    <section className="grid grid-cols-1 gap-4 rounded-[var(--radius-lg)] border border-border/80 bg-card p-5 shadow-[var(--shadow-1)] sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Onboarding snapshot</p>
          <h2 className="krowe-display-m mt-2 max-w-xl text-pretty text-foreground">
            A decision-ready <span className="text-primary">portrait</span> of the business.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {filledCount} of {totalCount} fields populated. Stronger profiles tighten cluster scoring and feature
            prioritization downstream.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {data.onboarding.completedAt && (
              <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success-soft px-2.5 py-0.5 text-[10.5px] font-semibold text-success">
                <span className="material-symbols-outlined text-[12px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                Onboarding complete
              </span>
            )}
            {data.onboarding.mode === "webscraper" && data.onboarding.sourceUrl && (
              <span className="inline-flex items-center gap-1 rounded-full border border-interview-brand/25 bg-[color-mix(in_srgb,var(--interview-brand)_10%,var(--background))] px-2.5 py-0.5 text-[10.5px] font-semibold text-interview-brand">
                <span className="material-symbols-outlined text-[12px] leading-none">link</span>
                Web-scraped source
              </span>
            )}
            {data.onboarding.completedAt && (
              <span className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground">
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                Updated {formatDateTime(data.onboarding.completedAt)}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="relative" style={{ width: 76, height: 76 }}>
            <CompletionRing pct={completionPct} size={76} stroke={6} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[20px] font-bold leading-none tracking-tight">{completionPct}%</span>
            </div>
          </div>
          <span className="text-center text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Profile depth
          </span>
          <span className="font-mono text-[10.5px] text-muted-foreground">
            {filledCount}/{totalCount} signals
          </span>
        </div>
      </section>
  );

  const scrapeSection = (
      <section className="relative overflow-hidden rounded-[var(--radius-lg)] border border-primary/25 bg-gradient-to-br from-primary-soft via-background to-card p-5 shadow-[var(--shadow-1)] sm:p-6">
        {timeAgo(data.onboarding.completedAt) && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-border/80 bg-card px-2.5 py-1 text-[10.5px] font-medium text-muted-foreground shadow-[var(--shadow-1)]">
            <span className="material-symbols-outlined text-[12px]">schedule</span>
            Last scrape · {timeAgo(data.onboarding.completedAt)}
          </div>
        )}

        <h3 className="pr-36 text-base font-bold tracking-tight text-foreground sm:text-lg">
          Skip the form — let us <span className="text-primary">read your site.</span>
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Web scraping can replace manual onboarding. Running this updates your business profile and marks onboarding
          complete.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/80 bg-card px-3 shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)]">
            <span className="material-symbols-outlined text-[18px] text-muted-foreground">language</span>
            <input
              type="url"
              value={sourceUrlInput}
              onChange={(e) => setSourceUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleScrape()}
              placeholder="https://yourcompany.com"
              className="flex-1 border-none bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          <KroweButton
            type="button"
            onClick={() => void handleScrape()}
            disabled={scraping}
            loading={scraping}
            className="shrink-0 sm:min-w-[160px]"
          >
            {scraping ? "Analyzing…" : "Analyze / Regenerate"}
          </KroweButton>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
          {data.onboarding.sourceUrl && (
            <span className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
              Current source
              <code className="font-mono text-foreground">{data.onboarding.sourceUrl}</code>
            </span>
          )}
          {scrapeMessage && (
            <span className={scrapeMessage.startsWith("Website analyzed") ? "font-medium text-success" : "font-medium text-danger"}>
              {scrapeMessage}
            </span>
          )}
        </div>
      </section>
  );

  const fieldGroups = (
    <>
      {error ? (
        <section
          role="alert"
          className="rounded-[var(--radius-lg)] border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger shadow-[var(--shadow-1)]"
        >
          {error}
        </section>
      ) : null}

      <div id="bp-founder-section">
        <GroupHeader num="01" title="Founder + Problem" count={founderKeys.length} signalPct={founderSig} />
        <div className="mt-3 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {founderKeys.map((key) => {
            const config = FIELD_CONFIG[key]!;
            return (
              <FieldCard
                key={key}
                config={config}
                answer={mergedAnswers[key]}
                isEditing={editingKey === key}
                editText={editingKey === key ? editText : ""}
                onEditStart={() => startEdit(key, mergedAnswers[key]?.value)}
                onEditChange={setEditText}
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
            );
          })}
        </div>
      </div>

      <div>
        <GroupHeader num="02" title="Product + Market" count={productKeys.length} signalPct={productSig} />
        <div className="mt-3 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {productKeys.map((key) => {
            const config = FIELD_CONFIG[key]!;
            return (
              <FieldCard
                key={key}
                config={config}
                answer={mergedAnswers[key]}
                isEditing={editingKey === key}
                editText={editingKey === key ? editText : ""}
                onEditStart={() => startEdit(key, mergedAnswers[key]?.value)}
                onEditChange={setEditText}
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
            );
          })}
        </div>
      </div>
    </>
  );

  if (reduceMotion) {
    return shell(
      <>
        {profileHeader}
        {portraitCallout}
        {snapshotSection}
        {scrapeSection}
        {fieldGroups}
      </>,
    );
  }

  return shell(
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: KROWE_EASE }}
      >
        {profileHeader}
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
            Business context
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
              onClick={scrollToFounderFields}
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-4)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:-translate-y-px active:translate-y-px"
              style={{ background: "var(--gradient-primary)" }}
            >
              Jump to fields
            </button>
            <KroweLinkButton href={`/interviews/${projectId}/script`} variant="secondary">
              Interview script
            </KroweLinkButton>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: overviewBlockDelay, duration: 0.26, ease: KROWE_EASE }}
      >
        {portraitCallout}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: snapshotDelay, duration: 0.28, ease: KROWE_EASE }}
      >
        {snapshotSection}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: scrapeSectionDelay, duration: 0.28, ease: KROWE_EASE }}
      >
        {scrapeSection}
      </motion.div>

      {error ? (
        <motion.section
          role="alert"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: scrapeSectionDelay + 0.1, duration: 0.24, ease: KROWE_EASE }}
          className="rounded-[var(--radius-lg)] border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger shadow-[var(--shadow-1)]"
        >
          {error}
        </motion.section>
      ) : null}

      <motion.div
        id="bp-founder-section"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: founderSectionDelay, duration: 0.26, ease: KROWE_EASE }}
      >
        <GroupHeader num="01" title="Founder + Problem" count={founderKeys.length} signalPct={founderSig} />
        <div className="mt-3 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {founderKeys.map((key, index) => {
            const config = FIELD_CONFIG[key]!;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: founderSectionDelay + 0.05 + index * 0.022,
                  duration: 0.22,
                  ease: KROWE_EASE,
                }}
              >
                <FieldCard
                  config={config}
                  answer={mergedAnswers[key]}
                  isEditing={editingKey === key}
                  editText={editingKey === key ? editText : ""}
                  onEditStart={() => startEdit(key, mergedAnswers[key]?.value)}
                  onEditChange={setEditText}
                  onSave={saveEdit}
                  onCancel={cancelEdit}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: productSectionDelay, duration: 0.26, ease: KROWE_EASE }}
      >
        <GroupHeader num="02" title="Product + Market" count={productKeys.length} signalPct={productSig} />
        <div className="mt-3 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {productKeys.map((key, index) => {
            const config = FIELD_CONFIG[key]!;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: productSectionDelay + 0.05 + index * 0.022,
                  duration: 0.22,
                  ease: KROWE_EASE,
                }}
              >
                <FieldCard
                  config={config}
                  answer={mergedAnswers[key]}
                  isEditing={editingKey === key}
                  editText={editingKey === key ? editText : ""}
                  onEditStart={() => startEdit(key, mergedAnswers[key]?.value)}
                  onEditChange={setEditText}
                  onSave={saveEdit}
                  onCancel={cancelEdit}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </>,
  );
}
