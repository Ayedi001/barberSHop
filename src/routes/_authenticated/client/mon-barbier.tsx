import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, MessageCircle, Phone, Scissors, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { telLink, waLink } from "@/lib/format";
import { demoBarbers } from "@/lib/demo-barbers";

export const Route = createFileRoute("/_authenticated/client/mon-barbier")({
  head: () => workspaceHead("Mes Barbiers Favoris — Espace Client"),
  component: MyBarbersPage,
});

function MyBarbersPage() {
  const { user } = useAuth();

  const { data: barbers = demoBarbers.slice(0, 3) } = useQuery({
    queryKey: ["client-favorite-barbers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("barbers").select("*").eq("status", "active").limit(3);
      return data && data.length > 0 ? data : demoBarbers.slice(0, 3);
    },
  });

  return (
    <>
      <PageHeader
        title="Mes Salons & Barbiers"
        subtitle="Retrouvez vos adresses habituelles pour reprendre rendez-vous en un instant."
        actions={
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl shadow-soft">
            <Link to="/barbiers">
              <Scissors className="size-4 mr-2" /> Découvrir d'autres salons
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {barbers.map((b) => (
          <div
            key={b.id}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-card transition-all"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-full overflow-hidden border border-border bg-muted shrink-0">
                  <img
                    src={b.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"}
                    alt={b.salon_name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    {b.salon_name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <MapPin className="size-3 text-amber-500" /> {b.city}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                    <Star className="size-3.5 fill-amber-500" /> {b.rating?.toFixed(1) || "4.9"}
                  </div>
                </div>
              </div>

              {b.short_bio && (
                <p className="mt-4 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {b.short_bio}
                </p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {b.whatsapp && (
                  <a
                    href={waLink(b.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="grid size-9 place-items-center rounded-xl border border-border text-emerald-500 hover:bg-emerald-500/10"
                    title="WhatsApp"
                  >
                    <MessageCircle className="size-4" />
                  </a>
                )}
                {b.phone && (
                  <a
                    href={telLink(b.phone)}
                    className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground hover:text-amber-500 hover:bg-muted"
                    title="Appeler"
                  >
                    <Phone className="size-4" />
                  </a>
                )}
              </div>

              <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs">
                <Link to="/barbier/$slug" params={{ slug: b.slug }}>
                  Réserver
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
