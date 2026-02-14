

import { useMemo, useRef, useState, type FormEvent } from "react";
import UploadResultModal from "../components/UploadResultModal";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import type { UploadApiResponse } from "../types";
import { validateMp4Selection } from "../utils/validateMp4Selection";

const UploadVideo = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadApiResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { copy, copiedText } = useCopyToClipboard(1200);

  const canSubmit = files.length > 0 && !error && !isUploading;

  const helperText = useMemo(() => {
    if (error) return error;
    if (isUploading) return "Subiendo… por favor espera";
    if (files.length === 0) return "Solo se aceptan videos .mp4";
    const [first] = files;
    if (files.length === 1 && first) return `${first.name} • ${(first.size / (1024 * 1024)).toFixed(2)} MB`;
    const totalMB = files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);
    return `${files.length} archivos seleccionados • ${totalMB.toFixed(2)} MB`;
  }, [error, files, isUploading]);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (isUploading) return;
    setError(null);

    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) {
      setFiles([]);
      return;
    }

    const result = validateMp4Selection(selected);
    if (result.error) {
      setFiles([]);
      setError(result.error);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFiles(result.files);
  }

  function clearSelection() {
    if (isUploading) return;
    setFiles([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        files.forEach(file => formData.append("uploads", file));

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = (await response.json()) as UploadApiResponse & { error?: string };
        if (!response.ok) {
          throw new Error(data.error || data.message || "Error subiendo el archivo");
        }

        setUploadResult(data);
        setIsModalOpen(true);
    } catch (error) {
        console.error(error);
        setError(error instanceof Error ? error.message : String(error));
    } finally {
        setIsUploading(false);
    }
  };

  function closeModal() {
    setIsModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Subir video</h1>
              <p className="mt-1 text-sm text-slate-500">
                Sube tus videos para analizarlos. Formato requerido: MP4.
              </p>
            </div>

            {files.length > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                disabled={isUploading}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Limpiar
              </button>
            )}
          </div>

          <form onSubmit={onSubmit} method="POST" encType="multipart/form-data" className="mt-6 space-y-4">
            <input
              ref={inputRef}
              id="upload-mp4"
              type="file"
              name="uploads"
              accept="video/mp4,.mp4"
              multiple
              disabled={isUploading}
              className="sr-only"
              onChange={onPickFiles}
            />

            <label
              htmlFor="upload-mp4"
              className={
                "group block rounded-2xl border border-dashed p-6 transition " +
                (error
                  ? "border-rose-300 bg-rose-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100")
              }
              style={isUploading ? { pointerEvents: "none", opacity: 0.75 } : undefined}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div
                  className={
                    "flex h-12 w-12 items-center justify-center rounded-2xl border transition " +
                    (error
                      ? "border-rose-200 bg-white text-rose-600"
                      : "border-slate-200 bg-white text-slate-700 group-hover:border-slate-300")
                  }
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 16V4m0 0l-4 4m4-4l4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p className="mt-3 text-sm font-medium text-slate-900">Selecciona tu video</p>
                <p className={"mt-1 text-xs " + (error ? "text-rose-600" : "text-slate-500")}>{helperText}</p>
                <p className="mt-4 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white group-hover:bg-slate-800">
                  {isUploading ? "Subiendo…" : "Elegir archivo"}
                </p>
              </div>
            </label>

            {files.length > 0 && !error && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Archivos</p>
                <ul className="mt-2 space-y-2">
                  {files.map((f) => (
                    <li key={f.name + f.size} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{f.name}</p>
                        <p className="text-xs text-slate-500">{(f.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-slate-900/5 px-2 py-1 text-xs font-medium text-slate-700">
                        MP4
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? "Subiendo…" : "Subir"}
            </button>
          </form>
        </div>
      </div>

      <UploadResultModal
        open={isModalOpen}
        result={uploadResult}
        copiedUrl={copiedText}
        onCopy={(url) => {
          void copy(url);

          setUploadResult((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              files: prev.files.map((f) => (f.url === url ? { ...f, copyCount: (f.copyCount ?? 0) + 1 } : f)),
            };
          });

          void fetch("/api/events", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ type: "copied", videoUrl: url }),
          }).catch(() => {
            // Best-effort analytics; ignore failures.
          });
        }}
        onClose={closeModal}
        onDone={() => {
          closeModal();
          clearSelection();
          setUploadResult(null);
        }}
      />
    </div>
  );
};

export default UploadVideo;