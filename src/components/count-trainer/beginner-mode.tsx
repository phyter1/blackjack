"use client";

import { useState } from "react";
import { useCountTrainerStore } from "@/stores/count-trainer";
import { CardMeisterCard } from "@/components/cardmeister-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

export function BeginnerMode() {
  const currentHand = useCountTrainerStore((state) => state.currentHand);
  const challengeActive = useCountTrainerStore(
    (state) => state.challengeActive,
  );
  const feedbackMessage = useCountTrainerStore(
    (state) => state.feedbackMessage,
  );
  const lastResult = useCountTrainerStore((state) => state.lastResult);
  const generateHandChallenge = useCountTrainerStore(
    (state) => state.generateHandChallenge,
  );
  const submitHandAnswer = useCountTrainerStore(
    (state) => state.submitHandAnswer,
  );
  const clearFeedback = useCountTrainerStore((state) => state.clearFeedback);

  const [handValue, setHandValue] = useState("");
  const [isSoft, setIsSoft] = useState(false);

  const handleSubmit = () => {
    const value = Number.parseInt(handValue);
    if (Number.isNaN(value) || value < 2) {
      return;
    }

    submitHandAnswer(value, isSoft);
    setHandValue("");
    setIsSoft(false);
  };

  const handleNextChallenge = () => {
    clearFeedback();
    generateHandChallenge();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && handValue) {
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
          Beginner Mode: Hand Total Counting
        </h2>
        <p style={{ color: "var(--theme-text-secondary)" }}>
          Calculate the total value of the hand. Remember: Aces can be 1 or 11,
          face cards are 10.
        </p>
      </div>

      {currentHand.length === 0 ? (
        <div className="text-center py-12">
          <p
            className="mb-4"
            style={{ color: "var(--theme-text-secondary)" }}
          >
            Ready to start practicing hand counting?
          </p>
          <Button
            onClick={handleNextChallenge}
            style={{
              backgroundColor: "var(--theme-success)",
              color: "white",
            }}
          >
            Start Challenge
          </Button>
        </div>
      ) : (
        <>
          {/* Card Display */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: "var(--theme-dashboard-card)",
              border: "1px solid var(--theme-border)",
            }}
          >
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {currentHand.map((card, index) => (
                <CardMeisterCard key={`${card.suit}-${card.rank}-${index}`} card={card} size="lg" />
              ))}
            </div>

            {/* Answer Input */}
            {challengeActive && (
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <Label
                    htmlFor="handValue"
                    style={{ color: "var(--theme-text-primary)" }}
                  >
                    What is the hand total?
                  </Label>
                  <Input
                    id="handValue"
                    type="number"
                    min="2"
                    value={handValue}
                    onChange={(e) => setHandValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter hand value"
                    className="mt-1"
                    style={{
                      backgroundColor: "var(--theme-dashboard-bg)",
                      borderColor: "var(--theme-border)",
                      color: "var(--theme-text-primary)",
                    }}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isSoft"
                    checked={isSoft}
                    onCheckedChange={setIsSoft}
                  />
                  <Label
                    htmlFor="isSoft"
                    style={{ color: "var(--theme-text-primary)" }}
                  >
                    Soft hand (contains Ace counted as 11)
                  </Label>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!handValue}
                  className="w-full"
                  style={{
                    backgroundColor: "var(--theme-primary)",
                    color: "white",
                  }}
                >
                  Submit Answer
                </Button>
              </div>
            )}

            {/* Feedback */}
            {feedbackMessage && lastResult && (
              <div className="mt-4">
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
                  onClick={handleNextChallenge}
                  className="w-full mt-4"
                  style={{
                    backgroundColor: "var(--theme-success)",
                    color: "white",
                  }}
                >
                  Next Challenge
                </Button>
              </div>
            )}
          </div>

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
              Tips:
            </h3>
            <ul
              className="space-y-1 text-sm"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              <li>• Number cards (2-9) are worth their face value</li>
              <li>• Face cards (J, Q, K) are worth 10</li>
              <li>• Aces are worth 1 or 11</li>
              <li>
                • A "soft" hand contains an Ace counted as 11 (e.g., A-6 = Soft
                17)
              </li>
              <li>
                • A "hard" hand has no Ace or the Ace counts as 1 (e.g., 10-7 =
                Hard 17)
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
