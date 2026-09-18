import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, LogIn, Send, User } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SUGGESTIONS, envoyerMessage } from "@/lib/assistant-service";
import { useAuth } from "@/lib/auth-context";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Assistant IA — Questions sur les Masters | MasterTN" },
      {
        name: "description",
        content:
          "Posez vos questions sur les Masters tunisiens : éligibilité, documents, dates limites et calcul du score.",
      },
      { property: "og:title", content: "Assistant IA — MasterTN" },
      {
        property: "og:description",
        content: "Un assistant conversationnel pour préparer votre candidature.",
      },
    ],
  }),
  component: AssistantPage,
});

const ACCUEIL: ChatMessage = {
  id: "m0",
  role: "assistant",
  content:
    "Bonjour ! Je suis l'assistant de MasterTN. Je peux vous informer sur les Masters ouverts, les critères d'éligibilité, les documents à fournir, les dates et le calcul du score.",
};

/**
 * Volet « Sources » affiché sous une bulle de l'assistant.
 *   - Affiche la liste des citations (fichier source + page) quand il y en a ;
 *   - Sinon, pour une vraie réponse du service (champ `status` défini), affiche
 *    une note discrète quand rien n'a été trouvé (jamais une erreur HTTP).
 * Le message d'accueil statique (sans `status`) n'affiche donc rien.
 */
function MessageSources({ message }: { message: ChatMessage }) {
  if (message.role !== "assistant") return null;

  const citations = message.citations;
  if (citations && citations.length > 0) {
    return (
      <div className="flex gap-3">
        <span className="w-8 shrink-0" />
        <div className="max-w-[80%] rounded-lg border border-border/60 bg-card/60 p-3 text-xs">
          <div className="mb-1.5 font-medium text-muted-foreground">Sources</div>
          <ul className="space-y-1">
            {citations.map((c) => (
              <li key={c.n} className="flex gap-2">
                <span className="shrink-0 font-medium text-foreground">[{c.n}]</span>
                <span className="text-muted-foreground">{`${c.source_file} — p.${c.page}`}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  if (message.status === "no_relevant_context" || message.grounded === false) {
    return (
      <div className="pl-11 text-xs text-muted-foreground">
        Aucune source pertinente n'a été trouvée dans les documents pour cette question.
      </div>
    );
  }
  return null;
}

function AssistantPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([ACCUEIL]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const send = async (texte: string) => {
    const question = texte.trim();
    if (!question || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: question }]);
    setLoading(true);
    let reponse: ChatMessage;
    try {
      reponse = await envoyerMessage(question);
    } catch {
      reponse = {
        id: `a-err-${Date.now()}`,
        role: "assistant",
        error: true,
        content:
          "Une erreur est survenue pendant l'analyse de votre question. Verifiez votre connexion, puis reessayez.",
      };
    } finally {
      // Relache toujours loading meme en cas d'echec: aucune bulle ne reste bloquee.
      setLoading(false);
    }
    setMessages((prev) => [...prev, reponse]);
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <div className="min-h-screen">
      <PublicNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl">Assistant IA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Réponses informatives uniquement : l'éligibilité et le score restent déterminés par les
          règles définies par les coordinateurs.
        </p>

        <Card className="mt-6 flex h-[62vh] flex-col overflow-hidden border-border/70 p-0 shadow-none">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m) => (
              <div key={m.id}>
                <div className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                  </span>
                  <div
                    className={cn(
                      "max-w-[80%] whitespace-pre-line rounded-lg px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : m.error
                          ? "border border-red-500/40 bg-red-100 text-red-700"
                          : "bg-muted text-foreground",
                    )}
                  >
                    {m.content}
                  </div>
                </div>
                <MessageSources message={m} />
              </div>
            ))}
            {loading ? (
              <p className="pl-11 text-sm text-muted-foreground">L'assistant rédige…</p>
            ) : null}
            <div ref={endRef} />
          </div>

          {/* Zone d'envoi. L'assistant exige une session (backend IsAuthenticated)
                    : on affiche un panneau « connectez-vous » si aucun token n'est présent.
                    `isLoading` évite un flash du panneau avant que l'état ne soit résolu. */}
          <div className="border-t border-border/70 bg-card p-4">
            {isLoading ? null : isAuthenticated ? (
              <>
                <div className="mb-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <form
                  className="flex items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send(input);
                  }}
                >
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Écrivez votre question…"
                    rows={2}
                    className="resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send(input);
                      }
                    }}
                  />
                  <Button type="submit" size="icon" disabled={loading} aria-label="Envoyer">
                    <Send className="size-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Connectez-vous pour utiliser l'assistant IA.
                </p>
                <Link to="/login">
                  <Button>
                    <LogIn className="size-4" />
                    Se connecter
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
