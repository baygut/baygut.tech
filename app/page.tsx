import AboutSection from '@/components/AboutSection';

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
} from '@/lib/actions';
import { BlogPost, ContactItem, SocialLink } from '@/types/api';
import { Project } from '@/types/project';
import HeroSection from './HeroSection';
import BlogSection from '@/components/BlogSection';

export default async function Home() {
  const skillsFromDb = await getSkills()
    .then((data) =>
      Array.isArray(data) && data.every((item) => 'word' in item && 'desc' in item && 'id' in item)
        ? (data as Skill[]).sort((a, b) => a.id - b.id)
        : []
    )
    .catch(() => []);
  const aboutContentFromDb = await getAboutContent().catch(() => []);

  // Updated to check for tags instead of technologies
  const projectsFromDb = await getProjects()
    .then((data) =>
      Array.isArray(data) &&
      data.every(
        (item) =>
          'title' in item &&
          'description' in item &&
          'color' in item &&
          'category' in item &&
          'tags' in item // Changed from technologies to tags
      )
        ? (data as Project[])
        : []
    )
    .catch(() => []);

  const categoriesFromDb = await getCategories();

  const contactInfoFromDb = await getContactInfo().catch(() => ({
    contactItems: [],
    socialLinks: [],
    resumeUrl: null,
  }));

  // Get blog posts from database
  const blogPostsFromDb = await getBlogPosts()
    .then((data) =>
      Array.isArray(data) &&
      data.every(
        (item) => 'title' in item && 'excerpt' in item && 'slug' in item && 'published_at' in item
      )
        ? (data as BlogPost[])
        : []
    )
    .catch(() => []);

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
        <HeroSection title="Berkay Baygut" subtitle="Software Developer" resumeUrl={resumeUrl} />
      </div>

      <AboutSection content={aboutContent} />

      <SkillsSection skills={skills} />

      <ProjectsSection projects={projects} categories={categoriesFromDb} />

      <div id="blog">
        <BlogSection posts={blogPosts} />
      </div>

      <ContactSection title="Say Hello." contactItems={contactItems} socialLinks={socialLinks} />

      <FloatingModel3D imagePath="/sculpt.png" />
    </main>
  );
}
