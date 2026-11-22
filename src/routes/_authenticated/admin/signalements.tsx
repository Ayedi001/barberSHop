import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/signalements")({
  head: () => workspaceHead("Signalements & Modération — Super Admin"),
  component: AdminReportsPage,
});

function AdminReportsPage() {
  const qc = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function resolveReport(id: string) {
    const { error } = await supabase
      .from("reports")
      .update({ status: "resolved" })
      .eq("id", id);
    if (error) {
      toast.error("Action impossible", { description: error.message });
      return;
    }
    toast.success("Signalement marqué comme résolu !");
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
  }

  return (
    <>
      <PageHeader
        title="Signalements & Modération"
        subtitle="Traitement des litiges, signalements d'avis ou alertes remontées par les utilisateurs."
      />

      <Panel title={`Signalements (${reports.length})`}>
        {isLoading ? (
          <p className="py-12 text-center text-muted-foreground text-xs">Chargement...</p>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="Aucun signalement en cours"
            text="Tous les litiges sont résolus ou aucun problème n'a été signalé."
          />
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 hover:bg-muted/20"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{r.reason}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.details && (
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{r.details}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Signalé le {fmtDate(r.created_at, "dd/MM/yyyy HH:mm")}
                  </p>
                </div>

                {r.status === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveReport(r.id)}
                    className="text-xs text-emerald-600 hover:bg-emerald-500/10 font-bold shrink-0"
                  >
                    <CheckCircle2 className="size-3.5 mr-1" /> Résoudre
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
