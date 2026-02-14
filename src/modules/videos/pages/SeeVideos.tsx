import { Suspense, useState } from "react";
import { useSearchParams } from "react-router"
import { VideoList } from "../components/VideoList";
import { Pagination } from "../components/Pagination";

const fetchVideos = async (page: number, limit: number) => {
    try {
        const response = await fetch(`/api/videos?page=${page}&limit=${limit}`);
        const data = (await response.json().catch(() => null)) as any;
        if (!response.ok) {
            throw new Error(data?.error || data?.message || "Error fetching videos");
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error instanceof Error ? error : new Error(String(error));

    }
}

const SeeVideos = () => {

    const [searchParams, setSearchParams] = useSearchParams();

    const rawPage = searchParams.get("page") || "1";
    const rawLimit = searchParams.get("limit") || "10";

    const pageNumber = (() => {
        const parsed = Number(rawPage);
        return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
    })();

    const limitNumber = (() => {
        const parsed = Number(rawLimit);
        return Number.isFinite(parsed) && parsed >= 1 ? parsed : 10;
    })();

    const [hasNext, setHasNext] = useState(true);

    const setAndTrackPromise = (promise: Promise<any>) => {
        setVideoPromise(promise);
        void promise
            .then((data) => {
                setHasNext(Boolean(data?.pagination?.hasNext));
            })
            .catch(() => {
                // On error, keep the user from paging forward.
                setHasNext(false);
            });
    };

    const [videoPromise, setVideoPromise] = useState(() => {
        const p = fetchVideos(pageNumber, limitNumber);
        void p.then((data) => setHasNext(Boolean(data?.pagination?.hasNext))).catch(() => setHasNext(false));
        return p;
    });

    const refresh = () => {
        setAndTrackPromise(fetchVideos(pageNumber, limitNumber));
    };


    const changePage = (newPage: number) => {
        const nextPage = Math.max(1, Math.floor(newPage));
        const next = new URLSearchParams(searchParams);
        next.set("page", String(nextPage));
        next.set("limit", String(limitNumber));
        setSearchParams(next);
        setAndTrackPromise(fetchVideos(nextPage, limitNumber));


    }

    const changeLimit = (newLimit: number) => {
        const nextLimit = Math.max(1, Math.floor(newLimit));
        const next = new URLSearchParams(searchParams);
        next.set("limit", String(nextLimit));
        next.set("page", "1");
        setSearchParams(next);
        setAndTrackPromise(fetchVideos(1, nextLimit));
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="min-h-screen max-w-full px-4 py-10">
                <h1 className="text-3xl font-bold text-gray-800">Ver videos</h1>
                <div className="mt-6 flex items-center justify-end gap-2">
                    <label htmlFor="limit" className="text-sm text-gray-700">Limit</label>
                    <select
                        id="limit"
                        value={String(limitNumber)}
                        onChange={(e) => changeLimit(Number(e.target.value))}
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>

                <section className="mt-6 grid min-h-[60vh] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Suspense fallback={<p>Cargando videos...</p>}>
                        <VideoList videoPromise={videoPromise} onDeleted={refresh} />
                    </Suspense>
                </section>
                <Pagination page={pageNumber} changePage={changePage} hasNext={hasNext} />
            </div>
        </div>
    )
}

export default SeeVideos