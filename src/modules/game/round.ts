import {
  ACTION_DOUBLE,
  ACTION_HIT,
  ACTION_SPLIT,
  ACTION_STAND,
  ACTION_SURRENDER,
  type ActionType,
} from "./action";
import { type Bank, type House } from "./bank";
import { DealerHand } from "./dealer-hand";
import { Hand } from "./hand";
import type { RuleSet } from "./rules";
import {
  type SettlementResult,
  settleRound,
} from "./settlement";
import type { Shoe } from "./shoe";

export type PlayerRoundInfo = {
  userId: string;
  bank: Bank;
  bet: number;
};

export type RoundState =
  | "dealing" // Initial dealing
  | "insurance" // Offering insurance when dealer shows Ace
  | "player_turn" // Players making decisions
  | "dealer_turn" // Dealer playing
  | "settling" // Determining winners
  | "complete"; // Round finished

export class Round {
  dealerHand: DealerHand;
  playerHands: Hand[];
  state: RoundState;
  currentHandIndex: number = 0;
  settlementResults?: SettlementResult[];

  constructor(
    public roundNumber: number = 1,
    playerInfo: PlayerRoundInfo[] = [],
    private shoe: Shoe,
    private rules: RuleSet,
  ) {
    const { playerHands, dealerHand } = this.shoe.deal(playerInfo.length);
    this.playerHands = playerHands.map((cards, i) => {
      const info = playerInfo[i];
      const h = new Hand(
        rules,
        info.userId,
        info.bank,
        info.bet,
        dealerHand[0],
        false,
        false,
        0,
      );
      h.start(cards[0]);
      return h;
    });
    this.dealerHand = new DealerHand(dealerHand, rules);

    // Check if insurance should be offered (dealer shows Ace)
    const dealerShowsAce = this.dealerHand.upCard.rank === "A";
    if (dealerShowsAce) {
      this.state = "insurance";
      // Mark all hands as having insurance offered
      this.playerHands.forEach((hand) => {
        hand.insuranceOffered = true;
      });
    } else {
      this.state = "player_turn";
      // Check if current hand is already complete (e.g., blackjack)
      this.checkAndProgressHand();
    }
  }

  get isComplete() {
    return this.state === "complete";
  }

  get currentHand() {
    return this.playerHands[this.currentHandIndex];
  }

  /**
   * Play an action on the current player hand
   */
  playAction(action: ActionType): Hand[] {
    if (this.state !== "player_turn") {
      throw new Error("Cannot play action - not player's turn");
    }

    const hand = this.currentHand;

    if (!hand) {
      throw new Error("No current hand to play action on");
    }

    switch (action) {
      case ACTION_HIT: {
        const card = this.shoe.drawCard();
        hand.hit(card);
        // If busted or stood, move to next hand
        if (hand.state === "busted" || hand.state === "stood") {
          this.moveToNextHand();
        }
        break;
      }

      case ACTION_STAND: {
        hand.stand();
        this.moveToNextHand();
        break;
      }

      case ACTION_DOUBLE: {
        const card = this.shoe.drawCard();
        hand.double(card);
        this.moveToNextHand();
        break;
      }

      case ACTION_SPLIT: {
        const card1 = this.shoe.drawCard();
        const card2 = this.shoe.drawCard();
        const { splitHand, originalHand } = hand.split(card1, card2);

        // Insert the split hand after the current hand
        this.playerHands.splice(this.currentHandIndex + 1, 0, splitHand);

        // Check if either hand is done (blackjack, busted, etc.)
        if (
          originalHand.state === "busted" ||
          originalHand.state === "stood" ||
          originalHand.state === "blackjack"
        ) {
          this.moveToNextHand();
        }
        break;
      }

      case ACTION_SURRENDER: {
        hand.surrender();
        this.moveToNextHand();
        break;
      }

      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    return this.playerHands;
  }

  /**
   * Check if current hand is complete and progress if needed
   */
  private checkAndProgressHand() {
    const hand = this.currentHand;
    if (hand && (
      hand.state === "blackjack" ||
      hand.state === "busted" ||
      hand.state === "stood" ||
      hand.state === "surrendered"
    )) {
      this.moveToNextHand();
    }
  }

  /**
   * Move to the next player hand, or start dealer turn if all hands are done
   */
  private moveToNextHand() {
    this.currentHandIndex++;

    // Check if there are more hands to play
    if (this.currentHandIndex >= this.playerHands.length) {
      // All player hands are done, move to dealer turn
      this.state = "dealer_turn";
      this.playDealerTurn();
    } else {
      // Check if the next hand is also complete
      this.checkAndProgressHand();
    }
  }

  /**
   * Play the dealer's turn according to rules
   */
  playDealerTurn() {
    if (this.state !== "dealer_turn") {
      throw new Error("Cannot play dealer turn - not dealer's turn");
    }

    // Check if all player hands are busted - if so, dealer doesn't need to play
    const allPlayersBusted = this.playerHands.every(
      (h) => h.state === "busted",
    );

    if (allPlayersBusted) {
      this.state = "settling";
      return;
    }

    // Dealer plays according to rules (hit on soft 17 or stand on all 17s)
    while (
      this.dealerHand.state === "active" &&
      this.dealerHand.handValue < 17
    ) {
      const card = this.shoe.drawCard();
      this.dealerHand.hit(card);
    }

    this.state = "settling";
  }

  /**
   * Player takes insurance on a specific hand
   */
  takeInsurance(handIndex: number): void {
    if (this.state !== "insurance") {
      throw new Error("Can only take insurance during insurance phase");
    }

    const hand = this.playerHands[handIndex];
    if (!hand) {
      throw new Error(`Hand index ${handIndex} out of range`);
    }

    hand.takeInsurance();
  }

  /**
   * Player declines insurance on a specific hand
   */
  declineInsurance(handIndex: number): void {
    if (this.state !== "insurance") {
      throw new Error("Can only decline insurance during insurance phase");
    }

    const hand = this.playerHands[handIndex];
    if (!hand) {
      throw new Error(`Hand index ${handIndex} out of range`);
    }

    hand.declineInsurance();
  }

  /**
   * Complete insurance phase
   * - Check if dealer has blackjack
   * - Settle insurance bets
   * - Move to appropriate next state
   */
  resolveInsurance(house: House): {
    dealerBlackjack: boolean;
    insuranceResults: {
      handIndex: number;
      hadInsurance: boolean;
      payout: number;
    }[];
  } {
    if (this.state !== "insurance") {
      throw new Error("Cannot resolve insurance - not in insurance phase");
    }

    const dealerBlackjack = this.dealerHand.peekBlackjack;
    const insuranceResults: {
      handIndex: number;
      hadInsurance: boolean;
      payout: number;
    }[] = [];

    // Settle all insurance bets
    this.playerHands.forEach((hand, index) => {
      if (hand.hasInsurance) {
        const insuranceAmount = hand.insuranceAmount;

        if (dealerBlackjack) {
          // Insurance pays 2:1
          const payout = insuranceAmount * 3; // Return bet + 2:1 win
          hand.bank.credit(payout, "house");
          house.debit(payout, hand.id);
          house.profitLoss -= insuranceAmount * 2; // Lost 2x the insurance bet

          insuranceResults.push({
            handIndex: index,
            hadInsurance: true,
            payout,
          });
        } else {
          // Insurance loses - house keeps the bet
          house.credit(insuranceAmount, hand.id);
          house.profitLoss += insuranceAmount;

          insuranceResults.push({
            handIndex: index,
            hadInsurance: true,
            payout: 0,
          });
        }
      } else {
        insuranceResults.push({
          handIndex: index,
          hadInsurance: false,
          payout: 0,
        });
      }
    });

    // If dealer has blackjack, round is over for non-blackjack hands
    if (dealerBlackjack) {
      this.state = "settling";
    } else {
      this.state = "player_turn";
      // Check if current hand is already complete (e.g., blackjack)
      this.checkAndProgressHand();
    }

    return {
      dealerBlackjack,
      insuranceResults,
    };
  }

  /**
   * Settle the round - determine winners and pay out
   */
  settle(house: House): SettlementResult[] {
    if (this.state !== "settling") {
      throw new Error("Cannot settle - round not ready for settlement");
    }

    const results = settleRound(
      this.playerHands,
      this.dealerHand,
      house,
      this.rules.build(),
    );

    this.settlementResults = results;
    this.state = "complete";

    return results;
  }

  /**
   * Get a specific player hand by index
   */
  getPlayerHand(index: number) {
    return this.playerHands[index];
  }

  /**
   * Get available actions for the current hand
   */
  getAvailableActions(): ActionType[] {
    if (this.state !== "player_turn") {
      return [];
    }

    return this.currentHand?.availableActions ?? [];
  }
}
