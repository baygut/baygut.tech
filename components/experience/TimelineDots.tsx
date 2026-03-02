'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { TimelineDotsProps } from './types';

export default function TimelineDots({ entries, activeIndex, onSelect }: TimelineDotsProps) {
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);
  const n = entries.length;

  // Scroll active dot into view on mobile
  useEffect(() => {
    activeBtnRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeIndex]);

  /**
   * Each dot column is flex-1 → each takes 100%/n of total width.
   * Center of column i = (2i + 1) / (2n) × 100%
   *
   * Track spans center[0] → center[n-1]:
   *   left  = 1/(2n) × 100%
   *   width = (n-1)/n × 100%
   *
   * Fill as % of container width = activeIndex/n × 100%
   *   (because activeIndex/(n-1) × trackWidth = activeIndex/n × 100%)
   */
  const trackLeft = `${50 / n}%`;
  const trackWidth = `${((n - 1) / n) * 100}%`;
  // Fill is a child of the track div, so percentages are relative to track width.
  // At index 0 → 0%, at index n-1 → 100% of track.
  const fillWidth = n > 1 ? `${(activeIndex / (n - 1)) * 100}%` : '0%';

  return (
    <div
      className="w-full overflow-x-auto scrollbar-hide"
      style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      {/* min-width prevents dots from squishing on small screens */}
      <div className="relative" style={{ minWidth: `${Math.max(n * 90, 320)}px` }}>
        {/*
         * Track — absolutely positioned so its vertical center aligns with
         * the button center. Buttons are 32px (h-8), so center = 16px = top-4.
         * -translate-y-1/2 shifts the 2px line up by 1px to truly center it.
         */}
        <div
          className="absolute top-4 -translate-y-px pointer-events-none z-0"
          style={{ left: trackLeft, width: trackWidth }}
        >
          <div className="relative h-[2px] w-full bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-[var(--color-blue)] rounded-full"
              animate={{ width: fillWidth }}
              initial={{ width: '0%' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Dot buttons + labels */}
        <div className="relative flex z-10">
          {entries.map((entry, i) => {
            const isActive = i === activeIndex;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                {/* 32px hit-target keeps the dot centered on the track */}
                <button
                  ref={isActive ? (activeBtnRef as React.RefObject<HTMLButtonElement>) : null}
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-label={entry.company}
                  aria-pressed={isActive}
                  className="relative w-8 h-8 flex items-center justify-center focus:outline-none"
                >
                  {/* Ring — scale in/out, no layoutId */}
                  <motion.span
                    animate={{ scale: isActive ? 1 : 0.3, opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="absolute w-8 h-8 rounded-full border-2 border-[var(--color-blue)]"
                  />
                  {/* Dot */}
                  <motion.span
                    animate={{
                      scale: isActive ? 1.3 : 1,
                      backgroundColor: isActive ? 'var(--color-red)' : 'var(--color-yellow)',
                    }}
                    whileHover={{ scale: 1.5 }}
                    transition={{ duration: 0.22 }}
                    className="block w-3 h-3 rounded-full"
                  />
                </button>

                {/* Label — always on desktop, only active on mobile */}
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.4 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    text-[10px] md:text-[11px] font-medium text-center leading-tight select-none
                    max-w-[76px] md:max-w-[96px] truncate
                    ${isActive ? 'text-white' : 'text-white/40 hidden md:block'}
                  `}
                >
                  {entry.company}
                </motion.span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
