import React from "react";
import { WordDescription } from "./types";

interface WordItemProps {
  item: WordDescription;
  isSelected: boolean;
  highlightColor: string;
  textColor: string;
  onClick: (word: WordDescription) => void;
}

const WordItem: React.FC<WordItemProps> = ({
  item,
  isSelected,
  highlightColor,
  textColor,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(item)}
      className={`text-5xl font-bold relative focus:outline-none transition-all 
        ${
          isSelected
            ? `text-[var(--color-${highlightColor})] opacity-100`
            : `text-${textColor} opacity-20 hover:opacity-100 hover:text-[${highlightColor}] transition-opacity duration-500`
        }`}
      aria-pressed={isSelected}
    >
      {item.word}
    </button>
  );
};

export default WordItem;
