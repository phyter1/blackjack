import { cn } from "@/lib/utils";
import type { Card as CardType } from "@/modules/game/cards";
import { Card } from "./card";
import { Badge } from "./ui/badge";

interface HandDisplayProps {
  cards: CardType[];
  hideFirstCard?: boolean;
  value?: number;
  label?: string;
  isSoft?: boolean;
  state?:
    | "active"
    | "busted"
    | "stood"
    | "blackjack"
    | "surrendered"
    | "won"
    | "lost"
    | "pushed";
  betAmount?: number;
  className?: string;
}

export function HandDisplay({
  cards,
  hideFirstCard = false,
  value,
  label,
  isSoft,
  state,
  betAmount,
  className,
}: HandDisplayProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Label and value */}
      {label && (
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{label}</h3>
          {value !== undefined && (
            <Badge variant={state === "busted" ? "destructive" : "secondary"}>
              {isSoft && value <= 21 ? "Soft " : ""}
              {value}
            </Badge>
          )}
          {state === "blackjack" && (
            <Badge className="bg-green-600">Blackjack!</Badge>
          )}
          {state === "surrendered" && (
            <Badge variant="outline">Surrendered</Badge>
          )}
          {betAmount !== undefined && (
            <Badge variant="outline">${betAmount}</Badge>
          )}
        </div>
      )}

      {/* Cards */}
      <div className="flex gap-2">
        {cards?.map((card, index) => (
          <Card
            key={`${card.suit}-${card.rank}-${index}`}
            card={card}
            hidden={index === 1 && hideFirstCard}
            className="transition-all duration-300 ease-in-out"
            // style={{
            //   transform: `translateX(${index * -8}px)`,
            //   zIndex: index,
            // }}
          />
        ))}
      </div>
    </div>
  );
}
