import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AnalyticsResponse = {
  totals: {
    videos: number;
    copied: number;
    deleted: number;
  };
  last7Days: Array<{ day: string; uploaded: number; copied: number; deleted: number }>;
};

function Dashboard() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const res = await fetch("/api/analytics");
        const payload = (await res.json().catch(() => null)) as any;
        if (!res.ok) throw new Error(payload?.error || payload?.message || "Error cargando analíticas");
        const json = payload as AnalyticsResponse;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.last7Days.map((d) => ({
      ...d,
      label: d.day.slice(5),
    }));
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Analíticas básicas de videos.</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Videos subidos</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{data?.totals.videos ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Copias (URLs)</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{data?.totals.copied ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Eliminados</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{data?.totals.deleted ?? "—"}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Últimos 7 días</p>
          <p className="mt-1 text-xs text-slate-500">Subidos / Copiados / Eliminados</p>

          <div className="mt-4 h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="uploaded" name="Subidos" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="copied" name="Copiados" stroke="#0f172a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="deleted" name="Eliminados" stroke="#dc2626" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;