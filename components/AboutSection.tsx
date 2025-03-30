import React from "react";
import ParallaxSection from "@/components/ParallaxSection";

interface AboutSectionProps {
  content: string[];
}

const AboutSection: React.FC<AboutSectionProps> = ({ content }) => {
  return (
    <ParallaxSection
      variant="scale"
      scaleAmount={1.3}
      speed={0.3}
      accentColor="yellow"
      className="bg-black"
    >
      <section
        id="about"
        className="min-h-screen flex flex-col items-center justify-center relative py-20"
      >
        <div className="max-w-6xl mx-auto px-2">
          <h2 className="text-6xl font-bold mb-14 text-center text-white">
            About Me
          </h2>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="aspect-square bg-[var(--color-yellow)] bg-opacity-20 rounded-2xl">
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
                <p key={index} className="text-2xl mb-8 text-white">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ParallaxSection>
  );
};

export default AboutSection;
