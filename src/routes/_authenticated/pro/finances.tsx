import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, DollarSign, Plus, TrendingUp, Wallet } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, PageHeader, Panel, StatCard } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, formatDT } from "@/lib/format";
import { useMyBarber } from "../pro";

export const Route = createFileRoute("/_authenticated/pro/finances")({
  head: () => workspaceHead("Caisse & Finances — Espace Barbier"),
  component: FinancesPage,
});

function FinancesPage() {
  const { data: barber } = useMyBarber();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  // Form states
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["pro-payments", barber?.id],
    enabled: !!barber,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("barber_id", barber!.id)
        .order("paid_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const total = payments.reduce((s, p) => s + Number(p.amount), 0);
  const cashTotal = payments.filter((p) => p.method === "cash").reduce((s, p) => s + Number(p.amount), 0);
  const cardTotal = payments.filter((p) => p.method === "card" || p.method === "transfer").reduce((s, p) => s + Number(p.amount), 0);
  const avgTicket = payments.length > 0 ? Math.round(total / payments.length) : 0;

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setSaving(true);
    const { error } = await supabase.from("payments").insert({
      barber_id: barber!.id,
      amount: parseFloat(amount),
      method,
      note: note || "Encaissement direct salon",
      paid_at: new Date().toISOString(),
    });
    setSaving(false);

    if (error) {
      toast.error("Impossible d'enregistrer l'encaissement", { description: error.message });
      return;
    }

    toast.success("Encaissement enregistré !");
    setAddOpen(false);
    setAmount("");
    setNote("");
    qc.invalidateQueries({ queryKey: ["pro-payments"] });
  }

  return (
    <>
      <PageHeader
        title="Caisse & Chiffre d'Affaires"
        subtitle="Suivi de vos recettes quotidiennes, répartition des modes de paiement et historique de caisse."
        actions={
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl shadow-soft"
          >
            <Plus className="size-4 mr-1.5" /> Encaisser
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Recettes Totales"
          value={formatDT(total)}
          icon={Wallet}
          tone="success"
        />
        <StatCard
          label="Espèces"
          value={formatDT(cashTotal)}
          icon={DollarSign}
          tone="brand"
        />
        <StatCard
          label="Carte / Virement"
          value={formatDT(cardTotal)}
          icon={CreditCard}
        />
        <StatCard
          label="Panier moyen"
          value={formatDT(avgTicket)}
          icon={TrendingUp}
        />
      </div>

      {/* History table */}
      <Panel title="Historique des encaissements">
        {isLoading ? (
          <p className="py-12 text-center text-muted-foreground">Chargement des transactions...</p>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Aucun encaissement enregistré"
            text="Enregistrez votre premier paiement pour suivre vos rentrées d'argent."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 uppercase text-[10px] text-muted-foreground font-bold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Motif / Prestation</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      {fmtDate(p.paid_at, "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">
                      {p.note || "Prestation Barbière"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">
                        {p.method === "cash"
                          ? "Espèces"
                          : p.method === "card"
                            ? "Carte"
                            : "Virement"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-display font-extrabold text-sm text-foreground">
                      +{formatDT(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Encaissement Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">Nouvel Encaissement</DialogTitle>
            <DialogDescription className="text-xs">
              Ajoutez une rentrée d'argent dans votre caisse journalière.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPayment} className="space-y-4 py-2">
            <div>
              <Label htmlFor="pamount" className="text-xs">
                Montant encaissé (DT) *
              </Label>
              <Input
                id="pamount"
                type="number"
                step="any"
                placeholder="Ex: 35"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="pmethod" className="text-xs">
                Mode de règlement
              </Label>
              <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                <SelectTrigger id="pmethod" className="mt-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="card">Carte Bancaire / TPE</SelectItem>
                  <SelectItem value="transfer">Virement Instantané</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pnote" className="text-xs">
                Motif ou Prestation
              </Label>
              <Input
                id="pnote"
                placeholder="Ex: Formule VIP Coupe + Barbe"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-amber-500 text-black font-extrabold"
              >
                {saving ? "Enregistrement..." : "Valider l'encaissement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
