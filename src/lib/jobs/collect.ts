import "server-only";
import { isDbConfigured } from "@/lib/db";
import { fetchApiJobs } from "./apis";
import { isGmailConfigured, readAlertEmails, type MailCursor } from "./gmail";
import { looksLikeAlert, readEmail } from "./parsers";
import { acquireRunLock, finishRun, getJobSettings, getRunState, upsertJob } from "./store";
import type { RawJob, RunSummary } from "./types";

const MAX_API_AGE_DAYS = 14;

/**
 * One collection run: read new alert emails + public job boards, score, de-duplicate, save.
 * Called by the cron route (every 15 minutes / daily) and by "Run now" in the admin.
 */
export async function collectJobs(): Promise<RunSummary | { busy: true }> {
  if (!isDbConfigured()) throw new Error("MONGODB_URI is not set");
  if (!(await acquireRunLock())) return { busy: true };

  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  let cursor: MailCursor | undefined;
  let emailsRead = 0;
  const fromEmail: { job: RawJob; appliedAt?: Date }[] = [];
  let fromApis: RawJob[] = [];

  try {
    const settings = await getJobSettings();
    const state = await getRunState();

    const mailTask = isGmailConfigured()
      ? readAlertEmails(state?.cursor ?? null, state?.rescanDays)
          .then((res) => {
            cursor = res.cursor;
            emailsRead = res.emails.length;
            for (const email of res.emails) {
              try {
                const read = readEmail(email);
                if (read.kind === "alert") fromEmail.push(...read.jobs.map((job) => ({ job })));
                else if (read.kind === "application") fromEmail.push(...read.jobs.map((job) => ({ job, appliedAt: read.appliedAt })));
                else if (looksLikeAlert(email.subject) && !/^\s*(re|fwd?|fw)\s*:/i.test(email.subject))
                  errors.push(`${email.source}: no jobs found in "${email.subject.slice(0, 60)}"`);
              } catch (err) {
                errors.push(`${email.source}: could not read "${email.subject.slice(0, 60)}" (${(err as Error).message})`);
              }
            }
          })
          .catch((err) => void errors.push(`Gmail: ${(err as Error).message}`))
      : Promise.resolve(void errors.push("Gmail: not connected (set GMAIL_USER and GMAIL_APP_PASSWORD)"));

    const apiTask = fetchApiJobs(settings).then((res) => {
      // Public boards keep old listings around; only fresh ones are worth applying to
      const cutoff = Date.now() - MAX_API_AGE_DAYS * 24 * 60 * 60 * 1000;
      fromApis = res.jobs.filter((j) => !j.postedAt || j.postedAt.getTime() >= cutoff);
      errors.push(...res.errors);
    });

    await Promise.all([mailTask, apiTask]);

    let added = 0;
    let merged = 0;
    let skippedLowScore = 0;
    const tally = (r: Awaited<ReturnType<typeof upsertJob>>) =>
      r === "added" ? added++ : r === "merged" ? merged++ : skippedLowScore++;

    // Alerts you subscribed to are always kept (low scores go to the "Low match" tab);
    // public boards only keep jobs that pass your minimum score
    // Emails about roles already applied to are saved (or updated) as Applied
    for (const { job, appliedAt } of fromEmail) tally(await upsertJob(job, settings, { skipLowScore: false, appliedAt }));
    for (const job of fromApis) tally(await upsertJob(job, settings, { skipLowScore: true }));

    const summary: RunSummary = {
      startedAt,
      finishedAt: new Date().toISOString(),
      emailsRead,
      found: fromEmail.length + fromApis.length,
      added,
      merged,
      skippedLowScore,
      errors: errors.slice(0, 20),
    };
    await finishRun(cursor, summary);
    return summary;
  } catch (err) {
    const summary: RunSummary = {
      startedAt,
      finishedAt: new Date().toISOString(),
      emailsRead,
      found: 0,
      added: 0,
      merged: 0,
      skippedLowScore: 0,
      errors: [...errors, `Run failed: ${(err as Error).message}`].slice(0, 20),
    };
    await finishRun(undefined, summary).catch(() => {});
    return summary;
  }
}
