import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, LayoutDashboard, Scissors, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { t } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: t("nav.home") },
  { to: "/barbiers", label: t("nav.barbers") },
  { to: "/comment-ca-marche", label: t("nav.how") },
  { to: "/a-propos", label: t("nav.about") },
  { to: "/contact", label: t("nav.contact") },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
              activeProps={{ className: "text-foreground font-semibold bg-muted/60" }}
            >
              {n.label}
            </Link>
          ))}
          <a
            href="/#avis"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
          >
            Avis
          </a>
        </nav>
        <div className="hidden items-center gap-2.5 lg:flex">
          {user ? (
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-soft">
              <Link to="/espace">
                <LayoutDashboard className="size-4" /> {t("nav.space")}
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-sm font-medium">
                <Link to="/auth">{t("nav.login")}</Link>
              </Button>
              <Button asChild variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-sm">
                <Link to="/inscription" search={{ type: "barber" }}>
                  <Scissors className="size-3.5 mr-1" /> Espace Barbier
                </Link>
              </Button>
              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-soft">
                <Link to="/barbiers">
                  <CalendarCheck className="size-4 mr-1.5" /> Réserver
                </Link>
              </Button>
            </>
          )}
        </div>
        <button
          className="grid size-10 place-items-center rounded-lg border border-border lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <div className={cn("border-t border-border bg-background lg:hidden", open ? "block" : "hidden")}>
        <nav className="container-page flex flex-col gap-1 py-4">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              {n.label}
            </Link>
          ))}
          <a
            href="/#avis"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Avis clients
          </a>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3">
            {user ? (
              <Button asChild className="col-span-2 bg-amber-500 text-black font-semibold">
                <Link to="/espace">{t("nav.space")}</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link to="/auth">{t("nav.login")}</Link>
                </Button>
                <Button asChild className="bg-amber-500 text-black font-semibold">
                  <Link to="/inscription">{t("cta.book")}</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
