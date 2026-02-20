export function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function extractResponseText(response: unknown): string {
  const candidate = response as {
    output_text?: unknown;
    output?: Array<{
      content?: Array<{ type?: string; text?: unknown }>;
      type?: string;
    }>;
  };

  // Primary: convenience property
  if (typeof candidate?.output_text === "string" && candidate.output_text.trim()) {
    return candidate.output_text.trim();
  }

  // Fallback: output[].content[] with .text
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

  // Fallback: output_text type in content (Responses API output_text format)
  if (Array.isArray(out)) {
    for (const item of out) {
      const content = item?.content;
      if (!Array.isArray(content)) continue;

      for (const c of content) {
        if (c?.type === "output_text" && typeof (c as { text?: unknown }).text === "string") {
          const t = (c as { text: string }).text.trim();
          if (t) return t;
        }
      }
    }
  }

  return "";
}
