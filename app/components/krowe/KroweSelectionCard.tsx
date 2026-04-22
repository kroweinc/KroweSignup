"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { useMouseTilt } from "@/lib/useMouseTilt";

export type KroweSelectionCardProps = {
  title: string;
  description: string;
  illustration?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function KroweSelectionCard({
  title,
  description,
  illustration,
  selected = false,
  disabled = false,
  onClick,
}: KroweSelectionCardProps) {
  const { ref, style: tiltStyle, onMouseMove, onMouseLeave } = useMouseTilt(2);
  const [showRing, setShowRing] = useState(false);
  const [prevSelected, setPrevSelected] = useState(selected);

  useEffect(() => {
    if (selected && !prevSelected) {
      setShowRing(true);
      const t = setTimeout(() => setShowRing(false), 400);
      return () => clearTimeout(t);
    }
    setPrevSelected(selected);
  }, [selected, prevSelected]);

  return (
    <div
      ref={ref}
      onMouseMove={disabled ? undefined : onMouseMove}
      onMouseLeave={disabled ? undefined : onMouseLeave}
      className="relative font-sans"
      style={tiltStyle}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={[
          "relative block w-full overflow-hidden rounded-[var(--radius-lg)] border-2 p-6 text-left transition-[border-color,background,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-out-smooth)]",
          selected
            ? "border-primary/50 bg-primary-soft shadow-[var(--shadow-2)]"
            : "border-border bg-card shadow-[var(--shadow-1)]",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary/30",
        ].join(" ")}
      >
        {showRing ? <SelectionRing /> : null}

        {selected ? (
          <span className="absolute right-4 top-4 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-primary text-primary-foreground animate-[fade-up-in_200ms_var(--ease-spring)_forwards]">
            <Check size={14} strokeWidth={3} aria-hidden />
          </span>
        ) : null}

        {illustration ? (
          <div
            className={[
              "mb-5 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)]",
              selected ? "text-primary" : "text-muted-foreground",
            ].join(" ")}
          >
            {illustration}
          </div>
        ) : null}

        <h3
          className={[
            "mb-1.5 text-base font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)]",
            selected ? "text-primary" : "text-foreground",
          ].join(" ")}
        >
          {title}
        </h3>
        <p className="m-0 text-sm leading-snug text-muted-foreground">{description}</p>
      </button>
    </div>
  );
}

function SelectionRing() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      preserveAspectRatio="none"
      aria-hidden
    >
      <rect
        x="1"
        y="1"
        width="calc(100% - 2px)"
        height="calc(100% - 2px)"
        rx="14"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset="1"
        style={{
          animation: "ring-draw-krowe 320ms var(--ease-out-smooth) forwards",
        }}
      />
    </svg>
  );
}
