import React from "react";
import type { PatternComponentProps } from "../types";

export const BicycleClassicPattern: React.FC<PatternComponentProps> = ({
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
        {/* Ornate pattern definition */}
        <pattern
          id="bicycle-ornate"
          x="0"
          y="0"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="30"
            cy="30"
            r="20"
            fill="none"
            stroke={colors.primary}
            strokeWidth="2"
          />
          <circle
            cx="30"
            cy="30"
            r="15"
            fill="none"
            stroke={colors.primary}
            strokeWidth="1.5"
          />
          <circle
            cx="30"
            cy="30"
            r="10"
            fill="none"
            stroke={colors.primary}
            strokeWidth="1"
          />
          <path
            d="M 30 10 Q 35 20 30 30 Q 25 20 30 10 M 10 30 Q 20 35 30 30 Q 20 25 10 30 M 30 50 Q 35 40 30 30 Q 25 40 30 50 M 50 30 Q 40 35 30 30 Q 40 25 50 30"
            fill="none"
            stroke={colors.primary}
            strokeWidth="1.5"
          />
        </pattern>

        {/* Central medallion filter for depth */}
        <filter id="bicycle-shadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background - use stock color if provided, otherwise theme background */}
      <rect width="225" height="315" fill={stockColor || colors.background} />

      {/* Ornate pattern fill */}
      <rect
        x="10"
        y="10"
        width="205"
        height="295"
        fill="url(#bicycle-ornate)"
        opacity="0.4"
      />

      {/* Decorative border */}
      <rect
        x="10"
        y="10"
        width="205"
        height="295"
        fill="none"
        stroke={colors.primary}
        strokeWidth="3"
        rx="8"
      />
      <rect
        x="15"
        y="15"
        width="195"
        height="285"
        fill="none"
        stroke={colors.primary}
        strokeWidth="1"
        rx="6"
      />

      {/* Central medallion */}
      <g filter="url(#bicycle-shadow)">
        <ellipse
          cx="112.5"
          cy="157.5"
          rx="50"
          ry="70"
          fill={colors.secondary}
          stroke={colors.primary}
          strokeWidth="2"
        />

        {/* Ornate details in medallion */}
        <path
          d="M 112.5 100 Q 125 130 112.5 157.5 Q 100 130 112.5 100"
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
        />
        <path
          d="M 112.5 215 Q 125 185 112.5 157.5 Q 100 185 112.5 215"
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
        />
        <circle
          cx="112.5"
          cy="157.5"
          r="30"
          fill="none"
          stroke={colors.primary}
          strokeWidth="1.5"
        />
        <circle
          cx="112.5"
          cy="157.5"
          r="20"
          fill="none"
          stroke={colors.primary}
          strokeWidth="1"
        />
      </g>

      {/* Corner flourishes */}
      <g>
        <path d="M 25 25 Q 30 30 25 35 Q 20 30 25 25" fill={colors.primary} />
        <path
          d="M 200 25 Q 195 30 200 35 Q 205 30 200 25"
          fill={colors.primary}
        />
        <path
          d="M 25 290 Q 30 285 25 280 Q 20 285 25 290"
          fill={colors.primary}
        />
        <path
          d="M 200 290 Q 195 285 200 280 Q 205 285 200 290"
          fill={colors.primary}
        />
      </g>
    </svg>
  );
};
