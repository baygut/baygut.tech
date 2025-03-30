"use client";

import { ReactNode } from "react";
import SpinningModel3D from "./SpinningModel3D";

interface SectionWithModel3DProps {
  children: ReactNode;
  modelPath: string;
  scale?: number;
  rotationSpeed?: number;
  className?: string;
  autoRotate?: boolean;
}

const SectionWithModel3D = ({
  children,
  modelPath,
  scale = 1,
  className = "",
  autoRotate = false,
}: SectionWithModel3DProps) => {
  return (
    <section className={`relative min-h-screen w-full ${className}`}>
      {/* 3D Model Background */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <SpinningModel3D
          autoRotate={autoRotate}
          modelPath={modelPath}
          scale={scale}
        />
      </div>

      {/* Section Content */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </section>
  );
};

export default SectionWithModel3D;
