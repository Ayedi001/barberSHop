import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Phone, Plus, Search, Sparkles, User, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageHeader, StatusBadge } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { telLink, waLink } from "@/lib/format";
import { useMyBarber } from "../pro";

export const Route = createFileRoute("/_authenticated/pro/clients")({
  head: () => workspaceHead("Fichier Clients — Espace Barbier"),
  component: ClientsPage,
});

function ClientsPage() {
  const { data: barber } = useMyBarber();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Tunis");
  const [style, setStyle] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["pro-clients", barber?.id],
    enabled: !!barber,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("barber_id", barber!.id)
        .order("total_visits", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = clients.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.preferred_style && c.preferred_style.toLowerCase().includes(q))
    );
  });

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const { error } = await supabase.from("clients").insert({
      barber_id: barber!.id,
      full_name: name,
      phone: phone || null,
      city: city || null,
      preferred_style: style || null,
      notes: notes || null,
      total_visits: 1,
      status: "active",
    });
    setSaving(false);

    if (error) {
      toast.error("Impossible d'ajouter le client", { description: error.message });
      return;
    }

    toast.success("Client ajouté au répertoire !");
    setAddOpen(false);
    setName("");
    setPhone("");
    setStyle("");
    setNotes("");
    qc.invalidateQueries({ queryKey: ["pro-clients"] });
  }

  return (
    <>
      <PageHeader
        title="Fichier Clients & Habitués"
        subtitle="Historique des visites, coupes préférées et notes personnalisées pour chacun de vos clients."
        actions={
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl shadow-soft"
          >
            <Plus className="size-4 mr-1.5" /> Nouveau client
          </Button>
        }
      />

      {/* Search box */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, téléphone, style..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 rounded-xl"
        />
      </div>

      {isLoading ? (
        <p className="py-20 text-center text-muted-foreground">Chargement des clients...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client trouvé"
          text="Ajoutez votre premier client pour enregistrer ses préférences capillaires."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-card transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-10 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-display font-extrabold text-sm">
                      {c.full_name[0]?.toUpperCase()}
                    </span>
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">
                        {c.full_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{c.city || "Client Salon"}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                    {c.total_visits} visite{c.total_visits > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  {c.preferred_style && (
                    <div className="rounded-lg bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300 font-medium">
                      ✂️ {c.preferred_style}
                    </div>
                  )}
                  {c.notes && (
                    <p className="text-muted-foreground italic text-[11px]">
                      Note : {c.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  {c.phone || "Pas de numéro"}
                </span>

                {c.phone && (
                  <div className="flex gap-1">
                    <a
                      href={waLink(c.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="grid size-8 place-items-center rounded-lg border border-border text-emerald-500 hover:bg-emerald-500/10"
                      title="WhatsApp"
                    >
                      <MessageCircle className="size-3.5" />
                    </a>
                    <a
                      href={telLink(c.phone)}
                      className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-amber-500 hover:bg-muted"
                      title="Appeler"
                    >
                      <Phone className="size-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">Nouveau Client</DialogTitle>
            <DialogDescription className="text-xs">
              Enregistrez les informations et les préférences de coupe du client.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddClient} className="space-y-3.5 py-2">
            <div>
              <Label htmlFor="cname" className="text-xs">
                Nom complet *
              </Label>
              <Input
                id="cname"
                placeholder="Ex: Tarak Bouazizi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cphone" className="text-xs">
                Téléphone
              </Label>
              <Input
                id="cphone"
                placeholder="+216 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cstyle" className="text-xs">
                Style de coupe / barbe préféré
              </Label>
              <Input
                id="cstyle"
                placeholder="Ex: Taper fade + barbe sculptée"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cnotes" className="text-xs">
                Notes techniques (sabot, produit, spécificités)
              </Label>
              <Textarea
                id="cnotes"
                rows={2}
                placeholder="Ex: Sabot 1.5 sur les tempes, peau sensible à la serviette trop chaude..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-amber-500 text-black font-extrabold"
              >
                {saving ? "Enregistrement..." : "Ajouter le client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
