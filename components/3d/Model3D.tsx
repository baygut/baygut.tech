'use client';

import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { Group } from 'three';
import { ModelProps } from '@/types/3dModels';

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

  useEffect(() => {
    if (modelRef.current && autoRotate) {
      rotationRef.current = modelRef.current.rotation.y;
      autoRotateStartTimeRef.current = clockTimeRef.current;
    }
  }, [autoRotate]);

  useFrame(({ clock }) => {
    clockTimeRef.current = clock.getElapsedTime();

    if (modelRef.current) {
      if (autoRotate) {
        const timeDelta = clockTimeRef.current - autoRotateStartTimeRef.current;
        modelRef.current.rotation.y = rotationRef.current + timeDelta * 0.5;
      } else if (windowWidth > 0) {
        const normalizedX = ((mouseX || 0) / windowWidth) * 2 - 1;
        modelRef.current.rotation.y = (normalizedX * Math.PI) / 4;
      }
    }
  });

  return (
    <>
      {/* Corrected light component */}
      <directionalLight {...{ intensity: 1.5, position: [5, 5, 5] }} />

      {/* Corrected primitive usage */}
      <primitive ref={modelRef} {...{ position: [0, 0, 0], object: scene, scale: scale }} />
    </>
  );
}
