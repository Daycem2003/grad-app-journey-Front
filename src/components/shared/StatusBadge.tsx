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
};

export function StatusBadge({ statut, className }: { statut: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", MAP[statut] ?? "", className)}
    >
      {statut}
    </Badge>
  );
}
