"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { Card } from "@/modules/game/cards";
import { selectSettings, useSettingsStore } from "@/stores/settings";
import { SETTINGS_CONSTRAINTS } from "@/types/settings";
import { AnimatedCard } from "./animated-card";
import { CardBackSelector } from "./card-back-selector";
import { CardStockSelector } from "./card-stock-selector";
import { ThemeSelector } from "./theme-selector";

// Sample cards for preview
const SAMPLE_CARDS: Card[] = [
  { suit: "hearts", rank: "A" },
  { suit: "diamonds", rank: "K" },
];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showTrainerSidebar?: boolean;
  onToggleTrainer?: () => void;
  showCount?: boolean;
  onToggleCount?: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  showTrainerSidebar,
  onToggleTrainer,
  showCount,
  onToggleCount,
}: SettingsDialogProps) {
  const settings = useSettingsStore(selectSettings);
  const updateAnimationSettings = useSettingsStore(
    (state) => state.updateAnimationSettings,
  );
  const updateUISizeSettings = useSettingsStore(
    (state) => state.updateUISizeSettings,
  );
  const resetSettings = useSettingsStore((state) => state.resetSettings);
  const [previewKey, setPreviewKey] = useState(0);

  // State for local changes before saving
  const [localAnimationSettings, setLocalAnimationSettings] = useState(
    settings.animations,
  );
  const [localUISizeSettings, setLocalUISizeSettings] = useState(
    settings.uiSize,
  );

  useEffect(() => {
    setLocalAnimationSettings(settings.animations);
  }, [settings.animations]);

  useEffect(() => {
    setLocalUISizeSettings(settings.uiSize);
  }, [settings.uiSize]);

  const handleDealingSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setLocalAnimationSettings((prev) => ({ ...prev, dealingSpeed: newSpeed }));
    // Trigger preview re-render
    setPreviewKey((prev) => prev + 1);
  };

  const handleEnableAnimationsChange = (checked: boolean) => {
    setLocalAnimationSettings((prev) => ({
      ...prev,
      enableAnimations: checked,
    }));
    // Trigger preview re-render
    setPreviewKey((prev) => prev + 1);
  };

  const handleCardScaleChange = (value: number[]) => {
    setLocalUISizeSettings((prev) => ({ ...prev, cardScale: value[0] }));
  };

  const handleChipScaleChange = (value: number[]) => {
    setLocalUISizeSettings((prev) => ({ ...prev, chipScale: value[0] }));
  };

  const handleSave = () => {
    updateAnimationSettings(localAnimationSettings);
    updateUISizeSettings(localUISizeSettings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalAnimationSettings(settings.animations);
    setLocalUISizeSettings(settings.uiSize);
    onOpenChange(false);
  };

  const handleReset = () => {
    resetSettings();
    setLocalAnimationSettings(settings.animations);
    setLocalUISizeSettings(settings.uiSize);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogDescription>
            Customize your blackjack game experience
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Theme Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Theme</h3>
            <ThemeSelector compact />
          </div>

          {/* Card Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Card Appearance</h3>
            <CardStockSelector />
            <CardBackSelector />
          </div>

          {/* Game Settings Section */}
          {(onToggleTrainer || onToggleCount) && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Game Options</h3>

              {/* Show Trainer Toggle */}
              {onToggleTrainer !== undefined && (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="show-trainer">Show Trainer</Label>
                    <p className="text-xs text-muted-foreground">
                      Display strategy trainer sidebar
                    </p>
                  </div>
                  <Switch
                    id="show-trainer"
                    checked={showTrainerSidebar}
                    onCheckedChange={onToggleTrainer}
                  />
                </div>
              )}

              {/* Show Card Count Toggle */}
              {/* Card count display is currently not supported. Toggle removed. */}
            </div>
          )}

          {/* UI Size Settings Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">UI Size</h3>

            {/* Card Scale Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="card-scale">Card Size</Label>
                <span className="text-sm text-muted-foreground">
                  {localUISizeSettings.cardScale}%
                </span>
              </div>
              <Slider
                id="card-scale"
                min={SETTINGS_CONSTRAINTS.uiSize.cardScale.min}
                max={SETTINGS_CONSTRAINTS.uiSize.cardScale.max}
                step={SETTINGS_CONSTRAINTS.uiSize.cardScale.step}
                value={[localUISizeSettings.cardScale]}
                onValueChange={handleCardScaleChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Small (50%)</span>
                <span>Default (100%)</span>
                <span>Large (150%)</span>
              </div>
            </div>

            {/* Chip Scale Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="chip-scale">Chip & Button Size</Label>
                <span className="text-sm text-muted-foreground">
                  {localUISizeSettings.chipScale}%
                </span>
              </div>
              <Slider
                id="chip-scale"
                min={SETTINGS_CONSTRAINTS.uiSize.chipScale.min}
                max={SETTINGS_CONSTRAINTS.uiSize.chipScale.max}
                step={SETTINGS_CONSTRAINTS.uiSize.chipScale.step}
                value={[localUISizeSettings.chipScale]}
                onValueChange={handleChipScaleChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Small (50%)</span>
                <span>Default (100%)</span>
                <span>Large (150%)</span>
              </div>
            </div>
          </div>

          {/* Animation Settings Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Animation Settings</h3>

            {/* Enable Animations Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="enable-animations">Enable Animations</Label>
                <p className="text-xs text-muted-foreground">
                  Show card dealing animations
                </p>
              </div>
              <Switch
                id="enable-animations"
                checked={localAnimationSettings.enableAnimations}
                onCheckedChange={handleEnableAnimationsChange}
              />
            </div>

            {/* Dealing Speed Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="dealing-speed">Dealing Speed</Label>
                <span className="text-sm text-muted-foreground">
                  {localAnimationSettings.dealingSpeed}ms per card
                </span>
              </div>
              <Slider
                id="dealing-speed"
                min={SETTINGS_CONSTRAINTS.animations.dealingSpeed.min}
                max={SETTINGS_CONSTRAINTS.animations.dealingSpeed.max}
                step={SETTINGS_CONSTRAINTS.animations.dealingSpeed.step}
                value={[localAnimationSettings.dealingSpeed]}
                onValueChange={handleDealingSpeedChange}
                disabled={!localAnimationSettings.enableAnimations}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fast (100ms)</span>
                <span>Slow (1000ms)</span>
              </div>
            </div>

            {/* Preview Section */}
            {localAnimationSettings.enableAnimations && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div
                  className="rounded-lg p-4 flex justify-center items-center h-32"
                  style={{
                    background: `radial-gradient(ellipse at center, var(--theme-table-felt-start), var(--theme-table-felt-end))`,
                  }}
                >
                  <div className="flex gap-2" key={previewKey}>
                    {SAMPLE_CARDS.map((card, idx) => (
                      <div
                        key={`preview-${idx}-${previewKey}`}
                        style={{
                          marginLeft: idx > 0 ? "-20px" : "0",
                          zIndex: idx,
                        }}
                      >
                        <AnimatedCard
                          card={card}
                          size="sm"
                          dealDelay={idx * localAnimationSettings.dealingSpeed}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Cards will appear with a {localAnimationSettings.dealingSpeed}
                  ms delay between each
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
