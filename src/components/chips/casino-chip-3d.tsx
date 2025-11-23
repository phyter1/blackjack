"use client";

import { CasinoChip } from "./casino-chip";

interface CasinoChip3DProps {
  chipBodyColor: string;
  centerCircleColor: string;
  edgeMarkColor: string;
  denomination?: string | number;
  denominationColor?: string;
  denominationSize?: number;
  circularText?: string;
  circularTextColor?: string;
  circularTextSize?: number;
  circularTextRadius?: number;
  className?: string;
  animated?: boolean;
  scale?: number;
}

export function CasinoChip3D({
  chipBodyColor,
  centerCircleColor,
  edgeMarkColor,
  denomination,
  denominationColor,
  denominationSize,
  circularText,
  circularTextColor,
  circularTextSize,
  circularTextRadius,
  className = "",
  animated = true,
  scale = 1,
}: CasinoChip3DProps) {
  return (
    <div
      className={`casino-chip-3d`}
      style={{
        perspective: "1000px",
        display: "inline-block",
        transform: `scale(${scale})`,
      }}
    >
      <div
        className={`chip-container ${animated ? "chip-animated" : ""}`}
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s",
          cursor: "pointer",
        }}
      >
        {/* Chip depth layers - multiple circles stacked to create thickness */}
        {Array.from({ length: 20 }).map((_, i) => {
          const depth = -10 + i; // From -10px to 9px (20px total depth)
          const isEdgeMark = i % 3 === 0; // Every 3rd layer is edge mark color

          return (
            <div
              key={`depth-layer-${depth}`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "284px",
                height: "284px",
                borderRadius: "50%",
                transform: `translate(-50%, -50%) translateZ(${depth}px)`,
                background: isEdgeMark ? edgeMarkColor : chipBodyColor,
              }}
            />
          );
        })}

        {/* Front face */}
        <div
          className="chip-front"
          style={{
            position: "relative",
            transform: "translateZ(10px)",
            backfaceVisibility: "hidden",
          }}
        >
          <CasinoChip
            chipBodyColor={chipBodyColor}
            centerCircleColor={centerCircleColor}
            edgeMarkColor={edgeMarkColor}
            denomination={denomination}
            denominationColor={denominationColor}
            denominationSize={denominationSize}
            circularText={circularText}
            circularTextColor={circularTextColor}
            circularTextSize={circularTextSize}
            circularTextRadius={circularTextRadius}
          />
        </div>

        {/* Back face */}
        <div
          className="chip-back"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "rotateY(180deg) translateZ(10px)",
            backfaceVisibility: "hidden",
          }}
        >
          <CasinoChip
            chipBodyColor={chipBodyColor}
            centerCircleColor={centerCircleColor}
            edgeMarkColor={edgeMarkColor}
            denomination={denomination}
            denominationColor={denominationColor}
            denominationSize={denominationSize}
            circularText={circularText}
            circularTextColor={circularTextColor}
            circularTextSize={circularTextSize}
            circularTextRadius={circularTextRadius}
          />
        </div>

      </div>

      <style jsx>
        {`
        .chip-animated:hover {
          animation-play-state: paused;
        }

        .chip-animated {
          animation: edgeSpin 4s linear infinite;
        }

        @keyframes edgeSpin {
          0% {
            transform: rotateY(0deg) rotateX(0deg);
          }
          25% {
            transform: rotateY(90deg) rotateX(5deg);
          }
          50% {
            transform: rotateY(180deg) rotateX(0deg);
          }
          75% {
            transform: rotateY(270deg) rotateX(-5deg);
          }
          100% {
            transform: rotateY(360deg) rotateX(0deg);
          }
        }
      `}
      </style>
    </div>
  );
}
