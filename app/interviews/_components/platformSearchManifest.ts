import type { SidebarNavKey } from "./interviewsSidebarTypes";

export type PlatformManifestSection = "platform" | "workspace";

export type PlatformNavManifestEntry = {
  /** Stable id for command palette / motion keys */
  id: string;
  /** Primary nav key; sidebar active state uses `activeNavKeys` when set. */
  navKey: SidebarNavKey;
  /** Treat as active when `activeNav` matches any of these (default: `[navKey]`). */
  activeNavKeys?: SidebarNavKey[];
  label: string;
  /** Material Symbols ligature name */
  icon: string;
  keywords?: string[];
  section: PlatformManifestSection;
  /** Returns `null` when the link should not appear (e.g. workspace without project). */
  resolveHref: (ctx: { projectId: string | null }) => string | null;
};

const platformEntries: PlatformNavManifestEntry[] = [
  {
    id: "nav:overview",
    navKey: "intel",
    label: "Overview",
    icon: "dashboard",
    keywords: ["home", "dashboard", "intel"],
    section: "platform",
    resolveHref: () => "/interviews",
  },
  {
    id: "nav:projects",
    navKey: "projects",
    label: "Projects",
    icon: "workspaces",
    keywords: ["ideas", "workspace list"],
    section: "platform",
    resolveHref: () => "/interviews/projects",
  },
  {
    id: "nav:imports",
    navKey: "imports",
    label: "Imports",
    icon: "cloud_upload",
    keywords: ["upload", "import"],
    section: "platform",
    resolveHref: () => "/interviews/imports",
  },
  {
    id: "nav:usage",
    navKey: "usage",
    label: "Usage",
    icon: "insights",
    keywords: ["analytics", "metrics", "billing"],
    section: "platform",
    resolveHref: () => "/interviews/usage?range=24h",
  },
  {
    id: "nav:logs",
    navKey: "logs",
    label: "Logs",
    icon: "inventory_2",
    keywords: ["history", "debug"],
    section: "platform",
    resolveHref: () => "/interviews/logs",
  },
  {
    id: "nav:feedback",
    navKey: "feedback",
    label: "Feedback",
    icon: "feedback",
    keywords: ["support", "report"],
    section: "platform",
    resolveHref: () => "/interviews/feedback",
  },
];

const workspaceEntries: PlatformNavManifestEntry[] = [
  {
    id: "nav:workspace-interviews",
    navKey: "workspace",
    activeNavKeys: ["workspace", "interview"],
    label: "Interviews",
    icon: "forum",
    keywords: ["project", "conversations"],
    section: "workspace",
    resolveHref: ({ projectId }) => (projectId ? `/interviews/${projectId}` : null),
  },
  {
    id: "nav:workspace-script",
    navKey: "script",
    label: "Interview Script",
    icon: "description",
    keywords: ["script", "questions"],
    section: "workspace",
    resolveHref: ({ projectId }) => (projectId ? `/interviews/${projectId}/script` : null),
  },
  {
    id: "nav:workspace-business-profile",
    navKey: "businessProfile",
    label: "Business Profile",
    icon: "apartment",
    keywords: ["company", "profile", "onboarding"],
    section: "workspace",
    resolveHref: ({ projectId }) => (projectId ? `/interviews/${projectId}/business-profile` : null),
  },
  {
    id: "nav:workspace-decision",
    navKey: "decision",
    label: "Decision",
    icon: "analytics",
    keywords: ["verdict", "report", "output"],
    section: "workspace",
    resolveHref: ({ projectId }) => (projectId ? `/interviews/${projectId}/decision` : null),
  },
  {
    id: "nav:workspace-add-interview",
    navKey: "addInterview",
    label: "Add interview",
    icon: "add_circle",
    keywords: ["new interview", "create"],
    section: "workspace",
    resolveHref: ({ projectId }) => (projectId ? `/interviews/${projectId}/add` : null),
  },
];

export const accountNavEntry: PlatformNavManifestEntry = {
  id: "nav:account",
  navKey: "account",
  label: "Account",
  icon: "id_card",
  keywords: ["settings", "profile", "user", "email", "password"],
  section: "platform",
  resolveHref: () => "/interviews/account",
};

/** All routable sidebar items except account (rendered in footer block). */
export const platformNavManifest: PlatformNavManifestEntry[] = [...platformEntries, ...workspaceEntries];

export function getManifestEntriesForSidebar(projectId: string | null): {
  platform: PlatformNavManifestEntry[];
  workspace: PlatformNavManifestEntry[];
  account: PlatformNavManifestEntry;
} {
  const ctx = { projectId };
  return {
    platform: platformEntries,
    workspace: workspaceEntries.filter((e) => e.resolveHref(ctx) !== null),
    account: accountNavEntry,
  };
}

/** Row shape for command palette + search (excludes dynamic projects). */
export type CommandPaletteNavRow = {
  id: string;
  group: "platform" | "workspace";
  label: string;
  subtitle?: string;
  href: string;
  icon: string;
  keywords?: string[];
};

/** Nav destinations for the palette: platform (incl. account), then workspace when `projectId` is set. */
export function getCommandPaletteNavRows(ctx: { projectId: string | null }): CommandPaletteNavRow[] {
  const rows: CommandPaletteNavRow[] = [];
  for (const e of platformEntries) {
    const href = e.resolveHref(ctx);
    if (!href) continue;
    rows.push({
      id: e.id,
      group: "platform",
      label: e.label,
      href,
      icon: e.icon,
      keywords: e.keywords,
    });
  }
  const accountHref = accountNavEntry.resolveHref(ctx);
  if (accountHref) {
    rows.push({
      id: accountNavEntry.id,
      group: "platform",
      label: accountNavEntry.label,
      href: accountHref,
      icon: accountNavEntry.icon,
      keywords: accountNavEntry.keywords,
    });
  }
  for (const e of workspaceEntries) {
    const href = e.resolveHref(ctx);
    if (!href) continue;
    rows.push({
      id: e.id,
      group: "workspace",
      label: e.label,
      href,
      icon: e.icon,
      keywords: e.keywords,
    });
  }
  return rows;
}
