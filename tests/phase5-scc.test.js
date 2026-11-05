import { describe, expect, it } from "vitest";

import { KosarajuAlgorithm, kosarajuSCC } from "../src/algorithms/graphs/kosaraju.js";
import { TarjanAlgorithm, tarjanSCC } from "../src/algorithms/graphs/tarjan.js";
import { Graph } from "../src/data-structures/graphs/graph.js";

function makeGraph(vertices = [], edges = [], directed = true) {
  const graph = new Graph({ directed, weighted: false });
  vertices.forEach((vertex) => graph.addVertex(vertex));
  edges.forEach(([from, to]) => graph.addEdge(from, to));
  return graph;
}

function canonicalPartition(components) {
  return components
    .map((component) => [...component].sort())
    .sort((left, right) => left.join("|").localeCompare(right.join("|")));
}

function expectAlgorithmsAgree(graph, expected) {
  const kosaraju = kosarajuSCC(graph);
  const tarjan = tarjanSCC(graph);
  expect(kosaraju.valid).toBe(true);
  expect(tarjan.valid).toBe(true);
  expect(canonicalPartition(kosaraju.components)).toEqual(canonicalPartition(expected));
  expect(canonicalPartition(tarjan.components)).toEqual(canonicalPartition(expected));
  expect(canonicalPartition(kosaraju.components)).toEqual(canonicalPartition(tarjan.components));
}

describe("Strongly connected components", () => {
  it("returns no components for an empty directed graph", () => {
    const graph = makeGraph();
    expect(kosarajuSCC(graph).components).toEqual([]);
    expect(tarjanSCC(graph).components).toEqual([]);
  });

  it("handles single vertices and isolated vertices", () => {
    const graph = makeGraph(["A", "B", "C"]);
    expectAlgorithmsAgree(graph, [["A"], ["B"], ["C"]]);
  });

  it("finds one large strongly connected component", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D"],
      [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["B", "D"]]
    );
    expectAlgorithmsAgree(graph, [["A", "B", "C", "D"]]);
  });

  it("separates components joined in one direction", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D", "E"],
      [["A", "B"], ["B", "C"], ["C", "A"], ["C", "D"], ["D", "E"], ["E", "D"]]
    );
    expectAlgorithmsAgree(graph, [["A", "B", "C"], ["D", "E"]]);
  });

  it("handles multiple disconnected directed components", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D", "E", "F"],
      [["A", "B"], ["B", "A"], ["C", "D"], ["D", "C"], ["E", "F"]]
    );
    expectAlgorithmsAgree(graph, [["A", "B"], ["C", "D"], ["E"], ["F"]]);
  });

  it("treats a self-loop as a singleton strongly connected component", () => {
    const graph = makeGraph(["A", "B"], [["A", "A"], ["A", "B"]]);
    expectAlgorithmsAgree(graph, [["A"], ["B"]]);
  });

  it("handles vertices with no outgoing edges", () => {
    const graph = makeGraph(["source", "sink"], [["source", "sink"]]);
    expectAlgorithmsAgree(graph, [["source"], ["sink"]]);
  });

  it("rejects undirected graphs with a clear result", () => {
    const graph = makeGraph(["A", "B"], [["A", "B"]], false);
    for (const result of [kosarajuSCC(graph), tarjanSCC(graph)]) {
      expect(result.valid).toBe(false);
      expect(result.components).toEqual([]);
      expect(result.reason).toMatch(/directed graph/);
    }
  });

  it("throws when the input is not a Graph", () => {
    expect(() => new KosarajuAlgorithm(null).run()).toThrowError(/Graph instance/);
    expect(() => new TarjanAlgorithm({ vertices: [] }).run()).toThrowError(/Graph instance/);
  });

  it("records finishing order and explicitly reverses edges in Kosaraju playback", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B"], ["B", "A"], ["B", "C"]]);
    const steps = new KosarajuAlgorithm(graph).run();
    const reverseStep = steps.find((step) => step.phase === "reversed");

    expect(steps.at(-1).finishingOrder).toHaveLength(3);
    expect(reverseStep.edgeList).toEqual([
      { from: "B", to: "A", weight: 1 },
      { from: "A", to: "B", weight: 1 },
      { from: "C", to: "B", weight: 1 },
    ]);
    expect(steps.some((step) => step.phase === "second-pass")).toBe(true);
  });

  it("records Tarjan discovery, low-link, and active-stack state", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B"], ["B", "C"], ["C", "A"]]);
    const steps = new TarjanAlgorithm(graph).run();
    const finalStep = steps.at(-1);

    expect(Object.keys(finalStep.discovery)).toEqual(["A", "B", "C"]);
    expect(finalStep.discovery).toEqual({ A: 0, B: 1, C: 2 });
    expect(finalStep.lowLink).toEqual({ A: 0, B: 0, C: 0 });
    expect(steps.some((step) => step.lowLinkUpdate !== null)).toBe(true);
    expect(steps.some((step) => step.activeStack.length === 3)).toBe(true);
  });

  it("keeps every playback snapshot deeply immutable and independent", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B"], ["B", "A"], ["B", "C"]]);
    for (const runner of [new KosarajuAlgorithm(graph), new TarjanAlgorithm(graph)]) {
      const steps = runner.run();
      const priorStep = steps.find((step) => step.components.length > 0) ?? steps.at(-1);
      const serialized = JSON.stringify(priorStep);
      expect(Object.isFrozen(priorStep)).toBe(true);
      expect(Object.isFrozen(priorStep.components)).toBe(true);
      expect(() => priorStep.components[0].push("mutated")).toThrow();
      runner.run();
      expect(JSON.stringify(priorStep)).toBe(serialized);
    }
  });

  it("does not mutate the source graph while traversing", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D"],
      [["A", "B"], ["B", "A"], ["B", "C"], ["C", "D"], ["D", "C"]]
    );
    const verticesBefore = [...graph.vertices];
    const edgeListBefore = graph.edgeList().map((edge) => ({ ...edge }));
    const adjacencyBefore = graph.vertices.map((vertex) => [vertex, graph.getNeighbors(vertex).map((item) => ({ ...item }))]);

    kosarajuSCC(graph);
    tarjanSCC(graph);

    expect(graph.vertices).toEqual(verticesBefore);
    expect(graph.edgeList()).toEqual(edgeListBefore);
    expect(graph.vertices.map((vertex) => [vertex, graph.getNeighbors(vertex)])).toEqual(adjacencyBefore);
  });

  it("returns equivalent partitions regardless of component ordering", () => {
    const graph = makeGraph(
      [1, 2, 3, 4, 5],
      [[1, 2], [2, 1], [2, 3], [3, 4], [4, 3], [5, 5]]
    );
    expectAlgorithmsAgree(graph, [["1", "2"], ["3", "4"], ["5"]]);
  });
});
