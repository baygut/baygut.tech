import { Github, Linkedin } from 'lucide-react';
import React from 'react';

export interface SocialLink {
  icon: string;
  url: string;
  label: string;
}

interface SocialLinksProps {
  links: SocialLink[];
  className?: string;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ links, className = '' }) => {
  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'github':
        return <Github className="w-6 h-6" />;
      case 'linkedin':
        return <Linkedin className="w-6 h-6" />;
      // Add more icons as needed
      default:
        return null;
    }
  };
  return (
    <div className={`flex space-x-4 ${className}`}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-gray-300 transition-colors"
          aria-label={link.label}
        >
          {renderIcon(link.icon)}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
