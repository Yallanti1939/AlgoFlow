import { describe, expect, it } from "vitest";

import { FloydWarshallAlgorithm, floydWarshall } from "../src/algorithms/graphs/floydWarshall.js";
import { Graph } from "../src/data-structures/graphs/graph.js";

function makeGraph(vertices = [], edges = [], directed = true) {
  const graph = new Graph({ directed, weighted: true });
  vertices.forEach((vertex) => graph.addVertex(vertex));
  edges.forEach(([from, to, weight]) => graph.addEdge(from, to, weight));
  return graph;
}

describe("Floyd-Warshall all-pairs shortest paths", () => {
  it("handles empty graphs", () => {
    const steps = floydWarshall(makeGraph());
    expect(steps[0].result).toMatchObject({
      valid: true,
      hasNegativeCycle: false,
      vertices: [],
      distances: [],
    });
  });

  it("initializes a single vertex with zero distance and a trivial path", () => {
    const algorithm = new FloydWarshallAlgorithm(makeGraph(["A"]));
    const result = algorithm.run().at(-1).result;
    expect(result.distances).toEqual([[0]]);
    expect(algorithm.shortestPath("A", "A")).toEqual(["A"]);
  });

  it("represents disconnected vertices with Infinity and no path", () => {
    const algorithm = new FloydWarshallAlgorithm(makeGraph(["A", "B", "C"], [["A", "B", 2]]));
    const result = algorithm.run().at(-1).result;
    expect(result.distances).toEqual([
      [0, 2, Infinity],
      [Infinity, 0, Infinity],
      [Infinity, Infinity, 0],
    ]);
    expect(algorithm.shortestPath("A", "C")).toEqual([]);
  });

  it("finds improved routes through intermediate vertices", () => {
    const algorithm = new FloydWarshallAlgorithm(
      makeGraph(["A", "B", "C", "D"], [
        ["A", "B", 3],
        ["A", "C", 10],
        ["B", "C", -2],
        ["C", "D", 4],
        ["A", "D", 20],
      ])
    );
    const result = algorithm.run().at(-1).result;
    expect(result.distances[0][2]).toBe(1);
    expect(result.distances[0][3]).toBe(5);
    expect(algorithm.shortestPath("A", "D")).toEqual(["A", "B", "C", "D"]);
  });

  it("supports negative edges without a negative cycle", () => {
    const result = floydWarshall(makeGraph(["A", "B", "C"], [["A", "B", 4], ["B", "C", -3]])).at(-1).result;
    expect(result.hasNegativeCycle).toBe(false);
    expect(result.distances[0][2]).toBe(1);
  });

  it("detects negative cycles and marks affected pairs as undefined", () => {
    const algorithm = new FloydWarshallAlgorithm(
      makeGraph(["A", "B", "C", "X"], [
        ["A", "B", 1],
        ["B", "C", -3],
        ["C", "B", 1],
      ])
    );
    const result = algorithm.run().at(-1).result;
    expect(result.hasNegativeCycle).toBe(true);
    expect(result.negativeCycleVertices).toContain("B");
    expect(result.distances[0][1]).toBe(-Infinity);
    expect(result.distances[0][2]).toBe(-Infinity);
    expect(result.distances[3][1]).toBe(Infinity);
    expect(algorithm.shortestPath("A", "C")).toEqual([]);
  });

  it("detects a negative self-loop from its negative diagonal", () => {
    const result = floydWarshall(makeGraph(["A"], [["A", "A", -1]])).at(-1).result;
    expect(result.hasNegativeCycle).toBe(true);
    expect(result.negativeCycleVertices).toEqual(["A"]);
    expect(result.distances[0][0]).toBe(-Infinity);
  });

  it("exposes accurate before-and-after cell snapshots", () => {
    const steps = floydWarshall(makeGraph(["A", "B", "C"], [["A", "B", 2], ["B", "C", 3], ["A", "C", 9]]));
    const update = steps.find((step) => step.label === "Update A → C via B");
    expect(update.matrixCell).toEqual({ row: "A", column: "C", intermediate: "B" });
    expect(update.beforeValue).toBe(9);
    expect(update.afterValue).toBe(5);
    expect(update.distances[0][2]).toBe(5);
  });

  it("keeps snapshots independent and does not mutate the graph", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B", 2], ["B", "C", 3]]);
    const before = {
      vertices: [...graph.vertices],
      list: graph.adjacencyList(),
      matrix: graph.adjacencyMatrix(),
      edges: graph.edgeList(),
    };
    const steps = floydWarshall(graph);
    const initial = steps[0];
    const update = steps.find((step) => step.label.startsWith("Update"));
    expect(Object.isFrozen(initial)).toBe(true);
    expect(Object.isFrozen(initial.distances[0])).toBe(true);
    expect(Object.isFrozen(initial.adjacencyList.A)).toBe(true);
    expect(initial.distances).not.toBe(update.distances);
    expect(initial.edgeList).not.toBe(update.edgeList);

    expect(update.distances[0][1]).toBe(2);
    expect(update.nextHop[0][1]).toBe(1);
    expect(update.adjacencyList.A).toHaveLength(1);
    expect(update.edgeList[0].weight).toBe(2);
    expect(update.adjacencyMatrix.matrix[0]).toHaveLength(3);
    expect(graph.vertices).toEqual(before.vertices);
    expect(graph.adjacencyList()).toEqual(before.list);
    expect(graph.adjacencyMatrix()).toEqual(before.matrix);
    expect(graph.edgeList()).toEqual(before.edges);
  });

  it("supports both directions for undirected graphs", () => {
    const result = floydWarshall(makeGraph(["A", "B"], [["A", "B", 7]], false)).at(-1).result;
    expect(result.distances).toEqual([[0, 7], [7, 0]]);
  });
});
