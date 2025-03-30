// Define the API response types

export interface Skill {
  id: number;
  word: string;
  desc: string; // We keep this as 'desc' in the interface for compatibility with the frontend
}

export interface Project {
  id: number;
  title: string;
  description: string;
  color: string;
  category: string;
  technologies: string[];
  images: string[]; // Add images array
}

export interface ContactItem {
  id: number;
  type: string;
  value: string;
  href: string;
}

export interface SocialLink {
  id: number;
  icon: string;
  url: string;
  label: string;
}

export interface ContactInfo {
  contactItems: ContactItem[];
  socialLinks: SocialLink[];
  resumeUrl?: string | null;
}
