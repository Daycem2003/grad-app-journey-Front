import { useRef } from "react";
import { FileCheck2, Paperclip, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const renommerFichier = (file: File, nouveauNom: string): File =>
  new File([file], nouveauNom, { type: file.type, lastModified: file.lastModified });

export function FileUpload({
  label,
  value,
  onChange,
  accept = ".pdf",
  placeholderName,
  generatedName,
}: {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  placeholderName?: string;
  generatedName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) {
            onChange(null);
            return;
          }
          const nom = generatedName ?? placeholderName ?? "document.pdf";
          onChange(renommerFichier(file, nom));
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-success/30 bg-success/8 px-3 py-2">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <FileCheck2 className="size-4 shrink-0 text-success" />
            <span className="truncate">{value.name}</span>
          </span>
          <button
            type="button"
            aria-label="Supprimer le fichier"
            onClick={() => onChange(null)}
            className="text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start border-dashed"
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="size-4" /> {label}
        </Button>
      )}
    </div>
  );
}

export function MultiFileUpload({
  label,
  values,
  onChange,
  generatedName,
}: {
  label: string;
  values: File[];
  onChange: (values: File[]) => void;
  generatedName?: (index: number) => string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const index = values.length;
          const nom = generatedName?.(index) ?? `justificatif_${index + 1}.pdf`;
          onChange([...values, renommerFichier(file, nom)]);
          e.target.value = "";
        }}
      />
      {values.map((v, i) => (
        <div
          key={`${v.name}-${i}`}
          className="flex items-center justify-between gap-3 rounded-md border border-success/30 bg-success/8 px-3 py-2"
        >
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <FileCheck2 className="size-4 shrink-0 text-success" />
            <span className="truncate">{v.name}</span>
          </span>
          <button
            type="button"
            aria-label="Supprimer le fichier"
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
            className="text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-primary"
        onClick={() => inputRef.current?.click()}
      >
        <Plus className="size-4" /> {label}
      </Button>
    </div>
  );
}