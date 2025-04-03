export interface Category {
  id: number;
  name: string;
  display_order?: number;
}

export interface Project {
  id?: number;
  title: string;
  description: string;
  color: string;
  tags: string[];
  category: Category;
  githubUrl?: string;
  demoUrl?: string;
  coverImage?: string;
  images?: string[];
}

export interface ProjectsByCategory {
  [categoryId: number]: Project[];
}
