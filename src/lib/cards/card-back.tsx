import React from "react";
import type { CardBackColors, CardBackDesign, CardBackProps } from "./types";
import {
  DEFAULT_BACK_COLORS,
  DEFAULT_BORDER_RADIUS,
  DEFAULT_CARD_HEIGHT,
  DEFAULT_CARD_WIDTH,
} from "./constants";
import {
  ArtDecoSunburstPattern,
  BicycleClassicPattern,
  ChevronPattern,
  GeometricHexagonsPattern,
  MinimalDotsPattern,
  SolidPattern,
  SVGPattern,
} from "./patterns";

/**
 * CardBack component - renders a customizable playing card back
 */
export const CardBack: React.FC<CardBackProps> = ({
  design = "bicycle-classic",
  colors,
  stockColor,
  width = DEFAULT_CARD_WIDTH,
  height = DEFAULT_CARD_HEIGHT,
  borderRadius = DEFAULT_BORDER_RADIUS,
}) => {
  // Merge provided colors with defaults for the selected design
  const defaultColors =
    DEFAULT_BACK_COLORS[design] || DEFAULT_BACK_COLORS["bicycle-classic"];
  const finalColors = { ...defaultColors, ...colors };

  // Select the appropriate pattern component
  const PatternComponent = getPatternComponent(design);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
        overflow: "hidden",
        display: "inline-block",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      <PatternComponent colors={finalColors} stockColor={stockColor} />
    </div>
  );
};

/**
 * Helper function to get the pattern component for a given design
 */
function getPatternComponent(design: CardBackDesign) {
  switch (design) {
    case "bicycle-classic":
      return BicycleClassicPattern;
    case "geometric-hexagons":
      return GeometricHexagonsPattern;
    case "geometric-diamonds":
      // For now, use hexagons - we can add more patterns later
      return GeometricHexagonsPattern;
    case "art-deco-sunburst":
      return ArtDecoSunburstPattern;
    case "victorian-arabesque":
      // For now, use bicycle classic - we can add more patterns later
      return BicycleClassicPattern;
    case "minimal-dots":
      return MinimalDotsPattern;
    case "chevron":
      return ChevronPattern;
    case "solid":
      return SolidPattern;
    case "svg-01":
    case "svg-02":
    case "svg-03":
    case "svg-05":
    case "svg-06":
    case "svg-10":
    case "svg-11":
    case "svg-12":
      // Return a wrapper component that passes the SVG number
      return (props: { colors: CardBackColors }) => (
        <SVGPattern {...props} svgNumber={design.replace("svg-", "")} />
      );
    default:
      return BicycleClassicPattern;
  }
}
