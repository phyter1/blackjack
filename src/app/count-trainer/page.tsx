"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCountTrainerStore } from "@/stores/count-trainer";
import { useAppStore } from "@/stores/app";
import { UserService } from "@/services/user-service";
import { BeginnerMode } from "@/components/count-trainer/beginner-mode";
import { IntermediateMode } from "@/components/count-trainer/intermediate-mode";
import { AdvancedMode } from "@/components/count-trainer/advanced-mode";
import { StatsPanel } from "@/components/count-trainer/stats-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeSelector } from "@/components/theme-selector";
import { CardStockSelector } from "@/components/card-stock-selector";
import { CardBackSelector } from "@/components/card-back-selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, RotateCcw, DollarSign, Trophy, Palette } from "lucide-react";

export default function CountTrainerPage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const bank = useAppStore((state) => state.bank);
  const updateBank = useAppStore((state) => state.updateBank);

  const mode = useCountTrainerStore((state) => state.mode);
  const isActive = useCountTrainerStore((state) => state.isActive);
  const practiceBalance = useCountTrainerStore(
    (state) => state.practiceBalance,
  );
  const stats = useCountTrainerStore((state) => state.stats);

  const setMode = useCountTrainerStore((state) => state.setMode);
  const startSession = useCountTrainerStore((state) => state.startSession);
  const endSession = useCountTrainerStore((state) => state.endSession);
  const resetSession = useCountTrainerStore((state) => state.resetSession);
  const cashOut = useCountTrainerStore((state) => state.cashOut);

  const [showCashOutDialog, setShowCashOutDialog] = useState(false);
  const [cashOutAmount, setCashOutAmount] = useState(0);
  const [showThemeDialog, setShowThemeDialog] = useState(false);

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!user) {
      router.push("/");
      return;
    }

    // Start session if not active
    if (!isActive) {
      startSession();
    }
  }, [user, isActive, startSession, router]);

  const handleModeChange = (newMode: string) => {
    setMode(newMode as "beginner" | "intermediate" | "advanced");
  };

  const handleBackToDashboard = () => {
    endSession();
    router.push("/");
  };

  const handleResetSession = () => {
    if (
      confirm(
        "Are you sure you want to reset? This will clear all stats and reset your practice balance to $1,000.",
      )
    ) {
      resetSession();
    }
  };

  const handleCashOut = () => {
    const profit = cashOut();
    if (profit > 0 && user) {
      setCashOutAmount(profit);
      setShowCashOutDialog(true);
    } else {
      alert(
        "You need to earn a profit above your starting balance ($1,000) to cash out!",
      );
    }
  };

  const confirmCashOut = () => {
    if (user && cashOutAmount > 0) {
      // Add profit to user's real bankroll
      const updatedBank = UserService.deposit(user.id, cashOutAmount);
      updateBank(updatedBank);
      setShowCashOutDialog(false);
      alert(
        `Successfully cashed out $${cashOutAmount.toLocaleString()} to your bankroll!`,
      );
    }
  };

  if (!user) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4"
      style={{ background: "var(--theme-dashboard-bg)" }}
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              style={{
                borderColor: "var(--theme-border)",
                color: "var(--theme-text-primary)",
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--theme-primary)" }}
              >
                Count Trainer
              </h1>
              <p style={{ color: "var(--theme-text-secondary)" }}>
                Master blackjack counting skills and earn rewards
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowThemeDialog(true)}
              variant="outline"
              size="sm"
              style={{
                borderColor: "var(--theme-border)",
                color: "var(--theme-text-primary)",
              }}
            >
              <Palette className="h-4 w-4 mr-2" />
              Theme
            </Button>
            {practiceBalance > 1500 && (
              <Button
                onClick={handleCashOut}
                style={{
                  backgroundColor: "var(--theme-success)",
                  color: "white",
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Cash Out
              </Button>
            )}
            <Button
              onClick={handleResetSession}
              variant="outline"
              style={{
                borderColor: "var(--theme-border)",
                color: "var(--theme-text-primary)",
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Stats Panel */}
        <StatsPanel />

        {/* Mode Tabs */}
        <Tabs
          value={mode}
          onValueChange={handleModeChange}
          className="space-y-3"
        >
          <TabsList
            className="grid w-full grid-cols-3"
            style={{
              backgroundColor: "var(--theme-dashboard-card)",
              border: "1px solid var(--theme-border)",
            }}
          >
            <TabsTrigger
              value="beginner"
              style={{
                color: "var(--theme-text-secondary)",
              }}
              className="data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white"
            >
              Beginner
            </TabsTrigger>
            <TabsTrigger
              value="intermediate"
              style={{
                color: "var(--theme-text-secondary)",
              }}
              className="data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white"
            >
              Intermediate
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              style={{
                color: "var(--theme-text-secondary)",
              }}
              className="data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white"
            >
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="beginner">
            <BeginnerMode />
          </TabsContent>

          <TabsContent value="intermediate">
            <IntermediateMode />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedMode />
          </TabsContent>
        </Tabs>
      </div>

      {/* Cash Out Dialog */}
      <Dialog open={showCashOutDialog} onOpenChange={setShowCashOutDialog}>
        <DialogContent
          style={{
            backgroundColor: "var(--theme-dashboard-card)",
            borderColor: "var(--theme-border)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--theme-primary)" }}>
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                Cash Out Earnings
              </div>
            </DialogTitle>
            <DialogDescription style={{ color: "var(--theme-text-secondary)" }}>
              Congratulations! You've earned a profit and can cash out to your
              main bankroll.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div
              className="text-center text-4xl font-bold mb-2"
              style={{ color: "var(--theme-success)" }}
            >
              ${cashOutAmount.toLocaleString()}
            </div>
            <p
              className="text-center"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              This amount will be added to your bankroll.
            </p>
            <p
              className="text-center text-sm mt-2"
              style={{ color: "var(--theme-text-muted)" }}
            >
              Your practice balance will reset to $1,000.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCashOutDialog(false)}
              style={{
                borderColor: "var(--theme-border)",
                color: "var(--theme-text-primary)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCashOut}
              style={{
                backgroundColor: "var(--theme-success)",
                color: "white",
              }}
            >
              Confirm Cash Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Theme Dialog */}
      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent
          className="max-w-4xl max-h-[80vh] overflow-y-auto"
          style={{
            backgroundColor: "var(--theme-dashboard-card)",
            borderColor: "var(--theme-border)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--theme-primary)" }}>
              <div className="flex items-center gap-2">
                <Palette className="h-6 w-6" />
                Appearance Settings
              </div>
            </DialogTitle>
            <DialogDescription style={{ color: "var(--theme-text-secondary)" }}>
              Customize your casino and card appearance
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Card Appearance Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium" style={{ color: "var(--theme-text-primary)" }}>
                Card Appearance
              </h3>
              <CardStockSelector />
              <CardBackSelector />
            </div>

            {/* Table Theme Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium" style={{ color: "var(--theme-text-primary)" }}>
                Table Theme
              </h3>
              <ThemeSelector />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
