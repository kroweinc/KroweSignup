"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { KroweButton } from "@/app/components/krowe/KroweButton";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import { ProjectStatusPill } from "@/app/components/krowe/ProjectStatusPill";
import { KROWE_EASE } from "@/lib/motion/kroweEase";
import type { DashboardProject } from "./types";

export type { DashboardProject };

type Props = {
  initialProjects: DashboardProject[];
  isAdmin?: boolean;
  /** Staggered row entrance delay base (seconds), e.g. from Projects page queue title timing. */
  listEntranceDelayBase?: number;
};

export function ProjectsManagerClient({ initialProjects, isAdmin = false, listEntranceDelayBase }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const rowMotionDelay =
    !reduceMotion && listEntranceDelayBase !== undefined
      ? (index: number) => listEntranceDelayBase + 0.04 + index * 0.028
      : () => undefined;
  const [projects, setProjects] = useState<DashboardProject[]>(initialProjects);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveRename(projectId: string) {
    setError(null);
    const nextName = editName.trim();
    if (!nextName) {
      setError("Project name cannot be empty.");
      return;
    }

    setBusyId(projectId);
    try {
      const res = await fetch(`/api/interviews/project/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to rename project.");
      }

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? { ...project, name: data.project?.name ?? nextName } : project,
        ),
      );
      setEditingId(null);
      setEditName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename project.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteProject(projectId: string) {
    setError(null);
    const confirmed = window.confirm(
      "Permanently delete this project? This cannot be undone and will remove all interviews and data."
    );
    if (!confirmed) return;

    setBusyId(projectId);
    try {
      const res = await fetch(`/api/interviews/project/${projectId}?permanent=true`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to delete project.");
      }

      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project.");
    } finally {
      setBusyId(null);
    }
  }

  async function archiveProject(projectId: string) {
    setError(null);
    const confirmed = window.confirm(
      "Archive this project? You can no longer access it from the main dashboard."
    );
    if (!confirmed) return;

    setBusyId(projectId);
    try {
      const res = await fetch(`/api/interviews/project/${projectId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to archive project.");
      }

      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive project.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-[var(--radius-lg,16px)] border border-border/80 bg-card shadow-[var(--shadow-1)]">
      {error ? (
        <div className="border-b border-border/60 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <p className="max-w-sm text-sm text-muted-foreground">
            No active projects yet. Create a workspace to capture interviews and run analysis.
          </p>
          {(isAdmin || projects.length === 0) && (
            <KroweLinkButton href="/interviews/new" variant="primary">
              New project
            </KroweLinkButton>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface-subtle">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Project
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Interviews
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <ProjectRowDesktop
                    key={project.id}
                    project={project}
                    rowMotionDelay={rowMotionDelay(index)}
                    editingId={editingId}
                    editName={editName}
                    setEditName={setEditName}
                    busyId={busyId}
                    isAdmin={isAdmin}
                    setEditingId={setEditingId}
                    saveRename={saveRename}
                    archiveProject={archiveProject}
                    deleteProject={deleteProject}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-border/60 md:hidden">
            {projects.map((project, index) => (
              <ProjectCardMobile
                key={project.id}
                project={project}
                rowMotionDelay={rowMotionDelay(index)}
                editingId={editingId}
                editName={editName}
                setEditName={setEditName}
                busyId={busyId}
                isAdmin={isAdmin}
                setEditingId={setEditingId}
                saveRename={saveRename}
                archiveProject={archiveProject}
                deleteProject={deleteProject}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

type RowProps = {
  project: DashboardProject;
  rowMotionDelay?: number;
  editingId: string | null;
  editName: string;
  setEditName: (v: string) => void;
  busyId: string | null;
  isAdmin: boolean;
  setEditingId: (id: string | null) => void;
  saveRename: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
};

function ProjectRowDesktop({
  project,
  rowMotionDelay,
  editingId,
  editName,
  setEditName,
  busyId,
  isAdmin,
  setEditingId,
  saveRename,
  archiveProject,
  deleteProject,
}: RowProps) {
  const isEditing = editingId === project.id;
  const isBusy = busyId === project.id;

  const rowClassName = "border-b border-border/60 transition-colors last:border-b-0 hover:bg-surface-subtle/80";

  const cells = (
    <>
      <td className="max-w-[min(280px,40vw)] px-4 py-4 align-middle">
        {isEditing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/35"
            placeholder="Project name"
          />
        ) : (
          <span className="block truncate font-semibold text-foreground">{project.name}</span>
        )}
      </td>
      <td className="px-4 py-4 align-middle">
        <ProjectStatusPill status={project.status} />
      </td>
      <td className="whitespace-nowrap px-4 py-4 align-middle text-sm tabular-nums text-muted-foreground">
        {project.interview_count}
      </td>
      <td className="whitespace-nowrap px-4 py-4 align-middle text-sm text-muted-foreground">
        {new Date(project.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-4 align-middle">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href={`/interviews/${project.id}`}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50"
          >
            Open
          </Link>
          {isEditing ? (
            <>
              <KroweButton size="sm" loading={isBusy} onClick={() => void saveRename(project.id)}>
                Save
              </KroweButton>
              <KroweButton
                size="sm"
                variant="secondary"
                disabled={isBusy}
                onClick={() => {
                  setEditingId(null);
                  setEditName("");
                }}
              >
                Cancel
              </KroweButton>
            </>
          ) : (
            <KroweButton
              size="sm"
              variant="ghost"
              disabled={isBusy}
              onClick={() => {
                setEditingId(project.id);
                setEditName(project.name);
              }}
            >
              Rename
            </KroweButton>
          )}
          <KroweButton
            size="sm"
            variant="ghost"
            disabled={isBusy}
            className="border border-danger/40 text-danger hover:bg-danger-soft"
            onClick={() => void archiveProject(project.id)}
          >
            {isBusy ? "..." : "Archive"}
          </KroweButton>
          {isAdmin ? (
            <KroweButton
              size="sm"
              variant="destructive"
              disabled={isBusy}
              onClick={() => void deleteProject(project.id)}
            >
              {isBusy ? "..." : "Delete"}
            </KroweButton>
          ) : null}
        </div>
      </td>
    </>
  );

  if (rowMotionDelay !== undefined) {
    return (
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rowMotionDelay, duration: 0.22, ease: KROWE_EASE }}
        className={rowClassName}
      >
        {cells}
      </motion.tr>
    );
  }

  return <tr className={rowClassName}>{cells}</tr>;
}

function ProjectCardMobile({
  project,
  rowMotionDelay,
  editingId,
  editName,
  setEditName,
  busyId,
  isAdmin,
  setEditingId,
  saveRename,
  archiveProject,
  deleteProject,
}: RowProps) {
  const isEditing = editingId === project.id;
  const isBusy = busyId === project.id;

  const inner = (
    <div className="space-y-3 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mb-2 w-full rounded-[10px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/35"
              placeholder="Project name"
            />
          ) : (
            <p className="truncate font-semibold text-foreground">{project.name}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ProjectStatusPill status={project.status} />
            <span className="text-xs text-muted-foreground">
              {project.interview_count} interviews · {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/interviews/${project.id}`}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50"
        >
          Open
        </Link>
        {isEditing ? (
          <>
            <KroweButton size="sm" loading={isBusy} onClick={() => void saveRename(project.id)}>
              Save
            </KroweButton>
            <KroweButton
              size="sm"
              variant="secondary"
              disabled={isBusy}
              onClick={() => {
                setEditingId(null);
                setEditName("");
              }}
            >
              Cancel
            </KroweButton>
          </>
        ) : (
          <KroweButton
            size="sm"
            variant="ghost"
            disabled={isBusy}
            onClick={() => {
              setEditingId(project.id);
              setEditName(project.name);
            }}
          >
            Rename
          </KroweButton>
        )}
        <KroweButton
          size="sm"
          variant="ghost"
          disabled={isBusy}
          className="border border-danger/40 text-danger hover:bg-danger-soft"
          onClick={() => void archiveProject(project.id)}
        >
          {isBusy ? "..." : "Archive"}
        </KroweButton>
        {isAdmin ? (
          <KroweButton
            size="sm"
            variant="destructive"
            disabled={isBusy}
            onClick={() => void deleteProject(project.id)}
          >
            {isBusy ? "..." : "Delete"}
          </KroweButton>
        ) : null}
      </div>
    </div>
  );

  if (rowMotionDelay !== undefined) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rowMotionDelay, duration: 0.22, ease: KROWE_EASE }}
      >
        {inner}
      </motion.div>
    );
  }

  return inner;
}
