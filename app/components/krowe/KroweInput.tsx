"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type KroweInputState = "default" | "error" | "success";

export type KroweInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  helperText?: string;
  state?: KroweInputState;
  icon?: ReactNode;
};

export const KroweInput = forwardRef<HTMLInputElement, KroweInputProps>(function KroweInput(
  {
    label,
    helperText,
    state = "default",
    icon,
    disabled,
    className,
    id: idProp,
    ...props
  },
  ref,
) {
  const uid = useId();
  const inputId = idProp ?? `krowe-input-${uid}`;
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const borderClass =
    state === "error"
      ? "border-danger"
      : state === "success"
        ? "border-success"
        : focused
          ? "border-primary"
          : "border-border";

  return (
    <div className={cn("flex flex-col gap-2 font-sans", className)}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}

      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        ) : null}

        <input
          {...props}
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            "h-11 w-full rounded-[var(--radius-md)] border bg-background text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60",
            icon ? "pl-10 pr-3" : "px-3",
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
          onChange={(e) => {
            setHasValue(e.target.value.length > 0);
            props.onChange?.(e);
          }}
        />

        {state === "success" && hasValue ? (
          <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 text-primary">
            <Check size={18} aria-hidden />
          </span>
        ) : null}

        {state === "error" ? (
          <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 text-danger">
            <AlertCircle size={18} aria-hidden />
          </span>
        ) : null}
      </div>

      {helperText ? (
        <p
          className={cn(
            "text-xs",
            state === "error" ? "text-danger" : state === "success" ? "text-success" : "text-muted-foreground"
          )}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
