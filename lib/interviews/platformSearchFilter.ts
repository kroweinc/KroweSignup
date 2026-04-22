export type PaletteRowGroup = "platform" | "workspace" | "projects";

export type PaletteRow = {
  id: string;
  group: PaletteRowGroup;
  label: string;
  subtitle?: string;
  href: string;
  icon: string;
  keywords?: string[];
};

export function paletteGroupOrder(group: PaletteRowGroup): number {
  return group === "platform" ? 0 : group === "workspace" ? 1 : 2;
}

/** Higher is a better match. Zero means no match. */
export function scorePaletteMatch(
  query: string,
  row: Pick<PaletteRow, "label" | "subtitle" | "href" | "keywords">,
): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const label = row.label.toLowerCase();
  const subtitle = (row.subtitle ?? "").toLowerCase();
  const href = row.href.toLowerCase();
  const kw = (row.keywords ?? []).join(" ").toLowerCase();
  let score = 0;
  if (label.startsWith(q)) score += 120;
  else if (label.includes(q)) score += 70;
  for (const word of q.split(/\s+/).filter(Boolean)) {
    if (word.length < 2) continue;
    if (label.includes(word)) score += 40;
    if (subtitle.includes(word)) score += 25;
    if (href.includes(word)) score += 15;
    if (kw.includes(word)) score += 20;
  }
  if (score === 0 && (subtitle.includes(q) || href.includes(q) || kw.includes(q))) {
    score = 10;
  }
  return score;
}

export function filterAndSortPaletteRows(query: string, rows: PaletteRow[], max = 50): PaletteRow[] {
  const q = query.trim().toLowerCase();
  let working = rows.map((row) => ({
    row,
    score: q ? scorePaletteMatch(q, row) : 1,
  }));

  if (q) {
    working = working.filter((w) => w.score > 0);
  }

  working.sort((a, b) => {
    const go = paletteGroupOrder(a.row.group) - paletteGroupOrder(b.row.group);
    if (go !== 0) return go;
    if (b.score !== a.score) return b.score - a.score;
    return a.row.label.localeCompare(b.row.label);
  });

  return working.slice(0, max).map((w) => w.row);
}
