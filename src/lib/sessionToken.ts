import { jwtVerify, SignJWT } from "jose";

// Kept free of next/headers so proxy.ts can import it as well

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 8 * 60 * 60; // seconds

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set to at least 32 characters");
  return new TextEncoder().encode(secret);
}

export function isAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD_HASH && (process.env.SESSION_SECRET?.length ?? 0) >= 32);
}

export async function signSessionToken() {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

/** True only for an unexpired admin token signed with our secret. */
export async function isValidSessionToken(token: string | undefined) {
  if (!token || !isAuthConfigured()) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.sub === "admin";
  } catch {
    return false;
  }
}
