import { describe, expect, it } from "vitest";
import { BinaryTree } from "../src/data-structures/binaryTrees.js";

describe("Binary Trees", () => {
  it("supports insertion, search, deletion and traversal", () => {
    const tree = new BinaryTree([10, 5, 15, 3, 7, 12, 18, 1, 4]);

    expect(tree.search(7)?.value).toBe(7);
    expect(tree.height()).toBe(4);
    expect(tree.traverse("inorder")).toEqual([1, 3, 4, 5, 7, 10, 12, 15, 18]);
    expect(tree.traverse("preorder")).toEqual([10, 5, 3, 1, 4, 7, 15, 12, 18]);
    expect(tree.traverse("postorder")).toEqual([1, 4, 3, 7, 5, 12, 18, 15, 10]);

    expect(tree.delete(5)).toBe(true);
    expect(tree.search(5)).toBeNull();
    expect(tree.traverse("inorder")).toEqual([1, 3, 4, 7, 10, 12, 15, 18]);
    expect(tree.isBalanced()).toBe(false);
  });

  it("creates traversal steps for animations", () => {
    const tree = new BinaryTree([10, 5, 15]);
    const steps = tree.stepsFor("inorder");

    expect(steps[0].label).toContain("5");
    expect(steps[1].label).toContain("10");
    expect(steps[2].label).toContain("15");
  });
});
