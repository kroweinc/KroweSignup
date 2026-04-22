/**
 * Ember motif from kroweDesign — concentric accent glyph for inbox / empty states.
 */

type EmberGlyphProps = {
  size?: number;
  /** Subtle pulse (respects reduced motion in globals). */
  animated?: boolean;
  className?: string;
};

export function EmberGlyph({ size = 16, animated = false, className = "" }: EmberGlyphProps) {
  const breatheStyle = animated
    ? {
        animation: "breathe-ember 3.5s ease-in-out infinite",
        transformOrigin: "8px 8px" as const,
      }
    : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ember-breathe shrink-0 overflow-visible ${className}`}
      aria-hidden
    >
      <circle cx="8" cy="8" r="6" fill="var(--primary)" opacity="0.12" />
      <circle
        cx="8"
        cy="8"
        r="4"
        fill="var(--primary)"
        opacity="0.35"
        data-breathe={animated ? "" : undefined}
        style={breatheStyle}
      />
      <circle cx="8" cy="8" r="2.5" fill="var(--primary)" />
      <circle
        cx="9"
        cy="7"
        r="1"
        fill="var(--primary-accent)"
        data-breathe={animated ? "" : undefined}
        style={
          animated
            ? { ...breatheStyle, animationDelay: "0.4s" }
            : undefined
        }
      />
    </svg>
  );
}
