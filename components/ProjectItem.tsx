import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpIcon } from 'lucide-react';
import { Project } from '../types/project';
import Carousel from './Carousel';

interface ProjectItemProps {
  project: Project;
  isExpanded: boolean;
  toggleProject: (projectTitle: string) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, isExpanded, toggleProject }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        toggleProject(project.title);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, toggleProject, project.title]);

  return (
    <div className="border-l-2 text-white border-white/40 pl-4">
      <button
        onClick={() => toggleProject(project.title)}
        className="w-full text-black flex justify-between items-center text-left"
      >
        <h3 className="text-2xl font-bold text-black">{project.title}</h3>
        <span className="text-[var(--color-blue)]">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowUpIcon size={30} />
          </motion.div>
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-[var(--color-red)] ps-2 flex flex-col md:flex-row gap-4"
          >
            <div className="mt-3 space-y-3">
              <div className={`h-1 w-16 bg-[var(--color-${project.color})]`}></div>
              <p className="text-white">{project.description}</p>

              <div className="flex flex-wrap gap-3 mt-2">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className={`text-sm text-white border border-white px-3 py-1`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            {project.images && project.images.length > 0 && (
              <Carousel
                hideNavigation
                tapToFullscreen
                images={project.images}
                title={project.title}
                autoSlide={true}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full h-[3px] bg-[var(--color-blue)] mt-3" />
    </div>
  );
};

export default ProjectItem;
