import type { RouteObject } from "react-router";

/**
 * Helper para rutas con default export (Component) usando `route.lazy`.
 * Evita repetir `() => import(...).then(m => ({ Component: m.default }))`.
 */
export function lazyRoute<TModule extends { default: React.ComponentType }>(
  importer: () => Promise<TModule>
): NonNullable<RouteObject["lazy"]> {
  return async () => {
    const mod = await importer();
    return { Component: mod.default };
  };
}
