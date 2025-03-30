import { getRandomColor } from '@/app/utils';
import { MotionValue } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';

// --- Configuration ---
const PARTICLE_COUNT = 50;
const MIN_PARTICLE_RADIUS = 10;
const MAX_PARTICLE_RADIUS = 50;
const ORBIT_DISTANCE_FACTOR = 1.3;
const ATTRACTION_STRENGTH = 0.0005;
const TANGENTIAL_STRENGTH = 0.02;
const RETURN_TO_BASE_STRENGTH = 0.01;
const DAMPING_FACTOR = 0.99;
const MIN_VELOCITY = 0.2;
const MIN_SPEED = 0.5;
const MAX_SPEED = 1.0;
const EXPLOSION_FORCE = 8.0; // Force applied during explosion
const MAX_FOCUS_DURATION = 2000; // Maximum focus duration before explosion (ms)
const MAX_SPEED_MULTIPLIER = 5.0; // Max speed multiplier at explosion time

// --- Collision Physics Configuration ---
const RESTITUTION = 0.2; // Bounciness factor (0-1), energy retained after collision
const FRICTION = 0.97; // Friction on collision (slowing down)
const GRAVITY = 0; // Gravity force applied to exploding particles
const MIN_BOUNCE_VELOCITY = 0.1; // Minimum velocity to bounce (prevents endless tiny bounces)
const COLLISION_FLASH_DURATION = 500; // Duration of flash effect on collision (ms)
// --- Configuration ---

// Enhanced particle interface
interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  baseOrbitRadius: number;
  color: string;
  orbitSpeed: number;
  exploding?: boolean; // Flag for explosion state
  lastCollision?: number; // Timestamp of last collision for visual effects
  collisionFlash?: boolean; // Whether particle is in "flash" state after collision
}

interface ParticleCanvasProps {
  isActive?: boolean;
  className?: string;
  particleColor?: string;
  particleCount?: number;
  circleX: MotionValue<number>;
  circleY: MotionValue<number>;
  circleRadius?: number;
  isExploding?: boolean; // New prop for explosion state
  isFocused?: boolean; // New prop for focus state
  focusDuration?: number; // New prop for tracking focus duration
}

export function ParticleCanvas({
  isActive = false,
  className,
  particleCount = PARTICLE_COUNT,
  circleX,
  circleY,
  circleRadius = 400,
  isExploding = false,
  isFocused = false,
  focusDuration = 0,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const explosionStartTimeRef = useRef<number | null>(null);

  // Initialize particles
  const initializeParticles = useCallback(
    (canvas: HTMLCanvasElement) => {
      const newParticles: Particle[] = [];
      const currentCircleX = circleX.get();
      const currentCircleY = circleY.get();

      for (let i = 0; i < particleCount; i++) {
        // Generate 2D orbital position (particles will be behind the circle)
        const angle = Math.random() * Math.PI * 2;
        // Distribute particles uniformly around the circle
        const orbitRadius = circleRadius * (ORBIT_DISTANCE_FACTOR + (Math.random() - 0.5) * 0.4);

        // Calculate position
        const x = currentCircleX + Math.cos(angle) * orbitRadius;
        const y = currentCircleY + Math.sin(angle) * orbitRadius;
        // Z is negative to place behind circle (not visible for 3D effect but useful for depth)
        const z = -10 - Math.random() * 50;

        // Randomize radius and speed
        const radius =
          MIN_PARTICLE_RADIUS + Math.random() * (MAX_PARTICLE_RADIUS - MIN_PARTICLE_RADIUS);
        const orbitSpeed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);

        newParticles.push({
          id: i,
          x,
          y,
          z,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          vz: 0, // No initial z velocity
          radius,
          baseOrbitRadius: orbitRadius,
          color: getRandomColor(),
          orbitSpeed,
          exploding: false,
        });
      }

      particlesRef.current = newParticles;
      console.log(`Initialized ${newParticles.length} orbiting particles.`);
    },
    [particleCount, circleX, circleY, circleRadius]
  );

  // Effect for tracking explosion state changes
  useEffect(() => {
    if (isExploding && !explosionStartTimeRef.current) {
      // Start explosion
      explosionStartTimeRef.current = Date.now();

      // Apply explosion force to all particles
      particlesRef.current.forEach((p) => {
        // Calculate direction from center
        const centerX = circleX.get();
        const centerY = circleY.get();

        const dx = p.x - centerX;
        const dy = p.y - centerY;

        // Normalize and scale
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const explosionScale = EXPLOSION_FORCE * (1 + Math.random());

        p.vx += (dx / distance) * explosionScale;
        p.vy += (dy / distance) * explosionScale;
        p.exploding = true;
      });
    } else if (!isExploding && explosionStartTimeRef.current) {
      // Explosion ended, reset
      explosionStartTimeRef.current = null;

      // Reset explosion flag on particles
      particlesRef.current.forEach((p) => {
        p.exploding = false;
      });
    }
  }, [isExploding, circleX, circleY]);

  // Effect for initialization and resize handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.width = canvasRef.current.clientWidth;
          canvasRef.current.height = canvasRef.current.clientHeight;
          console.log(`Canvas resized to ${canvasRef.current.width}x${canvasRef.current.height}`);
          // Re-initialize particles respecting new circle position potentially
          initializeParticles(canvasRef.current);
        }
      }, 250);
    };

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    initializeParticles(canvas);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [initializeParticles]); // Depends only on initializer

  // Animation function
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const particles = particlesRef.current;

    // Get current center position
    const centerX = circleX.get();
    const centerY = circleY.get();

    if (!canvas || !ctx || particles.length === 0 || !isActive) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort particles by z-coordinate for depth order
    const sortedParticles = [...particles].sort((a, b) => a.z - b.z);

    // Calculate speed multiplier based on focus duration
    // Start at 1.0 and increase up to MAX_SPEED_MULTIPLIER as focus duration approaches MAX_FOCUS_DURATION
    const speedMultiplier = isFocused
      ? 1.0 +
        (Math.min(focusDuration, MAX_FOCUS_DURATION) / MAX_FOCUS_DURATION) *
          (MAX_SPEED_MULTIPLIER - 1.0)
      : 1.0;

    // Exponential acceleration effect as we approach explosion
    const accelerationCurve = isFocused ? Math.pow(focusDuration / MAX_FOCUS_DURATION, 2) * 2.5 : 0;

    const now = Date.now(); // Current time for collision flash effects

    sortedParticles.forEach((p) => {
      // Different behavior for exploding vs orbiting particles
      if (p.exploding) {
        // Exploding particles have high initial velocity and fade out
        // Apply gravity to falling particles
        p.vy += GRAVITY; // Gravity
        p.vx *= FRICTION; // Air resistance
        p.vy *= FRICTION;

        // --- COLLISION DETECTION WITH SCREEN BOUNDARIES ---
        let hasCollided = false;

        // Bottom boundary collision (floor)
        if (p.y + p.radius > canvas.height) {
          p.y = canvas.height - p.radius; // Prevent going through boundary

          // Only bounce if moving fast enough
          if (Math.abs(p.vy) > MIN_BOUNCE_VELOCITY) {
            p.vy = -p.vy * RESTITUTION; // Reverse velocity with energy loss
            p.vx *= FRICTION; // Apply friction to horizontal movement
            hasCollided = true;
          } else {
            // Too slow to bounce - stop vertical movement but allow sliding
            p.vy = 0;
          }
        }

        // Top boundary collision
        if (p.y - p.radius < 0) {
          p.y = p.radius;
          p.vy = -p.vy * RESTITUTION;
          p.vx *= FRICTION;
          hasCollided = true;
        }

        // Right boundary collision
        if (p.x + p.radius > canvas.width) {
          p.x = canvas.width - p.radius;
          p.vx = -p.vx * RESTITUTION;
          hasCollided = true;
        }

        // Left boundary collision
        if (p.x - p.radius < 0) {
          p.x = p.radius;
          p.vx = -p.vx * RESTITUTION;
          hasCollided = true;
        }

        // Record collision time for visual effect
        if (hasCollided) {
          p.lastCollision = now;
          p.collisionFlash = true;
        }

        // Reset collision flash after duration
        if (
          p.collisionFlash &&
          p.lastCollision &&
          now - p.lastCollision > COLLISION_FLASH_DURATION
        ) {
          p.collisionFlash = false;
        }
      } else {
        // Normal orbital mechanics
        const dx = centerX - p.x;
        const dy = centerY - p.y;

        const distanceSq = Math.max(dx * dx + dy * dy, 1);
        const distance = Math.sqrt(distanceSq);

        // Attraction force - stronger when focused
        const attractionMultiplier = isFocused ? 3.0 + accelerationCurve : 1.0;
        const forceAttraction = ATTRACTION_STRENGTH * distance * attractionMultiplier;
        let forceAX = (dx / distance) * forceAttraction;
        let forceAY = (dy / distance) * forceAttraction;

        // Orbit stabilization - weaker as we approach explosion to make particles more chaotic
        const driftFactor = isFocused
          ? Math.max(0.01, 0.04 - accelerationCurve * 0.01)
          : RETURN_TO_BASE_STRENGTH;

        const drift = distance - p.baseOrbitRadius;
        forceAX += (dx / distance) * drift * driftFactor;
        forceAY += (dy / distance) * drift * driftFactor;

        // Tangential force (perpendicular to radius)
        // Stronger when focused for faster orbiting, increases with focus duration
        const tangentialMultiplier = isFocused ? 2.5 + accelerationCurve : 1.0;
        const forceTX =
          (-dy / distance) *
          TANGENTIAL_STRENGTH *
          p.orbitSpeed *
          tangentialMultiplier *
          speedMultiplier;
        const forceTY =
          (dx / distance) *
          TANGENTIAL_STRENGTH *
          p.orbitSpeed *
          tangentialMultiplier *
          speedMultiplier;

        // Add small random jittering force that increases with focus duration
        if (isFocused) {
          const jitterMagnitude = 0.01 + accelerationCurve * 0.1;
          forceAX += (Math.random() - 0.5) * jitterMagnitude;
          forceAY += (Math.random() - 0.5) * jitterMagnitude;
        }

        // Update velocity
        p.vx += forceAX + forceTX;
        p.vy += forceAY + forceTY;

        // Apply damping - less damping as we approach explosion
        const dampingValue = isFocused
          ? Math.max(0.93, 0.97 - accelerationCurve * 0.01)
          : DAMPING_FACTOR;

        p.vx *= dampingValue;
        p.vy *= dampingValue;

        // Ensure minimum velocity - higher minimum as we approach explosion
        const minVel = isFocused
          ? MIN_VELOCITY * (2.0 + accelerationCurve) * speedMultiplier
          : MIN_VELOCITY;

        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (currentSpeed < minVel) {
          const boostFactor = minVel / Math.max(currentSpeed, 0.001);
          p.vx *= boostFactor;
          p.vy *= boostFactor;
        }

        // Optional: Cap maximum speed to prevent too extreme movement
        const maxVelocity = 12.0 * speedMultiplier;
        const currentVelocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (currentVelocity > maxVelocity) {
          const scaleFactor = maxVelocity / currentVelocity;
          p.vx *= scaleFactor;
          p.vy *= scaleFactor;
        }
      }

      // Update position
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      // Bounds check for normal particles
      if (
        !p.exploding &&
        (p.x < -canvas.width ||
          p.x > canvas.width * 2 ||
          p.y < -canvas.height ||
          p.y > canvas.height * 2)
      ) {
        // Reset position for particles that go off-screen
        const angle = Math.random() * Math.PI * 2;
        const resetRadius = p.baseOrbitRadius;

        p.x = centerX + Math.cos(angle) * resetRadius;
        p.y = centerY + Math.sin(angle) * resetRadius;
        p.vx = 0;
        p.vy = 0;
      }

      // Calculate opacity and color based on state
      let opacity = 0.7;
      let color = p.color;

      // When focused, make particles slightly brighter as we approach explosion
      if (isFocused && !p.exploding) {
        opacity = Math.min(0.9, 0.7 + accelerationCurve * 0.1);
      }

      if (p.exploding) {
        // Fade out exploding particles over time, but more slowly
        const explosionTime = explosionStartTimeRef.current
          ? (Date.now() - explosionStartTimeRef.current) / 2000 // Slower fade (2s instead of 1s)
          : 0;
        opacity = Math.max(0, 1 - explosionTime);

        // Flash effect on collision - briefly increase brightness and size
        if (p.collisionFlash) {
          // Calculate flash intensity - fades out over COLLISION_FLASH_DURATION
          const flashProgress = p.lastCollision
            ? 1 - Math.min(1, (now - p.lastCollision) / COLLISION_FLASH_DURATION)
            : 0;

          // Make particle brighter during flash
          opacity = Math.min(1, opacity + flashProgress * 0.3);

          // Extract RGB components to create a whiter version for the flash
          const rgbMatch = p.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);

            // Mix with white based on flash intensity
            const whiteAmount = flashProgress * 0.7; // How much white to mix in
            const newR = Math.min(255, r + (255 - r) * whiteAmount);
            const newG = Math.min(255, g + (255 - g) * whiteAmount);
            const newB = Math.min(255, b + (255 - b) * whiteAmount);

            color = `rgba(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)}`;
          }
        }
      }

      // Draw the particle with adjusted opacity
      ctx.beginPath();

      // Slightly increase particle size during collision flash
      const radiusMultiplier = 1;

      ctx.arc(p.x, p.y, p.radius * radiusMultiplier, 0, Math.PI * 2);

      // Parse the color to modify opacity
      const parsedColor = color.replace(
        /rgba\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/,
        (_, r, g, b) => `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(2)})`
      );

      ctx.fillStyle = parsedColor;
      ctx.fill();
    });

    if (isActive) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      animationFrameId.current = null;
    }
  }, [isActive, circleX, circleY, circleRadius, isFocused, focusDuration]);

  // Effect to start/stop animation loop based on isActive
  useEffect(() => {
    if (
      isActive &&
      !animationFrameId.current &&
      canvasRef.current &&
      particlesRef.current.length > 0
    ) {
      console.log('Starting particle animation loop');
      animationFrameId.current = requestAnimationFrame(animate);
    } else if (!isActive && animationFrameId.current) {
      // Stop the loop if isActive becomes false
      console.log('Stopping particle animation loop (isActive changed)');
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    // Cleanup function: ensure animation stops on unmount
    return () => {
      if (animationFrameId.current) {
        console.log('Stopping particle animation loop on cleanup');
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isActive, animate]); // Rerun only when isActive or animate changes

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1, // Behind the circle
        pointerEvents: 'none',
      }}
    />
  );
}
