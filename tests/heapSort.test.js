import { describe, expect, it } from "vitest";

import { HeapSortAlgorithm, heapSort } from "../src/data-structures/heapSort.js";

describe("Heap Sort", () => {
  it("sorts an empty array", () => {
    expect(heapSort([])).toEqual([]);
  });

  it("sorts a single-element array", () => {
    expect(heapSort([42])).toEqual([42]);
  });

  it("sorts an already sorted array without changing it", () => {
    expect(heapSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it("sorts a reverse sorted array", () => {
    expect(heapSort([9, 8, 7, 6, 5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("handles duplicate values", () => {
    expect(heapSort([4, 2, 4, 1, 2])).toEqual([1, 2, 2, 4, 4]);
  });

  it("handles negative values", () => {
    expect(heapSort([-3, -1, -5, -2, -4])).toEqual([-5, -4, -3, -2, -1]);
  });

  it("sorts random arrays correctly", () => {
    const values = [21, 3, 15, 9, 45, 11, 27, 1, 18, 12];
    expect(heapSort(values)).toEqual([...values].sort((a, b) => a - b));
  });

  it("builds a correct max heap from an array", () => {
    const values = [4, 1, 3, 2, 16, 9, 10, 14, 8, 7];
    const steps = new HeapSortAlgorithm(values).sort(values);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps.at(-1)?.values).toEqual([1, 2, 3, 4, 7, 8, 9, 10, 14, 16]);
  });

  it("creates valid step snapshots for playback navigation", () => {
    const values = [5, 2, 7, 1, 4];
    const steps = new HeapSortAlgorithm(values).sort(values);

    expect(steps[0].label).toContain("Start");
    expect(steps.at(-1)?.label).toContain("Heap sort complete");
    expect(steps[0].values).toEqual([5, 2, 7, 1, 4]);
    expect(steps[steps.length - 1].values).toEqual([1, 2, 4, 5, 7]);
  });
});
