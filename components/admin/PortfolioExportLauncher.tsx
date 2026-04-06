'use client';

import { useMemo, useState } from 'react';
import {
  PORTFOLIO_EXPORT_SECTIONS,
  type PortfolioExportSection,
} from '@/components/portfolio-export/types';

const LABELS: Record<PortfolioExportSection, string> = {
  hero: 'Hero (name & title)',
  about: 'About',
  skills: 'Skills & tools',
  experience: 'Career / experience',
  projects: 'Projects (My Work)',
  vibestore: 'VibeStore (public tools)',
  blog: 'Blog highlights',
  contact: 'Contact & social',
};

export default function PortfolioExportLauncher() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<PortfolioExportSection, boolean>>(() => {
    const init = {} as Record<PortfolioExportSection, boolean>;
    for (const k of PORTFOLIO_EXPORT_SECTIONS) init[k] = true;
    return init;
  });

  const [includeProjectImages, setIncludeProjectImages] = useState(true);
  const [includeToolIcons, setIncludeToolIcons] = useState(true);

  const anySelected = useMemo(() => PORTFOLIO_EXPORT_SECTIONS.some((k) => selected[k]), [selected]);

  const toggle = (key: PortfolioExportSection) => {
    setSelected((s) => ({ ...s, [key]: !s[key] }));
  };

  const openExportTab = () => {
    const keys = PORTFOLIO_EXPORT_SECTIONS.filter((k) => selected[k]);
    if (!keys.length) return;
    const q = keys.join(',');
    const media = new URLSearchParams({
      sections: q,
      projectImages: includeProjectImages ? '1' : '0',
      toolIcons: includeToolIcons ? '1' : '0',
    });
    window.open(`/admin/export?${media.toString()}`, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
      >
        Export portfolio
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-portfolio-title"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="export-portfolio-title" className="text-lg font-bold text-gray-900">
              Export portfolio
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Choose which homepage sections to include. A new tab opens with a print-friendly,
              slide-style layout—use <strong>Print → Save as PDF</strong> to download.
            </p>

            <ul className="mt-4 max-h-[40vh] space-y-2 overflow-y-auto border-y border-gray-100 py-3">
              {PORTFOLIO_EXPORT_SECTIONS.map((key) => (
                <li key={key}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selected[key]}
                      onChange={() => toggle(key)}
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-800">{LABELS[key]}</span>
                  </label>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Media in PDF
            </p>
            <ul className="mt-2 space-y-2 border-b border-gray-100 pb-3">
              <li>
                <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={includeProjectImages}
                    onChange={() => setIncludeProjectImages((v) => !v)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-800">
                    Project cover & gallery images <span className="text-gray-500">(My Work)</span>
                  </span>
                </label>
              </li>
              <li>
                <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={includeToolIcons}
                    onChange={() => setIncludeToolIcons((v) => !v)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-800">
                    VibeStore tool icons <span className="text-gray-500">(SVG / artwork)</span>
                  </span>
                </label>
              </li>
            </ul>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!anySelected}
                onClick={openExportTab}
                className="rounded-md bg-[var(--color-blue)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Open export view
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
