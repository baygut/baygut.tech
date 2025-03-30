"use client";

import { ReactNode } from "react";
import SpinningModel3D from "./SpinningModel3D";

interface BackgroundModel3DProps {
  children: ReactNode;
  modelPath: string;
  scale?: number;
  rotationSpeed?: number;
}

const BackgroundModel3D = ({
  children,
  modelPath,
  scale = 1,
  rotationSpeed = 0.005,
}: BackgroundModel3DProps) => {
  return (
    <div className="relative w-full h-full min-h-screen">
      {/* 3D Background Layer */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <SpinningModel3D
          modelPath={modelPath}
          scale={scale}
          rotationSpeed={rotationSpeed}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default BackgroundModel3D;
