#!/usr/bin/env bun

import { input, select, confirm, number } from "@inquirer/prompts";
import { writeFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { Game } from "@/modules/game/game";
import { RuleSet } from "@/modules/game/rules";
import type { Player } from "@/modules/game/player";
import type { ActionType } from "@/modules/game/action";
import chalk from "chalk";
import {
  displayWelcome,
  displayHeader,
  displayDealerHand,
  displayPlayerHand,
  displaySettlement,
  displayError,
} from "./display";

class BlackjackCLI {
  private game: Game;
  private player: Player | null = null;

  constructor() {
    this.game = new Game(6, 0.75, 1000000, new RuleSet());
  }

  async start(): Promise<void> {
    displayWelcome();

    try {
      // Get player name
      const playerName = await input({
        message: "Enter your name:",
        validate: (value) => {
          if (!value.trim()) {
            return "Please enter a name";
          }
          return true;
        },
      });

      // Get starting bankroll
      const bankroll = await number({
        message: "Enter starting bankroll:",
        default: 1000,
        validate: (value) => {
          if (!value || value <= 0) {
            return "Bankroll must be greater than 0";
          }
          return true;
        },
      });

      // Add player to game
      this.player = this.game.addPlayer(playerName.trim(), bankroll ?? 1000);

      // Main game loop
      await this.gameLoop();
    } catch (error) {
      if (error instanceof Error && error.message === "User force closed the prompt") {
        console.log("\n\nThanks for playing! 👋\n");
      } else {
        console.error("An error occurred:", error);
      }
    }
  }

  private async gameLoop(): Promise<void> {
    while (this.player && this.player.bank.balance > 0) {
      const stats = this.game.getStats();

      // Display game state
      displayHeader(
        this.player.bank.balance,
        stats.roundNumber,
        this.game.getCurrentRound()?.playerHands[0]?.betAmount
      );

      // Get bet
      const betAmount = await this.getBet();
      if (betAmount === null) {
        break; // Player wants to quit
      }

      // Start round
      try {
        this.game.startRound([{ playerId: this.player.id, amount: betAmount }]);
      } catch (error) {
        if (error instanceof Error) {
          displayError(error.message);
          await this.pressEnterToContinue();
          continue;
        }
      }

      // Play round
      await this.playRound();

      // Ask if player wants to continue
      if (this.player.bank.balance <= 0) {
        console.log("\n💸 You're out of money! Game over.\n");
        break;
      }

      const continueGame = await confirm({
        message: "Play another round?",
        default: true,
      });

      if (!continueGame) {
        break;
      }

      this.game.completeRound();
    }

    // Game over - end session and save audit trail
    this.game.endSession();

    console.log("\n" + "═".repeat(60));
    console.log(
      `\n👋 Thanks for playing, ${this.player?.name}!\nFinal balance: $${this.player?.bank.balance.toFixed(2)}\n`
    );

    // Save audit trail
    await this.saveAuditTrail();
  }

  private async getBet(): Promise<number | null> {
    if (!this.player) return null;

    const betAmount = await number({
      message: `Enter bet amount (Balance: $${this.player.bank.balance.toFixed(2)}):`,
      default: 10,
      validate: (value) => {
        if (!value || value <= 0) {
          return "Bet must be greater than 0";
        }
        if (this.player && value > this.player.bank.balance) {
          return `Insufficient funds (you have $${this.player.bank.balance.toFixed(2)})`;
        }
        return true;
      },
    });

    return betAmount ?? null;
  }

  private async playRound(): Promise<void> {
    const round = this.game.getCurrentRound();
    if (!round) return;

    // Show initial hands
    this.displayRoundState(true);

    // Handle insurance
    if (round.state === "insurance") {
      await this.handleInsurance();
    }

    // Player's turn
    while (
      round.state === "player_turn" &&
      this.game.getAvailableActions().length > 0
    ) {
      const action = await this.getPlayerAction();
      if (action === null) break;

      try {
        this.game.playAction(action);
        this.displayRoundState(true);
      } catch (error) {
        if (error instanceof Error) {
          displayError(error.message);
          await this.pressEnterToContinue();
        }
      }
    }

    // Show dealer's hand and settlement
    if (round.state === "settling" || round.state === "complete") {
      this.displayRoundState(false);
      await this.showSettlement();
    }
  }

  private displayRoundState(hideDealer: boolean): void {
    const round = this.game.getCurrentRound();
    if (!round || !this.player) return;

    displayHeader(
      this.player.bank.balance,
      this.game.getStats().roundNumber,
      round.playerHands[0]?.betAmount
    );

    // Display dealer hand
    console.log(displayDealerHand(round.dealerHand, hideDealer));

    // Display player hands
    for (let i = 0; i < round.playerHands.length; i++) {
      const hand = round.playerHands[i];
      const label =
        round.playerHands.length > 1
          ? `${this.player.name} (Hand ${i + 1})`
          : this.player.name;
      console.log(displayPlayerHand(hand, label));
      if (hand.betAmount) {
        console.log(`Bet: $${hand.betAmount.toFixed(2)}`);
      }
    }
  }

  private async handleInsurance(): Promise<void> {
    const round = this.game.getCurrentRound();
    if (!round) return;

    const hand = round.playerHands[0];
    if (!hand.insuranceOffered || hand.hasInsurance) return;

    const takeInsurance = await confirm({
      message: `Dealer shows Ace. Take insurance? (costs $${(hand.betAmount / 2).toFixed(2)})`,
      default: false,
    });

    if (takeInsurance) {
      this.game.takeInsurance(0);
    } else {
      this.game.declineInsurance(0);
    }

    this.game.resolveInsurance();
    this.displayRoundState(true);
  }

  private async getPlayerAction(): Promise<ActionType | null> {
    const availableActions = this.game.getAvailableActions();
    if (availableActions.length === 0) return null;

    const actionLabels: Record<ActionType, string> = {
      hit: "Hit (take another card)",
      stand: "Stand (end turn)",
      double: "Double Down (double bet, take one card)",
      split: "Split (split pairs into two hands)",
      surrender: "Surrender (forfeit half bet)",
    };

    const choices = availableActions.map((action) => ({
      name: actionLabels[action],
      value: action,
    }));

    const action = await select({
      message: "Choose your action:",
      choices,
    });

    return action;
  }

  private async showSettlement(): Promise<void> {
    const round = this.game.getCurrentRound();
    if (!round) return;

    await this.pressEnterToContinue();

    // Show results for each hand
    for (let i = 0; i < round.playerHands.length; i++) {
      const hand = round.playerHands[i];

      let result: "win" | "loss" | "push" | "blackjack";
      let payout = 0;

      switch (hand.state) {
        case "blackjack":
          result = "blackjack";
          payout = hand.betAmount * 1.5;
          break;
        case "won":
          result = "win";
          payout = hand.betAmount;
          break;
        case "lost":
          result = "loss";
          payout = -hand.betAmount;
          break;
        case "pushed":
          result = "push";
          payout = 0;
          break;
        default:
          continue;
      }

      if (round.playerHands.length > 1) {
        console.log(`\nHand ${i + 1}:`);
      }

      displaySettlement(result, payout);
    }

    console.log(
      `\nNew balance: $${this.player?.bank.balance.toFixed(2)}`
    );
  }

  private async pressEnterToContinue(): Promise<void> {
    await input({
      message: "Press Enter to continue...",
    });
  }

  private async saveAuditTrail(): Promise<void> {
    const saveTrail = await confirm({
      message: "Would you like to save the audit trail?",
      default: true,
    });

    if (!saveTrail) return;

    try {
      // Create audit-logs directory if it doesn't exist
      try {
        mkdirSync("./audit-logs", { recursive: true });
      } catch (e) {
        // Directory might already exist
      }

      // Get session ID and create filename
      const sessionId = this.game.getSessionId();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `./audit-logs/audit-${sessionId}-${timestamp}.json`;

      // Save to file
      const auditJSON = this.game.getAuditTrailJSON();
      writeFileSync(filename, auditJSON);

      console.log(chalk.green(`\n✓ Audit trail saved to: ${filename}\n`));
      console.log(chalk.gray(`  View it with: bun run audit-viewer\n`));

      // Show summary
      const summary = this.game.getAuditSummary();
      console.log(chalk.cyan("\n📊 Session Summary:"));
      console.log(chalk.white(`  Total Events: ${summary.totalEvents}`));
      console.log(chalk.white(`  Total Rounds: ${summary.totalRounds}`));
      console.log(chalk.white(`  Duration: ${summary.firstEvent ? new Date(summary.lastEvent!).getTime() - new Date(summary.firstEvent).getTime() : 0}ms\n`));
    } catch (error) {
      console.log(chalk.red(`\n❌ Error saving audit trail: ${error}\n`));
    }
  }
}

// Run the game
const cli = new BlackjackCLI();
cli.start().catch(console.error);
