import { parse, type HTMLElement } from "node-html-parser";
import type { EmailSource, RawJob } from "../types";

export type AlertEmail = { source: EmailSource; subject: string; html: string; text: string; date: Date };

export type PlatformRules = {
  source: EmailSource;
  /** Host must end with one of these, e.g. "naukri.com" */
  hosts: string[];
  /** Turn a job link into one stable URL (drop tracking), or null if it isn't a job link */
  canonical: (url: URL) => string | null;
  /** Links on the platform's domain that hide the job URL (tracking redirects) are accepted
   *  when the link text looks like a job title */
  acceptTrackedLinks?: boolean;
};

const ROLE_WORDS =
  /\b(developer|engineer|programmer|sde|swe|stack|backend|back-end|frontend|front-end|node|mern|mean|javascript|react|software|devops|architect|consultant|analyst|intern|lead)\b/i;
const NOISE_TEXT =
  /^(view|see|show|apply|unsubscribe|manage|settings|privacy|help|terms|download|update|edit|search|more|click here|here|explore|jobs? for you|recommended)\b/i;
const CITIES =
  /\b(remote|hybrid|work from home|wfh|bengaluru|bangalore|pune|hyderabad|indore|mumbai|navi mumbai|thane|delhi|new delhi|ncr|noida|greater noida|gurgaon|gurugram|chennai|kolkata|ahmedabad|jaipur|chandigarh|mohali|kochi|coimbatore|bhopal|nagpur|surat|lucknow|india)\b/i;
const EXPERIENCE = /\d{1,2}\s*(?:-|–|—|to)\s*\d{1,2}\s*(?:\+\s*)?(?:yrs?|years?)|\d{1,2}\s*\+?\s*(?:yrs?|years?)/i;
const SALARY = /(₹|rs\.?|inr|lpa|lacs?|lakhs?|\$|ctc|per annum|\/month)/i;

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

/** Email links often wrap the real URL in a redirect: …/click?url=https%3A%2F%2F… */
function unwrap(href: string): URL | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  for (const key of ["url", "u", "redirect", "redirect_url", "target", "dest", "destination", "link"]) {
    const inner = url.searchParams.get(key);
    if (inner && /^https?:\/\//i.test(inner)) {
      try {
        return new URL(inner);
      } catch {
        /* keep the outer URL */
      }
    }
  }
  return url;
}

const hostMatches = (url: URL, hosts: string[]) =>
  hosts.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`));

/** The block of the email that belongs to one job: the nearest table cell / row / list item. */
function contextLines(a: HTMLElement): string[] {
  let node: HTMLElement | null = a;
  for (let depth = 0; node && depth < 6; depth++) {
    node = node.parentNode as HTMLElement | null;
    if (!node?.tagName) break;
    if (["TD", "TR", "LI", "TABLE"].includes(node.tagName) && clean(node.text).length > clean(a.text).length + 10) break;
  }
  const text = (node ?? a).structuredText ?? "";
  return text
    .split("\n")
    .map(clean)
    .filter(Boolean)
    .slice(0, 12);
}

function guessDetails(title: string, rawLines: string[]) {
  // "Acme · Pune · Remote · ₹4-6L" carries several fields on one line: split it up
  const lines = rawLines.flatMap((l) => (/[·|•]/.test(l) ? l.split(/\s*[·|•]\s*/) : [l])).map(clean).filter(Boolean);
  const others = lines.filter((l) => l !== title && l.length <= 120);
  const experience = others.find((l) => EXPERIENCE.test(l))?.match(EXPERIENCE)?.[0] ?? "";
  const location = others
    .filter((l) => CITIES.test(l) && l.length <= 80)
    .slice(0, 4)
    .join(" · ");
  const company =
    others.find(
      (l) =>
        l.length >= 2 &&
        l.length <= 60 &&
        !EXPERIENCE.test(l) &&
        !SALARY.test(l) &&
        !CITIES.test(l) &&
        !NOISE_TEXT.test(l) &&
        !ROLE_WORDS.test(l) &&
        !/^\d/.test(l) &&
        !/(ago|posted|today|yesterday|reviews?|rating|applicants?)/i.test(l)
    ) ?? "";
  const snippet = clean(others.join(" · ")).slice(0, 300);
  return { company, location, experience, snippet };
}

export function extractJobs(email: AlertEmail, rules: PlatformRules, max = 40): RawJob[] {
  if (!email.html) return [];
  const root = parse(email.html);
  const byUrl = new Map<string, RawJob>();

  for (const a of root.querySelectorAll("a")) {
    const href = a.getAttribute("href");
    const title = clean(a.text);
    if (!href || !title || title.length < 4 || title.length > 140 || NOISE_TEXT.test(title)) continue;

    const url = unwrap(href);
    if (!url || !hostMatches(url, rules.hosts)) continue;

    let canonical = rules.canonical(url);
    if (!canonical) {
      // Tracking links don't show the job path; trust them only when the text reads like a role
      if (!rules.acceptTrackedLinks || !ROLE_WORDS.test(title)) continue;
      canonical = `${url.origin}${url.pathname}`;
    }

    const existing = byUrl.get(canonical);
    if (existing && existing.title.length >= title.length) continue;
    if (!ROLE_WORDS.test(title) && existing) continue;

    const details = guessDetails(title, contextLines(a));
    byUrl.set(canonical, { source: rules.source, title, url: canonical, postedAt: email.date, ...details });
    if (byUrl.size >= max) break;
  }

  // Links whose text isn't a role (e.g. the company name) only count when no better title exists
  return [...byUrl.values()].filter((j) => ROLE_WORDS.test(j.title) || j.title.split(" ").length >= 2);
}
