import { Project } from '@/types/project';
import Image from 'next/image';
import { useState } from 'react';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Function to handle image navigation
  const nextImage = () => {
    if (project.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % project.images!.length);
    }
  };

  const prevImage = () => {
    if (project.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + project.images!.length) % project.images!.length);
    }
  };

  // Determine background color class based on project color
  const bgColorClass = `bg-${project.color}-100`;
  const borderColorClass = `border-${project.color}-300`;

  return (
    <div
      className={`rounded-lg overflow-hidden h-full flex flex-col border ${borderColorClass} shadow-md`}
    >
      {project.images && project.images.length > 0 && (
        <div className="relative w-full h-48">
          <Image
            src={project.images[currentImageIndex]}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
          {project.images.length > 1 && (
            <div className="absolute inset-0 flex justify-between items-center">
              <button
                onClick={prevImage}
                className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 m-2 rounded-full"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 m-2 rounded-full"
              >
                →
              </button>
            </div>
          )}
          <div className="absolute bottom-0 right-0 p-2">
            {project.images.length > 1 && (
              <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
                {currentImageIndex + 1}/{project.images.length}
              </span>
            )}
          </div>
        </div>
      )}

      <div className={`p-4 ${bgColorClass}`}>
        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
        <p className="text-gray-700 mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 bg-white text-gray-800 text-xs font-medium rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
