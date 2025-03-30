'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useTooltipStore } from '../store/tooltipStore';

const GlobalTooltip: React.FC = () => {
  const { isVisible, message, hideTooltip, showTooltip } = useTooltipStore();
  const [isInFirstSection, setIsInFirstSection] = useState(true);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      setIsInFirstSection(scrollY < viewportHeight * 0.8);
      hideTooltip();
    };

    // Initial check
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  // Apply different position styles based on scroll position
  const positionClasses = isInFirstSection
    ? 'left-1/2 top-1/4 transform -translate-x-1/2' // Original centered position
    : 'right-10 bottom-32'; // Bottom right corner position

  // Arrow position also changes
  const arrowClasses = isInFirstSection
    ? 'left-1/2 transform -translate-x-1/2 -bottom-[10px] rotate-45'
    : 'right-4 -bottom-[10px] rotate-45';

  // Width constraints based on position - making them wider
  const widthClasses = isInFirstSection
    ? 'max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw]' // Centered tooltip is wider
    : 'max-w-[90vw] sm:max-w-[450px] md:max-w-[900px]'; // Corner tooltip also wider

  return (
    <div
      ref={tooltipRef}
      className={`fixed ${positionClasses} ${widthClasses} bg-white border-2 border-black text-black font-normal rounded-lg px-4 py-4 pb-6 shadow-md z-[9999] transition-all duration-300`}
    >
      <p className="text-xl font-mono line-clamp-6 whitespace-normal break-words">{message}</p>
      <div
        className={`absolute ${arrowClasses} w-4 h-4 bg-white border-r-2 border-b-2 border-black`}
      ></div>
    </div>
  );
};

export default GlobalTooltip;
