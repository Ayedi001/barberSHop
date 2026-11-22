import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { PageHeader, Panel } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  head: () => workspaceHead("Gestion des Utilisateurs — Super Admin"),
  component: AdminClientsPage,
});

function AdminClientsPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader
        title="Utilisateurs & Profils Clients"
        subtitle="Répertoire global des comptes utilisateurs enregistrés sur la plateforme BarberCraft."
      />

      <Panel title={`Comptes enregistrés (${users.length})`}>
        {isLoading ? (
          <p className="py-12 text-center text-muted-foreground text-xs">Chargement des comptes...</p>
        ) : users.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">Aucun profil utilisateur.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 uppercase text-[10px] text-muted-foreground font-bold">
                <tr>
                  <th className="py-3 px-4">Nom complet</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4">Ville</th>
                  <th className="py-3 px-4">Date d'inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-bold text-foreground">
                      {u.full_name || "Utilisateur"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{u.email || "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground">{u.phone || "—"}</td>
                    <td className="py-3 px-4 text-foreground">{u.city || "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {fmtDate(u.created_at, "dd/MM/yyyy")}
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
