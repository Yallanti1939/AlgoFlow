import { describe, expect, it } from "vitest";

import { SegmentTree } from "../src/data-structures/advanced-trees/segmentTree.js";

describe("Segment Tree", () => {
  it("builds a segment tree from a non-empty array", () => {
    const tree = new SegmentTree([8, 7, 3, 9, 5, 1]);

    expect(tree.values).toEqual([8, 7, 3, 9, 5, 1]);
    expect(tree.tree[1]).toBe(33);
    expect(tree.minTree[1]).toBe(1);
  });

  it("handles empty arrays and single-element arrays", () => {
    const emptyTree = new SegmentTree([]);
    expect(emptyTree.values).toEqual([]);
    expect(emptyTree.size).toBe(0);

    const singleTree = new SegmentTree([42]);
    expect(singleTree.rangeSumQuery(0, 0).at(-1).result).toBe(42);
    expect(singleTree.rangeMinQuery(0, 0).at(-1).result).toBe(42);
  });

  it("computes range sum and minimum for full and boundary ranges", () => {
    const tree = new SegmentTree([5, 3, 8, 2, 1, 6]);

    expect(tree.rangeSumQuery(0, 5).at(-1).result).toBe(25);
    expect(tree.rangeSumQuery(1, 4).at(-1).result).toBe(14);
    expect(tree.rangeMinQuery(0, 5).at(-1).result).toBe(1);
    expect(tree.rangeMinQuery(2, 5).at(-1).result).toBe(1);
  });

  it("updates a point and reflects the change in the tree", () => {
    const tree = new SegmentTree([9, 4, 7, 2, 6]);
    const steps = tree.pointUpdate(2, 11);

    expect(steps.at(-1).result).toBe(11);
    expect(tree.rangeSumQuery(0, 4).at(-1).result).toBe(32);
    expect(tree.rangeMinQuery(0, 4).at(-1).result).toBe(2);
  });

  it("supports range updates with lazy propagation and preserves values", () => {
    const tree = new SegmentTree([4, 2, 6, 1, 8]);
    const updateSteps = tree.rangeUpdate(1, 3, 5);

    expect(updateSteps.length).toBeGreaterThan(0);
    expect(tree.values).toEqual([4, 7, 11, 6, 8]);
    expect(tree.lazy.some((value) => value !== 0)).toBe(true);
    expect(tree.rangeSumQuery(0, 4).at(-1).result).toBe(36);
    expect(tree.rangeMinQuery(1, 3).at(-1).result).toBe(6);
  });

  it("rejects invalid ranges without crashing", () => {
    const tree = new SegmentTree([2, 5, 3]);

    expect(tree.rangeSumQuery(-1, 1)[0].label).toContain("Invalid");
    expect(tree.rangeSumQuery(1, 0)[0].label).toContain("Invalid");
    expect(tree.rangeMinQuery(0, 10)[0].label).toContain("Invalid");
    expect(tree.pointUpdate(-1, 9)[0].label).toContain("Invalid");
    expect(tree.pointUpdate(3, 9)[0].label).toContain("Invalid");
    expect(tree.rangeUpdate(1, 0, 2)[0].label).toContain("Invalid");
  });

  it("keeps accurate snapshot metadata for playback navigation", () => {
    const tree = new SegmentTree([10, 2, 7, 4]);
    const steps = tree.rangeSumQuery(1, 3);

    expect(steps[0].array).toEqual([10, 2, 7, 4]);
    expect(steps.at(-1).range).toEqual({ start: 1, end: 3 });
    expect(steps.at(-1).nodes.length).toBeGreaterThan(0);
    expect(steps.at(-1).tree).toBeInstanceOf(Array);
    expect(steps.at(-1).lazy).toBeInstanceOf(Array);
  });

  it("supports negative numbers and updates after collisions or imbalance", () => {
    const tree = new SegmentTree([-4, 9, -2, 11, -7, 3]);

    expect(tree.rangeSumQuery(0, 5).at(-1).result).toBe(10);
    expect(tree.rangeMinQuery(0, 5).at(-1).result).toBe(-7);

    tree.pointUpdate(2, -6);
    expect(tree.values[2]).toBe(-6);
    expect(tree.rangeSumQuery(0, 5).at(-1).result).toBe(6);
  });
});
