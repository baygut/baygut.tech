import type { ExperienceEntry } from '@/lib/actions';

// Re-export so sub-components only import from this file
export type { ExperienceEntry };

export interface TimelineDotsProps {
  entries: ExperienceEntry[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export interface EntryCardProps {
  entry: ExperienceEntry;
  direction: 1 | -1;
  id: number;
  onSwipe?: (direction: 'left' | 'right') => void;
}

export interface NavControlsProps {
  activeIndex: number;
  total: number;
  entries: ExperienceEntry[];
  onPrev: () => void;
  onNext: () => void;
}
