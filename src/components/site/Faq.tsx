import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Comment fonctionne la réservation sur BarberCraft ?",
    a: "C'est très simple : choisissez un barbier ou salon sur la plateforme, sélectionnez votre prestation (coupe, barbe, pack complet), puis l'horaire qui vous arrange. Vous recevez une confirmation instantanée.",
  },
  {
    q: "Dois-je payer en ligne lors de la réservation ?",
    a: "Non, la majorité des barbiers acceptent le règlement directement sur place au salon après votre prestation (espèces, carte bancaire ou virement instantané).",
  },
  {
    q: "Puis-je modifier ou annuler mon rendez-vous ?",
    a: "Oui, vous pouvez facilement annuler ou reporter votre créneau depuis votre espace client ou via le lien reçu, au minimum 2 heures à l'avance pour libérer la place.",
  },
  {
    q: "Je suis coiffeur ou gérant d'un salon de coiffure, comment m'inscrire ?",
    a: "Cliquez sur 'Espace Pro Barbier' puis 'Rejoindre la plateforme'. Vous pourrez créer votre profil en 2 minutes, configurer vos prestations, tarifs et horaires d'ouverture.",
  },
  {
    q: "Quels sont les avantages pour les professionnels du cheveu ?",
    a: "BarberCraft élimine les files d'attente désorganisées, remplit vos créneaux creux, envoie des rappels SMS/WhatsApp automatiques pour réduire les rendez-vous manqués et vous donne une visibilité premium en ligne.",
  },
];

export function Faq() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto space-y-3">
      {FAQS.map((f, i) => (
        <AccordionItem
          key={i}
          value={`item-${i}`}
          className="rounded-xl border border-border bg-card px-5 shadow-soft"
        >
          <AccordionTrigger className="text-left font-display text-sm md:text-base font-bold text-foreground hover:text-amber-500 hover:no-underline py-4">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
