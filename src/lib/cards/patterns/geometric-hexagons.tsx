import React from "react";
import type { PatternComponentProps } from "../types";

export const GeometricHexagonsPattern: React.FC<PatternComponentProps> = ({
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
        {/* Hexagon pattern */}
        <pattern
          id="hexagons"
          x="0"
          y="0"
          width="52"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 26 5 L 48 17.5 L 48 42.5 L 26 55 L 4 42.5 L 4 17.5 Z"
            fill="none"
            stroke={colors.primary}
            strokeWidth="2"
            opacity="0.7"
          />
          <circle cx="26" cy="30" r="3" fill={colors.primary} opacity="0.5" />
        </pattern>

        {/* Gradient for depth */}
        <linearGradient id="hex-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="225" height="315" fill={stockColor || colors.background} />

      {/* Gradient overlay */}
      <rect width="225" height="315" fill="url(#hex-gradient)" />

      {/* Hexagon pattern */}
      <rect width="225" height="315" fill="url(#hexagons)" />

      {/* Border */}
      <rect
        x="5"
        y="5"
        width="215"
        height="305"
        fill="none"
        stroke={colors.border || colors.primary}
        strokeWidth="2"
        rx="8"
      />

      {/* Inner border with geometric accent */}
      <rect
        x="12"
        y="12"
        width="201"
        height="291"
        fill="none"
        stroke={colors.primary}
        strokeWidth="1"
        strokeDasharray="4 4"
        rx="6"
        opacity="0.5"
      />

      {/* Corner decorations */}
      <g opacity="0.8">
        <polygon points="15,15 30,15 15,30" fill={colors.primary} />
        <polygon points="210,15 195,15 210,30" fill={colors.primary} />
        <polygon points="15,300 30,300 15,285" fill={colors.primary} />
        <polygon points="210,300 195,300 210,285" fill={colors.primary} />
      </g>
    </svg>
  );
};
