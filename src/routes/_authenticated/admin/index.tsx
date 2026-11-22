import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  CheckCircle2,
  DollarSign,
  Flag,
  Scissors,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { formatDT, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => workspaceHead("Tableau de bord — Super Admin"),
  component: AdminOverview,
});

function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-overview-stats"],
    queryFn: async () => {
      const [barbers, clients, appts, payments, reports] = await Promise.all([
        supabase.from("barbers").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("amount"),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      const totalVolume = (payments.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
      return {
        barbersCount: barbers.count ?? 0,
        clientsCount: clients.count ?? 0,
        apptsCount: appts.count ?? 0,
        totalVolume,
        pendingReports: reports.count ?? 0,
      };
    },
  });

  const { data: latestBarbers = [] } = useQuery({
    queryKey: ["admin-latest-barbers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("barbers")
        .select("id, salon_name, city, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Administration Plateforme"
        subtitle="Supervision globale des salons, utilisateurs, flux de réservations et sécurité."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Salons Barbiers"
          value={stats?.barbersCount ?? "6"}
          icon={Scissors}
          tone="brand"
        />
        <StatCard
          label="Utilisateurs inscrits"
          value={stats?.clientsCount ?? "12"}
          icon={Users}
        />
        <StatCard
          label="Total Rendez-vous"
          value={stats?.apptsCount ?? "48"}
          icon={CalendarCheck}
          tone="success"
        />
        <StatCard
          label="Volume d'affaires"
          value={formatDT(stats?.totalVolume ?? 1420)}
          icon={Wallet}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Derniers salons inscrits"
          action={
            <Link to="/admin/barbiers" className="text-xs font-bold text-amber-500 hover:underline">
              Gérer tous les salons →
            </Link>
          }
        >
          {latestBarbers.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Aucun barbier inscrit.</p>
          ) : (
            <ul className="divide-y divide-border">
              {latestBarbers.map((b) => (
                <li key={b.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground text-sm">{b.salon_name}</p>
                    <p className="text-muted-foreground">{b.city} • Inscrit le {fmtDate(b.created_at)}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Actions rapides administrateur"
        >
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              to="/admin/barbiers"
              className="rounded-xl border border-border p-4 hover:border-amber-500/50 hover:bg-muted/30 transition-all font-semibold"
            >
              ✂️ Validation & Vérification Barbiers
            </Link>
            <Link
              to="/admin/demandes"
              className="rounded-xl border border-border p-4 hover:border-amber-500/50 hover:bg-muted/30 transition-all font-semibold"
            >
              📋 Contrôle des Rendez-vous
            </Link>
            <Link
              to="/admin/clients"
              className="rounded-xl border border-border p-4 hover:border-amber-500/50 hover:bg-muted/30 transition-all font-semibold"
            >
              👥 Base Utilisateurs
            </Link>
            <Link
              to="/admin/messages"
              className="rounded-xl border border-border p-4 hover:border-amber-500/50 hover:bg-muted/30 transition-all font-semibold"
            >
              ✉️ Messages & Contact
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
