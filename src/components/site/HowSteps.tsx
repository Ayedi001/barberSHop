import { Search, CalendarCheck, Sparkles, Scissors } from "lucide-react";

export function HowSteps() {
  const steps = [
    {
      num: "01",
      icon: Search,
      title: "Trouvez le barbier idéal",
      desc: "Explorez les meilleurs salons près de chez vous, comparez les dégradés, tarifs, avis vérifiés et portfolios réels.",
    },
    {
      num: "02",
      icon: CalendarCheck,
      title: "Réservez en 30 secondes",
      desc: "Choisissez votre prestation (coupe, barbe, soin) et votre créneau disponible en temps réel, 24h/24 et 7j/7.",
    },
    {
      num: "03",
      icon: Sparkles,
      title: "Zéro file d'attente",
      desc: "Arrivez à l'heure convenue au salon : votre fauteuil est prêt. Profitez d'un service premium sans perdre votre temps.",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {steps.map((s, idx) => (
        <div
          key={s.num}
          className="relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:border-amber-500/40 hover:shadow-card group"
        >
          <div className="flex items-center justify-between">
            <span className="grid size-12 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors">
              <s.icon className="size-6" />
            </span>
            <span className="font-display text-3xl font-extrabold text-muted-foreground/30 group-hover:text-amber-500/40 transition-colors">
              {s.num}
            </span>
          </div>

          <h3 className="mt-5 font-display text-lg font-bold text-foreground">
            {s.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {s.desc}
          </p>
        </div>
      ))}
    </div>
  );
}
