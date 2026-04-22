"use client";

import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

export type KroweButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { fontSize: "0.875rem", padding: "0.5rem 1rem", height: "32px" },
  md: { fontSize: "1rem", padding: "0.75rem 1.5rem", height: "40px" },
  lg: { fontSize: "1.125rem", padding: "1rem 2rem", height: "48px" },
};

export function KroweButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  children,
  className = "",
  style,
  ...props
}: KroweButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const variantStyles: Record<Variant, React.CSSProperties> = {
    primary: {
      background: disabled
        ? "var(--muted-foreground)"
        : "linear-gradient(135deg, var(--primary) 0%, var(--primary-accent) 100%)",
      color: "white",
      borderRadius: "9999px",
      transform:
        pressed && !disabled && !loading ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)",
      boxShadow:
        !disabled && !loading && !pressed ? "var(--shadow-4)" : "none",
    },
    secondary: {
      background: "var(--surface-subtle)",
      color: disabled ? "var(--muted-foreground)" : "var(--foreground)",
      border: "1px solid var(--border)",
      borderRadius: "9999px",
      transform: pressed && !disabled && !loading ? "scale(0.98)" : "scale(1)",
    },
    ghost: {
      background: "transparent",
      color: disabled ? "var(--muted-foreground)" : "var(--foreground)",
      borderRadius: "10px",
      transform: pressed && !disabled && !loading ? "scale(0.98)" : "scale(1)",
    },
    destructive: {
      background: disabled ? "var(--muted-foreground)" : "var(--danger)",
      color: "white",
      borderRadius: "9999px",
      transform:
        pressed && !disabled && !loading ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)",
    },
  };

  const hoverStyles: Record<Variant, React.CSSProperties> = {
    primary: {
      background:
        "linear-gradient(135deg, var(--primary-hover) 0%, color-mix(in srgb, var(--primary-accent) 88%, black) 100%)",
      transform: "translateY(-1px)",
      boxShadow: "var(--shadow-4)",
    },
    secondary: { background: "var(--background)", borderColor: "var(--primary)" },
    ghost: { background: "var(--surface-subtle)" },
    destructive: { background: "color-mix(in srgb, var(--danger) 88%, black)" },
  };

  const base: React.CSSProperties = {
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all var(--duration-fast) var(--ease-out-smooth)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    border: "none",
    outline: "none",
    position: "relative",
    overflow: "hidden",
    opacity: disabled ? 0.5 : 1,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(hovered && !disabled && !loading ? hoverStyles[variant] : {}),
    ...style,
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`touch-manipulation font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className ?? ""}`}
      style={base}
      type={props.type ?? "button"}
      onMouseDown={() => !disabled && !loading && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseEnter={() => !disabled && !loading && setHovered(true)}
      onMouseLeave={() => {
        setPressed(false);
        setHovered(false);
      }}
    >
      {variant === "primary" && !disabled && !loading && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 50%, transparent 100%)",
            transform: "translateX(-100%)",
            animation: hovered ? "shimmer-krowe 380ms var(--ease-out-smooth) forwards" : "none",
          }}
        />
      )}
      {loading ? (
        <OrbitSpinner />
      ) : (
        <>
          {icon ? <span className="flex items-center">{icon}</span> : null}
          {children}
        </>
      )}
    </button>
  );
}

function OrbitSpinner() {
  return (
    <span className="relative inline-flex h-[18px] w-[18px] items-center justify-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute rounded-full bg-current opacity-90"
          style={{
            width: "4px",
            height: "4px",
            transformOrigin: "0 0",
            animation: "orbit-krowe 900ms linear infinite",
            animationDelay: `${i * 300}ms`,
            transform: `rotate(${i * 120}deg) translateX(7px)`,
          }}
        />
      ))}
    </span>
  );
}
