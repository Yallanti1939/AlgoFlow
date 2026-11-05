import { describe, expect, it } from "vitest";

import { Graph } from "../src/data-structures/graphs/graph.js";

describe("Graph Fundamentals", () => {
  it("starts empty and supports a single-vertex graph", () => {
    const empty = new Graph();
    expect(empty.vertices).toEqual([]);
    expect(empty.adjacencyList()).toEqual({});

    const single = new Graph();
    const added = single.addVertex("A");

    expect(added.label).toContain("Add vertex A");
    expect(single.vertices).toEqual(["A"]);
    expect(single.getNeighbors("A")).toEqual([]);
    expect(single.getDegree("A")).toBe(0);
    expect(single.getInDegree("A")).toBe(0);
    expect(single.getOutDegree("A")).toBe(0);
  });

  it("adds, removes, and detects duplicate vertices and edges", () => {
    const graph = new Graph({ directed: true, weighted: true });
    graph.addVertex("A");
    graph.addVertex("B");
    graph.addVertex("C");

    const duplicateVertex = graph.addVertex("A");
    expect(duplicateVertex.label).toContain("Duplicate vertex");

    const addEdge = graph.addEdge("A", "B", 3);
    expect(addEdge.result).toEqual({ from: "A", to: "B", weight: 3 });

    const duplicateEdge = graph.addEdge("A", "B", 5);
    expect(duplicateEdge.label).toContain("Duplicate edge");

    const removeEdge = graph.removeEdge("A", "B");
    expect(removeEdge.result).toEqual({ from: "A", to: "B", removed: true });
    expect(graph.hasEdge("A", "B")).toBe(false);

    const removeVertex = graph.removeVertex("C");
    expect(removeVertex.label).toContain("Remove vertex C");
    expect(graph.vertices).toEqual(["A", "B"]);
  });

  it("supports directed and undirected behavior with edge weights", () => {
    const directed = new Graph({ directed: true, weighted: true });
    ["A", "B", "C"].forEach((vertex) => directed.addVertex(vertex));
    directed.addEdge("A", "B", 4);
    directed.addEdge("A", "C", 2);

    expect(directed.getNeighbors("A")).toEqual([
      { vertex: "B", weight: 4 },
      { vertex: "C", weight: 2 },
    ]);
    expect(directed.getOutDegree("A")).toBe(2);
    expect(directed.getInDegree("B")).toBe(1);
    expect(directed.getDegree("A")).toBe(2);
    expect(directed.getWeight("A", "B")).toBe(4);

    const undirected = new Graph({ directed: false, weighted: true });
    ["X", "Y", "Z"].forEach((vertex) => undirected.addVertex(vertex));
    undirected.addEdge("X", "Y", 5);
    expect(undirected.hasEdge("X", "Y")).toBe(true);
    expect(undirected.hasEdge("Y", "X")).toBe(true);
    expect(undirected.getDegree("X")).toBe(1);
    expect(undirected.edgeList()).toEqual([
      { from: "X", to: "Y", weight: 5 },
    ]);
  });

  it("calculates degree, adjacency lists, and adjacency matrices correctly", () => {
    const graph = new Graph({ directed: false, weighted: true });
    ["A", "B", "C", "D"].forEach((vertex) => graph.addVertex(vertex));
    graph.addEdge("A", "B", 2);
    graph.addEdge("A", "C", 3);
    graph.addEdge("B", "C", 5);
    graph.addEdge("C", "D", 1);

    expect(graph.adjacencyList()).toEqual({
      A: [{ vertex: "B", weight: 2 }, { vertex: "C", weight: 3 }],
      B: [{ vertex: "A", weight: 2 }, { vertex: "C", weight: 5 }],
      C: [{ vertex: "A", weight: 3 }, { vertex: "B", weight: 5 }, { vertex: "D", weight: 1 }],
      D: [{ vertex: "C", weight: 1 }],
    });

    expect(graph.adjacencyMatrix()).toEqual({
      vertices: ["A", "B", "C", "D"],
      matrix: [
        [0, 2, 3, 0],
        [2, 0, 5, 0],
        [3, 5, 0, 1],
        [0, 0, 1, 0],
      ],
    });

    expect(graph.getDegree("C")).toBe(3);
    expect(graph.getDegree("D")).toBe(1);
  });

  it("handles disconnected graphs, self-loops, and invalid operations", () => {
    const graph = new Graph({ directed: true, weighted: false });
    ["A", "B", "C", "D"].forEach((vertex) => graph.addVertex(vertex));
    graph.addEdge("A", "B");
    graph.addEdge("C", "D");
    graph.addEdge("D", "D");

    expect(graph.getNeighbors("D")).toEqual([{ vertex: "D", weight: 1 }]);
    expect(graph.getInDegree("D")).toBe(2);
    expect(graph.getOutDegree("D")).toBe(1);
    expect(graph.getDegree("D")).toBe(3);

    expect(graph.removeEdge("A", "Z").label).toContain("Invalid edge");
    expect(graph.removeEdge("Z", "A").label).toContain("Invalid edge");
    expect(graph.addEdge("Z", "A").label).toContain("Invalid edge");
    expect(graph.removeVertex("Z").label).toContain("Invalid vertex");
  });
});
