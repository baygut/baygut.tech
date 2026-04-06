import PortfolioExportView from '@/components/portfolio-export/PortfolioExportView';
import {
  PORTFOLIO_EXPORT_SECTIONS,
  isPortfolioExportSection,
  parsePortfolioExportMediaOptions,
  type PortfolioExportData,
  type PortfolioExportSection,
} from '@/components/portfolio-export/types';
import { getPublicTools } from '@/app/tools/actions';
import {
  getAboutContent,
  getBlogPosts,
  getCategories,
  getContactInfo,
  getExperienceFromResume,
  getHeroContent,
  getProjects,
  getSkills,
} from '@/lib/actions';
import { BlogPost, ContactItem, SocialLink } from '@/types/api';
import { Project } from '@/types/project';
import type { Metadata } from 'next';
import type { Skill } from '@/components/SkillsSection';

export const metadata: Metadata = {
  title: 'Export portfolio | Admin',
  robots: { index: false, follow: false },
};

function parseSections(raw: string | undefined): PortfolioExportSection[] {
  const parts = raw
    ?.split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!parts?.length) {
    return [...PORTFOLIO_EXPORT_SECTIONS];
  }
  const keys = parts.filter(isPortfolioExportSection);
  return keys.length ? keys : [...PORTFOLIO_EXPORT_SECTIONS];
}

export default async function AdminExportPage({
  searchParams,
}: {
  searchParams: Promise<{ sections?: string; projectImages?: string; toolIcons?: string }>;
}) {
  const sp = await searchParams;
  const sectionKeys = parseSections(sp.sections);
  const mediaOptions = parsePortfolioExportMediaOptions({
    projectImages: sp.projectImages,
    toolIcons: sp.toolIcons,
  });

  const skillsPromise = getSkills()
    .then((data) =>
      Array.isArray(data) && data.every((item) => 'word' in item && 'desc' in item && 'id' in item)
        ? ([...data] as Skill[]).sort((a, b) => a.id - b.id)
        : []
    )
    .catch(() => []);

  const aboutContentPromise = getAboutContent().catch(() => []);

  const heroContentPromise = getHeroContent().catch(() => ({
    name: 'Berkay Baygut',
    title: 'Software Developer',
  }));

  const projectsPromise = getProjects()
    .then((data) =>
      Array.isArray(data) &&
      data.every(
        (item) =>
          'title' in item &&
          'description' in item &&
          'color' in item &&
          'category' in item &&
          'tags' in item
      )
        ? (data as Project[])
        : []
    )
    .catch(() => []);

  const categoriesPromise = getCategories().catch(() => []);

  const publicToolsPromise = getPublicTools().catch(() => []);

  const contactInfoPromise = getContactInfo().catch(() => ({
    contactItems: [],
    socialLinks: [],
    resumeUrl: null,
  }));

  const blogPostsPromise = getBlogPosts()
    .then((data) =>
      Array.isArray(data) &&
      data.every(
        (item) => 'title' in item && 'excerpt' in item && 'slug' in item && 'published_at' in item
      )
        ? (data as BlogPost[])
        : []
    )
    .catch(() => []);

  const experiencesPromise = getExperienceFromResume().catch(() => []);

  const [
    skills,
    about,
    heroContent,
    projects,
    categories,
    contactInfoFromDb,
    blogPosts,
    publicToolsRaw,
    experiences,
  ] = await Promise.all([
    skillsPromise,
    aboutContentPromise,
    heroContentPromise,
    projectsPromise,
    categoriesPromise,
    contactInfoPromise,
    blogPostsPromise,
    publicToolsPromise,
    experiencesPromise,
  ]);

  const contactItems: ContactItem[] = contactInfoFromDb.contactItems.map((item) => ({
    value: item.value as string,
    id: item.id as number,
    type: item.type as string,
    href: item.href as string,
  }));

  const socialLinks: SocialLink[] = Array.isArray(contactInfoFromDb.socialLinks)
    ? (contactInfoFromDb.socialLinks as SocialLink[])
    : [];

  const publicTools = publicToolsRaw.map((t) => ({
    id: t.id as number,
    slug: String(t.slug),
    title: String(t.title),
    description: t.description != null ? String(t.description) : null,
    iconImageDataUrl: (t as { iconImageDataUrl?: string | null }).iconImageDataUrl ?? null,
  }));

  const data: PortfolioExportData = {
    hero: { name: heroContent.name, title: heroContent.title },
    resumeUrl: contactInfoFromDb.resumeUrl ?? null,
    about,
    skills,
    experiences,
    projects,
    categories,
    publicTools,
    blogPosts,
    contactItems,
    socialLinks,
  };

  return <PortfolioExportView sectionKeys={sectionKeys} data={data} mediaOptions={mediaOptions} />;
}
