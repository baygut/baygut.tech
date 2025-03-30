'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpIcon } from 'lucide-react';
import React, { useState } from 'react';
import ProjectItem from './ProjectItem';

export interface Project {
  title: string;
  description: string;
  color: string;
  technologies: string[];
  category: string;
}

interface ProjectsSectionProps {
  projects: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  // Group projects by category
  const categories = Array.from(new Set(projects.map((project) => project.category)));
  const projectsByCategory = categories.reduce((acc, category) => {
    acc[category] = projects.filter((project) => project.category === category);
    return acc;
  }, {} as Record<string, Project[]>);

  // State to track active category and expanded projects
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
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
            <div key={category} className="border-b border-white/30 pb-2">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex justify-between items-center text-left py-3 text-xl font-medium text-white"
              >
                <span className="text-[var(--color-blue)] text-4xl md:text-6xl font-semibold">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
                <span className="text-[var(--color-blue)]">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: activeCategory === category ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowUpIcon size={50} />
                  </motion.div>
                </span>
              </button>

              <AnimatePresence>
                {activeCategory === category && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="py-4 space-y-6">
                      {projectsByCategory[category].map((project, index) => (
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
