import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
import { jobSettingsSchema, type JobSettings, type JobStatus } from "@/lib/schema";
import { defaultJobSettings } from "./defaults";
import type { MailCursor } from "./gmail";
import { extractHrEmails, scoreJob } from "./score";
import type { Contact, JobDoc, JobView, RawJob, RunSummary } from "./types";

type SettingsDoc = JobSettings & { _id: "settings"; updatedAt: Date };
type StateDoc = { _id: "state"; cursor: MailCursor; lockUntil?: Date; lastRun?: RunSummary; rescanDays?: number };
type RunLogDoc = RunSummary & { createdAt: Date };

const RUN_LOG_DAYS = 14;
const LOCK_MS = 4 * 60 * 1000;

let indexesReady: Promise<unknown> | undefined;

async function cols() {
  const db = await getDb();
  const jobs = db.collection<JobDoc>("jobs");
  const settings = db.collection<SettingsDoc>("job_settings");
  const runs = db.collection<StateDoc>("job_runs");
  const logs = db.collection<RunLogDoc>("job_run_logs");
  indexesReady ??= Promise.all([
    jobs.createIndex({ tcKey: 1 }),
    jobs.createIndex({ status: 1, score: -1, firstSeenAt: -1 }),
    logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: RUN_LOG_DAYS * 24 * 60 * 60 }),
  ]).catch((err) => {
    indexesReady = undefined;
    throw err;
  });
  await indexesReady;
  return { jobs, settings, runs, logs };
}

/* ---------- settings ---------- */

export async function getJobSettings(): Promise<JobSettings> {
  const { settings } = await cols();
  const doc = await settings.findOne({ _id: "settings" });
  if (!doc) return defaultJobSettings;
  const parsed = jobSettingsSchema.safeParse(doc);
  return parsed.success ? parsed.data : defaultJobSettings;
}

export async function saveJobSettings(value: JobSettings) {
  const { settings } = await cols();
  await settings.replaceOne({ _id: "settings" }, { ...value, updatedAt: new Date() }, { upsert: true });
}

/* ---------- jobs ---------- */

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const idFor = (url: string) => createHash("sha1").update(url.toLowerCase()).digest("hex").slice(0, 24);
const tcKeyFor = (title: string, company?: string) =>
  company && norm(company).length > 1 ? `${norm(title)}|${norm(company)}` : null;

export type UpsertResult = "added" | "merged" | "skipped";

/**
 * Saves one job. A job already seen (same URL, or same title + company from another platform)
 * keeps its status; only its "seen on" list and timestamp change.
 * API jobs below the minimum score are skipped so public boards don't flood the inbox.
 */
export async function upsertJob(
  raw: RawJob,
  settings: JobSettings,
  { skipLowScore, appliedAt }: { skipLowScore: boolean; appliedAt?: Date }
): Promise<UpsertResult> {
  const { jobs } = await cols();
  const _id = idFor(raw.url);
  const tcKey = tcKeyFor(raw.title, raw.company);
  const now = new Date();

  const existing = await jobs.findOne(tcKey ? { $or: [{ _id }, { tcKey }] } : { _id }, { projection: { _id: 1, status: 1 } });
  if (existing) {
    const set: Partial<JobDoc> = { lastSeenAt: now };
    if (appliedAt && existing.status !== "applied") Object.assign(set, { status: "applied", appliedAt });
    await jobs.updateOne({ _id: existing._id }, { $set: set, $addToSet: { sources: raw.source } });
    return "merged";
  }

  const { score, reasons, autoHidden } = scoreJob(raw, settings);
  if (skipLowScore && !appliedAt && (autoHidden || score < settings.minScore)) return "skipped";

  const doc: JobDoc = {
    _id,
    tcKey,
    url: raw.url,
    source: raw.source,
    sources: [raw.source],
    title: raw.title.slice(0, 200),
    company: (raw.company ?? "").slice(0, 120),
    location: (raw.location ?? "").slice(0, 160),
    experience: (raw.experience ?? "").slice(0, 60),
    snippet: (raw.snippet ?? "").slice(0, 300),
    description: (raw.description ?? "").slice(0, 15000),
    notes: "",
    hrEmails: extractHrEmails(`${raw.snippet ?? ""}\n${raw.description ?? ""}`),
    score,
    reasons,
    status: appliedAt ? "applied" : autoHidden ? "hidden" : "new",
    autoHidden: appliedAt ? false : autoHidden,
    firstSeenAt: raw.postedAt && raw.postedAt < now ? raw.postedAt : now,
    lastSeenAt: now,
    ...(appliedAt ? { appliedAt } : {}),
    contacts: [],
  };

  try {
    await jobs.insertOne(doc);
    return "added";
  } catch (err) {
    // Two runs racing on the same job: the other one already inserted it
    if ((err as { code?: number }).code === 11000) return "merged";
    throw err;
  }
}

const iso = (d?: Date) => (d ? d.toISOString() : null);

function toView(doc: JobDoc): JobView {
  return {
    ...doc,
    firstSeenAt: doc.firstSeenAt.toISOString(),
    lastSeenAt: doc.lastSeenAt.toISOString(),
    appliedAt: iso(doc.appliedAt),
    contacts: doc.contacts.map((c) => ({ ...c, messagedAt: iso(c.messagedAt), followUpAt: iso(c.followUpAt) })),
  };
}

/** Everything the inbox page needs: active jobs plus the most recent hidden ones. */
export async function listJobs(): Promise<JobView[]> {
  const { jobs } = await cols();
  const [active, hidden] = await Promise.all([
    jobs.find({ status: { $ne: "hidden" } }).sort({ score: -1, firstSeenAt: -1 }).limit(500).toArray(),
    jobs.find({ status: "hidden" }).sort({ lastSeenAt: -1 }).limit(100).toArray(),
  ]);
  return [...active, ...hidden].map(toView);
}

export async function getJob(id: string): Promise<JobView | null> {
  const { jobs } = await cols();
  const doc = await jobs.findOne({ _id: id });
  return doc ? toView(doc) : null;
}

export async function setJobStatus(id: string, status: JobStatus) {
  const { jobs } = await cols();
  const update = status === "applied" ? { $set: { status, appliedAt: new Date() } } : { $set: { status } };
  const res = await jobs.updateOne({ _id: id }, update);
  return res.matchedCount === 1;
}

export async function saveJobDetails(id: string, description: string, notes: string, settings: JobSettings) {
  const { jobs } = await cols();
  const doc = await jobs.findOne({ _id: id });
  if (!doc) return null;
  const { score, reasons } = scoreJob({ ...doc, description }, settings);
  const hrEmails = [...new Set([...doc.hrEmails, ...extractHrEmails(description)])].slice(0, 8);
  await jobs.updateOne({ _id: id }, { $set: { description, notes, score, reasons, hrEmails } });
  return getJob(id);
}

export async function addManualJob(input: { title: string; company: string; location: string; url: string }, settings: JobSettings) {
  await upsertJob({ source: "manual", ...input }, settings, { skipLowScore: false });
  return getJob(idFor(input.url));
}

/** Re-applies the current rules to jobs still waiting in the inbox (statuses you set by hand are kept). */
export async function rescoreJobs(settings: JobSettings) {
  const { jobs } = await cols();
  const cursor = jobs.find({ $or: [{ status: "new" }, { status: "hidden", autoHidden: true }] });
  let count = 0;
  for await (const doc of cursor) {
    const { score, reasons, autoHidden } = scoreJob(doc, settings);
    await jobs.updateOne({ _id: doc._id }, { $set: { score, reasons, autoHidden, status: autoHidden ? "hidden" : "new" } });
    count++;
  }
  return count;
}

/* ---------- contacts ---------- */

const FOLLOW_UP_DAYS = 6;

export async function addContact(jobId: string, input: Omit<Contact, "id">) {
  const { jobs } = await cols();
  const contact: Contact = { id: randomUUID(), name: input.name, role: input.role, linkedin: input.linkedin, email: input.email };
  await jobs.updateOne({ _id: jobId }, { $push: { contacts: contact } });
  return getJob(jobId);
}

export async function updateContact(jobId: string, contactId: string, action: "messaged" | "done" | "reopen" | "delete") {
  const { jobs } = await cols();
  if (action === "delete") {
    await jobs.updateOne({ _id: jobId }, { $pull: { contacts: { id: contactId } } });
  } else if (action === "messaged") {
    const now = new Date();
    await jobs.updateOne(
      { _id: jobId, "contacts.id": contactId },
      {
        $set: {
          "contacts.$.messagedAt": now,
          "contacts.$.followUpAt": new Date(now.getTime() + FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000),
          "contacts.$.done": false,
        },
      }
    );
  } else {
    await jobs.updateOne({ _id: jobId, "contacts.id": contactId }, { $set: { "contacts.$.done": action === "done" } });
  }
  return getJob(jobId);
}

/* ---------- run state ---------- */

export async function getRunState() {
  const { runs } = await cols();
  return runs.findOne({ _id: "state" });
}

/** Only one collection run at a time (15-minute pings and "Run now" can overlap). */
export async function acquireRunLock(): Promise<boolean> {
  const { runs } = await cols();
  const now = new Date();
  try {
    // Matching the unlocked state doc, or inserting it, both mean the lock is ours
    await runs.updateOne(
      { _id: "state", $or: [{ lockUntil: { $exists: false } }, { lockUntil: { $lt: now } }] },
      { $set: { lockUntil: new Date(now.getTime() + LOCK_MS) }, $setOnInsert: { cursor: null } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    // The state doc exists and is locked, so the upsert tried to insert a duplicate _id
    if ((err as { code?: number }).code === 11000) return false;
    throw err;
  }
}

/** Next run re-reads alert emails from the last `days` days (already-saved jobs are only updated). */
export async function requestRescan(days: number) {
  const { runs } = await cols();
  await runs.updateOne({ _id: "state" }, { $set: { cursor: null, rescanDays: days } }, { upsert: true });
}

export async function finishRun(cursor: MailCursor | undefined, summary: RunSummary) {
  const { runs, logs } = await cols();
  const set: Partial<StateDoc> = { lastRun: summary };
  const unset: Record<string, ""> = { lockUntil: "" };
  if (cursor !== undefined) {
    set.cursor = cursor;
    unset.rescanDays = "";
  }
  await runs.updateOne({ _id: "state" }, { $set: set, $unset: unset });
  await logs.insertOne({ ...summary, createdAt: new Date() });
}

export async function recentRuns(limit = 5): Promise<RunSummary[]> {
  const { logs } = await cols();
  const docs = await logs.find({}, { projection: { _id: 0, createdAt: 0 } }).sort({ createdAt: -1 }).limit(limit).toArray();
  return docs as RunSummary[];
}
