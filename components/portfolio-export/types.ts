import type { BlogPost, ContactItem, SocialLink } from '@/types/api';
import type { Category, Project } from '@/types/project';
import type { ExperienceEntry } from '@/lib/actions';
import type { Skill } from '@/components/SkillsSection';

export const PORTFOLIO_EXPORT_SECTIONS = [
  'hero',
  'about',
  'skills',
  'experience',
  'projects',
  'vibestore',
  'blog',
  'contact',
] as const;

export type PortfolioExportSection = (typeof PORTFOLIO_EXPORT_SECTIONS)[number];

export function isPortfolioExportSection(s: string): s is PortfolioExportSection {
  return (PORTFOLIO_EXPORT_SECTIONS as readonly string[]).includes(s);
}

export type PublicToolExport = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  iconImageDataUrl?: string | null;
};

export type PortfolioExportData = {
  hero: { name: string; title: string };
  resumeUrl: string | null;
  about: string[];
  skills: Skill[];
  experiences: ExperienceEntry[];
  projects: Project[];
  categories: Category[];
  publicTools: PublicToolExport[];
  blogPosts: BlogPost[];
  contactItems: ContactItem[];
  socialLinks: SocialLink[];
};

/** Parsed from query: `projectImages=0` / `toolIcons=0` to disable. Omitted or `1` = include. */
export type PortfolioExportMediaOptions = {
  includeProjectImages: boolean;
  includeToolIcons: boolean;
};

export function parsePortfolioExportMediaOptions(params: {
  projectImages?: string;
  toolIcons?: string;
}): PortfolioExportMediaOptions {
  const off = (v: string | undefined) => v === '0' || v === 'false';
  return {
    includeProjectImages: !off(params.projectImages),
    includeToolIcons: !off(params.toolIcons),
  };
}
