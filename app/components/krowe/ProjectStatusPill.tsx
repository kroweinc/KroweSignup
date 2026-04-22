import type { DashboardProject } from "@/app/interviews/projects/types";

type Status = DashboardProject["status"];

const LABEL: Record<Status, string> = {
  collecting: "Collecting",
  processing: "Processing",
  ready: "Ready",
  failed: "Needs attention",
};

export function ProjectStatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    collecting:
      "border-primary/25 bg-primary-soft text-primary",
    processing:
      "border-warning/30 bg-warning-soft text-warning",
    ready: "border-success/30 bg-success-soft text-success",
    failed: "border-danger/35 bg-danger-soft text-danger",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {LABEL[status]}
    </span>
  );
}
