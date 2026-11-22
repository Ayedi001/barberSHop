import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Search, SlidersHorizontal, X, Scissors, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { BarberCard } from "@/components/site/BarberCard";
import { barbersQuery } from "@/lib/public-queries";
import { CITIES, SERVICE_CATEGORIES } from "@/lib/site";

type SearchParams = { q?: string; ville?: string; categorie?: string; dispo?: boolean };

export const Route = createFileRoute("/barbiers")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    ...(typeof s["q"] === "string" && s["q"] ? { q: s["q"] } : {}),
    ...(typeof s["ville"] === "string" && s["ville"] ? { ville: s["ville"] } : {}),
    ...(typeof s["categorie"] === "string" && s["categorie"] ? { categorie: s["categorie"] } : {}),
    ...(s["dispo"] === true || s["dispo"] === "true" ? { dispo: true } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Trouver un Barbier & Salon de Coiffure — BarberCraft" },
      {
        name: "description",
        content:
          "Annuaire des meilleurs barbiers et salons en Tunisie : réservez en ligne par ville, comparez les dégradés, tarifs et avis clients.",
      },
      { property: "og:title", content: "Nos Barbiers Partenaires — BarberCraft" },
      {
        property: "og:description",
        content: "Trouvez un barbier professionnel vérifié près de chez vous.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(barbersQuery()),
  component: Directory,
});

function Directory() {
  const { data } = useSuspenseQuery(barbersQuery());
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/barbiers" });
  const cities = useMemo(
    () => [...new Set([...CITIES, ...data.map((b) => b.city).filter(Boolean)])].sort(),
    [data],
  );

  const list = useMemo(() => {
    const q = (search.q ?? "").toLowerCase().trim();
    return data.filter((b) => {
      if (search.ville && b.city !== search.ville) return false;
      if (search.dispo && !b.accepting_bookings) return false;
      if (!q) return true;
      return [
        b.salon_name,
        b.first_name,
        b.last_name,
        b.city,
        b.short_bio,
        ...(b.services ?? []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [data, search]);

  const set = (patch: { [K in keyof SearchParams]: SearchParams[K] | undefined }) =>
    navigate({
      search: (prev: SearchParams) =>
        Object.fromEntries(
          Object.entries({ ...prev, ...patch }).filter(([, v]) => v !== undefined),
        ) as SearchParams,
      replace: true,
    });

  const hasFilters = !!(search.q || search.ville || search.categorie || search.dispo);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Annuaire des Salons"
        title="Nos Barbiers & Salons Partenaires"
        subtitle="Des maîtres artisans coiffeurs vérifiés, équipés pour vous offrir le meilleur dégradé et entretien de barbe."
      />

      <section className="container-page -mt-8 pb-24">
        {/* Filter bar */}
        <div className="relative z-10 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-card md:grid-cols-[1.6fr_1fr_auto_auto] md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search.q ?? ""}
              onChange={(e) => set({ q: e.target.value || undefined })}
              placeholder="Salon, barbier, style (Fade, Barbe, Soin...)"
              className="h-11 pl-9"
            />
          </div>
          <Select
            value={search.ville ?? "all"}
            onValueChange={(v) => set({ ville: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="h-11" aria-label="Ville">
              <SelectValue placeholder="Ville" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les villes</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="flex h-11 items-center gap-2 rounded-xl border border-input px-3 text-xs font-semibold cursor-pointer hover:bg-muted/30">
            <Switch
              checked={!!search.dispo}
              onCheckedChange={(v) => set({ dispo: v || undefined })}
            />
            Disponibles aujourd'hui
          </label>

          {hasFilters ? (
            <Button
              variant="ghost"
              onClick={() => navigate({ search: {}, replace: true })}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-4 mr-1" /> Effacer
            </Button>
          ) : (
            <span className="hidden items-center gap-1.5 px-3 text-xs font-semibold text-muted-foreground md:flex">
              <SlidersHorizontal className="size-4 text-amber-500" /> Filtres
            </span>
          )}
        </div>

        {/* Results summary */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-extrabold text-foreground">{list.length}</span> salon
            {list.length > 1 ? "s" : ""} disponible{list.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Barbers list */}
        {list.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((barber) => (
              <BarberCard key={barber.id} barber={barber} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center bg-card">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-600">
              <Scissors className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">Aucun salon ne correspond à votre recherche</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Essayez de modifier votre mot-clé ou sélectionnez "Toutes les villes".
            </p>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => navigate({ search: {}, replace: true })}
                className="font-semibold"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
