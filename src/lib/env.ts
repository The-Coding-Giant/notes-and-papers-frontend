const trim = (v: string) => v.replace(/\/+$/, "");

export const SITE_URL = trim(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010");
/** Backend base URL including the `/api/v1` prefix. */
export const API_URL = trim(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1");
/** Optional public contact details. Set them in the environment; nothing is shown (or invented) when empty. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";

export const SITE_NAME = "Notes & Papers";
export const UNIVERSITY_SLUG = "rajasthan-university";
export const UNIVERSITY_NAME = "Rajasthan University";
