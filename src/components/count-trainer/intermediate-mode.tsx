"use client";

import { useState } from "react";
import { useCountTrainerStore } from "@/stores/count-trainer";
import { CardMeisterCard } from "@/components/cardmeister-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Shuffle } from "lucide-react";

export function IntermediateMode() {
  const dealtCards = useCountTrainerStore((state) => state.dealtCards);
  const challengeActive = useCountTrainerStore(
    (state) => state.challengeActive,
  );
  const feedbackMessage = useCountTrainerStore(
    (state) => state.feedbackMessage,
  );
  const lastResult = useCountTrainerStore((state) => state.lastResult);
  const dealCard = useCountTrainerStore((state) => state.dealCard);
  const submitRunningCount = useCountTrainerStore(
    (state) => state.submitRunningCount,
  );
  const clearFeedback = useCountTrainerStore((state) => state.clearFeedback);
  const resetShoe = useCountTrainerStore((state) => state.resetShoe);

  const [runningCount, setRunningCount] = useState("");

  const handleDealCard = () => {
    clearFeedback();
    dealCard();
  };

  const handleSubmit = () => {
    const count = Number.parseInt(runningCount);
    if (Number.isNaN(count)) return;

    submitRunningCount(count);
    setRunningCount("");
  };

  const handleContinue = () => {
    clearFeedback();
    setRunningCount("");
  };

  const handleResetShoe = () => {
    resetShoe();
    clearFeedback();
    setRunningCount("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && runningCount) {
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
          Intermediate Mode: Running Count
        </h2>
        <p style={{ color: "var(--theme-text-secondary)" }}>
          Keep track of the running count as cards are dealt. Use the Hi-Lo
          system: 2-6 = +1, 7-9 = 0, 10-A = -1.
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

          {/* Running Count Input */}
          {challengeActive && !feedbackMessage && (
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <Label
                  htmlFor="runningCount"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  What is the running count?
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

              <Button
                onClick={handleSubmit}
                disabled={!runningCount}
                className="w-full"
                style={{
                  backgroundColor: "var(--theme-primary)",
                  color: "white",
                }}
              >
                Submit Count
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
          Hi-Lo Counting System:
        </h3>
        <ul
          className="space-y-1 text-sm"
          style={{ color: "var(--theme-text-secondary)" }}
        >
          <li>• Low cards (2, 3, 4, 5, 6): +1</li>
          <li>• Neutral cards (7, 8, 9): 0</li>
          <li>• High cards (10, J, Q, K, A): -1</li>
          <li>• Start at 0 and add/subtract as cards are dealt</li>
          <li>• A positive count means more high cards remain in the shoe</li>
          <li>• Deal cards and test yourself periodically!</li>
        </ul>
      </div>
    </div>
  );
}
