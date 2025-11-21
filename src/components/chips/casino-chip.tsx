interface CasinoChipProps {
  chipBodyColor: string;
  centerCircleColor: string;
  edgeMarkColor: string;
  denomination?: string | number;
  denominationColor?: string;
  denominationSize?: number;
  className?: string;
}

export function CasinoChip({
  chipBodyColor,
  centerCircleColor,
  edgeMarkColor,
  denomination,
  denominationColor = "#000000",
  denominationSize = 128,
  className = "",
}: CasinoChipProps) {
  return (
    <svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>Casino Chip</title>
      {/* Main chip body (outer circle) */}
      <g id="body">
        <circle cx="150" cy="150" r="142" fill={chipBodyColor} />
      </g>

      {/* Edge marks (rectangular dashes) - 12 total offset by 15 degrees to sit between suit symbols */}
      <g id="marks">
        <rect
          x="143"
          y="8"
          width="14"
          height="32"
          rx="2"
          transform="rotate(15 150 150)"
          fill={edgeMarkColor}
        />
        <rect
          x="143"
          y="8"
          width="14"
          height="32"
          rx="2"
          transform="rotate(45 150 150)"
          fill={edgeMarkColor}
        />
        <rect
          x="143"
          y="8"
          width="14"
          height="32"
          rx="2"
          transform="rotate(75 150 150)"
          fill={edgeMarkColor}
        />
        <rect
          x="143"
          y="8"
          width="14"
          height="32"
          rx="2"
          transform="rotate(105 150 150)"
          fill={edgeMarkColor}
        />
        <rect
          x="143"
          y="8"
          width="14"
          height="32"
          rx="2"
          transform="rotate(135 150 150)"
          fill={edgeMarkColor}
        />
        <rect
          x="143"
          y="8"
          width="14"
          height="32"
          rx="2"
          transform="rotate(165 150 150)"
          fill={edgeMarkColor}
        />
        <rect
          x="143"
          y="8"
          width="14"
          height="32"
          rx="2"
          transform="rotate(195 150 150)"
          fill={edgeMarkColor}
        />
        <rect
          x="143"
          y="8"
          width="14"
          height="32"
          rx="2"
          transform="rotate(225 150 150)"
          fill={edgeMarkColor}
        />
        <rect
          x="143"
          y="8"
          width="14"
          height="32"
          rx="2"
          transform="rotate(255 150 150)"
          fill={edgeMarkColor}
        />
        <rect
          x="143"
          y="8"
          width="14"
          height="32"
          rx="2"
          transform="rotate(285 150 150)"
          fill={edgeMarkColor}
        />
        <rect
          x="143"
          y="8"
          width="14"
          height="32"
          rx="2"
          transform="rotate(315 150 150)"
          fill={edgeMarkColor}
        />
        <rect
          x="143"
          y="8"
          width="14"
          height="32"
          rx="2"
          transform="rotate(345 150 150)"
          fill={edgeMarkColor}
        />
      </g>

      {/* Suit symbols - 12 symbols evenly distributed (3 of each suit) at 30-degree intervals */}
      <g id="suits">
        {/* 12 o'clock - Spade (0 degrees) */}
        <text
          x="150"
          y="58"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
          transform="rotate(0 150 58)"
        >
          ♠
        </text>

        {/* 1 o'clock - Heart (30 degrees) */}
        <text
          x="197.5"
          y="75"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
          transform="rotate(30 197.5 75)"
        >
          ♥
        </text>

        {/* 2 o'clock - Diamond (60 degrees) */}
        <text
          x="231.5"
          y="108.5"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
          transform="rotate(60 231.5 108.5)"
        >
          ♦
        </text>

        {/* 3 o'clock - Club (90 degrees) */}
        <text
          x="243"
          y="152"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
          transform="rotate(90 244 152)"
        >
          ♣
        </text>

        {/* 4 o'clock - Spade (120 degrees) */}
        <text
          x="231.5"
          y="191.5"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
          transform="rotate(120 231.5 191.5)"
        >
          ♠
        </text>

        {/* 5 o'clock - Heart (150 degrees) */}
        <text
          x="197.5"
          y="225"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
          transform="rotate(150 197.5 225)"
        >
          ♥
        </text>

        {/* 6 o'clock - Diamond (180 degrees) */}
        <text
          x="150"
          y="246"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
          transform="rotate(180 150 244)"
        >
          ♦
        </text>

        {/* 7 o'clock - Club (210 degrees) */}
        <text
          x="102.5"
          y="225"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
          transform="rotate(210 102.5 225)"
        >
          ♣
        </text>

        {/* 8 o'clock - Spade (240 degrees) */}
        <text
          x="68.5"
          y="191.5"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
          transform="rotate(240 68.5 191.5)"
        >
          ♠
        </text>

        {/* 9 o'clock - Heart (270 degrees) */}
        <text
          x="60"
          y="152"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
          transform="rotate(270 58 152)"
        >
          ♥
        </text>

        {/* 10 o'clock - Diamond (300 degrees) */}
        <text
          x="68.5"
          y="108.5"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
          transform="rotate(300 68.5 108.5)"
        >
          ♦
        </text>

        {/* 11 o'clock - Club (330 degrees) */}
        <text
          x="102.5"
          y="75"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
          transform="rotate(330 102.5 75)"
        >
          ♣
        </text>
      </g>

      {/* Center circle */}
      <g id="center">
        <circle cx="150" cy="150" r="75" fill={centerCircleColor} />
      </g>

      {/* Denomination text (optional) */}
      {denomination && (
        <text
          x="150"
          y="155"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "48px", //`${denominationSize}px`,
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
