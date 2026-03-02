'use client';

import type { NavControlsProps } from './types';

export default function NavControls({
  activeIndex,
  total,
  entries,
  onPrev,
  onNext,
}: NavControlsProps) {
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < total - 1;

  return (
    <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/10">
      {/* Prev */}
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrev}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20
                   text-white/60 text-sm font-medium transition-all duration-200
                   hover:border-white/50 hover:text-white
                   disabled:opacity-20 disabled:cursor-not-allowed
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        aria-label="Previous experience"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M9 2L4 7L9 12"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden sm:inline max-w-[120px] truncate">
          {hasPrev ? entries[activeIndex - 1].company : 'Start'}
        </span>
      </button>

      {/* Counter */}
      <span className="text-white/30 text-xs tabular-nums">
        {activeIndex + 1} / {total}
      </span>

      {/* Next */}
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20
                   text-white/60 text-sm font-medium transition-all duration-200
                   hover:border-white/50 hover:text-white
                   disabled:opacity-20 disabled:cursor-not-allowed
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        aria-label="Next experience"
      >
        <span className="hidden sm:inline max-w-[120px] truncate">
          {hasNext ? entries[activeIndex + 1].company : 'End'}
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M5 2L10 7L5 12"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
