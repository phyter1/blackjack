"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { TerminalLine, TerminalSegment } from "@/lib/terminal-display";

interface TerminalProps {
  lines: TerminalLine[];
  className?: string;
}

const colorClasses: Record<string, string> = {
  white: "text-white",
  red: "text-red-500",
  green: "text-green-500",
  yellow: "text-yellow-500",
  blue: "text-blue-500",
  magenta: "text-magenta-500",
  cyan: "text-cyan-500",
  gray: "text-gray-500",
};

function TerminalSegmentComponent({ segment }: { segment: TerminalSegment }) {
  const className = cn(
    segment.color && colorClasses[segment.color],
    segment.bold && "font-bold",
  );

  return <span className={className}>{segment.text}</span>;
}

export function Terminal({ lines, className }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      ref={terminalRef}
      className={cn(
        "bg-black text-white text-sm p-4 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900",
        className,
      )}
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontFeatureSettings: "'liga' 0, 'calt' 0",
        letterSpacing: "0",
      }}
    >
      <div className="whitespace-pre">
        {lines.map((line, lineIndex) => (
          <div key={lineIndex}>
            {line.map((segment, segmentIndex) => (
              <TerminalSegmentComponent key={segmentIndex} segment={segment} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
