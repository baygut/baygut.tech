export interface Project {
  id?: number;
  title: string;
  description: string;
  color: string;
  category: string;
  technologies: string[];
  images?: string[];
}

export interface ProjectsByCategory {
  [category: string]: Project[];
}
