import type { JobStatus } from "@/lib/schema";

export const EMAIL_SOURCES = ["naukri", "linkedin", "wellfound", "instahyre", "cutshort"] as const;
export const API_SOURCES = ["remotive", "remoteok", "greenhouse", "lever", "ashby"] as const;

export type EmailSource = (typeof EMAIL_SOURCES)[number];
export type JobSource = EmailSource | (typeof API_SOURCES)[number] | "manual";

export const SOURCE_LABELS: Record<JobSource, string> = {
  naukri: "Naukri",
  linkedin: "LinkedIn",
  wellfound: "Wellfound",
  instahyre: "Instahyre",
  cutshort: "Cutshort",
  remotive: "Remotive",
  remoteok: "RemoteOK",
  greenhouse: "Greenhouse",
  lever: "Lever",
  ashby: "Ashby",
  manual: "Added by hand",
};

/** A job as read from an alert email or an API, before scoring and storage. */
export type RawJob = {
  source: JobSource;
  title: string;
  url: string;
  company?: string;
  location?: string;
  experience?: string;
  /** Short text shown on the card (from the email or the start of the description) */
  snippet?: string;
  /** Full job description when the source provides one; improves scoring */
  description?: string;
  postedAt?: Date;
};

export type Contact = {
  id: string;
  name: string;
  role: string;
  linkedin: string;
  email: string;
  messagedAt?: Date;
  followUpAt?: Date;
  done?: boolean;
};

export type JobDoc = {
  _id: string;
  /** title|company, used to merge the same job seen on two platforms */
  tcKey: string | null;
  url: string;
  source: JobSource;
  sources: JobSource[];
  title: string;
  company: string;
  location: string;
  experience: string;
  snippet: string;
  description: string;
  notes: string;
  hrEmails: string[];
  score: number;
  reasons: string[];
  status: JobStatus;
  autoHidden: boolean;
  firstSeenAt: Date;
  lastSeenAt: Date;
  appliedAt?: Date;
  contacts: Contact[];
};

/** JobDoc with dates as ISO strings, safe to pass to client components. */
export type JobView = Omit<JobDoc, "firstSeenAt" | "lastSeenAt" | "appliedAt" | "contacts"> & {
  firstSeenAt: string;
  lastSeenAt: string;
  appliedAt: string | null;
  contacts: (Omit<Contact, "messagedAt" | "followUpAt"> & { messagedAt: string | null; followUpAt: string | null })[];
};

export type RunSummary = {
  startedAt: string;
  finishedAt: string;
  emailsRead: number;
  found: number;
  added: number;
  merged: number;
  skippedLowScore: number;
  errors: string[];
};
