export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          city: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: "admin" | "barber" | "client";
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "admin" | "barber" | "client";
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: "admin" | "barber" | "client";
        };
        Relationships: [];
      };
      barbers: {
        Row: {
          id: string;
          user_id: string | null;
          salon_name: string;
          first_name: string;
          last_name: string;
          slug: string;
          city: string;
          address: string | null;
          phone: string | null;
          whatsapp: string | null;
          email: string | null;
          instagram: string | null;
          short_bio: string | null;
          bio: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          experience_years: number | null;
          rating: number;
          review_count: number;
          services: string[];
          availability: Json;
          accepting_bookings: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          salon_name?: string;
          first_name: string;
          last_name: string;
          slug: string;
          city?: string;
          address?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          instagram?: string | null;
          short_bio?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          experience_years?: number | null;
          rating?: number;
          review_count?: number;
          services?: string[];
          availability?: Json;
          accepting_bookings?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          salon_name?: string;
          first_name?: string;
          last_name?: string;
          slug?: string;
          city?: string;
          address?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          instagram?: string | null;
          short_bio?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          experience_years?: number | null;
          rating?: number;
          review_count?: number;
          services?: string[];
          availability?: Json;
          accepting_bookings?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      barber_services: {
        Row: {
          id: string;
          barber_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          category: string;
          position: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          barber_id: string;
          name: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          category?: string;
          position?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          barber_id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          category?: string;
          position?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          barber_id: string;
          user_id: string | null;
          full_name: string;
          phone: string | null;
          email: string | null;
          city: string | null;
          preferred_style: string | null;
          notes: string | null;
          total_visits: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          barber_id: string;
          user_id?: string | null;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          city?: string | null;
          preferred_style?: string | null;
          notes?: string | null;
          total_visits?: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          barber_id?: string;
          user_id?: string | null;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          city?: string | null;
          preferred_style?: string | null;
          notes?: string | null;
          total_visits?: number;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          barber_id: string;
          client_id: string | null;
          client_user_id: string | null;
          service_id: string | null;
          client_name: string;
          client_phone: string | null;
          client_email: string | null;
          service_name: string;
          duration_minutes: number;
          price: number;
          starts_at: string;
          ends_at: string;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          barber_id: string;
          client_id?: string | null;
          client_user_id?: string | null;
          service_id?: string | null;
          client_name: string;
          client_phone?: string | null;
          client_email?: string | null;
          service_name: string;
          duration_minutes?: number;
          price?: number;
          starts_at: string;
          ends_at: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          barber_id?: string;
          client_id?: string | null;
          client_user_id?: string | null;
          service_id?: string | null;
          client_name?: string;
          client_phone?: string | null;
          client_email?: string | null;
          service_name?: string;
          duration_minutes?: number;
          price?: number;
          starts_at?: string;
          ends_at?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      booking_requests: {
        Row: {
          id: string;
          barber_id: string;
          client_user_id: string | null;
          client_name: string;
          client_phone: string | null;
          client_email: string | null;
          service_name: string;
          desired_date: string;
          desired_time: string;
          price: number;
          notes: string | null;
          status: string;
          created_at: string;
          decided_at: string | null;
        };
        Insert: {
          id?: string;
          barber_id: string;
          client_user_id?: string | null;
          client_name: string;
          client_phone?: string | null;
          client_email?: string | null;
          service_name: string;
          desired_date: string;
          desired_time: string;
          price?: number;
          notes?: string | null;
          status?: string;
          created_at?: string;
          decided_at?: string | null;
        };
        Update: {
          id?: string;
          barber_id?: string;
          client_user_id?: string | null;
          client_name?: string;
          client_phone?: string | null;
          client_email?: string | null;
          service_name?: string;
          desired_date?: string;
          desired_time?: string;
          price?: number;
          notes?: string | null;
          status?: string;
          created_at?: string;
          decided_at?: string | null;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          barber_id: string;
          appointment_id: string | null;
          client_id: string | null;
          amount: number;
          method: string;
          note: string | null;
          paid_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          barber_id: string;
          appointment_id?: string | null;
          client_id?: string | null;
          amount: number;
          method?: string;
          note?: string | null;
          paid_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          barber_id?: string;
          appointment_id?: string | null;
          client_id?: string | null;
          amount?: number;
          method?: string;
          note?: string | null;
          paid_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      galleries: {
        Row: {
          id: string;
          barber_id: string;
          image_url: string;
          caption: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          barber_id: string;
          image_url: string;
          caption?: string | null;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          barber_id?: string;
          image_url?: string;
          caption?: string | null;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          barber_id: string;
          client_user_id: string;
          author_name: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          barber_id: string;
          client_user_id: string;
          author_name: string;
          rating: number;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          barber_id?: string;
          client_user_id?: string;
          author_name?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string | null;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body?: string | null;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string | null;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          barber_id: string | null;
          reporter_id: string;
          reason: string;
          details: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          barber_id?: string | null;
          reporter_id: string;
          reason: string;
          details?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          barber_id?: string | null;
          reporter_id?: string;
          reason?: string;
          details?: string | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      seed_my_barber_demo_data: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
    };
    Enums: {
      app_role: "admin" | "barber" | "client";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
