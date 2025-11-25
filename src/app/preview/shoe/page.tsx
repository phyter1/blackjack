"use client";

import { useState } from "react";
import { ShoeDisplay } from "@/components/table/shoe-display";
import { DiscardTray } from "@/components/table/discard-tray";
import { CardBackSelector } from "@/components/card-back-selector";
import { CardStockSelector } from "@/components/card-stock-selector";
import { Card as CardUI } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function ShoePreviewPage() {
  // Deck configuration
  const [numDecks, setNumDecks] = useState(6);
  const totalCards = numDecks * 52;

  // Shoe state
  const [cardsDealt, setCardsDealt] = useState(156); // ~3 decks dealt
  const [cutCardPosition, setCutCardPosition] = useState(52); // 1 deck from end

  // Calculate derived values
  const remainingCards = totalCards - cardsDealt;
  const penetration = cardsDealt / totalCards;
  const isComplete = remainingCards <= cutCardPosition;

  const resetToDefaults = () => {
    setNumDecks(6);
    setCardsDealt(156);
    setCutCardPosition(52);
  };

  return (
    <div className="min-h-screen bg-[var(--theme-background)] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-[var(--theme-text-primary)]">
            Shoe Component Preview
          </h1>
          <p className="text-[var(--theme-text-muted)]">
            Preview and test the shoe indicator with different configurations
          </p>
        </div>

        {/* Shoe & Discard Tray Preview */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--theme-text-primary)]">
                Shoe & Discard Tray
              </h2>
              <Button
                onClick={resetToDefaults}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            <div className="flex justify-center gap-8 py-8">
              {/* Discard Tray */}
              <div className="flex flex-col items-center gap-2">
                {/* <div className="text-xs font-medium text-[var(--theme-text-muted)]">Discard Tray</div> */}
                <div className="relative h-[400px] w-[120px] flex items-center justify-center">
                  <div className="[&>div]:!static [&>div]:!transform-none">
                    <DiscardTray
                      discardedCards={cardsDealt}
                      totalCards={totalCards}
                    />
                  </div>
                </div>
              </div>

              {/* Shoe */}
              <div className="flex flex-col items-center gap-2">
                {
                  /* <div className="text-xs font-medium text-[var(--theme-text-muted)]">
                  Shoe
                </div> */
                }
                <div className="relative h-[400px] w-[120px] flex items-center justify-center">
                  <div className="[&>div]:!static [&>div]:!transform-none">
                    <ShoeDisplay
                      remainingCards={remainingCards}
                      totalCards={totalCards}
                      cutCardPosition={cutCardPosition}
                      penetration={penetration}
                      isComplete={isComplete}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardUI>

        {/* Deck Configuration */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">
              Deck Configuration
            </h3>

            {/* Number of Decks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-[var(--theme-text-primary)]">
                  Number of Decks
                </Label>
                <span className="text-sm text-[var(--theme-text-muted)]">
                  {numDecks} {numDecks === 1 ? "deck" : "decks"} ({totalCards}
                  {" "}
                  cards)
                </span>
              </div>
              <Slider
                value={[numDecks]}
                onValueChange={([value]) => {
                  setNumDecks(value);
                  // Reset dealt cards if they exceed new total
                  if (cardsDealt > value * 52) {
                    setCardsDealt(Math.floor((value * 52) / 2));
                  }
                  // Reset cut card if it exceeds new total
                  if (cutCardPosition > value * 52) {
                    setCutCardPosition(52);
                  }
                }}
                min={1}
                max={8}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[var(--theme-text-muted)]">
                <span>1 deck</span>
                <span>8 decks</span>
              </div>
            </div>

            {/* Cards Dealt */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-[var(--theme-text-primary)]">
                  Cards Dealt
                </Label>
                <span className="text-sm text-[var(--theme-text-muted)]">
                  {cardsDealt} / {totalCards}{" "}
                  cards ({((cardsDealt / totalCards) * 100).toFixed(1)}%)
                </span>
              </div>
              <Slider
                value={[cardsDealt]}
                onValueChange={([value]) => setCardsDealt(value)}
                min={0}
                max={totalCards}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[var(--theme-text-muted)]">
                <span>0 cards</span>
                <span>{totalCards} cards</span>
              </div>
            </div>

            {/* Cut Card Position */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-[var(--theme-text-primary)]">
                  Cut Card Position
                </Label>
                <span className="text-sm text-[var(--theme-text-muted)]">
                  {cutCardPosition}{" "}
                  cards from end ({((cutCardPosition / totalCards) * 100)
                    .toFixed(1)}%)
                </span>
              </div>
              <Slider
                value={[cutCardPosition]}
                onValueChange={([value]) => setCutCardPosition(value)}
                min={0}
                max={totalCards}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[var(--theme-text-muted)]">
                <span>0 cards</span>
                <span>{totalCards} cards</span>
              </div>
              <p className="text-xs text-[var(--theme-text-muted)] italic">
                Cut card position indicates when the shoe needs to be
                reshuffled. Typically set to 1-2 decks from the end.
              </p>
            </div>
          </div>
        </CardUI>

        {/* Status Information */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">
              Status Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-[var(--theme-text-muted)]">
                  Remaining Cards
                </div>
                <div className="text-2xl font-bold text-[var(--theme-text-primary)]">
                  {remainingCards}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-[var(--theme-text-muted)]">
                  Penetration
                </div>
                <div className="text-2xl font-bold text-[var(--theme-text-primary)]">
                  {(penetration * 100).toFixed(1)}%
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-[var(--theme-text-muted)]">
                  Cards Until Cut
                </div>
                <div className="text-2xl font-bold text-[var(--theme-text-primary)]">
                  {Math.max(0, cutCardPosition - remainingCards)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-[var(--theme-text-muted)]">
                  Shoe Status
                </div>
                <div
                  className={`text-lg font-bold ${
                    isComplete ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {isComplete ? "Complete" : "Active"}
                </div>
              </div>
            </div>
          </div>
        </CardUI>

        {/* Card Back Design Settings */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mb-4">
            Card Back Design
          </h3>
          <CardBackSelector />
        </CardUI>

        {/* Card Stock Color Settings */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mb-4">
            Card Stock Color
          </h3>
          <CardStockSelector />
        </CardUI>

        {/* Quick Presets */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">
              Quick Presets
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => {
                  setNumDecks(6);
                  setCardsDealt(0);
                  setCutCardPosition(52);
                }}
                variant="outline"
                className="h-auto flex-col gap-1 py-3"
              >
                <span className="font-semibold">Fresh Shoe</span>
                <span className="text-xs text-[var(--theme-text-muted)]">
                  6 decks, 0 dealt
                </span>
              </Button>

              <Button
                onClick={() => {
                  setNumDecks(6);
                  setCardsDealt(156);
                  setCutCardPosition(52);
                }}
                variant="outline"
                className="h-auto flex-col gap-1 py-3"
              >
                <span className="font-semibold">Mid Game</span>
                <span className="text-xs text-[var(--theme-text-muted)]">
                  ~50% dealt
                </span>
              </Button>

              <Button
                onClick={() => {
                  setNumDecks(6);
                  setCardsDealt(260);
                  setCutCardPosition(52);
                }}
                variant="outline"
                className="h-auto flex-col gap-1 py-3"
              >
                <span className="font-semibold">Near Cut</span>
                <span className="text-xs text-[var(--theme-text-muted)]">
                  ~83% dealt
                </span>
              </Button>

              <Button
                onClick={() => {
                  setNumDecks(6);
                  setCardsDealt(312);
                  setCutCardPosition(52);
                }}
                variant="outline"
                className="h-auto flex-col gap-1 py-3"
              >
                <span className="font-semibold">Complete</span>
                <span className="text-xs text-[var(--theme-text-muted)]">
                  Needs reshuffle
                </span>
              </Button>

              <Button
                onClick={() => {
                  setNumDecks(1);
                  setCardsDealt(0);
                  setCutCardPosition(13);
                }}
                variant="outline"
                className="h-auto flex-col gap-1 py-3"
              >
                <span className="font-semibold">Single Deck</span>
                <span className="text-xs text-[var(--theme-text-muted)]">
                  1 deck fresh
                </span>
              </Button>

              <Button
                onClick={() => {
                  setNumDecks(2);
                  setCardsDealt(0);
                  setCutCardPosition(26);
                }}
                variant="outline"
                className="h-auto flex-col gap-1 py-3"
              >
                <span className="font-semibold">Double Deck</span>
                <span className="text-xs text-[var(--theme-text-muted)]">
                  2 decks fresh
                </span>
              </Button>

              <Button
                onClick={() => {
                  setNumDecks(8);
                  setCardsDealt(0);
                  setCutCardPosition(104);
                }}
                variant="outline"
                className="h-auto flex-col gap-1 py-3"
              >
                <span className="font-semibold">8-Deck Shoe</span>
                <span className="text-xs text-[var(--theme-text-muted)]">
                  Max decks
                </span>
              </Button>

              <Button
                onClick={() => {
                  setNumDecks(6);
                  setCardsDealt(208);
                  setCutCardPosition(78);
                }}
                variant="outline"
                className="h-auto flex-col gap-1 py-3"
              >
                <span className="font-semibold">Deep Penetration</span>
                <span className="text-xs text-[var(--theme-text-muted)]">
                  75% pen, 1.5 deck cut
                </span>
              </Button>
            </div>
          </div>
        </CardUI>
      </div>
    </div>
  );
}
