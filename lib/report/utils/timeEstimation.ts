/**
 * Time to MVP estimation utilities
 */

/**
 * Estimate time to MVP based on product type, skills, hours, and team size
 */
export function estimateTimeToMvp(params: {
  productType: string | null;
  skillScore: number | null;
  hours: number | null;
  teamSize: number | null;
}) {
  const { productType, skillScore, hours, teamSize } = params;

  //Base Complexity
  const pt = (productType || "").toLowerCase();
  let baseWeeks = 12;
  if (pt.includes("web")) baseWeeks = 10;
  else if (pt.includes("mobile")) baseWeeks = 14;
  else if (pt.includes("both")) baseWeeks = 18;

  //skill factor: skill= 1 -> faster, skill = 0 -> slower
  const s = skillScore ?? 0.3; //safe fallback for MVP
  const skillFactor = 1.6 - s * 0.8; //skill 1 -> 0.8, skill 0 -> 1.6

  //hours factor
  const h = hours ?? 6;
  const hoursFactor = Math.max(0.6, Math.min(2.0, 20 / Math.max(1, h))); //more hours -> faster, capped between 0.6 and 2.0

  //team factor
  const t = teamSize ?? 1;
  const teamFactor = t > 1 ? 0.85 : 1.0; //small boost for teams

  const weeks = baseWeeks * skillFactor * hoursFactor * teamFactor;

  //range 20% up or down
  const low = Math.max(2, Math.round(weeks * 0.8));
  const high = Math.max(low + 1, Math.round(weeks * 1.2));

  const label =
    high >= 16
      ? `${Math.round(low / 4)}-${Math.round(high / 4)} months`
      : `${low}-${high} weeks`;

  const rationale = `Based on product type (${productType || "unknown"}), estimated skills, ${hours ? `${hours} hrs/week` : "unkown weekly hours"
    }, and team size (${teamSize ?? "unkown"}).`;

  return { lowWeeks: low, highWeeks: high, label, rationale };
}

/**
 * Estimate skill score from skills raw data
 */
export function estimateSkillScore(skillsRaw: string | null): number | null {
  if (!skillsRaw) return null;

  // skills might be JSON string like ["dev","marketing"]
  try {
    const parsed = JSON.parse(skillsRaw);
    if (Array.isArray(parsed)) {
      const set = new Set(parsed.map((s) => String(s).toLowerCase()));
      if (set.has("none")) return 0;
      let total = 0;
      let k = 0;
      if (set.has("dev")) { total += 0.6; k++; }
      if (set.has("marketing")) { total += 0.5; k++; }
      if (set.has("leadership")) { total += 0.4; k++; }
      if (k === 0 && set.has("other")) return 0.2;
      return k ? total / k : 0.2;
    }
  } catch {
    // ignore
  }

  // fallback: if it's plain text
  return 0.3;
}
