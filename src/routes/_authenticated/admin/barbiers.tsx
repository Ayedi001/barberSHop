import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Scissors, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatusBadge } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { demoBarbers } from "@/lib/demo-barbers";

export const Route = createFileRoute("/_authenticated/admin/barbiers")({
  head: () => workspaceHead("Gestion des Barbiers — Super Admin"),
  component: AdminBarbersPage,
});

function AdminBarbersPage() {
  const qc = useQueryClient();

  const { data: barbers = [], isLoading } = useQuery({
    queryKey: ["admin-all-barbers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("barbers")
        .select("*")
        .order("created_at", { ascending: false });
      return data && data.length > 0 ? data : (demoBarbers as any[]);
    },
  });

  async function toggleStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    const { error } = await supabase.from("barbers").update({ status: nextStatus }).eq("id", id);
    if (error) {
      toast.error("Action impossible", { description: error.message });
      return;
    }
    toast.success(nextStatus === "active" ? "Barbier activé" : "Barbier suspendu");
    qc.invalidateQueries({ queryKey: ["admin-all-barbers"] });
  }

  return (
    <>
      <PageHeader
        title="Gestion des Salons & Barbiers"
        subtitle="Vérifiez les nouveaux salons partenaires, modérez leur statut et inspectez leur profil."
      />

      <Panel title={`Tous les salons enregistrés (${barbers.length})`}>
        {isLoading ? (
          <p className="py-12 text-center text-muted-foreground text-xs">Chargement des barbiers...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 uppercase text-[10px] text-muted-foreground font-bold">
                <tr>
                  <th className="py-3 px-4">Salon / Nom</th>
                  <th className="py-3 px-4">Ville</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {barbers.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/20">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-sm text-foreground">{b.salon_name}</p>
                      <p className="text-muted-foreground text-[11px]">
                        {b.first_name} {b.last_name}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-foreground font-medium">{b.city}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {b.phone || b.email || "Non renseigné"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status || "active"} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={b.status === "active" ? "destructive" : "outline"}
                        onClick={() => toggleStatus(b.id, b.status || "active")}
                        className="text-xs font-bold"
                      >
                        {b.status === "active" ? "Suspendre" : "Activer"}
                      </Button>
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
