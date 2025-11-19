import type { Card as CardType } from "@/modules/game/cards";
import { cn } from "@/lib/utils";

interface CardProps {
  card: CardType;
  hidden?: boolean;
  className?: string;
}

const suitSymbols = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors = {
  hearts: "text-red-600",
  diamonds: "text-red-600",
  clubs: "text-black",
  spades: "text-black",
};

export function Card({ card, hidden = false, className }: CardProps) {
  if (hidden) {
    return (
      <div
        className={cn(
          "relative h-32 w-24 rounded-lg border-2 border-gray-300",
          "bg-linear-to-br from-blue-600 to-blue-800",
          "shadow-lg",
          "flex items-center justify-center",
          className,
        )}
      >
        <div className="text-4xl text-white/20">🂠</div>
      </div>
    );
  }

  const symbol = suitSymbols[card.suit];
  const colorClass = suitColors[card.suit];
  const displayRank = card.rank;

  return (
    <div
      className={cn(
        "relative h-68 w-48 rounded-lg border-2 border-gray-300 bg-white shadow-lg",
        "flex flex-col justify-between p-2",
        "transition-transform hover:scale-105",
        className,
      )}
    >
      {/* Top left corner */}

      <div className={cn("flex flex-col items-start leading-none", colorClass)}>
        <div
          className={cn("flex flex-col items-center leading-none ", colorClass)}
        >
          <span className="text-6xl font-bold">{displayRank}</span>
          <span className="text-4xl">{symbol}</span>
        </div>
      </div>

      <div className={cn("text-5xl self-center", colorClass)}>{symbol}</div>

      {/* Bottom right corner (upside down) */}
      <div
        className={cn(
          "flex flex-col items-start leading-none rotate-180",
          colorClass,
        )}
      >
        <div className={cn("flex flex-col items-end leading-none", colorClass)}>
          <span className="text-6xl font-bold">{displayRank}</span>
          <span className="text-4xl">{symbol}</span>
        </div>
      </div>
    </div>
  );
}
