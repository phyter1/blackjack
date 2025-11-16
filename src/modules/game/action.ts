import type { Card } from "./cards";
import type { Shoe } from "./shoe";

export const ACTION_HIT = "hit" as const;
export const ACTION_STAND = "stand" as const;
export const ACTION_DOUBLE = "double" as const;
export const ACTION_SPLIT = "split" as const;
export const ACTION_SURRENDER = "surrender" as const;
export type ActionType =
  | typeof ACTION_HIT
  | typeof ACTION_STAND
  | typeof ACTION_DOUBLE
  | typeof ACTION_SPLIT
  | typeof ACTION_SURRENDER;

export type Hit = {
  type: typeof ACTION_HIT;
  card: Card;
};

export const hit = (shoe: Shoe) => {
  return {
    type: ACTION_HIT,
    card: shoe.drawCard(),
  };
};

export type Stand = {
  type: typeof ACTION_STAND;
};

export const stand = (): Stand => {
  return {
    type: ACTION_STAND,
  };
};

export type Double = {
  type: typeof ACTION_DOUBLE;
  card: Card;
  bet: number;
};

export const double = (shoe: Shoe, bet: number): Double => {
  return {
    type: ACTION_DOUBLE,
    card: shoe.drawCard(),
    bet: bet * 2,
  };
};

export type Split = {
  type: typeof ACTION_SPLIT;
  card1: Card;
  card2: Card;
  bet: number;
};

export const split = (shoe: Shoe, bet: number): Split => {
  return {
    type: ACTION_SPLIT,
    card1: shoe.drawCard(),
    card2: shoe.drawCard(),
    bet,
  };
};

export type Surrender = {
  type: typeof ACTION_SURRENDER;
  bet: number;
};

export const surrender = (bet: number): Surrender => {
  return {
    type: ACTION_SURRENDER,
    bet: bet / 2,
  };
};
