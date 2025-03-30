"use client";
import React from "react";
import { Save } from "lucide-react";
import { useTooltipStore } from "./store/tooltipStore";

const ResumeButton: React.FC = () => {
  const { showTooltip, hideTooltip } = useTooltipStore();

  return (
    <div className="relative">
      <a
        href="/resume.pdf"
        download
        className="block"
        onMouseEnter={() => showTooltip("Press to download my resume")}
        onMouseLeave={() => hideTooltip()}
        aria-label="Download my resume"
      >
        <Save
          className="transition-all duration-300 hover:scale-110 hover:opacity-30 cursor-pointer"
          size={50}
          strokeWidth={1.25}
        />
      </a>
    </div>
  );
};

export default ResumeButton;
