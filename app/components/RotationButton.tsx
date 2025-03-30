"use client";
import React from "react";
import { RefreshCcw, RefreshCwOff, RotateCcw, Save } from "lucide-react";
import { useTooltipStore } from "../store/tooltipStore";

interface RotationButtonProps {
  autoRotate: boolean;
  onClick: () => void;
}

const RotationButton: React.FC<RotationButtonProps> = ({
  autoRotate,
  onClick,
}) => {
  const { showTooltip, hideTooltip } = useTooltipStore();

  const message = autoRotate ? "Start cursor-follow" : "Start auto-rotation";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => showTooltip(message)}
      onMouseLeave={() => hideTooltip()}
      className="relative"
    >
      {!autoRotate ? (
        <RefreshCcw
          className="transition-all duration-300 hover:scale-110 hover:opacity-30 cursor-pointer"
          size={50}
          strokeWidth={1.25}
        />
      ) : (
        <RefreshCwOff
          className="transition-all duration-300 hover:scale-110 hover:opacity-30 cursor-pointer"
          size={50}
          strokeWidth={1.25}
        />
      )}
    </div>
  );
};

export default RotationButton;
