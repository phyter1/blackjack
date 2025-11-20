import chalk from "chalk";
import type { Card } from "@/modules/game/cards";
import type { DealerHand } from "@/modules/game/dealer-hand";
import type { Hand } from "@/modules/game/hand";

// Card suits in Unicode (lowercase to match Card type)
const SUITS = {
  hearts: chalk.red("♥"),
  diamonds: chalk.red("♦"),
  clubs: chalk.white("♣"),
  spades: chalk.white("♠"),
} as const;

// Display a single card
export function displayCard(card: Card, hidden = false): string[] {
  if (hidden) {
    return [
      chalk.blue("┌─────┐"),
      chalk.blue("│░░░░░│"),
      chalk.blue("│░░░░░│"),
      chalk.blue("│░░░░░│"),
      chalk.blue("└─────┘"),
    ];
  }

  const value = card.rank;
  const suit = SUITS[card.suit];
  const padding = value.length === 1 ? " " : "";

  return [
    chalk.white("┌─────┐"),
    chalk.white(`│${value}${padding}   │`),
    chalk.white(`│  ${suit}  │`),
    chalk.white(`│   ${padding}${value}│`),
    chalk.white("└─────┘"),
  ];
}

// Display multiple cards side by side
export function displayCards(cards: Card[], hideSecond = false): string {
  if (cards.length === 0) {
    return "No cards";
  }

  const cardLines: string[][] = cards.map((card, index) =>
    displayCard(card, hideSecond && index === 1),
  );

  // Combine cards side by side
  const lines: string[] = [];
  for (let i = 0; i < 5; i++) {
    lines.push(cardLines.map((card) => card[i]).join(" "));
  }

  return lines.join("\n");
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
export function displayPlayerHand(hand: Hand, label: string): string {
  const output: string[] = [];
  output.push(chalk.cyan.bold(`\n${label}'s Hand:`));
  output.push(displayCards(hand.cards));
  const soft = isSoftHand(hand);
  output.push(
    chalk.yellow(
      `Value: ${hand.handValue}${soft ? " (soft)" : ""}  State: ${hand.state}`,
    ),
  );
  return output.join("\n");
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
): string {
  const output: string[] = [];
  output.push(chalk.magenta.bold("\nDealer's Hand:"));
  output.push(displayCards(dealerHand.cards, hideHoleCard)); // hideHoleCard controls hiding the second card

  if (!hideHoleCard) {
    const soft = isSoftDealerHand(dealerHand);
    output.push(
      chalk.yellow(`Value: ${dealerHand.handValue}${soft ? " (soft)" : ""}`),
    );
  }

  return output.join("\n");
}

// Display game header
export function displayHeader(
  balance: number,
  roundNumber: number,
  currentBet?: number,
): void {
  console.clear();
  console.log(chalk.green.bold("═".repeat(60)));
  console.log(
    chalk.green.bold("                    🃏 BLACKJACK 🃏                    "),
  );
  console.log(chalk.green.bold("═".repeat(60)));
  console.log(
    chalk.white(
      `Balance: ${chalk.green(`$${balance.toFixed(2)}`)}  |  Round: ${chalk.cyan(`#${roundNumber}`)}${currentBet ? `  |  Current Bet: ${chalk.yellow(`$${currentBet.toFixed(2)}`)}` : ""}`,
    ),
  );
  console.log(chalk.green.bold("═".repeat(60)));
}

// Display settlement result
export function displaySettlement(
  result: "win" | "loss" | "push" | "blackjack",
  payout: number,
): void {
  console.log(`\n${chalk.yellow.bold("═".repeat(60))}`);

  switch (result) {
    case "blackjack":
      console.log(chalk.green.bold("        🎉 BLACKJACK! 🎉        "));
      console.log(
        chalk.green(`        You win $${payout.toFixed(2)}!        `),
      );
      break;
    case "win":
      console.log(chalk.green.bold("        ✓ YOU WIN! ✓        "));
      console.log(chalk.green(`        Payout: $${payout.toFixed(2)}        `));
      break;
    case "loss":
      console.log(chalk.red.bold("        ✗ YOU LOSE ✗        "));
      console.log(
        chalk.red(`        Lost: $${Math.abs(payout).toFixed(2)}        `),
      );
      break;
    case "push":
      console.log(chalk.yellow.bold("        ⚖ PUSH ⚖        "));
      console.log(chalk.yellow("        Bet returned        "));
      break;
  }

  console.log(chalk.yellow.bold("═".repeat(60)));
}

// Display error message
export function displayError(message: string): void {
  console.log(chalk.red.bold(`\n❌ Error: ${message}\n`));
}

// Display welcome message
export function displayWelcome(): void {
  console.clear();
  console.log(chalk.green.bold(`\n${"═".repeat(60)}`));
  console.log(
    chalk.green.bold("                    🃏 BLACKJACK 🃏                    "),
  );
  console.log(chalk.green.bold("═".repeat(60)));
  console.log(chalk.white("\nWelcome to the Blackjack CLI!"));
  console.log(
    chalk.gray("Rules: Get as close to 21 as possible without going over."),
  );
  console.log(chalk.gray("Dealer stands on 17. Blackjack pays 3:2.\n"));
}
