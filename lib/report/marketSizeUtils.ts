export function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function extractResponseText(response: unknown): string {
  const candidate = response as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ text?: unknown }> }>;
  };

  if (typeof candidate?.output_text === "string" && candidate.output_text.trim()) {
    return candidate.output_text.trim();
  }

  const out = candidate?.output;
  if (Array.isArray(out)) {
    for (const item of out) {
      const content = item?.content;
      if (!Array.isArray(content)) continue;

      for (const c of content) {
        const t = c?.text;
        if (typeof t === "string" && t.trim()) {
          return t.trim();
        }
      }
    }
  }

  return "";
}
