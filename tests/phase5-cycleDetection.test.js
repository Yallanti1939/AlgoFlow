import { describe, expect, it } from "vitest";

import {
  CycleDetectionAlgorithm,
  detectCycle,
  detectDirectedCycle,
  detectUndirectedCycle,
} from "../src/algorithms/graphs/cycleDetection.js";
import { Graph } from "../src/data-structures/graphs/graph.js";

function graphWith(vertices, { directed = false, edges = [] } = {}) {
  const graph = new Graph({ directed });
  vertices.forEach((vertex) => graph.addVertex(vertex));
  edges.forEach(([from, to]) => graph.addEdge(from, to));
  return graph;
}

function resultOf(steps) {
  return steps.at(-1).result;
}

function hasEdgesInCycle(graph, cycle) {
  return cycle.slice(0, -1).every((vertex, index) => graph.hasEdge(vertex, cycle[index + 1]));
}

describe("Graph cycle detection", () => {
  it("reports no cycle for an empty graph or isolated vertex", () => {
    expect(resultOf(detectUndirectedCycle(new Graph()))).toMatchObject({
      hasCycle: false,
      cycle: [],
    });
    const graph = graphWith(["A"]);
    expect(resultOf(detectUndirectedCycle(graph))).toMatchObject({
      hasCycle: false,
      visited: ["A"],
    });
  });

  it("detects an undirected self-loop", () => {
    const graph = graphWith(["A"], { edges: [["A", "A"]] });
    const result = resultOf(detectUndirectedCycle(graph));
    expect(result.hasCycle).toBe(true);
    expect(result.cycle).toEqual(["A", "A"]);
  });

  it("detects and reconstructs a simple undirected cycle", () => {
    const graph = graphWith(["A", "B", "C", "D"], {
      edges: [["A", "B"], ["B", "C"], ["C", "A"], ["C", "D"]],
    });
    const result = resultOf(detectUndirectedCycle(graph));
    expect(result.hasCycle).toBe(true);
    expect(result.cycle[0]).toBe(result.cycle.at(-1));
    expect(result.cycle.length).toBeGreaterThanOrEqual(4);
    expect(hasEdgesInCycle(graph, result.cycle)).toBe(true);
  });

  it("does not mistake parent edges for cycles in an undirected tree", () => {
    const graph = graphWith(["A", "B", "C", "D", "E"], {
      edges: [["A", "B"], ["A", "C"], ["B", "D"], ["B", "E"]],
    });
    expect(resultOf(detectUndirectedCycle(graph)).hasCycle).toBe(false);
  });

  it("finds cycles in disconnected components", () => {
    const graph = graphWith(["A", "B", "C", "D", "E"], {
      edges: [["A", "B"], ["C", "D"], ["D", "E"], ["E", "C"]],
    });
    const result = resultOf(detectUndirectedCycle(graph));
    expect(result.hasCycle).toBe(true);
    expect(result.cycle).toContain("C");
    expect(result.cycle).toContain("D");
    expect(result.cycle).toContain("E");
  });

  it("detects a directed cycle through a back edge", () => {
    const graph = graphWith(["A", "B", "C", "D"], {
      directed: true,
      edges: [["A", "B"], ["B", "C"], ["C", "A"], ["C", "D"]],
    });
    const result = resultOf(detectDirectedCycle(graph));
    expect(result.hasCycle).toBe(true);
    expect(result.cycle).toEqual(["A", "B", "C", "A"]);
    expect(hasEdgesInCycle(graph, result.cycle)).toBe(true);
  });

  it("does not report a directed acyclic graph as cyclic", () => {
    const graph = graphWith(["A", "B", "C", "D"], {
      directed: true,
      edges: [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"]],
    });
    expect(resultOf(detectDirectedCycle(graph))).toMatchObject({
      hasCycle: false,
      cycle: [],
      visited: ["A", "B", "D", "C"],
    });
  });

  it("checks all directed components, including a later self-loop", () => {
    const graph = graphWith(["A", "B", "C"], {
      directed: true,
      edges: [["A", "B"], ["C", "C"]],
    });
    const result = resultOf(detectCycle(graph));
    expect(result.hasCycle).toBe(true);
    expect(result.cycle).toEqual(["C", "C"]);
  });

  it("emits independently mutable snapshots", () => {
    const graph = graphWith(["A", "B", "C"], {
      edges: [["A", "B"], ["B", "C"], ["C", "A"]],
    });
    const steps = detectUndirectedCycle(graph);
    const first = steps[0];
    const later = steps.find((step) => step.label === "Visit A");
    first.vertices.push("corrupt");
    first.adjacencyList.A.pop();
    first.adjacencyMatrix.matrix[0].push(99);
    first.edgeList[0].weight = 999;

    expect(later.vertices).toEqual(["A", "B", "C"]);
    expect(later.adjacencyList.A).toHaveLength(2);
    expect(later.adjacencyMatrix.matrix[0]).toHaveLength(3);
    expect(later.edgeList[0].weight).toBe(1);
  });

  it("does not mutate the graph during traversal", () => {
    const graph = graphWith(["A", "B", "C", "D"], {
      directed: true,
      edges: [["A", "B"], ["B", "C"], ["D", "D"]],
    });
    const before = {
      vertices: [...graph.vertices],
      adjacency: graph.adjacencyList(),
      matrix: graph.adjacencyMatrix(),
      edges: graph.edgeList(),
    };
    new CycleDetectionAlgorithm(graph).run();
    expect(graph.vertices).toEqual(before.vertices);
    expect(graph.adjacencyList()).toEqual(before.adjacency);
    expect(graph.adjacencyMatrix()).toEqual(before.matrix);
    expect(graph.edgeList()).toEqual(before.edges);
  });

  it("rejects a mode that does not match the graph's direction", () => {
    const graph = graphWith(["A"]);
    expect(() => new CycleDetectionAlgorithm(graph, "directed").run()).toThrow(/requires a directed graph/);
  });
});
