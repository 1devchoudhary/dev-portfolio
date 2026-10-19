"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { ExternalLink, FileText, LogOut, Save, Upload } from "lucide-react";
import type { SiteContent } from "@/lib/schema";
import type { ResumeMeta } from "@/lib/store";
import { logout, saveContentAction, uploadResumeAction } from "@/app/admin/actions";
import { AddButton, ChipInput, Field, LineList, moveItem, RowControls } from "./fields";

const tabs = ["Profile", "Journey", "Projects", "Skills", "Links", "Resume"] as const;
type Tab = (typeof tabs)[number];

type Notice = { kind: "ok" | "error"; text: string } | null;

function formatDate(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "never (showing built-in content)";
}

function Card({ title, actions, children }: { title?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="card p-5 sm:p-6">
      {(title || actions) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h3 className="font-semibold">{title}</h3>}
          {actions}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function AdminEditor({
  initialContent,
  initialUpdatedAt,
  initialResume,
  dbConfigured,
}: {
  initialContent: SiteContent;
  initialUpdatedAt: string | null;
  initialResume: ResumeMeta | null;
  dbConfigured: boolean;
}) {
  const [content, setContent] = useState(initialContent);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initialContent));
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [resume, setResume] = useState(initialResume);
  const [tab, setTab] = useState<Tab>("Profile");
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, startSaving] = useTransition();
  const [uploading, startUploading] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(content) !== savedJson;

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  /** Immutable update helper: edit a deep copy, then commit it. */
  const edit = (fn: (draft: SiteContent) => void) =>
    setContent((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });

  const save = () =>
    startSaving(async () => {
      const result = await saveContentAction(content);
      if (result.ok) {
        setSavedJson(JSON.stringify(content));
        setUpdatedAt(result.updatedAt);
        setNotice({ kind: "ok", text: "Saved — the live site is updated." });
      } else {
        setNotice({ kind: "error", text: result.error });
      }
    });

  const upload = () =>
    startUploading(async () => {
      const file = fileRef.current?.files?.[0];
      if (!file) return setNotice({ kind: "error", text: "Choose a PDF file first." });
      const formData = new FormData();
      formData.append("resume", file);
      const result = await uploadResumeAction(formData);
      if (result.ok) {
        setResume(result.resume);
        if (fileRef.current) fileRef.current.value = "";
        setNotice({ kind: "ok", text: "Resume replaced — the Resume button now serves the new PDF." });
      } else {
        setNotice({ kind: "error", text: result.error });
      }
    });

  return (
    <div className="min-h-screen pb-24">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
          <div className="mr-auto">
            <p className="font-heading text-lg font-extrabold">
              DC<span className="text-accent">.</span> <span className="font-sans text-sm font-medium text-body">Admin</span>
            </p>
            <p className="text-xs text-dim">Last saved: {formatDate(updatedAt)}</p>
          </div>
          <a href="/" target="_blank" className="inline-flex items-center gap-1.5 text-sm text-body hover:text-foreground">
            View site <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <form action={logout}>
            <button className="inline-flex items-center gap-1.5 text-sm text-body hover:text-foreground">
              <LogOut className="w-3.5 h-3.5" /> Log out
            </button>
          </form>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving || !dbConfigured}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5">
        {!dbConfigured && (
          <p className="mt-6 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            No database is configured (MONGODB_URI), so changes can&apos;t be saved. See the README setup steps.
          </p>
        )}

        {/* Tabs */}
        <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors ${
                tab === t ? "border-accent text-foreground" : "border-transparent text-body hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        <div className="mt-6 space-y-5">
          {tab === "Profile" && (
            <>
              <Card title="Hero">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name" value={content.hero.firstName} onChange={(v) => edit((d) => void (d.hero.firstName = v))} />
                  <Field label="Last name (orange)" value={content.hero.lastName} onChange={(v) => edit((d) => void (d.hero.lastName = v))} />
                </div>
                <Field label="Role" value={content.hero.role} onChange={(v) => edit((d) => void (d.hero.role = v))} />
                <Field label="Tagline" value={content.hero.tagline} onChange={(v) => edit((d) => void (d.hero.tagline = v))} />
                <Field label="Location" value={content.hero.location} onChange={(v) => edit((d) => void (d.hero.location = v))} />
              </Card>

              <Card title="Stats strip" actions={content.stats.length < 6 && (
                <AddButton onClick={() => edit((d) => void d.stats.push({ value: "", label: "" }))}>Add stat</AddButton>
              )}>
                {content.stats.map((stat, i) => (
                  <div key={i} className="flex items-end gap-3">
                    <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_2fr]">
                      <Field label="Value" value={stat.value} onChange={(v) => edit((d) => void (d.stats[i].value = v))} placeholder="10+" />
                      <Field label="Label" value={stat.label} onChange={(v) => edit((d) => void (d.stats[i].label = v))} placeholder="production migrations" />
                    </div>
                    <RowControls
                      index={i}
                      count={content.stats.length}
                      label="stat"
                      onMove={(from, to) => edit((d) => void (d.stats = moveItem(d.stats, from, to)))}
                      onDelete={(j) => edit((d) => void d.stats.splice(j, 1))}
                    />
                  </div>
                ))}
              </Card>
            </>
          )}

          {tab === "Journey" && (
            <>
              <p className="text-sm text-dim">Shown oldest first. Mark your current role as “Current” to highlight it.</p>
              {content.journey.map((step, i) => (
                <Card
                  key={i}
                  title={step.title || "New milestone"}
                  actions={
                    <RowControls
                      index={i}
                      count={content.journey.length}
                      label="milestone"
                      onMove={(from, to) => edit((d) => void (d.journey = moveItem(d.journey, from, to)))}
                      onDelete={(j) => edit((d) => void d.journey.splice(j, 1))}
                    />
                  }
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date" value={step.date} onChange={(v) => edit((d) => void (d.journey[i].date = v))} placeholder="Jul 2025 — Present" />
                    <Field label="Place / label" value={step.place} onChange={(v) => edit((d) => void (d.journey[i].place = v))} placeholder="Production" />
                    <Field label="Title" value={step.title} onChange={(v) => edit((d) => void (d.journey[i].title = v))} />
                    <Field label="Organisation" value={step.org} onChange={(v) => edit((d) => void (d.journey[i].org = v))} />
                  </div>
                  <Field label="Story line (italic)" value={step.story} multiline onChange={(v) => edit((d) => void (d.journey[i].story = v))} />
                  <LineList
                    label="Bullet points"
                    items={step.points}
                    multiline
                    addLabel="Add bullet"
                    onChange={(items) => edit((d) => void (d.journey[i].points = items))}
                  />
                  <label className="flex items-center gap-2 text-sm text-body">
                    <input
                      type="checkbox"
                      checked={Boolean(step.current)}
                      onChange={(e) => edit((d) => void (d.journey[i].current = e.target.checked))}
                      className="accent-[#ff5900]"
                    />
                    Current (highlighted)
                  </label>
                </Card>
              ))}
              <AddButton
                onClick={() => edit((d) => void d.journey.push({ date: "", place: "", title: "", org: "", story: "", points: [] }))}
              >
                Add milestone
              </AddButton>

              <Card title="Next chapter">
                <Field label="Title" value={content.next.title} onChange={(v) => edit((d) => void (d.next.title = v))} />
                <Field label="Text" value={content.next.story} multiline onChange={(v) => edit((d) => void (d.next.story = v))} />
              </Card>
            </>
          )}

          {tab === "Projects" && (
            <>
              {content.projects.map((project, i) => (
                <Card
                  key={i}
                  title={project.title || "New project"}
                  actions={
                    <RowControls
                      index={i}
                      count={content.projects.length}
                      label="project"
                      onMove={(from, to) => edit((d) => void (d.projects = moveItem(d.projects, from, to)))}
                      onDelete={(j) => edit((d) => void d.projects.splice(j, 1))}
                    />
                  }
                >
                  <Field label="Title" value={project.title} onChange={(v) => edit((d) => void (d.projects[i].title = v))} />
                  <Field label="One-line summary" value={project.summary} onChange={(v) => edit((d) => void (d.projects[i].summary = v))} />
                  <LineList
                    label="Flow diagram steps (top to bottom)"
                    items={project.flow}
                    addLabel="Add step"
                    onChange={(items) => edit((d) => void (d.projects[i].flow = items))}
                  />
                  <Field label="Problem" value={project.problem} multiline onChange={(v) => edit((d) => void (d.projects[i].problem = v))} />
                  <Field label="Solution" value={project.solution} multiline onChange={(v) => edit((d) => void (d.projects[i].solution = v))} />
                  <Field label="Impact" value={project.impact} multiline onChange={(v) => edit((d) => void (d.projects[i].impact = v))} />
                  <ChipInput label="Tech tags" items={project.tags} onChange={(items) => edit((d) => void (d.projects[i].tags = items))} />
                </Card>
              ))}
              <AddButton
                onClick={() =>
                  edit((d) => void d.projects.push({ title: "", summary: "", flow: [], problem: "", solution: "", impact: "", tags: [] }))
                }
              >
                Add project
              </AddButton>
            </>
          )}

          {tab === "Skills" && (
            <>
              {content.skills.map((group, i) => (
                <Card
                  key={i}
                  actions={
                    <RowControls
                      index={i}
                      count={content.skills.length}
                      label="skill group"
                      onMove={(from, to) => edit((d) => void (d.skills = moveItem(d.skills, from, to)))}
                      onDelete={(j) => edit((d) => void d.skills.splice(j, 1))}
                    />
                  }
                  title={group.category || "New group"}
                >
                  <Field label="Group name" value={group.category} onChange={(v) => edit((d) => void (d.skills[i].category = v))} />
                  <ChipInput label="Skills" items={group.items} onChange={(items) => edit((d) => void (d.skills[i].items = items))} />
                </Card>
              ))}
              <AddButton onClick={() => edit((d) => void d.skills.push({ category: "", items: [] }))}>Add skill group</AddButton>
            </>
          )}

          {tab === "Links" && (
            <Card title="Contact links">
              <Field label="GitHub URL" value={content.socials.github} onChange={(v) => edit((d) => void (d.socials.github = v))} />
              <Field label="LinkedIn URL" value={content.socials.linkedin} onChange={(v) => edit((d) => void (d.socials.linkedin = v))} />
              <Field label="Email" value={content.socials.email} onChange={(v) => edit((d) => void (d.socials.email = v))} />
            </Card>
          )}

          {tab === "Resume" && (
            <Card title="Resume PDF">
              <div className="flex items-start gap-3 text-sm">
                <FileText className="mt-0.5 w-5 h-5 shrink-0 text-accent" />
                {resume ? (
                  <p>
                    {resume.filename}
                    <span className="block text-dim">
                      {(resume.size / 1024).toFixed(0)} KB · uploaded {formatDate(resume.updatedAt)}
                    </span>
                  </p>
                ) : (
                  <p className="text-body">No upload yet — the site serves the PDF bundled with the code.</p>
                )}
              </div>
              <a href="/resume" target="_blank" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
                View current resume <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="text-sm text-body file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-sm file:text-foreground"
                />
                <button
                  type="button"
                  onClick={upload}
                  disabled={uploading || !dbConfigured}
                  className="inline-flex items-center gap-2 rounded-lg border border-accent/50 px-4 py-2 text-sm font-semibold hover:bg-accent/10 disabled:opacity-40"
                >
                  <Upload className="w-4 h-4" /> {uploading ? "Uploading…" : "Replace PDF"}
                </button>
              </div>
              <p className="text-xs text-dim">PDF only, up to 2 MB. Takes effect immediately — no Save needed.</p>
            </Card>
          )}
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
