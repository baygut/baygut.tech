'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ExperienceEntry } from '@/lib/actions';
import TimelineDots from './experience/TimelineDots';
import EntryCard from './experience/EntryCard';
import NavControls from './experience/NavControls';

interface ExperienceSectionProps {
  experiences: ExperienceEntry[];
}

export default function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const n = experiences.length;

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(n - 1, next));
      if (clamped === activeIndex) return;
      setDirection(clamped > activeIndex ? 1 : -1);
      setActiveIndex(clamped);
    },
    [activeIndex, n]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Keyboard arrow navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  if (!experiences || n === 0) return null;

  return (
    <section id="experience-section" className="bg-black py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.48 }}
          className="mb-12 md:mb-16"
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/40 mb-2">Experience</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-none">
            Career <span className="text-[var(--color-yellow)]">Path</span>.
          </h2>
          <div className="w-full h-px bg-white/10 mt-5" />
        </motion.div>

        {/* Timeline dots */}
        <div className="mb-10 md:mb-14">
          <TimelineDots entries={experiences} activeIndex={activeIndex} onSelect={goTo} />
        </div>

        {/* Entry card — fixed min-height so layout doesn't jump */}
        <div className="min-h-[220px] md:min-h-[260px] mb-10">
          <EntryCard
            entry={experiences[activeIndex]}
            direction={direction}
            id={activeIndex}
            onSwipe={(dir) => (dir === 'left' ? goNext() : goPrev())}
          />
        </div>

        {/* Navigation */}
        <NavControls
          activeIndex={activeIndex}
          total={n}
          entries={experiences}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>
    </section>
  );
}
