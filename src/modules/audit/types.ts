/**
 * Audit Trail Event Types
 */

export type AuditEventType =
  // Bank/Escrow transactions
  | "bank_credit"
  | "bank_debit"
  | "escrow_credit"
  | "escrow_debit"
  | "escrow_transfer"
  // Session events
  | "session_start"
  | "session_end"
  | "player_join"
  | "player_leave"
  // Shoe events
  | "shoe_created"
  | "shoe_shuffled"
  | "shoe_depleted"
  | "card_dealt"
  // Round events
  | "round_start"
  | "round_complete"
  | "bet_placed"
  | "insurance_offered"
  | "insurance_taken"
  | "insurance_declined"
  | "insurance_resolved"
  // Hand events
  | "hand_created"
  | "hand_dealt"
  | "hand_action"
  | "hand_split"
  | "hand_settled"
  // Game state
  | "game_state_change";

export interface BaseAuditEvent {
  id: string;
  timestamp: Date;
  type: AuditEventType;
  sessionId?: string;
  roundNumber?: number;
}

// Bank/Escrow events
export interface BankCreditEvent extends BaseAuditEvent {
  type: "bank_credit";
  bankId: string;
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
}

export interface BankDebitEvent extends BaseAuditEvent {
  type: "bank_debit";
  bankId: string;
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
}

export interface EscrowCreditEvent extends BaseAuditEvent {
  type: "escrow_credit";
  escrowId: string;
  fromId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
}

export interface EscrowDebitEvent extends BaseAuditEvent {
  type: "escrow_debit";
  escrowId: string;
  toId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
}

export interface EscrowTransferEvent extends BaseAuditEvent {
  type: "escrow_transfer";
  fromEscrowId: string;
  toEscrowId: string;
  amount: number;
}

// Session events
export interface SessionStartEvent extends BaseAuditEvent {
  type: "session_start";
  sessionId: string;
  numDecks: number;
  penetration: number;
  houseInitialBankroll: number;
}

export interface SessionEndEvent extends BaseAuditEvent {
  type: "session_end";
  sessionId: string;
  totalRounds: number;
  houseFinalBankroll: number;
  houseProfitLoss: number;
}

export interface PlayerJoinEvent extends BaseAuditEvent {
  type: "player_join";
  playerId: string;
  playerName: string;
  initialBankroll: number;
}

export interface PlayerLeaveEvent extends BaseAuditEvent {
  type: "player_leave";
  playerId: string;
  playerName: string;
  finalBankroll: number;
}

// Shoe events
export interface ShoeCreatedEvent extends BaseAuditEvent {
  type: "shoe_created";
  shoeId: string;
  numDecks: number;
  totalCards: number;
}

export interface ShoeShuffledEvent extends BaseAuditEvent {
  type: "shoe_shuffled";
  shoeId: string;
}

export interface ShoeDepletedEvent extends BaseAuditEvent {
  type: "shoe_depleted";
  shoeId: string;
  cardsRemaining: number;
}

export interface CardDealtEvent extends BaseAuditEvent {
  type: "card_dealt";
  shoeId: string;
  cardRank: string;
  cardSuit: string;
  to: "dealer" | "player";
  playerId?: string;
  handId?: string;
}

// Round events
export interface RoundStartEvent extends BaseAuditEvent {
  type: "round_start";
  roundNumber: number;
  playerCount: number;
  totalBets: number;
}

export interface RoundCompleteEvent extends BaseAuditEvent {
  type: "round_complete";
  roundNumber: number;
  totalPayout: number;
  houseProfit: number;
}

export interface BetPlacedEvent extends BaseAuditEvent {
  type: "bet_placed";
  playerId: string;
  handId: string;
  amount: number;
}

export interface InsuranceOfferedEvent extends BaseAuditEvent {
  type: "insurance_offered";
  playerId: string;
  handId: string;
  dealerUpCard: string;
}

export interface InsuranceTakenEvent extends BaseAuditEvent {
  type: "insurance_taken";
  playerId: string;
  handId: string;
  amount: number;
}

export interface InsuranceDeclinedEvent extends BaseAuditEvent {
  type: "insurance_declined";
  playerId: string;
  handId: string;
}

export interface InsuranceResolvedEvent extends BaseAuditEvent {
  type: "insurance_resolved";
  dealerBlackjack: boolean;
  totalInsurancePayout: number;
}

// Hand events
export interface HandCreatedEvent extends BaseAuditEvent {
  type: "hand_created";
  handId: string;
  playerId: string;
  betAmount: number;
  isSplit: boolean;
}

export interface HandDealtEvent extends BaseAuditEvent {
  type: "hand_dealt";
  handId: string;
  cards: Array<{ rank: string; suit: string }>;
  value: number;
}

export interface HandActionEvent extends BaseAuditEvent {
  type: "hand_action";
  handId: string;
  playerId: string;
  action: "hit" | "stand" | "double" | "split" | "surrender";
  handValueBefore: number;
  handValueAfter?: number;
  newHandId?: string; // For splits
}

export interface HandSplitEvent extends BaseAuditEvent {
  type: "hand_split";
  originalHandId: string;
  newHandId: string;
  playerId: string;
  additionalBet: number;
}

export interface HandSettledEvent extends BaseAuditEvent {
  type: "hand_settled";
  handId: string;
  playerId: string;
  finalValue: number;
  dealerValue: number;
  result: "win" | "loss" | "push" | "blackjack" | "busted" | "surrendered";
  payout: number;
  profit: number;
}

// Game state
export interface GameStateChangeEvent extends BaseAuditEvent {
  type: "game_state_change";
  fromState: string;
  toState: string;
}

export type AuditEvent =
  | BankCreditEvent
  | BankDebitEvent
  | EscrowCreditEvent
  | EscrowDebitEvent
  | EscrowTransferEvent
  | SessionStartEvent
  | SessionEndEvent
  | PlayerJoinEvent
  | PlayerLeaveEvent
  | ShoeCreatedEvent
  | ShoeShuffledEvent
  | ShoeDepletedEvent
  | CardDealtEvent
  | RoundStartEvent
  | RoundCompleteEvent
  | BetPlacedEvent
  | InsuranceOfferedEvent
  | InsuranceTakenEvent
  | InsuranceDeclinedEvent
  | InsuranceResolvedEvent
  | HandCreatedEvent
  | HandDealtEvent
  | HandActionEvent
  | HandSplitEvent
  | HandSettledEvent
  | GameStateChangeEvent;
