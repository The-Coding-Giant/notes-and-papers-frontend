/** Cookie names and options shared by the server actions and the proxy. Tokens are HttpOnly: page scripts never see them. */
export const ACCESS_COOKIE = "np_access";
export const REFRESH_COOKIE = "np_refresh";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

const base = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const accessOptions = (expiresIn: number) => ({ ...base, maxAge: expiresIn });
export const refreshOptions = () => ({ ...base, maxAge: 30 * 24 * 3600 });

/** Seconds until the JWT expires (0 when it cannot be read). Decodes only; the API verifies the signature. */
export function secondsLeft(jwt: string | undefined): number {
  if (!jwt) return 0;
  try {
    const part = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const exp = JSON.parse(atob(part)).exp as number;
    return exp - Math.floor(Date.now() / 1000);
  } catch {
    return 0;
  }
}
