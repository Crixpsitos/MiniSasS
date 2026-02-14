import { use, useMemo, useState } from "react";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

type VideoItem = {
    id: number;
    originalName: string;
    url: string;
    copyCount?: number;
};

export const VideoList = ({
    videoPromise,
    onDeleted,
}: {
    videoPromise: Promise<any>;
    onDeleted?: () => void;
}) => {
    const resultPromise = use(videoPromise);
    const videos = (resultPromise.videos ?? []) as VideoItem[];

    const { copy, copiedText } = useCopyToClipboard(1200);
    const [optimisticCopies, setOptimisticCopies] = useState<Record<number, number>>({});
    const [deletingById, setDeletingById] = useState<Record<number, boolean>>({});
    const [hiddenById, setHiddenById] = useState<Record<number, boolean>>({});

    const copyCountById = useMemo(() => {
        const map: Record<number, number> = {};
        for (const v of videos) {
            map[v.id] = Number(v.copyCount ?? 0);
        }
        return map;
    }, [videos]);

    const onCopy = async (video: VideoItem) => {
        await copy(video.url);
        setOptimisticCopies((prev) => ({ ...prev, [video.id]: (prev[video.id] ?? 0) + 1 }));

        void fetch("/api/events", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ type: "copied", videoUrl: video.url }),
        }).catch(() => {
            // Best-effort analytics; ignore failures.
        });
    };

    const onDelete = async (video: VideoItem) => {
        if (deletingById[video.id]) return;
        const ok = window.confirm(`¿Eliminar "${video.originalName}"?`);
        if (!ok) return;

        try {
            setDeletingById((prev) => ({ ...prev, [video.id]: true }));
            const res = await fetch(`/api/videos?id=${encodeURIComponent(String(video.id))}`, {
                method: "DELETE",
            });
            const payload = (await res.json().catch(() => null)) as null | { message?: string; error?: string };
            if (!res.ok) {
                throw new Error(payload?.error || payload?.message || "Error eliminando el video");
            }

            setHiddenById((prev) => ({ ...prev, [video.id]: true }));
            onDeleted?.();
        } catch (e) {
            console.error(e);
            window.alert(e instanceof Error ? e.message : String(e));
        } finally {
            setDeletingById((prev) => ({ ...prev, [video.id]: false }));
        }
    };

    return (
        <>
            {videos
                .filter((v) => !hiddenById[v.id])
                .map((video: any) => (
                <div key={video.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="truncate text-sm font-semibold text-slate-900" title={video.originalName}>
                        {video.originalName}
                    </p>

                    <div className="mt-3 overflow-hidden rounded-xl bg-slate-100">
                        <video src={video.url} controls preload="none" playsInline className="h-44 w-full object-cover" />
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                        <a
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 flex-1 truncate rounded-xl bg-slate-50 px-3 py-2 text-xs text-blue-700 hover:bg-slate-100"
                            title={video.url}
                        >
                            {video.url}
                        </a>
                        <button
                            type="button"
                            onClick={() => {
                                void onCopy(video);
                            }}
                            className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                            {copiedText === video.url ? "Copiado" : "Copiar"}
                        </button>
                    </div>

                    <div className="mt-3 flex items-center justify-end">
                        <button
                            type="button"
                            disabled={deletingById[video.id] === true}
                            onClick={() => {
                                void onDelete(video);
                            }}
                            className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {deletingById[video.id] ? "Eliminando…" : "Eliminar"}
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                        Copiados: {(copyCountById[video.id] ?? 0) + (optimisticCopies[video.id] ?? 0)}
                    </p>
                </div>
            ))}
        </>
    );
};
