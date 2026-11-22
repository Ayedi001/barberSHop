-- ============================================================================
-- BarberCraft — Schéma complet Supabase
-- Projet cible : uoqrjaitktrrqvczprlq (https://uoqrjaitktrrqvczprlq.supabase.co)
-- Exécuter ce script dans : Supabase Dashboard -> SQL Editor -> New query
-- ============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enum des rôles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'barber', 'client');
  END IF;
END $$;

-- 3. Profils utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  city text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Rôles utilisateurs
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 4. Barbiers & Salons
CREATE TABLE IF NOT EXISTS public.barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  salon_name text NOT NULL DEFAULT '',
  first_name text NOT NULL,
  last_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  city text NOT NULL DEFAULT '',
  address text,
  phone text,
  whatsapp text,
  email text,
  instagram text,
  short_bio text,
  bio text,
  avatar_url text,
  cover_url text,
  experience_years integer DEFAULT 5,
  rating numeric NOT NULL DEFAULT 4.9,
  review_count integer NOT NULL DEFAULT 0,
  services text[] NOT NULL DEFAULT '{}',
  availability jsonb NOT NULL DEFAULT '[]'::jsonb,
  accepting_bookings boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Services proposés par le barbier
CREATE TABLE IF NOT EXISTS public.barber_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 30,
  price numeric NOT NULL DEFAULT 20,
  category text NOT NULL DEFAULT 'coupe' CHECK (category IN ('coupe', 'barbe', 'combo', 'soin', 'coloration')),
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Clients du salon / barbier
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text,
  email text,
  city text,
  preferred_style text,
  notes text,
  total_visits integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vip')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.barber_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (barber_id, client_id)
);

-- 7. Rendez-vous (Appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.barber_services(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text,
  client_email text,
  service_name text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  price numeric NOT NULL DEFAULT 25,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Demandes de réservation en ligne
CREATE TABLE IF NOT EXISTS public.booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  client_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text,
  client_email text,
  service_name text NOT NULL,
  desired_date date NOT NULL,
  desired_time text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz
);

-- 9. Paiements / Caisse
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  method text NOT NULL DEFAULT 'cash' CHECK (method IN ('cash', 'card', 'transfer', 'other')),
  note text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. Galeries de coiffure
CREATE TABLE IF NOT EXISTS public.galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 11. Avis clients
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  client_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating numeric NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 13. Signalements
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid REFERENCES public.barbers(id) ON DELETE SET NULL,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 14. Messages de contact
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Helper pour vérifier le rôle
CREATE OR REPLACE FUNCTION public.has_role(r public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = r
  );
$$;

-- Helper pour récupérer l'ID du barbier lié à l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.current_barber_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM public.barbers WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Politiques RLS (Idempotent)
DROP POLICY IF EXISTS "Profiles readable by anyone authenticated" ON public.profiles;
CREATE POLICY "Profiles readable by anyone authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Profiles editable by owner or admin" ON public.profiles;
CREATE POLICY "Profiles editable by owner or admin" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Roles readable by authenticated" ON public.user_roles;
CREATE POLICY "Roles readable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Roles manageable by admin" ON public.user_roles;
CREATE POLICY "Roles manageable by admin" ON public.user_roles FOR ALL TO authenticated USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Active barbers publicly readable" ON public.barbers;
CREATE POLICY "Active barbers publicly readable" ON public.barbers FOR SELECT TO anon, authenticated USING (status = 'active' OR user_id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Barbers can update own record" ON public.barbers;
CREATE POLICY "Barbers can update own record" ON public.barbers FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Barbers can insert own record" ON public.barbers;
CREATE POLICY "Barbers can insert own record" ON public.barbers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Services publicly readable" ON public.barber_services;
CREATE POLICY "Services publicly readable" ON public.barber_services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Services manageable by barber or admin" ON public.barber_services;
CREATE POLICY "Services manageable by barber or admin" ON public.barber_services FOR ALL TO authenticated USING (barber_id = public.current_barber_id() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Clients readable by their barber or admin" ON public.clients;
CREATE POLICY "Clients readable by their barber or admin" ON public.clients FOR SELECT TO authenticated USING (barber_id = public.current_barber_id() OR user_id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Clients manageable by their barber or admin" ON public.clients;
CREATE POLICY "Clients manageable by their barber or admin" ON public.clients FOR ALL TO authenticated USING (barber_id = public.current_barber_id() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Appointments readable by barber or client" ON public.appointments;
CREATE POLICY "Appointments readable by barber or client" ON public.appointments FOR SELECT TO authenticated USING (barber_id = public.current_barber_id() OR client_user_id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Appointments insertable by barber or client" ON public.appointments;
CREATE POLICY "Appointments insertable by barber or client" ON public.appointments FOR INSERT TO authenticated WITH CHECK (barber_id = public.current_barber_id() OR client_user_id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Appointments modifiable by barber or admin" ON public.appointments;
CREATE POLICY "Appointments modifiable by barber or admin" ON public.appointments FOR UPDATE TO authenticated USING (barber_id = public.current_barber_id() OR client_user_id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Requests readable by barber or submitter" ON public.booking_requests;
CREATE POLICY "Requests readable by barber or submitter" ON public.booking_requests FOR SELECT TO authenticated USING (barber_id = public.current_barber_id() OR client_user_id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Requests insertable by anyone" ON public.booking_requests;
CREATE POLICY "Requests insertable by anyone" ON public.booking_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Requests manageable by barber or admin" ON public.booking_requests;
CREATE POLICY "Requests manageable by barber or admin" ON public.booking_requests FOR UPDATE TO authenticated USING (barber_id = public.current_barber_id() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Payments readable by barber or admin" ON public.payments;
CREATE POLICY "Payments readable by barber or admin" ON public.payments FOR SELECT TO authenticated USING (barber_id = public.current_barber_id() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Payments manageable by barber or admin" ON public.payments;
CREATE POLICY "Payments manageable by barber or admin" ON public.payments FOR ALL TO authenticated USING (barber_id = public.current_barber_id() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Galleries publicly readable" ON public.galleries;
CREATE POLICY "Galleries publicly readable" ON public.galleries FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Galleries manageable by barber or admin" ON public.galleries;
CREATE POLICY "Galleries manageable by barber or admin" ON public.galleries FOR ALL TO authenticated USING (barber_id = public.current_barber_id() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Reviews publicly readable" ON public.reviews;
CREATE POLICY "Reviews publicly readable" ON public.reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Reviews insertable by clients" ON public.reviews;
CREATE POLICY "Reviews insertable by clients" ON public.reviews FOR INSERT TO authenticated WITH CHECK (client_user_id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS "Notifications for owner" ON public.notifications;
CREATE POLICY "Notifications for owner" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Reports insertable by users" ON public.reports;
CREATE POLICY "Reports insertable by users" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Reports manageable by admin" ON public.reports;
CREATE POLICY "Reports manageable by admin" ON public.reports FOR ALL TO authenticated USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Contact messages insertable by anyone" ON public.contact_messages;
CREATE POLICY "Contact messages insertable by anyone" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Contact messages readable by admin" ON public.contact_messages;
CREATE POLICY "Contact messages readable by admin" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role('admin'));

-- ============================================================================
-- Déclencheur automatique de création de profil à l'inscription
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_role public.app_role;
  v_name text;
  v_slug text;
BEGIN
  v_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  
  -- Insérer le profil
  INSERT INTO public.profiles (id, full_name, email, phone, city)
  VALUES (
    new.id,
    v_name,
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'city', 'Tunis')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone;

  -- Déterminer le rôle demandé
  IF (new.raw_user_meta_data->>'role') = 'barber' THEN
    v_role := 'barber';
    
    v_slug := lower(regexp_replace(v_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(new.id::text, 1, 6);
    
    INSERT INTO public.barbers (
      user_id,
      salon_name,
      first_name,
      last_name,
      slug,
      city,
      phone,
      short_bio,
      status
    ) VALUES (
      new.id,
      coalesce(new.raw_user_meta_data->>'salon_name', 'Salon ' || v_name),
      split_part(v_name, ' ', 1),
      coalesce(nullif(split_part(v_name, ' ', 2), ''), 'Barbier'),
      v_slug,
      coalesce(new.raw_user_meta_data->>'city', 'Tunis'),
      new.raw_user_meta_data->>'phone',
      'Artisan barbier passionné, spécialisé dans les coupes modernes et l''entretien traditionnel de la barbe.',
      'active'
    )
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF (new.raw_user_meta_data->>'role') = 'admin' THEN
    v_role := 'admin';
  ELSE
    v_role := 'client';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, v_role)
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Données de Salons Barbiers Initiales (Seeding direct pour votre base)
-- ============================================================================

INSERT INTO public.barbers (id, slug, salon_name, first_name, last_name, city, address, phone, whatsapp, email, instagram, short_bio, bio, avatar_url, cover_url, experience_years, rating, review_count, services, availability, accepting_bookings, status)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'mehdi-the-gentlemen',
    'The Gentlemen''s Club — Barber & Lounge',
    'Mehdi',
    'Trabelsi',
    'La Marsa',
    '24 Avenue Habib Bourguiba, La Marsa, Tunis',
    '+216 98 111 222',
    '+216 98 111 222',
    'contact@gentlemensclub.tn',
    '@gentlemens_marsa',
    'Maître barbier formé à Londres. Spécialiste des dégradés américains, rituels serviette chaude et taille de barbe royale.',
    'Avec plus de 12 ans d''expérience dans l''artisanat du cheveu et de la barbe masculine, Mehdi vous accueille dans un cadre lounge feutré mêlant fauteuils vintage en cuir et musique jazz.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1000&q=80',
    12,
    4.96,
    148,
    ARRAY['Coupe Dégradé Américain (Fade)', 'Taille de Barbe & Serviette Chaude', 'Formule VIP Coupe + Barbe', 'Soin du Visage Vapeur & Argile'],
    '[{"day": "Lundi - Vendredi", "hours": "10:00 - 20:30"}, {"day": "Samedi", "hours": "09:00 - 21:00"}]'::jsonb,
    true,
    'active'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'youssef-barber-king',
    'Barber King Studio',
    'Youssef',
    'Ben Amor',
    'Ariana',
    'Résidence Les Jardins, Ennasr 2, Ariana',
    '+216 55 333 444',
    '+216 55 333 444',
    'barberking.ennasr@gmail.com',
    '@barberking_ennasr',
    'Expert textures modernes, taper fade précis, hair designs et soins capillaires revitalisants.',
    'Youssef allie modernité urbaine et précision géométrique. Équipé du meilleur matériel professionnel, il vous garantit un résultat net et durable.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1000&q=80',
    8,
    4.92,
    112,
    ARRAY['Coupe Dégradé Taper / Skin Fade', 'Sculpture Barbe Précision Rasoir', 'Pack Marié VIP', 'Teinture / Camouflage Barbe'],
    '[{"day": "Mardi - Samedi", "hours": "09:30 - 20:00"}, {"day": "Dimanche", "hours": "10:00 - 18:00"}]'::jsonb,
    true,
    'active'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'karim-vintage-blade',
    'Vintage Blade Barbershop',
    'Karim',
    'Jaziri',
    'Tunis',
    '12 Rue de Marseille, Tunis Centre',
    '+216 22 444 555',
    '+216 22 444 555',
    'karim.vintageblade@gmail.com',
    '@vintageblade_tn',
    'Le charme authentique du rasage traditionnel à l''ancienne, coupe aux ciseaux et ambiance rétro.',
    'Pour les puristes du rasoir coupe-chou et des ciseaux de précision. Karim perpétue les traditions barber depuis 15 ans.',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1000&q=80',
    15,
    4.89,
    96,
    ARRAY['Coupe Classique Homme', 'Rasage Traditionnel Coupe-Chou', 'Entretien Barbe & Huile d''Argan'],
    '[{"day": "Lundi - Samedi", "hours": "09:00 - 19:30"}]'::jsonb,
    true,
    'active'
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'sofiane-urban-fade',
    'Urban Fade Studio',
    'Sofiane',
    'Gharbi',
    'Sousse',
    'Zone Touristique Port El Kantaoui, Sousse',
    '+216 94 666 777',
    '+216 94 666 777',
    'urbanfade.kantaoui@gmail.com',
    '@urbanfade_sousse',
    'Le repaire des styles tendance à Sousse : low fade, burst fade, décolorations et soins de luxe.',
    'Une équipe jeune et dynamique au cœur du Port El Kantaoui pour des coupes modernes.',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1000&q=80',
    7,
    4.94,
    85,
    ARRAY['Coupe Tendance & Dégradé Flou', 'Barbe Dégradée & Contour Précis', 'Formule Duo Coupe + Soin'],
    '[{"day": "Tous les jours", "hours": "10:00 - 22:00"}]'::jsonb,
    true,
    'active'
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'amine-latelier',
    'L''Atelier du Barbier',
    'Amine',
    'Cherif',
    'Sfax',
    'Route de Téniour Km 2, Sfax',
    '+216 29 888 999',
    '+216 29 888 999',
    'atelier.barbier.sfax@gmail.com',
    '@latelier_sfax',
    'Précision millimétrée, service café premium offert et ponctualité exemplaire garantie.',
    'Chez L''Atelier, pas d''attente interminable : votre créneau vous est réservé à la minute près.',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1000&q=80',
    10,
    4.91,
    104,
    ARRAY['Coupe Ciseaux & Tondeuse', 'Taille de Barbe & Soin Hydratant', 'Black Mask Purifiant Visage'],
    '[{"day": "Lundi - Samedi", "hours": "08:30 - 20:00"}]'::jsonb,
    true,
    'active'
  )
ON CONFLICT (slug) DO UPDATE SET
  salon_name = EXCLUDED.salon_name,
  city = EXCLUDED.city,
  address = EXCLUDED.address,
  rating = EXCLUDED.rating,
  cover_url = EXCLUDED.cover_url,
  avatar_url = EXCLUDED.avatar_url;

-- Services pour le salon principal
INSERT INTO public.barber_services (barber_id, name, description, duration_minutes, price, category, position)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Coupe Dégradé Américain (Fade)', 'Low, Mid ou High Fade au rasoir et ciseaux avec shampoing relaxant et coiffage offert.', 30, 25, 'coupe', 1),
  ('a1111111-1111-1111-1111-111111111111', 'Taille de Barbe & Serviette Chaude', 'Sculpture sur-mesure, contour au rasoir, rituel serviette chaude aux huiles essentielles.', 20, 18, 'barbe', 2),
  ('a1111111-1111-1111-1111-111111111111', 'Formule VIP : Coupe + Barbe + Soin', 'La totale : coupe dégradé, taille de barbe rituel complet, masque visage purifiant et coiffage.', 50, 45, 'combo', 3),
  ('a1111111-1111-1111-1111-111111111111', 'Soin Visage Vapeur & Gommage', 'Bain de vapeur à l''ozone, gommage exfoliant doux et masque hydratant visage.', 25, 25, 'soin', 4),
  ('a1111111-1111-1111-1111-111111111111', 'Pack Marié Prestige', 'Séance privatisée : coupe, barbe, rituel complet soin visage, épilation sourcils et finitions.', 75, 90, 'combo', 5)
ON CONFLICT DO NOTHING;

-- Galeries photos
INSERT INTO public.galleries (barber_id, image_url, caption, position)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1000&q=80', 'Skin fade texturé & finitions au rasoir', 1),
  ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80', 'Sculpture de barbe et contours nets', 2),
  ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1000&q=80', 'Espace barbier lounge & fauteuils vintage', 3),
  ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1000&q=80', 'Rituel serviette chaude et soin vapeur', 4),
  ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1000&q=80', 'Matériel professionnel stérilisé', 5),
  ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1000&q=80', 'Coiffage aux poudres texturisantes mates', 6)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Procédure de peuplement de données de démo pour le barbier connecté
-- ============================================================================

CREATE OR REPLACE FUNCTION public.seed_my_barber_demo_data()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_barber_id uuid;
  v_c1 uuid; v_c2 uuid; v_c3 uuid; v_c4 uuid;
  v_s1 uuid; v_s2 uuid; v_s3 uuid; v_s4 uuid;
BEGIN
  SELECT id INTO v_barber_id FROM public.barbers WHERE user_id = auth.uid() LIMIT 1;
  IF v_barber_id IS NULL THEN
    RAISE EXCEPTION 'Aucun profil barbier associé à votre compte.';
  END IF;

  -- 1. Insérer des prestations standards
  INSERT INTO public.barber_services (barber_id, name, description, duration_minutes, price, category, position)
  VALUES
    (v_barber_id, 'Coupe Dégradé Américain (Fade)', 'Taper, low fade ou skin fade aux ciseaux et tondeuse avec finitions rasoir.', 30, 25, 'coupe', 1),
    (v_barber_id, 'Taille de Barbe & Traçage', 'Sculpture à l''ancienne, serviette chaude relaxante et huile de soin.', 20, 18, 'barbe', 2),
    (v_barber_id, 'Formule VIP Coupe + Barbe', 'Coupe complète personnalisée, soin barbe vapeur, shampoing et coiffage.', 45, 40, 'combo', 3),
    (v_barber_id, 'Soin du Visage & Black Mask', 'Gommage exfoliant, vapeur purifiante et masque purifiant éclat.', 25, 25, 'soin', 4)
  RETURNING id INTO v_s1;

  -- 2. Insérer des clients d'exemple
  INSERT INTO public.clients (barber_id, full_name, phone, city, preferred_style, notes, total_visits, status)
  VALUES (v_barber_id, 'Mohamed Ben Salem', '+216 98 123 456', 'Tunis', 'Dégradé à blanc + barbe courte', 'Client habitué, vient tous les samedis matin.', 12, 'vip')
  RETURNING id INTO v_c1;

  INSERT INTO public.clients (barber_id, full_name, phone, city, preferred_style, notes, total_visits, status)
  VALUES (v_barber_id, 'Karim Trabelsi', '+216 55 234 567', 'Ariana', 'Coupe classique ciseaux + dégradé léger', 'Préfère produit mat, pas de gel.', 6, 'active')
  RETURNING id INTO v_c2;

  INSERT INTO public.clients (barber_id, full_name, phone, city, preferred_style, notes, total_visits, status)
  VALUES (v_barber_id, 'Yassine Gharbi', '+216 22 345 678', 'La Marsa', 'Formule VIP Mariage', 'Rendez-vous préparatoire événement.', 3, 'active')
  RETURNING id INTO v_c3;

  INSERT INTO public.clients (barber_id, full_name, phone, city, preferred_style, notes, total_visits, status)
  VALUES (v_barber_id, 'Amine Chahed', '+216 29 456 789', 'Tunis', 'Taille de barbe sculptée', 'Attention peau sensible, serviette tiède.', 8, 'active')
  RETURNING id INTO v_c4;

  -- 3. Insérer des rendez-vous
  INSERT INTO public.appointments (barber_id, client_id, client_name, client_phone, service_name, duration_minutes, price, starts_at, ends_at, status, notes)
  VALUES
    (v_barber_id, v_c1, 'Mohamed Ben Salem', '+216 98 123 456', 'Formule VIP Coupe + Barbe', 45, 40, now() + interval '1 hour', now() + interval '1 hour 45 minutes', 'confirmed', 'Habitué'),
    (v_barber_id, v_c2, 'Karim Trabelsi', '+216 55 234 567', 'Coupe Dégradé Américain (Fade)', 30, 25, now() + interval '3 hours', now() + interval '3 hours 30 minutes', 'confirmed', 'Ponctuel'),
    (v_barber_id, v_c3, 'Yassine Gharbi', '+216 22 345 678', 'Taille de Barbe & Traçage', 20, 18, now() + interval '1 day 2 hours', now() + interval '1 day 2 hours 20 minutes', 'confirmed', 'Réservation en ligne'),
    (v_barber_id, v_c4, 'Amine Chahed', '+216 29 456 789', 'Soin du Visage & Black Mask', 25, 25, now() - interval '2 hours', now() - interval '1 hour 35 minutes', 'completed', 'Payé en espèces');

  -- 4. Insérer des demandes de réservation
  INSERT INTO public.booking_requests (barber_id, client_name, client_phone, service_name, desired_date, desired_time, price, notes, status)
  VALUES
    (v_barber_id, 'Hedi Mansour', '+216 94 888 999', 'Coupe Dégradé Américain (Fade)', current_date + 1, '14:30', 25, 'Créneau après le travail si possible', 'pending'),
    (v_barber_id, 'Sofiene Jaziri', '+216 50 111 222', 'Formule VIP Coupe + Barbe', current_date + 2, '16:00', 40, 'Recommandé par Mohamed', 'pending');

  -- 5. Insérer des encaissements / caisse
  INSERT INTO public.payments (barber_id, client_id, amount, method, note, paid_at)
  VALUES
    (v_barber_id, v_c1, 40, 'cash', 'Formule VIP Coupe + Barbe', now() - interval '6 days'),
    (v_barber_id, v_c2, 25, 'card', 'Coupe Dégradé', now() - interval '4 days'),
    (v_barber_id, v_c4, 25, 'cash', 'Soin du Visage', now() - interval '2 hours'),
    (v_barber_id, v_c1, 40, 'cash', 'Formule VIP', now() - interval '14 days');

  RETURN jsonb_build_object('success', true, 'message', 'Données de démo barbier créées avec succès !');
END;
$$;
