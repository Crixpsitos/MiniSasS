/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from "react-dom/client";
import { App } from "./App";

function start() {
  const container = document.getElementById("root");
  if (!container) throw new Error("Missing #root container");

  const globalAny = globalThis as unknown as { __miniSasRoot?: ReturnType<typeof createRoot> };
  const root = globalAny.__miniSasRoot ?? (globalAny.__miniSasRoot = createRoot(container));

  root.render(<App />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
