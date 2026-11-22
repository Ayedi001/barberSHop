import { Link } from "@tanstack/react-router";
import { Star, MapPin, Scissors, CalendarCheck, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicBarber } from "@/lib/public.functions";

export function BarberCard({ barber }: { barber: PublicBarber }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-card">
      {/* Cover image */}
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        <img
          src={barber.cover_url || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80"}
          alt={barber.salon_name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* City tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
          <MapPin className="size-3.5 text-amber-400" />
          <span>{barber.city}</span>
        </div>

        {/* Rating tag */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-black shadow-soft">
          <Star className="size-3.5 fill-black" />
          <span>{barber.rating.toFixed(1)}</span>
          <span className="text-[10px] opacity-75">({barber.review_count})</span>
        </div>

        {/* Avatar overlay */}
        <div className="absolute -bottom-5 left-5">
          <div className="relative size-14 overflow-hidden rounded-full border-2 border-card bg-muted shadow-elevated">
            <img
              src={barber.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"}
              alt={`${barber.first_name} ${barber.last_name}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 pt-8">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-amber-500 transition-colors">
              {barber.salon_name}
            </h3>
            <span title="Barbier Vérifié">
              <ShieldCheck className="size-4 text-amber-500 shrink-0" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Par {barber.first_name} {barber.last_name} • {barber.experience_years ?? 5} ans d'expérience
          </p>
        </div>

        {barber.short_bio && (
          <p className="mt-3 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {barber.short_bio}
          </p>
        )}

        {/* Services tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {barber.services.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-md bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-foreground/80"
            >
              {s}
            </span>
          ))}
          {barber.services.length > 3 && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{barber.services.length - 3}
            </span>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3.5 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Disponible aujourd'hui</span>
          </div>

          <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-soft">
            <Link to="/barbier/$slug" params={{ slug: barber.slug }}>
              <CalendarCheck className="size-3.5 mr-1.5" /> Réserver
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
