import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Phone,
  Plus,
  Scissors,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { PageHeader, StatusBadge } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { fmtTime, formatDT, telLink } from "@/lib/format";
import { useMyBarber } from "../pro";

export const Route = createFileRoute("/_authenticated/pro/planning")({
  head: () => workspaceHead("Planning & Agenda — Espace Barbier"),
  component: PlanningPage,
});

type View = "day" | "week" | "month";

type AppointmentRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  client_name: string;
  client_phone: string | null;
  service_name: string;
  duration_minutes: number;
  price: number;
  status: string;
  notes: string | null;
};

function PlanningPage() {
  const { data: barber } = useMyBarber();
  const qc = useQueryClient();
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState(new Date());
  const [addOpen, setAddOpen] = useState(false);

  // Form states for manual appointment
  const [formClientName, setFormClientName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formServiceName, setFormServiceName] = useState("Coupe Dégradé Américain (Fade)");
  const [formPrice, setFormPrice] = useState("25");
  const [formDuration, setFormDuration] = useState("30");
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formTime, setFormTime] = useState("14:00");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const range = useMemo(() => {
    if (view === "day") return { from: startOfDay(cursor), to: addDays(startOfDay(cursor), 1) };
    if (view === "week") {
      const s = startOfWeek(cursor, { weekStartsOn: 1 });
      return { from: s, to: addDays(s, 7) };
    }
    const s = startOfMonth(cursor);
    return { from: s, to: addDays(endOfMonth(cursor), 1) };
  }, [view, cursor]);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["pro-appointments", barber?.id, range.from.toISOString(), range.to.toISOString()],
    enabled: !!barber,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, starts_at, ends_at, client_name, client_phone, service_name, duration_minutes, price, status, notes")
        .eq("barber_id", barber!.id)
        .gte("starts_at", range.from.toISOString())
        .lt("starts_at", range.to.toISOString())
        .order("starts_at");
      if (error) throw error;
      return (data ?? []) as AppointmentRow[];
    },
  });

  function move(dir: -1 | 1) {
    setCursor((c) => (view === "day" ? addDays(c, dir) : view === "week" ? addWeeks(c, dir) : addMonths(c, dir)));
  }

  const title =
    view === "day"
      ? format(cursor, "EEEE d MMMM yyyy", { locale: fr })
      : view === "week"
        ? `Semaine du ${format(range.from, "d MMMM", { locale: fr })} au ${format(addDays(range.from, 6), "d MMMM yyyy", { locale: fr })}`
        : format(cursor, "MMMM yyyy", { locale: fr });

  async function updateStatus(id: string, status: "completed" | "cancelled" | "confirmed") {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) {
      toast.error("Mise à jour impossible", { description: error.message });
      return;
    }
    toast.success(
      status === "completed"
        ? "Prestation terminée"
        : status === "cancelled"
          ? "Rendez-vous annulé"
          : "Rendez-vous confirmé",
    );
    qc.invalidateQueries({ queryKey: ["pro-appointments"] });
  }

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!formClientName.trim()) {
      toast.error("Veuillez saisir le nom du client.");
      return;
    }

    setSaving(true);
    const startIso = new Date(`${formDate}T${formTime}:00`).toISOString();
    const duration = parseInt(formDuration) || 30;
    const endIso = new Date(new Date(startIso).getTime() + duration * 60_000).toISOString();

    const { error } = await supabase.from("appointments").insert({
      barber_id: barber!.id,
      client_name: formClientName,
      client_phone: formPhone || null,
      service_name: formServiceName,
      duration_minutes: duration,
      price: parseFloat(formPrice) || 25,
      starts_at: startIso,
      ends_at: endIso,
      status: "confirmed",
      notes: formNotes || null,
    });

    setSaving(false);
    if (error) {
      toast.error("Impossible d'ajouter le rendez-vous", { description: error.message });
      return;
    }

    toast.success("Rendez-vous planifié avec succès !");
    setAddOpen(false);
    setFormClientName("");
    setFormPhone("");
    setFormNotes("");
    qc.invalidateQueries({ queryKey: ["pro-appointments"] });
  }

  return (
    <>
      <PageHeader
        title="Planning & Agenda"
        subtitle="Organisez vos séances au salon, gérez les créneaux et accueillez vos clients."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border bg-card p-1 shadow-soft">
              {(["day", "week", "month"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    view === v
                      ? "bg-amber-500 text-black shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v === "day" ? "Jour" : v === "week" ? "Semaine" : "Mois"}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setAddOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl shadow-soft"
            >
              <Plus className="size-4 mr-1.5" /> Nouveau RDV
            </Button>
          </div>
        }
      />

      {/* Date Navigator Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="Précédent">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())} className="font-semibold text-xs">
            Aujourd'hui
          </Button>
          <Button variant="outline" size="icon" onClick={() => move(1)} aria-label="Suivant">
            <ChevronRight className="size-4" />
          </Button>
          <h2 className="ml-3 font-display text-base md:text-lg font-bold text-foreground capitalize">
            {title}
          </h2>
        </div>

        <span className="text-xs font-semibold text-muted-foreground">
          {appointments.length} rendez-vous programmés
        </span>
      </div>

      {/* Agenda Views */}
      {isLoading ? (
        <p className="py-20 text-center text-muted-foreground">Chargement de votre planning...</p>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <CalendarDays className="mx-auto size-10 text-amber-500/60" />
          <h3 className="mt-3 font-display text-base font-bold text-foreground">
            Aucun rendez-vous sur cette période
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Cliquez sur "+ Nouveau RDV" pour planifier un client au salon.
          </p>
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="mt-4 bg-amber-500 text-black font-bold"
          >
            Ajouter un rendez-vous
          </Button>
        </div>
      ) : view === "day" ? (
        /* DAY VIEW */
        <div className="space-y-3">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-card transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-amber-500/15 p-3 text-center shrink-0">
                  <span className="font-display text-base font-extrabold text-amber-600 dark:text-amber-400 block">
                    {fmtTime(a.starts_at)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block font-medium">
                    {a.duration_minutes} min
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-foreground">
                      {a.client_name}
                    </h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    {a.service_name} • {formatDT(a.price)}
                  </p>
                  {a.notes && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                      "{a.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {a.client_phone && (
                  <a
                    href={telLink(a.client_phone)}
                    className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground hover:text-amber-500 hover:bg-muted"
                    title="Appeler"
                  >
                    <Phone className="size-4" />
                  </a>
                )}
                {a.status === "confirmed" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateStatus(a.id, "completed")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      <Check className="size-3.5 mr-1" /> Terminé
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(a.id, "cancelled")}
                      className="text-xs text-red-500 hover:bg-red-500/10"
                    >
                      <X className="size-3.5 mr-1" /> Annuler
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* WEEK & MONTH VIEW: Day-grouped grid */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => {
            const day = addDays(range.from, i);
            const dayAppts = appointments.filter((a) => isSameDay(new Date(a.starts_at), day));
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={i}
                className={`flex flex-col rounded-2xl border p-4 shadow-soft transition-all ${
                  isToday
                    ? "border-amber-500/60 bg-amber-500/5 shadow-card"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <div>
                    <span className="font-display text-sm font-bold capitalize text-foreground">
                      {format(day, "EEEE", { locale: fr })}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                      {format(day, "d MMM")}
                    </span>
                  </div>
                  {isToday && (
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-black">
                      Aujourd'hui
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-2.5">
                  {dayAppts.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted-foreground/75 italic">
                      Aucun rendez-vous
                    </p>
                  ) : (
                    dayAppts.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-border bg-card p-3 shadow-soft space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="size-3" /> {fmtTime(a.starts_at)}
                          </span>
                          <StatusBadge status={a.status} />
                        </div>
                        <p className="text-xs font-bold text-foreground">{a.client_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {a.service_name} • {formatDT(a.price)}
                        </p>
                        {a.status === "confirmed" && (
                          <div className="pt-1 flex gap-1 justify-end">
                            <button
                              type="button"
                              onClick={() => updateStatus(a.id, "completed")}
                              className="text-[10px] font-bold text-emerald-600 hover:underline"
                            >
                              ✓ Terminer
                            </button>
                            <span className="text-muted-foreground text-[10px]">•</span>
                            <button
                              type="button"
                              onClick={() => updateStatus(a.id, "cancelled")}
                              className="text-[10px] text-red-500 hover:underline"
                            >
                              Annuler
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD APPOINTMENT MODAL */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Ajouter un rendez-vous
            </DialogTitle>
            <DialogDescription className="text-xs">
              Planifiez une prestation au salon pour un client ou un passage impromptu.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAppointment} className="space-y-3.5 py-2">
            <div>
              <Label htmlFor="clientName" className="text-xs">
                Nom du client *
              </Label>
              <Input
                id="clientName"
                placeholder="Ex: Bilel Gharbi"
                value={formClientName}
                onChange={(e) => setFormClientName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs">
                Téléphone (optionnel)
              </Label>
              <Input
                id="phone"
                placeholder="+216 ..."
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="service" className="text-xs">
                Prestation
              </Label>
              <Select value={formServiceName} onValueChange={setFormServiceName}>
                <SelectTrigger id="service" className="mt-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Coupe Dégradé Américain (Fade)">
                    Coupe Dégradé Américain (Fade)
                  </SelectItem>
                  <SelectItem value="Taille de Barbe & Serviette Chaude">
                    Taille de Barbe & Serviette Chaude
                  </SelectItem>
                  <SelectItem value="Formule VIP Coupe + Barbe">Formule VIP Coupe + Barbe</SelectItem>
                  <SelectItem value="Soin du Visage & Black Mask">
                    Soin du Visage & Black Mask
                  </SelectItem>
                  <SelectItem value="Pack Marié Prestige">Pack Marié Prestige</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date" className="text-xs">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-xs">
                  Heure
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price" className="text-xs">
                  Tarif (DT)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-xs">
                  Durée (min)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs">
                Notes ou préférences
              </Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder="Ex: Sabot 2 dessus, rasoir nu..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
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
                className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold"
              >
                {saving ? "Enregistrement..." : "Confirmer le RDV"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
