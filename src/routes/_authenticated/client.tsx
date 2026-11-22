import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, LayoutDashboard, Scissors, UserCheck, Wallet } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { requireRole, useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/client")({
  beforeLoad: () => requireRole("client"),
  head: () => workspaceHead("Espace Client"),
  component: ClientLayout,
});

export function useMyProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) return null;
      return data;
    },
  });
}

function ClientLayout() {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();

  const nav: NavItem[] = [
    { to: "/client", label: "Accueil", icon: LayoutDashboard, exact: true },
    { to: "/client/planning", label: "Mes Rendez-vous", icon: CalendarCheck },
    { to: "/client/mon-barbier", label: "Mes Barbiers", icon: Scissors },
    { to: "/client/paiements", label: "Mes Reçus & Caisse", icon: Wallet },
  ];

  return (
    <DashboardShell
      nav={nav}
      spaceLabel="Espace Client"
      userName={profile?.full_name || user?.email || "Client"}
      userSub={profile?.city ?? undefined}
      publicLink={{ to: "/barbiers", label: "Trouver un barbier" }}
    >
      <Outlet />
    </DashboardShell>
  );
}
