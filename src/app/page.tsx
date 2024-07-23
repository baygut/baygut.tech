// app/page.tsx
"use client"; // Enable client-side rendering for fetching data

import { useState, useEffect } from "react";
import db from "@/utils/firestore";
import { collection, getDocs } from "@firebase/firestore";
import { FIRESTORE_BASE_PATH, FIRESTORE_PROJECTS_PATH } from "@/api/constants";

interface Project {
  id: string;
  title: string;
  description: string;
}

const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsCollection = collection(
          db,
          FIRESTORE_BASE_PATH + FIRESTORE_PROJECTS_PATH
        );
        const projectsSnapshot = await getDocs(projectsCollection);
        const projectsData = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        console.log(projectsData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black-100 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10">My Portfolio</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
              <p className="text-gray-700">{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
