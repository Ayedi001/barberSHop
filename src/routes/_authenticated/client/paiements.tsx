import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Receipt, Wallet } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtDate, formatDT } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/client/paiements")({
  head: () => workspaceHead("Mes Reçus & Règlements — Espace Client"),
  component: ClientPaymentsPage,
});

function ClientPaymentsPage() {
  const { user } = useAuth();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["client-payments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("id, amount, method, note, paid_at, barbers(salon_name)")
        .order("paid_at", { ascending: false });
      return data ?? [];
    },
  });

  const total = payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <>
      <PageHeader
        title="Mes Reçus & Règlements"
        subtitle="Historique de vos paiements et justificatifs de prestations en salon."
      />

      <Panel title="Historique des paiements au salon">
        {isLoading ? (
          <p className="py-12 text-center text-muted-foreground">Chargement des reçus...</p>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Aucun reçu pour l'instant"
            text="Vos justificatifs de paiement apparaîtront ici après chaque séance terminée."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 uppercase text-[10px] text-muted-foreground font-bold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Salon</th>
                  <th className="py-3 px-4">Prestation</th>
                  <th className="py-3 px-4">Règlement</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      {fmtDate(p.paid_at, "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">
                      {p.barbers?.salon_name || "Salon Barbier"}
                    </td>
                    <td className="py-3 px-4 text-foreground font-medium">
                      {p.note || "Prestation Coiffure & Barbe"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">
                        {p.method === "cash"
                          ? "Espèces"
                          : p.method === "card"
                            ? "Carte"
                            : "Virement"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-display font-bold text-sm text-foreground">
                      {formatDT(p.amount)}
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
