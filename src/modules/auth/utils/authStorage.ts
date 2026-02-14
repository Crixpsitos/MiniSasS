export type AuthSession = {
  email: string;
  loggedInAt: number;
};

const AUTH_KEY = "mini-sas:auth";
const AUTH_CHANGED_EVENT = "mini-sas:auth-changed";

function notifyAuthChanged(): void {
  // storage events don't fire in the same tab, so we broadcast our own.
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (typeof parsed.email !== "string" || typeof parsed.loggedInAt !== "number") return null;
    return { email: parsed.email, loggedInAt: parsed.loggedInAt };
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  notifyAuthChanged();
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_KEY);
  notifyAuthChanged();
}

export function isAuthenticated(): boolean {
  return getAuthSession() !== null;
}

export function subscribeToAuthChanges(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === AUTH_KEY) onChange();
  };
  const onCustom = () => onChange();

  window.addEventListener("storage", onStorage);
  window.addEventListener(AUTH_CHANGED_EVENT, onCustom);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AUTH_CHANGED_EVENT, onCustom);
  };
}
