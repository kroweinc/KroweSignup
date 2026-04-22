import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

export type ContentHeaderBreadcrumb = {
  label: string;
  href?: string;
};

export type ContentHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: ContentHeaderBreadcrumb[];
  actions?: ReactNode;
};

export function ContentHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: ContentHeaderProps) {
  return (
    <header className="mb-8 border-b border-border pb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={`${crumb.label}-${index}`} className="flex min-w-0 max-w-full items-center gap-2">
              {index > 0 && <ChevronRightIcon size={14} className="shrink-0 text-muted-foreground" aria-hidden />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  title={crumb.label}
                  className="min-w-0 max-w-[min(100%,14rem)] truncate text-xs font-medium text-muted-foreground transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  title={crumb.label}
                  className="min-w-0 max-w-[min(100%,14rem)] truncate text-xs font-medium text-foreground"
                >
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="krowe-display-m text-foreground">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
