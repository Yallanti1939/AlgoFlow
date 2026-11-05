export class HeapSortAlgorithm {
  constructor(initialValues = []) {
    this.values = [...initialValues];
  }

  leftChildIndex(index) {
    return 2 * index + 1;
  }

  rightChildIndex(index) {
    return 2 * index + 2;
  }

  swap(values, indexA, indexB) {
    if (indexA === indexB) {
      return;
    }

    [values[indexA], values[indexB]] = [values[indexB], values[indexA]];
  }

  buildMaxHeap(values, steps, record) {
    for (let index = Math.floor(values.length / 2) - 1; index >= 0; index -= 1) {
      let currentIndex = index;

      while (true) {
        const leftIndex = this.leftChildIndex(currentIndex);
        const rightIndex = this.rightChildIndex(currentIndex);
        let largestIndex = currentIndex;

        if (leftIndex < values.length && values[leftIndex] > values[largestIndex]) {
          largestIndex = leftIndex;
        }

        if (rightIndex < values.length && values[rightIndex] > values[largestIndex]) {
          largestIndex = rightIndex;
        }

        if (largestIndex === currentIndex) {
          record(
            `Heapify index ${currentIndex}`,
            `The subtree rooted at index ${currentIndex} already satisfies the max-heap property.`,
            {
              compared: [currentIndex, leftIndex, rightIndex].filter((entry) => entry < values.length),
              heapIndices: [currentIndex, leftIndex, rightIndex].filter((entry) => entry < values.length),
            }
          );
          break;
        }

        record(
          `Compare ${values[currentIndex]} with child ${values[largestIndex]}`,
          "Promote the larger child upward to restore the max-heap order.",
          {
            compared: [currentIndex, largestIndex],
            swapped: [currentIndex, largestIndex],
            heapIndices: [currentIndex, largestIndex],
          }
        );

        this.swap(values, currentIndex, largestIndex);
        currentIndex = largestIndex;
      }
    }
  }

  sort(inputValues = this.values) {
    const values = [...inputValues];
    const steps = [];

    const record = (label, explanation, { compared = [], swapped = [], heapIndices = [], sortedIndices = [] } = {}) => {
      steps.push({
        label,
        explanation,
        values: [...values],
        compared: [...new Set(compared)],
        swapped: [...new Set(swapped)],
        heapIndices: [...new Set(heapIndices)],
        sortedIndices: [...new Set(sortedIndices)],
      });
    };

    record(
      "Start heap sort",
      "Build a max heap from the input so the largest item sits at the root before sorting begins.",
      {
        heapIndices: Array.from({ length: values.length }, (_, index) => index),
      }
    );

    this.buildMaxHeap(values, steps, record);

    record(
      "Max heap built",
      "Every parent is now greater than or equal to its children, which is the key invariant needed for heap sort.",
      {
        heapIndices: Array.from({ length: values.length }, (_, index) => index),
      }
    );

    let unsortedEnd = values.length - 1;

    while (unsortedEnd > 0) {
      const sortedIndices = Array.from({ length: values.length - unsortedEnd }, (_, offset) => values.length - 1 - offset);

      record(
        `Swap root ${values[0]} with last unsorted value ${values[unsortedEnd]}`,
        "Move the current maximum to the end of the unsorted section, where it becomes part of the sorted region.",
        {
          compared: [0, unsortedEnd],
          swapped: [0, unsortedEnd],
          heapIndices: [0, unsortedEnd],
          sortedIndices,
        }
      );

      this.swap(values, 0, unsortedEnd);

      let currentIndex = 0;
      while (true) {
        const leftIndex = this.leftChildIndex(currentIndex);
        const rightIndex = this.rightChildIndex(currentIndex);
        let largestIndex = currentIndex;

        if (leftIndex <= unsortedEnd - 1 && values[leftIndex] > values[largestIndex]) {
          largestIndex = leftIndex;
        }

        if (rightIndex <= unsortedEnd - 1 && values[rightIndex] > values[largestIndex]) {
          largestIndex = rightIndex;
        }

        if (largestIndex === currentIndex) {
          break;
        }

        record(
          `Heapify down from index ${currentIndex}`,
          "Restore the max-heap property after the root was swapped out of the heap.",
          {
            compared: [currentIndex, largestIndex],
            swapped: [currentIndex, largestIndex],
            heapIndices: [currentIndex, largestIndex],
            sortedIndices: Array.from({ length: values.length - unsortedEnd }, (_, offset) => values.length - 1 - offset),
          }
        );

        this.swap(values, currentIndex, largestIndex);
        currentIndex = largestIndex;
      }

      const importedSortedIndices = Array.from({ length: values.length - unsortedEnd }, (_, offset) => values.length - 1 - offset);
      record(
        `Move ${values[unsortedEnd]} into the sorted section`,
        "The tail of the array is now in correct ascending order and will remain fixed.",
        {
          heapIndices: Array.from({ length: unsortedEnd }, (_, index) => index),
          sortedIndices: importedSortedIndices,
        }
      );

      unsortedEnd -= 1;
    }

    record(
      "Heap sort complete",
      `The final sorted array is ${values.join(", ") || "[]"}.`,
      {
        heapIndices: [],
        sortedIndices: Array.from({ length: values.length }, (_, index) => index),
      }
    );

    this.values = [...values];
    return steps;
  }
}

export function heapSort(values) {
  const algorithm = new HeapSortAlgorithm(values);
  const steps = algorithm.sort(values);
  return steps.at(-1)?.values ?? [];
}

export default HeapSortAlgorithm;
