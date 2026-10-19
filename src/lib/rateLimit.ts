import "server-only";
import { getDb, isDbConfigured } from "./db";

const WINDOW_SECONDS = 15 * 60;
const MAX_FAILURES = 5;

type Attempt = { ip: string; createdAt: Date };

// Failed logins live in Mongo (not memory) so the limit holds across serverless instances;
// the TTL index deletes them once the window has passed
let indexReady: Promise<string> | undefined;

async function attempts() {
  const col = (await getDb()).collection<Attempt>("login_attempts");
  indexReady ??= col.createIndex({ createdAt: 1 }, { expireAfterSeconds: WINDOW_SECONDS });
  await indexReady;
  return col;
}

// Without a database there is nothing to edit, so local dev skips the limiter
export async function isRateLimited(ip: string) {
  if (!isDbConfigured()) return false;
  const since = new Date(Date.now() - WINDOW_SECONDS * 1000);
  const count = await (await attempts()).countDocuments({ ip, createdAt: { $gt: since } });
  return count >= MAX_FAILURES;
}

export async function recordFailure(ip: string) {
  if (!isDbConfigured()) return;
  await (await attempts()).insertOne({ ip, createdAt: new Date() });
}

export async function clearFailures(ip: string) {
  if (!isDbConfigured()) return;
  await (await attempts()).deleteMany({ ip });
}
