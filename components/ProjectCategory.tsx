import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpIcon } from "lucide-react";
import { Project } from "../types/project";
import ProjectItem from "./ProjectItem";

interface ProjectCategoryProps {
  category: string;
  projects: Project[];
  isActive: boolean;
  expandedProject: string | null;
  toggleCategory: (category: string) => void;
  toggleProject: (projectTitle: string) => void;
}

const ProjectCategory: React.FC<ProjectCategoryProps> = ({
  category,
  projects,
  isActive,
  expandedProject,
  toggleCategory,
  toggleProject,
}) => {
  return (
    <div className="border-b border-white/30 pb-2">
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
            animate={{ rotate: isActive ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowUpIcon size={50} />
          </motion.div>
        </span>
      </button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="py-4 space-y-6">
              {projects.map((project) => (
                <ProjectItem
                  key={project.title}
                  project={project}
                  isExpanded={expandedProject === project.title}
                  toggleProject={toggleProject}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectCategory;
