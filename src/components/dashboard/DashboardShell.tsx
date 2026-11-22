import { useState, type ComponentType, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site/Logo";
import { NotificationsBell } from "./NotificationsBell";
import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/format";

export type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: number;
};

export function DashboardShell({
  nav,
  spaceLabel,
  userName,
  userSub,
  children,
  publicLink,
}: {
  nav: NavItem[];
  spaceLabel: string;
  userName: string;
  userSub?: string | undefined;
  children: ReactNode;
  publicLink?: { to: string; params?: Record<string, string>; label: string } | undefined;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link to="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border/60">
        <LogoMark />
        <div>
          <p className="font-display text-lg font-bold text-white">
            Barber<span className="text-amber-500">Craft</span>
          </p>
          <p className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60">{spaceLabel}</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            activeOptions={n.exact === undefined ? {} : { exact: n.exact }}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/85"
            activeProps={{
              className:
                "bg-sidebar-accent text-white font-semibold shadow-soft [&>svg]:text-amber-400",
            }}
          >
            <n.icon className="size-[18px] text-sidebar-foreground/70" />
            <span className="flex-1">{n.label}</span>
            {n.badge ? (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-black">
                {n.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
      {publicLink && (
        <div className="px-3 pb-3">
          <a
            href={
              publicLink.params
                ? publicLink.to.replace("$slug", publicLink.params["slug"] ?? "")
                : publicLink.to
            }
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-xs text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white transition-colors"
          >
            <ExternalLink className="size-3.5 text-amber-500" /> {publicLink.label}
          </a>
        </div>
      )}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 bg-sidebar-accent/50">
          <span className="grid size-9 place-items-center rounded-full bg-amber-500 text-sm font-bold text-black">
            {initials(userName || "?")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            {userSub && <p className="truncate text-xs text-sidebar-foreground/60">{userSub}</p>}
          </div>
          <button
            onClick={signOut}
            className="rounded-md p-2 hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-red-400 transition-colors"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block shadow-elevated">
        {sidebar}
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex-1" />
          <NotificationsBell />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "primary",
}: {
  label: string;
  value: ReactNode;
  icon: ComponentType<{ className?: string }>;
  hint?: string;
  tone?: "primary" | "brand" | "success" | "warning" | "destructive";
}) {
  const tones = {
    primary: "bg-primary-soft text-foreground",
    brand: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    destructive: "bg-red-500/15 text-red-600 dark:text-red-400",
  } as const;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold text-foreground md:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-card shadow-soft overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 bg-muted/20">
          {title && <h2 className="font-display text-base font-bold text-foreground">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-12 text-center bg-card/50">
      <span className="grid size-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 font-bold text-foreground">{title}</p>
      {text && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    confirmed: ["Confirmé", "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"],
    scheduled: ["Programmé", "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"],
    completed: ["Terminé", "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"],
    cancelled: ["Annulé", "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30"],
    no_show: ["Non présenté", "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30"],
    pending: ["En attente", "bg-yellow-500/15 text-yellow-800 dark:text-yellow-200 border-yellow-500/30"],
    accepted: ["Accepté", "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"],
    rejected: ["Refusé", "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30"],
    active: ["Actif", "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"],
    vip: ["Client VIP", "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-soft"],
    suspended: ["Suspendu", "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30"],
  };

  const [label, cls] = map[status] ?? [status, "bg-muted text-muted-foreground border-border"];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
