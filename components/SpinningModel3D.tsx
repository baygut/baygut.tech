'use client';

import useMousePosition from '@/hooks/useMousePosition';
import { SpinningModel3DProps } from '@/types/3dModels';
import '@google/model-viewer';
import { useEffect, useRef, useState } from 'react';
import ModelViewer, { ModelViewerProps } from './ModelViewer';

const SpinningModel3D = ({
  modelPath,
  scale = 1,
  className = '',
  autoRotate = false,
}: SpinningModel3DProps) => {
  const { x } = useMousePosition();
  const [windowWidth, setWindowWidth] = useState(0);
  const modelViewerRef = useRef<ModelViewerProps | null>(null);
  const rotationRef = useRef(0);
  const startTimeRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Handle window resize
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation loop
  useEffect(() => {
    // Capture initial state when autoRotate changes
    if (autoRotate && modelViewerRef.current) {
      const orbitValue = modelViewerRef.current.cameraOrbit || '0deg 90deg 100%';
      const angleMatch = orbitValue.match(/^([0-9.-]+)deg/);
      rotationRef.current = angleMatch ? parseFloat(angleMatch[1]) : 0;
      startTimeRef.current = performance.now() / 1000;
    }

    const animate = () => {
      if (!modelViewerRef.current) return;

      const currentTime = performance.now() / 1000;

      if (autoRotate) {
        // Auto-rotation logic
        const timeDelta = currentTime - startTimeRef.current;
        const angleDegrees = rotationRef.current + timeDelta * 60;
        modelViewerRef.current.cameraOrbit = `${angleDegrees}deg 90deg 100%`;
      } else if (windowWidth > 0 && x !== null) {
        // Mouse tracking logic - reversed direction
        const normalizedX = ((x || 0) / windowWidth) * 2 - 1;
        // Negate the angle to reverse the direction
        const angleDegrees = -normalizedX * 45;
        modelViewerRef.current.cameraOrbit = `${angleDegrees}deg 90deg 100%`;
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [autoRotate, x, windowWidth]);

  return (
    <div className={`w-full h-full mt-auto items-end justify-end flex flex-col ${className} `}>
      <div className="mt-auto flex justify-center items-center w-full h-full">
        <ModelViewer
          ref={modelViewerRef}
          className="w-full h-full"
          src={modelPath}
          ar
          arModes="webxr scene-viewer quick-look"
          arScale="auto"
          autoRotateDelay={0}
          scale={`${scale} ${scale} ${scale}`}
          loading="auto"
          interaction-prompt="none"
          camera-orbit="0deg 90deg 100%"
          alt="3D Model"
          camera-controls
          ios-src={modelPath.replace('.glb', '.usdz')}
          shadowIntensity={3}
        />
      </div>
    </div>
  );
};

export default SpinningModel3D;
