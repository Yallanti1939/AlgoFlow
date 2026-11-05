import { describe, expect, it } from "vitest";

import { BFSAlgorithm, bfsTraversal } from "../src/algorithms/graphs/bfs.js";
import { Graph } from "../src/data-structures/graphs/graph.js";

function createSampleGraph({ directed = false } = {}) {
  const graph = new Graph({ directed, weighted: false });
  ["A", "B", "C", "D", "E", "F"].forEach((vertex) => graph.addVertex(vertex));

  const edges = [
    ["A", "B"],
    ["A", "C"],
    ["B", "D"],
    ["C", "E"],
    ["D", "F"],
    ["E", "F"],
    ["C", "D"],
  ];

  edges.forEach(([from, to]) => graph.addEdge(from, to));
  return graph;
}

describe("Breadth-First Search", () => {
  it("handles empty and single-vertex graphs", () => {
    const empty = new Graph();
    const emptyBfs = bfsTraversal(empty, "A");
    expect(emptyBfs[0].label).toContain("Empty graph");

    const single = new Graph();
    single.addVertex("A");
    const singleBfs = bfsTraversal(single, "A");
    expect(singleBfs.at(-1).result.order).toEqual(["A"]);
    expect(singleBfs.at(-1).result.distances).toEqual({ A: 0 });
  });

  it("traverses a linear graph in BFS order with parent and distance data", () => {
    const graph = new Graph({ directed: false, weighted: false });
    ["A", "B", "C", "D"].forEach((vertex) => graph.addVertex(vertex));
    graph.addEdge("A", "B");
    graph.addEdge("B", "C");
    graph.addEdge("C", "D");

    const steps = bfsTraversal(graph, "A");
    const final = steps.at(-1).result;

    expect(final.order).toEqual(["A", "B", "C", "D"]);
    expect(final.parents).toEqual({ A: null, B: "A", C: "B", D: "C" });
    expect(final.distances).toEqual({ A: 0, B: 1, C: 2, D: 3 });
  });

  it("handles cyclic and disconnected graphs correctly", () => {
    const cyclic = createSampleGraph({ directed: false });
    const cyclicBfs = bfsTraversal(cyclic, "A");
    expect(cyclicBfs.at(-1).result.order).toEqual(["A", "B", "C", "D", "E", "F"]);
    expect(cyclicBfs.at(-1).result.distances["F"]).toBe(3);

    const disconnected = new Graph({ directed: false, weighted: false });
    ["A", "B", "C", "D"].forEach((vertex) => disconnected.addVertex(vertex));
    disconnected.addEdge("A", "B");
    disconnected.addEdge("C", "D");

    const disconnectedBfs = bfsTraversal(disconnected, "A");
    expect(disconnectedBfs.at(-1).result.order).toEqual(["A", "B"]);
    expect(disconnectedBfs.at(-1).result.distances["C"]).toBeUndefined();
  });

  it("supports directed graphs and shortest-path reconstruction", () => {
    const graph = new Graph({ directed: true, weighted: false });
    ["A", "B", "C", "D", "E", "F"].forEach((vertex) => graph.addVertex(vertex));
    [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["C", "E"],
      ["D", "F"],
      ["C", "D"],
    ].forEach(([from, to]) => graph.addEdge(from, to));

    const algorithm = new BFSAlgorithm(graph, "A");
    const steps = algorithm.run();
    const final = steps.at(-1).result;

    expect(final.order).toEqual(["A", "B", "C", "D", "E", "F"]);
    expect(algorithm.shortestPath("F")).toEqual(["A", "B", "D", "F"]);
    expect(final.distances["F"]).toBe(3);
  });

  it("rejects invalid start vertices and tracks queue behavior", () => {
    const graph = createSampleGraph({ directed: false });
    const invalid = bfsTraversal(graph, "Z");
    expect(invalid[0].label).toContain("Invalid start vertex");

    const algorithm = new BFSAlgorithm(graph, "A");
    const steps = algorithm.run();
    const visitA = steps.find((step) => step.label === "Visit A");
    const queueB = steps.find((step) => step.label === "Queue B");
    const queueC = steps.find((step) => step.label === "Queue C");

    expect(visitA.queue).toEqual([]);
    expect(queueB.queue).toContain("B");
    expect(queueC.queue).toContain("C");
  });

  it("keeps BFS snapshots independent from one another", () => {
    const graph = createSampleGraph({ directed: false });
    const steps = bfsTraversal(graph, "A");
    const queueB = steps.find((step) => step.label === "Queue B");
    const snapshot = JSON.parse(JSON.stringify(queueB));

    snapshot.parents.B = "Z";
    snapshot.queue = ["X"];

    expect(steps.find((step) => step.label === "Queue B").parents.B).toBe("A");
    expect(steps.find((step) => step.label === "Queue B").queue).toContain("B");
  });

  it("works for multiple shortest paths and preserves parent records", () => {
    const graph = new Graph({ directed: false, weighted: false });
    ["A", "B", "C", "D"].forEach((vertex) => graph.addVertex(vertex));
    graph.addEdge("A", "B");
    graph.addEdge("A", "C");
    graph.addEdge("B", "D");
    graph.addEdge("C", "D");

    const algorithm = new BFSAlgorithm(graph, "A");
    const result = algorithm.run().at(-1).result;

    expect(result.distances).toEqual({ A: 0, B: 1, C: 1, D: 2 });
    expect(["B", "C"]).toContain(result.parents.D);
    expect(algorithm.shortestPath("D")).toEqual(["A", result.parents.D, "D"]);
  });
});
