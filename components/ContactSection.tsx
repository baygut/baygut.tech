// src/components/ContactSection.tsx (or similar path)
'use client';

import useMousePosition from '@/hooks/useMousePosition';
import { animate, motion, useMotionValue, useSpring } from 'framer-motion'; // Keep framer-motion
import { useCallback, useEffect, useRef, useState } from 'react';
import { lerp } from 'three/src/math/MathUtils';
import { ParticleCanvas } from './ParticleCanvas'; // Import particle canvas
import SocialLinks, { SocialLink } from './SocialLinks';
import { useTooltipStore } from '@/app/store/tooltipStore';

interface ContactItem {
  label?: string;
  value: string;
  href: string;
}

interface ContactSectionProps {
  title: string;
  contactItems: ContactItem[];
  socialLinks: SocialLink[];
  className?: string;
}

const CIRCLE_SIZE = 800;
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;
// Anchor circle properties (smaller, appears on info hover)
const ANCHOR_CIRCLE_SIZE = 150;
// Long-press focus animation settings
const FOCUS_DURATION = 100; // ms to consider a press as "long"
const FOCUSED_CIRCLE_SIZE = 400; // Size when focused (smaller)

const ContactSection: React.FC<ContactSectionProps> = ({
  title,
  contactItems,
  socialLinks,
  className = '',
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const infoBoxRef = useRef<HTMLDivElement>(null);

  const [isSectionHovered, setIsSectionHovered] = useState(false);

  // Add states for long press and explosion
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State to store the calculated anchor position
  const [anchorPos, setAnchorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse position hook
  const { x: mouseXRaw, y: mouseYRaw } = useMousePosition(isSectionHovered);

  // Circle size animation value
  const circleSize = useMotionValue(CIRCLE_SIZE);

  // --- Framer Motion Setup ---
  const mouseXSpringInput = useMotionValue(0);
  const mouseYSpringInput = useMotionValue(0);

  // Stickness factor - controls interpolation between mouse and anchor
  const stickiness = useMotionValue(0); // 0 = follow mouse, 1 = stick to anchor

  const springConfig = { damping: 25, stiffness: 120, mass: 0.3 };
  const springX = useSpring(mouseXSpringInput, springConfig);
  const springY = useSpring(mouseYSpringInput, springConfig);
  // --- End Framer Motion Setup ---

  // Calculate Anchor Position (relative to viewport)
  const calculateAnchorPos = useCallback(() => {
    if (infoBoxRef.current) {
      const rect = infoBoxRef.current.getBoundingClientRect();
      // Anchor point: e.g., center-left edge of the info box
      setAnchorPos({
        x: rect.left + 50, // Adjust offset as needed
        y: rect.top + rect.height / 2,
      });
      // console.log("Anchor Pos:", { x: rect.left + 50, y: rect.top + rect.height / 2 });
    }
  }, []); // No dependencies, relies on ref having current value when called

  // Effect to calculate anchor position initially and on resize
  useEffect(() => {
    calculateAnchorPos(); // Initial calculation
    window.addEventListener('resize', calculateAnchorPos);
    return () => window.removeEventListener('resize', calculateAnchorPos);
  }, [calculateAnchorPos]);

  // Effect to update the main spring target (interpolation)
  useEffect(() => {
    if (!isSectionHovered) return; // Don't update if not hovering section

    const currentStickiness = stickiness.get();
    const targetX = lerp(
      mouseXRaw ?? springX.get(), // Fallback to current spring pos if mouse is null
      anchorPos.x,
      currentStickiness
    );
    const targetY = lerp(
      mouseYRaw ?? springY.get(), // Fallback
      anchorPos.y,
      currentStickiness
    );

    mouseXSpringInput.set(targetX);
    mouseYSpringInput.set(targetY);
  }, [
    mouseXRaw,
    mouseYRaw,
    anchorPos,
    isSectionHovered,
    stickiness,
    springX,
    springY,
    mouseXSpringInput,
    mouseYSpringInput,
  ]);
  // Note: Including springX/Y and springInputs in deps ensures we use latest fallback if mouseRaw becomes null briefly

  // Track focus duration for particles
  const [focusDuration, setFocusDuration] = useState(0);
  const focusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { showTooltip, hideTooltip } = useTooltipStore();

  // --- Hover Handlers ---
  const handleSectionEnter = () => {
    setIsSectionHovered(true);
    showTooltip('Click and hold to explode the circle!');
    setTimeout(() => {
      hideTooltip();
    }, 3000); // Hide tooltip after 2 seconds
  };
  const handleSectionLeave = () => {
    setIsSectionHovered(false);
    // Clear any pending long press on leave
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    // Also clear focus interval
    if (focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
      focusIntervalRef.current = null;
    }
    setIsLongPressed(false);
    setFocusDuration(0);
  };

  // Mouse down handler for long press
  const handleMouseDown = () => {
    // Start a timer for long press
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressed(true);
      // Animate circle to focused size
      animate(circleSize, FOCUSED_CIRCLE_SIZE, {
        duration: 0.3,
        type: 'spring',
        stiffness: 200,
        damping: 25,
      });

      // Start tracking focus duration for particle acceleration
      setFocusDuration(0);
      focusIntervalRef.current = setInterval(() => {
        setFocusDuration((prev) => prev + 50); // Increment every 50ms
      }, 50);
    }, FOCUS_DURATION);
  };

  // Mouse up/release handler
  const handleMouseUp = () => {
    // Clear long press timer if exists
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Clear focus tracking interval
    if (focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
      focusIntervalRef.current = null;
    }

    // If was long-pressed, trigger explosion
    if (isLongPressed) {
      setIsExploding(true);

      // Reset circle size with spring animation
      animate(circleSize, CIRCLE_SIZE, {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        onComplete: () => {
          // End explosion after animation completes
          setTimeout(() => setIsExploding(false), 800);
        },
      });

      setIsLongPressed(false);
      setFocusDuration(0);
    }
  };

  // Clean up any timeouts on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current);
        focusIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      // Apply the SVG filter via CSS!
      style={{ filter: 'url(#goo)' }}
      className={`relative h-screen flex items-center justify-start bg-[var(--color-yellow)] p-4 sm:p-10 text-white overflow-hidden ${className}`}
      onMouseEnter={handleSectionEnter}
      onMouseLeave={handleSectionLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* 1. Particle Canvas (z-index 1) */}
      <ParticleCanvas
        isActive={isSectionHovered}
        circleX={springX}
        circleY={springY}
        circleRadius={CIRCLE_RADIUS}
        className="absolute inset-0 z-[1] pointer-events-none" // Explicit low z-index
        isExploding={isExploding} // Pass explosion state
        isFocused={isLongPressed} // Pass focus state
        focusDuration={focusDuration} // Pass focus duration for particle acceleration
      />

      {/* 3. Big Blue Circle (Main Follower) */}
      <motion.div
        style={{
          left: springX,
          top: springY,
          x: '-50%',
          y: '-50%',
          width: circleSize, // Use motion value for size
          height: circleSize, // Use motion value for size
        }}
        // Needs same background color as anchor
        className="absolute bg-[var(--color-blue)] rounded-full z-[2] pointer-events-none" // Same level as anchor
      />

      {/* 4. Info Content Box (Highest z-index) */}
      <div
        ref={infoBoxRef}
        className="relative z-[3] max-w-lg text-left w-full" // Highest z-index
      >
        {/* ... keep all inner content (h1, hr, contactItems, SocialLinks) ... */}
        <h1 className="text-4xl sm:text-6xl text-white font-bold">{title}</h1>
        <hr className="my-4 border-t-2 border-white w-full" />

        {contactItems.map((item, index) => (
          <div key={index} className="mb-2">
            {item.label && <p className="text-base sm:text-lg font-semibold">{item.label}:</p>}
            <p className="break-words">
              <a
                href={item.href}
                className="text-xl sm:text-3xl font-bold underline-offset-4 relative group"
              >
                {item.value}
                <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
            </p>
          </div>
        ))}

        <SocialLinks links={socialLinks} className="mt-4 sm:mt-6" />
      </div>
    </section>
  );
};

export default ContactSection;
