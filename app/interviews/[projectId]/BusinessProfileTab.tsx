"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
    user_edited:  ["bg-[color-mix(in_srgb,var(--primary)_14%,#fff)] text-[#a04000]", "User edit"],
    webscraper:   ["bg-[color-mix(in_srgb,var(--tertiary)_14%,#fff)] text-tertiary", "Web scrape"],
    ai_suggested: ["bg-[color-mix(in_srgb,var(--interview-brand)_14%,#fff)] text-interview-brand", "AI inferred"],
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

function FieldValue({ fkey, kind, value, isEditing, editText, onEditChange }: {
  fkey: string;
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

function FieldCard({ fkey, config, answer, isEditing, editText, onEditStart, onEditChange, onSave, onCancel }: {
  fkey: string;
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
      className="rounded-xl bg-white relative transition-all duration-150"
      style={{
        border: isEditing
          ? "1px solid var(--interview-brand)"
          : "1px solid color-mix(in srgb, var(--border) 70%, transparent)",
        boxShadow: isEditing
          ? "0 0 0 3px color-mix(in srgb, var(--interview-brand) 15%, transparent)"
          : hovered ? "var(--shadow-soft)" : undefined,
        padding: "14px 16px",
        background: empty ? undefined : "#fff",
        backgroundImage: empty
          ? "repeating-linear-gradient(135deg, #fff 0 6px, color-mix(in srgb, var(--muted) 60%, #fff) 6px 7px)"
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
          fkey={fkey}
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
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-border bg-white text-foreground hover:brightness-95"
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
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground rounded-md px-1 py-0.5 transition-opacity duration-150 hover:text-interview-brand"
            style={{ opacity: hovered || isEditing ? 1 : 0 }}
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
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

export function BusinessProfileTab({ projectId }: { projectId: string }) {
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

  if (loading) {
    return (
      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 md:px-5 pb-16 mt-10">
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">
          Loading business profile…
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 md:px-5 pb-16 mt-10">
        <div className="rounded-2xl border border-danger/40 bg-danger-soft p-6 text-sm text-danger">
          {error ?? "Unable to load business profile."}
        </div>
      </main>
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

  return (
    <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 md:px-5 pb-16 mt-2 space-y-0">

      {/* ── Header strip ── */}
      <section
        className="rounded-2xl bg-white mb-3"
        style={{
          border: "1px solid color-mix(in srgb, var(--border) 60%, transparent)",
          boxShadow: "var(--shadow-soft)",
          padding: "14px 18px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 20,
          alignItems: "center",
        }}
      >
        <div>
          {/* Eyebrow */}
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] m-0 mb-1" style={{ color: "var(--interview-brand)" }}>
            Business Profile · Onboarding Snapshot
          </p>

          {/* Headline */}
          <h1 className="text-[19px] font-bold tracking-tight m-0 mb-1.5 leading-[1.15]">
            A decision-ready{" "}
            <span style={{ color: "var(--interview-brand)" }}>portrait</span>
            {" "}of your business.
          </h1>

          {/* Subtitle */}
          <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[520px] m-0 mb-2.5">
            This tab reflects your onboarding answers only. {filledCount} of {totalCount} fields detected. Rich profiles produce sharper rationale and better-prioritized build lists.
          </p>

          {/* Status chips row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {data.onboarding.completedAt && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                style={{ background: "var(--success-soft)", color: "var(--success)", border: "1px solid color-mix(in srgb, var(--success) 30%, transparent)" }}
              >
                <span className="material-symbols-outlined text-[12px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Onboarding complete
              </span>
            )}
            {data.onboarding.mode === "webscraper" && data.onboarding.sourceUrl && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                style={{ background: "color-mix(in srgb, var(--interview-brand) 10%, #fff)", color: "var(--interview-brand)", border: "1px solid color-mix(in srgb, var(--interview-brand) 28%, transparent)" }}
              >
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

        {/* Profile depth ring */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <div className="relative" style={{ width: 76, height: 76 }}>
            <CompletionRing pct={completionPct} size={76} stroke={6} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[20px] font-bold tracking-tight leading-none">{completionPct}%</span>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground leading-tight text-center">
            Profile Depth
          </span>
          <span className="text-[10.5px] text-muted-foreground font-mono">
            {filledCount}/{totalCount} signals
          </span>
        </div>
      </section>

      {/* ── Website scrape hero ── */}
      <section
        className="rounded-2xl mb-5 relative"
        style={{
          padding: "14px 18px 14px",
          background: "linear-gradient(135deg, #fdf0e8 0%, #fce8d8 100%)",
          border: "1px solid color-mix(in srgb, var(--interview-brand) 18%, var(--border))",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        {/* Last scrape badge – top right */}
        {timeAgo(data.onboarding.completedAt) && (
          <div
            className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-medium bg-white"
            style={{ border: "1px solid color-mix(in srgb, var(--border) 80%, transparent)", color: "var(--muted-foreground)" }}
          >
            <span className="material-symbols-outlined text-[12px]">schedule</span>
            Last scrape · {timeAgo(data.onboarding.completedAt)}
          </div>
        )}

        <h2 className="text-[17px] font-bold tracking-tight mb-1 mt-0 pr-40">
          Skip the form — let us{" "}
          <span style={{ color: "var(--interview-brand)" }}>read your site.</span>
        </h2>
        <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[560px] mb-3">
          Web scraping can replace manual onboarding. Running this updates your Business Profile and marks onboarding complete.
        </p>

        <div className="flex gap-2 items-stretch">
          <div
            className="flex-1 flex items-center gap-2 px-3 rounded-xl bg-white transition-all"
            style={{ border: "1px solid color-mix(in srgb, var(--border) 80%, transparent)", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}
          >
            <span className="material-symbols-outlined text-muted-foreground text-[18px]">language</span>
            <input
              type="url"
              value={sourceUrlInput}
              onChange={(e) => setSourceUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleScrape()}
              placeholder="https://yourcompany.com"
              className="flex-1 border-none outline-none py-2.5 text-sm text-foreground bg-transparent placeholder:text-muted-foreground/60"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleScrape()}
            disabled={scraping}
            className="flex items-center gap-1.5 px-5 rounded-xl text-[12.5px] font-semibold text-white disabled:opacity-60 shrink-0"
            style={{ background: "var(--interview-brand)", boxShadow: "0 6px 20px -4px rgba(230,100,50,0.35)" }}
          >
            {scraping ? "Analyzing…" : "Analyze / Regenerate"}
          </button>
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap gap-4 items-center mt-2 text-[11px] text-muted-foreground">
          {data.onboarding.sourceUrl && (
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--success)" }} />
              Current source URL
              <code className="font-mono text-foreground">{data.onboarding.sourceUrl}</code>
            </span>
          )}
          {scrapeMessage && (
            <span className={scrapeMessage.startsWith("Website analyzed") ? "text-success" : "text-danger"}>
              {scrapeMessage}
            </span>
          )}
        </div>
      </section>

      {error && (
        <section className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger mb-4">
          {error}
        </section>
      )}

      {/* ── Founder + Problem ── */}
      <GroupHeader num="01" title="Founder + Problem" count={founderKeys.length} signalPct={founderSig} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {founderKeys.map((key) => {
          const config = FIELD_CONFIG[key]!;
          return (
            <FieldCard
              key={key}
              fkey={key}
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

      {/* ── Product + Market ── */}
      <GroupHeader num="02" title="Product + Market" count={productKeys.length} signalPct={productSig} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {productKeys.map((key) => {
          const config = FIELD_CONFIG[key]!;
          return (
            <FieldCard
              key={key}
              fkey={key}
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
    </main>
  );
}
