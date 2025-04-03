'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpIcon } from 'lucide-react';
import React, { useState } from 'react';
import ProjectItem from './ProjectItem';
import { Category } from '@/types/project';

export interface Project {
  title: string;
  description: string;
  color: string;
  tags: string[];
  category: Category;
  github_url?: string;
  demo_url?: string;
  coverImage?: string;
  images?: string[];
}

interface ProjectsSectionProps {
  projects: Project[];
  categories: Category[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, categories }) => {
  categories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  // Group projects by category
  const projectsByCategory: { [key: number]: Project[] } = {};
  projects.forEach((project) => {
    const categoryId = project.category.id;
    if (!projectsByCategory[categoryId]) {
      projectsByCategory[categoryId] = [];
    }
    projectsByCategory[categoryId].push(project);
  });

  // Clear category if no projects function
  const clearEmptyCategories = () => {
    categories = categories.filter((category) => projectsByCategory[category.id]?.length > 0);
  };
  clearEmptyCategories();

  // State to track active category and expanded projects
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Toggle category expansion
  const toggleCategory = (categoryId: number) => {
    setActiveCategoryId(activeCategoryId === categoryId ? null : categoryId);
  };

  // Toggle project expansion
  const toggleProject = (projectTitle: string) => {
    setExpandedProject(expandedProject === projectTitle ? null : projectTitle);
  };

  return (
    <section id="projects" className="py-24 bg-[var(--color-white)] ">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="flex text-5xl md:text-7xl font-bold mb-12 text-start text-[var(--color-blue)]">
          My Work.
        </h2>
        <div className="w-full h-[3px] bg-[var(--color-blue)] -mt-8 my-4" />

        {/* Expandable Categories */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border-b border-white/30 pb-2">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex justify-between items-center text-left py-3 text-xl font-medium text-white"
              >
                <span className="text-[var(--color-blue)] text-4xl md:text-6xl font-semibold">
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                </span>
                <span className="text-[var(--color-blue)]">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: activeCategoryId === category.id ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight size={50} />
                  </motion.div>
                </span>
              </button>

              <AnimatePresence>
                {activeCategoryId === category.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="py-4 space-y-6">
                      {projectsByCategory[category.id].map((project, index) => (
                        <ProjectItem
                          key={`${project.title}-${index}`}
                          toggleProject={toggleProject}
                          isExpanded={expandedProject === project.title}
                          project={project}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
