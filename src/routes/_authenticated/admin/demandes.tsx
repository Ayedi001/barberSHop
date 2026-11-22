import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck } from "lucide-react";
import { PageHeader, Panel, StatusBadge } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, fmtTime, formatDT } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/demandes")({
  head: () => workspaceHead("Supervision Rendez-vous — Super Admin"),
  component: AdminAppointmentsPage,
});

function AdminAppointmentsPage() {
  const { data: appts = [], isLoading } = useQuery({
    queryKey: ["admin-all-appointments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("id, client_name, client_phone, service_name, starts_at, price, status, barbers(salon_name)")
        .order("starts_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader
        title="Supervision des Rendez-vous & Réservations"
        subtitle="Flux en temps réel de tous les rendez-vous pris à travers les salons partenaires."
      />

      <Panel title={`Derniers rendez-vous plateforme (${appts.length})`}>
        {isLoading ? (
          <p className="py-12 text-center text-muted-foreground text-xs">Chargement...</p>
        ) : appts.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">Aucun rendez-vous enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 uppercase text-[10px] text-muted-foreground font-bold">
                <tr>
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Salon Barbier</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Prestation</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appts.map((a: any) => (
                  <tr key={a.id} className="hover:bg-muted/20">
                    <td className="py-3.5 px-4 text-muted-foreground font-medium">
                      {fmtDate(a.starts_at, "dd/MM/yyyy")} à {fmtTime(a.starts_at)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {a.barbers?.salon_name || "Salon Barbier"}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground">{a.client_name}</p>
                      {a.client_phone && <p className="text-[11px] text-muted-foreground">{a.client_phone}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-foreground font-medium">{a.service_name}</td>
                    <td className="py-3.5 px-4 font-display font-extrabold text-foreground">
                      {formatDT(a.price)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
