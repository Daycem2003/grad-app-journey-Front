import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  Ouvert: "bg-success/12 text-success border-success/30",
  Fermé: "bg-destructive/10 text-destructive border-destructive/30",
  "À venir": "bg-info/10 text-info border-info/30",
  Soumise: "bg-info/10 text-info border-info/30",
  "À réviser": "bg-warning/15 text-accent-foreground border-warning/40",
  Approuvée: "bg-success/12 text-success border-success/30",
  Rejetée: "bg-destructive/10 text-destructive border-destructive/30",
  EN_ATTENTE: "bg-warning/15 text-accent-foreground border-warning/40",
  VALIDE: "bg-success/12 text-success border-success/30",
  REJETE: "bg-destructive/10 text-destructive border-destructive/30",
  "En attente": "bg-warning/15 text-accent-foreground border-warning/40",
  Validé: "bg-success/12 text-success border-success/30",
  Rejeté: "bg-destructive/10 text-destructive border-destructive/30",
};

const LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  VALIDE: "Validé",
  REJETE: "Rejeté",
};

export function StatusBadge({ statut, className }: { statut: string; className?: string }) {
  const displayLabel = LABELS[statut] ?? statut;
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", MAP[statut] ?? "", className)}
    >
      {displayLabel}
    </Badge>
  );
}
