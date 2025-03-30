"use client";

import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { Group } from "three";
import { ModelProps } from "@/types/3dModels";

export function Model3D({
  path,
  scale = 1,
  mouseX = 0,
  windowWidth = 0,
  autoRotate = false,
}: ModelProps) {
  const modelRef = useRef<Group>(null);
  const rotationRef = useRef(0);
  const autoRotateStartTimeRef = useRef(0);
  const clockTimeRef = useRef(0);
  const { scene } = useGLTF(path);

  // Store the current rotation when switching to auto-rotate mode
  useEffect(() => {
    if (modelRef.current) {
      if (autoRotate) {
        // When enabling auto-rotate, store current rotation
        rotationRef.current = modelRef.current.rotation.y;
        autoRotateStartTimeRef.current = clockTimeRef.current;
      }
    }
  }, [autoRotate]);

  useFrame(({ clock }) => {
    // Keep track of current clock time
    clockTimeRef.current = clock.getElapsedTime();

    if (modelRef.current) {
      if (autoRotate) {
        // Calculate rotation based on time passed since auto-rotate was enabled
        const timeDelta = clockTimeRef.current - autoRotateStartTimeRef.current;
        modelRef.current.rotation.y = rotationRef.current + timeDelta * 0.5;
      } else {
        // Follow cursor when autoRotate is false
        if (windowWidth > 0) {
          const normalizedX = ((mouseX || 0) / windowWidth) * 2 - 1;
          modelRef.current.rotation.y = (normalizedX * Math.PI) / 4;
        }
      }
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={scale}
      position={[0, 0, 0]}
    />
  );
}
