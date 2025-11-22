// Types
export * from "./types";

// Main trainer class
export { TrainerMode } from "./trainer-mode";

// Utility functions (optional exports for advanced usage)
export { getOptimalAction, evaluateAction } from "./action-evaluator";
export { submitCountGuess } from "./count-evaluator";
export { getStats } from "./stats-calculator";
