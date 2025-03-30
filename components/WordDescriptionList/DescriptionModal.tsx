import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowLeft } from "lucide-react";
import { WordDescription } from "./types";

interface DescriptionModalProps {
  selectedWord: WordDescription | null;
  highlightColor: string;
  textColor: string;
  onClose: () => void;
}

const DescriptionModal: React.FC<DescriptionModalProps> = ({
  selectedWord,
  highlightColor,
  textColor,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modal = modalRef.current;

    if (modal) {
      if (selectedWord) {
        // Reset position before animating in
        gsap.set(modal, { x: "100%", opacity: 0 });

        // Animate modal sliding in with spring effect
        gsap.to(modal, {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: "elastic.out(1, 0.95)", // Spring effect
        });
      } else {
        // Animate modal sliding out to right
        gsap.to(modal, {
          x: "100%",
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        });
      }
    }
  }, [selectedWord]);

  if (!selectedWord) return null;

  return (
    <div
      ref={modalRef}
      className="absolute inset-0 bg-white dark:bg-gray-900 shadow-xl flex flex-col z-20"
    >
      <div className="p-8 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h2 className={`text-6xl font-bold text-[${highlightColor}]`}>
          {selectedWord.word}
        </h2>
        <button
          onClick={onClose}
          className="text-2xl p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={50} color={highlightColor} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <p className={`text-3xl md:text-4xl text-${textColor} leading-relaxed`}>
          {selectedWord.desc}
        </p>
      </div>
    </div>
  );
};

export default DescriptionModal;
