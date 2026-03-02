'use client';

import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import type { EntryCardProps } from './types';

const VARIANTS = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 60 : -60,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -40 : 40,
  }),
};

export default function EntryCard({ entry, direction, id, onSwipe }: EntryCardProps) {
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) onSwipe?.('left');
    else if (info.offset.x > threshold) onSwipe?.('right');
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={id}
        custom={direction}
        variants={VARIANTS}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.32, ease: 'easeInOut' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={handleDragEnd}
        className="w-full cursor-grab active:cursor-grabbing select-none"
      >
        {/* Company + title */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
          <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
            {entry.company}
          </h3>
          <span className="text-base md:text-xl text-white/50 font-light">{entry.title}</span>
        </div>

        {/* Period */}
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-yellow)] mb-6">
          {entry.period}
        </p>

        {/* Description bullets */}
        {entry.description && entry.description.length > 0 && (
          <ul className="space-y-2.5">
            {entry.description.filter(Boolean).map((line, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.28 }}
                className="flex items-start gap-3 text-sm md:text-base text-white/65 leading-relaxed"
              >
                <span className="mt-[7px] w-[5px] h-[5px] flex-shrink-0 rounded-full bg-[var(--color-blue)]" />
                {line}
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
