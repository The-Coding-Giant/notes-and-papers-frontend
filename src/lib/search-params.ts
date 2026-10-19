type Raw = string | string[] | undefined;

export const first = (v: Raw): string | undefined => (Array.isArray(v) ? v[0] : v) || undefined;

export function intParam(v: Raw, fallback = 1) {
  const n = Number.parseInt(first(v) ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Pick only the allowed values; anything else (including junk from the URL) falls back. */
export function enumParam<T extends string>(
  v: Raw,
  allowed: readonly T[],
  fallback?: T,
): T | undefined {
  const s = first(v);
  return s && (allowed as readonly string[]).includes(s) ? (s as T) : fallback;
}
