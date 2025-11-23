interface CasinoChipProps {
  chipBodyColor: string;
  centerCircleColor: string;
  edgeMarkColor: string;
  suitColor: string;
  denomination?: string | number;
  denominationColor?: string;
  denominationSize?: number;
  circularText?: string;
  circularTextColor?: string;
  circularTextSize?: number;
  circularTextRadius?: number;
  className?: string;
}

const SUITS = ["♠", "♥", "♦", "♣"];
const CENTER = 150;
const RADIUS = 92;

export function CasinoChip({
  chipBodyColor,
  centerCircleColor,
  edgeMarkColor,
  suitColor = "#FFFFFF",
  denomination,
  denominationColor = "#000000",
  denominationSize = 128,
  circularText,
  circularTextColor = "#FFFFFF",
  circularTextSize = 16,
  circularTextRadius = 60,
  className = "",
}: CasinoChipProps) {
  const edgeMarks = Array.from({ length: 12 }, (_, i) => i * 30 + 15);
  const suitSymbols = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30;
    const radians = (angle * Math.PI) / 180;
    const x = CENTER + RADIUS * Math.sin(radians);
    const y = CENTER - RADIUS * Math.cos(radians);
    const suit = SUITS[i % 4];
    return { angle, x, y, suit };
  });

  return (
    <svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>Casino Chip</title>

      {/* Main chip body */}
      <circle cx={CENTER} cy={CENTER} r="142" fill={chipBodyColor} />

      {/* Edge marks - offset by 15 degrees to sit between suit symbols */}
      <g id="marks">
        {edgeMarks.map((angle) => (
          <rect
            key={angle}
            x="143"
            y="8"
            width="14"
            height="32"
            rx="2"
            transform={`rotate(${angle} ${CENTER} ${CENTER})`}
            fill={edgeMarkColor}
          />
        ))}
      </g>

      {/* Suit symbols - 12 symbols evenly distributed at 30-degree intervals */}
      <g id="suits">
        {suitSymbols.map(({ angle, x, y, suit }) => (
          <text
            key={angle}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={suitColor}
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "2.5rem",
              fontWeight: "bold",
            }}
            transform={`rotate(${angle} ${x} ${y})`}
          >
            {suit}
          </text>
        ))}
      </g>

      {/* Center circle */}
      <circle cx={CENTER} cy={CENTER} r="75" fill={centerCircleColor} />

      {/* Circular text paths */}
      {circularText && (
        <defs>
          {/* Left side path - from bottom to top */}
          <path
            id="circlePathLeft"
            d={`M ${CENTER},${
              CENTER + circularTextRadius
            } a ${circularTextRadius},${circularTextRadius} 0 0,1 0,-${
              circularTextRadius * 2
            }`}
          />
          {/* Right side path - from top to bottom */}
          <path
            id="circlePathRight"
            d={`M ${CENTER},${
              CENTER - circularTextRadius
            } a ${circularTextRadius},${circularTextRadius} 0 0,1 0,${
              circularTextRadius * 2
            }`}
          />
        </defs>
      )}

      {/* Circular text - left side */}
      {circularText && (
        <text
          fill={circularTextColor}
          // className={mrsSaintDelafield.className}
          style={{
            fontSize: `${circularTextSize}px`,
            fontWeight: "normal",
            letterSpacing: "3px",
            fontFamily: "Arial, sans-serif",
          }}
          transform={`rotate(40 ${CENTER} ${CENTER})`}
        >
          <textPath
            href="#circlePathLeft"
            startOffset="50%"
            textAnchor="middle"
          >
            {circularText}
          </textPath>
        </text>
      )}

      {/* Circular text - right side (mirrored) */}
      {circularText && (
        <text
          fill={circularTextColor}
          // className={mrsSaintDelafield.className}
          style={{
            fontSize: `${circularTextSize}px`,
            fontWeight: "normal",
            letterSpacing: "3px",
            fontFamily: "Arial, sans-serif",
          }}
          transform={`rotate(40 ${CENTER} ${CENTER})`}
        >
          <textPath
            href="#circlePathRight"
            startOffset="50%"
            textAnchor="middle"
          >
            {circularText}
          </textPath>
        </text>
      )}

      {/* Denomination text */}
      {denomination && (
        <text
          x={CENTER}
          y="155"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: `${denominationSize}px`,
            fontWeight: "bold",
            fill: denominationColor,
          }}
        >
          {denomination}
        </text>
      )}
    </svg>
  );
}
