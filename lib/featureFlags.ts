function readBooleanEnv(name: string): boolean | undefined {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return undefined;
  if (value === "1" || value === "true" || value === "yes" || value === "on")
    return true;
  if (value === "0" || value === "false" || value === "no" || value === "off")
    return false;
  return undefined;
}

const granolaImports =
  readBooleanEnv("ENABLE_GRANOLA_IMPORTS") ??
  readBooleanEnv("NEXT_PUBLIC_ENABLE_GRANOLA_IMPORTS") ??
  true;

export const FEATURE_FLAGS = {
  granolaImports,
} as const;

export function ensureGranolaImportsEnabled(): void {
  if (!FEATURE_FLAGS.granolaImports) {
    throw new Error("Granola imports feature is disabled");
  }
}
