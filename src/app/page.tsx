import { Suspense } from "react";
import { BlackjackApp } from "@/components/blackjack-app";

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <BlackjackApp />
    </Suspense>
  );
}
