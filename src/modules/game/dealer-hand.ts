import type { Card, Stack } from "./cards";
import type { CompleteRuleSet, RuleSet } from "./rules";

export class DealerHand {
  state: "active" | "busted" | "stood" | "blackjack" = "active";
  rules: CompleteRuleSet;
  constructor(public cards: Stack, rules: RuleSet) {
    this.rules = rules.build();
    const cv = this.handValue;

    if (cv === 21) {
      this.state = "blackjack";
      return;
    }
  }

  hit(card: Card) {
    this.cards.push(card);
    const cv = this.handValue;

    if (cv > 21) {
      this.state = "busted";
      return;
    }

    if (cv === 21) {
      this.state = "blackjack";
      return;
    }

    if (this.rules.dealerStand.variant === "h17") {
      if (cv >= 17) {
        this.state = "stood";
      }
    } else {
      if (cv > 17) {
        this.state = "stood";
      }
    }
    return;
  }

  get upCard() {
    return this.cards[0];
  }

  get peekBlackjack() {
    return this.handValue === 21;
  }

  get handValue() {
    let total = 0;
    let aces = 0;

    for (const card of this.cards) {
      if (card.rank === "A") {
        aces += 1;
        total += 11;
      } else if (["K", "Q", "J"].includes(card.rank)) {
        total += 10;
      } else {
        total += parseInt(card.rank, 10);
      }
    }

    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }

    return total;
  }
}
