import { cookies } from "next/headers";
import { getUserPrimaryProjectId } from "@/lib/interviews/getUserPrimaryProjectId";
import { InterviewsSidebarClient } from "./InterviewsSidebarClient";
import { INTERVIEWS_SIDEBAR_RAIL_COOKIE } from "./interviewsSidebarCookie";
import type { SidebarNavKey } from "./interviewsSidebarTypes";

export default async function InterviewsSidebar({
  activeNav,
  projectId: routeProjectId,
}: {
  activeNav?: SidebarNavKey;
  projectId?: string;
}) {
  const primaryProjectId = await getUserPrimaryProjectId();
  const linkProjectId = routeProjectId ?? primaryProjectId;
  const inProjectRoute = Boolean(routeProjectId);

  const cookieStore = await cookies();
  const initialRailCollapsed = cookieStore.get(INTERVIEWS_SIDEBAR_RAIL_COOKIE)?.value === "1";

  return (
    <InterviewsSidebarClient
      activeNav={activeNav}
      routeProjectId={routeProjectId}
      linkProjectId={linkProjectId}
      inProjectRoute={inProjectRoute}
      initialRailCollapsed={initialRailCollapsed}
    />
  );
}
