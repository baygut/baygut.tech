'use client';
import ParallaxSection from '@/components/ParallaxSection';
import React, { useEffect, useState } from 'react';

interface AboutSectionProps {
  content: string[];
}

const AboutSection: React.FC<AboutSectionProps> = ({ content }) => {
  // Track if we're on mobile for scaling adjustments
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on initial load
    checkIfMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const children = (
    <section
      id="about"
      className="flex flex-col items-center justify-center relative py-16 md:py-20 px-4 bg-black"
    >
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-14 text-center text-white">
          About Me
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="aspect-square bg-[var(--color-yellow)] bg-opacity-20 rounded-2xl max-w-md mx-auto w-full">
            <img
              src="/me.png"
              alt="Berkay Baygut"
              className="w-full h-full object-contain rounded-2xl p-3 shadow-lg"
              loading="lazy"
              width={200}
              height={500}
            />
          </div>
          <div>
            {content.map((paragraph, index) => (
              <p key={index} className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-white">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="overflow-hidden w-full">
      {isMobile ? (
        children
      ) : (
        <ParallaxSection
          variant="scale"
          scaleAmount={1.3} // Reduced scale amount on mobile
          speed={0.3}
          accentColor="yellow"
          className="bg-black"
        >
          {children}
        </ParallaxSection>
      )}
    </div>
  );
};

export default AboutSection;
