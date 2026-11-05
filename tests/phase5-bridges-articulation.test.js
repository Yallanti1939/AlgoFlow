import { describe, expect, it } from "vitest";

import { BridgesAlgorithm, findBridges } from "../src/algorithms/graphs/bridges.js";
import {
  ArticulationPointsAlgorithm,
  findArticulationPoints,
} from "../src/algorithms/graphs/articulationPoints.js";
import { Graph } from "../src/data-structures/graphs/graph.js";

function makeGraph(vertices = [], edges = [], directed = false) {
  const graph = new Graph({ directed, weighted: false });
  vertices.forEach((vertex) => graph.addVertex(vertex));
  edges.forEach(([from, to]) => graph.addEdge(from, to));
  return graph;
}

function edgeKeys(edges) {
  return edges.map(({ from, to }) => [String(from), String(to)].sort().join("--")).sort();
}

describe("Bridge finding", () => {
  it("returns no bridges for an empty graph", () => {
    expect(findBridges(makeGraph()).bridges).toEqual([]);
  });

  it("returns no bridges for a single isolated vertex", () => {
    const result = findBridges(makeGraph(["A"]));
    expect(result.bridges).toEqual([]);
    expect(result.components).toEqual([["A"]]);
  });

  it("finds every edge in a tree", () => {
    const graph = makeGraph(["A", "B", "C", "D"], [["A", "B"], ["B", "C"], ["B", "D"]]);
    expect(edgeKeys(findBridges(graph).bridges)).toEqual(["A--B", "B--C", "B--D"]);
  });

  it("finds bridges across disconnected components and keeps isolated vertices", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D", "E", "F"],
      [["A", "B"], ["B", "C"], ["D", "E"]]
    );
    const result = findBridges(graph);
    expect(edgeKeys(result.bridges)).toEqual(["A--B", "B--C", "D--E"]);
    expect(result.components).toEqual([["A", "B", "C"], ["D", "E"], ["F"]]);
  });

  it("finds no bridges in a cycle", () => {
    const graph = makeGraph(["A", "B", "C", "D"], [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"]]);
    expect(findBridges(graph).bridges).toEqual([]);
  });

  it("does not mistake the parent tree edge for a back edge", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D"],
      [["A", "B"], ["B", "C"], ["C", "A"], ["C", "D"]]
    );
    const result = findBridges(graph);
    expect(edgeKeys(result.bridges)).toEqual(["C--D"]);
    expect(edgeKeys(result.backEdges)).toEqual(["A--C"]);
  });

  it("does not classify self-loops as bridges", () => {
    const graph = makeGraph(["A", "B"], [["A", "A"], ["A", "B"], ["B", "B"]]);
    expect(edgeKeys(findBridges(graph).bridges)).toEqual(["A--B"]);
  });

  it("rejects directed graphs clearly", () => {
    const result = findBridges(makeGraph(["A", "B"], [["A", "B"]], true));
    expect(result.valid).toBe(false);
    expect(result.bridges).toEqual([]);
    expect(result.reason).toMatch(/undirected graph/);
  });

  it("records discoveries, low links, parents, and bridges in frozen snapshots", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B"], ["B", "C"], ["C", "A"]]);
    const steps = new BridgesAlgorithm(graph).run();
    expect(steps.at(-1).discovery).toEqual({ A: 0, B: 1, C: 2 });
    expect(steps.at(-1).lowLink).toEqual({ A: 0, B: 0, C: 0 });
    expect(steps.at(-1).parents).toEqual({ A: null, B: "A", C: "B" });
    expect(steps.every((step) => Object.isFrozen(step) && Object.isFrozen(step.bridges))).toBe(true);
    expect(steps.some((step) => step.label.startsWith("Bridge found"))).toBe(false);
  });
});

describe("Articulation-point detection", () => {
  it("returns no articulation points for empty and single-vertex graphs", () => {
    expect(findArticulationPoints(makeGraph()).articulationPoints).toEqual([]);
    expect(findArticulationPoints(makeGraph(["only"])).articulationPoints).toEqual([]);
  });

  it("detects non-root articulation points using the low-link condition", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D", "E"],
      [["A", "B"], ["B", "C"], ["C", "A"], ["C", "D"], ["D", "E"], ["E", "C"]]
    );
    expect(findArticulationPoints(graph).articulationPoints).toEqual(["C"]);
  });

  it("marks a DFS root only when it has more than one DFS child", () => {
    const withTwoChildren = makeGraph(["A", "B", "C"], [["A", "B"], ["A", "C"]]);
    const withOneChild = makeGraph(["A", "B", "C"], [["A", "B"], ["B", "C"]]);

    expect(findArticulationPoints(withTwoChildren).articulationPoints).toEqual(["A"]);
    expect(findArticulationPoints(withOneChild).articulationPoints).toEqual(["B"]);
  });

  it("detects multiple articulation points and ignores isolated components", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D", "E", "F"],
      [["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"]]
    );
    const result = findArticulationPoints(graph);
    expect(result.articulationPoints).toEqual(["D", "C", "B"]);
    expect(result.components).toEqual([["A", "B", "C", "D", "E"], ["F"]]);
  });

  it("finds no articulation points in a cycle or a self-loop-only graph", () => {
    const cycle = makeGraph(["A", "B", "C"], [["A", "B"], ["B", "C"], ["C", "A"]]);
    const loops = makeGraph(["X", "Y"], [["X", "X"], ["Y", "Y"]]);

    expect(findArticulationPoints(cycle).articulationPoints).toEqual([]);
    expect(findArticulationPoints(loops).articulationPoints).toEqual([]);
  });

  it("rejects directed graphs clearly", () => {
    const result = findArticulationPoints(makeGraph(["A", "B"], [["A", "B"]], true));
    expect(result.valid).toBe(false);
    expect(result.articulationPoints).toEqual([]);
    expect(result.reason).toMatch(/undirected graph/);
  });

  it("records root and non-root articulation-point detections", () => {
    const graph = makeGraph(["A", "B", "C", "D"], [["A", "B"], ["A", "C"], ["C", "D"]]);
    const steps = new ArticulationPointsAlgorithm(graph).run();
    expect(steps.at(-1).articulationPoints).toEqual(["C", "A"]);
    expect(steps.some((step) => step.label === "Root articulation point: A")).toBe(true);
    expect(steps.some((step) => step.label === "Articulation point found: C")).toBe(true);
    expect(steps.every((step) => Object.isFrozen(step))).toBe(true);
  });

  it("keeps earlier snapshots unchanged if the algorithm instance runs again", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B"], ["B", "C"]]);
    const algorithm = new ArticulationPointsAlgorithm(graph);
    const previousSteps = algorithm.run();
    const previousSnapshot = previousSteps[1];
    const serialized = JSON.stringify(previousSnapshot);

    algorithm.run();

    expect(JSON.stringify(previousSnapshot)).toBe(serialized);
    expect(Object.isFrozen(previousSnapshot.parents)).toBe(true);
  });
});

describe("Low-link graph integrity", () => {
  it("does not mutate the source graph", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D", "E"],
      [["A", "B"], ["B", "C"], ["C", "A"], ["C", "D"], ["E", "E"]]
    );
    const verticesBefore = [...graph.vertices];
    const edgesBefore = graph.edgeList().map((edge) => ({ ...edge }));
    const adjacencyBefore = graph.vertices.map((vertex) => [vertex, graph.getNeighbors(vertex).map((edge) => ({ ...edge }))]);

    findBridges(graph);
    findArticulationPoints(graph);

    expect(graph.vertices).toEqual(verticesBefore);
    expect(graph.edgeList()).toEqual(edgesBefore);
    expect(graph.vertices.map((vertex) => [vertex, graph.getNeighbors(vertex)])).toEqual(adjacencyBefore);
  });

  it("uses edge identity to avoid treating a parent edge as a back edge", () => {
    const graph = makeGraph(["A", "B"], [["A", "B"]]);
    const steps = new BridgesAlgorithm(graph).run();
    expect(edgeKeys(steps.at(-1).backEdges)).toEqual([]);
    expect(steps.filter((step) => step.label.startsWith("Skip parent edge"))).toHaveLength(1);
  });

  it("throws when passed an invalid graph object", () => {
    expect(() => findBridges(null)).toThrowError(/Graph instance/);
    expect(() => findArticulationPoints({ vertices: [] })).toThrowError(/Graph instance/);
  });
});
