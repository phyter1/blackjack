export const randomInt = (min: number, max: number): number => {
  // Returns a random integer between min (inclusive) and max (inclusive)
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const weightedRandomChoice = <T>(items: T[], weights: number[]): T => {
  // Returns a random item from items based on the provided weights
  const cumulativeWeights: number[] = [];
  weights.reduce((acc, weight, index) => {
    cumulativeWeights[index] = acc + weight;
    return cumulativeWeights[index];
  }, 0);
  const totalWeight = cumulativeWeights[cumulativeWeights.length - 1];
  const rand = Math.random() * totalWeight;

  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (rand < cumulativeWeights[i]) {
      return items[i];
    }
  }
  return items[items.length - 1]; // Fallback
};

export const randomWeieghtedChunks = <T>(
  whole: T[],
  weights: number[],
): T[][] => {
  const chunks: T[][] = [];
  let index = 0;

  while (index < whole.length) {
    const chunkSize = weightedRandomChoice(
      weights,
      weights.map(() => 1),
    );
    chunks.push(whole.slice(index, index + chunkSize));
    index += chunkSize;
  }

  return chunks;
};
