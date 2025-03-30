'use client';

import useMousePosition from '@/hooks/useMousePosition';
import { SpinningModel3DProps } from '@/types/3dModels';
import { Environment, Stage } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { Model3D } from './3d/Model3D';

const SpinningModel3D = ({
  modelPath,
  scale = 1,
  className = '',
  autoRotate = false,
}: SpinningModel3DProps) => {
  const { x } = useMousePosition();
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`w-full h-full flex flex-col items-center ${className}`}>
      <div className="w-full h-full pointer-events-none">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0, 10], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight {...{ intensity: 0.5 }} />
          <directionalLight {...{ position: [0, 10, 5], intensity: 1 }} />
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.5} adjustCamera={false}>
              <Model3D
                path={modelPath}
                scale={scale}
                mouseX={x}
                windowWidth={windowWidth}
                autoRotate={autoRotate}
              />
            </Stage>
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default SpinningModel3D;
