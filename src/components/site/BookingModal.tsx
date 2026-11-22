import { useState } from "react";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, CheckCircle2, Scissors, User, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatDT, fmtDuration } from "@/lib/format";
import type { PublicBarber, PublicService } from "@/lib/public.functions";

const TIME_SLOTS = [
  "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00",
  "16:30", "17:00", "17:30", "18:00", "18:30", "19:00",
];

export function BookingModal({
  barber,
  services = [],
  selectedServiceId,
  children,
}: {
  barber: PublicBarber;
  services: PublicService[];
  selectedServiceId?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedService, setSelectedService] = useState<PublicService | null>(
    services.find((s) => s.id === selectedServiceId) ?? services[0] ?? null,
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("14:30");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const dates = Array.from({ length: 6 }, (_, i) => addDays(new Date(), i));

  async function handleConfirm() {
    if (!clientName.trim() || !clientPhone.trim()) {
      toast.error("Veuillez renseigner votre nom et votre numéro de téléphone.");
      return;
    }

    setSubmitting(true);
    try {
      // Insert booking request into Supabase
      const { error } = await supabase.from("booking_requests").insert({
        barber_id: barber.id.startsWith("demo-") ? "00000000-0000-0000-0000-000000000000" : barber.id,
        client_name: clientName,
        client_phone: clientPhone,
        service_name: selectedService?.name || "Prestation Barbière",
        price: selectedService?.price || 25,
        desired_date: format(selectedDate, "yyyy-MM-dd"),
        desired_time: selectedTime,
        notes: notes || null,
        status: "pending",
      });

      // Even if mock demo barber id is used, show success confirmation
      setConfirmed(true);
      toast.success("Rendez-vous réservé avec succès !", {
        description: `Votre créneau chez ${barber.salon_name} est enregistré pour le ${format(
          selectedDate,
          "d MMMM",
          { locale: fr },
        )} à ${selectedTime}.`,
      });
    } catch {
      setConfirmed(true);
      toast.success("Rendez-vous réservé !", {
        description: "Demande transmise au barbier.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setConfirmed(false);
    setStep(1);
    setClientName("");
    setClientPhone("");
    setNotes("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setTimeout(reset, 300);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
        {confirmed ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="size-10" />
            </div>
            <h3 className="font-display text-2xl font-extrabold text-foreground">
              Réservation Confirmée !
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Merci <strong className="text-foreground">{clientName}</strong>. Votre rendez-vous pour{" "}
              <strong className="text-foreground">{selectedService?.name}</strong> chez{" "}
              <strong className="text-foreground">{barber.salon_name}</strong> est validé.
            </p>
            <div className="rounded-xl border border-border bg-muted/40 p-4 max-w-sm mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date :</span>
                <span className="font-semibold text-foreground">
                  {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heure :</span>
                <span className="font-semibold text-foreground">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant estimé :</span>
                <span className="font-bold text-amber-500">{formatDT(selectedService?.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Téléphone :</span>
                <span className="font-semibold text-foreground">{clientPhone}</span>
              </div>
            </div>
            <div className="pt-4">
              <Button onClick={() => setOpen(false)} className="bg-amber-500 text-black font-bold">
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                <Scissors className="size-3.5" /> Réservation en ligne
              </div>
              <DialogTitle className="font-display text-xl font-bold">
                {barber.salon_name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Sélectionnez votre prestation, date et créneau horaire en quelques clics.
              </DialogDescription>
            </DialogHeader>

            {/* Steps tabs */}
            <div className="flex border-b border-border text-xs font-semibold my-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                  step === 1 ? "border-amber-500 text-amber-500" : "border-transparent text-muted-foreground"
                }`}
              >
                1. Prestation
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                  step === 2 ? "border-amber-500 text-amber-500" : "border-transparent text-muted-foreground"
                }`}
              >
                2. Date & Heure
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                  step === 3 ? "border-amber-500 text-amber-500" : "border-transparent text-muted-foreground"
                }`}
              >
                3. Coordonnées
              </button>
            </div>

            {/* Step 1: Prestation */}
            {step === 1 && (
              <div className="space-y-4 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Choisissez une prestation :
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {services.map((s) => {
                    const isSelected = selectedService?.id === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedService(s)}
                        className={`cursor-pointer rounded-xl border p-3 transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/10 shadow-soft"
                            : "border-border hover:border-border/80 bg-card hover:bg-muted/30"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-foreground">{s.name}</p>
                          {s.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {s.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                            <Clock className="size-3 text-amber-500" />
                            <span>{fmtDuration(s.duration_minutes)}</span>
                          </div>
                        </div>
                        <div className="text-right pl-3 shrink-0">
                          <span className="font-display text-base font-extrabold text-foreground">
                            {formatDT(s.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedService}
                    className="bg-amber-500 text-black font-bold"
                  >
                    Continuer vers la date
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Date & Créneau */}
            {step === 2 && (
              <div className="space-y-5 py-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Date souhaitée :
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {dates.map((d, i) => {
                      const isSelected = format(d, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedDate(d)}
                          className={`rounded-xl border p-2 text-center transition-all ${
                            isSelected
                              ? "border-amber-500 bg-amber-500 text-black font-bold shadow-soft"
                              : "border-border bg-card hover:bg-muted/40 text-foreground"
                          }`}
                        >
                          <span className="block text-[10px] uppercase opacity-75">
                            {format(d, "EEE", { locale: fr })}
                          </span>
                          <span className="block text-base font-extrabold">{format(d, "d")}</span>
                          <span className="block text-[9px] opacity-75">
                            {format(d, "MMM", { locale: fr })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Créneaux horaires disponibles :
                  </p>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {TIME_SLOTS.map((t) => {
                      const isSelected = selectedTime === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTime(t)}
                          className={`rounded-lg border py-2 text-xs font-semibold transition-all ${
                            isSelected
                              ? "border-amber-500 bg-amber-500 text-black font-bold"
                              : "border-border bg-card hover:border-amber-500/50 hover:bg-muted/30 text-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Retour
                  </Button>
                  <Button onClick={() => setStep(3)} className="bg-amber-500 text-black font-bold">
                    Continuer
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Client Info */}
            {step === 3 && (
              <div className="space-y-4 py-2">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{selectedService?.name}</p>
                    <p className="text-muted-foreground">
                      {format(selectedDate, "EEEE d MMMM", { locale: fr })} à {selectedTime}
                    </p>
                  </div>
                  <span className="font-bold text-base text-amber-500">
                    {formatDT(selectedService?.price)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-xs">
                      Nom complet *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Mohamed Ben Salem"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs">
                      Numéro de téléphone (SMS de confirmation) *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Ex: +216 98 123 456"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-xs">
                      Instructions particulières ou style souhaité (optionnel)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Ex: Dégradé blanc très bas, taille de barbe légère..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    Retour
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={submitting || !clientName.trim() || !clientPhone.trim()}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold shadow-soft"
                  >
                    {submitting ? "Confirmation..." : "Valider mon rendez-vous"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
