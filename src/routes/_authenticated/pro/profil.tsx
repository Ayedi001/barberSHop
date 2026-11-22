import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Plus, Save, Scissors, Store, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { CITIES } from "@/lib/site";
import { formatDT, fmtDuration } from "@/lib/format";
import { useMyBarber } from "../pro";

export const Route = createFileRoute("/_authenticated/pro/profil")({
  head: () => workspaceHead("Configuration Salon & Prestations — Espace Barbier"),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: barber } = useMyBarber();
  const qc = useQueryClient();

  // Profile states
  const [salonName, setSalonName] = useState("");
  const [city, setCity] = useState("Tunis");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Services
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [sName, setSName] = useState("");
  const [sCat, setSCat] = useState<any>("coupe");
  const [sPrice, setSPrice] = useState("25");
  const [sDuration, setSDuration] = useState("30");
  const [sDesc, setSDesc] = useState("");
  const [savingService, setSavingService] = useState(false);

  useEffect(() => {
    if (barber) {
      setSalonName(barber.salon_name || "");
      setCity(barber.city || "Tunis");
      setAddress(barber.address || "");
      setPhone(barber.phone || "");
      setWhatsapp(barber.whatsapp || "");
      setInstagram(barber.instagram || "");
      setBio(barber.bio || barber.short_bio || "");
    }
  }, [barber]);

  const { data: services = [] } = useQuery({
    queryKey: ["pro-salon-services", barber?.id],
    enabled: !!barber,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("barber_services")
        .select("*")
        .eq("barber_id", barber!.id)
        .order("position");
      if (error) return [];
      return data ?? [];
    },
  });

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!barber) return;

    setSavingProfile(true);
    const { error } = await supabase
      .from("barbers")
      .update({
        salon_name: salonName,
        city,
        address: address || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        instagram: instagram || null,
        bio: bio || null,
        short_bio: bio ? bio.slice(0, 160) : null,
      })
      .eq("id", barber.id);
    setSavingProfile(false);

    if (error) {
      toast.error("Erreur lors de la sauvegarde", { description: error.message });
      return;
    }

    toast.success("Informations du salon mises à jour !");
    qc.invalidateQueries({ queryKey: ["my-barber"] });
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    if (!sName.trim() || !barber) return;

    setSavingService(true);
    const { error } = await supabase.from("barber_services").insert({
      barber_id: barber.id,
      name: sName,
      category: sCat,
      price: parseFloat(sPrice) || 20,
      duration_minutes: parseInt(sDuration) || 30,
      description: sDesc || null,
      position: services.length + 1,
      is_active: true,
    });
    setSavingService(false);

    if (error) {
      toast.error("Impossible d'ajouter la prestation", { description: error.message });
      return;
    }

    toast.success("Nouvelle prestation ajoutée au menu !");
    setAddServiceOpen(false);
    setSName("");
    setSDesc("");
    qc.invalidateQueries({ queryKey: ["pro-salon-services"] });
  }

  async function handleDeleteService(id: string) {
    const { error } = await supabase.from("barber_services").delete().eq("id", id);
    if (error) {
      toast.error("Suppression impossible", { description: error.message });
      return;
    }
    toast.success("Prestation supprimée");
    qc.invalidateQueries({ queryKey: ["pro-salon-services"] });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Salon & Carte des Prestations"
        subtitle="Personnalisez la présentation de votre salon et configurez vos tarifs de coiffure."
      />

      {/* SALON PROFILE FORM */}
      <Panel title="Informations Générales du Salon">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sname" className="text-xs">
                Nom du Salon / Barbershop *
              </Label>
              <Input
                id="sname"
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="scity" className="text-xs">
                Ville *
              </Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger id="scity" className="mt-1 text-xs">
                  <SelectValue />
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
          </div>

          <div>
            <Label htmlFor="saddr" className="text-xs">
              Adresse complète
            </Label>
            <Input
              id="saddr"
              placeholder="Ex: 24 Avenue Habib Bourguiba, La Marsa"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="sphone" className="text-xs">
                Téléphone salon
              </Label>
              <Input
                id="sphone"
                placeholder="+216 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="swhatsapp" className="text-xs">
                WhatsApp professionnel
              </Label>
              <Input
                id="swhatsapp"
                placeholder="+216 ..."
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sinsta" className="text-xs">
                Compte Instagram
              </Label>
              <Input
                id="sinsta"
                placeholder="@mon_salon"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sbio" className="text-xs">
              Présentation & Savoir-faire du salon
            </Label>
            <Textarea
              id="sbio"
              rows={3}
              placeholder="Décrivez votre expérience, vos spécialités de coupes et l'ambiance de votre salon..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={savingProfile}
              className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl shadow-soft"
            >
              <Save className="size-4 mr-2" />
              {savingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </Panel>

      {/* SERVICES MANAGEMENT */}
      <Panel
        title="Carte des Prestations & Tarifs"
        action={
          <Button
            size="sm"
            onClick={() => setAddServiceOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs"
          >
            <Plus className="size-3.5 mr-1" /> Ajouter une prestation
          </Button>
        }
      >
        {services.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Aucune prestation enregistrée. Cliquez sur "Ajouter une prestation" ou chargez les données démo.
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border p-3.5 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-foreground">{s.name}</p>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                      {s.category}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  )}
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
                    <Clock className="size-3" /> {fmtDuration(s.duration_minutes)}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-display font-extrabold text-base text-foreground">
                    {formatDT(s.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(s.id)}
                    className="text-muted-foreground hover:text-red-500 p-1"
                    title="Supprimer la prestation"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Add Service Dialog */}
      <Dialog open={addServiceOpen} onOpenChange={setAddServiceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">Nouvelle Prestation</DialogTitle>
            <DialogDescription className="text-xs">
              Ajoutez un service avec son prix et sa durée estimée pour la réservation en ligne.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddService} className="space-y-3.5 py-2">
            <div>
              <Label htmlFor="ns-name" className="text-xs">
                Nom de la prestation *
              </Label>
              <Input
                id="ns-name"
                placeholder="Ex: Taper Fade + Traçage Barbe"
                value={sName}
                onChange={(e) => setSName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ns-cat" className="text-xs">
                  Catégorie
                </Label>
                <Select value={sCat} onValueChange={setSCat}>
                  <SelectTrigger id="ns-cat" className="mt-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coupe">Coupe</SelectItem>
                    <SelectItem value="barbe">Barbe</SelectItem>
                    <SelectItem value="combo">Combo Coupe + Barbe</SelectItem>
                    <SelectItem value="soin">Soin Visage</SelectItem>
                    <SelectItem value="coloration">Coloration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ns-price" className="text-xs">
                  Prix (DT) *
                </Label>
                <Input
                  id="ns-price"
                  type="number"
                  placeholder="25"
                  value={sPrice}
                  onChange={(e) => setSPrice(e.target.value)}
                  required
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ns-duration" className="text-xs">
                Durée estimée (minutes) *
              </Label>
              <Input
                id="ns-duration"
                type="number"
                placeholder="30"
                value={sDuration}
                onChange={(e) => setSDuration(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="ns-desc" className="text-xs">
                Description de la prestation
              </Label>
              <Textarea
                id="ns-desc"
                rows={2}
                placeholder="Ex: Shampoing, dégradé à blanc, huile de finition..."
                value={sDesc}
                onChange={(e) => setSDesc(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setAddServiceOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={savingService}
                className="bg-amber-500 text-black font-extrabold"
              >
                {savingService ? "Ajout..." : "Ajouter la prestation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
