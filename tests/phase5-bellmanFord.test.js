import { describe, expect, it } from "vitest";

import { BellmanFordAlgorithm, bellmanFord } from "../src/algorithms/graphs/bellmanFord.js";
import { Graph } from "../src/data-structures/graphs/graph.js";

function makeGraph(vertices = [], edges = [], directed = true) {
  const graph = new Graph({ directed, weighted: true });
  vertices.forEach((vertex) => graph.addVertex(vertex));
  edges.forEach(([from, to, weight]) => graph.addEdge(from, to, weight));
  return graph;
}

describe("Bellman-Ford shortest paths", () => {
  it("supports negative edge weights without a negative cycle", () => {
    const algorithm = new BellmanFordAlgorithm(
      makeGraph(["A", "B", "C", "D"], [["A", "B", 4], ["A", "C", 5], ["C", "B", -2], ["B", "D", 3]]),
      "A"
    );
    const result = algorithm.run().at(-1).result;
    expect(result.distances).toEqual({ A: 0, B: 3, C: 5, D: 6 });
    expect(algorithm.shortestPath("D")).toEqual(["A", "C", "B", "D"]);
  });

  it("handles disconnected vertices and unreachable negative cycles", () => {
    const graph = makeGraph(["A", "B", "X", "Y"], [
      ["A", "B", 2],
      ["X", "Y", -3],
      ["Y", "X", 1],
    ]);
    const result = bellmanFord(graph, "A").at(-1).result;
    expect(result.negativeCycleDetected).toBe(false);
    expect(result.distances).toEqual({ A: 0, B: 2, X: Infinity, Y: Infinity });
    expect(result.unreachable).toEqual(["X", "Y"]);
  });

  it("detects reachable negative cycles and marks all affected vertices undefined", () => {
    const algorithm = new BellmanFordAlgorithm(
      makeGraph(["A", "B", "C", "D", "X"], [
        ["A", "B", 1],
        ["B", "C", -3],
        ["C", "B", 1],
        ["C", "D", 2],
      ]),
      "A"
    );
    const result = algorithm.run().at(-1).result;
    expect(result.negativeCycleDetected).toBe(true);
    expect(result.negativeCycle[0]).toBe(result.negativeCycle.at(-1));
    expect(result.affectedByNegativeCycle).toEqual(expect.arrayContaining(["B", "C", "D"]));
    expect(result.distances.B).toBe(-Infinity);
    expect(result.distances.C).toBe(-Infinity);
    expect(result.distances.D).toBe(-Infinity);
    expect(result.distances.X).toBe(Infinity);
    expect(algorithm.shortestPath("D")).toEqual([]);
    expect(result.reason).toMatch(/reachable negative cycle/);
  });

  it("distinguishes a reachable negative cycle from an unreachable one", () => {
    const graph = makeGraph(["S", "T", "X", "Y"], [
      ["S", "T", 5],
      ["X", "Y", -2],
      ["Y", "X", 1],
    ]);
    const result = bellmanFord(graph, "S").at(-1).result;
    expect(result.negativeCycleDetected).toBe(false);
    expect(result.distances.S).toBe(0);
    expect(result.distances.T).toBe(5);
    expect(result.distances.X).toBe(Infinity);
  });

  it("terminates early when a pass makes no changes", () => {
    const steps = bellmanFord(makeGraph(["A", "B", "C"], [["A", "B", 1], ["B", "C", 1]]), "A");
    expect(steps.some((step) => step.label.startsWith("Stop early"))).toBe(true);
  });

  it("handles empty graphs and invalid sources", () => {
    expect(bellmanFord(makeGraph(), "A")[0].result).toMatchObject({ valid: true, distances: {} });
    const invalid = bellmanFord(makeGraph(["A"]), "Z").at(-1).result;
    expect(invalid.valid).toBe(false);
    expect(invalid.reason).toMatch(/Source vertex Z/);
  });

  it("records separate relaxation pass snapshots", () => {
    const steps = bellmanFord(makeGraph(["A", "B", "C"], [["A", "B", 2], ["B", "C", -1]]), "A");
    const relaxation = steps.find((step) => step.label === "Relax A → B");
    expect(relaxation.pass).toBe(1);
    expect(relaxation.currentEdge).toEqual({ from: "A", to: "B", weight: 2 });
    expect(relaxation.distances).toEqual({ A: 0, B: 2, C: Infinity });
  });

  it("keeps snapshots independent and does not mutate the graph", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B", 2], ["B", "C", -1]]);
    const before = {
      vertices: [...graph.vertices],
      list: graph.adjacencyList(),
      matrix: graph.adjacencyMatrix(),
      edges: graph.edgeList(),
    };
    const steps = bellmanFord(graph, "A");
    const first = steps[0];
    const later = steps.find((step) => step.label === "Relax A → B");
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.distances)).toBe(true);
    expect(Object.isFrozen(first.adjacencyList.A)).toBe(true);
    expect(first.distances).not.toBe(later.distances);
    expect(first.edgeList).not.toBe(later.edgeList);

    expect(later.distances.A).toBe(0);
    expect(later.parents.B).toBe("A");
    expect(later.adjacencyList.A).toHaveLength(1);
    expect(later.edgeList[0].weight).toBe(2);
    expect(later.adjacencyMatrix.matrix[0]).toHaveLength(3);
    expect(graph.vertices).toEqual(before.vertices);
    expect(graph.adjacencyList()).toEqual(before.list);
    expect(graph.adjacencyMatrix()).toEqual(before.matrix);
    expect(graph.edgeList()).toEqual(before.edges);
  });
});
