import { workspaceHead } from "@/lib/workspace-head";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, telLink } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  head: () => workspaceHead("Messages Reçus — Super Admin"),
  component: AdminMessagesPage,
});

function AdminMessagesPage() {
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader
        title="Messages de Contact & Demandes Partenaires"
        subtitle="Messages envoyés depuis le formulaire de contact du site public."
      />

      <Panel title={`Boîte de réception (${messages.length})`}>
        {isLoading ? (
          <p className="py-12 text-center text-muted-foreground text-xs">Chargement...</p>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="Aucun message pour l'instant"
            text="Les messages envoyés par les visiteurs du site s'afficheront ici."
          />
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-border p-4 hover:bg-muted/20 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{m.subject}</h4>
                    <p className="text-xs text-muted-foreground">
                      De : <strong className="text-foreground">{m.name}</strong> ({m.email})
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {fmtDate(m.created_at, "dd/MM/yyyy HH:mm")}
                  </span>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {m.message}
                </p>

                <div className="pt-1 flex items-center gap-3 text-xs">
                  <a
                    href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                    className="font-bold text-amber-500 hover:underline flex items-center gap-1"
                  >
                    <Mail className="size-3.5" /> Répondre par email
                  </a>
                  {m.phone && (
                    <a
                      href={telLink(m.phone)}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Phone className="size-3.5" /> {m.phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
