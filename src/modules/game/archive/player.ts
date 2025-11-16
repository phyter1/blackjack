import type { ActionType } from "./action";
import type { Stack } from "./cards";

export type Player = {
  id: string;
  name: string;
  bankroll: number;
  sessions: PlayerSession[];
};

export class PlayerSession {
  player: Player;
  sessionId: string;
  startingBankroll: number;
  endingBankroll?: number;
  rounds: {
    roundNumber: number;
    hands: PlayerHand[];
  }[];
  turns: PlayerTurn[];
  status: "active" | "completed";

  constructor(
    player: Player,
    sessionId: string,
    startingBankroll: number,
  ) {
    this.player = player;
    this.sessionId = sessionId;
    this.startingBankroll = startingBankroll;
    this.rounds = [];
    this.turns = [];
    this.status = "active";
  }

  startNewRound(roundNumber: number) {
    this.rounds.push({
      roundNumber,
      hands: [],
    });
  }

  endSession(endingBankroll: number) {
    this.endingBankroll = endingBankroll;
    this.status = "completed";
  }
}

export class PlayerRound {
  roundNumber: number;
  hands: PlayerHand[];

  constructor(roundNumber: number) {
    this.roundNumber = roundNumber;
    this.hands = [];
  }

  newHand(bet: number, cards: Stack) {
    const hand: PlayerHand = {
      cards,
      bet,
      actionHistory: [],
      outcome: "pending",
    };
    this.hands.push(hand);
    return hand;
  }

  recordAction(handIndex: number, action: ActionType) {
    this.hands[handIndex].actionHistory.push(action);
  }

  setHandOutcome(handIndex: number, outcome: "win" | "lose" | "push") {
    this.hands[handIndex].outcome = outcome;
  }
}

export type PlayerHand = {
  cards: Stack;
  bet: number;
  actionHistory: ActionType[];
  outcome: "pending" | "win" | "lose" | "push"; // | "surrender";
};

export type PlayerTurn = {
  sessionId: string;
  roundNumber: number;
  playerHandIndex: number;
  action: ActionType;
};

export class PlayerManager {
  id: string;
  name: string;
  bankroll: number;
  sessions: PlayerSession[];

  constructor(id: string, name: string, bankroll: number) {
    this.id = id;
    this.name = name;
    this.bankroll = bankroll;
    this.sessions = [];
  }

  startNewSession(sessionId: string, bankroll: number) {
    const newSession: PlayerSession = {
      player: this,
      sessionId,
      startingBankroll: bankroll,
      rounds: [],
      turns: [],
      status: "active",
    };
    this.sessions.push(newSession);
    return newSession;
  }
}
