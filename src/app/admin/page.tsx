import AdminEditor from "@/components/Admin/AdminEditor";
import { isDbConfigured } from "@/lib/db";
import { verifySession } from "@/lib/session";
import { getContent, getResumeMeta } from "@/lib/store";

export default async function AdminPage() {
  await verifySession();

  const { content, updatedAt } = await getContent();
  const resume = await getResumeMeta().catch(() => null);

  return (
    <AdminEditor
      initialContent={content}
      initialUpdatedAt={updatedAt?.toISOString() ?? null}
      initialResume={resume}
      dbConfigured={isDbConfigured()}
    />
  );
}
