"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  EyeOff,
  ExternalLink,
  Mail,
  Plus,
  RefreshCw,
  RotateCcw,
  Send,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  addContactAction,
  addManualJobAction,
  notRelevantAction,
  rescanAction,
  runNowAction,
  saveDetailsAction,
  saveSettingsAction,
  setStatusAction,
  updateContactAction,
} from "@/app/admin/jobs/actions";
import type { JobSettings } from "@/lib/schema";
import { SOURCE_LABELS, type JobView, type RunSummary } from "@/lib/jobs/types";
import { Field } from "./fields";

const tabs = ["Top matches", "Low match", "Saved", "Applied", "Follow-ups", "Hidden", "Settings"] as const;
type Tab = (typeof tabs)[number];
type Notice = { kind: "ok" | "error"; text: string } | null;
type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—";

const btn =
  "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-body hover:text-foreground hover:border-accent/50 disabled:opacity-40";

function Card({ title, actions, children }: { title?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="card p-5 sm:p-6">
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h3 className="font-semibold">{title}</h3>}
          {actions}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ScoreBadge({ score, min }: { score: number; min: number }) {
  const tone =
    score >= 60 ? "border-ok/40 text-ok" : score >= min ? "border-amber-400/40 text-amber-300" : "border-border text-dim";
  return <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border text-sm font-bold ${tone}`}>{score}</span>;
}

/** Fills {name} {role} {company} {platform} in a message template. */
function fill(template: string, job: JobView, name: string) {
  return template
    .replaceAll("{name}", name.split(" ")[0] || "there")
    .replaceAll("{role}", job.title)
    .replaceAll("{company}", job.company || "your company")
    .replaceAll("{platform}", SOURCE_LABELS[job.source]);
}

/* ---------- settings <-> text ---------- */

const groupsToText = (groups: JobSettings["positive"]) => groups.map((g) => `${g.weight}: ${g.terms.join(", ")}`).join("\n");
const textToGroups = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(\d+)\s*:\s*(.+)$/);
      if (!m) throw new Error(`Keyword line needs "weight: words" — got "${line}"`);
      return { weight: Number(m[1]), terms: m[2].split(",").map((t) => t.trim()).filter(Boolean) };
    });
const listToText = (items: string[]) => items.join(", ");
const textToList = (text: string) => text.split(/[,\n]/).map((t) => t.trim()).filter(Boolean);
const companiesToText = (c: JobSettings["companies"]) => c.map((x) => `${x.ats}: ${x.slug}`).join("\n");
const textToCompanies = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(greenhouse|lever|ashby)\s*:\s*(\S+)$/i);
      if (!m) throw new Error(`Company line needs "greenhouse: slug", "lever: slug" or "ashby: slug" — got "${line}"`);
      return { ats: m[1].toLowerCase() as "greenhouse" | "lever" | "ashby", slug: m[2] };
    });

export default function JobsInbox({
  initialJobs,
  initialSettings,
  recommendedSettings,
  initialRuns,
  dbConfigured,
  gmailConfigured,
}: {
  initialJobs: JobView[];
  initialSettings: JobSettings;
  recommendedSettings: JobSettings;
  initialRuns: RunSummary[];
  dbConfigured: boolean;
  gmailConfigured: boolean;
}) {
  const [jobs, setJobs] = useState(initialJobs);
  const [settings, setSettings] = useState(initialSettings);
  const [runs, setRuns] = useState(initialRuns);
  const [tab, setTab] = useState<Tab>("Top matches");
  const [notice, setNotice] = useState<Notice>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [busy, startBusy] = useTransition();

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  /** Runs a server action; on success applies the result, on failure shows the error. */
  const act = <T,>(call: () => Promise<Result<T>>, apply: (data: T) => void, okText?: string) =>
    startBusy(async () => {
      const res = await call();
      if (res.ok) {
        apply(res.data);
        if (okText) setNotice({ kind: "ok", text: okText });
      } else setNotice({ kind: "error", text: res.error });
    });

  const replaceJob = (job: JobView) => setJobs((all) => all.map((j) => (j._id === job._id ? job : j)));

  // Fixed when the page loads; follow-ups that fall due later show after a refresh
  const [now] = useState(() => Date.now());
  const followUps = useMemo(
    () =>
      jobs.flatMap((job) =>
        job.contacts
          .filter((c) => c.followUpAt && !c.done && new Date(c.followUpAt).getTime() <= now)
          .map((contact) => ({ job, contact }))
      ),
    [jobs, now]
  );

  const visible = useMemo(() => {
    switch (tab) {
      case "Top matches":
        return jobs.filter((j) => j.status === "new" && j.score >= settings.minScore);
      case "Low match":
        return jobs.filter((j) => j.status === "new" && j.score < settings.minScore);
      case "Saved":
        return jobs.filter((j) => j.status === "saved");
      case "Applied":
        return jobs.filter((j) => j.status === "applied").sort((a, b) => (b.appliedAt ?? "").localeCompare(a.appliedAt ?? ""));
      case "Hidden":
        return jobs.filter((j) => j.status === "hidden");
      default:
        return [];
    }
  }, [jobs, tab, settings.minScore]);

  const count = (t: Tab) =>
    t === "Follow-ups"
      ? followUps.length
      : t === "Settings"
        ? null
        : t === "Top matches"
          ? jobs.filter((j) => j.status === "new" && j.score >= settings.minScore).length
          : t === "Low match"
            ? jobs.filter((j) => j.status === "new" && j.score < settings.minScore).length
            : jobs.filter((j) => j.status === t.toLowerCase()).length;

  const lastRun = runs[0];

  const runNow = () =>
    act(runNowAction, (data) => {
      setJobs(data.jobs);
      setRuns(data.runs);
      setNotice(
        data.busy
          ? { kind: "error", text: "A run is already in progress — try again in a few minutes." }
          : { kind: "ok", text: `Done: ${data.summary?.added ?? 0} new jobs, ${data.summary?.merged ?? 0} already seen.` }
      );
    });

  const notRelevant = (job: JobView) => {
    const word = window.prompt(
      `Hide "${job.title}".\n\nAlso hide future jobs whose TITLE contains this word (optional, e.g. "php"). Leave empty to just hide this one:`,
      ""
    );
    if (word === null) return;
    act(() => notRelevantAction(job._id, word), (d) => {
      setJobs(d.jobs);
      setSettings(d.settings);
    }, word ? `Hidden — titles with "${word}" will be hidden from now on.` : "Hidden.");
  };

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice({ kind: "ok", text: `${what} copied.` });
    } catch {
      setNotice({ kind: "error", text: "Couldn't copy — select the text and copy it manually." });
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
          <div className="mr-auto">
            <p className="font-heading text-lg font-extrabold">
              DC<span className="text-accent">.</span> <span className="font-sans text-sm font-medium text-body">Job inbox</span>
            </p>
            <p className="text-xs text-dim">
              Last check: {lastRun ? `${fmt(lastRun.finishedAt)} · ${lastRun.added} new` : "never"}
            </p>
          </div>
          <a href="/admin" className="inline-flex items-center gap-1.5 text-sm text-body hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> Site editor
          </a>
          <button type="button" onClick={() => setShowAdd((v) => !v)} className="inline-flex items-center gap-1.5 text-sm text-body hover:text-foreground">
            <Plus className="w-3.5 h-3.5" /> Add job
          </button>
          <button
            type="button"
            onClick={runNow}
            disabled={busy || !dbConfigured}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} /> {busy ? "Working…" : "Run now"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5">
        {!dbConfigured && (
          <p className="mt-6 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            No database is configured (MONGODB_URI), so the job inbox can&apos;t run.
          </p>
        )}
        {dbConfigured && !gmailConfigured && (
          <p className="mt-6 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            Gmail isn&apos;t connected yet, so only public job boards are checked. Add GMAIL_USER and GMAIL_APP_PASSWORD (see README → Job inbox).
          </p>
        )}

        {lastRun && lastRun.errors.length > 0 && (
          <details className="mt-4 text-xs text-dim">
            <summary className="cursor-pointer">Last run notes ({lastRun.errors.length})</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {lastRun.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </details>
        )}

        {showAdd && <AddJobForm busy={busy} onAdd={(input) => act(() => addManualJobAction(input), (d) => { setJobs(d); setShowAdd(false); setTab("Top matches"); }, "Job added.")} />}

        <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
          {tabs.map((t) => {
            const n = count(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors ${
                  tab === t ? "border-accent text-foreground" : "border-transparent text-body hover:text-foreground"
                }`}
              >
                {t}
                {n !== null && <span className="ml-1.5 text-xs text-dim">{n}</span>}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 space-y-4">
          {tab === "Settings" && (
            <SettingsPanel
              settings={settings}
              recommended={recommendedSettings}
              busy={busy}
              onSave={(next) =>
                act(() => saveSettingsAction(next), (d) => {
                  setSettings(d.settings);
                  setJobs(d.jobs);
                  setNotice({ kind: "ok", text: `Saved. Re-scored ${d.rescored} jobs in the inbox.` });
                })
              }
              onError={(text) => setNotice({ kind: "error", text })}
              onRescan={() =>
                act(rescanAction, (data) => {
                  setJobs(data.jobs);
                  setRuns(data.runs);
                  setNotice(
                    data.busy
                      ? { kind: "error", text: "A run is already in progress — try again in a few minutes." }
                      : { kind: "ok", text: `Re-scan done: ${data.summary?.added ?? 0} new, ${data.summary?.merged ?? 0} updated. Run again if there were more than 40 emails.` }
                  );
                })
              }
            />
          )}

          {tab === "Follow-ups" &&
            (followUps.length === 0 ? (
              <p className="text-sm text-dim">No follow-ups due. After you message someone, a follow-up shows up here 6 days later.</p>
            ) : (
              followUps.map(({ job, contact }) => (
                <Card key={contact.id} title={`${contact.name} · ${job.company || job.title}`}>
                  <p className="text-sm text-body">
                    Messaged {fmt(contact.messagedAt)} about <span className="text-foreground">{job.title}</span>. Follow-up due {fmt(contact.followUpAt)}.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={btn} onClick={() => copy(fill(settings.templates.followUp, job, contact.name), "Follow-up")}>
                      <Copy className="w-3.5 h-3.5" /> Copy follow-up
                    </button>
                    {contact.linkedin && (
                      <a className={btn} href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                      </a>
                    )}
                    <button type="button" className={btn} disabled={busy} onClick={() => act(() => updateContactAction(job._id, contact.id, "done"), replaceJob)}>
                      <Check className="w-3.5 h-3.5" /> Done
                    </button>
                  </div>
                </Card>
              ))
            ))}

          {tab !== "Settings" && tab !== "Follow-ups" && visible.length === 0 && (
            <p className="text-sm text-dim">
              {tab === "Top matches" ? 'Nothing here yet. Click "Run now", or wait for the next automatic check.' : "Nothing here."}
            </p>
          )}

          {tab !== "Settings" &&
            tab !== "Follow-ups" &&
            visible.map((job) => (
              <div key={job._id} className="card p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <ScoreBadge score={job.score} min={settings.minScore} />
                  <div className="min-w-0 flex-1">
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-accent">
                      {job.title}
                    </a>
                    <p className="mt-0.5 text-sm text-body">
                      {[job.company, job.location, job.experience].filter(Boolean).join(" · ") || "—"}
                    </p>
                    <p className="mt-1 text-xs text-dim">
                      {job.sources.map((s) => SOURCE_LABELS[s]).join(" + ")} · seen {fmt(job.firstSeenAt)}
                      {job.appliedAt && ` · applied ${fmt(job.appliedAt)}`}
                    </p>
                    {job.snippet && <p className="mt-2 line-clamp-2 text-sm text-body">{job.snippet}</p>}
                    {job.reasons.length > 0 && <p className="mt-2 text-xs text-dim">{job.reasons.join(" · ")}</p>}
                    {job.hrEmails.length > 0 && (
                      <p className="mt-2 flex flex-wrap gap-2 text-xs">
                        {job.hrEmails.map((e) => (
                          <a key={e} href={`mailto:${e}`} className="inline-flex items-center gap-1 rounded border border-accent/30 bg-accent/10 px-2 py-0.5 text-foreground">
                            <Mail className="w-3 h-3" /> {e}
                          </a>
                        ))}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a className={btn} href={job.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </a>
                  {job.status !== "applied" && (
                    <button type="button" className={btn} disabled={busy} onClick={() => act(() => setStatusAction(job._id, job.status === "saved" ? "new" : "saved"), setJobs)}>
                      {job.status === "saved" ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      {job.status === "saved" ? "Saved" : "Save"}
                    </button>
                  )}
                  {job.status !== "applied" && (
                    <button type="button" className={btn} disabled={busy} onClick={() => act(() => setStatusAction(job._id, "applied"), setJobs, "Marked as applied.")}>
                      <Check className="w-3.5 h-3.5" /> Applied
                    </button>
                  )}
                  {job.status === "hidden" ? (
                    <button type="button" className={btn} disabled={busy} onClick={() => act(() => setStatusAction(job._id, "new"), setJobs)}>
                      <RotateCcw className="w-3.5 h-3.5" /> Restore
                    </button>
                  ) : (
                    <button type="button" className={btn} disabled={busy} onClick={() => notRelevant(job)}>
                      <EyeOff className="w-3.5 h-3.5" /> Not relevant
                    </button>
                  )}
                  <button type="button" className={btn} onClick={() => setOpen(open === job._id ? null : job._id)}>
                    {open === job._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    HR & details{job.contacts.length > 0 && ` (${job.contacts.length})`}
                  </button>
                </div>

                {open === job._id && (
                  <JobDetails
                    job={job}
                    settings={settings}
                    busy={busy}
                    copy={copy}
                    onSave={(input) => act(() => saveDetailsAction(job._id, input), replaceJob, "Saved and re-scored.")}
                    onAddContact={(input) => act(() => addContactAction(job._id, input), replaceJob, "Contact added.")}
                    onContact={(contactId, action) => act(() => updateContactAction(job._id, contactId, action), replaceJob)}
                  />
                )}
              </div>
            ))}
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg border px-4 py-3 text-sm shadow-xl ${
            notice.kind === "ok" ? "border-ok/40 bg-[#0f1f14] text-ok" : "border-red-400/40 bg-[#241010] text-red-300"
          }`}
        >
          {notice.text}
        </div>
      )}
    </div>
  );
}

function AddJobForm({ busy, onAdd }: { busy: boolean; onAdd: (input: { title: string; company: string; location: string; url: string }) => void }) {
  const [form, setForm] = useState({ title: "", company: "", location: "", url: "" });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="mt-6">
      <Card title="Add a job by hand" actions={<span className="text-xs text-dim">For jobs you found yourself (referrals, company sites…)</span>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Job title" value={form.title} onChange={set("title")} placeholder="Backend Developer (Node.js)" />
          <Field label="Company" value={form.company} onChange={set("company")} />
          <Field label="Location" value={form.location} onChange={set("location")} placeholder="Pune / Remote" />
          <Field label="Job link" value={form.url} onChange={set("url")} placeholder="https://…" />
        </div>
        <button type="button" disabled={busy || !form.title || !form.url} onClick={() => onAdd(form)} className={btn}>
          <Plus className="w-3.5 h-3.5" /> Add to inbox
        </button>
      </Card>
    </div>
  );
}

function JobDetails({
  job,
  settings,
  busy,
  copy,
  onSave,
  onAddContact,
  onContact,
}: {
  job: JobView;
  settings: JobSettings;
  busy: boolean;
  copy: (text: string, what: string) => void;
  onSave: (input: { description: string; notes: string }) => void;
  onAddContact: (input: { name: string; role: string; linkedin: string; email: string }) => void;
  onContact: (contactId: string, action: "messaged" | "done" | "reopen" | "delete") => void;
}) {
  const [description, setDescription] = useState(job.description);
  const [notes, setNotes] = useState(job.notes);
  const [contact, setContact] = useState({ name: "", role: "", linkedin: "", email: "" });
  const setC = (k: keyof typeof contact) => (v: string) => setContact((c) => ({ ...c, [k]: v }));
  const t = settings.templates;

  return (
    <div className="mt-5 space-y-5 border-t border-border pt-5">
      <div className="space-y-3">
        <Field
          label="Job description"
          value={description}
          onChange={setDescription}
          multiline
          hint="Paste the full description from the job page: the score becomes more accurate and any HR email in it is picked up."
        />
        <Field label="Notes" value={notes} onChange={setNotes} multiline placeholder="Referral asked, HR call on Friday…" />
        <button type="button" className={btn} disabled={busy} onClick={() => onSave({ description, notes })}>
          <Check className="w-3.5 h-3.5" /> Save & re-score
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-body">HR / hiring manager</p>
        {job.contacts.length === 0 && (
          <p className="text-xs text-dim">
            Find the job poster (&quot;Meet the hiring team&quot; on LinkedIn) or search LinkedIn for &quot;{job.company || "company"} talent acquisition&quot;, then add them here.
          </p>
        )}
        {job.contacts.map((c) => (
          <div key={c.id} className="rounded-lg border border-border p-3">
            <p className="text-sm">
              <span className="font-medium">{c.name}</span>
              {c.role && <span className="text-body"> · {c.role}</span>}
              {c.done ? (
                <span className="ml-2 text-xs text-ok">done</span>
              ) : c.messagedAt ? (
                <span className="ml-2 text-xs text-dim">messaged {fmt(c.messagedAt)} · follow up {fmt(c.followUpAt)}</span>
              ) : (
                <span className="ml-2 text-xs text-amber-300">not messaged yet</span>
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.linkedin && (
                <a className={btn} href={c.linkedin} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              <button type="button" className={btn} onClick={() => copy(fill(t.linkedinNote, job, c.name), "LinkedIn note")}>
                <Copy className="w-3.5 h-3.5" /> LinkedIn note
              </button>
              <button
                type="button"
                className={btn}
                onClick={() => copy(`Subject: ${fill(t.emailSubject, job, c.name)}\n\n${fill(t.emailBody, job, c.name)}`, "Email")}
              >
                <Copy className="w-3.5 h-3.5" /> Email
              </button>
              {c.email && (
                <a
                  className={btn}
                  href={`mailto:${c.email}?subject=${encodeURIComponent(fill(t.emailSubject, job, c.name))}&body=${encodeURIComponent(fill(t.emailBody, job, c.name))}`}
                >
                  <Send className="w-3.5 h-3.5" /> Open in mail
                </a>
              )}
              <button type="button" className={btn} onClick={() => copy(fill(t.followUp, job, c.name), "Follow-up")}>
                <Copy className="w-3.5 h-3.5" /> Follow-up
              </button>
              <button type="button" className={btn} disabled={busy} onClick={() => onContact(c.id, "messaged")}>
                <Check className="w-3.5 h-3.5" /> I messaged them
              </button>
              <button type="button" className={btn} disabled={busy} onClick={() => onContact(c.id, c.done ? "reopen" : "done")}>
                {c.done ? "Reopen" : "Done"}
              </button>
              <button
                type="button"
                className={`${btn} hover:!text-red-400`}
                disabled={busy}
                onClick={() => confirm(`Remove ${c.name}?`) && onContact(c.id, "delete")}
                aria-label={`Remove ${c.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" value={contact.name} onChange={setC("name")} />
          <Field label="Role" value={contact.role} onChange={setC("role")} placeholder="Talent Acquisition / Engineering Manager" />
          <Field label="LinkedIn URL" value={contact.linkedin} onChange={setC("linkedin")} placeholder="https://www.linkedin.com/in/…" />
          <Field label="Email" value={contact.email || job.hrEmails[0] || ""} onChange={setC("email")} />
        </div>
        <button
          type="button"
          className={btn}
          disabled={busy || !contact.name}
          onClick={() => {
            onAddContact({ ...contact, email: contact.email || job.hrEmails[0] || "" });
            setContact({ name: "", role: "", linkedin: "", email: "" });
          }}
        >
          <UserPlus className="w-3.5 h-3.5" /> Add contact
        </button>
      </div>
    </div>
  );
}

function SettingsPanel({
  settings,
  recommended,
  busy,
  onSave,
  onError,
  onRescan,
}: {
  settings: JobSettings;
  recommended: JobSettings;
  busy: boolean;
  onSave: (next: JobSettings) => void;
  onError: (text: string) => void;
  onRescan: () => void;
}) {
  const [positive, setPositive] = useState(groupsToText(settings.positive));
  const [negative, setNegative] = useState(groupsToText(settings.negative));
  const [exclude, setExclude] = useState(listToText(settings.excludeTitle));
  const [locations, setLocations] = useState(listToText(settings.locations));
  const [companies, setCompanies] = useState(companiesToText(settings.companies));
  const [maxMinYears, setMaxMinYears] = useState(String(settings.maxMinYears));
  const [minScore, setMinScore] = useState(String(settings.minScore));
  const [apis, setApis] = useState(settings.apis);
  const [templates, setTemplates] = useState(settings.templates);

  const save = () => {
    try {
      onSave({
        positive: textToGroups(positive),
        negative: textToGroups(negative),
        excludeTitle: textToList(exclude).map((w) => w.toLowerCase()),
        locations: textToList(locations).map((w) => w.toLowerCase()),
        companies: textToCompanies(companies),
        maxMinYears: Number(maxMinYears) || 0,
        minScore: Number(minScore) || 0,
        apis,
        templates,
      });
    } catch (err) {
      onError((err as Error).message);
    }
  };

  // Loads the built-in rules into the form (companies, sources and templates are kept); Save applies them
  const resetRules = () => {
    if (!confirm("Replace your keyword rules, locations and limits with the recommended ones? You can review them before saving.")) return;
    setPositive(groupsToText(recommended.positive));
    setNegative(groupsToText(recommended.negative));
    setExclude(listToText(recommended.excludeTitle));
    setLocations(listToText(recommended.locations));
    setMaxMinYears(String(recommended.maxMinYears));
    setMinScore(String(recommended.minScore));
  };

  return (
    <>
      <Card
        title="Scoring rules"
        actions={
          <button type="button" className={btn} onClick={resetRules}>
            <RotateCcw className="w-3.5 h-3.5" /> Reset to recommended rules
          </button>
        }
      >
        <Field label="Points for (one per line: points: word, alias, alias)" value={positive} onChange={setPositive} multiline />
        <Field label="Points against (same format)" value={negative} onChange={setNegative} multiline />
        <Field label="Hide when the TITLE contains (comma separated)" value={exclude} onChange={setExclude} multiline />
        <Field label="Preferred locations (+10 each match)" value={locations} onChange={setLocations} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Max 'minimum years' you meet" value={maxMinYears} onChange={setMaxMinYears} hint="Jobs needing up to this many years get +15, more get −30." />
          <Field label="Minimum score for Top matches" value={minScore} onChange={setMinScore} hint="Public job boards only keep jobs at or above this." />
        </div>
      </Card>

      <Card
        title="Sources"
        actions={
          <button type="button" className={btn} disabled={busy} onClick={onRescan}>
            <RefreshCw className="w-3.5 h-3.5" /> Re-scan last 14 days of email
          </button>
        }
      >
        <label className="flex items-center gap-2 text-sm text-body">
          <input type="checkbox" checked={apis.remotive} onChange={(e) => setApis({ ...apis, remotive: e.target.checked })} className="accent-[#ff5900]" />
          Remotive (remote software jobs)
        </label>
        <label className="flex items-center gap-2 text-sm text-body">
          <input type="checkbox" checked={apis.remoteok} onChange={(e) => setApis({ ...apis, remoteok: e.target.checked })} className="accent-[#ff5900]" />
          RemoteOK (remote jobs)
        </label>
        <Field
          label="Company career boards (one per line)"
          value={companies}
          onChange={setCompanies}
          multiline
          placeholder={"greenhouse: razorpaysoftwareprivatelimited\nlever: example\nashby: example"}
          hint="The slug is the last part of the company's careers URL, e.g. boards.greenhouse.io/<slug>, jobs.lever.co/<slug>, jobs.ashbyhq.com/<slug>."
        />
      </Card>

      <Card title="Message templates" actions={<span className="text-xs text-dim">{"{name} {role} {company} {platform}"}</span>}>
        <Field label="LinkedIn connection note (max 300)" value={templates.linkedinNote} onChange={(v) => setTemplates({ ...templates, linkedinNote: v })} multiline />
        <Field label="Email subject" value={templates.emailSubject} onChange={(v) => setTemplates({ ...templates, emailSubject: v })} />
        <Field label="Email body" value={templates.emailBody} onChange={(v) => setTemplates({ ...templates, emailBody: v })} multiline />
        <Field label="Follow-up" value={templates.followUp} onChange={(v) => setTemplates({ ...templates, followUp: v })} multiline />
      </Card>

      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        <Check className="w-4 h-4" /> Save settings & re-score
      </button>
    </>
  );
}
