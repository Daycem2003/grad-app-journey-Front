import { useRef, useState } from "react";
import { FileCheck2, Paperclip, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Upload fictif : aucun fichier n'est réellement envoyé, seul le nom est conservé. */
export function FileUpload({
  label,
  value,
  onChange,
  accept = ".pdf",
  placeholderName,
}: {
  label: string;
  value: string | null;
  onChange: (name: string | null) => void;
  accept?: string;
  placeholderName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0]?.name ?? placeholderName ?? "document.pdf")}
      />
      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-success/30 bg-success/8 px-3 py-2">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <FileCheck2 className="size-4 shrink-0 text-success" />
            <span className="truncate">{value}</span>
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
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [count, setCount] = useState(values.length);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const name = e.target.files?.[0]?.name ?? `justificatif_${count + 1}.pdf`;
          setCount((c) => c + 1);
          onChange([...values, name]);
        }}
      />
      {values.map((v, i) => (
        <div
          key={`${v}-${i}`}
          className="flex items-center justify-between gap-3 rounded-md border border-success/30 bg-success/8 px-3 py-2"
        >
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <FileCheck2 className="size-4 shrink-0 text-success" />
            <span className="truncate">{v}</span>
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
