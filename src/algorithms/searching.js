export const linearSearch = (values, target) => {
  const arr = [...values];
  const index = arr.findIndex((item) => item === target);

  return {
    found: index >= 0,
    index,
    values: arr,
    complexity: {
      time: "O(n)",
      space: "O(1)",
    },
  };
};

export const binarySearch = (values, target) => {
  const arr = [...values].sort((a, b) => a - b);
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);

    if (arr[middle] === target) {
      return {
        found: true,
        index: middle,
        values: arr,
        complexity: {
          time: "O(log n)",
          space: "O(1)",
        },
      };
    }

    if (arr[middle] < target) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  return {
    found: false,
    index: -1,
    values: arr,
    complexity: {
      time: "O(log n)",
      space: "O(1)",
    },
  };
};

export const searchingAlgorithms = [
  {
    key: "linear-search",
    label: "Linear Search",
    description: "Checks each element one by one until the target is found.",
    complexity: "O(n)",
    runner: (values) => linearSearch(values, values[0]).values,
    sampleCode: `function linearSearch(values, target) {
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === target) return i;
  }
  return -1;
}`,
  },
  {
    key: "binary-search",
    label: "Binary Search",
    description: "Splits a sorted range in half until the target is found or excluded.",
    complexity: "O(log n)",
    runner: (values) => binarySearch(values, Math.min(...values)).values,
    sampleCode: `function binarySearch(values, target) {
  let left = 0;
  let right = values.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    if (values[middle] === target) return middle;
    if (values[middle] < target) left = middle + 1;
    else right = middle - 1;
  }

  return -1;
}`,
  },
];
