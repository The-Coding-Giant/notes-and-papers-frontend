"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * A <details> dropdown that closes when you click outside, press Escape, or navigate.
 * Still a native <details>, so it works with keyboard and without JavaScript.
 */
export function DetailsMenu({
  summary,
  className,
  children,
}: {
  summary: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const path = usePathname();

  useEffect(() => {
    const close = () => ref.current?.removeAttribute("open");
    const onDown = (e: Event) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current?.open) {
        close();
        ref.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Close after a link inside was followed.
  useEffect(() => {
    ref.current?.removeAttribute("open");
  }, [path]);

  return (
    <details ref={ref} className={className}>
      {summary}
      {children}
    </details>
  );
}
