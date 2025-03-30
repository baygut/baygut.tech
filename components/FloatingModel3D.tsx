"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const FloatingModel3D = ({
  imagePath = "/profile-image.png",
  heroSectionId = "hero-section",
}: {
  imagePath?: string;
  heroSectionId?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById(heroSectionId);
      if (heroSection) {
        const heroSectionBottom = heroSection.getBoundingClientRect().bottom;
        setIsVisible(heroSectionBottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroSectionId]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, rotate: [0, 10, 0] }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-8 right-8 z-50 cursor-pointer"
          onClick={scrollToTop}
        >
          <div className="bg-white border-2 border-black rounded-full w-20 h-20 shadow-lg flex flex-col items-center justify-center overflow-hidden">
            <div className="relative h-12 w-12 mb-1">
              <Image
                src={imagePath}
                alt="Profile"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingModel3D;
