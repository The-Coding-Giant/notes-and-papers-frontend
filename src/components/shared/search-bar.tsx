"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchSearch } from "@/services/queries";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

interface SearchBarProps {
  defaultValue?: string;
  size?: "md" | "lg";
  autoFocus?: boolean;
  className?: string;
}

/**
 * A real GET form to /search, so it works without JavaScript.
 * With JS it also shows instant suggestions (combobox pattern: arrows, Enter, Escape).
 */
export function SearchBar({
  defaultValue = "",
  size = "md",
  autoFocus,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const listId = useId();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounced = useDebounced(value.trim());

  const { data } = useQuery({
    queryKey: ["suggest", debounced],
    enabled: open && debounced.length >= 2, // only while the visitor is typing, not on page load
    queryFn: async ({ signal }) =>
      (await fetchSearch({ q: debounced, size: 1 }, signal)).suggestions,
  });
  const suggestions = open && debounced.length >= 2 ? (data ?? []).slice(0, 6) : [];

  function go(q: string) {
    setOpen(false);
    router.push(routes.search(q.trim()));
  }

  return (
    <form
      action="/search"
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        go(active >= 0 && suggestions[active] ? suggestions[active] : value);
      }}
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search question papers
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 border-2 border-input bg-card px-4 transition-shadow focus-within:shadow-hard",
            size === "lg" ? "h-14" : "h-11",
          )}
        >
          <Search className="size-5 shrink-0" aria-hidden="true" />
          <input
            id={`${listId}-input`}
            name="q"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoFocus={autoFocus}
            maxLength={120}
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            placeholder="Search subject, course or exam, e.g. BCA 1st year, NEET 2024"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, suggestions.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, -1));
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className={cn(
              "h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 font-medium shadow-none outline-none placeholder:font-normal placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-none",
              size === "lg" ? "text-base" : "text-sm",
            )}
          />
        </div>
        <Button type="submit" size={size === "lg" ? "lg" : "md"}>
          Find papers
        </Button>
      </div>
      {suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden border-2 border-border bg-card shadow-hard"
        >
          {suggestions.map((s, i) => (
            <li
              key={s}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                setValue(s);
                go(s);
              }}
              className={cn(
                "cursor-pointer border-b border-border/20 px-4 py-3 text-sm font-medium last:border-b-0 hover:bg-primary",
                i === active && "bg-primary",
              )}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
