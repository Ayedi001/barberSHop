import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Scissors, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthShell } from "@/components/site/AuthShell";
import { OrDivider, SocialButtons } from "@/components/site/SocialButtons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CITIES } from "@/lib/site";

export const Route = createFileRoute("/inscription")({
  validateSearch: (s: Record<string, unknown>): { type?: "barber" | "client" } => ({
    type: s["type"] === "barber" ? "barber" : "client",
  }),
  head: () => ({
    meta: [
      { title: "Inscription — BarberCraft" },
      {
        name: "description",
        content: "Créez votre compte client ou inscrivez votre salon de coiffure masculine sur BarberCraft.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const [role, setRole] = useState<"client" | "barber">(search.type ?? "client");
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Tunis");
  const [salonName, setSalonName] = useState("");

  useEffect(() => {
    if (ready && user) navigate({ to: "/espace", replace: true });
  }, [ready, user, navigate]);

  async function signup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error("Veuillez renseigner tous les champs obligatoires.");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
          phone: phone.trim() || null,
          city,
          salon_name: role === "barber" ? (salonName.trim() || `Salon ${fullName}`) : null,
        },
      },
    });
    setBusy(false);

    if (error) {
      toast.error("Inscription impossible", { description: error.message });
      return;
    }

    if (data.session) {
      toast.success("Compte créé avec succès !");
      navigate({ to: "/espace", replace: true });
    } else {
      toast.success("Vérifiez vos emails", {
        description: "Un email de confirmation vous a été envoyé pour activer votre compte.",
      });
      navigate({ to: "/auth" });
    }
  }

  return (
    <AuthShell
      title="Créer un compte"
      subtitle={
        role === "barber"
          ? "Inscrivez votre salon et commencez à recevoir des réservations."
          : "Prenez rendez-vous en quelques clics sans attente."
      }
    >
      {/* Role selector */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl mb-6 border border-border">
        <button
          type="button"
          onClick={() => setRole("client")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            role === "client"
              ? "bg-card text-foreground shadow-soft border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="size-4 text-emerald-500" /> Client
        </button>
        <button
          type="button"
          onClick={() => setRole("barber")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            role === "barber"
              ? "bg-amber-500 text-black shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Scissors className="size-4" /> Barbier Pro
        </button>
      </div>

      <SocialButtons onSignedIn={() => navigate({ to: "/espace", replace: true })} />
      <OrDivider />

      <form onSubmit={signup} className="space-y-3.5">
        <div>
          <Label htmlFor="fullname" className="text-xs">
            {role === "barber" ? "Nom & Prénom du coiffeur *" : "Nom complet *"}
          </Label>
          <Input
            id="fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ex: Mehdi Trabelsi"
            required
            className="h-10 mt-1"
          />
        </div>

        {role === "barber" && (
          <div>
            <Label htmlFor="salon" className="text-xs">
              Nom de votre Salon / Barbershop *
            </Label>
            <Input
              id="salon"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              placeholder="Ex: The Gentlemen's Club"
              required
              className="h-10 mt-1"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="city" className="text-xs">
              Ville *
            </Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger id="city" className="h-10 mt-1 text-xs">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="phone" className="text-xs">
              Téléphone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+216 ..."
              className="h-10 mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-xs">
            Adresse email *
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nom@exemple.com"
            required
            className="h-10 mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-xs">
            Mot de passe *
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Au moins 6 caractères"
            minLength={6}
            required
            className="h-10 mt-1"
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl shadow-soft mt-2"
          disabled={busy}
        >
          {busy && <Loader2 className="animate-spin mr-2" />}
          {role === "barber" ? "Inscrire mon salon" : "Créer mon compte client"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link to="/auth" className="font-bold text-amber-500 hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
