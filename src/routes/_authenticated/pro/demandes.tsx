import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ClipboardList, Clock, MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, StatusBadge } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, formatDT, telLink, waLink } from "@/lib/format";
import { useMyBarber } from "../pro";

export const Route = createFileRoute("/_authenticated/pro/demandes")({
  head: () => workspaceHead("Demandes de Réservation — Espace Barbier"),
  component: RequestsPage,
});

type Filter = "all" | "pending" | "accepted" | "rejected";

function RequestsPage() {
  const { data: barber } = useMyBarber();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("pending");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["pro-all-requests", barber?.id, filter],
    enabled: !!barber,
    queryFn: async () => {
      let q = supabase
        .from("booking_requests")
        .select("*")
        .eq("barber_id", barber!.id)
        .order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  async function handleDecision(req: any, decision: "accepted" | "rejected") {
    const { error } = await supabase
      .from("booking_requests")
      .update({ status: decision, decided_at: new Date().toISOString() })
      .eq("id", req.id);

    if (error) {
      toast.error("Action impossible", { description: error.message });
      return;
    }

    // If accepted, also auto-insert into appointments table
    if (decision === "accepted") {
      const startIso = new Date(`${req.desired_date}T${req.desired_time}:00`).toISOString();
      const endIso = new Date(new Date(startIso).getTime() + 30 * 60_000).toISOString();
      await supabase.from("appointments").insert({
        barber_id: barber!.id,
        client_name: req.client_name,
        client_phone: req.client_phone,
        client_email: req.client_email,
        service_name: req.service_name,
        price: req.price || 25,
        starts_at: startIso,
        ends_at: endIso,
        status: "confirmed",
        notes: req.notes,
      });
      toast.success("Demande acceptée et ajoutée au planning !");
    } else {
      toast.success("Demande refusée.");
    }

    qc.invalidateQueries();
  }

  return (
    <>
      <PageHeader
        title="Demandes de Réservation en Ligne"
        subtitle="Consultez et validez les rendez-vous pris par vos clients sur la plateforme."
      />

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 border-b border-border pb-3">
        {(["pending", "accepted", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              filter === f
                ? "bg-amber-500 text-black shadow-soft"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "pending"
              ? "En attente"
              : f === "accepted"
                ? "Acceptées"
                : f === "rejected"
                  ? "Refusées"
                  : "Toutes"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-20 text-center text-muted-foreground">Chargement des demandes...</p>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aucune demande"
          text="Vous n'avez aucune demande dans cette catégorie pour le moment."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-card transition-all"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-foreground">
                    {r.client_name}
                  </h3>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {r.service_name} • Le{" "}
                  <strong className="text-foreground">{fmtDate(r.desired_date, "EEEE d MMMM")}</strong>{" "}
                  à <strong className="text-foreground">{r.desired_time}</strong> ({formatDT(r.price)})
                </p>
                {r.notes && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                    Note du client : "{r.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {r.client_phone && (
                  <>
                    <a
                      href={waLink(
                        r.client_phone,
                        `Bonjour ${r.client_name}, concernant votre réservation chez ${barber?.salon_name}...`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="grid size-9 place-items-center rounded-xl border border-border text-emerald-500 hover:bg-emerald-500/10"
                      title="Envoyer un WhatsApp"
                    >
                      <MessageCircle className="size-4" />
                    </a>
                    <a
                      href={telLink(r.client_phone)}
                      className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground hover:text-amber-500 hover:bg-muted"
                      title="Appeler"
                    >
                      <Phone className="size-4" />
                    </a>
                  </>
                )}

                {r.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleDecision(r, "accepted")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      <Check className="size-3.5 mr-1" /> Accepter
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDecision(r, "rejected")}
                      className="text-xs text-red-500 hover:bg-red-500/10"
                    >
                      <X className="size-3.5 mr-1" /> Refuser
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
