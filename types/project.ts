export interface Project {
  title: string;
  description: string;
  color: string;
  technologies: string[];
  category: string;
}

export interface ProjectsByCategory {
  [category: string]: Project[];
}
