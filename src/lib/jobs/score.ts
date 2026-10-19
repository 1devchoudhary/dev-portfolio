import type { JobSettings } from "@/lib/schema";
import type { RawJob } from "./types";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Whole-word, case-insensitive match that also works for terms like ".net", "c#" and "node.js". */
export function hasTerm(haystack: string, term: string) {
  const t = term.trim().toLowerCase();
  if (!t) return false;
  return new RegExp(`(^|[^a-z0-9])${escapeRegex(t)}(?=[^a-z0-9]|$)`, "i").test(haystack);
}

/** "2-5 Yrs", "1 to 3 years", "0–2 yrs", "3+ years" → minimum years, if any. */
export function minYears(text: string): number | null {
  const range = text.match(/(\d{1,2})\s*(?:-|–|—|to)\s*\d{1,2}\s*(?:\+\s*)?(?:yrs?|years?)/i);
  if (range) return Number(range[1]);
  const single = text.match(/(\d{1,2})\s*\+?\s*(?:yrs?|years?)(?:\s+of)?\s+(?:experience|exp)/i);
  return single ? Number(single[1]) : null;
}

// Remote jobs limited to these regions can't hire from India
const FOREIGN_ONLY = /\b(usa?|united states|us only|north america|canada|uk only|united kingdom|europe|eu only|emea|latam|australia)\b/i;
const OPEN_REGION = /\b(india|asia|apac|worldwide|anywhere|global)\b/i;

export type ScoreResult = { score: number; reasons: string[]; autoHidden: boolean };

export function scoreJob(job: Pick<RawJob, "title" | "company" | "location" | "experience" | "snippet" | "description">, s: JobSettings): ScoreResult {
  const title = job.title.toLowerCase();
  const body = [job.title, job.experience, job.location, job.snippet, job.description].filter(Boolean).join(" \n ").toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  for (const group of s.positive) {
    const hit = group.terms.find((t) => hasTerm(body, t));
    if (hit) {
      score += group.weight;
      reasons.push(`+${group.weight} ${hit}`);
    }
  }
  for (const group of s.negative) {
    const hit = group.terms.find((t) => hasTerm(body, t));
    if (hit) {
      score -= group.weight;
      reasons.push(`−${group.weight} ${hit}`);
    }
  }

  // Alert emails often put the location in the snippet line ("Acme · Pune · Remote · ₹4-6L")
  const where = `${job.location ?? ""} ${job.title} ${job.snippet ?? ""}`.toLowerCase();
  const place = s.locations.find((l) => hasTerm(where, l));
  // "Remote · Ireland" from a public board means remote within that country only
  const remoteRegion = job.location?.match(/^remote\s*·\s*(.+)$/i)?.[1];
  const closedRemote = remoteRegion ? !OPEN_REGION.test(remoteRegion) : false;
  const foreignOnly = Boolean(job.location && FOREIGN_ONLY.test(job.location) && !OPEN_REGION.test(job.location));

  if (closedRemote || foreignOnly) {
    score -= 25;
    reasons.push(`−25 not open to India${remoteRegion ? ` (${remoteRegion.slice(0, 30)})` : ""}`);
  } else if (place) {
    score += 10;
    reasons.push(`+10 ${place}`);
  }

  const min = minYears(`${job.experience ?? ""} ${job.title} ${job.snippet ?? ""} ${job.description ?? ""}`);
  if (min !== null) {
    if (min <= s.maxMinYears) {
      score += 15;
      reasons.push(`+15 needs ${min}+ yrs`);
    } else {
      score -= 30;
      reasons.push(`−30 needs ${min}+ yrs`);
    }
  }

  const excluded = s.excludeTitle.find((w) => hasTerm(title, w));
  if (excluded) reasons.push(`hidden: "${excluded}" in title`);

  return { score: Math.max(0, Math.min(100, score)), reasons, autoHidden: Boolean(excluded) };
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const NOT_HR = /(no-?reply|donotreply|notifications?|alerts?|support|privacy|unsubscribe|jobalerts|mailer|bounce)/i;
const PLATFORM_DOMAINS = /@([a-z0-9-]+\.)*(naukri|linkedin|wellfound|angel|instahyre|cutshort|remotive|remoteok|greenhouse|lever|ashbyhq|google|gmail-noreply)\./i;

/** Recruiter emails written inside a job description ("share your CV at hr@company.com"). */
export function extractHrEmails(text: string): string[] {
  const found = (text.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase().replace(/[.,;:]+$/, ""));
  return [...new Set(found)].filter((e) => !NOT_HR.test(e) && !PLATFORM_DOMAINS.test(e)).slice(0, 5);
}
