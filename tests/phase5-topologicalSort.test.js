import { describe, expect, it } from "vitest";

import {
  dfsTopologicalSort,
  kahnTopologicalSort,
  TopologicalSortAlgorithm,
} from "../src/algorithms/graphs/topologicalSort.js";
import { Graph } from "../src/data-structures/graphs/graph.js";

function makeGraph(vertices = [], edges = []) {
  const graph = new Graph({ directed: true });
  vertices.forEach((vertex) => graph.addVertex(vertex));
  edges.forEach(([from, to]) => graph.addEdge(from, to));
  return graph;
}

function finalResult(steps) {
  return steps.at(-1).result;
}

function expectValidOrdering(graph, order) {
  expect(order).toHaveLength(graph.vertices.length);
  const indices = new Map(order.map((vertex, index) => [vertex, index]));
  for (const { from, to } of graph.edgeList()) {
    expect(indices.get(from)).toBeLessThan(indices.get(to));
  }
}

describe("Topological sorting", () => {
  it("accepts an empty directed graph with an empty valid ordering", () => {
    for (const steps of [kahnTopologicalSort(new Graph({ directed: true })), dfsTopologicalSort(new Graph({ directed: true }))]) {
      expect(finalResult(steps)).toMatchObject({ valid: true, order: [], cycle: [] });
    }
  });

  it("orders a single vertex", () => {
    const graph = makeGraph(["A"]);
    expect(finalResult(kahnTopologicalSort(graph)).order).toEqual(["A"]);
    expect(finalResult(dfsTopologicalSort(graph)).order).toEqual(["A"]);
  });

  it("returns valid orderings for a linear DAG", () => {
    const graph = makeGraph(["A", "B", "C", "D"], [["A", "B"], ["B", "C"], ["C", "D"]]);
    for (const steps of [kahnTopologicalSort(graph), dfsTopologicalSort(graph)]) {
      const result = finalResult(steps);
      expect(result.valid).toBe(true);
      expectValidOrdering(graph, result.order);
    }
  });

  it("supports multiple valid topological orders", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "C"], ["B", "C"]]);
    const kahn = finalResult(kahnTopologicalSort(graph)).order;
    const dfs = finalResult(dfsTopologicalSort(graph)).order;
    expectValidOrdering(graph, kahn);
    expectValidOrdering(graph, dfs);
    expect(kahn.slice(0, 2).sort()).toEqual(["A", "B"]);
    expect(dfs.slice(0, 2).sort()).toEqual(["A", "B"]);
  });

  it("orders disconnected DAG components and isolated vertices", () => {
    const graph = makeGraph(["A", "B", "C", "D", "E"], [["A", "B"], ["C", "D"]]);
    expectValidOrdering(graph, finalResult(kahnTopologicalSort(graph)).order);
    expectValidOrdering(graph, finalResult(dfsTopologicalSort(graph)).order);
  });

  it("detects directed cycles and never returns a partial order as valid", () => {
    const graph = makeGraph(["A", "B", "C", "D"], [["A", "B"], ["B", "C"], ["C", "A"]]);
    for (const steps of [kahnTopologicalSort(graph), dfsTopologicalSort(graph)]) {
      const result = finalResult(steps);
      expect(result.valid).toBe(false);
      expect(result.order).toEqual([]);
      expect(result.partialOrder.length).toBeLessThan(graph.vertices.length);
      expect(result.cycle[0]).toBe(result.cycle.at(-1));
    }
  });

  it("detects a self-loop as a directed cycle", () => {
    const graph = makeGraph(["A", "B"], [["A", "A"]]);
    for (const steps of [kahnTopologicalSort(graph), dfsTopologicalSort(graph)]) {
      expect(finalResult(steps)).toMatchObject({ valid: false, order: [] });
    }
    expect(finalResult(dfsTopologicalSort(graph)).cycle).toEqual(["A", "A"]);
  });

  it("rejects undirected graphs with a clear explanation", () => {
    const graph = new Graph();
    graph.addVertex("A");
    const steps = new TopologicalSortAlgorithm(graph).run();
    expect(steps).toHaveLength(1);
    expect(finalResult(steps).valid).toBe(false);
    expect(finalResult(steps).reason).toMatch(/requires a directed graph/);
  });

  it("calculates initial and final in-degree values correctly", () => {
    const graph = makeGraph(["A", "B", "C", "D"], [["A", "C"], ["B", "C"], ["C", "D"]]);
    const steps = kahnTopologicalSort(graph);
    const initial = steps.find((step) => step.label === "Calculate in-degrees");
    expect(initial.inDegrees).toEqual({ A: 0, B: 0, C: 2, D: 1 });
    expect(finalResult(steps).inDegrees).toEqual({ A: 0, B: 0, C: 0, D: 0 });
  });

  it("emits independently mutable snapshots", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B"], ["B", "C"]]);
    const steps = kahnTopologicalSort(graph);
    const first = steps[0];
    const later = steps.find((step) => step.label === "Calculate in-degrees");
    first.vertices.push("corrupt");
    first.inDegrees.A = 999;
    first.adjacencyList.A.pop();
    first.edgeList[0].weight = 999;
    first.adjacencyMatrix.matrix[0].push(99);

    expect(later.vertices).toEqual(["A", "B", "C"]);
    expect(later.inDegrees.A).toBe(0);
    expect(later.adjacencyList.A).toHaveLength(1);
    expect(later.edgeList[0].weight).toBe(1);
    expect(later.adjacencyMatrix.matrix[0]).toHaveLength(3);
  });

  it("does not mutate the source graph in either algorithm", () => {
    const graph = makeGraph(["A", "B", "C", "D"], [["A", "B"], ["A", "C"], ["C", "D"]]);
    const before = {
      vertices: [...graph.vertices],
      list: graph.adjacencyList(),
      matrix: graph.adjacencyMatrix(),
      edges: graph.edgeList(),
    };
    kahnTopologicalSort(graph);
    dfsTopologicalSort(graph);
    expect(graph.vertices).toEqual(before.vertices);
    expect(graph.adjacencyList()).toEqual(before.list);
    expect(graph.adjacencyMatrix()).toEqual(before.matrix);
    expect(graph.edgeList()).toEqual(before.edges);
  });

  it("rejects an unsupported approach", () => {
    const graph = makeGraph(["A"]);
    expect(() => new TopologicalSortAlgorithm(graph).run("other")).toThrow(TypeError);
  });
});
