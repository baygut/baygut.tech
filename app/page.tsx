import AboutSection from '@/components/AboutSection';
import { Suspense } from 'react';

import ContactSection from '@/components/ContactSection';
import ProjectsSection from '@/components/ProjectsSection';
import SkillsSection, { Skill } from '@/components/SkillsSection';

import FloatingModel3D from '@/components/FloatingModel3D';
import {
  getAboutContent,
  getBlogPosts,
  getCategories,
  getContactInfo,
  getProjects,
  getSkills,
  getHeroContent,
} from '@/lib/actions';
import { BlogPost, ContactItem, SocialLink } from '@/types/api';
import { Project } from '@/types/project';
import HeroSection from './HeroSection';
import BlogSection from '@/components/BlogSection';
import ExperienceSectionServer from './ExperienceSectionServer';
import VibeStoreSection from '@/components/VibeStoreSection';
import { getPublicTools } from '@/app/tools/actions';

export default async function Home() {
  const skillsPromise = getSkills()
    .then((data) =>
      Array.isArray(data) && data.every((item) => 'word' in item && 'desc' in item && 'id' in item)
        ? (data as Skill[]).sort((a, b) => a.id - b.id)
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

  // Extract public tools for VibeStore
  const publicTools = await getPublicTools().catch(() => []);

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

  const [
    skillsFromDb,
    aboutContentFromDb,
    heroContentFromDb,
    projectsFromDb,
    categoriesFromDb,
    contactInfoFromDb,
    blogPostsFromDb,
  ] = await Promise.all([
    skillsPromise,
    aboutContentPromise,
    heroContentPromise,
    projectsPromise,
    categoriesPromise,
    contactInfoPromise,
    blogPostsPromise,
  ]);

  // Use data from database or fallback to hardcoded data
  const skills = skillsFromDb;
  const aboutContent = aboutContentFromDb;
  const projects = projectsFromDb;
  const blogPosts = blogPostsFromDb;

  // Use contact items from database or fallback to hardcoded values
  const contactItems: ContactItem[] = contactInfoFromDb.contactItems.map((item) => ({
    value: item.value as string,
    id: item.id as number,
    type: item.type as string,
    href: item.href as string,
  }));

  // Use social links from database or fallback to hardcoded values
  const socialLinks = Array.isArray(contactInfoFromDb.socialLinks)
    ? (contactInfoFromDb.socialLinks as SocialLink[])
    : [];

  // Get resume URL from database
  const resumeUrl = contactInfoFromDb.resumeUrl;

  return (
    <main className="min-h-screen">
      <div id="hero-section">
        <HeroSection
          title={heroContentFromDb.name}
          subtitle={heroContentFromDb.title}
          resumeUrl={resumeUrl}
        />
      </div>

      <AboutSection content={aboutContent} />

      <SkillsSection skills={skills} />

      <Suspense fallback={null}>
        <ExperienceSectionServer />
      </Suspense>

      <ProjectsSection projects={projects} categories={categoriesFromDb} />

      <VibeStoreSection publicTools={publicTools} />

      <div id="blog">
        <BlogSection posts={blogPosts} />
      </div>

      <ContactSection title="Say Hello." contactItems={contactItems} socialLinks={socialLinks} />

      <FloatingModel3D imagePath="/sculpt.png" />
    </main>
  );
}
