"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isDbConfigured } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { clearFailures, isRateLimited, recordFailure } from "@/lib/rateLimit";
import { createSession, deleteSession, hasSession } from "@/lib/session";
import { isAuthConfigured } from "@/lib/sessionToken";
import { siteContentSchema } from "@/lib/schema";
import { saveContent, saveResume, type ResumeMeta } from "@/lib/store";

const MAX_RESUME_BYTES = 2 * 1024 * 1024;

// Returned instead of redirecting, so unsaved edits in the editor aren't lost
const SESSION_EXPIRED = "Your session has expired. Log in again in a new tab, then retry — your edits are kept here.";

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAuthConfigured()) return { error: "Admin login is not configured on this server." };

  const ip = await clientIp();
  try {
    if (await isRateLimited(ip)) return { error: "Too many failed attempts. Try again in 15 minutes." };
  } catch {
    return { error: "Login is unavailable right now. Please try again shortly." };
  }

  const password = String(formData.get("password") ?? "");
  if (!password || !(await verifyPassword(password))) {
    await recordFailure(ip).catch(() => {});
    return { error: "Incorrect password." };
  }

  await clearFailures(ip).catch(() => {});
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

export type SaveResult = { ok: true; updatedAt: string } | { ok: false; error: string };

export async function saveContentAction(input: unknown): Promise<SaveResult> {
  if (!(await hasSession())) return { ok: false, error: SESSION_EXPIRED };
  if (!isDbConfigured()) return { ok: false, error: "No database configured (MONGODB_URI is missing)." };

  const parsed = siteContentSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue.path.join(" › ") || "Content"}: ${issue.message}` };
  }

  try {
    const updatedAt = await saveContent(parsed.data);
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    return { ok: true, updatedAt: updatedAt.toISOString() };
  } catch (err) {
    console.error("[admin] save failed:", err);
    return { ok: false, error: "Could not save to the database. Please try again." };
  }
}

export type UploadResult = { ok: true; resume: ResumeMeta } | { ok: false; error: string };

export async function uploadResumeAction(formData: FormData): Promise<UploadResult> {
  if (!(await hasSession())) return { ok: false, error: SESSION_EXPIRED };
  if (!isDbConfigured()) return { ok: false, error: "No database configured (MONGODB_URI is missing)." };

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a PDF file first." };
  if (file.size > MAX_RESUME_BYTES) return { ok: false, error: "The PDF must be 2 MB or smaller." };

  const data = Buffer.from(await file.arrayBuffer());
  // Trust the bytes, not the browser-supplied type: every PDF starts with "%PDF"
  if (data.subarray(0, 4).toString("latin1") !== "%PDF") return { ok: false, error: "That file is not a PDF." };

  try {
    const resume = await saveResume(data, file.name.slice(0, 120));
    return { ok: true, resume };
  } catch (err) {
    console.error("[admin] resume upload failed:", err);
    return { ok: false, error: "Could not save the resume. Please try again." };
  }
}
