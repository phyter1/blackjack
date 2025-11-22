import React from "react";
import { PlayingCardProps } from "./types";
import { CardBack } from "./card-back";
import {
  DEFAULT_BORDER_RADIUS,
  DEFAULT_CARD_HEIGHT,
  DEFAULT_CARD_WIDTH,
} from "./constants";

/**
 * PlayingCard component - renders a playing card (front or back)
 *
 * For now, this primarily renders card backs. Card front rendering can be
 * integrated with cardmeister or other libraries, or implemented separately.
 */
export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  width = DEFAULT_CARD_WIDTH,
  height = DEFAULT_CARD_HEIGHT,
  borderRadius = DEFAULT_BORDER_RADIUS,
  backDesign = "bicycle-classic",
  backColors,
  className,
  style,
  onClick,
}) => {
  const containerStyle: React.CSSProperties = {
    display: "inline-block",
    cursor: onClick ? "pointer" : "default",
    ...style,
  };

  // For now, we only render card backs
  // TODO: Integrate card front rendering (e.g., with cardmeister)
  if (card === "back") {
    return (
      <div className={className} style={containerStyle} onClick={onClick}>
        <CardBack
          design={backDesign}
          colors={backColors}
          width={width}
          height={height}
          borderRadius={borderRadius}
        />
      </div>
    );
  }

  // Placeholder for card front rendering
  return (
    <div
      className={className}
      style={{
        ...containerStyle,
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
        border: "2px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
      onClick={onClick}
    >
      <div style={{ fontSize: "24px", fontWeight: "bold" }}>{card}</div>
      <div style={{ fontSize: "12px", marginTop: "8px", color: "#666" }}>
        (Card front rendering to be implemented)
      </div>
    </div>
  );
};
