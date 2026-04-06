'use client';

import { ExternalLinkIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type {
  PortfolioExportData,
  PortfolioExportMediaOptions,
  PortfolioExportSection,
} from './types';

const SECTION_ORDER: PortfolioExportSection[] = [
  'hero',
  'about',
  'skills',
  'experience',
  'projects',
  'vibestore',
  'blog',
  'contact',
];

// Each slide is exactly one screen tall — no overflow
const slideShell =
  'portfolio-export-slide relative min-h-screen overflow-hidden flex flex-col justify-center px-12 py-14 md:px-20 md:py-16';

function SlideFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`break-after-page print:break-after-page last:break-after-auto ${slideShell} ${className}`}
    >
      {children}
    </div>
  );
}

function EyebrowLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-current opacity-40">
      <span className="h-px w-6 bg-current opacity-60" aria-hidden />
      {children}
    </p>
  );
}

function Rule({ className = '' }: { className?: string }) {
  return <div className={`h-px w-full ${className}`} aria-hidden />;
}

/* Hero */
function ExportHero({
  name,
  title,
  resumeUrl,
}: {
  name: string;
  title: string;
  resumeUrl: string | null;
}) {
  return (
    <SlideFrame className="bg-[#f8f7f4]">
      {/*
        sculpt.png: full width, bottom-right docked.
        bg-[length:auto_65%] keeps natural width proportions anchored to the bottom-right corner.
        opacity-[0.08] = premium ghost watermark feel.
      */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-full h-[65%] bg-[url('/sculpt.png')] bg-[length:auto_100%] bg-right-bottom bg-no-repeat opacity-[0.3] print:opacity-[0.3]"
        aria-hidden
      />
      {/* Readability gradient — keeps left text column crisp */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#f8f7f4] via-[#f8f7f4]/90 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col justify-between py-14 md:py-16">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#999]">
          Portfolio
        </span>

        <div className="max-w-2xl">
          <h1
            className="mb-5 font-serif text-[clamp(3.2rem,7vw,7rem)] font-normal leading-[0.93] tracking-tight text-[#1a1814]"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            {name}
          </h1>
          <Rule className="mb-5 bg-[#1a1814]/10" />
          <p
            className="text-[clamp(1rem,2vw,1.4rem)] font-light leading-snug text-[#5c5a54]"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {title}
          </p>

          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 border border-[#1a1814]/20 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1814] transition-colors hover:bg-[#1a1814] hover:text-[#f8f7f4] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1a1814] print:text-[#1a1814]"
              aria-label="Open resume (external link)"
            >
              Resume: berkaybaygut.com/resume
            </a>
          )}
        </div>
      </div>
    </SlideFrame>
  );
}

/* About */
function ExportAbout({ content }: { content: string[] }) {
  if (!content.length) return null;
  return (
    <SlideFrame className="bg-[#1a1814] text-[#f0ede6]">
      <EyebrowLabel>About Me</EyebrowLabel>
      <h2
        className="mb-10 font-serif text-[clamp(2.2rem,5vw,4.5rem)] font-normal leading-tight tracking-tight text-white"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        The person
        <br />
        <em className="not-italic text-[var(--color-yellow)]">behind the work.</em>
      </h2>

      <div className="grid gap-10 md:grid-cols-[1fr_2fr] items-start max-w-5xl">
        <div className="aspect-square w-full max-w-[220px] overflow-hidden bg-[var(--color-yellow)]/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/me.png"
            alt=""
            className="h-full w-full object-contain"
            width={400}
            height={400}
          />
        </div>

        <div className="space-y-4">
          {content.map((paragraph, i) => (
            <p
              key={i}
              className="text-base leading-[1.8] text-[#c8c4bc] first:text-lg first:text-[#e8e4dc] first:leading-relaxed"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}

/* Skills */
function ExportSkills({ skills }: { skills: PortfolioExportData['skills'] }) {
  if (!skills.length) return null;
  return (
    <SlideFrame className="bg-[var(--color-blue)] text-white">
      <EyebrowLabel>Capabilities</EyebrowLabel>
      <h2
        className="mb-10 font-serif text-[clamp(2.2rem,5vw,4.5rem)] font-normal leading-tight tracking-tight"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Skills <span className="text-[var(--color-yellow)]">&amp;</span> Tools
      </h2>

      <div className="max-w-5xl grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
        {skills.map((s) => (
          <div key={s.id} className="bg-[var(--color-blue)] p-5 text-left">
            <p
              className="mb-1.5 text-[var(--color-yellow)] font-bold text-base leading-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {s.word}
            </p>
            <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

/* Experience */
function ExportExperience({ experiences }: { experiences: PortfolioExportData['experiences'] }) {
  if (!experiences.length) return null;
  return (
    <SlideFrame className="bg-[#f8f7f4] text-[#1a1814]">
      <EyebrowLabel>Career</EyebrowLabel>
      <h2
        className="mb-10 font-serif text-[clamp(2.2rem,5vw,4.5rem)] font-normal leading-tight tracking-tight"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Career Path
      </h2>

      <div className="max-w-3xl divide-y divide-[#e2e0db]">
        {experiences.map((entry, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[140px_1fr] gap-8 py-6 first:pt-0 last:pb-0 print:gap-5 print:py-5"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-blue)] mb-1">
                {entry.period}
              </p>
              {entry.title && <p className="text-sm text-[#888] leading-snug">{entry.title}</p>}
            </div>
            <div>
              <h3
                className="font-serif text-xl font-normal mb-2 leading-tight text-[#1a1814]"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {entry.company}
              </h3>
              {entry.description?.length ? (
                <ul className="space-y-1.5">
                  {entry.description.filter(Boolean).map((line, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#666] leading-relaxed">
                      <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-[var(--color-blue)] opacity-60" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

/* Project card */
function projectColorVar(color: string) {
  const key = color?.replace(/[^a-z]/gi, '').toLowerCase() || 'blue';
  return `var(--color-${key}, var(--color-blue))`;
}

function ExportProjectCard({
  project: p,
  includeImages,
}: {
  project: PortfolioExportData['projects'][number];
  includeImages: boolean;
}) {
  const accent = projectColorVar(p.color);
  const showCoverTile = includeImages && Boolean(p.coverImage);
  const initial = p.title.trim().charAt(0).toUpperCase() || '?';

  return (
    <article className="export-project-card overflow-hidden bg-white ring-1 ring-[#e2e0db] print:ring-[#d8d6d0]">
      <div className="h-[3px] w-full" style={{ background: accent }} aria-hidden />

      <div className="p-4 md:p-5">
        <div className="flex gap-4">
          <div
            className="relative h-[72px] w-[72px] shrink-0 overflow-hidden print:h-[60px] print:w-[60px]"
            style={{ background: accent }}
          >
            {showCoverTile ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.coverImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-black text-white/90">
                {initial}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className="font-serif text-base font-normal leading-tight text-[#1a1814] md:text-lg"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {p.title}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-[#777] line-clamp-2 print:line-clamp-3">
              {p.description}
            </p>

            {p.tags && p.tags.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1">
                {p.tags.map((tag) => (
                  <li
                    key={tag}
                    className="border border-[#e2e0db] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#888]"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--color-blue)] opacity-70">
              {p.githubUrl && <span className="break-all">{p.githubUrl}</span>}
              {p.demoUrl && <span className="break-all">{p.demoUrl}</span>}
            </div>
          </div>
        </div>

        {includeImages && p.images && p.images.length > 0 && (
          <div className="mt-4 border-t border-[#f0eee9] pt-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#aaa]">
              Screens
            </p>
            <div className="flex flex-wrap gap-2">
              {p.images.map((url, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${p.id ?? p.title}-${idx}`}
                  src={url}
                  alt=""
                  className="h-12 w-auto max-w-[32%] border border-[#e8e6e1] object-cover object-top"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

/* Projects */
function ExportProjects({
  projects,
  categories,
  includeImages,
}: {
  projects: PortfolioExportData['projects'];
  categories: PortfolioExportData['categories'];
  includeImages: boolean;
}) {
  const sortedCats = [...categories].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  const withProjects = sortedCats.filter((c) => projects.some((p) => p.category.id === c.id));
  if (!withProjects.length) return null;

  return (
    <SlideFrame className="bg-[#f8f7f4] text-[#1a1814]">
      <EyebrowLabel>Selected Work</EyebrowLabel>
      <h2
        className="mb-8 font-serif text-[clamp(2.2rem,5vw,4.5rem)] font-normal leading-tight tracking-tight"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        My Work<span className="text-[var(--color-blue)]">.</span>
      </h2>

      <div className="space-y-8 overflow-hidden">
        {withProjects.map((cat) => {
          const plist = projects.filter((p) => p.category.id === cat.id);
          return (
            <section key={cat.id}>
              <div className="mb-4 flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-blue)]">
                  {cat.name}
                </span>
                <span className="h-px flex-1 bg-[#e2e0db]" aria-hidden />
                <span className="text-[10px] text-[#bbb]">
                  {plist.length} project{plist.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
                {plist.map((p) => (
                  <ExportProjectCard
                    key={p.id ?? p.title}
                    project={p}
                    includeImages={includeImages}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </SlideFrame>
  );
}

/* VibeStore */
function ExportVibeStore({
  tools,
  includeIcons,
}: {
  tools: PortfolioExportData['publicTools'];
  includeIcons: boolean;
}) {
  if (!tools.length) return null;
  return (
    <SlideFrame className="bg-[#0d0d0d] text-white">
      <EyebrowLabel>Interactive PWA Archive</EyebrowLabel>
      <h2
        className="mb-2 font-serif text-[clamp(2.2rem,6vw,5rem)] font-normal leading-tight tracking-tight text-white"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        VibeStore
      </h2>
      <p className="mb-10 max-w-lg text-white/40 text-sm leading-relaxed">
        Public micro-apps and interactive experiments.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-5xl">
        {tools.map((tool) => (
          <div key={tool.id} className="flex flex-col items-start text-left">
            <div className="mb-3 h-[64px] w-[64px] overflow-hidden bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
              {includeIcons ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tool.iconImageDataUrl || `/api/tools/${tool.slug}/icon.svg`}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-black text-white/25" aria-hidden>
                  {tool.title.trim().charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
            <p className="font-bold text-sm leading-snug text-white">{tool.title}</p>
            {tool.description && (
              <p className="mt-1 text-xs text-white/45 leading-relaxed line-clamp-3">
                {tool.description}
              </p>
            )}
            <p className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-white/25 break-all">
              /tools/{tool.slug}
            </p>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

/* Blog */
function ExportBlog({ posts }: { posts: PortfolioExportData['blogPosts'] }) {
  return (
    <SlideFrame className="bg-[var(--color-red)] text-white">
      <EyebrowLabel>Writing</EyebrowLabel>
      <h2
        className="mb-10 font-serif text-[clamp(2.8rem,7vw,5.5rem)] font-normal leading-tight tracking-tight"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Blog.
      </h2>

      {posts.length === 0 ? (
        <p className="text-white/50 text-sm">No published posts yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-px bg-white/15 max-w-5xl">
          {posts.map((post) => {
            const formatted = new Date(post.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            return (
              <div key={post.id} className="bg-[var(--color-red)] p-7 text-left">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                  {formatted}
                </p>
                <h3
                  className="mb-2 font-serif text-lg font-normal leading-snug text-white"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  {post.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed line-clamp-4">{post.excerpt}</p>
                {post.tags?.length ? (
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    {post.tags.join(' \u00b7 ')}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </SlideFrame>
  );
}

/* Contact */
function ExportContact({
  contactItems,
  socialLinks,
}: {
  contactItems: PortfolioExportData['contactItems'];
  socialLinks: PortfolioExportData['socialLinks'];
}) {
  return (
    <SlideFrame className="bg-[#1a1814] text-[#f0ede6] last:break-after-auto">
      <EyebrowLabel>Get in touch</EyebrowLabel>
      <h2
        className="mb-10 font-serif text-[clamp(3rem,7vw,6rem)] font-normal leading-tight tracking-tight text-white"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Say <em className="not-italic text-[var(--color-yellow)]">Hello</em>.
      </h2>

      <div className="max-w-2xl divide-y divide-white/8">
        {contactItems.map(
          (item) =>
            item &&
            item.id &&
            item.value &&
            item.href && (
              <div
                key={item.id}
                className="py-4 first:pt-0 grid grid-cols-[100px_1fr] gap-4 items-baseline"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
                  {item.type}
                </span>
                <div>
                  <a
                    href={item.href}
                    className="font-medium text-base text-[#e8e4dc] break-all leading-snug"
                  >
                    {item.value}
                  </a>
                </div>
              </div>
            )
        )}
      </div>

      {socialLinks.length > 0 && (
        <div className="mt-8 pt-8 border-t border-white/10 max-w-2xl">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-white/25">
            Social
          </p>
          <ul className="space-y-2.5">
            {socialLinks.map((s) => (
              <li key={s.id} className="grid grid-cols-[100px_1fr] gap-4 text-sm items-baseline">
                <span className="text-[var(--color-yellow)] font-bold text-[11px] uppercase tracking-widest">
                  {s.label}
                </span>
                <a href={s.url} className="text-white/50 break-all">
                  {s.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SlideFrame>
  );
}

/* Root */
export default function PortfolioExportView({
  sectionKeys,
  data,
  mediaOptions,
}: {
  sectionKeys: PortfolioExportSection[];
  data: PortfolioExportData;
  mediaOptions: PortfolioExportMediaOptions;
}) {
  const set = new Set(sectionKeys);
  const ordered = SECTION_ORDER.filter((k) => set.has(k));

  return (
    <div className="bg-[#edecea] text-[#1a1814] portfolio-export-root print:bg-transparent">
      <header className="admin-export-toolbar sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-[#e0ddd8] bg-[#f8f7f4]/96 px-6 py-3.5 shadow-[0_1px_0_rgba(0,0,0,0.04)] print:hidden backdrop-blur">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#999]">
            Portfolio Export
          </p>
          <p className="mt-0.5 text-xs text-[#777]">
            <strong className="font-semibold text-[#444]">Print &rarr; Save as PDF.</strong> Enable{' '}
            <strong className="font-semibold text-[#444]">Background graphics</strong> for correct
            colors.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-[#1a1814] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f8f7f4] transition-opacity hover:opacity-75"
          >
            Print / Save as PDF
          </button>
          <a
            href="/admin"
            className="border border-[#d8d6d0] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#666] transition-colors hover:bg-[#f0ede8]"
          >
            &larr; Admin
          </a>
        </div>
      </header>

      <main className="portfolio-export-main print:w-full print:m-0">
        {ordered.map((key) => {
          switch (key) {
            case 'hero':
              return (
                <ExportHero
                  key={key}
                  name={data.hero.name}
                  title={data.hero.title}
                  resumeUrl={data.resumeUrl}
                />
              );
            case 'about':
              return <ExportAbout key={key} content={data.about} />;
            case 'skills':
              return <ExportSkills key={key} skills={data.skills} />;
            case 'experience':
              return <ExportExperience key={key} experiences={data.experiences} />;
            case 'projects':
              return (
                <ExportProjects
                  key={key}
                  projects={data.projects}
                  categories={data.categories}
                  includeImages={mediaOptions.includeProjectImages}
                />
              );
            case 'vibestore':
              return (
                <ExportVibeStore
                  key={key}
                  tools={data.publicTools}
                  includeIcons={mediaOptions.includeToolIcons}
                />
              );
            case 'blog':
              return <ExportBlog key={key} posts={data.blogPosts} />;
            case 'contact':
              return (
                <ExportContact
                  key={key}
                  contactItems={data.contactItems}
                  socialLinks={data.socialLinks}
                />
              );
            default:
              return null;
          }
        })}
      </main>
    </div>
  );
}
