import React from "react";
import type { PatternComponentProps } from "../types";

export const SolidPattern: React.FC<PatternComponentProps> = ({
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
      {/* Solid background */}
      <rect width="225" height="315" fill={stockColor || colors.primary} rx="12" />

      {/* Optional subtle border */}
      <rect
        x="5"
        y="5"
        width="215"
        height="305"
        fill="none"
        stroke={colors.border || colors.secondary}
        strokeWidth="1"
        rx="10"
        opacity="0.3"
      />
    </svg>
  );
};
