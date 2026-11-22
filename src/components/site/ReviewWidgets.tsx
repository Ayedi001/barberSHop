import { Star, Quote } from "lucide-react";
import type { BarberReview } from "@/lib/public.functions";

export function ReviewWidgets({ reviews = [] }: { reviews?: BarberReview[] }) {
  const displayReviews = reviews.length > 0 ? reviews : [
    {
      id: "rev-1",
      barber_id: "demo",
      client_user_id: "1",
      author_name: "Yassine Mansour",
      rating: 5,
      comment: "Rendez-vous pris à 14h, pris sur le fauteuil à 14h pile. Dégradé américain net et précis. Rien à redire !",
      created_at: "Hier",
    },
    {
      id: "rev-2",
      barber_id: "demo",
      client_user_id: "2",
      author_name: "Amine Toumi",
      rating: 5,
      comment: "Le service serviette chaude et taille de barbe avec les huiles naturelles est juste exceptionnel. Très propre.",
      created_at: "Il y a 3 jours",
    },
    {
      id: "rev-3",
      barber_id: "demo",
      client_user_id: "3",
      author_name: "Karim Belhadj",
      rating: 5,
      comment: "Fini de poireauter 2 heures le samedi après-midi au salon ! BarberCraft m'a fait gagner un temps précieux.",
      created_at: "Il y a 1 semaine",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {displayReviews.map((r) => (
        <div
          key={r.id}
          className="relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i < r.rating ? "fill-amber-500" : "text-muted"}`}
                  />
                ))}
              </div>
              <Quote className="size-6 text-muted-foreground/20" />
            </div>
            <p className="mt-4 text-sm text-foreground/90 leading-relaxed italic">
              "{r.comment}"
            </p>
          </div>

          <div className="mt-6 border-t border-border pt-4 flex items-center justify-between">
            <span className="font-display text-sm font-bold text-foreground">
              {r.author_name}
            </span>
            <span className="text-xs text-muted-foreground">{r.created_at}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
