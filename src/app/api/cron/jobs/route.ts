import { timingSafeEqual } from "node:crypto";
import { collectJobs } from "@/lib/jobs/collect";

// Gmail + several job boards in one run; keep well inside serverless limits
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Called by Vercel Cron (daily, sends the CRON_SECRET header automatically) and by an
 * external pinger such as cron-job.org every 15 minutes with the header
 * "Authorization: Bearer <CRON_SECRET>".
 */
export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await collectJobs();
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[jobs] cron run failed:", err);
    return Response.json({ error: "Run failed" }, { status: 500 });
  }
}
