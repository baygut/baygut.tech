'use client';
import React from 'react';
import { Save } from 'lucide-react';
import { useTooltipStore } from './store/tooltipStore';

export interface ResumeButtonProps {
  resumeUrl?: string;
}

const ResumeButton: React.FC<ResumeButtonProps> = ({ resumeUrl }) => {
  const { showTooltip, hideTooltip } = useTooltipStore();

  return (
    <div className="relative">
      <a
        href={resumeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        onMouseEnter={() => showTooltip('Press to download my resume')}
        onMouseLeave={() => hideTooltip()}
        aria-label="Download my resume"
      >
        <Save
          className="transition-all duration-300 hover:scale-110 hover:opacity-100 cursor-pointer w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16"
          strokeWidth={1.25}
        />
      </a>
    </div>
  );
};

export default ResumeButton;
