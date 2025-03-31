import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GithubIcon, ExternalLinkIcon, ArrowRight } from 'lucide-react';
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

  const projectColor = `var(--color-${project.color})`;

  return (
    <div className="border-l-2 text-white border-white/40 pl-4">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => toggleProject(project.title)}
          className="w-full text-black flex justify-between items-center text-left mb-2"
        >
          <h3 className="text-2xl font-bold text-black">{project.title}</h3>
          <div className="flex flex-row items-center justify-center gap-2">
            {project.coverImage && (
              <div className="block w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <img
                  src={project.coverImage}
                  alt={`${project.title} cover`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <span className="text-[var(--color-blue)]">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight size={30} />
              </motion.div>
            </span>
          </div>
        </button>
      </div>

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
              <div className={`h-1 w-16 bg-[${projectColor}]`}></div>
              <p
                className="text-white min-w-[40vw]"
                dangerouslySetInnerHTML={{
                  __html: project.description.replace(/\n/g, '<br />'),
                }}
              ></p>

              <div className="flex flex-wrap gap-3 mt-2">
                {project.tags &&
                  project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className={`text-sm text-white border border-white px-3 py-1`}
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              <div className="flex gap-4 mt-4">
                {project.githubUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white hover:text-white/70"
                  >
                    <GithubIcon size={18} />
                    <span>GitHub</span>
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white hover:text-white/70"
                  >
                    <ExternalLinkIcon size={18} />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
            {project.coverImage && !project.images?.length && (
              <div className="w-full md:w-1/2 p-4">
                <img
                  src={project.coverImage}
                  alt={`${project.title} cover`}
                  className="w-full h-auto rounded object-cover"
                />
              </div>
            )}
            {project.images && project.images.length > 0 && (
              <Carousel
                hideNavigation
                tapToFullscreen
                images={project.images}
                title={project.title}
                autoSlide={true}
                className="pe-2"
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
