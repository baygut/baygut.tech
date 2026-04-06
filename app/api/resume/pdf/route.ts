import { getNeonClient } from '@/lib/db';

function normalizeResumeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const isGoogleDriveHost =
      parsed.hostname === 'drive.google.com' || parsed.hostname === 'docs.google.com';
    if (!isGoogleDriveHost) return url;

    const pathFileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    const queryFileId = parsed.searchParams.get('id');
    const fileId = pathFileMatch?.[1] ?? queryFileId;

    if (!fileId) return url;
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  } catch {
    return url;
  }
}

export async function GET() {
  const sql = getNeonClient();
  const rows = await sql`SELECT url FROM resume ORDER BY updated_at DESC LIMIT 1`;
  if (!rows.length) {
    return new Response('Resume URL not found.', { status: 404 });
  }
  const resumeUrl: string = rows[0].url;
  const normalizedUrl = normalizeResumeUrl(resumeUrl);

  const res = await fetch(normalizedUrl);
  if (!res.ok) {
    return new Response('Failed to fetch resume.', { status: 502 });
  }

  return new Response(res.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=BERKAY_BAYGUT_RESUME.pdf',
    },
  });
}
