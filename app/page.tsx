import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import ProjectsSection from '@/components/ProjectsSection';
import SkillsSection, { Skill } from '@/components/SkillsSection';

import FloatingModel3D from '@/components/FloatingModel3D';
import { getAboutContent, getContactInfo, getProjects, getSkills } from '@/lib/actions';
import { ContactItem, SocialLink } from '@/types/api';
import { Project } from '@/types/project';
import HeroSection from './HeroSection';

export default async function Home() {
  const skillsFromDb = await getSkills()
    .then((data) =>
      Array.isArray(data) && data.every((item) => 'word' in item && 'desc' in item)
        ? (data as Skill[])
        : []
    )
    .catch(() => []);
  const aboutContentFromDb = await getAboutContent().catch(() => []);
  const projectsFromDb = await getProjects()
    .then((data) =>
      Array.isArray(data) &&
      data.every(
        (item) =>
          'title' in item &&
          'description' in item &&
          'color' in item &&
          'category' in item &&
          'technologies' in item
      )
        ? (data as Project[])
        : []
    )
    .catch(() => []);
  const contactInfoFromDb = await getContactInfo().catch(() => ({
    contactItems: [],
    socialLinks: [],
    resumeUrl: null,
  }));

  // Use data from database or fallback to hardcoded data
  const skills = skillsFromDb;
  const aboutContent = aboutContentFromDb;
  const projects = projectsFromDb;

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
          title="Berkay Baygut"
          subtitle="Web Developer & Designer"
          resumeUrl={resumeUrl}
        />
      </div>

      <AboutSection content={aboutContent} />

      <SkillsSection skills={skills} />

      <ProjectsSection projects={projects} />

      <ContactSection title="Say Hello." contactItems={contactItems} socialLinks={socialLinks} />

      {/* Floating image button that appears when scrolled past hero section */}
      <FloatingModel3D imagePath="/sculpt.png" />
    </main>
  );
}
