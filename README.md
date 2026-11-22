# BarberCraft — Plateforme de Réservation & Gestion pour Barbiers

Plateforme moderne de prise de rendez-vous en ligne, agenda intelligent et gestion de caisse pour coiffeurs masculins et salons barbiers d'exception.

---

## 💈 Fonctionnalités Principales

### 🌐 Portail Public & Clients
- **Page d'accueil élégante** : Bannière hero avec moteur de recherche rapide par ville, catégories de prestations populaires (Fade, Barbe, Pack Marié, Soin vapeur), avis vérifiés et portfolio réel.
- **Annuaire des salons (`/barbiers`)** : Filtres en direct par ville, mot-clé, prestations et salons disponibles aujourd'hui.
- **Fiche Salon & Profil Barbier (`/barbier/$slug`)** : Présentation du salon, horaires d'ouverture, coordonnées (WhatsApp direct, appel, Instagram), portfolio photo avec agrandissement lightbox, avis certifiés et menu détaillé des tarifs.
- **Tunnel de réservation interactif** : Choix du service, sélection de la date et du créneau horaire en temps réel, coordonnées client et confirmation instantanée.
- **Espace Client (`/client`)** : Tableau de bord avec compte à rebours du prochain rendez-vous, gestion des rendez-vous (annulation/historique), répertoires des salons favoris et reçus de caisse.

### ✂️ Espace Professionnel Barbier (`/pro`)
- **Tableau de bord (`/pro/index`)** : Indicateurs clés (RDV du jour, chiffre d'affaires du mois, clients actifs, demandes en attente) et bouton d'action *Charger des données de démo*.
- **Agenda & Planning interactif (`/pro/planning`)** : Vues Jour, Semaine et Mois, créneaux horaires, ajout de rendez-vous manuel pour clients de passage, statuts en direct (*Confirmé*, *Terminé*, *Annulé*).
- **Demandes de réservation (`/pro/demandes`)** : Validation ou refus des réservations en ligne avec insertion automatique dans l'agenda et contact direct WhatsApp/Téléphone.
- **Fichier Clients (`/pro/clients`)** : Répertoire clients avec historique de visites, styles et coupes préférés, notes techniques (numéro de sabot, spécificités).
- **Caisse & Chiffre d'Affaires (`/pro/finances`)** : Enregistrement des encaissements, répartition Espèces vs Carte/Virement, panier moyen et historique des rentrées.
- **Configuration Salon & Carte (`/pro/profil`)** : Modification des informations du salon, adresse, horaires d'ouverture et gestion complète des prestations (création, prix, durée, suppression).

### 🛡️ Espace Super Administrateur (`/admin`)
- **Vue d'ensemble plateforme (`/admin/index`)** : Statistiques globales (salons, utilisateurs, volume total).
- **Modération des Salons (`/admin/barbiers`)** : Activation, suspension et contrôle des profils barbiers.
- **Gestion des Utilisateurs (`/admin/clients`)** : Liste des comptes inscrits.
- **Supervision des Rendez-vous (`/admin/demandes`)** : Flux de tous les rendez-vous pris sur la plateforme.
- **Modération & Messages (`/admin/signalements` & `/admin/messages`)** : Traitement des signalements et réponses aux demandes de contact.

---

## 🚀 Configuration & Démarrage Local

1. **Installer les dépendances** :
   ```sh
   npm install
   ```

2. **Configurer les variables d'environnement dans `.env`** :
   ```env
   SUPABASE_PROJECT_ID="mpqdatzadwkapjfgjzkq"
   SUPABASE_URL="https://mpqdatzadwkapjfgjzkq.supabase.co"
   SUPABASE_PUBLISHABLE_KEY="votre_publishable_key"
   VITE_SUPABASE_PROJECT_ID="mpqdatzadwkapjfgjzkq"
   VITE_SUPABASE_URL="https://mpqdatzadwkapjfgjzkq.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="votre_publishable_key"
   ```

3. **Exécuter le schéma SQL** [supabase/schema.sql](supabase/schema.sql) dans l'éditeur SQL de votre projet Supabase.

4. **Lancer le serveur de développement** :
   ```sh
   npm run dev
   ```

5. **Exécuter la suite de tests unitaires** :
   ```sh
   npm test
   ```
