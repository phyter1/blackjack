"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal } from "./terminal";
import { Game } from "@/modules/game/game";
import { RuleSet } from "@/modules/game/rules";
import type { Player } from "@/modules/game/player";
import type { ActionType } from "@/modules/game/action";
import type { TerminalLine } from "@/lib/terminal-display";
import {
  displayWelcome,
  displayHeader,
  displayDealerHand,
  displayPlayerHand,
  displaySettlement,
  displayError,
} from "@/lib/terminal-display";

type GameState =
  | "welcome"
  | "get_name"
  | "get_bankroll"
  | "get_bet"
  | "playing"
  | "insurance"
  | "get_action"
  | "settling"
  | "ask_continue"
  | "game_over";

interface TerminalGameProps {
  onGameUpdate?: (game: Game) => void;
}

export function TerminalGame({ onGameUpdate }: TerminalGameProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [gameState, setGameState] = useState<GameState>("welcome");
  const [inputValue, setInputValue] = useState("");
  const [game, setGame] = useState<Game | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [availableActions, setAvailableActions] = useState<ActionType[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Show welcome message on mount
    addLines(displayWelcome());
    addLine([{ text: "\nEnter your name: ", color: "cyan" }]);
    setGameState("get_name");
  }, []);

  const addLines = (newLines: TerminalLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  };

  const addLine = (line: TerminalLine) => {
    setLines((prev) => [...prev, line]);
  };

  const displayRoundState = (hideDealer: boolean) => {
    const round = game?.getCurrentRound();
    if (!round || !player) return;

    const stats = game?.getStats();
    addLines(
      displayHeader(
        player.bank.balance,
        stats?.roundNumber ?? 0,
        round.playerHands[0]?.betAmount,
      ),
    );

    // Display dealer hand
    addLines(displayDealerHand(round.dealerHand, hideDealer));

    // Display player hands
    for (let i = 0; i < round.playerHands.length; i++) {
      const hand = round.playerHands[i];
      const label =
        round.playerHands.length > 1
          ? `${player.name} (Hand ${i + 1})`
          : player.name;
      addLines(displayPlayerHand(hand, label));
      if (hand.betAmount) {
        addLine([{ text: `Bet: $${hand.betAmount.toFixed(2)}` }]);
      }
    }
  };

  const handleInput = (value: string) => {
    // Echo the input
    addLine([{ text: value, color: "white" }]);

    switch (gameState) {
      case "get_name":
        if (value.trim()) {
          setPlayerName(value.trim());
          addLine([
            {
              text: `\nEnter starting bankroll (default: $1000): `,
              color: "cyan",
            },
          ]);
          setGameState("get_bankroll");
        } else {
          addLines(displayError("Please enter a name"));
          addLine([{ text: "Enter your name: ", color: "cyan" }]);
        }
        break;

      case "get_bankroll": {
        const bankroll = value.trim() ? parseFloat(value) : 1000;
        if (isNaN(bankroll) || bankroll <= 0) {
          addLines(displayError("Bankroll must be greater than 0"));
          addLine([
            {
              text: "Enter starting bankroll (default: $1000): ",
              color: "cyan",
            },
          ]);
        } else {
          const newGame = new Game(6, 0.75, 1000000, new RuleSet());
          const newPlayer = newGame.addPlayer(playerName, bankroll);
          setGame(newGame);
          setPlayer(newPlayer);
          onGameUpdate?.(newGame);
          addLine([
            {
              text: `\n\nEnter bet amount (Balance: $${bankroll.toFixed(2)}, default: $10): `,
              color: "cyan",
            },
          ]);
          setGameState("get_bet");
        }
        break;
      }

      case "get_bet": {
        const betAmount = value.trim() ? parseFloat(value) : 10;
        if (isNaN(betAmount) || betAmount <= 0) {
          addLines(displayError("Bet must be greater than 0"));
          addLine([
            {
              text: `Enter bet amount (Balance: $${player?.bank.balance.toFixed(2)}, default: $10): `,
              color: "cyan",
            },
          ]);
        } else if (player && betAmount > player.bank.balance) {
          addLines(
            displayError(
              `Insufficient funds (you have $${player.bank.balance.toFixed(2)})`,
            ),
          );
          addLine([
            {
              text: `Enter bet amount (Balance: $${player.bank.balance.toFixed(2)}, default: $10): `,
              color: "cyan",
            },
          ]);
        } else {
          try {
            game?.startRound([{ playerId: player!.id, amount: betAmount }]);
            displayRoundState(true);

            const round = game?.getCurrentRound();
            if (round?.state === "insurance") {
              const hand = round.playerHands[0];
              addLine([
                {
                  text: `\nDealer shows Ace. Take insurance? (costs $${(hand.betAmount / 2).toFixed(2)}) [y/n]: `,
                  color: "cyan",
                },
              ]);
              setGameState("insurance");
            } else {
              const actions = game?.getAvailableActions() ?? [];
              setAvailableActions(actions);
              if (actions.length > 0) {
                showActionPrompt(actions);
                setGameState("get_action");
              } else {
                handleSettlement();
              }
            }
          } catch (error) {
            if (error instanceof Error) {
              addLines(displayError(error.message));
            }
            addLine([
              {
                text: `\nEnter bet amount (Balance: $${player?.bank.balance.toFixed(2)}, default: $10): `,
                color: "cyan",
              },
            ]);
          }
        }
        break;
      }

      case "insurance": {
        const takeInsurance = value.toLowerCase().startsWith("y");
        if (takeInsurance) {
          game?.takeInsurance(0);
        } else {
          game?.declineInsurance(0);
        }
        game?.resolveInsurance();
        displayRoundState(true);

        const actions = game?.getAvailableActions() ?? [];
        setAvailableActions(actions);
        if (actions.length > 0) {
          showActionPrompt(actions);
          setGameState("get_action");
        } else {
          handleSettlement();
        }
        break;
      }

      case "get_action": {
        const actionIndex = parseInt(value) - 1;
        if (
          isNaN(actionIndex) ||
          actionIndex < 0 ||
          actionIndex >= availableActions.length
        ) {
          addLines(displayError("Invalid action"));
          showActionPrompt(availableActions);
        } else {
          const action = availableActions[actionIndex];
          try {
            game?.playAction(action);
            displayRoundState(true);

            const round = game?.getCurrentRound();
            const newActions = game?.getAvailableActions() ?? [];
            setAvailableActions(newActions);

            if (newActions.length > 0 && round?.state === "player_turn") {
              showActionPrompt(newActions);
            } else {
              handleSettlement();
            }
          } catch (error) {
            if (error instanceof Error) {
              addLines(displayError(error.message));
            }
            showActionPrompt(availableActions);
          }
        }
        break;
      }

      case "ask_continue": {
        const continueGame = value.toLowerCase().startsWith("y");
        if (continueGame) {
          if (player && player.bank.balance <= 0) {
            addLine([
              {
                text: "\n💸 You're out of money! Game over.\n",
                color: "red",
              },
            ]);
            endGame();
          } else {
            game?.completeRound();
            addLine([
              {
                text: `\n\nEnter bet amount (Balance: $${player?.bank.balance.toFixed(2)}, default: $10): `,
                color: "cyan",
              },
            ]);
            setGameState("get_bet");
          }
        } else {
          endGame();
        }
        break;
      }
    }

    setInputValue("");
  };

  const showActionPrompt = (actions: ActionType[]) => {
    const actionLabels: Record<ActionType, string> = {
      hit: "Hit (take another card)",
      stand: "Stand (end turn)",
      double: "Double Down (double bet, take one card)",
      split: "Split (split pairs into two hands)",
      surrender: "Surrender (forfeit half bet)",
    };

    addLine([{ text: "\nChoose your action:", color: "cyan" }]);
    actions.forEach((action, index) => {
      addLine([
        { text: `${index + 1}. ${actionLabels[action]}`, color: "white" },
      ]);
    });
    addLine([{ text: "\nEnter action number: ", color: "cyan" }]);
  };

  const handleSettlement = () => {
    const round = game?.getCurrentRound();
    if (!round) return;

    displayRoundState(false);
    addLine([{ text: "\n", color: "white" }]);

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
        addLine([{ text: `\nHand ${i + 1}:`, color: "white" }]);
      }

      addLines(displaySettlement(result, payout));
    }

    addLine([
      {
        text: `\nNew balance: $${player?.bank.balance.toFixed(2)}`,
        color: "white",
      },
    ]);

    addLine([{ text: "\nPlay another round? [y/n]: ", color: "cyan" }]);
    setGameState("ask_continue");
  };

  const endGame = () => {
    game?.endSession();
    addLine([{ text: "\n" + "═".repeat(60), color: "green", bold: true }]);
    addLine([
      {
        text: `\n👋 Thanks for playing, ${player?.name}!\nFinal balance: $${player?.bank.balance.toFixed(2)}\n`,
        color: "white",
      },
    ]);

    const summary = game?.getAuditSummary();
    if (summary) {
      addLine([{ text: "\n📊 Session Summary:", color: "cyan", bold: true }]);
      addLine([
        { text: `  Total Events: ${summary.totalEvents}`, color: "white" },
      ]);
      addLine([
        { text: `  Total Rounds: ${summary.totalRounds}`, color: "white" },
      ]);
      if (summary.firstEvent && summary.lastEvent) {
        const duration =
          new Date(summary.lastEvent).getTime() -
          new Date(summary.firstEvent).getTime();
        addLine([{ text: `  Duration: ${duration}ms\n`, color: "white" }]);
      }
    }

    setGameState("game_over");
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex-1 overflow-hidden">
        <Terminal lines={lines} />
      </div>
      {gameState !== "game_over" && (
        <div className="border-t border-gray-700 p-4 bg-gray-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInput(inputValue);
            }}
            className="flex gap-2"
          >
            <span className="text-green-500 font-mono">{">"}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent text-white font-mono outline-none"
              autoFocus
            />
          </form>
        </div>
      )}
    </div>
  );
}
