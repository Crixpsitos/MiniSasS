

import { useMemo, useRef, useState, type FormEvent } from "react";

const UploadVideo = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = files.length > 0 && !error;

  const helperText = useMemo(() => {
    if (error) return error;
    if (files.length === 0) return "Solo se aceptan videos .mp4";
    const [first] = files;
    if (files.length === 1 && first) return `${first.name} • ${(first.size / (1024 * 1024)).toFixed(2)} MB`;
    const totalMB = files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);
    return `${files.length} archivos seleccionados • ${totalMB.toFixed(2)} MB`;
  }, [error, files]);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);

    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) {
      setFiles([]);
      return;
    }

    const invalid = selected.find(f => f.type !== "video/mp4" && !f.name.toLowerCase().endsWith(".mp4"));
    if (invalid) {
      setFiles([]);
      setError(`El archivo "${invalid.name}" no es .mp4`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFiles(selected);
  }

  function clearSelection() {
    setFiles([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }


  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
        const formData = new FormData();
        files.forEach(file => formData.append("uploads", file));
        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });
        console.log(await response.json());
    } catch (error) {
        console.error(error);
    }
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
              className="sr-only"
              onChange={onPickFiles}
            />

            <label
              htmlFor="upload-mp4"
              className={
                "group block cursor-pointer rounded-2xl border border-dashed p-6 transition " +
                (error
                  ? "border-rose-300 bg-rose-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100")
              }
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
                  Elegir archivo
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Subir
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;