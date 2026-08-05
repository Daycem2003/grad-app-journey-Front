import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, Send, User } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SUGGESTIONS, envoyerMessage } from "@/lib/assistant-service";
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

function AssistantPage() {
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
    const reponse = await envoyerMessage(question);
    setMessages((prev) => [...prev, reponse]);
    setLoading(false);
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
              <div
                key={m.id}
                className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
              >
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
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading ? (
              <p className="pl-11 text-sm text-muted-foreground">L'assistant rédige…</p>
            ) : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border/70 bg-card p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
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
          </div>
        </Card>
      </div>
    </div>
  );
}
