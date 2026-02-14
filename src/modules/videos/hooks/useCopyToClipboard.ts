import { useCallback, useEffect, useRef, useState } from "react";

type CopyToClipboardResult = {
  copy: (text: string) => Promise<void>;
  copiedText: string | null;
};

export function useCopyToClipboard(resetAfterMs = 1200): CopyToClipboardResult {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopiedText(text);
      timeoutRef.current = window.setTimeout(() => setCopiedText((prev) => (prev === text ? null : prev)), resetAfterMs);
    },
    [resetAfterMs]
  );

  return { copy, copiedText };
}
