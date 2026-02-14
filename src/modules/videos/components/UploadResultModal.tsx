import type { UploadApiResponse } from "../types";

type Props = {
  open: boolean;
  result: UploadApiResponse | null;
  copiedUrl: string | null;
  onCopy: (url: string) => void;
  onClose: () => void;
  onDone: () => void;
};

export default function UploadResultModal({ open, result, copiedUrl, onCopy, onClose, onDone }: Props) {
  if (!open || !result) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Resultados de subida"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{result.message}</h2>
            <p className="mt-1 text-sm text-slate-500">URLs generadas para tus videos subidos.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {result.files.map((f) => (
              <div key={f.filename} className="rounded-2xl border border-slate-200 p-4">
                <p className="truncate text-sm font-semibold text-slate-900" title={f.originalName}>
                  {f.originalName}
                </p>

                <div className="mt-3 overflow-hidden rounded-xl bg-slate-100">
                  <video src={f.url} controls className="h-44 w-full object-cover" />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate rounded-xl bg-slate-50 px-3 py-2 text-xs text-blue-700 hover:bg-slate-100"
                    title={f.url}
                  >
                    {f.url}
                  </a>
                  <button
                    type="button"
                    onClick={() => onCopy(f.url)}
                    className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    {copiedUrl === f.url ? "Copiado" : "Copiar"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">Copiados: {f.copyCount}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onDone}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
