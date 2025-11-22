import { beforeEach, describe, expect, test } from "bun:test";
import { GameStateMachine } from "./game-state-machine";
import { RoundStateMachine } from "./round-state-machine";
import { ACTION_HIT, ACTION_STAND } from "../action";

describe("GameStateMachine", () => {
  let machine: GameStateMachine;

  beforeEach(() => {
    machine = new GameStateMachine();
  });

  describe("initialization", () => {
    test("should start in waiting_for_bets state", () => {
      expect(machine.currentState).toBe("waiting_for_bets");
    });

    test("should allow starting a round from waiting_for_bets", () => {
      expect(machine.canStartRound()).toBe(true);
    });

    test("should not allow completing round from waiting_for_bets", () => {
      expect(machine.canCompleteRound()).toBe(false);
    });

    test("should not be in active round initially", () => {
      expect(machine.isRoundActive()).toBe(false);
    });
  });

  describe("startRound", () => {
    test("should transition to in_round state", () => {
      machine.startRound([{ playerId: "p1", amount: 100 }]);
      expect(machine.currentState).toBe("in_round");
      expect(machine.isRoundActive()).toBe(true);
    });

    test("should throw error when trying to start from wrong state", () => {
      machine.startRound([{ playerId: "p1", amount: 100 }]);
      expect(() => {
        machine.startRound([{ playerId: "p1", amount: 100 }]);
      }).toThrow("Cannot start round in state: in_round");
    });

    test("should accept multiple bets", () => {
      const bets = [
        { playerId: "p1", amount: 100 },
        { playerId: "p2", amount: 200 },
        { playerId: "p3", amount: 50 },
      ];
      machine.startRound(bets);
      expect(machine.currentState).toBe("in_round");
    });
  });

  describe("settleRound", () => {
    test("should transition to round_complete state", () => {
      machine.startRound([{ playerId: "p1", amount: 100 }]);
      machine.settleRound([]);
      expect(machine.currentState).toBe("round_complete");
    });

    test("should throw error when not in in_round state", () => {
      expect(() => {
        machine.settleRound([]);
      }).toThrow("Cannot settle round in state: waiting_for_bets");
    });
  });

  describe("completeRound", () => {
    test("should transition back to waiting_for_bets", () => {
      machine.startRound([{ playerId: "p1", amount: 100 }]);
      machine.settleRound([]);
      machine.completeRound();
      expect(machine.currentState).toBe("waiting_for_bets");
      expect(machine.canStartRound()).toBe(true);
    });

    test("should throw error when not in round_complete state", () => {
      expect(() => {
        machine.completeRound();
      }).toThrow("Cannot complete round in state: waiting_for_bets");
    });
  });

  describe("full round cycle", () => {
    test("should support multiple rounds", () => {
      // Round 1
      machine.startRound([{ playerId: "p1", amount: 100 }]);
      expect(machine.currentState).toBe("in_round");

      machine.settleRound([]);
      expect(machine.currentState).toBe("round_complete");

      machine.completeRound();
      expect(machine.currentState).toBe("waiting_for_bets");

      // Round 2
      machine.startRound([{ playerId: "p1", amount: 200 }]);
      expect(machine.currentState).toBe("in_round");

      machine.settleRound([]);
      expect(machine.currentState).toBe("round_complete");

      machine.completeRound();
      expect(machine.currentState).toBe("waiting_for_bets");
    });
  });

  describe("state validation helpers", () => {
    test("canStartRound should only be true in waiting_for_bets", () => {
      expect(machine.canStartRound()).toBe(true);

      machine.startRound([{ playerId: "p1", amount: 100 }]);
      expect(machine.canStartRound()).toBe(false);

      machine.settleRound([]);
      expect(machine.canStartRound()).toBe(false);

      machine.completeRound();
      expect(machine.canStartRound()).toBe(true);
    });

    test("canCompleteRound should only be true in round_complete", () => {
      expect(machine.canCompleteRound()).toBe(false);

      machine.startRound([{ playerId: "p1", amount: 100 }]);
      expect(machine.canCompleteRound()).toBe(false);

      machine.settleRound([]);
      expect(machine.canCompleteRound()).toBe(true);

      machine.completeRound();
      expect(machine.canCompleteRound()).toBe(false);
    });

    test("isRoundActive should be true only in in_round", () => {
      expect(machine.isRoundActive()).toBe(false);

      machine.startRound([{ playerId: "p1", amount: 100 }]);
      expect(machine.isRoundActive()).toBe(true);

      machine.settleRound([]);
      expect(machine.isRoundActive()).toBe(false);
    });
  });
});

describe("RoundStateMachine", () => {
  describe("initialization without insurance", () => {
    let machine: RoundStateMachine;

    beforeEach(() => {
      machine = new RoundStateMachine(false);
    });

    test("should start in player_turn state", () => {
      expect(machine.currentState).toBe("player_turn");
    });

    test("should indicate player turn", () => {
      expect(machine.isPlayerTurn()).toBe(true);
      expect(machine.isDealerTurn()).toBe(false);
      expect(machine.isInsurancePhase()).toBe(false);
      expect(machine.isSettling()).toBe(false);
    });

    test("should not be complete initially", () => {
      expect(machine.isComplete()).toBe(false);
    });

    test("should have correct phase description", () => {
      expect(machine.getPhaseDescription()).toBe("Players making decisions");
    });
  });

  describe("initialization with insurance", () => {
    let machine: RoundStateMachine;

    beforeEach(() => {
      machine = new RoundStateMachine(true);
    });

    test("should start in insurance state", () => {
      expect(machine.currentState).toBe("insurance");
    });

    test("should indicate insurance phase", () => {
      expect(machine.isInsurancePhase()).toBe(true);
      expect(machine.isPlayerTurn()).toBe(false);
    });

    test("should have correct phase description", () => {
      expect(machine.getPhaseDescription()).toBe("Insurance offers in progress");
    });
  });

  describe("insurance phase transitions", () => {
    let machine: RoundStateMachine;

    beforeEach(() => {
      machine = new RoundStateMachine(true);
    });

    test("should transition to player_turn when dealer has no blackjack", () => {
      machine.resolveInsurance(false);
      expect(machine.currentState).toBe("player_turn");
      expect(machine.isPlayerTurn()).toBe(true);
    });

    test("should transition to settling when dealer has blackjack", () => {
      machine.resolveInsurance(true);
      expect(machine.currentState).toBe("settling");
      expect(machine.isSettling()).toBe(true);
    });

    test("should throw error when resolving insurance from wrong state", () => {
      machine.resolveInsurance(false);
      expect(() => {
        machine.resolveInsurance(false);
      }).toThrow("Cannot resolve insurance in state: player_turn");
    });
  });

  describe("player turn transitions", () => {
    let machine: RoundStateMachine;

    beforeEach(() => {
      machine = new RoundStateMachine(false);
    });

    test("should process player actions", () => {
      machine.processPlayerAction(ACTION_HIT);
      expect(machine.currentState).toBe("player_turn");

      machine.processPlayerAction(ACTION_STAND);
      expect(machine.currentState).toBe("player_turn");
    });

    test("should throw error when processing action from wrong state", () => {
      machine.allPlayersDone();
      expect(() => {
        machine.processPlayerAction(ACTION_HIT);
      }).toThrow("Cannot process player action in state: dealer_turn");
    });

    test("should transition to dealer_turn when all players done", () => {
      machine.allPlayersDone();
      expect(machine.currentState).toBe("dealer_turn");
      expect(machine.isDealerTurn()).toBe(true);
    });

    test("should throw error when marking players done from wrong state", () => {
      machine.allPlayersDone();
      expect(() => {
        machine.allPlayersDone();
      }).toThrow("Cannot mark players done in state: dealer_turn");
    });

    test("should auto-settle from player_turn", () => {
      machine.autoSettle();
      expect(machine.currentState).toBe("settling");
      expect(machine.isSettling()).toBe(true);
    });
  });

  describe("dealer turn transitions", () => {
    let machine: RoundStateMachine;

    beforeEach(() => {
      machine = new RoundStateMachine(false);
      machine.allPlayersDone();
    });

    test("should be in dealer_turn after players done", () => {
      expect(machine.currentState).toBe("dealer_turn");
      expect(machine.getPhaseDescription()).toBe("Dealer playing hand");
    });

    test("should transition to settling when dealer done", () => {
      machine.dealerDone();
      expect(machine.currentState).toBe("settling");
    });

    test("should throw error when marking dealer done from wrong state", () => {
      machine.dealerDone();
      expect(() => {
        machine.dealerDone();
      }).toThrow("Cannot mark dealer done in state: settling");
    });
  });

  describe("settling state", () => {
    let machine: RoundStateMachine;

    beforeEach(() => {
      machine = new RoundStateMachine(false);
      machine.allPlayersDone();
      machine.dealerDone();
    });

    test("should be in settling state", () => {
      expect(machine.currentState).toBe("settling");
      expect(machine.isSettling()).toBe(true);
      expect(machine.isComplete()).toBe(true);
    });

    test("should have correct phase description", () => {
      expect(machine.getPhaseDescription()).toBe("Calculating payouts");
    });

    test("auto-settle should not throw when already settling", () => {
      expect(() => {
        machine.autoSettle();
      }).not.toThrow();
      expect(machine.currentState).toBe("settling");
    });
  });

  describe("complete round flow without insurance", () => {
    test("should complete a full round cycle", () => {
      const machine = new RoundStateMachine(false);

      // Start in player_turn
      expect(machine.currentState).toBe("player_turn");

      // Players make actions
      machine.processPlayerAction(ACTION_HIT);
      machine.processPlayerAction(ACTION_STAND);

      // All players done
      machine.allPlayersDone();
      expect(machine.currentState).toBe("dealer_turn");

      // Dealer plays
      machine.dealerDone();
      expect(machine.currentState).toBe("settling");

      // Round is complete
      expect(machine.isComplete()).toBe(true);
    });
  });

  describe("complete round flow with insurance", () => {
    test("should complete full round with insurance (no dealer blackjack)", () => {
      const machine = new RoundStateMachine(true);

      // Start in insurance
      expect(machine.currentState).toBe("insurance");

      // Resolve insurance - dealer has no blackjack
      machine.resolveInsurance(false);
      expect(machine.currentState).toBe("player_turn");

      // Players make actions
      machine.processPlayerAction(ACTION_HIT);

      // All players done
      machine.allPlayersDone();
      expect(machine.currentState).toBe("dealer_turn");

      // Dealer plays
      machine.dealerDone();
      expect(machine.currentState).toBe("settling");

      expect(machine.isComplete()).toBe(true);
    });

    test("should auto-settle when dealer has blackjack", () => {
      const machine = new RoundStateMachine(true);

      // Start in insurance
      expect(machine.currentState).toBe("insurance");

      // Resolve insurance - dealer has blackjack
      machine.resolveInsurance(true);
      expect(machine.currentState).toBe("settling");

      // Should skip player_turn and dealer_turn
      expect(machine.isComplete()).toBe(true);
    });
  });

  describe("auto-settle scenarios", () => {
    test("should auto-settle from insurance phase", () => {
      const machine = new RoundStateMachine(true);
      machine.autoSettle();
      expect(machine.currentState).toBe("settling");
    });

    test("should auto-settle from player_turn (all busted/blackjack)", () => {
      const machine = new RoundStateMachine(false);
      machine.autoSettle();
      expect(machine.currentState).toBe("settling");
    });

    test("should remain in dealer_turn when auto-settling (no AUTO_SETTLE transition)", () => {
      const machine = new RoundStateMachine(false);
      machine.allPlayersDone();
      expect(machine.currentState).toBe("dealer_turn");

      // Auto-settle won't change state from dealer_turn (no transition defined)
      machine.autoSettle();
      expect(machine.currentState).toBe("dealer_turn");

      // Must use dealerDone() to transition
      machine.dealerDone();
      expect(machine.currentState).toBe("settling");
    });
  });

  describe("state validation helpers", () => {
    test("isPlayerTurn should only be true in player_turn", () => {
      const machine = new RoundStateMachine(false);
      expect(machine.isPlayerTurn()).toBe(true);

      machine.allPlayersDone();
      expect(machine.isPlayerTurn()).toBe(false);
    });

    test("isDealerTurn should only be true in dealer_turn", () => {
      const machine = new RoundStateMachine(false);
      expect(machine.isDealerTurn()).toBe(false);

      machine.allPlayersDone();
      expect(machine.isDealerTurn()).toBe(true);

      machine.dealerDone();
      expect(machine.isDealerTurn()).toBe(false);
    });

    test("isSettling should only be true in settling", () => {
      const machine = new RoundStateMachine(false);
      expect(machine.isSettling()).toBe(false);

      machine.allPlayersDone();
      expect(machine.isSettling()).toBe(false);

      machine.dealerDone();
      expect(machine.isSettling()).toBe(true);
    });

    test("isComplete should be true in settling or complete", () => {
      const machine = new RoundStateMachine(false);
      expect(machine.isComplete()).toBe(false);

      machine.allPlayersDone();
      expect(machine.isComplete()).toBe(false);

      machine.dealerDone();
      expect(machine.isComplete()).toBe(true);
    });
  });

  describe("phase descriptions", () => {
    test("should provide correct descriptions for all states", () => {
      const withInsurance = new RoundStateMachine(true);
      expect(withInsurance.getPhaseDescription()).toBe("Insurance offers in progress");

      withInsurance.resolveInsurance(false);
      expect(withInsurance.getPhaseDescription()).toBe("Players making decisions");

      withInsurance.allPlayersDone();
      expect(withInsurance.getPhaseDescription()).toBe("Dealer playing hand");

      withInsurance.dealerDone();
      expect(withInsurance.getPhaseDescription()).toBe("Calculating payouts");
    });
  });
});
