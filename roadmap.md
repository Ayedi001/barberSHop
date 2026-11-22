# BarberCraft — Feuille de route & Statut du Projet

- [x] Structure du projet calquée sur Permis (TanStack Start, TanStack Router, Vite, Tailwind CSS v4, Lucide Icons, Shadcn UI)
- [x] Schéma PostgreSQL complet Supabase avec Row Level Security, rôles (admin, barber, client), tables de rendez-vous, prestations, clients, caisse et déclencheur d'inscription
- [x] Procédure RPC `seed_my_barber_demo_data` pour peupler instantanément un salon de démonstration complet
- [x] Design system thématique Barbershop (couleurs luxueuses, finitions ambrées/or vintage, fonds ardoise/charbon, cartes et typographie moderne)
- [x] Layouts protégés par rôles (`/_authenticated/pro`, `/_authenticated/client`, `/_authenticated/admin`)
- [x] Espace Barbier Pro : Tableau de bord, Planning interactif (Jour/Semaine/Mois), Demandes en attente, Fichier Clients, Caisse & Revenus, Gestion du Salon & Prestations
- [x] Espace Client : Accueil avec prochain rendez-vous, Mes rendez-vous avec annulation, Salons favoris, Reçus de paiement
- [x] Espace Admin : Vue d'ensemble, Gestion des barbiers (activer/suspendre), Utilisateurs, Supervision des rendez-vous, Signalements, Messages
- [x] Portail Public : Accueil, Annuaire des barbiers avec filtres en direct (ville, disponibilité, mot-clé), Fiche salon avec portfolio photo lightbox et tunnel de réservation instantané
- [x] Pages statiques d'information : À propos, Comment ça marche, Contact & Assistance
- [x] Module de calculs financiers et de durées de prestation (`finance.ts`) avec tests unitaires Vitest (5/5 tests validés)
- [x] Vérification de typage TypeScript strict (`tsc --noEmit` : 0 erreur)
