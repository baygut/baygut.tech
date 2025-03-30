import { useState, useEffect, useCallback } from 'react';

interface MousePosition {
  x: number | null;
  y: number | null;
}

export default function useMousePosition(isActive = true) {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: null,
    y: null,
  });

  const handleMouseMove = useCallback((event: MouseEvent) => {
    // Using requestAnimationFrame to optimize updates
    window.requestAnimationFrame(() => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    });
  }, []);

  useEffect(() => {
    // Only add listener when active
    if (isActive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }

    // No need to clean up if we never added the listener
    return undefined;
  }, [handleMouseMove, isActive]);

  return mousePosition;
}
