import { describe, expect, it } from "vitest";

import { FenwickTree } from "../src/data-structures/advanced-trees/fenwickTree.js";

describe("Fenwick Tree", () => {
  it("builds a tree from a non-empty array", () => {
    const tree = new FenwickTree([5, 2, 7, 1, 4]);

    expect(tree.toArray()).toEqual([5, 2, 7, 1, 4]);
    expect(tree.tree[1]).toBe(5);
    expect(tree.tree[2]).toBe(7);
    expect(tree.tree[3]).toBe(7);
    expect(tree.tree[5]).toBe(4);
  });

  it("handles empty and single-element arrays", () => {
    const emptyTree = new FenwickTree([]);
    expect(emptyTree.toArray()).toEqual([]);
    expect(emptyTree.prefixSum(0)[0].label).toContain("Empty");

    const singleTree = new FenwickTree([42]);
    expect(singleTree.prefixSum(0).at(-1).result).toBe(42);
    expect(singleTree.rangeSum(0, 0).at(-1).result).toBe(42);
  });

  it("supports prefix sums at every valid index", () => {
    const tree = new FenwickTree([2, 3, 5, 7, 11]);
    const expected = [2, 5, 10, 17, 28];

    expected.forEach((value, index) => {
      expect(tree.prefixSum(index).at(-1).result).toBe(value);
    });
  });

  it("supports range sums across different boundaries", () => {
    const tree = new FenwickTree([5, 3, 8, 2, 1, 6]);

    expect(tree.rangeSum(0, 2).at(-1).result).toBe(16);
    expect(tree.rangeSum(1, 4).at(-1).result).toBe(14);
    expect(tree.rangeSum(2, 5).at(-1).result).toBe(17);
    expect(tree.rangeSum(0, 5).at(-1).result).toBe(25);
  });

  it("handles point updates and repeated updates correctly", () => {
    const tree = new FenwickTree([4, 2, 6, 1, 8]);

    expect(tree.pointUpdate(2, 10).at(-1).after).toBe(10);
    expect(tree.rangeSum(0, 4).at(-1).result).toBe(25);

    tree.pointUpdate(0, -5);
    expect(tree.getValue(0)).toBe(-5);
    expect(tree.rangeSum(0, 4).at(-1).result).toBe(16);
  });

  it("supports negative and zero values", () => {
    const tree = new FenwickTree([0, -3, 0, 5, -2]);

    expect(tree.prefixSum(4).at(-1).result).toBe(0);
    expect(tree.rangeSum(1, 4).at(-1).result).toBe(0);

    tree.setValue(1, -8);
    expect(tree.rangeSum(0, 4).at(-1).result).toBe(-5);
  });

  it("validates invalid indices and ranges", () => {
    const tree = new FenwickTree([3, 7, 1]);

    expect(tree.prefixSum(-1)[0].label).toContain("Invalid");
    expect(tree.prefixSum(3)[0].label).toContain("Invalid");
    expect(tree.rangeSum(-1, 1)[0].label).toContain("Invalid");
    expect(tree.rangeSum(2, 1)[0].label).toContain("Invalid");
    expect(tree.pointUpdate(-1, 2)[0].label).toContain("Invalid");
    expect(tree.pointUpdate(3, 2)[0].label).toContain("Invalid");
  });

  it("matches naive array sums for random values", () => {
    const values = [9, -2, 6, 0, 4, -5, 8, 1];
    const tree = new FenwickTree(values);

    for (let start = 0; start < values.length; start += 1) {
      for (let end = start; end < values.length; end += 1) {
        const naive = values.slice(start, end + 1).reduce((sum, item) => sum + item, 0);
        expect(tree.rangeSum(start, end).at(-1).result).toBe(naive);
      }
    }
  });

  it("tracks BIT index propagation and step snapshots", () => {
    const tree = new FenwickTree([4, 2, 7, 1, 3]);
    const prefixSteps = tree.prefixSum(4);

    expect(prefixSteps[0].highlighted.length).toBeGreaterThan(0);
    expect(prefixSteps[0].bit).toBeInstanceOf(Array);
    expect(prefixSteps[0].array).toEqual([4, 2, 7, 1, 3]);

    const updateSteps = tree.pointUpdate(3, 5);
    expect(updateSteps[0].before).toBe(1);
    expect(updateSteps[0].after).toBe(5);
  });
});
