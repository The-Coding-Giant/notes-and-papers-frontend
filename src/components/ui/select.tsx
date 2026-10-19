"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Opt {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

/** Flattens <option>/<optgroup> children (also through arrays and fragments) into a plain list. */
function collect(children: React.ReactNode, group?: string, out: Opt[] = []): Opt[] {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const el = child as React.ReactElement<{
      value?: string | number;
      disabled?: boolean;
      label?: string;
      children?: React.ReactNode;
    }>;
    if (el.type === "option") {
      const text = React.Children.toArray(el.props.children).join("");
      out.push({
        value: el.props.value !== undefined ? String(el.props.value) : text,
        label: text,
        disabled: el.props.disabled,
        group,
      });
    } else if (el.type === "optgroup") {
      collect(el.props.children, el.props.label, out);
    } else if (el.props.children) {
      collect(el.props.children, group, out);
    }
  });
  return out;
}

/** Layout classes (width, flex, responsive variants) pass through to the wrapper; look-and-feel is fixed. */
const LAYOUT =
  /^(?:[a-z0-9-]+:)*(?:w-|min-w-|max-w-|flex-|grow|shrink|col-|row-|self-|m[trblxy]?-)/;

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  ref?: React.Ref<HTMLSelectElement>;
  invalid?: boolean;
};

/**
 * A custom dropdown with the same API as a native <select>. A real (visually hidden) <select> stays in the DOM,
 * so forms, react-hook-form `register`, `defaultValue`, `required` and `onChange` keep working untouched.
 * Choosing an option sets the native value and fires a real `change` event.
 */
export function Select({
  className,
  children,
  ref,
  invalid,
  id,
  disabled,
  value,
  defaultValue,
  onChange,
  ...rest
}: SelectProps) {
  const native = React.useRef<HTMLSelectElement | null>(null);
  const wrap = React.useRef<HTMLDivElement>(null);
  const list = React.useRef<HTMLUListElement>(null);
  const [open, setOpen] = React.useState(false);
  const [shown, setShown] = React.useState<string>(String(value ?? defaultValue ?? ""));
  const [active, setActive] = React.useState(0);
  const uid = React.useId();

  const options = collect(children);
  const current = options.find((o) => o.value === shown) ?? (shown === "" ? options[0] : undefined);

  const setRefs = (node: HTMLSelectElement | null) => {
    native.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.RefObject<HTMLSelectElement | null>).current = node;
  };

  // Mirror whatever the native select holds (controlled value, form reset, react-hook-form setValue).
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cheap: only sets state when the value differs
  React.useEffect(() => {
    const el = native.current;
    if (el && el.value !== shown) setShown(el.value);
  });

  // Close on outside click.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  // Keep the highlighted option in view.
  React.useEffect(() => {
    if (open)
      list.current
        ?.querySelector<HTMLElement>(`[data-i="${active}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function openMenu() {
    if (disabled) return;
    const i = options.findIndex((o) => o.value === (current?.value ?? ""));
    setActive(Math.max(0, i));
    setOpen(true);
  }

  function choose(o: Opt) {
    if (o.disabled) return;
    const el = native.current;
    if (el && el.value !== o.value) {
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
      setter?.call(el, o.value);
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setShown(o.value);
    setOpen(false);
    wrap.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    const step = (dir: 1 | -1) => {
      let i = active;
      for (let n = 0; n < options.length; n++) {
        i = (i + dir + options.length) % options.length;
        if (!options[i].disabled) break;
      }
      setActive(i);
    };
    const key = e.key;
    if (key === "ArrowDown" || key === "ArrowUp") {
      e.preventDefault();
      step(key === "ArrowDown" ? 1 : -1);
    } else if (key === "Home" || key === "End") {
      e.preventDefault();
      setActive(key === "Home" ? 0 : options.length - 1);
    } else if (key === "Enter" || key === " ") {
      e.preventDefault();
      if (options[active]) choose(options[active]);
    } else if (key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (key === "Tab") {
      setOpen(false);
    } else if (key.length === 1) {
      const i = options.findIndex((o) => o.label.toLowerCase().startsWith(key.toLowerCase()));
      if (i >= 0) setActive(i);
    }
  }

  const layout = (className ?? "").split(/\s+/).filter((c) => LAYOUT.test(c));
  const groups = Array.from(new Set(options.map((o) => o.group)));

  return (
    <div ref={wrap} className={cn("relative", layout.length === 0 && "w-full", layout)}>
      <select
        {...rest}
        id={id}
        ref={setRefs}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
      >
        {children}
      </select>
      <button
        type="button"
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-invalid={invalid || undefined}
        aria-label={rest["aria-label"]}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 border-2 border-input bg-card px-3 text-left text-sm font-medium transition-shadow focus-visible:shadow-hard-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          open && "shadow-hard-sm",
          invalid && "border-destructive",
        )}
      >
        <span className={cn("truncate", !current && "text-muted-foreground")}>
          {current?.label ?? "Select"}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul
          ref={list}
          id={`${uid}-list`}
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto border-2 border-border bg-card py-1 shadow-hard"
        >
          {groups.map((g) => (
            <React.Fragment key={g ?? "_"}>
              {g && (
                <li role="presentation" className="eyebrow px-3 pb-1 pt-2 text-muted-foreground">
                  {g}
                </li>
              )}
              {options.map((o, i) =>
                o.group !== g ? null : (
                  <li
                    key={`${o.value}-${i}`}
                    data-i={i}
                    role="option"
                    aria-selected={o.value === (current?.value ?? "")}
                    aria-disabled={o.disabled || undefined}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose(o);
                    }}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium",
                      i === active && "bg-primary text-primary-foreground",
                      o.disabled && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <span className="truncate">{o.label}</span>
                    {o.value === (current?.value ?? "") && (
                      <Check className="size-4 shrink-0" aria-hidden="true" />
                    )}
                  </li>
                ),
              )}
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
}
