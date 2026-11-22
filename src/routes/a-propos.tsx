import { createFileRoute, Link } from "@tanstack/react-router";
import { Scissors, ShieldCheck, Heart, Sparkles, Award, Users } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À Propos de BarberCraft — La Révolution du Barbershop" },
      {
        name: "description",
        content: "Découvrez notre mission : moderniser l'expérience de coiffure masculine et valoriser le métier d'artisan barbier.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Notre Vision"
        title="Redonner ses lettres de noblesse à l'art du barbier"
        subtitle="BarberCraft est née d'un constat simple : aller chez le barbier devrait être un moment de détente privilégié, jamais une source d'attente stressante."
      />

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-foreground">
              Une technologie au service de l'artisanat
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              En Tunisie et dans le Maghreb, le salon de coiffure est un lieu de vie, de discussion
              et de convivialité. Mais entre les files d'attente interminables du week-end et
              l'impossibilité de planifier sa journée, l'expérience client méritait d'être réinventée.
            </p>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              BarberCraft permet à chaque homme de trouver le barbier qui correspond exactement à son
              style (dégradé américain, barbe sculptée, rasage traditionnel, soin vapeur) et de réserver
              son fauteuil à l'avance en 30 secondes.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="font-display text-3xl font-extrabold text-amber-500">100%</span>
                <p className="mt-1 text-xs text-muted-foreground font-medium">Barbiers vérifiés sur place</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="font-display text-3xl font-extrabold text-amber-500">0 min</span>
                <p className="mt-1 text-xs text-muted-foreground font-medium">Temps d'attente moyen garanti</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-border shadow-card">
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80"
              alt="Artisan barbier"
              className="h-[420px] w-full object-cover"
            />
          </div>
        </div>

        {/* Pillars */}
        <div className="mt-20">
          <h3 className="font-display text-2xl font-bold text-center text-foreground mb-10">
            Nos Valeurs Fondatrices
          </h3>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="grid size-12 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
                <Award className="size-6" />
              </div>
              <h4 className="mt-4 font-display text-lg font-bold">Excellence & Précision</h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Chaque détail compte, de l'alignement des pattes au fondu millimétré du dégradé.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="grid size-12 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
                <ShieldCheck className="size-6" />
              </div>
              <h4 className="mt-4 font-display text-lg font-bold">Hygiène & Rigueur</h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Stérilisation des lames, utilisation de serviettes chaudes à usage unique et propreté exemplaire.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="grid size-12 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
                <Users className="size-6" />
              </div>
              <h4 className="mt-4 font-display text-lg font-bold">Partenariat Gagnant-Gagnant</h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Nous donnons aux artisans les outils digitaux modernes pour valoriser leur travail et faire grandir leur salon.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Button asChild size="lg" className="bg-amber-500 text-black font-extrabold rounded-xl shadow-soft">
            <Link to="/barbiers">Découvrir nos salons</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
