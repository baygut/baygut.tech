'use client';
import React, { useEffect } from 'react';

import NavButton from '@/components/NavButton';
import SectionWithModel3D from '@/components/SectionWithModel3D';
import ArrowIcon from './components/arrow/ArrowIcon';
import RotationButton from './components/RotationButton';
import ResumeButton from './ResumeButton';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  resumeUrl?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  resumeUrl = '/resume.pdf',
}) => {
  // Initialize with a default value that's the same on both server and client
  const [autoRotate, setAutoRotate] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(false);

  // Use useEffect to update the state based on window size after component mounts on client
  useEffect(() => {
    const isMobileDevice = window.innerWidth <= 768;
    setIsMobile(isMobileDevice);
  }, []);

  const handleRotationToggle = () => {
    setAutoRotate((prev) => !prev);
  };
  return (
    <SectionWithModel3D
      autoRotate={autoRotate}
      modelPath="/me.glb"
      scale={1}
      className="bg-gradient-to-b from-gray-100 to-gray-200"
    >
      <div className="container mx-auto px-4 py-20 flex flex-col justify-start items-start">
        <div className="flex flex-row justify-between items-center w-full">
          <h1 className="text-5xl md:text-7xl font-bold">{title}</h1>
          <div>
            <ResumeButton resumeUrl={resumeUrl} />
            {!isMobile && <RotationButton autoRotate={autoRotate} onClick={handleRotationToggle} />}
          </div>
        </div>
        <p className="text-2xl md:text-3xl text-gray-700 max-w-2xl mb-2">{subtitle}</p>
        <NavButton href="#about">About</NavButton>
        <NavButton href="#experience">Stack</NavButton>
        <NavButton href="#projects">My Work</NavButton>
        <NavButton href="#vibestore">VibeStore</NavButton>
        <NavButton href="#blog">Blog</NavButton>
        <NavButton href="#contact">Contact</NavButton>

        <ArrowIcon
          height={200}
          className=" transition-all hover:translate-y-10 cursor-pointer"
          href="#about"
        />
      </div>
    </SectionWithModel3D>
  );
};

export default HeroSection;
