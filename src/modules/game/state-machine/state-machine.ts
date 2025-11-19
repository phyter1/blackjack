/**
 * Generic state machine implementation for game state management
 */

import type {
  StateMachine,
  StateMachineConfig,
  StateChangeListener,
  Transition,
} from "./types";

export class BaseStateMachine<S extends string, E extends { type: string }>
  implements StateMachine<S, E>
{
  private _currentState: S;
  private readonly config: StateMachineConfig<S, E>;
  private readonly transitions: Map<string, Transition<S, E>[]> = new Map();
  private readonly listeners: Set<StateChangeListener<S>> = new Set();

  constructor(config: StateMachineConfig<S, E>) {
    this.config = config;
    this._currentState = config.initialState;
    this.buildTransitionMap();

    // Call entry action for initial state
    const initialStateConfig = this.config.states[this._currentState];
    if (initialStateConfig?.entry) {
      initialStateConfig.entry();
    }
  }

  get currentState(): S {
    return this._currentState;
  }

  /**
   * Build a map of transitions for efficient lookup
   */
  private buildTransitionMap(): void {
    for (const [stateName, stateConfig] of Object.entries(
      this.config.states,
    ) as [S, (typeof this.config.states)[S]][]) {
      if (stateConfig.on) {
        for (const [eventType, targetState] of Object.entries(stateConfig.on)) {
          const key = `${stateName}-${eventType}`;
          const transition: Transition<S, E> = {
            from: stateName,
            to: targetState as S,
            event: eventType as any,
          };

          if (!this.transitions.has(key)) {
            this.transitions.set(key, []);
          }
          this.transitions.get(key)!.push(transition);
        }
      }
    }
  }

  /**
   * Perform a state transition
   */
  transition(event: E): S {
    const key = `${this._currentState}-${event.type}`;
    const transitions = this.transitions.get(key);

    if (!transitions || transitions.length === 0) {
      // No transition defined for this event in current state
      return this._currentState;
    }

    // Find applicable transition (checking guards if present)
    const applicableTransition = transitions.find(
      (t) => !t.guard || t.guard(event),
    );

    if (!applicableTransition) {
      return this._currentState;
    }

    const prevState = this._currentState;
    const nextState = applicableTransition.to;

    // Call exit action for current state
    const currentStateConfig = this.config.states[this._currentState];
    if (currentStateConfig?.exit) {
      currentStateConfig.exit();
    }

    // Perform transition action if defined
    if (applicableTransition.action) {
      applicableTransition.action(event);
    }

    // Update state
    this._currentState = nextState;

    // Call entry action for new state
    const nextStateConfig = this.config.states[nextState];
    if (nextStateConfig?.entry) {
      nextStateConfig.entry();
    }

    // Notify listeners
    this.notifyListeners(prevState, nextState);

    return this._currentState;
  }

  /**
   * Check if a transition is possible
   */
  canTransition(event: E): boolean {
    const key = `${this._currentState}-${event.type}`;
    const transitions = this.transitions.get(key);

    if (!transitions || transitions.length === 0) {
      return false;
    }

    return transitions.some((t) => !t.guard || t.guard(event));
  }

  /**
   * Get available transition event types from current state
   */
  getAvailableTransitions(): string[] {
    const stateConfig = this.config.states[this._currentState];
    if (!stateConfig?.on) {
      return [];
    }

    return Object.keys(stateConfig.on);
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    // Call exit action for current state
    const currentStateConfig = this.config.states[this._currentState];
    if (currentStateConfig?.exit) {
      currentStateConfig.exit();
    }

    const prevState = this._currentState;
    this._currentState = this.config.initialState;

    // Call entry action for initial state
    const initialStateConfig = this.config.states[this._currentState];
    if (initialStateConfig?.entry) {
      initialStateConfig.entry();
    }

    this.notifyListeners(prevState, this._currentState);
  }

  /**
   * Add a state change listener
   */
  addListener(listener: StateChangeListener<S>): void {
    this.listeners.add(listener);
  }

  /**
   * Remove a state change listener
   */
  removeListener(listener: StateChangeListener<S>): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(prevState: S, newState: S): void {
    if (prevState !== newState) {
      for (const listener of this.listeners) {
        listener(prevState, newState);
      }
    }
  }

  /**
   * Get a string representation of the current state
   */
  toString(): string {
    return `StateMachine(${this._currentState})`;
  }

  /**
   * Create a visual representation of the state machine
   */
  visualize(): string {
    const lines: string[] = [];
    lines.push("State Machine:");
    lines.push(`  Current State: ${this._currentState}`);
    lines.push("  Transitions:");

    for (const [stateName, stateConfig] of Object.entries(
      this.config.states,
    ) as [S, (typeof this.config.states)[S]][]) {
      if (stateConfig.on) {
        for (const [eventType, targetState] of Object.entries(stateConfig.on)) {
          const current = stateName === this._currentState ? "→" : " ";
          lines.push(
            `    ${current} ${stateName} -[${eventType}]-> ${targetState}`,
          );
        }
      }
    }

    return lines.join("\n");
  }
}
