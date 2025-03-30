import React from "react";
import WordDescriptionList from "./WordDescriptionList";

export interface Skill {
  word: string;
  desc: string;
}

interface SkillsSectionProps {
  skills: Skill[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  return (
    <section id="experience" className="py-24 bg-[var(--color-blue)]">
      <div className="max-w-6xl mx-auto text-center">
        <WordDescriptionList
          words={skills}
          accentColor="yellow"
          textColor="white"
        />
      </div>
    </section>
  );
};

export default SkillsSection;
