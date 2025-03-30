'use client';
import React, { useState, useMemo } from 'react';
import { Project, ProjectsByCategory } from '../types/project';
import ProjectCategory from './ProjectCategory';

interface ProjectsSectionProps {
  projects: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  // Group projects by category using useMemo for performance
  const { categories, projectsByCategory } = useMemo(() => {
    const categoriesSet = [...Array.from(new Set(projects.map((project) => project.category)))];
    const projectsByCat = categoriesSet.reduce((acc, category) => {
      acc[category] = projects.filter((project) => project.category === category);
      return acc;
    }, {} as ProjectsByCategory);

    return { categories: categoriesSet, projectsByCategory: projectsByCat };
  }, [projects]);

  // State to track active category and expanded project
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    if (activeCategory !== category) {
      // Clear expanded project when changing categories
      setExpandedProject(null);
    }
    setActiveCategory(activeCategory === category ? null : category);
  };

  // Toggle project expansion - only one project can be expanded at a time
  const toggleProject = (projectTitle: string) => {
    setExpandedProject(expandedProject === projectTitle ? null : projectTitle);
  };

  return (
    <section id="projects" className="py-24 bg-[var(--color-white)]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="flex text-5xl md:text-7xl font-bold mb-12 text-start text-[var(--color-blue)]">
          My Work.
        </h2>
        <div className="w-full h-[3px] bg-[var(--color-blue)] -mt-8 my-4" />

        {/* Expandable Categories */}
        <div className="space-y-4">
          {categories.map((category) => (
            <ProjectCategory
              key={category}
              category={category}
              projects={projectsByCategory[category]}
              isActive={activeCategory === category}
              expandedProject={expandedProject}
              toggleCategory={toggleCategory}
              toggleProject={toggleProject}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
