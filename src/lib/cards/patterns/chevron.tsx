import React from "react";
import type { PatternComponentProps } from "../types";

export const ChevronPattern: React.FC<PatternComponentProps> = ({
  colors,
  stockColor,
}) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 225 315"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Chevron pattern */}
        <pattern
          id="chevron"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0 40 L 20 20 L 40 40 M 0 0 L 20 20 L 40 0"
            fill="none"
            stroke={colors.primary}
            strokeWidth="2"
            opacity="0.6"
          />
        </pattern>

        {/* Gradient overlay */}
        <linearGradient id="chevron-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.2" />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="225" height="315" fill={stockColor || colors.background} />

      {/* Gradient overlay */}
      <rect width="225" height="315" fill="url(#chevron-gradient)" />

      {/* Chevron pattern */}
      <rect width="225" height="315" fill="url(#chevron)" />

      {/* Border frame */}
      <rect
        x="10"
        y="10"
        width="205"
        height="295"
        fill="none"
        stroke={colors.border || colors.primary}
        strokeWidth="2"
        rx="8"
      />

      {/* Inner border */}
      <rect
        x="15"
        y="15"
        width="195"
        height="285"
        fill="none"
        stroke={colors.primary}
        strokeWidth="1"
        rx="6"
        opacity="0.5"
      />

      {/* Corner accents */}
      <g opacity="0.7">
        <rect x="20" y="20" width="15" height="15" fill={colors.primary} />
        <rect x="190" y="20" width="15" height="15" fill={colors.primary} />
        <rect x="20" y="280" width="15" height="15" fill={colors.primary} />
        <rect x="190" y="280" width="15" height="15" fill={colors.primary} />
      </g>
    </svg>
  );
};
