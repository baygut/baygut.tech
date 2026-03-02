'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ExperienceEntry } from '@/lib/actions';

interface ExperienceSectionProps {
  experiences: ExperienceEntry[];
}

// Offset before element reaches viewport center to start animation
const TIMELINE_LINE_TRIGGER_OFFSET = '-80px';
const CARD_TRIGGER_OFFSET = '-60px';

// ─── Animated timeline line ────────────────────────────────────────────────
function TimelineLine({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: TIMELINE_LINE_TRIGGER_OFFSET });

  return (
    <div ref={ref} className="flex justify-center my-0">
      <motion.div
        className="w-[2px] bg-gradient-to-b from-[var(--color-yellow)] to-[var(--color-blue)]"
        initial={{ height: 0 }}
        animate={isInView ? { height: 64 } : { height: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      />
    </div>
  );
}

// ─── Single experience card ─────────────────────────────────────────────────
function ExperienceCard({
  entry,
  index,
}: {
  entry: ExperienceEntry;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: CARD_TRIGGER_OFFSET });
  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="relative flex items-start gap-0 md:gap-8">
      {/* Left column (even entries show card on left on md+) */}
      <div className={`hidden md:flex flex-1 ${isEven ? 'justify-end' : ''}`}>
        {isEven && (
          <motion.div
            initial={{ opacity: 0, x: -48 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-sm"
          >
            <Card entry={entry} />
          </motion.div>
        )}
      </div>

      {/* Centre node */}
      <div className="relative flex flex-col items-center flex-shrink-0">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
          className="w-5 h-5 rounded-full bg-[var(--color-yellow)] border-4 border-[var(--color-blue)] z-10 shadow-[0_0_16px_4px_rgba(255,212,71,0.5)]"
        />
      </div>

      {/* Right column (odd entries show card on right on md+; mobile always shows here) */}
      <div className={`flex flex-1 ${isEven ? '' : 'justify-start'}`}>
        {/* Mobile: always show */}
        <div className="block md:hidden w-full">
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full"
          >
            <Card entry={entry} />
          </motion.div>
        </div>

        {/* Desktop: only show on odd */}
        {!isEven && (
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden md:block w-full max-w-sm"
          >
            <Card entry={entry} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Card content ───────────────────────────────────────────────────────────
function Card({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="bg-[#0d1120] border border-[var(--color-blue)]/30 rounded-2xl p-5 shadow-lg hover:border-[var(--color-yellow)]/60 transition-colors duration-300 group">
      {entry.period && (
        <span className="text-xs font-semibold tracking-widest uppercase text-[var(--color-yellow)] mb-2 block">
          {entry.period}
        </span>
      )}
      <h3 className="text-lg font-bold text-white leading-tight mb-0.5">{entry.company}</h3>
      {entry.title && <p className="text-sm text-[var(--color-blue)] font-medium mb-3">{entry.title}</p>}
      {entry.description.length > 0 && (
        <ul className="space-y-1 mt-2">
          {entry.description.map((line, i) => (
            <li key={i} className="text-sm text-gray-400 flex gap-2">
              <span className="text-[var(--color-yellow)] mt-1 flex-shrink-0">▸</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────
export default function ExperienceSection({ experiences }: ExperienceSectionProps) {
  if (!experiences || experiences.length === 0) return null;

  return (
    <section id="experience-section" className="py-24 bg-[#060b18] overflow-hidden">
      <div className="max-w-4xl mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            Career{' '}
            <span className="text-[var(--color-yellow)]">Path</span>
          </h2>
          <p className="mt-4 text-gray-400 text-lg">A journey through my professional experience</p>
          <div className="mt-6 mx-auto w-24 h-[3px] bg-gradient-to-r from-[var(--color-yellow)] to-[var(--color-blue)] rounded-full" />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical background line (desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-[var(--color-blue)]/20 -translate-x-1/2" />

          {experiences.map((entry, index) => (
            <div key={index}>
              <ExperienceCard entry={entry} index={index} />
              {index < experiences.length - 1 && <TimelineLine index={index} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
