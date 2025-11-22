import React from "react";
import type { PatternComponentProps } from "../types";

interface SVGPatternProps extends PatternComponentProps {
  svgNumber: string;
}

/**
 * SVGPattern - Renders external SVG card back designs
 * Uses the SVG files from /public/card_back_*.svg
 */
export function SVGPattern({ stockColor, svgNumber }: SVGPatternProps) {
  return (
    <svg
      viewBox="0 0 167.07959 242.66504"
      preserveAspectRatio="none"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {/* Stock color background - replaces white in SVG */}
      {stockColor && (
        <rect
          x="0"
          y="0"
          width="167.07959"
          height="242.66504"
          fill={stockColor}
        />
      )}
      <image
        href={`/card_back_${svgNumber}.svg`}
        width="167.07959"
        height="242.66504"
        preserveAspectRatio="none"
        style={{ mixBlendMode: "multiply" }}
      />
    </svg>
  );
}
