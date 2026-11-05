import { describe, expect, it } from "vitest";

import DisjointSet from "../src/data-structures/graphs/disjointSet.js";

describe("DisjointSet", () => {
  it("supports empty and single-element initialization", () => {
    const empty = new DisjointSet();
    expect(empty.getComponents()).toEqual([]);
    expect(empty.getComponentCount()).toBe(0);

    const single = new DisjointSet(["only"]);
    expect(single.find("only")).toBe("only");
    expect(single.getComponentSize("only")).toBe(1);
    expect(single.getComponentCount()).toBe(1);
  });

  it("initializes multiple disjoint components", () => {
    const sets = new DisjointSet(["a", "b", "c"]);
    expect(sets.getComponentCount()).toBe(3);
    expect(sets.getComponents()).toEqual([["a"], ["b"], ["c"]]);
  });

  it("finds both root and non-root elements", () => {
    const sets = new DisjointSet([1, 2]);
    sets.union(1, 2);

    expect(sets.find(1)).toBe(1);
    expect(sets.find(2)).toBe(1);
  });

  it("compresses a multi-edge path during find", () => {
    const sets = new DisjointSet([1, 2, 3, 4, 5]);
    sets.union(3, 4);
    sets.union(3, 5);
    sets.union(1, 2);
    sets.union(1, 3);

    expect(sets.parent.get(2)).toBe(1);
    expect(sets.find(2)).toBe(3);
    expect(sets.parent.get(2)).toBe(3);
    expect(sets.getSteps().some((step) => step.label === "Compress path at 2")).toBe(true);
  });

  it("merges separate components and updates sizes and count", () => {
    const sets = new DisjointSet(["a", "b", "c"]);

    expect(sets.union("a", "b")).toBe(true);
    expect(sets.getComponentCount()).toBe(2);
    expect(sets.getComponentSize("a")).toBe(2);
    expect(sets.getComponentSize("b")).toBe(2);
  });

  it("returns false for a repeated union of connected elements", () => {
    const sets = new DisjointSet([1, 2]);
    expect(sets.union(1, 2)).toBe(true);
    expect(sets.union(2, 1)).toBe(false);
    expect(sets.getComponentCount()).toBe(1);
    expect(sets.getComponentSize(1)).toBe(2);
  });

  it("attaches the smaller component below the larger component", () => {
    const sets = new DisjointSet([1, 2, 3, 4, 5]);
    sets.union(1, 2);
    sets.union(3, 4);
    sets.union(3, 5);

    expect(sets.union(1, 3)).toBe(true);
    expect(sets.parent.get(1)).toBe(3);
    expect(sets.getComponentSize(1)).toBe(5);
  });

  it("answers connected queries and compresses their find paths", () => {
    const sets = new DisjointSet(["north", "south", "east"]);
    sets.union("north", "south");

    expect(sets.connected("north", "south")).toBe(true);
    expect(sets.connected("north", "east")).toBe(false);
    expect(sets.getSteps().at(-1).result).toBe(false);
  });

  it("reports component sizes and groups accurately", () => {
    const sets = new DisjointSet([1, 2, 3, 4, 5]);
    sets.union(1, 2);
    sets.union(3, 4);
    sets.union(3, 5);

    expect(sets.getComponentCount()).toBe(2);
    expect(sets.getComponentSize(4)).toBe(3);
    expect(sets.getComponents()).toEqual([[1, 2], [3, 4, 5]]);
  });

  it("keeps numeric and string elements distinct", () => {
    const sets = new DisjointSet([1, "1"]);
    expect(sets.getComponentCount()).toBe(2);
    expect(sets.connected(1, "1")).toBe(false);
    expect(sets.union(1, "1")).toBe(true);
    expect(sets.getComponentSize(1)).toBe(2);
  });

  it("ignores duplicate initialization in the constructor and makeSet", () => {
    const sets = new DisjointSet(["same", "same"]);
    expect(sets.getComponentCount()).toBe(1);
    expect(sets.makeSet("same")).toBe(false);
    expect(sets.makeSet("new")).toBe(true);
    expect(sets.getComponents()).toEqual([["same"], ["new"]]);
  });

  it("throws clear errors for unknown elements", () => {
    const sets = new DisjointSet([1]);
    expect(() => sets.find(2)).toThrowError(/Unknown disjoint-set element/);
    expect(() => sets.union(1, 2)).toThrowError(/Unknown disjoint-set element/);
    expect(() => sets.connected(1, 2)).toThrowError(/Unknown disjoint-set element/);
    expect(() => sets.getComponentSize(2)).toThrowError(/Unknown disjoint-set element/);
  });

  it("accepts only strings and finite numeric element values", () => {
    expect(() => new DisjointSet([null])).toThrowError(TypeError);
    expect(() => new DisjointSet([Infinity])).toThrowError(TypeError);
    expect(() => new DisjointSet("abc")).toThrowError(TypeError);
  });

  it("keeps playback snapshots frozen and independent across later operations", () => {
    const sets = new DisjointSet([1, 2, 3]);
    sets.union(1, 2);
    const priorSteps = sets.getSteps();
    const mergedSnapshot = priorSteps.at(-1);
    const originalParents = mergedSnapshot.parent.map((entry) => [...entry]);

    sets.union(2, 3);

    expect(Object.isFrozen(mergedSnapshot)).toBe(true);
    expect(Object.isFrozen(mergedSnapshot.parent)).toBe(true);
    expect(mergedSnapshot.parent).toEqual(originalParents);
    expect(mergedSnapshot.components).toEqual([[1, 2], [3]]);
    expect(priorSteps.at(-1)).toBe(mergedSnapshot);
  });

  it("records each path-compression and union-by-size state as an immutable snapshot", () => {
    const sets = new DisjointSet([1, 2, 3, 4, 5]);
    sets.union(3, 4);
    sets.union(3, 5);
    sets.union(1, 2);
    sets.union(1, 3);

    sets.find(2);
    const steps = sets.getSteps();
    expect(steps.length).toBeGreaterThan(2);
    expect(steps.every((step) => Object.isFrozen(step))).toBe(true);
    expect(steps.some((step) => step.currentPath.length > 1)).toBe(true);
  });

  it("returns defensive component arrays", () => {
    const sets = new DisjointSet(["x", "y"]);
    const groups = sets.getComponents();
    groups[0].push("mutated");
    groups.push(["another"]);

    expect(sets.getComponents()).toEqual([["x"], ["y"]]);
  });
});
