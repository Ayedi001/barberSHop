import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BarberCard } from "@/components/site/BarberCard";
import { HowSteps } from "@/components/site/HowSteps";
import { Faq } from "@/components/site/Faq";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PhotoGallery } from "@/components/site/PhotoGallery";
import { ReviewWidgets } from "@/components/site/ReviewWidgets";
import {
  barbersQuery,
  publicGalleryQuery,
  publicStatsQuery,
  siteReviewsQuery,
} from "@/lib/public-queries";
import { CITIES, SERVICE_CATEGORIES } from "@/lib/site";
import { BARBER_IMAGES } from "@/lib/barber-images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BarberCraft — Réservation en Ligne & Gestion Barbiers en Tunisie" },
      {
        name: "description",
        content:
          "Prenez rendez-vous en ligne chez les meilleurs coiffeurs et barbiers. Fini l'attente au salon, découvrez les tarifs, photos de coupes et réservez votre créneau en 30 secondes.",
      },
      { property: "og:title", content: "BarberCraft — L'art du barbier moderne." },
      {
        property: "og:description",
        content: "Réservation en ligne chez les meilleurs barbiers. Zéro temps d'attente au salon.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(barbersQuery()),
      context.queryClient.ensureQueryData(publicStatsQuery()),
      context.queryClient.ensureQueryData(publicGalleryQuery()),
      context.queryClient.ensureQueryData(siteReviewsQuery()),
    ]);
  },
  component: Home,
});

const BENEFITS = [
  {
    Icon: CalendarCheck,
    title: "Créneau garanti, zéro attente",
    text: "Votre fauteuil vous attend à l'heure exacte. Plus besoin de patienter 2 heures dans le salon le samedi.",
  },
  {
    Icon: BadgeCheck,
    title: "Maîtres barbiers vérifiés",
    text: "Une sélection rigoureuse de salons réputés et d'artisans passionnés par l'excellence du dégradé et de la barbe.",
  },
  {
    Icon: Scissors,
    title: "Transparence totale des tarifs",
    text: "Consultez le menu complet des prestations, la durée estimée et les prix sans mauvaise surprise.",
  },
  {
    Icon: Sparkles,
    title: "Rituels de soin premium",
    text: "Serviette chaude relaxante, rasage au coupe-chou, black mask et soins aux huiles essentielles naturelles.",
  },
  {
    Icon: MessageCircle,
    title: "Rappels SMS & WhatsApp",
    text: "Recevez votre confirmation instantanée et une notification avant votre rendez-vous pour ne rien oublier.",
  },
  {
    Icon: Users,
    title: "Espace Pro complet pour barbiers",
    text: "Un agenda synchronisé, gestion des encaissements caisse et fichier clients sur smartphone ou tablette.",
  },
];

function Home() {
  const { data: barbers } = useSuspenseQuery(barbersQuery());
  const { data: stats } = useSuspenseQuery(publicStatsQuery());
  const { data: gallery } = useSuspenseQuery(publicGalleryQuery());
  const { data: reviews } = useSuspenseQuery(siteReviewsQuery());
  const navigate = useNavigate();
  const [city, setCity] = useState<string>("all");

  const cities = [...new Set([...CITIES, ...barbers.map((b) => b.city).filter(Boolean)])].sort();

  return (
    <SiteLayout>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-hero py-16 md:py-24 border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
        <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-card/90 px-3.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 shadow-soft">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              La référence du grooming masculin
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] text-foreground sm:text-5xl lg:text-6xl">
              Votre coupe parfaite, <br />
              <span className="text-brand-gradient">réservée en quelques clics.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
              Découvrez les meilleurs barbiers et salons de coiffure en Tunisie. Fini la file d'attente :
              choisissez votre artisan, votre prestation et votre heure en temps réel.
            </p>

            {/* Quick search box */}
            <form
              className="mt-8 flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-card sm:flex-row max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/barbiers", search: city === "all" ? {} : { ville: city } });
              }}
            >
              <div className="flex flex-1 items-center gap-2 px-3">
                <MapPin className="size-5 text-amber-500 shrink-0" />
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-11 border-0 shadow-none focus:ring-0 text-foreground font-medium" aria-label="Ville">
                    <SelectValue placeholder="Choisir une ville" />
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
              </div>
              <Button type="submit" className="h-11 bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-6 rounded-xl shadow-soft">
                <Search className="size-4 mr-2" /> Trouver un salon
              </Button>
            </form>

            {/* Quick badges */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>+480 RDV honorés ce mois</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="size-4 fill-amber-500 text-amber-500" />
                <span>Note moyenne {stats.avg_rating} / 5</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-amber-500" />
                <span>Créneau garanti</span>
              </div>
            </div>
          </div>

          {/* Hero Image & Feature Card */}
          <div className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-none overflow-hidden rounded-3xl border border-border shadow-elevated">
              <img
                src={BARBER_IMAGES.hero}
                alt="Barbershop expérience"
                className="w-full h-[420px] md:h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Floating review card */}
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-black/75 p-4 backdrop-blur-md border border-white/10 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-full bg-amber-500 text-black font-bold text-xs">
                      MC
                    </span>
                    <div>
                      <p className="text-sm font-bold">The Gentlemen's Club</p>
                      <p className="text-xs text-white/70">La Marsa • Ouvert jusqu'à 20h30</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400">
                    4.9 ★ (148 avis)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK PRESTATIONS CATEGORIES */}
      <section className="py-10 border-b border-border bg-muted/20">
        <div className="container-page">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center mb-5">
            Prestations populaires les plus réservées
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {SERVICE_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to="/barbiers"
                search={cat.id === "all" ? {} : { categorie: cat.id }}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:border-amber-500/60 hover:bg-amber-500/10 transition-all shadow-soft"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED BARBERS */}
      <section className="py-16 md:py-24 container-page">
        <SectionHeading
          tag="Nos partenaires d'exception"
          title="Les meilleurs salons & barbiers près de chez vous"
          subtitle="Sélectionnés pour leur savoir-faire, leur hygiène irréprochable et la qualité de leur accueil."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.slice(0, 6).map((barber) => (
            <BarberCard key={barber.id} barber={barber} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-8 rounded-xl shadow-soft">
            <Link to="/barbiers">
              Explorer tous les barbiers <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-24 border-y border-border bg-muted/30">
        <div className="container-page">
          <SectionHeading
            tag="Simple & Rapide"
            title="Comment fonctionne BarberCraft ?"
            subtitle="Prenez rendez-vous en 3 étapes intuitives sans créer de compte compliqué."
          />
          <HowSteps />
        </div>
      </section>

      {/* PHOTO GALLERY OF CUTS & STYLES */}
      <section className="py-16 md:py-24 container-page">
        <SectionHeading
          tag="Portfolio & Réalisations"
          title="L'excellence de nos artisans barbiers"
          subtitle="Dégradés américains, sculptures de barbe, coiffages texturés : découvrez les coupes réalisées dans nos salons."
        />
        <PhotoGallery photos={gallery} />
      </section>

      {/* WHY CHOOSE US / BENEFITS */}
      <section className="py-16 md:py-24 border-y border-border bg-muted/20">
        <div className="container-page">
          <SectionHeading
            tag="Pourquoi BarberCraft ?"
            title="L'expérience client réinventée"
            subtitle="Nous remplaçons le chaos des salons sans rendez-vous par une organisation fluide et moderne."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-card transition-all"
              >
                <div className="grid size-12 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <b.Icon className="size-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS & TESTIMONIALS */}
      <section id="avis" className="py-16 md:py-24 container-page scroll-mt-20">
        <SectionHeading
          tag="Avis 100% vérifiés"
          title="Ce que disent les clients satisfaits"
          subtitle="Des retours d'expérience authentiques après chaque passage au salon."
        />
        <ReviewWidgets reviews={reviews} />
      </section>

      {/* CTA FOR BARBER PROFESSIONALS */}
      <section className="py-16 md:py-20 bg-sidebar text-sidebar-foreground border-y border-sidebar-border">
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Espace Professionnel
            </span>
            <h2 className="font-display text-3xl font-extrabold text-white md:text-4xl">
              Vous êtes barbier ou gérant de salon ?
            </h2>
            <p className="mt-3 text-sm md:text-base text-sidebar-foreground/80 leading-relaxed">
              Attirez de nouveaux clients, réduisez les absences grâce aux rappels automatiques et
              gérez votre planning et votre caisse sur une seule interface élégante.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-6 rounded-xl shadow-soft">
              <Link to="/inscription" search={{ type: "barber" }}>
                <Scissors className="size-4 mr-2" /> Créer mon profil barbier
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-sidebar-border text-white hover:bg-sidebar-accent">
              <Link to="/comment-ca-marche">En savoir plus</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 container-page">
        <SectionHeading
          tag="Questions fréquentes"
          title="Tout ce que vous devez savoir"
          subtitle="Une question sur la réservation ou le fonctionnement ? Consultez nos réponses ci-dessous."
        />
        <Faq />
      </section>
    </SiteLayout>
  );
}
