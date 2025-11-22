"use client";

import { useEffect, useState } from "react";
import { CardBack, type CardBackDesign } from "@/lib/cards";

interface MiniCardBackProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MiniCardBack - Shows the actual selected card back design at tiny size
 * Reads theme CSS variables and renders the CardBack component
 * Uses proper card aspect ratio scaled down to fit container
 */
export function MiniCardBack({ className, style }: MiniCardBackProps) {
  const [colors, setColors] = useState({
    primary: "#991B1B",
    secondary: "#fbbf24",
    background: "#7c2d12",
    border: "#78350f",
  });
  const [design, setDesign] = useState<CardBackDesign>("bicycle-classic");
  const [stockColor, setStockColor] = useState("#1a1a1a");

  useEffect(() => {
    const updateFromTheme = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      setColors({
        primary:
          computedStyle
            .getPropertyValue("--theme-card-back-gradient-middle")
            .trim() || "#991B1B",
        secondary:
          computedStyle.getPropertyValue("--theme-card-back-pattern").trim() ||
          "#fbbf24",
        background:
          computedStyle
            .getPropertyValue("--theme-card-back-gradient-start")
            .trim() || "#7c2d12",
        border:
          computedStyle.getPropertyValue("--theme-card-back-border").trim() ||
          "#78350f",
      });

      setStockColor(
        computedStyle.getPropertyValue("--theme-card-stock").trim() ||
          "#1a1a1a",
      );

      const themeDesign = computedStyle
        .getPropertyValue("--theme-card-back-design")
        .trim();
      if (themeDesign) {
        setDesign(themeDesign as CardBackDesign);
      }
    };

    // Initial update
    updateFromTheme();

    // Listen for theme changes
    const observer = new MutationObserver(updateFromTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={className}
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: "2px", // Add gap between cards
      }}
    >
      <div
        style={{
          width: "56px",
          height: "17px",
          borderRadius: "2px",
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
        }}
      >
        <CardBack
          design={design}
          colors={colors}
          stockColor={stockColor}
          width={56}
          height={17}
          borderRadius={0}
        />
      </div>
    </div>
  );
}
