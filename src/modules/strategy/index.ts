// Basic Strategy
export {
  getBasicStrategyDecision,
  type BasicStrategyDecision,
} from "./basic-strategy";

// Hi-Lo Card Counting
export {
  HiLoCounter,
  getHiLoValue,
  getCountRecommendation,
  type CountSnapshot,
  type CountGuess,
  type CountingProficiency,
} from "./hi-lo-counter";

// Decision Tracking
export {
  DecisionTracker,
  calculateGrade,
  getGradePoints,
  type PlayerDecision,
  type StrategyAnalysis,
  type StrategyGrade,
} from "./decision-tracker";

// Expected Value Calculator
export {
  calculateSessionEV,
  calculateHandEV,
  calculateBaseHouseEdge,
  calculateAdvantagePlayEV,
  getAdvantagePlayDescription,
  type EVCalculation,
  type HandEVCalculation,
  type GameRules,
  type AdvantagePlayLevel,
  type BettingSpread,
  CONSERVATIVE_SPREAD,
  AGGRESSIVE_SPREAD,
} from "./ev-calculator";

// Trainer Mode
export {
  TrainerMode,
  type TrainerDifficulty,
  type ActionFeedback,
  type CountFeedback,
  type TrainerStats,
} from "./trainer";
