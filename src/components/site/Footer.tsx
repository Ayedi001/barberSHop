import { Link } from "@tanstack/react-router";
import { Scissors, MapPin, Phone, Mail, Instagram, ShieldCheck, Clock } from "lucide-react";
import { Logo } from "./Logo";
import { t } from "@/i18n";

export function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo variant="dark" />
            <p className="mt-4 max-w-sm text-sm text-sidebar-foreground/75 leading-relaxed">
              La première plateforme moderne de prise de rendez-vous en ligne et de gestion dédiée
              aux salons de coiffure masculine et barbiers d'exception.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sidebar-foreground/70">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="grid size-9 place-items-center rounded-lg bg-sidebar-accent hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="tel:+21671000000"
                className="grid size-9 place-items-center rounded-lg bg-sidebar-accent hover:text-white transition-colors"
                aria-label="Téléphone"
              >
                <Phone className="size-4" />
              </a>
              <a
                href="mailto:contact@barbercraft.tn"
                className="grid size-9 place-items-center rounded-lg bg-sidebar-accent hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Navigation
            </p>
            <ul className="mt-4 space-y-2 text-sm text-sidebar-foreground/75">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/barbiers" className="hover:text-white transition-colors">
                  Trouver un barbier
                </Link>
              </li>
              <li>
                <Link to="/comment-ca-marche" className="hover:text-white transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="hover:text-white transition-colors">
                  À propos de nous
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Pour les Barbiers
            </p>
            <ul className="mt-4 space-y-2 text-sm text-sidebar-foreground/75">
              <li>
                <Link
                  to="/inscription"
                  search={{ type: "barber" }}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Scissors className="size-3.5 text-amber-500" /> Rejoindre la plateforme
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white transition-colors">
                  Espace Pro Barbier
                </Link>
              </li>
              <li>
                <span className="text-xs text-sidebar-foreground/50 block mt-1">
                  Agenda intelligent, réservations 24/7, gestion caisse & fidélité.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Engagements
            </p>
            <ul className="mt-4 space-y-3 text-xs text-sidebar-foreground/75">
              <li className="flex items-start gap-2">
                <Clock className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Zéro temps d'attente au salon grâce au créneau garanti.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Barbiers professionnels vérifiés et avis 100% authentiques.</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Partout en Tunisie : Tunis, La Marsa, Ariana, Sousse, Sfax...</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-sidebar-border pt-6 text-xs text-sidebar-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} BarberCraft. {t("footer.rights")}</p>
          <div className="flex gap-4">
            <Link to="/contact" className="hover:text-white transition-colors">
              Mentions Légales
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Politique de Confidentialité
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Conditions Générales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
