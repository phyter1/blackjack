import React from "react";
import type { PatternComponentProps } from "../types";

export const ArtDecoSunburstPattern: React.FC<PatternComponentProps> = ({
  colors,
  stockColor,
}) => {
  const centerX = 112.5;
  const centerY = 157.5;
  const rays = 24;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 225 315"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Radial gradient for sunburst */}
        <radialGradient id="sunburst-gradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
          <stop offset="50%" stopColor={colors.primary} stopOpacity="0.4" />
          <stop offset="100%" stopColor={colors.background} stopOpacity="0" />
        </radialGradient>

        {/* Metallic effect gradient */}
        <linearGradient id="metallic" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.3" />
          <stop offset="50%" stopColor={colors.secondary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="225" height="315" fill={stockColor || colors.background} />

      {/* Sunburst rays */}
      <g opacity="0.9">
        {Array.from({ length: rays }).map((_, i) => {
          const angle = (i * 360) / rays;
          const rad = (angle * Math.PI) / 180;
          const x1 = centerX + Math.cos(rad) * 60;
          const y1 = centerY + Math.sin(rad) * 60;
          const x2 = centerX + Math.cos(rad) * 200;
          const y2 = centerY + Math.sin(rad) * 200;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 2 === 0 ? colors.primary : colors.secondary}
              strokeWidth={i % 2 === 0 ? "3" : "1.5"}
              opacity={i % 2 === 0 ? "0.6" : "0.4"}
            />
          );
        })}
      </g>

      {/* Radial gradient overlay */}
      <circle
        cx={centerX}
        cy={centerY}
        r="150"
        fill="url(#sunburst-gradient)"
      />

      {/* Central circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r="60"
        fill={colors.background}
        stroke={colors.primary}
        strokeWidth="3"
      />
      <circle
        cx={centerX}
        cy={centerY}
        r="50"
        fill="none"
        stroke={colors.secondary}
        strokeWidth="2"
        opacity="0.6"
      />
      <circle
        cx={centerX}
        cy={centerY}
        r="40"
        fill="none"
        stroke={colors.primary}
        strokeWidth="1"
      />

      {/* Art Deco geometric accents */}
      <g opacity="0.8">
        <rect
          x="95"
          y="140"
          width="35"
          height="35"
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
        />
        <rect
          x="100"
          y="145"
          width="25"
          height="25"
          fill={colors.secondary}
          opacity="0.3"
        />
      </g>

      {/* Corner Art Deco elements */}
      <g stroke={colors.primary} strokeWidth="2" fill="none" opacity="0.7">
        {/* Top left */}
        <path d="M 20 20 L 40 20 L 40 40" />
        <path d="M 25 25 L 35 25 L 35 35" strokeWidth="1" />

        {/* Top right */}
        <path d="M 205 20 L 185 20 L 185 40" />
        <path d="M 200 25 L 190 25 L 190 35" strokeWidth="1" />

        {/* Bottom left */}
        <path d="M 20 295 L 40 295 L 40 275" />
        <path d="M 25 290 L 35 290 L 35 280" strokeWidth="1" />

        {/* Bottom right */}
        <path d="M 205 295 L 185 295 L 185 275" />
        <path d="M 200 290 L 190 290 L 190 280" strokeWidth="1" />
      </g>

      {/* Decorative border */}
      <rect
        x="10"
        y="10"
        width="205"
        height="295"
        fill="none"
        stroke={colors.border || colors.primary}
        strokeWidth="3"
        rx="8"
      />
    </svg>
  );
};
