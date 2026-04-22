/** Second path segment under `/interviews` that is not a project id. */
const INTERVIEWS_STATIC_SEGMENTS = new Set([
  "projects",
  "account",
  "new",
  "imports",
  "usage",
  "logs",
  "feedback",
]);

/**
 * If the URL is a project-scoped interviews route, returns the project id from the pathname.
 * Returns `null` for list pages like `/interviews/projects`.
 */
export function parseInterviewsProjectIdFromPathname(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "interviews") return null;
  const seg = parts[1];
  if (!seg || INTERVIEWS_STATIC_SEGMENTS.has(seg)) return null;
  return seg;
}
