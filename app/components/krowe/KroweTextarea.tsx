"use client";

import { useId, useState, type TextareaHTMLAttributes } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type KroweTextareaState = "default" | "error";

export type KroweTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
  state?: KroweTextareaState;
};

export function KroweTextarea({
  label,
  helperText,
  state = "default",
  disabled,
  className,
  id: idProp,
  rows = 6,
  ...props
}: KroweTextareaProps) {
  const uid = useId();
  const inputId = idProp ?? `krowe-textarea-${uid}`;
  const [focused, setFocused] = useState(false);

  const borderClass =
    state === "error" ? "border-danger" : focused ? "border-primary" : "border-border";

  return (
    <div className={cn("flex flex-col gap-2 font-sans", className)}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <textarea
          {...props}
          id={inputId}
          rows={rows}
          disabled={disabled}
          className={cn(
            "min-h-[10rem] w-full resize-y rounded-[var(--radius-md)] border bg-background p-4 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60",
            borderClass,
            focused ? "ring-4 ring-primary/10" : ""
          )}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
        />
        {state === "error" ? (
          <span className="pointer-events-none absolute right-3 top-3 text-danger">
            <AlertCircle size={18} aria-hidden />
          </span>
        ) : null}
      </div>

      {helperText ? (
        <p className={cn("text-xs", state === "error" ? "text-danger" : "text-muted-foreground")}>{helperText}</p>
      ) : null}
    </div>
  );
}
