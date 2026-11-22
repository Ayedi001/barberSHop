import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Scissors,
  Users,
  Wallet,
  Store,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { requireRole, useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/pro")({
  beforeLoad: () => requireRole("barber"),
  head: () => workspaceHead("Espace Barbier Pro"),
  component: ProLayout,
});

export function useMyBarber() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-barber", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

function ProLayout() {
  const { user } = useAuth();
  const { data: barber } = useMyBarber();

  const { data: pending = 0 } = useQuery({
    queryKey: ["pending-barber-requests", barber?.id],
    enabled: !!barber,
    queryFn: async () => {
      const { count } = await supabase
        .from("booking_requests")
        .select("id", { count: "exact", head: true })
        .eq("barber_id", barber!.id)
        .eq("status", "pending");
      return count ?? 0;
    },
  });

  const nav: NavItem[] = [
    { to: "/pro", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
    { to: "/pro/planning", label: "Planning & Rendez-vous", icon: CalendarDays },
    {
      to: "/pro/demandes",
      label: "Demandes en attente",
      icon: ClipboardList,
      ...(pending > 0 ? { badge: pending } : {}),
    },
    { to: "/pro/clients", label: "Mes Clients", icon: Users },
    { to: "/pro/finances", label: "Caisse & Revenus", icon: Wallet },
    { to: "/pro/profil", label: "Salon & Prestations", icon: Store },
  ];

  const name = barber
    ? barber.salon_name || `${barber.first_name} ${barber.last_name}`
    : user?.email ?? "Barbier";

  return (
    <DashboardShell
      nav={nav}
      spaceLabel="Espace Barbier Pro"
      userName={name}
      userSub={barber?.city ?? user?.email ?? undefined}
      publicLink={
        barber
          ? {
              to: "/barbier/$slug",
              params: { slug: barber.slug },
              label: "Voir ma fiche publique",
            }
          : undefined
      }
    >
      <Outlet />
    </DashboardShell>
  );
}
