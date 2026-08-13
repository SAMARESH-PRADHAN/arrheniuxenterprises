import { useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";

export type ArtworkFile = { name: string; type: string; size: number; dataUrl: string };

type Props = {
  value: ArtworkFile[];
  onChange: (files: ArtworkFile[]) => void;
  title?: string;
};

const ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,application/pdf,.ai,.eps,.svg";
const MAX_MB = 2;

export const ArtworkUpload = ({ value, onChange, title = "Upload Your Logo / Artwork / Text Design" }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");

  const readFile = (f: File): Promise<ArtworkFile> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve({ name: f.name, type: f.type, size: f.size, dataUrl: String(r.result) });
      r.onerror = () => reject(new Error("read"));
      r.readAsDataURL(f);
    });

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setErr("");
    const next: ArtworkFile[] = [...value];
    for (const f of Array.from(files)) {
      if (f.size > MAX_MB * 1024 * 1024) { setErr(`${f.name} exceeds ${MAX_MB} MB.`); continue; }
      try { next.push(await readFile(f)); } catch { setErr("Could not read file."); }
    }
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="mt-6">
      <h4 className="text-xs uppercase tracking-widest font-bold mb-2">{title}</h4>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-border hover:border-ink transition cursor-pointer bg-secondary/40 px-4 py-6 text-center"
      >
        <Upload className="h-5 w-5 mx-auto text-muted-foreground" />
        <p className="text-sm mt-2 font-medium">Click or drag files here</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, JPEG, PDF, SVG · up to {MAX_MB} MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          onChange={(e) => onFiles(e.target.files)}
          className="hidden"
        />
      </div>
      {err && <p className="text-xs text-destructive mt-2">{err}</p>}
      {value.length > 0 && (
        <ul className="mt-3 space-y-2">
          {value.map((f, i) => {
            const isImg = f.type.startsWith("image/");
            return (
              <li key={i} className="flex items-center gap-3 border border-border p-2 bg-background">
                {isImg ? (
                  <img src={f.dataUrl} alt={f.name} className="h-12 w-12 object-cover border border-border" />
                ) : (
                  <div className="h-12 w-12 flex items-center justify-center border border-border bg-secondary">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{f.name}</div>
                  <div className="text-[10px] text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(i); }}
                  className="p-1.5 hover:text-destructive"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const artworkSummary = (files: ArtworkFile[]): string => {
  if (!files.length) return "None";
  return files.map((f) => f.name).join(", ");
};
