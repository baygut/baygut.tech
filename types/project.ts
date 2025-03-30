export interface Project {
  id?: number;
  title: string;
  description: string;
  color: string;
  category: string;
  tags: string[];
  images?: string[];
  github_url?: string;
  demo_url?: string;
}

export interface ProjectsByCategory {
  [category: string]: Project[];
}
