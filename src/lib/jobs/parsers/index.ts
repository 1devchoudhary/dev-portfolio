import type { EmailSource, RawJob } from "../types";
import { extractJobs, type AlertEmail, type PlatformRules } from "./common";
import { cutshort } from "./cutshort";
import { instahyre } from "./instahyre";
import { linkedin } from "./linkedin";
import { naukri } from "./naukri";
import { wellfound } from "./wellfound";

export type { AlertEmail } from "./common";

export const PLATFORM_RULES: Record<EmailSource, PlatformRules> = { naukri, linkedin, wellfound, instahyre, cutshort };

/** Sender domains used to find alert emails, mapped to the platform that sent them. */
export const SENDER_DOMAINS: [string, EmailSource][] = [
  ["naukri.com", "naukri"],
  ["linkedin.com", "linkedin"],
  ["wellfound.com", "wellfound"],
  ["angel.co", "wellfound"],
  ["instahyre.com", "instahyre"],
  ["cutshort.io", "cutshort"],
];

export function sourceForSender(address: string): EmailSource | null {
  const domain = address.toLowerCase().split("@")[1] ?? "";
  return SENDER_DOMAINS.find(([d]) => domain === d || domain.endsWith(`.${d}`))?.[1] ?? null;
}

export function parseAlertEmail(email: AlertEmail): RawJob[] {
  return extractJobs(email, PLATFORM_RULES[email.source]);
}

// "RE: Backend Developer at Acme" (a conversation about a role) or "Your application was sent"
const REPLY_SUBJECT = /^\s*(re|fwd?|fw)\s*:/i;
const APPLIED_SUBJECT =
  /(you applied|you've applied|application (was |has been )?(sent|submitted|received|viewed)|thanks?( you)? for applying|applied (to|for)|your application)/i;
const ALERT_SUBJECT = /(job|alert|recommend|match|opening|hiring|vacanc|role|opportunit)/i;

/** Where each platform lists your applications, used when an email has no job link. */
const APPLICATIONS_PAGE: Record<EmailSource, string> = {
  naukri: "https://www.naukri.com/myapply/historypage",
  linkedin: "https://www.linkedin.com/my-items/saved-jobs/?cardType=APPLIED",
  wellfound: "https://wellfound.com/jobs/applications",
  instahyre: "https://www.instahyre.com/candidate/opportunities/",
  cutshort: "https://cutshort.io/profile/candidate-dashboard",
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export type ReadEmail =
  | { kind: "alert"; jobs: RawJob[] }
  /** Emails about a role you already applied to: the jobs get marked Applied */
  | { kind: "application"; jobs: RawJob[]; appliedAt: Date }
  | { kind: "other" };

export function readEmail(email: AlertEmail): ReadEmail {
  const jobs = parseAlertEmail(email);
  const isApplication = REPLY_SUBJECT.test(email.subject) || APPLIED_SUBJECT.test(email.subject);

  if (isApplication) {
    if (jobs.length) return { kind: "application", jobs: jobs.slice(0, 1), appliedAt: email.date };
    // No job link inside: take the role from the subject, "RE: <role> at <company>"
    const m = email.subject.replace(REPLY_SUBJECT, "").trim().match(/^(.{3,120}?)\s+at\s+(.{2,80})$/i);
    if (!m) return { kind: "other" };
    const [, title, company] = m;
    return {
      kind: "application",
      appliedAt: email.date,
      jobs: [
        {
          source: email.source,
          title: title.trim(),
          company: company.trim(),
          url: `${APPLICATIONS_PAGE[email.source]}#${slug(`${title}-${company}`)}`,
          snippet: `From your ${email.source} conversation: "${email.subject.slice(0, 120)}"`,
          postedAt: email.date,
        },
      ],
    };
  }

  if (jobs.length) return { kind: "alert", jobs };
  return { kind: "other" };
}

/** Only alert-looking emails with no jobs are worth a note; receipts, newsletters etc. aren't. */
export const looksLikeAlert = (subject: string) => ALERT_SUBJECT.test(subject);
