import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfMonth, startOfMonth, startOfDay, endOfDay } from "date-fns";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Check,
  ClipboardList,
  Clock,
  Phone,
  Scissors,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  Panel,
  StatCard,
  StatusBadge,
  EmptyState,
} from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { formatDT, fmtDate, fmtTime, telLink } from "@/lib/format";
import { useMyBarber } from "../pro";

export const Route = createFileRoute("/_authenticated/pro/")({
  head: () => workspaceHead("Tableau de bord — Espace Barbier"),
  component: ProDashboard,
});

function ProDashboard() {
  const { data: barber, isLoading } = useMyBarber();
  const qc = useQueryClient();
  const [seeding, setSeeding] = useState(false);

  const monthStart = startOfMonth(new Date()).toISOString();
  const monthEnd = endOfMonth(new Date()).toISOString();
  const todayStart = startOfDay(new Date()).toISOString();
  const todayEnd = endOfDay(new Date()).toISOString();

  const { data: stats } = useQuery({
    queryKey: ["pro-stats", barber?.id],
    enabled: !!barber,
    queryFn: async () => {
      const bid = barber!.id;
      const [todayAppts, monthPayments, clients, requests] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, status")
          .eq("barber_id", bid)
          .gte("starts_at", todayStart)
          .lte("starts_at", todayEnd)
          .neq("status", "cancelled"),
        supabase
          .from("payments")
          .select("amount")
          .eq("barber_id", bid)
          .gte("paid_at", monthStart)
          .lte("paid_at", monthEnd),
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq("barber_id", bid)
          .eq("status", "active"),
        supabase
          .from("booking_requests")
          .select("id", { count: "exact", head: true })
          .eq("barber_id", bid)
          .eq("status", "pending"),
      ]);

      const cash = (monthPayments.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
      return {
        todayCount: todayAppts.data?.length ?? 0,
        cash,
        clientsCount: clients.count ?? 0,
        requestsCount: requests.count ?? 0,
      };
    },
  });

  const { data: upcoming = [] } = useQuery({
    queryKey: ["pro-upcoming", barber?.id],
    enabled: !!barber,
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("id, client_name, client_phone, service_name, duration_minutes, price, starts_at, status")
        .eq("barber_id", barber!.id)
        .gte("starts_at", new Date().toISOString())
        .neq("status", "cancelled")
        .order("starts_at")
        .limit(5);
      return data ?? [];
    },
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["pro-pending-requests", barber?.id],
    enabled: !!barber,
    queryFn: async () => {
      const { data } = await supabase
        .from("booking_requests")
        .select("id, client_name, client_phone, service_name, desired_date, desired_time, price, notes")
        .eq("barber_id", barber!.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(4);
      return data ?? [];
    },
  });

  async function seedDemo() {
    setSeeding(true);
    const { error } = await supabase.rpc("seed_my_barber_demo_data");
    setSeeding(false);
    if (error) {
      toast.error("Impossible de charger la démo", { description: error.message });
      return;
    }
    toast.success("Données de démo barbier créées !", {
      description: "Clients, prestations, rendez-vous et caisse ont été peuplés.",
    });
    qc.invalidateQueries();
  }

  async function handleRequestDecision(id: string, decision: "accepted" | "rejected") {
    const { error } = await supabase
      .from("booking_requests")
      .update({ status: decision, decided_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Action impossible", { description: error.message });
      return;
    }
    toast.success(decision === "accepted" ? "Demande acceptée !" : "Demande refusée.");
    qc.invalidateQueries();
  }

  async function completeAppointment(id: string) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "completed" })
      .eq("id", id);
    if (error) {
      toast.error("Mise à jour impossible", { description: error.message });
      return;
    }
    toast.success("Rendez-vous marqué comme effectué !");
    qc.invalidateQueries();
  }

  if (isLoading) {
    return <p className="py-24 text-center text-muted-foreground">Chargement de votre espace...</p>;
  }

  if (!barber) {
    return (
      <EmptyState
        icon={Scissors}
        title="Fiche barbier non configurée"
        text="Votre compte n'est pas encore associé à un salon de coiffure."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour ${barber.first_name} 💈`}
        subtitle={`Gestion du planning et activité de ${barber.salon_name}.`}
        actions={
          <Button
            variant="outline"
            onClick={seedDemo}
            disabled={seeding}
            className="border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold"
          >
            <Sparkles className="size-4 mr-2" />
            {seeding ? "Création des données..." : "Charger des données de démo"}
          </Button>
        }
      />

      {/* KPI STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="RDV Aujourd'hui"
          value={stats?.todayCount ?? "0"}
          icon={CalendarCheck}
          tone="brand"
        />
        <StatCard
          label="Caisse ce mois"
          value={stats ? formatDT(stats.cash) : "0 DT"}
          icon={Wallet}
          tone="success"
        />
        <StatCard
          label="Clients enregistrés"
          value={stats?.clientsCount ?? "0"}
          icon={Users}
        />
        <StatCard
          label="Demandes en attente"
          value={stats?.requestsCount ?? "0"}
          icon={ClipboardList}
          tone="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* UPCOMING APPOINTMENTS */}
        <Panel
          title="Prochains rendez-vous au salon"
          action={
            <Link
              to="/pro/planning"
              className="inline-flex items-center text-xs font-bold text-amber-500 hover:underline"
            >
              Voir le planning complet <ArrowRight className="size-3.5 ml-1" />
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Aucun rendez-vous à venir. Chargez des données de démo pour tester !
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((a) => (
                <li key={a.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-foreground">{a.client_name}</p>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.service_name} • {fmtDate(a.starts_at, "d MMMM")} à {fmtTime(a.starts_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {a.client_phone && (
                      <a
                        href={telLink(a.client_phone)}
                        className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-amber-500 hover:bg-muted"
                        title="Appeler le client"
                      >
                        <Phone className="size-3.5" />
                      </a>
                    )}
                    <span className="font-display font-bold text-sm text-foreground">
                      {formatDT(a.price)}
                    </span>
                    {a.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => completeAppointment(a.id)}
                        className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                        title="Marquer comme terminé"
                      >
                        <Check className="size-3.5 mr-1" /> Fait
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* PENDING ONLINE REQUESTS */}
        <Panel
          title="Demandes de réservation en ligne"
          action={
            <Link
              to="/pro/demandes"
              className="inline-flex items-center text-xs font-bold text-amber-500 hover:underline"
            >
              Toutes les demandes <ArrowRight className="size-3.5 ml-1" />
            </Link>
          }
        >
          {pendingRequests.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Toutes les demandes ont été traitées.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {pendingRequests.map((r) => (
                <li key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-foreground">{r.client_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.service_name} • Le {fmtDate(r.desired_date, "d MMMM")} à {r.desired_time}
                    </p>
                    {r.notes && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 italic">
                        "{r.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      onClick={() => handleRequestDecision(r.id, "accepted")}
                      className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      <Check className="size-3.5 mr-1" /> Accepter
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRequestDecision(r.id, "rejected")}
                      className="h-8 text-xs text-red-500 hover:bg-red-500/10"
                    >
                      <X className="size-3.5 mr-1" /> Refuser
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
