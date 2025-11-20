"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface NavigationControlsProps {
  currentIndex: number;
  totalDecisions: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
}

export function NavigationControls({
  currentIndex,
  totalDecisions,
  isPlaying,
  onPrevious,
  onNext,
  onPlayPause,
}: NavigationControlsProps) {
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            variant="outline"
            className="border-gray-700"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={onPlayPause}
              className={
                isPlaying
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
          </div>

          <Button
            onClick={onNext}
            disabled={currentIndex >= totalDecisions - 1}
            variant="outline"
            className="border-gray-700"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / totalDecisions) * 100}%`,
              }}
            />
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            {currentIndex + 1} / {totalDecisions}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
