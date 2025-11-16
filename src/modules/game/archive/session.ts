import { Stack } from "./cards";
import { Round } from "./round";
import { newShoeStack, Shoe } from "./shoe";

export const SESSION_ACTION_START_ROUND = "start_round";
export const SESSION_ACTION_END_ROUND = "end_round";
export const SESSION_ACTION_COLLECT_BET = "collect_bet";
export const SESSION_ACTION_PAYOUT_WIN = "payout_win";

export type StartRound = {
  type: typeof SESSION_ACTION_START_ROUND;
};

export type EndRound = {
  type: typeof SESSION_ACTION_END_ROUND;
};

export type CollectBet = {
  type: typeof SESSION_ACTION_COLLECT_BET;
  playerId: string;
  amount: number;
};

export type PayoutWin = {
  type: typeof SESSION_ACTION_PAYOUT_WIN;
  playerId: string;
  amount: number;
};

export class Session {
  id: string;
  metadata: {
    startTime: number;
    gameType: "s17" | "h17";
    numDecks: number;
    // how deep into the shoe the cut card is placed, as a percentage (e.g., 0.75 means 75% of the shoe will be dealt before reshuffling)
    startingPenetration: number;
    startingDeck: Stack;
  };
  houseBankroll: number;
  currentRoundNumber: number = 0;
  rounds: Round[];
  shoe: Shoe;

  constructor(
    id: string,
    gameType: "s17" | "h17",
    numDecks: number,
    startingPenetration: number,
    initialBank: number,
  ) {
    this.shoe = new Shoe(numDecks, startingPenetration);
    this.id = id;
    this.metadata = {
      startTime: Date.now(),
      gameType,
      numDecks,
      startingPenetration,
      startingDeck: this.
    };
    this.houseBankroll = initialBank;
    this.rounds = [];
  }

  get currentRound() {
    return this.rounds.find((r) => r.roundNumber === this.currentRoundNumber);
  }
}
