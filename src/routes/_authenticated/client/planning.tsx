import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Clock, MapPin, Scissors, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, StatusBadge } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtDate, fmtTime, formatDT } from "@/lib/format";
import { useMyProfile } from "../client";

export const Route = createFileRoute("/_authenticated/client/planning")({
  head: () => workspaceHead("Mes Rendez-vous — Espace Client"),
  component: ClientPlanningPage,
});

function ClientPlanningPage() {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const qc = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["client-appointments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, starts_at, service_name, duration_minutes, price, status, notes, barber_id, barbers(salon_name, city, address, phone)")
        .or(`client_user_id.eq.${user!.id},client_phone.eq.${profile?.phone ?? ""}`)
        .order("starts_at", { ascending: false });
      if (error) return [];
      return data ?? [];
    },
  });

  async function cancelAppointment(id: string) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) {
      toast.error("Impossible d'annuler le rendez-vous", { description: error.message });
      return;
    }
    toast.success("Rendez-vous annulé.");
    qc.invalidateQueries({ queryKey: ["client-appointments"] });
  }

  return (
    <>
      <PageHeader
        title="Mes Rendez-vous"
        subtitle="Retrouvez l'historique complet de vos passages en salon et vos prochaines séances de coiffure."
        actions={
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl shadow-soft">
            <Link to="/barbiers">
              <Scissors className="size-4 mr-2" /> Prendre un nouveau RDV
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <p className="py-20 text-center text-muted-foreground">Chargement de vos rendez-vous...</p>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Aucun rendez-vous enregistré"
          text="Vous n'avez pas encore de rendez-vous programmé. Choisissez un barbier et réservez votre créneau !"
          action={
            <Button asChild className="bg-amber-500 text-black font-bold">
              <Link to="/barbiers">Trouver un barbier</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {appointments.map((a: any) => {
            const isUpcoming = new Date(a.starts_at) >= new Date() && a.status !== "cancelled";

            return (
              <div
                key={a.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 shadow-soft transition-all ${
                  isUpcoming
                    ? "border-amber-500/40 bg-card hover:shadow-card"
                    : "border-border bg-card/60 opacity-90"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-foreground">
                      {a.barbers?.salon_name || "Salon Barbier"}
                    </h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xs font-semibold text-foreground mt-1">
                    {a.service_name} • <span className="text-amber-500">{formatDT(a.price)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="size-3 text-amber-500" />
                      {fmtDate(a.starts_at, "EEEE d MMMM yyyy")} à {fmtTime(a.starts_at)}
                    </span>
                    {a.barbers?.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3 text-muted-foreground" /> {a.barbers.city}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isUpcoming && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelAppointment(a.id)}
                      className="text-xs text-red-500 hover:bg-red-500/10 border-red-500/30"
                    >
                      <X className="size-3.5 mr-1" /> Annuler
                    </Button>
                  )}
                  {a.barbers?.phone && (
                    <a
                      href={`tel:${a.barbers.phone}`}
                      className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
                    >
                      Contacter le salon
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
