import { getToolBySlug, checkAuth } from '../actions';
import { PasswordLock } from '../components/password-lock';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = await params;
  const tool = await getToolBySlug(p.slug);
  
  if (!tool) {
    return { title: 'Not Found' };
  }

  const iconUrl = `/api/tools/${tool.slug}/icon.svg?v=${tool.updatedAt?.getTime?.() || Date.now()}`;

  return {
    title: tool.title,
    description: tool.description,
    icons: {
      icon: iconUrl,
      apple: iconUrl,
      shortcut: iconUrl,
    },
    appleWebApp: {
      capable: true,
      title: tool.title,
      statusBarStyle: 'black-translucent',
    },
  };
}

export default async function ToolViewerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await params;
  const tool = await getToolBySlug(p.slug);
  
  if (!tool) {
    notFound();
  }
  
  const isAuthed = await checkAuth();

  if (tool.visibility === 'private' && !isAuthed) {
    redirect('/login');
  }

  if (tool.visibility === 'password' && !isAuthed) {
    const cookieStore = await cookies();
    if (cookieStore.get(`tool_pwd_${tool.slug}`)?.value !== tool.password) {
      return <PasswordLock slug={tool.slug} />;
    }
  }

  // Inject PWA tags gracefully before head close
  let injectedHtml = tool.html;
  const iconUrl = `/api/tools/${tool.slug}/icon.svg?v=${tool.updatedAt?.getTime?.() || Date.now()}`;
  const pwaMeta = `
    <link rel="icon" href="${iconUrl}">
    <link rel="apple-touch-icon" href="${iconUrl}">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="${tool.title}">
    <meta name="theme-color" content="#0a0a0a">
    <style>
      ::-webkit-scrollbar { display: none; }
      body { margin: 0; overflow-x: hidden; }
    </style>
  `;
  
  if (injectedHtml.includes('</head>')) {
    injectedHtml = injectedHtml.replace('</head>', `${pwaMeta}</head>`);
  } else {
    injectedHtml = `${pwaMeta}${injectedHtml}`;
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-white z-[100]">
      {/* Floating Back Button - ALWAYS VISIBLE MOBILE, HOVER ON DESKTOP */}
      <div className="fixed bottom-0 left-0 w-32 h-32 z-[110] group">
        <a 
          href="/tools" 
          className="absolute bottom-4 left-4 flex items-center justify-center w-12 h-12 rounded-full bg-black/30 backdrop-blur-md text-white md:opacity-0 md:group-hover:opacity-100 opacity-100 hover:bg-black/80 transition-all shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </a>
      </div>

      <iframe
        title={tool.title}
        srcDoc={injectedHtml}
        sandbox="allow-scripts allow-same-origin allow-forms"
        className="absolute inset-0 w-full h-full border-none outline-none"
      />
    </div>
  );
}
