import { getAuditLogger } from "../audit/logger";
import type {
  BetPlacedEvent,
  HandActionEvent,
  HandCreatedEvent,
  HandDealtEvent,
  HandSplitEvent,
  InsuranceDeclinedEvent,
  InsuranceTakenEvent,
} from "../audit/types";
import type { ActionType } from "./action";
import { type Bank, Escrow } from "./bank";
import type { Card, Stack } from "./cards";
import type { RuleSet } from "./rules/index";

export class Hand {
  id: string;
  state:
    | "active"
    | "busted"
    | "stood"
    | "blackjack"
    | "surrendered"
    | "won"
    | "lost"
    | "pushed" = "active";
  availableActions: ActionType[] = [];
  hand: Stack = [];
  value: number | undefined = undefined;
  isSoft: boolean = false;
  private bet: Escrow;
  private insuranceBet: Escrow | null = null;
  insuranceOffered: boolean = false;
  public originalHandIndex: number = 0; // Index of original hand for multi-hand play (0, 1, 2...)
  public parentHandId: string | null = null; // ID of parent hand if this is a split hand
  constructor(
    private rules: RuleSet,
    private userId: string,
    public bank: Bank,
    bet: number,
    private dealerUpCard: Card,
    public isSplit: boolean = false,
    public isSplitAce: boolean = false,
    private splitCount: number = 0,
    originalHandIndex: number = 0,
    parentHandId: string | null = null,
  ) {
    this.id = `hand-${crypto.randomUUID()}`;
    this.originalHandIndex = originalHandIndex;
    this.parentHandId = parentHandId;
    if (bet > bank.balance) {
      throw new Error("Insufficient funds to place bet");
    }
    this.bet = new Escrow(this.userId, this.id);
    this.bank.debit(bet, this.id);
    this.bet.credit(bet, this.userId);

    // Audit log hand creation
    getAuditLogger().log<HandCreatedEvent>("hand_created", {
      handId: this.id,
      playerId: this.userId,
      betAmount: bet,
      isSplit: this.isSplit,
      originalHandIndex: this.originalHandIndex,
      parentHandId: this.parentHandId,
    });

    getAuditLogger().log<BetPlacedEvent>("bet_placed", {
      playerId: this.userId,
      handId: this.id,
      amount: bet,
    });
  }

  private assessedHand() {
    const cv = this.handValue;

    if (cv > 21) {
      this.state = "busted";
      this.availableActions = [];
      return this.availableActions;
    }

    if (cv === 21 && this.hand.length === 2 && !this.isSplit) {
      this.state = "blackjack";
      this.availableActions = [];
      return this.availableActions;
    }

    if (this.state === "active") {
      this.availableActions = this.rules.getRuleBasedActions(
        this,
        this.dealerUpCard,
        this.splitCount,
      );
      return this.availableActions;
    }

    return this.availableActions;
  }

  start(cards?: Card | Stack) {
    if (Array.isArray(cards)) {
      this.hand.push(...cards);
    } else if (cards) {
      this.hand.push(cards);
    }

    // Audit log hand dealt
    getAuditLogger().log<HandDealtEvent>("hand_dealt", {
      handId: this.id,
      cards: this.hand.map((c) => ({ rank: c.rank, suit: c.suit })),
      value: this.handValue,
    });

    return this.assessedHand();
  }

  hit(card: Card) {
    const valueBefore = this.handValue;
    this.hand.push(card);
    const valueAfter = this.handValue;

    // Audit log hit action
    getAuditLogger().log<HandActionEvent>("hand_action", {
      handId: this.id,
      playerId: this.userId,
      action: "hit",
      handValueBefore: valueBefore,
      handValueAfter: valueAfter,
    });

    return this.assessedHand();
  }

  stand() {
    const valueBefore = this.handValue;
    this.state = "stood";
    this.availableActions = [];

    // Audit log stand action
    getAuditLogger().log<HandActionEvent>("hand_action", {
      handId: this.id,
      playerId: this.userId,
      action: "stand",
      handValueBefore: valueBefore,
    });

    return this.availableActions;
  }

  surrender() {
    // Can only surrender on first two cards (enforced by rules)
    if (this.hand.length !== 2) {
      throw new Error("Can only surrender on first two cards");
    }

    const valueBefore = this.handValue;
    this.state = "surrendered";
    this.availableActions = [];

    // Audit log surrender action
    getAuditLogger().log<HandActionEvent>("hand_action", {
      handId: this.id,
      playerId: this.userId,
      action: "surrender",
      handValueBefore: valueBefore,
    });

    return this.availableActions;
  }

  double(card: Card) {
    const valueBefore = this.handValue;
    this.hand.push(card);
    const valueAfter = this.handValue;
    const originalBet = this.bet.balance;
    if (this.bank.balance < originalBet) {
      throw new Error("Insufficient funds to double down");
    }
    this.bank.debit(originalBet, this.id);
    this.bet.credit(originalBet, this.userId);
    this.state = "stood";
    this.availableActions = [];

    // Audit log double action
    getAuditLogger().log<HandActionEvent>("hand_action", {
      handId: this.id,
      playerId: this.userId,
      action: "double",
      handValueBefore: valueBefore,
      handValueAfter: valueAfter,
    });

    return this.availableActions;
  }

  split(card1: Card, card2: Card) {
    if (this.bank.balance < this.bet.balance) {
      throw new Error("Insufficient funds to split hand");
    }

    const valueBefore = this.handValue;
    const splitHandCard = this.hand.pop() as Card;
    this.hand.push(card1);
    this.splitCount += 1;
    this.isSplit = true;
    if (this.hand[0].rank === "A") {
      this.isSplitAce = true;
    }
    this.state = "active";
    this.availableActions = this.assessedHand();
    const splitHand = new Hand(
      this.rules,
      this.userId,
      this.bank,
      this.bet.balance,
      this.dealerUpCard,
      true,
      this.isSplitAce,
      this.splitCount,
      this.originalHandIndex, // Inherit original hand index
      this.id, // Set parent hand ID to this hand's ID
    );
    const splitHandActions = splitHand.start([splitHandCard, card2]);

    // Audit log split action
    getAuditLogger().log<HandActionEvent>("hand_action", {
      handId: this.id,
      playerId: this.userId,
      action: "split",
      handValueBefore: valueBefore,
      newHandId: splitHand.id,
    });

    getAuditLogger().log<HandSplitEvent>("hand_split", {
      originalHandId: this.id,
      newHandId: splitHand.id,
      playerId: this.userId,
      additionalBet: this.bet.balance,
    });

    return {
      splitHand,
      splitHandActions,
      originalHand: this,
      originalHandActions: this.availableActions,
    };
  }

  get handValue(): number {
    let value = 0;
    let aceCount = 0;

    // First pass: count all cards, Aces as 11
    for (const card of this.hand) {
      if (card.rank === "A") {
        aceCount += 1;
        value += 11;
      } else if (["K", "Q", "J"].includes(card.rank)) {
        value += 10;
      } else {
        value += parseInt(card.rank, 10);
      }
    }

    // Second pass: convert Aces from 11 to 1 if over 21
    while (value > 21 && aceCount > 0) {
      value -= 10;
      aceCount -= 1;
    }

    return value;
  }

  /**
   * Take insurance bet (half of original bet)
   * Only available when dealer shows Ace
   */
  takeInsurance(): void {
    if (this.insuranceBet) {
      throw new Error("Insurance already taken");
    }

    const insuranceAmount = this.bet.balance / 2;

    if (this.bank.balance < insuranceAmount) {
      throw new Error("Insufficient funds for insurance");
    }

    // Create insurance escrow and debit from player bank
    this.insuranceBet = new Escrow(this.userId, `${this.id}-insurance`);
    this.bank.debit(insuranceAmount, `${this.id}-insurance`);
    this.insuranceBet.credit(insuranceAmount, this.userId);

    // Audit log insurance taken
    getAuditLogger().log<InsuranceTakenEvent>("insurance_taken", {
      playerId: this.userId,
      handId: this.id,
      amount: insuranceAmount,
    });
  }

  /**
   * Decline insurance
   */
  declineInsurance(): void {
    this.insuranceOffered = false;

    // Audit log insurance declined
    getAuditLogger().log<InsuranceDeclinedEvent>("insurance_declined", {
      playerId: this.userId,
      handId: this.id,
    });
  }

  get cards(): Stack {
    return [...this.hand];
  }

  get betAmount(): number {
    return this.bet.balance;
  }

  get escrow(): Escrow {
    return this.bet;
  }

  get hasInsurance(): boolean {
    return this.insuranceBet !== null;
  }

  get insuranceAmount(): number {
    return this.insuranceBet?.balance ?? 0;
  }

  get insuranceEscrow(): Escrow | null {
    return this.insuranceBet;
  }

  /**
   * Serialize hand to a plain object for UI rendering
   * This ensures UI components get fresh data on each render
   */
  toObject() {
    return {
      id: this.id,
      state: this.state,
      cards: [...this.hand],
      handValue: this.handValue,
      isSoft: this.isSoft,
      betAmount: this.bet.balance,
      availableActions: [...this.availableActions],
      isSplit: this.isSplit,
      isSplitAce: this.isSplitAce,
      hasInsurance: this.hasInsurance,
      insuranceAmount: this.insuranceAmount,
      originalHandIndex: this.originalHandIndex,
      parentHandId: this.parentHandId,
    };
  }
}
