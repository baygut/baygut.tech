import { getTools, checkAuth } from './actions';
import { ToolsGrid } from './components/tools-grid';
import { redirect } from 'next/navigation';
import { Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ToolsIndexPage() {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    redirect('/login');
  }

  const tools = await getTools();

  return (
    <main className="min-h-screen relative bg-[#0a0a0a] text-tools-fg selection:bg-tools-accent selection:text-white pb-32">
      {/* Deep Ambient Glows */}
      <div className="absolute top-0 left-[-10%] w-[60%] h-[500px] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute top-40 right-[-10%] w-[40%] h-[400px] bg-indigo-900/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-tools-border/60 bg-tools-surface/40 backdrop-blur-md text-tools-muted text-xs font-mono mb-8 shadow-sm">
            <Layers size={14} className="text-tools-accent" />
            <span className="tracking-wide">baygut.tech / workspace</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40">
                Micro Tools
              </h1>
              <p className="text-tools-muted/90 text-lg leading-relaxed mix-blend-plus-lighter">
                A personal hub of single-file interactive deployments, utility scripts, and isolated
                UX experiments. Everything here runs sandboxed in the browser.
              </p>
            </div>

            <a
              href="/tools/new"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transform hover:-translate-y-1 self-start lg:self-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:rotate-90"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Deploy Component
            </a>
          </div>
        </header>

        <ToolsGrid tools={tools} />
      </div>
    </main>
  );
}
