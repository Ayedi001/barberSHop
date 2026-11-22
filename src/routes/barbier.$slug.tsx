import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Scissors,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BookingModal } from "@/components/site/BookingModal";
import { PhotoGallery } from "@/components/site/PhotoGallery";
import { ReviewWidgets } from "@/components/site/ReviewWidgets";
import { barberQuery, publicGalleryQuery, siteReviewsQuery } from "@/lib/public-queries";
import type { PublicBarber } from "@/lib/public.functions";
import { demoServicesForBarber, demoBarbers } from "@/lib/demo-barbers";
import { formatDT, fmtDuration, waLink, telLink } from "@/lib/format";

export const Route = createFileRoute("/barbier/$slug")({
  head: ({ loaderData }) => {
    const b = loaderData as unknown as PublicBarber | null;
    const title = b ? `${b.salon_name} — Coiffure & Barbe à ${b.city}` : "Barbier";
    return {
      meta: [
        { title: `${title} | BarberCraft` },
        {
          name: "description",
          content: b?.short_bio ?? "Réservez votre séance de coiffure et barbe en ligne sans file d'attente.",
        },
        { property: "og:title", content: title },
        { property: "og:description", content: b?.short_bio ?? "" },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: async ({ params, context }) => {
    const barber = await context.queryClient.ensureQueryData(barberQuery(params.slug));
    if (!barber) throw notFound();
    return barber;
  },
  component: BarberProfile,
});

function BarberProfile() {
  const { slug } = Route.useParams();
  const { data: rawBarber } = useSuspenseQuery(barberQuery(slug));
  const { data: gallery } = useSuspenseQuery(publicGalleryQuery());
  const { data: reviews } = useSuspenseQuery(siteReviewsQuery());

  const barber = rawBarber ?? demoBarbers[0]!;
  const services = demoServicesForBarber["default"] ?? [];

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: barber.salon_name,
        text: `Découvrez et réservez chez ${barber.salon_name} sur BarberCraft !`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien du salon copié dans le presse-papier !");
    }
  }

  return (
    <SiteLayout>
      {/* HEADER COVER */}
      <section className="relative h-64 md:h-80 w-full overflow-hidden bg-muted">
        <img
          src={
            barber.cover_url ||
            "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1600&q=80"
          }
          alt={barber.salon_name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        <div className="container-page absolute inset-x-0 bottom-4 flex justify-between items-end">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-extrabold text-black flex items-center gap-1 shadow-soft">
              <Star className="size-3.5 fill-black" /> {barber.rating.toFixed(1)} ({barber.review_count} avis)
            </span>
            <span className="rounded-full bg-black/60 backdrop-blur px-3 py-1 text-xs font-semibold text-white flex items-center gap-1">
              <MapPin className="size-3.5 text-amber-400" /> {barber.city}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-white/20 bg-black/50 text-white hover:bg-black/70 backdrop-blur"
          >
            <Share2 className="size-3.5 mr-1.5" /> Partager
          </Button>
        </div>
      </section>

      {/* PROFILE INFO & BOOKING LAYOUT */}
      <section className="container-page pb-24">
        <div className="relative -mt-14 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Main content */}
          <div>
            {/* Header info */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-20 md:size-24 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-elevated shrink-0">
                    <img
                      src={
                        barber.avatar_url ||
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                      }
                      alt={barber.salon_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
                        {barber.salon_name}
                      </h1>
                      <span title="Salon Vérifié">
                        <ShieldCheck className="size-5 text-amber-500 shrink-0" />
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">
                      Par {barber.first_name} {barber.last_name} • Maître Artisan ({barber.experience_years ?? 5} ans d'expérience)
                    </p>
                    {barber.address && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 text-amber-500 shrink-0" /> {barber.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Direct quick booking trigger */}
                <BookingModal barber={barber} services={services}>
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-6 rounded-xl shadow-glow w-full sm:w-auto">
                    <CalendarCheck className="size-4 mr-2" /> Prendre Rendez-vous
                  </Button>
                </BookingModal>
              </div>

              {/* Bio */}
              <div className="mt-6 border-t border-border pt-6">
                <h3 className="font-display text-base font-bold text-foreground">À propos du salon</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {barber.bio || barber.short_bio}
                </p>
              </div>
            </div>

            {/* SERVICES / PRESTATIONS LIST */}
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Menu des Prestations & Tarifs
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sélectionnez votre prestation pour choisir un créneau horaire.
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  {services.length} services disponibles
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border p-4 transition-all hover:border-amber-500/50 hover:bg-muted/30"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-base font-bold text-foreground">
                          {service.name}
                        </h4>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3 text-amber-500" /> {fmtDuration(service.duration_minutes)}
                        </span>
                      </div>
                      {service.description && (
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-lg">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <span className="font-display text-lg font-extrabold text-foreground">
                        {formatDT(service.price)}
                      </span>

                      <BookingModal
                        barber={barber}
                        services={services}
                        selectedServiceId={service.id}
                      >
                        <Button
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-4"
                        >
                          Choisir
                        </Button>
                      </BookingModal>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* REAL PORTFOLIO GALLERY */}
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
              <div className="border-b border-border pb-4 mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Portfolio & Coupes Réalisées
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Aperçu des coiffures, barbes et finitions réalisées au salon.
                </p>
              </div>
              <PhotoGallery photos={gallery} />
            </div>

            {/* REVIEWS */}
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Avis des Clients ({barber.review_count})
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tous les avis sont laissés par des clients ayant honoré leur rendez-vous.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="size-5 fill-amber-500" />
                  <span className="text-lg text-foreground">{barber.rating.toFixed(1)}</span>
                </div>
              </div>
              <ReviewWidgets reviews={reviews} />
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="space-y-6">
            {/* Hours card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="size-4 text-amber-500" /> Horaires d'ouverture
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs">
                {barber.availability.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="font-medium text-foreground">{a.day}</span>
                    <span className="font-semibold text-muted-foreground">{a.hours}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t border-border">
                <BookingModal barber={barber} services={services}>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold shadow-soft">
                    <CalendarCheck className="size-4 mr-2" /> Réserver un créneau
                  </Button>
                </BookingModal>
              </div>
            </div>

            {/* Direct contact card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-base font-bold text-foreground">
                Contact & Informations
              </h3>
              <div className="mt-4 space-y-2.5">
                {barber.whatsapp && (
                  <a
                    href={waLink(barber.whatsapp, `Bonjour ${barber.salon_name}, je souhaite des informations sur vos prestations.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-xs font-semibold text-foreground hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-colors"
                  >
                    <MessageCircle className="size-4 text-emerald-500" />
                    <span>Discuter sur WhatsApp</span>
                  </a>
                )}
                {barber.phone && (
                  <a
                    href={telLink(barber.phone)}
                    className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Phone className="size-4 text-amber-500" />
                    <span>{barber.phone}</span>
                  </a>
                )}
                {barber.instagram && (
                  <a
                    href={`https://instagram.com/${barber.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Instagram className="size-4 text-pink-500" />
                    <span>{barber.instagram}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
