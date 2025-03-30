"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type AnimationVariant = "default" | "scale" | "perspective" | "split";
type AccentColor = "blue" | "yellow" | "red" | "none";

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "vertical" | "horizontal";
  variant?: AnimationVariant;
  splitDirection?: "horizontal" | "vertical";
  perspectiveAmount?: number;
  scaleAmount?: number;
  className?: string;
  accentColor?: AccentColor;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  direction = "vertical",
  variant = "default",
  splitDirection = "horizontal",
  perspectiveAmount = 500,
  scaleAmount = 1.2,
  className = "",
  accentColor = "none",
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const leftSplitRef = useRef<HTMLDivElement>(null);
  const rightSplitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const leftSplit = leftSplitRef.current;
    const rightSplit = rightSplitRef.current;

    if (!section || !content) return;

    // Clear any existing animations
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars.trigger === section) {
        trigger.kill();
      }
    });

    // Apply different animations based on the variant
    switch (variant) {
      case "scale":
        gsap.fromTo(
          content,
          { scale: 1 },
          {
            scale: scaleAmount,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
        break;

      case "perspective":
        // Set perspective on the section container
        gsap.set(section, { perspective: perspectiveAmount });

        gsap.fromTo(
          content,
          { rotationX: 0, rotationY: 0 },
          {
            rotationX: direction === "vertical" ? 25 : 0,
            rotationY: direction === "horizontal" ? 25 : 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
        break;

      case "split":
        if (!leftSplit || !rightSplit) break;

        // Hide the main content when using split variant
        gsap.set(content, { autoAlpha: 0 });

        // Show the split elements
        gsap.set([leftSplit, rightSplit], { autoAlpha: 1 });

        // Animate the split based on direction
        if (splitDirection === "horizontal") {
          gsap.fromTo(
            leftSplit,
            { x: 0 },
            {
              x: -speed * 100,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );

          gsap.fromTo(
            rightSplit,
            { x: 0 },
            {
              x: speed * 100,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        } else {
          // Vertical split
          gsap.fromTo(
            leftSplit,
            { y: 0 },
            {
              y: -speed * 100,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );

          gsap.fromTo(
            rightSplit,
            { y: 0 },
            {
              y: speed * 100,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
        break;

      default:
        // Original parallax effect
        gsap.to(content, {
          ...(direction === "vertical"
            ? { yPercent: speed * 100 }
            : { xPercent: speed * 100 }),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
    }
  }, [
    speed,
    direction,
    variant,
    splitDirection,
    perspectiveAmount,
    scaleAmount,
  ]);

  // Determine the accent color class
  const accentColorClass =
    accentColor !== "none" ? `accent-${accentColor}` : "";
  const combinedClassName = `${className} ${accentColorClass}`.trim();

  // For split variant, we need to duplicate the content
  if (variant === "split") {
    return (
      <section
        ref={sectionRef}
        className={`relative h-screen flex items-center justify-center overflow-hidden ${combinedClassName}`}
      >
        {/* Original content (hidden) for reference */}
        <div ref={contentRef} className="w-full opacity-0 absolute">
          {children}
        </div>

        {/* Left/Top split */}
        <div
          ref={leftSplitRef}
          className={`absolute ${
            splitDirection === "horizontal"
              ? "left-0 w-1/2 h-full"
              : "top-0 w-full h-1/2"
          } overflow-hidden`}
        >
          <div
            className={`w-full ${
              splitDirection === "horizontal" ? "" : "flex justify-center"
            }`}
          >
            {children}
          </div>
        </div>

        {/* Right/Bottom split */}
        <div
          ref={rightSplitRef}
          className={`absolute ${
            splitDirection === "horizontal"
              ? "right-0 w-1/2 h-full"
              : "bottom-0 w-full h-1/2"
          } overflow-hidden`}
        >
          <div
            className={`w-full ${
              splitDirection === "horizontal"
                ? "translate-x-[-100%]"
                : "flex justify-center"
            } ${splitDirection === "vertical" ? "translate-y-[-100%]" : ""}`}
          >
            {children}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={`relative h-screen flex items-center justify-center overflow-hidden ${
        variant === "perspective" ? "transform-style-3d" : ""
      } ${combinedClassName}`}
    >
      <div ref={contentRef} className="w-full">
        {children}
      </div>
    </section>
  );
};

export default ParallaxSection;
