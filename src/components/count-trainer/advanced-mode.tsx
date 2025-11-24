"use client";

import { useState } from "react";
import { useCountTrainerStore } from "@/stores/count-trainer";
import { CardMeisterCard } from "@/components/cardmeister-card";
import { ShoeDisplay } from "@/components/table/shoe-display";
import { DiscardTray } from "@/components/table/discard-tray";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Shuffle } from "lucide-react";

export function AdvancedMode() {
  const shoe = useCountTrainerStore((state) => state.shoe);
  const dealtCards = useCountTrainerStore((state) => state.dealtCards);
  const challengeActive = useCountTrainerStore(
    (state) => state.challengeActive,
  );
  const feedbackMessage = useCountTrainerStore(
    (state) => state.feedbackMessage,
  );
  const lastResult = useCountTrainerStore((state) => state.lastResult);
  const dealCard = useCountTrainerStore((state) => state.dealCard);
  const submitTrueCount = useCountTrainerStore(
    (state) => state.submitTrueCount,
  );
  const clearFeedback = useCountTrainerStore((state) => state.clearFeedback);
  const resetShoe = useCountTrainerStore((state) => state.resetShoe);

  const [runningCount, setRunningCount] = useState("");
  const [trueCount, setTrueCount] = useState("");

  const handleDealCard = () => {
    clearFeedback();
    dealCard();
  };

  const handleSubmit = () => {
    const rc = Number.parseInt(runningCount);
    const tc = Number.parseInt(trueCount);

    if (Number.isNaN(rc) || Number.isNaN(tc)) return;

    submitTrueCount(rc, tc);
    setRunningCount("");
    setTrueCount("");
  };

  const handleContinue = () => {
    clearFeedback();
    setRunningCount("");
    setTrueCount("");
  };

  const handleResetShoe = () => {
    resetShoe();
    clearFeedback();
    setRunningCount("");
    setTrueCount("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && runningCount && trueCount) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--theme-primary)" }}
        >
          Advanced Mode: True Count
        </h2>
        <p style={{ color: "var(--theme-text-secondary)" }}>
          Calculate both the running count and true count. True Count = Running
          Count ÷ Decks Remaining (rounded).
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={handleDealCard}
          disabled={challengeActive}
          style={{
            backgroundColor: "var(--theme-primary)",
            color: "white",
          }}
        >
          Deal Card
        </Button>
        <Button
          onClick={handleResetShoe}
          variant="outline"
          style={{
            borderColor: "var(--theme-border)",
            color: "var(--theme-text-primary)",
          }}
        >
          <Shuffle className="h-4 w-4 mr-2" />
          New Shoe
        </Button>
      </div>

      {/* Shoe Display and Discard Tray */}
      {shoe && (
        <>
          <ShoeDisplay
            remainingCards={shoe.remainingCards}
            totalCards={shoe.totalCards}
            cutCardPosition={shoe.cutCardPosition}
            penetration={
              ((shoe.totalCards - shoe.remainingCards) / shoe.totalCards) * 100
            }
            isComplete={shoe.isComplete}
          />
          <DiscardTray
            discardedCards={dealtCards.length}
            totalCards={shoe.totalCards}
          />
        </>
      )}

      {/* Cards Display */}
      {dealtCards.length > 0 && (
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: "var(--theme-dashboard-card)",
            border: "1px solid var(--theme-border)",
          }}
        >
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--theme-primary)" }}
          >
            Dealt Cards ({dealtCards.length})
          </h3>

          {/* Show last 10 cards for clarity */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {dealtCards.slice(-10).map((card, index) => (
              <CardMeisterCard
                key={`${card.suit}-${card.rank}-${index}`}
                card={card}
                size="md"
              />
            ))}
            {dealtCards.length > 10 && (
              <div
                className="flex items-center justify-center h-32 w-24 rounded-lg border-2 border-dashed"
                style={{
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-text-muted)",
                }}
              >
                +{dealtCards.length - 10} more
              </div>
            )}
          </div>

          {/* True Count Input */}
          {challengeActive && !feedbackMessage && (
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <Label
                  htmlFor="runningCount"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Running Count
                </Label>
                <Input
                  id="runningCount"
                  type="number"
                  value={runningCount}
                  onChange={(e) => setRunningCount(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter running count"
                  className="mt-1"
                  autoFocus
                  style={{
                    backgroundColor: "var(--theme-dashboard-bg)",
                    borderColor: "var(--theme-border)",
                    color: "var(--theme-text-primary)",
                  }}
                />
              </div>

              <div>
                <Label
                  htmlFor="trueCount"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  True Count
                </Label>
                <Input
                  id="trueCount"
                  type="number"
                  value={trueCount}
                  onChange={(e) => setTrueCount(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter true count"
                  className="mt-1"
                  style={{
                    backgroundColor: "var(--theme-dashboard-bg)",
                    borderColor: "var(--theme-border)",
                    color: "var(--theme-text-primary)",
                  }}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!runningCount || !trueCount}
                className="w-full"
                style={{
                  backgroundColor: "var(--theme-primary)",
                  color: "white",
                }}
              >
                Submit Counts
              </Button>
            </div>
          )}

          {/* Feedback */}
          {feedbackMessage && lastResult && (
            <div className="space-y-4">
              <Alert
                style={{
                  backgroundColor: lastResult.correct
                    ? "rgba(var(--theme-success-rgb, 34, 197, 94), 0.1)"
                    : "rgba(var(--theme-error-rgb, 239, 68, 68), 0.1)",
                  borderColor: lastResult.correct
                    ? "var(--theme-success)"
                    : "var(--theme-error)",
                }}
              >
                <div className="flex items-start gap-3">
                  {lastResult.correct ? (
                    <CheckCircle2
                      className="h-5 w-5 mt-0.5"
                      style={{ color: "var(--theme-success)" }}
                    />
                  ) : (
                    <XCircle
                      className="h-5 w-5 mt-0.5"
                      style={{ color: "var(--theme-error)" }}
                    />
                  )}
                  <AlertDescription
                    style={{
                      color: lastResult.correct
                        ? "var(--theme-success)"
                        : "var(--theme-error)",
                    }}
                  >
                    {feedbackMessage}
                  </AlertDescription>
                </div>
              </Alert>

              <Button
                onClick={handleContinue}
                className="w-full"
                style={{
                  backgroundColor: "var(--theme-success)",
                  color: "white",
                }}
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: "var(--theme-dashboard-card)",
          border: "1px solid var(--theme-border)",
        }}
      >
        <h3
          className="font-semibold mb-2"
          style={{ color: "var(--theme-primary)" }}
        >
          True Count Calculation:
        </h3>
        <ul
          className="space-y-1 text-sm"
          style={{ color: "var(--theme-text-secondary)" }}
        >
          <li>• True Count = Running Count ÷ Decks Remaining</li>
          <li>
            • Round to the nearest whole number (e.g., +5 running ÷ 2.5 decks =
            +2 true)
          </li>
          <li>• Watch the shoe indicator to estimate decks remaining</li>
          <li>• Positive true count = player advantage</li>
          <li>• True count +2 or higher = increase bet size</li>
          <li>• This is what casinos actually care about!</li>
        </ul>
      </div>
    </div>
  );
}
