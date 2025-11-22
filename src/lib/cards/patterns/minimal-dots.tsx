import React from "react";
import type { PatternComponentProps } from "../types";

export const MinimalDotsPattern: React.FC<PatternComponentProps> = ({
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
        {/* Dot pattern */}
        <pattern
          id="dots"
          x="0"
          y="0"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="15" cy="15" r="2" fill={colors.primary} opacity="0.3" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="225" height="315" fill={stockColor || colors.background} />

      {/* Dot pattern */}
      <rect width="225" height="315" fill="url(#dots)" />

      {/* Simple border */}
      <rect
        x="15"
        y="15"
        width="195"
        height="285"
        fill="none"
        stroke={colors.primary}
        strokeWidth="1"
        rx="8"
        opacity="0.5"
      />

      {/* Center minimal logo/mark */}
      <g opacity="0.6">
        <circle
          cx="112.5"
          cy="157.5"
          r="30"
          fill="none"
          stroke={colors.primary}
          strokeWidth="1"
        />
        <circle
          cx="112.5"
          cy="157.5"
          r="25"
          fill="none"
          stroke={colors.primary}
          strokeWidth="0.5"
        />
        <circle cx="112.5" cy="157.5" r="3" fill={colors.primary} />
      </g>
    </svg>
  );
};
