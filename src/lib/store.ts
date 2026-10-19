import "server-only";
import { cache } from "react";
import { Binary } from "mongodb";
import { defaultContent } from "@/data/content";
import { getDb, isDbConfigured } from "./db";
import { siteContentSchema, type SiteContent } from "./schema";

type ContentDoc = SiteContent & { _id: string; updatedAt: Date };
type ResumeDoc = { _id: string; data: Binary; filename: string; size: number; updatedAt: Date };

export type ResumeMeta = { filename: string; size: number; updatedAt: string };

/**
 * Site content from the database, falling back to the bundled defaults.
 * Memoised per render so metadata, JSON-LD and the page share one read.
 */
export const getContent = cache(async (): Promise<{ content: SiteContent; updatedAt: Date | null; fromDb: boolean }> => {
  if (!isDbConfigured()) return { content: defaultContent, updatedAt: null, fromDb: false };

  try {
    const db = await getDb();
    const doc = await db.collection<ContentDoc>("site").findOne({ _id: "content" });
    if (!doc) return { content: defaultContent, updatedAt: null, fromDb: false };

    // zod drops unknown keys, so _id and updatedAt don't leak into the content
    const parsed = siteContentSchema.safeParse(doc);
    if (!parsed.success) {
      console.warn("[content] stored content failed validation, using defaults:", parsed.error.issues[0]);
      return { content: defaultContent, updatedAt: null, fromDb: false };
    }
    return { content: parsed.data, updatedAt: doc.updatedAt, fromDb: true };
  } catch (err) {
    console.warn("[content] database unavailable, using defaults:", (err as Error).message);
    return { content: defaultContent, updatedAt: null, fromDb: false };
  }
});

export async function saveContent(content: SiteContent): Promise<Date> {
  const db = await getDb();
  const updatedAt = new Date();
  await db
    .collection<ContentDoc>("site")
    .replaceOne({ _id: "content" }, { ...content, updatedAt }, { upsert: true });
  return updatedAt;
}

export async function getResumeMeta(): Promise<ResumeMeta | null> {
  if (!isDbConfigured()) return null;
  const db = await getDb();
  const doc = await db
    .collection<ResumeDoc>("files")
    .findOne({ _id: "resume" }, { projection: { data: 0 } });
  return doc ? { filename: doc.filename, size: doc.size, updatedAt: doc.updatedAt.toISOString() } : null;
}

export async function getResumeFile(): Promise<Buffer | null> {
  if (!isDbConfigured()) return null;
  const db = await getDb();
  const doc = await db.collection<ResumeDoc>("files").findOne({ _id: "resume" });
  return doc ? Buffer.from(doc.data.buffer) : null;
}

export async function saveResume(data: Buffer, filename: string): Promise<ResumeMeta> {
  const db = await getDb();
  const updatedAt = new Date();
  await db
    .collection<ResumeDoc>("files")
    .replaceOne(
      { _id: "resume" },
      { data: new Binary(data), filename, size: data.length, updatedAt },
      { upsert: true }
    );
  return { filename, size: data.length, updatedAt: updatedAt.toISOString() };
}
