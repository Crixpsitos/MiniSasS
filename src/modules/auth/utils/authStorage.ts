export type AuthSession = {
  email: string;
  loggedInAt: number;
};

const AUTH_KEY = "mini-sas:auth";

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
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return getAuthSession() !== null;
}
