import "server-only";
import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (password: string, salt: string, keylen: number) => Promise<Buffer>;

/** Checks against ADMIN_PASSWORD_HASH ("salt:hash" hex, from `npm run hash-password`). */
export async function verifyPassword(password: string) {
  const [salt, hash] = (process.env.ADMIN_PASSWORD_HASH ?? "").split(":");
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const actual = await scryptAsync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
