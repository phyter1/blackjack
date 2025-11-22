/**
 * Format edge as percentage string
 */
export function formatEdge(edge: number): string {
  const sign = edge > 0 ? "+" : "";
  return `${sign}${edge.toFixed(2)}%`;
}

/**
 * Format money value with sign
 */
export function formatMoney(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

/**
 * Get variance interpretation
 */
export function getVarianceInterpretation(varianceInBB: number): {
  label: string;
  description: string;
  color: "green" | "yellow" | "red" | "gray";
} {
  const absVariance = Math.abs(varianceInBB);

  if (absVariance < 1) {
    return {
      label: "Expected",
      description: "Results within normal variance",
      color: "gray",
    };
  } else if (absVariance < 2) {
    if (varianceInBB > 0) {
      return {
        label: "Lucky",
        description: "Ran slightly better than expected",
        color: "green",
      };
    } else {
      return {
        label: "Unlucky",
        description: "Ran slightly worse than expected",
        color: "yellow",
      };
    }
  } else if (absVariance < 3) {
    if (varianceInBB > 0) {
      return {
        label: "Very Lucky",
        description: "Ran significantly better than expected",
        color: "green",
      };
    } else {
      return {
        label: "Very Unlucky",
        description: "Ran significantly worse than expected",
        color: "red",
      };
    }
  } else {
    if (varianceInBB > 0) {
      return {
        label: "Extremely Lucky",
        description: "Ran far better than expected",
        color: "green",
      };
    } else {
      return {
        label: "Extremely Unlucky",
        description: "Ran far worse than expected",
        color: "red",
      };
    }
  }
}
