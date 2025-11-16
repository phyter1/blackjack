import { Bank } from "./bank";
import type { Card } from "./cards";
import { Hand } from "./hand";
import type { RuleSet } from "./rules";

class PlayerHand extends Hand {
  shoeId: string;
  constructor(
    rules: RuleSet,
    shoeId: string,
    userId: string,
    bank: Bank,
    bet: number,
    dealerUpCard: Card,
    isSplit: boolean = false,
    isSplitAce: boolean = false,
    splitCount: number = 0,
  ) {
    super(
      rules,
      userId,
      bank,
      bet,
      dealerUpCard,
      isSplit,
      isSplitAce,
      splitCount,
    );
    this.id = `player-hand-${crypto.randomUUID()}`;
    this.shoeId = shoeId;
  }
}

class PlayerRound {
  id: string;
  shoeId: string;
  private hands: PlayerHand[] = [];
  constructor(
    shoeId: string,
    private userId: string,
    private bank: Bank,
    private rules: RuleSet,
  ) {
    this.id = `player-round-${crypto.randomUUID()}`;
    this.shoeId = shoeId;
  }

  startHand(
    bet: number,
    isSplit: boolean = false,
    isSplitAce: boolean = false,
    dealerUpCard: Card,
    splitCount: number = 0,
  ) {
    if (bet > this.bank.balance) {
      throw new Error("Insufficient funds to start hand");
    }
    const hand = new PlayerHand(
      this.rules,
      this.shoeId,
      this.userId,
      this.bank,
      bet,
      dealerUpCard,
      isSplit,
      isSplitAce,
      splitCount,
    );
    this.hands.push(hand);
    return hand;
  }

  takeTurn() {
  }
}

class Round {
  id: string;
  shoeId: string;
  private playerHands: PlayerHand[] = [];
  constructor(shoeId: string, playerShoes: PlayerShoe[] = []) {
    this.id = `round-${crypto.randomUUID()}`;
    this.shoeId = shoeId;
  }

  deal() {
  }
}

class PlayerShoe {
  id: string;
  private rounds: PlayerRound[] = [];
  constructor(
    private shoeId: string,
    private userId: string,
    private bank: Bank,
    private rules: RuleSet,
  ) {
    this.id = `player-shoe-${crypto.randomUUID()}`;
  }

  startRound() {
    const round = new PlayerRound(
      this.shoeId,
      this.userId,
      this.bank,
      this.rules,
    );
    this.rounds.push(round);
    return round;
  }
}

class Shoe {
  id: string;
  playerShoes: PlayerShoe[] = [];
  constructor(private playerSessions: PlayerSession[]) {
    this.id = `shoe-${crypto.randomUUID()}`;
    this.playerSessions.forEach((ps) => {
      const playerShoe = ps.startShoe(this.id);
      this.playerShoes.push(playerShoe);
    });
  }

  startRound() {
    const round = new Round(this.id);
    return round;
  }
}

class PlayerSession {
  id: string;
  sessionId: string;
  private shoes: PlayerShoe[] = [];
  constructor(
    sessionId: string,
    private userId: string,
    private bank: Bank,
    private rules: RuleSet,
  ) {
    this.id = `player-session-${crypto.randomUUID()}`;
    this.sessionId = sessionId;
  }

  startShoe(shoeId: string) {
    const shoe = new PlayerShoe(shoeId, this.userId, this.bank, this.rules);
    this.shoes.push(shoe);
    return shoe;
  }
}

class Session {
  id: string;
  private playerSessions: PlayerSession[] = [];
  private shoes: Shoe[] = [];
  constructor(players: [Player, number][], private rules: RuleSet) {
    this.id = `session-${crypto.randomUUID()}`;
    this.playerSessions = players.map(([player, bankroll]) =>
      player.startSession(this.id, bankroll)
    );
  }

  startShoe() {
    const shoe = new Shoe(this.playerSessions);
    this.shoes.push(shoe);
    this.playerSessions.forEach((ps) => {
      ps.startShoe(shoe.id);
    });
    return shoe;
  }
}

class Player {
  id: string;
  private sessions: PlayerSession[] = [];
  constructor(
    public name: string,
    private bank: Bank,
    private rules: RuleSet,
  ) {
    this.id = crypto.randomUUID();
  }

  startSession(sessionId: string, bankroll: number) {
    if (bankroll > this.bank.balance) {
      throw new Error("Insufficient funds to start session");
    }
    this.bank.debit(bankroll, this.id);
    const sessionBank = new Bank(this.id, bankroll);
    const session = new PlayerSession(
      sessionId,
      this.id,
      sessionBank,
      this.rules,
    );
    this.sessions.push(session);
    return session;
  }
}

export class SimpleGame {
  constructor(private players: Player[] = [], private rules: RuleSet) {
  }
}
