import type { ReactNode } from "react";

export function SectionHeading({
  tag,
  title,
  subtitle,
  center = true,
  className = "",
}: {
  tag?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`mb-10 md:mb-14 ${center ? "text-center mx-auto max-w-2xl" : "max-w-2xl"} ${className}`}>
      {tag && (
        <span className="inline-block rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3">
          {tag}
        </span>
      )}
      <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base text-muted-foreground leading-relaxed">{subtitle}</p>}
    </div>
  );
}
