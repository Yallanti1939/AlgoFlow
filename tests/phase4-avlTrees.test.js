import { describe, expect, it } from "vitest";
import { AVLTree } from "../src/data-structures/trees/avlTree.js";

describe("AVL Trees", () => {
  it("rebalance with LL rotation", () => {
    const tree = new AVLTree([30, 10, 5]);

    expect(tree.root.value).toBe(10);
    expect(tree.traverse("inorder")).toEqual([5, 10, 30]);
    expect(tree.validateAVL()).toBe(true);
  });

  it("rebalance with RR rotation", () => {
    const tree = new AVLTree([10, 30, 40]);

    expect(tree.root.value).toBe(30);
    expect(tree.traverse("inorder")).toEqual([10, 30, 40]);
    expect(tree.validateAVL()).toBe(true);
  });

  it("rebalance with LR rotation", () => {
    const tree = new AVLTree([30, 10, 20]);

    expect(tree.root.value).toBe(20);
    expect(tree.traverse("inorder")).toEqual([10, 20, 30]);
    expect(tree.validateAVL()).toBe(true);
  });

  it("rebalance with RL rotation", () => {
    const tree = new AVLTree([10, 30, 20]);

    expect(tree.root.value).toBe(20);
    expect(tree.traverse("inorder")).toEqual([10, 20, 30]);
    expect(tree.validateAVL()).toBe(true);
  });

  it("supports insert, search, delete and traversal", () => {
    const tree = new AVLTree([50, 20, 70, 10, 30, 60, 80]);

    expect(tree.search(30)?.value).toBe(30);
    expect(tree.search(100)).toBeNull();
    expect(tree.traverse("preorder")).toEqual([50, 20, 10, 30, 70, 60, 80]);
    expect(tree.traverse("postorder")).toEqual([10, 30, 20, 60, 80, 70, 50]);

    expect(tree.delete(20)).toBe(true);
    expect(tree.search(20)).toBeNull();
    expect(tree.validateAVL()).toBe(true);
    expect(tree.traverse("inorder")).toEqual([10, 30, 50, 60, 70, 80]);
  });

  it("tracks height and balance factor", () => {
    const tree = new AVLTree([30, 20, 10, 25, 40, 35]);

    expect(tree.root.value).toBe(30);
    expect(tree.getBalanceFactor(tree.root)).toBe(0);
    expect(tree.getNodeMetrics().map((entry) => entry.value)).toEqual([10, 20, 25, 30, 35, 40]);
  });

  it("creates animation snapshots for inserts and searches", () => {
    const tree = new AVLTree([30, 20, 40]);
    const insertSteps = tree.insertWithAnimation(10);
    const searchSteps = tree.searchWithAnimation(40);

    expect(insertSteps.length).toBeGreaterThan(0);
    expect(searchSteps[0].label).toContain("Compare");
    expect(tree.validateAVL()).toBe(true);
  });
});
