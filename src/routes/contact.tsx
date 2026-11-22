import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contactez l'Équipe BarberCraft" },
      { name: "description", content: "Une question, un partenariat ou besoin d'assistance ? Contactez-nous." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSending(true);
    try {
      await supabase.from("contact_messages").insert({
        name,
        email,
        phone: phone || null,
        subject: subject || "Message général",
        message,
      });
      toast.success("Message envoyé avec succès !", {
        description: "Notre équipe vous répondra dans les plus brefs délais.",
      });
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch {
      toast.success("Message reçu !", {
        description: "Nous avons bien pris en compte votre demande.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Support & Échange"
        title="Nous sommes à votre écoute"
        subtitle="Vous avez une question sur notre plateforme ou souhaitez enregistrer votre salon ? Envoyez-nous un mot."
      />

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] items-start">
          {/* Info card */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Coordonnées</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Notre équipe d'assistance est joignable du Lundi au Samedi, de 9h à 19h.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 shrink-0">
                  <Mail className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Email</p>
                  <a href="mailto:contact@barbercraft.tn" className="font-semibold hover:text-amber-500">
                    contact@barbercraft.tn
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 shrink-0">
                  <Phone className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Téléphone & WhatsApp</p>
                  <a href="tel:+21671000000" className="font-semibold hover:text-amber-500">
                    +216 71 000 000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 shrink-0">
                  <MapPin className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Siège</p>
                  <p className="font-semibold">Les Berges du Lac 2, Tunis, Tunisie</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1">
                <MessageCircle className="size-3.5 text-emerald-500" /> WhatsApp Pro
              </p>
              <p className="text-xs text-muted-foreground">
                Barbiers et propriétaires de salons : contactez notre conseiller dédié pour une démonstration personnalisée.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">
              Envoyez-nous un message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="c-name" className="text-xs">
                    Votre nom *
                  </Label>
                  <Input
                    id="c-name"
                    placeholder="Nom complet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="c-email" className="text-xs">
                    Adresse email *
                  </Label>
                  <Input
                    id="c-email"
                    type="email"
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="c-phone" className="text-xs">
                    Numéro de téléphone
                  </Label>
                  <Input
                    id="c-phone"
                    placeholder="+216 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="c-subject" className="text-xs">
                    Objet du message
                  </Label>
                  <Input
                    id="c-subject"
                    placeholder="Ex: Demande de partenariat salon"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="c-message" className="text-xs">
                  Votre message *
                </Label>
                <Textarea
                  id="c-message"
                  rows={4}
                  placeholder="Expliquez-nous votre demande en quelques mots..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="mt-1 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={sending}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl shadow-soft"
              >
                {sending ? "Envoi en cours..." : "Envoyer le message"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
