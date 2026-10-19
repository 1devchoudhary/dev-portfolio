import type { Metadata } from "next";
import JobsInbox from "@/components/Admin/JobsInbox";
import { isDbConfigured } from "@/lib/db";
import { isGmailConfigured } from "@/lib/jobs/gmail";
import { defaultJobSettings } from "@/lib/jobs/defaults";
import { getJobSettings, listJobs, recentRuns } from "@/lib/jobs/store";
import { verifySession } from "@/lib/session";

export const metadata: Metadata = { title: "Job inbox" };

// "Run now" reads Gmail and several job boards; give its server action room to finish
export const maxDuration = 60;

export default async function JobsPage() {
  await verifySession();

  const dbConfigured = isDbConfigured();
  const [jobs, settings, runs] = dbConfigured
    ? await Promise.all([listJobs(), getJobSettings(), recentRuns()])
    : [[], defaultJobSettings, []];

  return (
    <JobsInbox
      initialJobs={jobs}
      initialSettings={settings}
      recommendedSettings={defaultJobSettings}
      initialRuns={runs}
      dbConfigured={dbConfigured}
      gmailConfigured={isGmailConfigured()}
    />
  );
}
