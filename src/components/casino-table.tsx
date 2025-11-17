"use client";

import { useEffect, useRef, useState } from "react";
import { Game } from "@/modules/game/game";
import { RuleSet } from "@/modules/game/rules";
import type { Player } from "@/modules/game/player";
import type { ActionType } from "@/modules/game/action";
import type { UserBank, UserProfile } from "@/types/user";
import { UserService } from "@/services/user-service";
import { AnimatedCard } from "./animated-card";
import { CasinoChip, CHIP_VALUES } from "./casino-chip";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { DecisionTracker } from "@/modules/strategy/decision-tracker";
import { getBasicStrategyDecision } from "@/modules/strategy/basic-strategy";
import { HiLoCounter } from "@/modules/strategy/hi-lo-counter";

interface CasinoTableProps {
  user: UserProfile;
  bank: UserBank;
  onGameEnd: (bank: UserBank) => void;
  onBackToDashboard: () => void;
}

type GamePhase =
  | "betting"
  | "dealing"
  | "insurance"
  | "playing"
  | "dealer_turn"
  | "settling"
  | "round_complete";

export function CasinoTable({
  user,
  bank,
  onGameEnd,
  onBackToDashboard,
}: CasinoTableProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [phase, setPhase] = useState<GamePhase>("betting");
  const [betAmount, setBetAmount] = useState(10);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [totalWagered, setTotalWagered] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [, forceUpdate] = useState({});
  const [currentBet, setCurrentBet] = useState(0);
  const [countingEnabled, setCountingEnabled] = useState(true); // Enable counting by default
  const [practiceMode, setPracticeMode] = useState(false); // Practice mode for testing count
  const [showCount, setShowCount] = useState(true); // Show/hide count display
  const decisionTracker = useRef<DecisionTracker | null>(null);
  const cardCounter = useRef<HiLoCounter | null>(null);

  useEffect(() => {
    // Initialize game
    const newGame = new Game(6, 0.75, 1000000, new RuleSet());
    const newPlayer = newGame.addPlayer(user.name, bank.balance);
    const session = UserService.startSession(user.id);

    setGame(newGame);
    setPlayer(newPlayer);
    setSessionId(session.id);

    // Initialize decision tracker for this session
    decisionTracker.current = new DecisionTracker(session.id);

    // Initialize card counter (6 decks)
    cardCounter.current = new HiLoCounter(6, false);
  }, [user.name, bank.balance, user.id]);

  const handleBet = (amount: number) => {
    if (!game || !player) return;

    try {
      game.startRound([{ playerId: player.id, amount }]);
      setRoundsPlayed((prev) => prev + 1);
      setPhase("dealing");

      // Track dealt cards in the counter
      if (cardCounter.current && countingEnabled) {
        const round = game.getCurrentRound();
        if (round) {
          // Add all player cards
          for (const hand of round.playerHands) {
            cardCounter.current.addCards(hand.cards);
          }
          // Add dealer's up card
          if (round.dealerHand.upCard) {
            cardCounter.current.addCard(round.dealerHand.upCard);
          }
        }
      }

      // After dealing animation, check for insurance or proceed to playing
      setTimeout(() => {
        const round = game.getCurrentRound();
        if (round?.state === "insurance") {
          setPhase("insurance");
        } else if (round?.state === "player_turn") {
          setPhase("playing");
        } else {
          setPhase("settling");
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to start round:", error);
    }
  };

  const handleAction = (action: ActionType) => {
    if (!game || !decisionTracker.current) return;

    try {
      const round = game.getCurrentRound();
      const availableActions = game.getAvailableActions() ?? [];

      // Record the decision for strategy analysis
      if (round && round.state === "player_turn") {
        const currentHand = round.playerHands[round.currentHandIndex];
        if (currentHand) {
          const dealerUpCard = round.dealerHand.upCard;

          // Determine what actions are available
          const canDouble = availableActions.includes("double");
          const canSplit = availableActions.includes("split");
          const canSurrender = availableActions.includes("surrender");

          // Get basic strategy recommendation
          const optimalDecision = getBasicStrategyDecision(
            currentHand.cards,
            currentHand.handValue,
            dealerUpCard,
            canDouble,
            canSplit,
            canSurrender,
          );

          // Get count snapshot if counting is enabled
          const countSnapshot = countingEnabled && cardCounter.current
            ? cardCounter.current.getSnapshot()
            : undefined;

          // Record the decision
          decisionTracker.current.recordDecision(
            currentHand.cards,
            currentHand.handValue,
            dealerUpCard,
            currentHand.id,
            round.id,
            canDouble,
            canSplit,
            canSurrender,
            action,
            optimalDecision,
            countSnapshot,
          );
        }
      }

      // Track cards before action
      const currentRound = game.getCurrentRound();
      const cardsBefore = currentRound
        ? currentRound.playerHands.reduce((sum, h) => sum + h.cards.length, 0)
        : 0;

      game.playAction(action);

      // Track any new cards dealt (from hit, split, double)
      if (cardCounter.current && countingEnabled) {
        const round = game.getCurrentRound();
        if (round) {
          const cardsAfter = round.playerHands.reduce((sum, h) => sum + h.cards.length, 0);
          if (cardsAfter > cardsBefore) {
            // New cards were dealt, collect all cards and add the new ones
            const allCurrentCards = round.playerHands.flatMap(h => h.cards);
            const newCards = allCurrentCards.slice(cardsBefore);
            cardCounter.current.addCards(newCards);
          }
        }
      }
      const newRound = game.getCurrentRound();
      const newActions = game.getAvailableActions() ?? [];

      // Force re-render to show new cards
      forceUpdate({});

      // Check if we're still in player turn with actions available
      if (newActions.length > 0 && newRound?.state === "player_turn") {
        // Still playing, actions will be shown automatically
        return;
      }

      // No more actions, move to dealer turn
      setPhase("dealer_turn");

      // Track dealer's hole card and any dealer hits
      if (cardCounter.current && countingEnabled) {
        const round = game.getCurrentRound();
        if (round) {
          const dealerCards = round.dealerHand.cards;
          // Add hole card (second card, index 1) if it exists
          if (dealerCards.length >= 2 && dealerCards[1]) {
            cardCounter.current.addCard(dealerCards[1]);
          }
          // Add any additional dealer cards beyond the initial 2
          if (dealerCards.length > 2) {
            cardCounter.current.addCards(dealerCards.slice(2));
          }
        }
      }

      setTimeout(() => {
        setPhase("settling");
      }, 1500);
    } catch (error) {
      console.error("Failed to play action:", error);
    }
  };

  const handleNextRound = () => {
    if (!game || !player) return;

    if (player.bank.balance < 10) {
      handleEndGame();
      return;
    }

    // Track total wagered from this round before completing it
    const round = game.getCurrentRound();
    if (round) {
      const roundWagered = round.playerHands.reduce(
        (sum, hand) => sum + hand.betAmount,
        0
      );
      setTotalWagered((prev) => prev + roundWagered);
    }

    game.completeRound();
    setPhase("betting");
  };

  const handleEndGame = () => {
    if (!game || !player || !sessionId) return;

    // Track final round's wager if there's an active round
    let finalTotalWagered = totalWagered;
    const round = game.getCurrentRound();
    if (round && round.state !== "complete") {
      const roundWagered = round.playerHands.reduce(
        (sum, hand) => sum + hand.betAmount,
        0
      );
      finalTotalWagered += roundWagered;
    }

    game.endSession();

    // Calculate strategy analysis if we tracked decisions
    let strategyAnalysis: {
      grade: string;
      accuracy: number;
      totalDecisions: number;
      correctDecisions: number;
      decisions: unknown[];
      hasCountData: boolean;
    } | null = null;
    if (decisionTracker.current) {
      const analysis = decisionTracker.current.calculateAnalysis();
      strategyAnalysis = {
        grade: analysis.grade,
        accuracy: analysis.accuracyPercentage,
        totalDecisions: analysis.totalDecisions,
        correctDecisions: analysis.correctDecisions,
        decisions: analysis.decisions,
        hasCountData: analysis.hasCountData,
      };
    }

    UserService.endSession(
      sessionId,
      roundsPlayed,
      player.bank.balance,
      game.getSessionId(),
      strategyAnalysis,
      finalTotalWagered,
    );

    const updatedBank = UserService.getCurrentUser()?.bank;
    if (updatedBank) {
      onGameEnd(updatedBank);
    }

    onBackToDashboard();
  };

  const round = game?.getCurrentRound();
  const availableActions = game?.getAvailableActions() ?? [];
  const stats = game?.getStats();

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Casino table background - vintage green felt */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, #1a472a 0%, #0f2f1a 100%)",
        }}
      >
        {/* Felt texture overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg width="200" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="turbulence" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="200" height="200" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E\')',
          }}
        />
        {/* Table edge - wood grain */}
        <div className="absolute top-0 left-0 right-0 h-22 bg-linear-to-b from-amber-900 to-amber-950 border-b-4 border-amber-700" />
        <div className="absolute bottom-0 left-0 right-0 h-22 bg-linear-to-t from-amber-900 to-amber-950 border-t-4 border-amber-700" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-4 text-amber-100">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-serif font-bold text-amber-200">
            ♠ BLACKJACK ♠
          </h1>
          {/* <Button
            onClick={() => setShowStats(!showStats)}
            variant="outline"
            size="sm"
            className="border-amber-700 bg-amber-950/50 text-amber-200 hover:bg-amber-900"
          >
            {showStats ? "Hide Stats" : "Show Stats"}
          </Button> */}
        </div>
        <div className="flex items-center gap-4">
          {/* Card Count Display */}
          {countingEnabled && cardCounter.current && showCount && (
            <div className="px-4 py-2 bg-black/60 border border-purple-700 rounded-lg">
              <div className="text-xs text-purple-400">Card Count</div>
              <div className="flex gap-3 items-center">
                <div>
                  <div className="text-xs text-gray-400">Running</div>
                  <div className="text-lg font-bold text-white">
                    {cardCounter.current.getRunningCount() > 0 && "+"}
                    {cardCounter.current.getRunningCount()}
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-600" />
                <div>
                  <div className="text-xs text-gray-400">True</div>
                  <div
                    className={cn(
                      "text-lg font-bold",
                      cardCounter.current.getTrueCount() >= 2
                        ? "text-green-400"
                        : cardCounter.current.getTrueCount() <= -2
                        ? "text-red-400"
                        : "text-yellow-400"
                    )}
                  >
                    {cardCounter.current.getTrueCount() > 0 && "+"}
                    {cardCounter.current.getTrueCount()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-right">
            <div className="text-sm text-amber-400">Balance</div>
            <div className="text-xl font-bold text-green-400">
              ${player?.bank.balance.toFixed(2)}
            </div>
          </div>

          <Button
            onClick={() => setShowCount(!showCount)}
            variant="outline"
            size="sm"
            className="border-purple-700 bg-purple-950/50 text-purple-200 hover:bg-purple-900"
          >
            {showCount ? "Hide Count" : "Show Count"}
          </Button>

          <Button
            onClick={handleEndGame}
            variant="outline"
            className="border-red-700 bg-red-950/50 text-red-200 hover:bg-red-900"
          >
            Cash Out
          </Button>
        </div>
      </div>

      {/* Statistics Overlay */}
      {showStats && stats && (
        <div className="relative z-20 mx-4 p-4 bg-black/80 border border-amber-700 rounded-lg text-amber-100 backdrop-blur-sm">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-xs text-amber-400">Round</div>
              <div className="text-lg font-bold">{stats.roundNumber}</div>
            </div>
            <div>
              <div className="text-xs text-amber-400">Shoe</div>
              <div className="text-lg font-bold">
                {stats.shoeRemainingCards}
              </div>
            </div>
            <div>
              <div className="text-xs text-amber-400">House Edge</div>
              <div className="text-lg font-bold">
                {(game ? game.getHouseEdge() * 100 : 0).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-amber-400">Session Hands</div>
              <div className="text-lg font-bold">{roundsPlayed}</div>
            </div>
            <div>
              <div className="text-xs text-amber-400">Session P/L</div>
              <div
                className={cn(
                  "text-lg font-bold",
                  player && player.bank.balance >= bank.balance
                    ? "text-green-400"
                    : "text-red-400",
                )}
              >
                {player &&
                  (player.bank.balance >= bank.balance ? "+" : "") +
                    (player.bank.balance - bank.balance).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main playing area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-12 p-8">
        {/* Dealer area */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-amber-200 font-serif text-lg">Dealer</div>
          {round && (
            <div className="relative flex" style={{ minHeight: "146px" }}>
              {round.dealerHand.cards.map((card, idx) => (
                <div
                  key={`dealer-${card.rank}-${card.suit}-${idx ? 2 + idx - 2 : 1}`}
                  className="transition-all duration-300"
                  style={{
                    marginLeft: idx > 0 ? "-55px" : "0",
                    zIndex: idx,
                  }}
                >
                  <AnimatedCard
                    card={card}
                    hidden={idx > 0 &&
                      (phase === "dealing" || phase === "playing" ||
                        phase === "insurance")}
                    size="xl"
                    dealDelay={idx * 200}
                  />
                </div>
              ))}
            </div>
          )}
          {round && phase !== "betting" && (
            <div className="text-amber-400 font-serif">
              {phase === "dealing" || phase === "playing" ||
                  phase === "insurance"
                ? `Showing: ${round.dealerHand.upCard.rank}`
                : `Total: ${round.dealerHand.handValue}`}
            </div>
          )}
        </div>

        {/* Player area */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-amber-200 font-serif text-lg">{user.name}</div>
          {round && (
            <div className="flex gap-4">
              {round.playerHands.map((hand, handIdx) => (
                <div
                  key={`hand-${handIdx * 1}`}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg transition-all",
                    round.currentHandIndex === handIdx &&
                      phase === "playing" &&
                      "ring-2 ring-amber-400 bg-amber-950/30",
                  )}
                >
                  <div className="relative flex" style={{ minHeight: "146px" }}>
                    {hand.cards.map((card, cardIdx) => (
                      <div
                        key={`player-${handIdx}-${cardIdx * 1}`}
                        className="transition-all duration-300"
                        style={{
                          marginLeft: cardIdx > 0 ? "-55px" : "0",
                          zIndex: cardIdx,
                        }}
                      >
                        <AnimatedCard
                          card={card}
                          size="xl"
                          dealDelay={cardIdx * 200 + 100}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-amber-400 font-serif text-sm">
                    Total: {hand.handValue}
                    {hand.isSoft && " (soft)"}
                  </div>
                  <div className="text-amber-300 text-xs">
                    Bet: ${hand.betAmount.toFixed(2)}
                  </div>
                  {hand.state && hand.state !== "active" && (
                    <div
                      className={cn(
                        "text-sm font-bold uppercase",
                        hand.state === "blackjack" && "text-amber-400",
                        hand.state === "won" && "text-green-400",
                        hand.state === "lost" && "text-red-400",
                        hand.state === "pushed" && "text-gray-400",
                        hand.state === "busted" && "text-red-500",
                      )}
                    >
                      {hand.state}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action area */}
      <div className="relative z-10 p-6 bg-linear-to-t from-amber-950/80 to-transparent backdrop-blur-sm">
        {phase === "betting" && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-amber-200 font-serif text-lg">
              Place Your Bet
            </div>

            {/* Current bet display */}
            <div className="bg-black/50 px-8 py-3 rounded-lg border-2 border-amber-600">
              <div className="text-center">
                <div className="text-xs text-amber-400 uppercase tracking-wide">
                  Current Bet
                </div>
                <div className="text-3xl font-bold text-green-400 font-serif">
                  ${currentBet.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Chips */}
            <div className="flex gap-3 items-center">
              {CHIP_VALUES.map((chip) => (
                <CasinoChip
                  key={chip.value}
                  value={chip.value}
                  color={chip.color}
                  accentColor={chip.accentColor}
                  onClick={() => {
                    if (
                      player && currentBet + chip.value <= player.bank.balance
                    ) {
                      setCurrentBet((prev) => prev + chip.value);
                    }
                  }}
                  disabled={player
                    ? currentBet + chip.value > player.bank.balance
                    : false}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentBet(0)}
                variant="outline"
                className="border-red-700 bg-red-950/50 text-red-200 hover:bg-red-900 font-serif"
                disabled={currentBet === 0}
              >
                Clear Bet
              </Button>
              <Button
                onClick={() => {
                  if (currentBet >= 10) {
                    handleBet(currentBet);
                    setCurrentBet(0);
                  }
                }}
                className="bg-green-800 hover:bg-green-700 text-white font-serif px-8"
                disabled={currentBet < 10}
              >
                Place Bet ${currentBet > 0 ? currentBet.toFixed(2) : ""}
              </Button>
            </div>

            {currentBet < 10 && currentBet > 0 && (
              <div className="text-amber-400 text-sm">
                Minimum bet is $10
              </div>
            )}
          </div>
        )}

        {phase === "insurance" && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-amber-200 font-serif text-lg">
              Dealer shows Ace - Take Insurance?
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  if (!game) return;
                  game.takeInsurance(0);
                  game.resolveInsurance();

                  // Check round state after insurance resolution
                  const round = game.getCurrentRound();
                  if (round?.state === "settling") {
                    // Dealer has blackjack - go directly to settling
                    setTimeout(() => setPhase("settling"), 500);
                  } else {
                    setPhase("playing");
                  }
                }}
                className="bg-green-800 hover:bg-green-700 text-white font-serif"
              >
                Yes (costs ${round?.playerHands[0]?.betAmount
                  ? (round.playerHands[0].betAmount / 2).toFixed(2)
                  : "0"})
              </Button>
              <Button
                onClick={() => {
                  if (!game) return;
                  game.declineInsurance(0);
                  game.resolveInsurance();

                  // Check round state after insurance resolution
                  const round = game.getCurrentRound();
                  if (round?.state === "settling") {
                    // Dealer has blackjack - go directly to settling
                    setTimeout(() => setPhase("settling"), 500);
                  } else {
                    setPhase("playing");
                  }
                }}
                className="bg-red-800 hover:bg-red-700 text-white font-serif"
              >
                No
              </Button>
            </div>
          </div>
        )}

        {phase === "playing" && availableActions.length > 0 && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-amber-200 font-serif text-lg">Your Action</div>
            <div className="flex gap-2">
              {availableActions.includes("hit") && (
                <Button
                  onClick={() => handleAction("hit")}
                  className="bg-blue-800 hover:bg-blue-700 text-white font-serif px-6"
                >
                  Hit
                </Button>
              )}
              {availableActions.includes("stand") && (
                <Button
                  onClick={() => handleAction("stand")}
                  className="bg-red-800 hover:bg-red-700 text-white font-serif px-6"
                >
                  Stand
                </Button>
              )}
              {availableActions.includes("double") && (
                <Button
                  onClick={() => handleAction("double")}
                  className="bg-purple-800 hover:bg-purple-700 text-white font-serif px-6"
                >
                  Double
                </Button>
              )}
              {availableActions.includes("split") && (
                <Button
                  onClick={() => handleAction("split")}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-serif px-6"
                >
                  Split
                </Button>
              )}
              {availableActions.includes("surrender") && (
                <Button
                  onClick={() => handleAction("surrender")}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-serif px-6"
                >
                  Surrender
                </Button>
              )}
            </div>
          </div>
        )}

        {phase === "settling" && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-amber-200 font-serif text-xl">
              {round?.settlementResults?.some((r) =>
                  r.outcome === "win" || r.outcome === "blackjack" ||
                  r.outcome === "charlie"
                )
                ? "You Win!"
                : round?.settlementResults?.some((r) => r.outcome === "push")
                ? "Push"
                : "Dealer Wins"}
            </div>
            <Button
              onClick={handleNextRound}
              className="bg-green-800 hover:bg-green-700 text-white font-serif text-lg px-8"
            >
              {player && player.bank.balance < 10 ? "Cash Out" : "Next Round"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
