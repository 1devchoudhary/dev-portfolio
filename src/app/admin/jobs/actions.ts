"use server";

import { z } from "zod";
import { isDbConfigured } from "@/lib/db";
import { collectJobs } from "@/lib/jobs/collect";
import {
  addContact,
  addManualJob,
  getJobSettings,
  listJobs,
  recentRuns,
  requestRescan,
  rescoreJobs,
  saveJobDetails,
  saveJobSettings,
  setJobStatus,
  updateContact,
} from "@/lib/jobs/store";
import type { JobView, RunSummary } from "@/lib/jobs/types";
import { hasSession } from "@/lib/session";
import {
  contactInputSchema,
  jobDetailsSchema,
  jobSettingsSchema,
  jobStatusSchema,
  manualJobSchema,
  type JobSettings,
} from "@/lib/schema";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const SESSION_EXPIRED = "Your session has expired. Log in again in a new tab, then retry.";
const jobId = z.string().regex(/^[a-f0-9]{24}$/);

/** Every action is a public endpoint: check the session and the database first, then run. */
async function guarded<T>(fn: () => Promise<T>): Promise<Result<T>> {
  if (!(await hasSession())) return { ok: false, error: SESSION_EXPIRED };
  if (!isDbConfigured()) return { ok: false, error: "No database configured (MONGODB_URI is missing)." };
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      return { ok: false, error: `${issue.path.join(" › ") || "Input"}: ${issue.message}` };
    }
    console.error("[jobs] action failed:", err);
    return { ok: false, error: (err as Error).message || "Something went wrong. Please try again." };
  }
}

export async function runNowAction(): Promise<Result<{ summary: RunSummary | null; busy: boolean; jobs: JobView[]; runs: RunSummary[] }>> {
  return guarded(async () => {
    const result = await collectJobs();
    const busy = "busy" in result;
    return { summary: busy ? null : (result as RunSummary), busy, jobs: await listJobs(), runs: await recentRuns() };
  });
}

/** Re-reads the last 14 days of alert emails with the current rules, then runs once. */
export async function rescanAction(): Promise<Result<{ summary: RunSummary | null; busy: boolean; jobs: JobView[]; runs: RunSummary[] }>> {
  return guarded(async () => {
    await requestRescan(14);
    const result = await collectJobs();
    const busy = "busy" in result;
    return { summary: busy ? null : (result as RunSummary), busy, jobs: await listJobs(), runs: await recentRuns() };
  });
}

export async function setStatusAction(id: string, status: string): Promise<Result<JobView[]>> {
  return guarded(async () => {
    await setJobStatus(jobId.parse(id), jobStatusSchema.parse(status));
    return listJobs();
  });
}

/** Hides the job; optionally adds a word so future jobs with it in the title are hidden too. */
export async function notRelevantAction(id: string, excludeWord: string): Promise<Result<{ jobs: JobView[]; settings: JobSettings }>> {
  return guarded(async () => {
    await setJobStatus(jobId.parse(id), "hidden");
    let settings = await getJobSettings();
    const word = z.string().trim().max(40).parse(excludeWord).toLowerCase();
    if (word && !settings.excludeTitle.includes(word)) {
      settings = jobSettingsSchema.parse({ ...settings, excludeTitle: [...settings.excludeTitle, word] });
      await saveJobSettings(settings);
      await rescoreJobs(settings);
    }
    return { jobs: await listJobs(), settings };
  });
}

export async function saveDetailsAction(id: string, input: unknown): Promise<Result<JobView>> {
  return guarded(async () => {
    const { description, notes } = jobDetailsSchema.parse(input);
    const job = await saveJobDetails(jobId.parse(id), description, notes, await getJobSettings());
    if (!job) throw new Error("That job no longer exists.");
    return job;
  });
}

export async function addManualJobAction(input: unknown): Promise<Result<JobView[]>> {
  return guarded(async () => {
    await addManualJob(manualJobSchema.parse(input), await getJobSettings());
    return listJobs();
  });
}

export async function addContactAction(id: string, input: unknown): Promise<Result<JobView>> {
  return guarded(async () => {
    const job = await addContact(jobId.parse(id), contactInputSchema.parse(input));
    if (!job) throw new Error("That job no longer exists.");
    return job;
  });
}

export async function updateContactAction(id: string, contactId: string, action: string): Promise<Result<JobView>> {
  return guarded(async () => {
    const job = await updateContact(
      jobId.parse(id),
      z.uuid().parse(contactId),
      z.enum(["messaged", "done", "reopen", "delete"]).parse(action)
    );
    if (!job) throw new Error("That job no longer exists.");
    return job;
  });
}

export async function saveSettingsAction(input: unknown): Promise<Result<{ settings: JobSettings; rescored: number; jobs: JobView[] }>> {
  return guarded(async () => {
    const settings = jobSettingsSchema.parse(input);
    await saveJobSettings(settings);
    const rescored = await rescoreJobs(settings);
    return { settings, rescored, jobs: await listJobs() };
  });
}
