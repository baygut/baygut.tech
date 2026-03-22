import { getContactInfo } from '@/lib/actions';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Resume | Berkay Baygut',
  description: "View Berkay Baygut's resume.",
};

/**
 * Converts any Google Drive URL into a preview-embeddable URL.
 * Leaves non-Google-Drive URLs unchanged.
 */
function toEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const isGoogleDriveHost =
      parsed.hostname === 'drive.google.com' || parsed.hostname === 'docs.google.com';
    if (!isGoogleDriveHost) return url;

    // Extract file ID from path (/file/d/<id>/...) or query param (?id=<id>)
    const pathMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    const fileId = pathMatch?.[1] ?? parsed.searchParams.get('id');

    if (!fileId) return url;
    return `https://drive.google.com/file/d/${fileId}/preview`;
  } catch {
    return url;
  }
}

export default async function ResumePage() {
  const contactInfo = await getContactInfo().catch(() => ({
    contactItems: [],
    socialLinks: [],
    resumeUrl: null,
  }));

  const rawUrl = contactInfo.resumeUrl;
  const embedUrl = rawUrl ? toEmbedUrl(rawUrl) : null;

  return (
    <main className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-blue)]">Resume</h1>
          <Link
            href="/"
            className="text-[var(--color-blue)] font-bold text-lg hover:text-[var(--color-red)] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 pb-8">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full rounded-lg shadow-lg"
            style={{ height: '85vh', border: 'none' }}
            title="Resume"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-2xl text-gray-500 mb-6">Resume is not available at the moment.</p>
            <Link
              href="/"
              className="text-[var(--color-blue)] font-bold text-lg hover:text-[var(--color-red)] transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
