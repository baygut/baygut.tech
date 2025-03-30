import React from "react";

type ProgressCircleProps = {
  value: number; // Expected range: 0 to 1
};

const ProgressCircle: React.FC<ProgressCircleProps> = ({ value }) => {
  const circumference = 1400;
  const dashArray = value * circumference;
  const percentText = `${Math.round(value * 100)}%`;

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Background circle */}
        <circle
          cx="400"
          cy="400"
          r="239"
          fill="none"
          strokeWidth="135"
          stroke="#E387FF"
          opacity="0.3"
        />

        {/* Progress circle */}
        <circle
          cx="400"
          cy="400"
          r="239"
          fill="none"
          strokeWidth="135"
          stroke="#E387FF"
          strokeDasharray={`${dashArray} ${circumference}`}
          transform="rotate(-90 400 400)"
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />

        {/* Center */}
        <circle
          cx="400"
          cy="400"
          r="150"
          fill="#200833"
          className="transition-all duration-300"
          opacity={0.8 + value * 0.2}
        />

        {/* Text */}
        <text
          x="400"
          y="415"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="100"
          fontWeight="bold"
          className="transition-all duration-300"
        >
          {percentText}
        </text>
      </svg>
    </div>
  );
};

export default ProgressCircle;
