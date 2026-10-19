import "server-only";
import type { JobSettings } from "@/lib/schema";
import type { RawJob } from "./types";

const TIMEOUT_MS = 10_000;
const MAX_PER_SOURCE = 80;
const UA = "devendra-portfolio-job-inbox/1.0 (personal job search)";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": UA },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${new URL(url).hostname} answered ${res.status}`);
  return (await res.json()) as T;
}

/** HTML job descriptions → plain text, capped so documents stay small. */
export function htmlToText(html: string, max = 8000) {
  return html
    .replace(/<(br|\/p|\/li|\/h\d)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim()
    .slice(0, max);
}

const snippetOf = (text: string) => text.replace(/\s+/g, " ").slice(0, 280);

async function remotive(): Promise<RawJob[]> {
  type R = { jobs: { url: string; title: string; company_name: string; candidate_required_location: string; publication_date: string; description: string }[] };
  const data = await getJson<R>("https://remotive.com/api/remote-jobs?category=software-dev&limit=100");
  return data.jobs.slice(0, MAX_PER_SOURCE).map((j) => {
    const description = htmlToText(j.description);
    return {
      source: "remotive",
      title: j.title,
      company: j.company_name,
      location: `Remote · ${j.candidate_required_location}`,
      url: j.url,
      description,
      snippet: snippetOf(description),
      postedAt: new Date(j.publication_date),
    };
  });
}

async function remoteok(): Promise<RawJob[]> {
  type R = { id?: string; position?: string; company?: string; location?: string; url?: string; description?: string; date?: string; tags?: string[] }[];
  const data = await getJson<R>("https://remoteok.com/api");
  // The first element is a legal notice, not a job
  return data
    .filter((j) => j.position && j.url)
    .slice(0, MAX_PER_SOURCE)
    .map((j) => {
      const description = `${htmlToText(j.description ?? "")}\n${(j.tags ?? []).join(", ")}`;
      return {
        source: "remoteok",
        title: j.position!,
        company: j.company,
        location: `Remote${j.location ? ` · ${j.location}` : ""}`,
        url: j.url!,
        description,
        snippet: snippetOf(description),
        postedAt: j.date ? new Date(j.date) : undefined,
      };
    });
}

async function greenhouse(slug: string): Promise<RawJob[]> {
  type R = { jobs: { title: string; absolute_url: string; location?: { name?: string }; updated_at?: string; content?: string }[] };
  const data = await getJson<R>(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`);
  return data.jobs.slice(0, MAX_PER_SOURCE).map((j) => {
    // Greenhouse double-encodes the HTML content
    const description = htmlToText(htmlToText(j.content ?? "", 20000));
    return {
      source: "greenhouse",
      title: j.title,
      company: slug,
      location: j.location?.name ?? "",
      url: j.absolute_url,
      description,
      snippet: snippetOf(description),
      postedAt: j.updated_at ? new Date(j.updated_at) : undefined,
    };
  });
}

async function lever(slug: string): Promise<RawJob[]> {
  type R = { text: string; hostedUrl: string; createdAt?: number; categories?: { location?: string; commitment?: string }; descriptionPlain?: string; additionalPlain?: string }[];
  const data = await getJson<R>(`https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`);
  return data.slice(0, MAX_PER_SOURCE).map((j) => {
    const description = `${j.descriptionPlain ?? ""}\n${j.additionalPlain ?? ""}`.slice(0, 8000);
    return {
      source: "lever",
      title: j.text,
      company: slug,
      location: j.categories?.location ?? "",
      url: j.hostedUrl,
      description,
      snippet: snippetOf(description),
      postedAt: j.createdAt ? new Date(j.createdAt) : undefined,
    };
  });
}

async function ashby(slug: string): Promise<RawJob[]> {
  type R = { jobs: { title: string; jobUrl: string; location?: string; isRemote?: boolean; publishedAt?: string; descriptionPlain?: string; descriptionHtml?: string }[] };
  const data = await getJson<R>(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}`);
  return data.jobs.slice(0, MAX_PER_SOURCE).map((j) => {
    const description = (j.descriptionPlain ?? htmlToText(j.descriptionHtml ?? "")).slice(0, 8000);
    return {
      source: "ashby",
      title: j.title,
      company: slug,
      location: [j.location, j.isRemote ? "Remote" : ""].filter(Boolean).join(" · "),
      url: j.jobUrl,
      description,
      snippet: snippetOf(description),
      postedAt: j.publishedAt ? new Date(j.publishedAt) : undefined,
    };
  });
}

/** Every enabled public source, fetched in parallel. One failing source never stops the others. */
export async function fetchApiJobs(settings: JobSettings): Promise<{ jobs: RawJob[]; errors: string[] }> {
  const tasks: [string, Promise<RawJob[]>][] = [];
  if (settings.apis.remotive) tasks.push(["Remotive", remotive()]);
  if (settings.apis.remoteok) tasks.push(["RemoteOK", remoteok()]);
  for (const c of settings.companies) {
    const run = c.ats === "greenhouse" ? greenhouse : c.ats === "lever" ? lever : ashby;
    tasks.push([`${c.ats}:${c.slug}`, run(c.slug)]);
  }

  const results = await Promise.allSettled(tasks.map(([, p]) => p));
  const jobs: RawJob[] = [];
  const errors: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") jobs.push(...r.value);
    else errors.push(`${tasks[i][0]}: ${(r.reason as Error).message}`);
  });
  return { jobs, errors };
}
