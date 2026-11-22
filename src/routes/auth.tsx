import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Scissors, UserCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/site/AuthShell";
import { OrDivider, SocialButtons } from "@/components/site/SocialButtons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, safeRedirect } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string; mode?: "forgot" } => ({
    ...(typeof s["redirect"] === "string" ? { redirect: s["redirect"] } : {}),
    ...(s["mode"] === "forgot" ? { mode: "forgot" as const } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Connexion — BarberCraft" },
      {
        name: "description",
        content: "Connectez-vous à votre espace client, barbier professionnel ou administrateur.",
      },
      { property: "og:title", content: "Connexion — BarberCraft" },
      { property: "og:description", content: "Accédez à votre espace BarberCraft." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const goNext = () => {
    const to = safeRedirect(search["redirect"]);
    if (to) window.location.assign(to);
    else navigate({ to: "/espace", replace: true });
  };

  useEffect(() => {
    if (ready && user) goNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error("Identifiants incorrects", {
        description: "Vérifiez votre adresse email et votre mot de passe.",
      });
      return;
    }
    toast.success("Bienvenue sur BarberCraft !");
  }

  async function forgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error("Envoi impossible", { description: error.message });
      return;
    }
    toast.success("Email envoyé", {
      description: "Suivez le lien reçu pour choisir un nouveau mot de passe.",
    });
  }

  if (search["mode"] === "forgot") {
    return (
      <AuthShell
        title="Mot de passe oublié"
        subtitle="Recevez un lien de réinitialisation sécurisé sur votre adresse email."
      >
        <form onSubmit={forgot} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold"
            disabled={busy}
          >
            {busy && <Loader2 className="animate-spin mr-2" />} Envoyer le lien
          </Button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link to="/auth" className="font-semibold text-amber-600 hover:underline">
            ← Retour à la connexion
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Bon retour 👋"
      subtitle="Connectez-vous à votre espace personnel ou professionnel."
    >
      <SocialButtons onSignedIn={goNext} />
      <OrDivider />

      <form onSubmit={login} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="nom@exemple.com"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              to="/auth"
              search={{ mode: "forgot" as const }}
              className="text-xs font-medium text-muted-foreground hover:text-amber-500"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className="h-11"
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl shadow-soft"
          disabled={busy}
        >
          {busy && <Loader2 className="animate-spin mr-2" />} Se connecter
        </Button>
      </form>

      {/* Quick Demo Access Bar */}
      <div className="mt-6 pt-5 border-t border-border">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center mb-2.5">
          Accès Démo Rapide (Test)
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEmail("barbier@barbercraft.tn");
              setPassword("barber123");
            }}
            className="text-[11px] font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400"
          >
            <Scissors className="size-3 mr-1" /> Démo Barbier
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEmail("client@barbercraft.tn");
              setPassword("client123");
            }}
            className="text-[11px] font-semibold"
          >
            <UserCheck className="size-3 mr-1 text-emerald-500" /> Démo Client
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Vous n'avez pas encore de compte ?{" "}
        <Link to="/inscription" className="font-bold text-amber-500 hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthShell>
  );
}
