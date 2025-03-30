"use client";

import { useEffect, useRef, useState } from "react";
import WordItem from "./WordItem";
import { WordDescription, WordDescriptionListProps } from "./types";
import { useTooltipStore } from "../../app/store/tooltipStore";

const WordDescriptionList: React.FC<WordDescriptionListProps> = ({
  words,
  accentColor = "yellow",
  textColor = "black",
}) => {
  const [selectedWord, setSelectedWord] = useState<WordDescription | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<WordDescription[][]>([]);
  const { showTooltip, hideTooltip } = useTooltipStore();

  // Define the highlight color based on the accentColor prop

  // Calculate word layout based on container width
  const calculateWordLayout = () => {
    if (!containerRef.current || words.length === 0) return;

    // For better responsiveness, we'll just pass all words as a single "row"
    // and let CSS flexbox handle the wrapping
    setRows([words]);
  };

  // Organize words into rows with roughly equal width
  useEffect(() => {
    calculateWordLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, containerRef.current?.offsetWidth]);

  // Handle window resize
  useEffect(() => {
    window.addEventListener("resize", calculateWordLayout);
    return () => window.removeEventListener("resize", calculateWordLayout);
  }, [words]);

  const handleWordClick = (word?: WordDescription) => {
    if (!word) {
      // If no word is passed, hide the tooltip
      hideTooltip();
      setSelectedWord(null);
      return;
    }
    if (selectedWord?.word === word.word) {
      // If clicking the already selected word, hide the tooltip
      hideTooltip();
      setSelectedWord(null);
    } else {
      // Show tooltip with the word description
      showTooltip(word.desc);
      setSelectedWord(word);
    }
  };

  return (
    <div
      className="relative w-full"
      ref={containerRef}
      onMouseLeave={() => handleWordClick()}
    >
      {/* Words list - always visible */}
      <div>
        {rows.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex flex-wrap gap-2 md:gap-3 justify-center sm:justify-between"
          >
            {row.map((item) => (
              <WordItem
                key={item.word}
                item={item}
                isSelected={selectedWord?.word === item.word}
                highlightColor={accentColor}
                textColor={textColor}
                onClick={handleWordClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordDescriptionList;
