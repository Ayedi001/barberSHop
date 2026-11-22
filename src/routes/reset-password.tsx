import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/site/AuthShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — BarberCraft" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      toast.error("Impossible de modifier le mot de passe", { description: error.message });
      return;
    }

    toast.success("Mot de passe mis à jour !");
    navigate({ to: "/espace", replace: true });
  }

  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Choisissez votre nouveau mot de passe sécurisé pour accéder à votre espace."
    >
      <form onSubmit={updatePassword} className="space-y-4">
        <div>
          <Label htmlFor="pass" className="text-xs">
            Nouveau mot de passe
          </Label>
          <Input
            id="pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="h-11 mt-1"
          />
        </div>
        <Button
          type="submit"
          disabled={busy}
          className="h-11 w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl shadow-soft"
        >
          {busy && <Loader2 className="animate-spin mr-2" />} Enregistrer le mot de passe
        </Button>
      </form>
    </AuthShell>
  );
}
