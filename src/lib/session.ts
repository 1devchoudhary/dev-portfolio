import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, signSessionToken } from "./sessionToken";

export async function createSession() {
  const token = await signSessionToken();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * Data-access-layer guard: every admin page and server action checks the session itself.
 * Server actions are public endpoints, so the proxy redirect alone is not enough.
 */
export const hasSession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return isValidSessionToken(token);
});

/** For pages: send anyone without a valid session to the login screen. */
export async function verifySession() {
  if (!(await hasSession())) redirect("/admin/login");
}
