"use client";

import type { FormEvent } from "react";
import { KroweButton } from "@/app/components/krowe/KroweButton";
import { EmberGlyph } from "@/app/components/krowe/EmberGlyph";

type Connection = {
  id: string;
  status: "active" | "invalid" | "disabled";
  key_hint: string | null;
  last_sync_completed_at: string | null;
  last_error: string | null;
} | null;

type Props = {
  connection: Connection;
  isConnected: boolean;
  apiKey: string;
  setApiKey: (v: string) => void;
  onConnect: (e: FormEvent) => void;
  connectBusy: boolean;
  onDisconnect: () => void;
  disconnectBusy: boolean;
};

export function ImportsBentoHub({
  connection,
  isConnected,
  apiKey,
  setApiKey,
  onConnect,
  connectBusy,
  onDisconnect,
  disconnectBusy,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="noise-surface relative overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-gradient-to-br from-primary-soft/80 via-card to-card shadow-[var(--shadow-2)] lg:min-h-[340px]">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary/60 via-primary/25 to-transparent"
          aria-hidden
        />
        <div className="relative z-[2] flex h-full flex-col p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <EmberGlyph size={28} animated />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Integration hub
                </p>
                <h2 className="krowe-display-m mt-1 text-xl sm:text-2xl">Granola bridge</h2>
              </div>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                isConnected
                  ? "border-success/35 bg-success-soft text-success"
                  : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            API notes land in your inbox here—assign each transcript to a project so synthesis and decisions stay
            scoped.
          </p>

          {!connection || connection.status !== "active" ? (
            <form onSubmit={onConnect} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label htmlFor="granola-api-key-bento" className="mb-1.5 block text-xs font-medium text-foreground">
                  API key
                </label>
                <input
                  id="granola-api-key-bento"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="grn_..."
                  autoComplete="off"
                  className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                />
              </div>
              <KroweButton type="submit" loading={connectBusy} disabled={connectBusy}>
                Connect
              </KroweButton>
            </form>
          ) : (
            <div className="mt-8 flex flex-1 flex-col justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Key <span className="text-primary">{connection.key_hint ?? "saved"}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last sync:{" "}
                  {connection.last_sync_completed_at
                    ? new Date(connection.last_sync_completed_at).toLocaleString()
                    : "Not yet synced"}
                </p>
                {connection.last_error ? (
                  <p className="mt-3 rounded-[10px] border border-danger/40 bg-danger-soft px-3 py-2 text-xs text-danger">
                    {connection.last_error}
                  </p>
                ) : null}
              </div>
              <div className="flex justify-end">
                <KroweButton variant="secondary" loading={disconnectBusy} disabled={disconnectBusy} onClick={onDisconnect}>
                  Disconnect
                </KroweButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
