"use client";

import { useMemo, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AnimatedField } from "@/app/components/motion/AnimatedField";
import { SelectFocusRing } from "@/app/components/motion/SelectFocusRing";
import { KROWE_EASE } from "@/lib/motion/kroweEase";

type ProjectOption = {
  id: string;
  name: string;
};

type Props = {
  projects: ProjectOption[];
  /** Stagger field entrance + focus ring on selects (parent page uses console motion). */
  orchestrateFields?: boolean;
};

type Frequency = "every_time" | "often" | "sometimes" | "rare_once";
type RecommendAnswer = "yes" | "not_yet";

const CATEGORY_OPTIONS = [
  "Bug",
  "Feature Request",
  "Workflow Friction",
  "Data Quality",
  "Performance",
  "Other",
] as const;

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "every_time", label: "Every time" },
  { value: "often", label: "Often" },
  { value: "sometimes", label: "Sometimes" },
  { value: "rare_once", label: "Rare / once" },
];

const RECOMMEND_OPTIONS: { value: RecommendAnswer; label: string }[] = [
  { value: "yes", label: "Yes, I would recommend it today" },
  { value: "not_yet", label: "Not yet, it needs improvement first" },
];

const STAG = 0.042;

export default function FeedbackForm({ projects, orchestrateFields = false }: Props) {
  const reduceMotion = useReducedMotion();
  const motionOn = Boolean(orchestrateFields && !reduceMotion);
  const d = (i: number) => (motionOn ? i * STAG : 0);

  const [category, setCategory] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [whatHappened, setWhatHappened] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [businessImpact, setBusinessImpact] = useState("");
  const [frequency, setFrequency] = useState<Frequency | "">("");
  const [wouldRecommend, setWouldRecommend] = useState<RecommendAnswer | "">("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const messageLength = message.trim().length;
  const canSubmit = useMemo(
    () =>
      Boolean(
        category &&
          rating !== null &&
          whatHappened.trim() &&
          expectedOutcome.trim() &&
          businessImpact.trim() &&
          frequency &&
          wouldRecommend &&
          messageLength >= 20
      ),
    [
      businessImpact,
      category,
      expectedOutcome,
      frequency,
      messageLength,
      rating,
      whatHappened,
      wouldRecommend,
    ]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setSuccess(null);

    if (!canSubmit || rating === null || !frequency || !wouldRecommend) {
      setError("Please complete every required field before submitting feedback.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/interviews/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          rating,
          message: message.trim(),
          pagePath: window.location.pathname,
          projectId: projectId || null,
          details: {
            whatHappened: whatHappened.trim(),
            expectedOutcome: expectedOutcome.trim(),
            businessImpact: businessImpact.trim(),
            frequency,
            wouldRecommend,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data?.saved) {
          setWarning(
            "Your feedback was saved, but notification failed after retry. Please try submitting again in a minute."
          );
          return;
        }
        setError(data?.error ?? "Could not submit feedback.");
        return;
      }

      setSuccess("Feedback submitted. The Krowe team has been notified.");
      setCategory("");
      setRating(null);
      setProjectId("");
      setWhatHappened("");
      setExpectedOutcome("");
      setBusinessImpact("");
      setFrequency("");
      setWouldRecommend("");
      setMessage("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-interview-brand/25";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="border-b border-border/60 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--interview-brand-tint)_60%,white),white)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Feedback Signal
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Tell us what needs to improve</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We log every response to a dedicated feedback table and route alerts instantly.
          </p>
        </div>

        <div className="grid gap-4 px-4 py-4 md:grid-cols-2">
          <AnimatedField delay={d(0)}>
            <div>
              <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-foreground">
                Category <span className="text-danger">*</span>
              </label>
              <SelectFocusRing className="rounded-lg">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </SelectFocusRing>
            </div>
          </AnimatedField>

          <AnimatedField delay={d(1)}>
            <div>
              <label htmlFor="projectId" className="mb-1.5 block text-sm font-medium text-foreground">
                Project context <span className="text-muted-foreground">(optional)</span>
              </label>
              <SelectFocusRing className="rounded-lg">
                <select
                  id="projectId"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className={selectClass}
                >
                  <option value="">No specific project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </SelectFocusRing>
            </div>
          </AnimatedField>
        </div>
      </section>

      <AnimatedField delay={d(2)}>
        <section className="rounded-xl border border-border/60 bg-card px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Overall experience rating <span className="text-danger">*</span>
            </label>
            <span className="text-xs text-muted-foreground">1 = rough, 5 = excellent</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((value) => {
              const active = rating === value;
              const cls = `h-10 w-10 rounded-full border text-sm font-semibold transition-colors ${
                active
                  ? "border-interview-brand/60 bg-interview-brand-tint text-interview-brand"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`;
              if (motionOn) {
                return (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={cls}
                    aria-pressed={active}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: 0.18, ease: KROWE_EASE }}
                  >
                    {value}
                  </motion.button>
                );
              }
              return (
                <button key={value} type="button" onClick={() => setRating(value)} className={cls} aria-pressed={active}>
                  {value}
                </button>
              );
            })}
          </div>
        </section>
      </AnimatedField>

      <AnimatedField delay={d(3)}>
      <section className="rounded-xl border border-border/60 bg-card px-4 py-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Specific Questions
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="whatHappened" className="mb-1.5 block text-sm font-medium text-foreground">
              What happened? <span className="text-danger">*</span>
            </label>
            <textarea
              id="whatHappened"
              value={whatHappened}
              onChange={(e) => setWhatHappened(e.target.value)}
              rows={3}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-interview-brand/25"
              placeholder="Describe the exact workflow moment and what you saw."
            />
          </div>

          <div>
            <label htmlFor="expectedOutcome" className="mb-1.5 block text-sm font-medium text-foreground">
              What did you expect instead? <span className="text-danger">*</span>
            </label>
            <textarea
              id="expectedOutcome"
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              rows={3}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-interview-brand/25"
              placeholder="Share the result or behavior you wanted."
            />
          </div>

          <div>
            <label htmlFor="businessImpact" className="mb-1.5 block text-sm font-medium text-foreground">
              Business impact <span className="text-danger">*</span>
            </label>
            <textarea
              id="businessImpact"
              value={businessImpact}
              onChange={(e) => setBusinessImpact(e.target.value)}
              rows={3}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-interview-brand/25"
              placeholder="How does this affect your decision speed, confidence, or team workflow?"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="frequency" className="mb-1.5 block text-sm font-medium text-foreground">
                How often does this happen? <span className="text-danger">*</span>
              </label>
              <SelectFocusRing className="rounded-lg">
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as Frequency)}
                  required
                  className={selectClass}
                >
                  <option value="">Select frequency</option>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </SelectFocusRing>
            </div>

            <div>
              <label htmlFor="wouldRecommend" className="mb-1.5 block text-sm font-medium text-foreground">
                Would you recommend Krowe today? <span className="text-danger">*</span>
              </label>
              <SelectFocusRing className="rounded-lg">
                <select
                  id="wouldRecommend"
                  value={wouldRecommend}
                  onChange={(e) => setWouldRecommend(e.target.value as RecommendAnswer)}
                  required
                  className={selectClass}
                >
                  <option value="">Select answer</option>
                  {RECOMMEND_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </SelectFocusRing>
            </div>
          </div>
        </div>
      </section>
      </AnimatedField>

      <AnimatedField delay={d(4)}>
      <section className="rounded-xl border border-border/60 bg-card px-4 py-4">
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
          Additional notes for the team <span className="text-danger">*</span>
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-interview-brand/25"
          placeholder="Anything else we should know?"
        />
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Minimum 20 characters required</span>
          <span className={messageLength >= 20 ? "text-interview-brand" : "text-muted-foreground"}>
            {messageLength}/20+
          </span>
        </div>
      </section>
      </AnimatedField>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}
      {warning && (
        <div className="rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-sm text-foreground">
          {warning}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {success}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="rounded-full bg-gradient-to-br from-interview-brand to-interview-brand-end px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:opacity-50"
        >
          {loading ? "Submitting feedback..." : "Submit feedback"}
        </button>
        <p className="text-xs text-muted-foreground">
          Submission is stored in Supabase first, then routed to Retool email automation.
        </p>
      </div>
    </form>
  );
}
