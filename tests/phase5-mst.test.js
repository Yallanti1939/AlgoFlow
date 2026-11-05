import { describe, expect, it } from "vitest";

import { PrimAlgorithm, prim } from "../src/algorithms/graphs/prim.js";
import { kruskal } from "../src/algorithms/graphs/kruskal.js";
import { Graph } from "../src/data-structures/graphs/graph.js";

function makeGraph(vertices = [], edges = [], directed = false) {
  const graph = new Graph({ directed, weighted: true });
  vertices.forEach((vertex) => graph.addVertex(vertex));
  edges.forEach(([from, to, weight]) => graph.addEdge(from, to, weight));
  return graph;
}

function resultOf(steps) {
  return steps.at(-1).result;
}

function assertForestValid(graph, result) {
  expect(result.valid).toBe(true);
  const parent = new Map(graph.vertices.map((vertex) => [String(vertex), String(vertex)]));
  const find = (value) => {
    let current = value;
    while (parent.get(current) !== current) current = parent.get(current);
    return current;
  };
  for (const edge of result.edges) {
    const left = find(String(edge.from));
    const right = find(String(edge.to));
    expect(left).not.toBe(right);
    parent.set(left, right);
  }
  expect(result.totalWeight).toBe(result.edges.reduce((sum, edge) => sum + edge.weight, 0));
  expect(result.edges).toHaveLength(graph.vertices.length - result.componentCount);
}

const algorithms = [
  ["Prim", (graph) => prim(graph, graph.vertices[0])],
  ["Kruskal", kruskal],
];

describe.each(algorithms)("Minimum spanning forest — %s", (_name, run) => {
  it("handles empty graphs", () => {
    const result = resultOf(run(makeGraph()));
    expect(result).toMatchObject({ valid: true, totalWeight: 0, componentCount: 0, edges: [] });
  });

  it("handles a single vertex as a zero-edge spanning tree", () => {
    const result = resultOf(run(makeGraph(["A"])));
    expect(result).toMatchObject({ valid: true, totalWeight: 0, componentCount: 1, connected: true, edges: [] });
  });

  it("computes the correct MST weight and V-1 edges for a connected graph", () => {
    const graph = makeGraph(["A", "B", "C", "D"], [
      ["A", "B", 4],
      ["A", "C", 2],
      ["B", "C", 1],
      ["B", "D", 5],
      ["C", "D", 8],
    ]);
    const result = resultOf(run(graph));
    expect(result.totalWeight).toBe(8);
    expect(result.edges).toHaveLength(graph.vertices.length - 1);
    expect(result.isSpanningTree).toBe(true);
    assertForestValid(graph, result);
  });

  it("returns a minimum spanning forest for disconnected graphs and isolated vertices", () => {
    const graph = makeGraph(["A", "B", "C", "D", "E"], [["A", "B", 2], ["C", "D", 1]]);
    const result = resultOf(run(graph));
    expect(result.connected).toBe(false);
    expect(result.componentCount).toBe(3);
    expect(result.isSpanningForest).toBe(true);
    expect(result.isSpanningTree).toBe(false);
    expect(result.isolatedVertices).toEqual(["E"]);
    assertForestValid(graph, result);
  });

  it("supports negative and zero-weight edges", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B", 0], ["B", "C", -2], ["A", "C", 5]]);
    const result = resultOf(run(graph));
    expect(result.totalWeight).toBe(-2);
    expect(result.edges.map((edge) => edge.weight).sort((a, b) => a - b)).toEqual([-2, 0]);
  });

  it("handles equal weights while returning a valid minimum tree", () => {
    const graph = makeGraph(["A", "B", "C", "D"], [
      ["A", "B", 1],
      ["B", "C", 1],
      ["C", "D", 1],
      ["D", "A", 1],
    ]);
    const result = resultOf(run(graph));
    expect(result.totalWeight).toBe(3);
    expect(result.edges).toHaveLength(3);
    assertForestValid(graph, result);
  });

  it("rejects directed graphs clearly", () => {
    const result = resultOf(run(makeGraph(["A", "B"], [["A", "B", 1]], true)));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/requires an undirected graph/);
  });

  it("does not mutate the graph or previously captured snapshots", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B", 2], ["B", "C", 3]]);
    const before = {
      vertices: [...graph.vertices],
      list: graph.adjacencyList(),
      matrix: graph.adjacencyMatrix(),
      edges: graph.edgeList(),
    };
    const steps = run(graph);
    const initial = steps[0];
    const later = steps.find((step) => step.currentEdge);
    expect(Object.isFrozen(initial)).toBe(true);
    expect(Object.isFrozen(initial.vertices)).toBe(true);
    expect(initial.selectedEdges).not.toBe(later.selectedEdges);
    expect(initial.adjacencyList).not.toBe(later.adjacencyList);
    expect(graph.vertices).toEqual(before.vertices);
    expect(graph.adjacencyList()).toEqual(before.list);
    expect(graph.adjacencyMatrix()).toEqual(before.matrix);
    expect(graph.edgeList()).toEqual(before.edges);
  });
});

describe("Prim-specific behavior", () => {
  it("starts from the selected vertex and rejects a missing start", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B", 1], ["B", "C", 1]]);
    const algorithm = new PrimAlgorithm(graph, "C");
    expect(algorithm.run()[0].label).toBe("Start Prim at C");
    const invalid = resultOf(new PrimAlgorithm(graph, "Z").run());
    expect(invalid.valid).toBe(false);
    expect(invalid.reason).toMatch(/Start vertex Z/);
  });

  it("exposes candidate queue states and rejects cycle-forming edges", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B", 1], ["B", "C", 2], ["C", "A", 3]]);
    const steps = prim(graph, "A");
    expect(steps.some((step) => step.priorityQueue.length > 0)).toBe(true);
    expect(steps.some((step) => step.label.startsWith("Reject"))).toBe(true);
  });
});

describe("Kruskal-specific behavior", () => {
  it("sorts candidate edges and records rejected cycle edges", () => {
    const graph = makeGraph(["A", "B", "C", "D"], [["A", "B", 3], ["B", "C", 1], ["C", "A", 2]]);
    const steps = kruskal(graph);
    expect(steps[0].sortedEdges.map((edge) => edge.weight)).toEqual([1, 2, 3]);
    expect(steps.some((step) => step.rejectedEdges.length > 0)).toBe(true);
    expect(resultOf(steps).totalWeight).toBe(3);
  });

  it("rejects self-loops as cycle edges", () => {
    const graph = makeGraph(["A", "B"], [["A", "A", -1], ["A", "B", 2]]);
    const result = resultOf(kruskal(graph));
    expect(result.edges).toHaveLength(1);
    expect(result.rejectedEdges.some((edge) => edge.from === edge.to)).toBe(true);
  });
});
