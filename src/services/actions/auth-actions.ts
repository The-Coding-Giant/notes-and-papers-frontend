"use server";

import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api/client";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessOptions,
  refreshOptions,
  type TokenPair,
} from "@/lib/auth/cookies";
import { loginSchema, signupSchema } from "@/lib/validation";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function store(tokens: TokenPair) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.access_token, accessOptions(tokens.expires_in));
  jar.set(REFRESH_COOKIE, tokens.refresh_token, refreshOptions());
}

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a valid email and password." };
  try {
    await store(
      await apiFetch<TokenPair>("/auth/login", {
        method: "POST",
        body: parsed.data,
        revalidate: false,
      }),
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Login failed." };
  }
}

export async function signupAction(input: {
  name: string;
  email: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form and try again." };
  const { name, email, password } = parsed.data;
  try {
    await store(
      await apiFetch<TokenPair>("/auth/register", {
        method: "POST",
        body: { email, password, display_name: name },
        revalidate: false,
      }),
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sign-up failed." };
  }
}

export async function signOutAction(): Promise<ActionResult> {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    await apiFetch("/auth/logout", {
      method: "POST",
      body: { refresh_token: refresh },
      revalidate: false,
    }).catch(() => undefined);
  }
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  return { ok: true };
}
