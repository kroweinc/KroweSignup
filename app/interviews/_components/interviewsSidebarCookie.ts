/** HttpOnly=false cookie so the server can render the correct initial rail width (avoids expand→collapse flash on navigation). */
export const INTERVIEWS_SIDEBAR_RAIL_COOKIE = "krowe_interviews_sidebar_rail";

export function serializeInterviewSidebarRailCookie(collapsed: boolean): string {
  const v = collapsed ? "1" : "0";
  return `${INTERVIEWS_SIDEBAR_RAIL_COOKIE}=${v}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
