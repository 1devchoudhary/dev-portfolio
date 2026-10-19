import { getResumeFile } from "@/lib/store";

const FALLBACK = "/Devendra_Choudhary_Resume.pdf";

// Serves the resume uploaded from /admin; falls back to the PDF bundled in public/
export async function GET(request: Request) {
  let file: Buffer | null = null;
  try {
    file = await getResumeFile();
  } catch (err) {
    console.warn("[resume] database unavailable, serving bundled PDF:", (err as Error).message);
  }

  if (!file) return Response.redirect(new URL(FALLBACK, request.url), 307);

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Devendra_Choudhary_Resume.pdf"',
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
