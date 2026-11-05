import { describe, expect, it } from "vitest";

import { DijkstraAlgorithm, dijkstra } from "../src/algorithms/graphs/dijkstra.js";
import { Graph } from "../src/data-structures/graphs/graph.js";

function makeGraph(vertices = [], edges = [], directed = true) {
  const graph = new Graph({ directed, weighted: true });
  vertices.forEach((vertex) => graph.addVertex(vertex));
  edges.forEach(([from, to, weight]) => graph.addEdge(from, to, weight));
  return graph;
}

describe("Dijkstra shortest paths", () => {
  it("handles empty graphs", () => {
    const steps = dijkstra(makeGraph(), "A");
    expect(steps[0].label).toBe("Empty graph");
    expect(steps[0].result).toMatchObject({ valid: true, distances: {} });
  });

  it("handles a single vertex and source-to-source path", () => {
    const algorithm = new DijkstraAlgorithm(makeGraph(["A"]), "A");
    const result = algorithm.run().at(-1).result;
    expect(result.distances).toEqual({ A: 0 });
    expect(algorithm.shortestPath("A")).toEqual(["A"]);
  });

  it("reports unreachable vertices in disconnected graphs", () => {
    const algorithm = new DijkstraAlgorithm(
      makeGraph(["A", "B", "C"], [["A", "B", 2]]),
      "A"
    );
    const result = algorithm.run().at(-1).result;
    expect(result.distances).toEqual({ A: 0, B: 2, C: Infinity });
    expect(result.unreachable).toEqual(["C"]);
    expect(algorithm.shortestPath("C")).toEqual([]);
  });

  it("supports zero and positive edge weights", () => {
    const algorithm = new DijkstraAlgorithm(
      makeGraph(["A", "B", "C"], [["A", "B", 0], ["B", "C", 3], ["A", "C", 8]]),
      "A"
    );
    const result = algorithm.run().at(-1).result;
    expect(result.distances).toEqual({ A: 0, B: 0, C: 3 });
    expect(algorithm.shortestPath("C")).toEqual(["A", "B", "C"]);
  });

  it("rejects negative edge weights with a clear invalid result", () => {
    const steps = dijkstra(makeGraph(["A", "B"], [["A", "B", -1]]), "A");
    const result = steps.at(-1).result;
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/non-negative edge weights/);
    expect(steps).toHaveLength(1);
  });

  it("relaxes a vertex more than once and keeps the best distance", () => {
    const algorithm = new DijkstraAlgorithm(
      makeGraph(["A", "B", "C", "D"], [
        ["A", "B", 10],
        ["A", "C", 1],
        ["C", "B", 1],
        ["B", "D", 2],
        ["C", "D", 10],
      ]),
      "A"
    );
    const steps = algorithm.run();
    expect(steps.filter((step) => step.label === "Relax A → B")).toHaveLength(1);
    expect(steps.some((step) => step.label === "Relax C → B")).toBe(true);
    expect(steps.at(-1).result.distances).toEqual({ A: 0, B: 2, C: 1, D: 4 });
    expect(algorithm.shortestPath("D")).toEqual(["A", "C", "B", "D"]);
  });

  it("tracks parents and reconstructs the requested shortest route", () => {
    const algorithm = new DijkstraAlgorithm(
      makeGraph(["S", "A", "B", "T"], [
        ["S", "A", 2],
        ["S", "B", 5],
        ["A", "B", 1],
        ["B", "T", 2],
        ["A", "T", 9],
      ]),
      "S"
    );
    const result = algorithm.run().at(-1).result;
    expect(result.parents).toEqual({ S: null, A: "S", B: "A", T: "B" });
    expect(algorithm.shortestPath("T")).toEqual(["S", "A", "B", "T"]);
  });

  it("reports an invalid source vertex", () => {
    const result = dijkstra(makeGraph(["A"]), "missing").at(-1).result;
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/Source vertex missing/);
  });

  it("creates independent snapshots and does not mutate the graph", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B", 2], ["B", "C", 3]]);
    const before = {
      vertices: [...graph.vertices],
      adjacency: graph.adjacencyList(),
      edges: graph.edgeList(),
      matrix: graph.adjacencyMatrix(),
    };
    const steps = dijkstra(graph, "A");
    const first = steps[0];
    const later = steps.find((step) => step.label === "Relax A → B");
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.distances)).toBe(true);
    expect(Object.isFrozen(first.adjacencyList.A)).toBe(true);
    expect(first.distances).not.toBe(later.distances);
    expect(first.edgeList).not.toBe(later.edgeList);

    expect(later.distances.A).toBe(0);
    expect(later.parents.B).toBe("A");
    expect(later.edgeList[0].weight).toBe(2);
    expect(later.adjacencyList.A).toHaveLength(1);
    expect(later.adjacencyMatrix.matrix[0]).toHaveLength(3);
    expect(graph.vertices).toEqual(before.vertices);
    expect(graph.adjacencyList()).toEqual(before.adjacency);
    expect(graph.edgeList()).toEqual(before.edges);
    expect(graph.adjacencyMatrix()).toEqual(before.matrix);
  });
});
