import type { Card } from "@/modules/game/cards";
import type { Hand } from "@/modules/game/hand";
import type { DealerHand } from "@/modules/game/dealer-hand";

export type TerminalColor =
  | "white"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "gray";

export interface TerminalSegment {
  text: string;
  color?: TerminalColor;
  bold?: boolean;
}

export type TerminalLine = TerminalSegment[];

// Card suits in Unicode
const SUITS = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
} as const;

// Create a colored segment
function colored(
  text: string,
  color?: TerminalColor,
  bold = false,
): TerminalSegment {
  return { text, color, bold };
}

// Display a single card
export function displayCard(card: Card, hidden = false): TerminalLine[] {
  if (hidden) {
    return [
      [colored("┌─────┐", "blue")],
      [colored("│░░░░░│", "blue")],
      [colored("│░░░░░│", "blue")],
      [colored("│░░░░░│", "blue")],
      [colored("└─────┘", "blue")],
    ];
  }

  const value = card.rank;
  const suit = SUITS[card.suit];
  const suitColor =
    card.suit === "hearts" || card.suit === "diamonds" ? "red" : "white";
  const padding = value.length === 1 ? " " : "";

  return [
    [colored("┌─────┐", "white")],
    [colored(`│${value}${padding}   │`, "white")],
    [
      colored("│  ", "white"),
      colored(suit, suitColor),
      colored("  │", "white"),
    ],
    [colored(`│   ${padding}${value}│`, "white")],
    [colored("└─────┘", "white")],
  ];
}

// Display multiple cards side by side
export function displayCards(
  cards: Card[],
  hideSecond = false,
): TerminalLine[] {
  if (cards.length === 0) {
    return [[colored("No cards")]];
  }

  const cardLines: TerminalLine[][] = cards.map((card, index) =>
    displayCard(card, hideSecond && index === 1),
  );

  // Combine cards side by side
  const lines: TerminalLine[] = [];
  for (let i = 0; i < 5; i++) {
    const line: TerminalSegment[] = [];
    for (let j = 0; j < cardLines.length; j++) {
      line.push(...cardLines[j][i]);
      if (j < cardLines.length - 1) {
        line.push(colored(" "));
      }
    }
    lines.push(line);
  }

  return lines;
}

// Check if hand has soft ace
function isSoftHand(hand: Hand): boolean {
  const hasAce = hand.cards.some((card) => card.rank === "A");
  if (!hasAce) return false;

  // Calculate value treating all aces as 1
  let hardValue = 0;
  for (const card of hand.cards) {
    if (["J", "Q", "K"].includes(card.rank)) {
      hardValue += 10;
    } else if (card.rank === "A") {
      hardValue += 1;
    } else {
      hardValue += parseInt(card.rank, 10);
    }
  }

  // If we can add 10 (treating one ace as 11) without busting, it's soft
  return hardValue + 10 === hand.handValue && hand.handValue <= 21;
}

// Display a player hand
export function displayPlayerHand(hand: Hand, label: string): TerminalLine[] {
  const output: TerminalLine[] = [];
  output.push([colored(`\n${label}'s Hand:`, "cyan", true)]);
  output.push(...displayCards(hand.cards));
  const soft = isSoftHand(hand);
  output.push([
    colored(
      `Value: ${hand.handValue}${soft ? " (soft)" : ""}  State: ${hand.state}`,
      "yellow",
    ),
  ]);
  return output;
}

// Check if dealer hand has soft ace
function isSoftDealerHand(dealerHand: DealerHand): boolean {
  const hasAce = dealerHand.cards.some((card) => card.rank === "A");
  if (!hasAce) return false;

  // Calculate value treating all aces as 1
  let hardValue = 0;
  for (const card of dealerHand.cards) {
    if (["J", "Q", "K"].includes(card.rank)) {
      hardValue += 10;
    } else if (card.rank === "A") {
      hardValue += 1;
    } else {
      hardValue += parseInt(card.rank, 10);
    }
  }

  // If we can add 10 (treating one ace as 11) without busting, it's soft
  return hardValue + 10 === dealerHand.handValue && dealerHand.handValue <= 21;
}

// Display dealer hand
export function displayDealerHand(
  dealerHand: DealerHand,
  hideHoleCard = true,
): TerminalLine[] {
  const output: TerminalLine[] = [];
  output.push([colored("\nDealer's Hand:", "magenta", true)]);
  output.push(...displayCards(dealerHand.cards, hideHoleCard));

  if (!hideHoleCard) {
    const soft = isSoftDealerHand(dealerHand);
    output.push([
      colored(
        `Value: ${dealerHand.handValue}${soft ? " (soft)" : ""}`,
        "yellow",
      ),
    ]);
  }

  return output;
}

// Display game header
export function displayHeader(
  balance: number,
  roundNumber: number,
  currentBet?: number,
): TerminalLine[] {
  const output: TerminalLine[] = [];
  output.push([colored("═".repeat(60), "green", true)]);
  output.push([
    colored(
      "                    🃏 BLACKJACK 🃏                    ",
      "green",
      true,
    ),
  ]);
  output.push([colored("═".repeat(60), "green", true)]);
  output.push([
    colored("Balance: ", "white"),
    colored(`$${balance.toFixed(2)}`, "green"),
    colored("  |  Round: ", "white"),
    colored(`#${roundNumber}`, "cyan"),
    ...(currentBet
      ? [
          colored("  |  Current Bet: ", "white"),
          colored(`$${currentBet.toFixed(2)}`, "yellow"),
        ]
      : []),
  ]);
  output.push([colored("═".repeat(60), "green", true)]);
  return output;
}

// Display settlement result
export function displaySettlement(
  result: "win" | "loss" | "push" | "blackjack",
  payout: number,
): TerminalLine[] {
  const output: TerminalLine[] = [];
  output.push([colored("\n" + "═".repeat(60), "yellow", true)]);

  switch (result) {
    case "blackjack":
      output.push([colored("        🎉 BLACKJACK! 🎉        ", "green", true)]);
      output.push([
        colored(`        You win $${payout.toFixed(2)}!        `, "green"),
      ]);
      break;
    case "win":
      output.push([colored("        ✓ YOU WIN! ✓        ", "green", true)]);
      output.push([
        colored(`        Payout: $${payout.toFixed(2)}        `, "green"),
      ]);
      break;
    case "loss":
      output.push([colored("        ✗ YOU LOSE ✗        ", "red", true)]);
      output.push([
        colored(`        Lost: $${Math.abs(payout).toFixed(2)}        `, "red"),
      ]);
      break;
    case "push":
      output.push([colored("        ⚖ PUSH ⚖        ", "yellow", true)]);
      output.push([colored("        Bet returned        ", "yellow")]);
      break;
  }

  output.push([colored("═".repeat(60), "yellow", true)]);
  return output;
}

// Display error message
export function displayError(message: string): TerminalLine[] {
  return [[colored(`\n❌ Error: ${message}\n`, "red", true)]];
}

// Display welcome message
export function displayWelcome(): TerminalLine[] {
  const output: TerminalLine[] = [];
  output.push([colored("\n" + "═".repeat(60), "green", true)]);
  output.push([
    colored(
      "                    🃏 BLACKJACK 🃏                    ",
      "green",
      true,
    ),
  ]);
  output.push([colored("═".repeat(60), "green", true)]);
  output.push([colored("\nWelcome to the Blackjack Terminal!", "white")]);
  output.push([
    colored(
      "Rules: Get as close to 21 as possible without going over.",
      "gray",
    ),
  ]);
  output.push([colored("Dealer stands on 17. Blackjack pays 3:2.\n", "gray")]);
  return output;
}
