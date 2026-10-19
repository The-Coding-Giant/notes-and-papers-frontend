import { ChevronDown } from "lucide-react";

/** Native <details>: keyboard accessible and works with JavaScript disabled. */
export function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="divide-y-2 divide-border border-2 border-border bg-card shadow-hard-sm">
      {faqs.map((f) => (
        <details key={f.q} className="group p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
            {f.q}
            <ChevronDown
              className="size-4 shrink-0 transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
