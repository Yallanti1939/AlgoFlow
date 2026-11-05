export const bubbleSort = (values) => {
  const arr = [...values];
  let swaps = 0;

  for (let i = 0; i < arr.length; i += 1) {
    for (let j = 0; j < arr.length - i - 1; j += 1) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps += 1;
      }
    }
  }

  return {
    values: arr,
    swaps,
    complexity: {
      time: "O(n²)",
      space: "O(1)",
    },
  };
};

export const selectionSort = (values) => {
  const arr = [...values];
  let swaps = 0;

  for (let i = 0; i < arr.length; i += 1) {
    let minIndex = i;
    for (let j = i + 1; j < arr.length; j += 1) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
      swaps += 1;
    }
  }

  return {
    values: arr,
    swaps,
    complexity: {
      time: "O(n²)",
      space: "O(1)",
    },
  };
};

export const insertionSort = (values) => {
  const arr = [...values];
  let shifts = 0;

  for (let i = 1; i < arr.length; i += 1) {
    const current = arr[i];
    let j = i - 1;

    while (j >= 0 && arr[j] > current) {
      arr[j + 1] = arr[j];
      j -= 1;
      shifts += 1;
    }

    arr[j + 1] = current;
  }

  return {
    values: arr,
    shifts,
    complexity: {
      time: "O(n²)",
      space: "O(1)",
    },
  };
};

export const mergeSort = (values) => {
  const arr = [...values];

  if (arr.length <= 1) {
    return { values: arr, complexity: { time: "O(n log n)", space: "O(n)" } };
  }

  const merge = (left, right) => {
    const merged = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        merged.push(left[i]);
        i += 1;
      } else {
        merged.push(right[j]);
        j += 1;
      }
    }

    return [...merged, ...left.slice(i), ...right.slice(j)];
  };

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid)).values;
  const right = mergeSort(arr.slice(mid)).values;

  return {
    values: merge(left, right),
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
    },
  };
};

export const quickSort = (values) => {
  const arr = [...values];

  if (arr.length <= 1) {
    return { values: arr, complexity: { time: "O(n log n)", space: "O(log n)" } };
  }

  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length - 1; i += 1) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return {
    values: [...quickSort(left).values, pivot, ...quickSort(right).values],
    complexity: {
      time: "O(n log n)",
      space: "O(log n)",
    },
  };
};

export const sortingAlgorithms = [
  {
    key: "bubble-sort",
    label: "Bubble Sort",
    description: "Repeatedly compares adjacent values and swaps them when out of order.",
    complexity: "O(n²)",
    runner: bubbleSort,
    sampleCode: `function bubbleSort(values) {
  const arr = [...values];
  for (let i = 0; i < arr.length; i += 1) {
    for (let j = 0; j < arr.length - i - 1; j += 1) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
  },
  {
    key: "selection-sort",
    label: "Selection Sort",
    description: "Finds the smallest unsorted element and places it at the front.",
    complexity: "O(n²)",
    runner: selectionSort,
    sampleCode: `function selectionSort(values) {
  const arr = [...values];
  for (let i = 0; i < arr.length; i += 1) {
    let minIndex = i;
    for (let j = i + 1; j < arr.length; j += 1) {
      if (arr[j] < arr[minIndex]) minIndex = j;
    }
    [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
  }
  return arr;
}`,
  },
  {
    key: "insertion-sort",
    label: "Insertion Sort",
    description: "Builds the sorted portion one item at a time.",
    complexity: "O(n²)",
    runner: insertionSort,
    sampleCode: `function insertionSort(values) {
  const arr = [...values];
  for (let i = 1; i < arr.length; i += 1) {
    const current = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > current) {
      arr[j + 1] = arr[j];
      j -= 1;
    }
    arr[j + 1] = current;
  }
  return arr;
}`,
  },
  {
    key: "merge-sort",
    label: "Merge Sort",
    description: "Divides the array into halves, sorts them, and merges the result.",
    complexity: "O(n log n)",
    runner: mergeSort,
    sampleCode: `function mergeSort(values) {
  if (values.length <= 1) return values;
  const middle = Math.floor(values.length / 2);
  const left = mergeSort(values.slice(0, middle));
  const right = mergeSort(values.slice(middle));
  return merge(left, right);
}`,
  },
  {
    key: "quick-sort",
    label: "Quick Sort",
    description: "Partitions the array around a pivot and recursively sorts each side.",
    complexity: "O(n log n)",
    runner: quickSort,
    sampleCode: `function quickSort(values) {
  if (values.length <= 1) return values;
  const pivot = values[values.length - 1];
  const left = [];
  const right = [];
  for (let i = 0; i < values.length - 1; i += 1) {
    if (values[i] < pivot) left.push(values[i]);
    else right.push(values[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
  },
];
