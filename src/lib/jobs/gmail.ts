import "server-only";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { SENDER_DOMAINS, sourceForSender, type AlertEmail } from "./parsers";

/** How far back the very first run looks. Later runs continue from the last email read. */
const FIRST_RUN_DAYS = 2;
/** Emails handled per run; the rest are picked up by the next run. */
const MAX_EMAILS_PER_RUN = 40;

export type MailCursor = { uidValidity: string; lastUid: number } | null;

export function isGmailConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

/**
 * Reads new job-alert emails over IMAP with a Gmail app password (read-only use: nothing is
 * marked, moved or deleted). Returns the emails plus the cursor to save for the next run.
 */
export async function readAlertEmails(cursor: MailCursor, sinceDays = FIRST_RUN_DAYS): Promise<{ emails: AlertEmail[]; cursor: MailCursor }> {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user: process.env.GMAIL_USER!, pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s+/g, "") },
    logger: false,
  });

  await client.connect();
  try {
    const lock = await client.getMailboxLock(process.env.GMAIL_MAILBOX || "INBOX", { readOnly: true });
    try {
      const box = client.mailbox;
      if (!box) throw new Error("Could not open the mailbox");
      const uidValidity = box.uidValidity.toString();
      const sameBox = cursor && cursor.uidValidity === uidValidity;

      const range = sameBox
        ? { uid: `${cursor.lastUid + 1}:*` }
        : { since: new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000) };
      const found = await client.search(
        { ...range, or: SENDER_DOMAINS.map(([domain]) => ({ from: domain })) },
        { uid: true }
      );

      // "N:*" always matches the newest message, so drop anything already read
      const lastUid = sameBox ? cursor.lastUid : 0;
      const pending = (found || []).filter((uid) => uid > lastUid).sort((a, b) => a - b);
      const batch = pending.slice(0, MAX_EMAILS_PER_RUN);

      const emails: AlertEmail[] = [];
      if (batch.length) {
        const messages = await client.fetchAll(batch, { source: true, envelope: true }, { uid: true });
        for (const msg of messages) {
          if (!msg.source) continue;
          const mail = await simpleParser(msg.source);
          const sender = mail.from?.value[0]?.address ?? "";
          const source = sourceForSender(sender);
          if (!source) continue;
          emails.push({
            source,
            subject: mail.subject ?? "",
            html: typeof mail.html === "string" ? mail.html : "",
            text: mail.text ?? "",
            date: mail.date ?? new Date(),
          });
        }
      }

      // Nothing left to read: jump the cursor forward so later searches stay small
      const nextUid = batch.length < pending.length ? batch[batch.length - 1] : Math.max(lastUid, box.uidNext - 1, ...batch);
      return { emails, cursor: { uidValidity, lastUid: nextUid } };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}
