import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpIcon } from "lucide-react";
import { Project } from "../types/project";

interface ProjectItemProps {
  project: Project;
  isExpanded: boolean;
  toggleProject: (projectTitle: string) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  isExpanded,
  toggleProject,
}) => {
  return (
    <div className="border-l-2 text-black border-white/40 pl-4">
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
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              <div
                className={`h-1 w-16 bg-[var(--color-${project.color})]`}
              ></div>
              <p className="text-black">{project.description}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className={`text-sm text-black border border-black px-3 py-1`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full h-[3px] bg-[var(--color-blue)] mt-3" />
    </div>
  );
};

export default ProjectItem;
