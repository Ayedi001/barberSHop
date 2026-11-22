import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Scissors, Smartphone, Bell, CheckCircle2, DollarSign } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => ({
    meta: [
      { title: "Comment ça marche ? — Guide BarberCraft" },
      {
        name: "description",
        content: "Guide étape par étape pour les clients souhaitant réserver en ligne et les barbiers souhaitant gérer leur salon.",
      },
    ],
  }),
  component: HowPage,
});

function HowPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Mode d'emploi"
        title="Une plateforme simple, fluide et rapide"
        subtitle="Que vous soyez un client cherchant une coupe impeccable ou un gérant de salon voulant organiser son planning."
      />

      <section className="container-page py-16 md:py-24">
        {/* For clients */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
            <Smartphone className="size-4" /> Côté Client
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mb-8">
            Réservez votre séance en 3 étapes simples
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500 text-black font-extrabold text-sm shrink-0">
                1
              </span>
              <div>
                <h3 className="font-display text-lg font-bold">Explorez et choisissez votre barbier</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Filtrez les salons par ville (Tunis, Ariana, La Marsa, Sousse...) et explorez les photos de coupes, les avis certifiés et la carte des tarifs.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500 text-black font-extrabold text-sm shrink-0">
                2
              </span>
              <div>
                <h3 className="font-display text-lg font-bold">Sélectionnez votre créneau</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Consultez les disponibilités réelles du barbier en direct. Choisissez le jour et l'heure qui s'adaptent à votre emploi du temps.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500 text-black font-extrabold text-sm shrink-0">
                3
              </span>
              <div>
                <h3 className="font-display text-lg font-bold">Rendez-vous au salon sans stress</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Recevez un rappel SMS/WhatsApp. Votre fauteuil vous est réservé : passez directement en cabine sans attendre votre tour !
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* For barbers */}
        <div className="max-w-3xl mx-auto mt-20 pt-16 border-t border-border">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
            <Scissors className="size-4" /> Côté Barbier & Salon
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mb-8">
            Digitalisez et boostez votre salon
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <CalendarCheck className="size-6 text-amber-500 mb-3" />
              <h4 className="font-display text-base font-bold">Planning & Calendrier Intelligent</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Visualisez vos journées et vos semaines d'un coup d'œil. Bloquez des pauses ou ajoutez des rendez-vous impromptus en un tap.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <Bell className="size-6 text-amber-500 mb-3" />
              <h4 className="font-display text-base font-bold">Rappels Automatiques Anti-Absence</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Fini les clients qui oublient leur rendez-vous : le système envoie des notifications pour garantir un taux de présence maximal.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <DollarSign className="size-6 text-amber-500 mb-3" />
              <h4 className="font-display text-base font-bold">Gestion Caisse & Chiffre d'Affaires</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Suivez vos encaissements quotidiens, statistiques de fréquentation et votre panier moyen en toute clarté.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <CheckCircle2 className="size-6 text-amber-500 mb-3" />
              <h4 className="font-display text-base font-bold">Fiche Clientèle & Préférences</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Mémorisez les habitudes de chaque client (taille du sabot, coupe préférée, historique de passage).
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Button asChild size="lg" className="bg-amber-500 text-black font-extrabold rounded-xl shadow-soft">
              <Link to="/inscription" search={{ type: "barber" }}>
                Créer un compte Professionnel Barbier
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
