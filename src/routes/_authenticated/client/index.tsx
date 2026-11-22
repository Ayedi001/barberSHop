import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Scissors,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatCard, StatusBadge, EmptyState } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtDate, fmtTime, formatDT } from "@/lib/format";
import { useMyProfile } from "../client";

export const Route = createFileRoute("/_authenticated/client/")({
  head: () => workspaceHead("Tableau de bord — Espace Client"),
  component: ClientDashboard,
});

function ClientDashboard() {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();

  const { data: nextAppt } = useQuery({
    queryKey: ["client-next-appt", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("id, starts_at, service_name, duration_minutes, price, status, barber_id, barbers(salon_name, city, phone)")
        .or(`client_user_id.eq.${user!.id},client_phone.eq.${profile?.phone ?? ""}`)
        .gte("starts_at", new Date().toISOString())
        .neq("status", "cancelled")
        .order("starts_at")
        .limit(1);
      return data?.[0] ?? null;
    },
  });

  const { data: pastCount = 0 } = useQuery({
    queryKey: ["client-past-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .or(`client_user_id.eq.${user!.id},client_phone.eq.${profile?.phone ?? ""}`)
        .eq("status", "completed");
      return count ?? 0;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bienvenue ${profile?.full_name || "sur BarberCraft"} 👋`}
        subtitle="Suivez vos prochains rendez-vous de coiffure et retrouvez vos salons préférés."
        actions={
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl shadow-soft">
            <Link to="/barbiers">
              <Scissors className="size-4 mr-2" /> Réserver un créneau
            </Link>
          </Button>
        }
      />

      {/* NEXT APPOINTMENT HERO CARD */}
      {nextAppt ? (
        <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-card to-amber-500/10 p-6 md:p-8 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
            <Sparkles className="size-4" /> Prochain Rendez-vous
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-foreground">
                {(nextAppt as any).barbers?.salon_name || "Salon Barbier"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground font-medium">
                {nextAppt.service_name} • {formatDT(nextAppt.price)}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-1.5 text-amber-700 dark:text-amber-300">
                  <Clock className="size-4" />
                  {fmtDate(nextAppt.starts_at, "EEEE d MMMM yyyy")} à {fmtTime(nextAppt.starts_at)}
                </span>
                {(nextAppt as any).barbers?.city && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="size-4 text-amber-500" /> {(nextAppt as any).barbers.city}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="font-bold">
                <Link to="/client/planning">Gérer mon RDV</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <CalendarCheck className="mx-auto size-12 text-amber-500/50 mb-3" />
          <h3 className="font-display text-lg font-bold">Aucun rendez-vous planifié</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            Envie d'un nouveau dégradé ou d'un rituel barbe relaxant ? Trouvez votre barbier en un clic.
          </p>
          <Button asChild className="mt-4 bg-amber-500 text-black font-extrabold">
            <Link to="/barbiers">Prendre rendez-vous</Link>
          </Button>
        </div>
      )}

      {/* QUICK STATS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Passages au salon"
          value={pastCount}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Statut fidélité"
          value="Client Privilège"
          icon={Sparkles}
          tone="brand"
        />
        <StatCard
          label="Zéro file d'attente"
          value="100% garanti"
          icon={Clock}
        />
      </div>

      {/* SUGGESTED BARBERS SECTION */}
      <Panel
        title="Salons recommandés pour vous"
        action={
          <Link to="/barbiers" className="text-xs font-bold text-amber-500 hover:underline flex items-center">
            Voir tous les salons <ArrowRight className="size-3.5 ml-1" />
          </Link>
        }
      >
        <p className="text-xs text-muted-foreground mb-4">
          Réservez à nouveau chez nos artisans les plus plébiscités :
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/barbiers"
            className="flex items-center gap-4 rounded-xl border border-border p-4 hover:border-amber-500/50 hover:bg-muted/30 transition-all"
          >
            <span className="grid size-12 place-items-center rounded-xl bg-amber-500/15 text-amber-600 font-extrabold text-sm">
              GC
            </span>
            <div>
              <p className="font-bold text-sm text-foreground">The Gentlemen's Club</p>
              <p className="text-xs text-muted-foreground">La Marsa • Note 4.9 ★</p>
            </div>
          </Link>

          <Link
            to="/barbiers"
            className="flex items-center gap-4 rounded-xl border border-border p-4 hover:border-amber-500/50 hover:bg-muted/30 transition-all"
          >
            <span className="grid size-12 place-items-center rounded-xl bg-amber-500/15 text-amber-600 font-extrabold text-sm">
              BK
            </span>
            <div>
              <p className="font-bold text-sm text-foreground">Barber King Studio</p>
              <p className="text-xs text-muted-foreground">Ennasr 2, Ariana • Note 4.9 ★</p>
            </div>
          </Link>
        </div>
      </Panel>
    </div>
  );
}
