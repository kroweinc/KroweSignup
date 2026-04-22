"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "motion/react";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import { KroweButton } from "@/app/components/krowe/KroweButton";
import { KROWE_EASE } from "@/lib/motion/kroweEase";
import { ImportsBentoHub } from "./_components/ImportsBentoHub";
import { ImportsInboxStudio, type StudioItem } from "./_components/ImportsInboxStudio";
import { ImportsPageClient } from "./ImportsPageClient";

type Project = {
  id: string;
  name: string;
  status: string;
};

type InboxItem = {
  id: string;
  external_note_id: string;
  title: string | null;
  transcript_preview: string;
  summary_text: string | null;
  owner_name: string | null;
  owner_email: string | null;
  granola_created_at: string | null;
  granola_updated_at: string;
  attendees: Array<{ name: string | null; email: string }>;
  normalized_text: string;
};

type Connection = {
  id: string;
  status: "active" | "invalid" | "disabled";
  key_hint: string | null;
  last_sync_completed_at: string | null;
  last_error: string | null;
} | null;

type Props = {
  initialItems: InboxItem[];
  projects: Project[];
  initialConnection: Connection;
};

type SyncResult = {
  scanned: number;
  upserted: number;
  skipped: number;
  fullResync: boolean;
};

export function ImportsClient({ initialItems, projects, initialConnection }: Props) {
  const [connection, setConnection] = useState<Connection>(initialConnection);
  const [items, setItems] = useState<InboxItem[]>(initialItems);
  const [query, setQuery] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => {
      const content = `${item.title ?? ""} ${item.summary_text ?? ""} ${item.transcript_preview}`.toLowerCase();
      return content.includes(term);
    });
  }, [items, query]);

  const studioItems: StudioItem[] = useMemo(
    () =>
      filteredItems.map((item) => ({
        id: item.id,
        title: item.title,
        transcript_preview: item.transcript_preview,
        summary_text: item.summary_text,
        owner_name: item.owner_name,
        owner_email: item.owner_email,
        granola_updated_at: item.granola_updated_at,
        normalized_text: item.normalized_text,
      })),
    [filteredItems],
  );

  const isConnected = connection?.status === "active";

  const lastSyncLabel = connection?.last_sync_completed_at
    ? new Date(connection.last_sync_completed_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  const statCards = useMemo(
    () => [
      {
        label: "Pending",
        value: items.length,
        hint: "Notes waiting for a project",
      },
      {
        label: "Targets",
        value: projects.length,
        hint:
          projects.length > 0 ? "Projects you can assign to" : "Create a project first",
      },
      {
        label: "Bridge",
        value: isConnected ? "Live" : "Offline",
        hint: isConnected ? "Granola API connected" : "Connect to sync notes",
      },
      {
        label: "Last sync",
        value: lastSyncLabel,
        hint: "Granola → Krowe inbox",
      },
    ],
    [items.length, projects.length, isConnected, lastSyncLabel],
  );

  const readinessPct = useMemo(() => {
    if (!isConnected) return Math.min(28, 12 + projects.length * 2);
    if (items.length === 0) return 100;
    return Math.max(12, Math.min(94, 100 - items.length * 14));
  }, [isConnected, items.length, projects.length]);

  const queueCaption = useMemo(() => {
    const n = items.length;
    if (!isConnected) {
      return "Connect Granola to pull assignable notes into this inbox.";
    }
    if (n === 0) {
      return "Inbox clear — new notes appear after the next sync.";
    }
    return `${n} unassigned note${n !== 1 ? "s" : ""} awaiting assignment.`;
  }, [items.length, isConnected]);

  async function connectGranola(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!apiKey.trim()) {
      setError("API key is required");
      return;
    }
    setBusy("connect");
    try {
      const res = await fetch("/api/integrations/granola/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to connect Granola");
        return;
      }
      setApiKey("");
      await refreshConnection();
    } finally {
      setBusy(null);
    }
  }

  async function refreshConnection() {
    const res = await fetch("/api/integrations/granola/connection", { cache: "no-store" });
    const data = await res.json();
    setConnection(data.connection ?? null);
  }

  async function syncNow() {
    setError(null);
    setSyncResult(null);
    setBusy("sync");
    try {
      const res = await fetch("/api/integrations/granola/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullResync: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sync failed");
        return;
      }
      setSyncResult({
        scanned: Number(data.scanned ?? 0),
        upserted: Number(data.upserted ?? 0),
        skipped: Number(data.skipped ?? 0),
        fullResync: Boolean(data.fullResync),
      });
      await Promise.all([refreshConnection(), refreshItems()]);
    } finally {
      setBusy(null);
    }
  }

  async function refreshItems() {
    const res = await fetch("/api/interviews/imports?status=unassigned", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setItems(data.items ?? []);
  }

  async function disconnect() {
    setError(null);
    setBusy("disconnect");
    try {
      const res = await fetch("/api/integrations/granola/connection", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Disconnect failed");
        return;
      }
      setConnection((prev) => (prev ? { ...prev, status: "disabled" } : prev));
    } finally {
      setBusy(null);
    }
  }

  async function assign(itemId: string, projectId: string) {
    setError(null);
    setBusy(itemId);
    try {
      const res = await fetch(`/api/interviews/imports/${itemId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Assignment failed");
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } finally {
      setBusy(null);
    }
  }

  const headerActions = (
    <>
      <KroweLinkButton href="/interviews" variant="secondary">
        Back to Home
      </KroweLinkButton>
      {isConnected && (
        <KroweButton size="sm" loading={busy === "sync"} disabled={busy === "sync"} onClick={() => void syncNow()}>
          Full resync
        </KroweButton>
      )}
    </>
  );

  return (
    <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
      <ImportsPageClient
        breadcrumbs={[
          { label: "Interviews", href: "/interviews" },
          { label: "Imports" },
        ]}
        title="Granola imports"
        description="Sync notes from Granola, triage in the inbox studio, and route each transcript into a project."
        headerActions={headerActions}
        statCards={statCards}
        readinessPct={readinessPct}
        queueCaption={queueCaption}
      >
        {(timing) => (
          <div className="space-y-8">
            {timing.enableEntrance ? (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: timing.integrationHubDelay, duration: 0.26, ease: KROWE_EASE }}
              >
                <ImportsBentoHub
                  connection={connection}
                  isConnected={isConnected}
                  apiKey={apiKey}
                  setApiKey={setApiKey}
                  onConnect={connectGranola}
                  connectBusy={busy === "connect"}
                  onDisconnect={() => void disconnect()}
                  disconnectBusy={busy === "disconnect"}
                />
              </motion.div>
            ) : (
              <ImportsBentoHub
                connection={connection}
                isConnected={isConnected}
                apiKey={apiKey}
                setApiKey={setApiKey}
                onConnect={connectGranola}
                connectBusy={busy === "connect"}
                onDisconnect={() => void disconnect()}
                disconnectBusy={busy === "disconnect"}
              />
            )}

            {error ? (
              <div className="rounded-[var(--radius-lg)] border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger shadow-[var(--shadow-1)]">
                {error}
              </div>
            ) : null}

            {syncResult ? (
              <div className="rounded-[var(--radius-lg)] border border-border/80 bg-card px-4 py-4 text-sm text-foreground shadow-[var(--shadow-1)] sm:px-6">
                {syncResult.fullResync ? "Full resync complete" : "Sync complete"}: scanned {syncResult.scanned}, imported{" "}
                {syncResult.upserted}, skipped {syncResult.skipped}.
                {syncResult.scanned === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Granola returned no API-eligible notes for this key. Notes must have summaries/transcripts visible to the
                    API key owner.
                  </p>
                ) : null}
              </div>
            ) : null}

            {timing.enableEntrance ? (
              <motion.div
                id="imports-inbox"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: timing.queueTitleDelay, duration: 0.28, ease: KROWE_EASE }}
              >
                <ImportsInboxStudio
                  filteredItems={studioItems}
                  itemsTotal={items.length}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  query={query}
                  onQueryChange={setQuery}
                  projects={projects}
                  busyId={busy}
                  onAssign={assign}
                  railEntranceDelayBase={timing.queueTitleDelay}
                />
              </motion.div>
            ) : (
              <div id="imports-inbox">
                <ImportsInboxStudio
                  filteredItems={studioItems}
                  itemsTotal={items.length}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  query={query}
                  onQueryChange={setQuery}
                  projects={projects}
                  busyId={busy}
                  onAssign={assign}
                />
              </div>
            )}
          </div>
        )}
      </ImportsPageClient>
    </div>
  );
}
