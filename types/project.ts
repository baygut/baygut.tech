export interface Project {
  id?: number;
  title: string;
  description: string;
  color: string;
  tags: string[];
  category: string;
  githubUrl?: string;
  demoUrl?: string;
  coverImage?: string;
  images?: string[];
}

export interface ProjectsByCategory {
  [category: string]: Project[];
}
