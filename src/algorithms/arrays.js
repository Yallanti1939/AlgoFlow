export const reverseArray = (values) => [...values].reverse();

export const rotateArray = (values, steps = 1) => {
  const arr = [...values];
  const amount = ((steps % arr.length) + arr.length) % arr.length;

  if (amount === 0) return arr;
  return [...arr.slice(-amount), ...arr.slice(0, -amount)];
};

export const kadane = (values) => {
  let currentMax = values[0];
  let bestMax = values[0];

  for (let i = 1; i < values.length; i += 1) {
    currentMax = Math.max(values[i], currentMax + values[i]);
    bestMax = Math.max(bestMax, currentMax);
  }

  return bestMax;
};

export const twoSum = (values, target) => {
  const seen = new Map();

  for (let i = 0; i < values.length; i += 1) {
    const complement = target - values[i];

    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }

    seen.set(values[i], i);
  }

  return [];
};
