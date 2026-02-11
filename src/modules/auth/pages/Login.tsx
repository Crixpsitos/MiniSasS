import { useEffect, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { getAuthSession, setAuthSession } from "../utils/authStorage";

type LoginFormState = {
  email: string;
  password: string;
  remember: boolean;
};

const ALLOWED_EMAIL = "admin@gmail.com";
const ALLOWED_PASSWORD = "admin123";

const Login = () => {
  const navigate = useNavigate();

  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
    remember: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getAuthSession();
    if (session) navigate("/", { replace: true });
  }, [navigate]);

  const canSubmit = useMemo(() => {
    return form.email.trim().length > 0 && form.password.trim().length > 0;
  }, [form.email, form.password]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Completa tu email y contraseña.");
      return;
    }

    try {
      setIsSubmitting(true);

      const normalizedEmail = form.email.trim().toLowerCase();
      const password = form.password;

      if (normalizedEmail !== ALLOWED_EMAIL || password !== ALLOWED_PASSWORD) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      // es para simplemente no crear la api de autenticación, quiero gastar mis energias en los videos
      setAuthSession({ email: normalizedEmail, loggedInAt: Date.now() });
      navigate("/", { replace: true });
    } catch {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h1 className="text-lg font-semibold tracking-tight">Iniciar sesión</h1>
            <span className="text-xs text-slate-400">Mini SAS</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Accede con tu email y contraseña.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor={emailId} className="block text-sm text-slate-600">
                Email
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="admin@gmail.com"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor={passwordId} className="block text-sm text-slate-600">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <input
                id={passwordId}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <label htmlFor={rememberId} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                id={rememberId}
                type="checkbox"
                checked={form.remember}
                onChange={e => setForm(prev => ({ ...prev, remember: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              Recordarme (persistir sesión)
            </label>

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Entrando…" : "Entrar"}
            </button>

            <p className="text-xs text-slate-400">
              Nota: credenciales actuales en código (ALLOWED_EMAIL/ALLOWED_PASSWORD).
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;