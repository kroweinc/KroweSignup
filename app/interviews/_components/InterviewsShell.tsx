import type { ReactNode } from "react";
import { PageEntrance } from "@/app/components/motion/PageEntrance";
import InterviewsSidebar from "./InterviewsSidebar";
import { PlatformCommandPalette } from "./PlatformCommandPalette";
import type { SidebarNavKey } from "./interviewsSidebarTypes";

export type { SidebarNavKey };

type Props = {
  activeNav?: SidebarNavKey;
  children: ReactNode;
  /** Route segment project id — enables “All projects” and keeps workspace links scoped to this project. */
  projectId?: string;
  noPadding?: boolean;
  /** Skip route entrance (e.g. overview home already animates its own content). */
  skipEntrance?: boolean;
};

export default function InterviewsShell({
  activeNav,
  children,
  projectId,
  noPadding,
  skipEntrance,
}: Props) {
  const main = skipEntrance ? (
    children
  ) : (
    <PageEntrance className="flex min-h-0 min-w-0 w-full flex-1 flex-col">{children}</PageEntrance>
  );

  return (
    <div className="min-h-screen min-w-0 max-w-[100vw] bg-background text-foreground">
      <PlatformCommandPalette shellProjectId={projectId} />
      <main className="w-full min-w-0 max-w-full p-0">
        <div className="min-w-0 max-w-full border border-border/70 bg-card shadow-[var(--shadow-1)] shadow-soft">
          <div className="grid min-h-screen min-w-0 w-full max-w-full md:grid-cols-[auto_minmax(0,1fr)]">
            <InterviewsSidebar activeNav={activeNav} projectId={projectId} />
            <section
              className={`flex min-h-0 min-w-0 w-full max-w-full flex-col overflow-x-clip ${noPadding ? "p-0" : "p-3 sm:p-4"}`}
            >
              {main}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
