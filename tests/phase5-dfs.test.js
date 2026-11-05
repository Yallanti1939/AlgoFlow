import { describe, expect, it } from "vitest";

import {
  DFSAlgorithm,
  dfsTraversal,
  iterativeDFSTraversal,
  recursiveDFSTraversal,
} from "../src/algorithms/graphs/dfs.js";
import { Graph } from "../src/data-structures/graphs/graph.js";

function makeGraph({ directed = false, vertices = ["A", "B", "C", "D", "E"] } = {}) {
  const graph = new Graph({ directed });
  vertices.forEach((vertex) => graph.addVertex(vertex));
  return graph;
}

function finalResult(steps) {
  return steps.at(-1).result;
}

describe("Depth-First Search", () => {
  it("handles empty and single-vertex graphs", () => {
    expect(dfsTraversal(new Graph(), "A")[0].label).toBe("Empty graph");

    const graph = makeGraph({ vertices: ["A"] });
    const result = finalResult(recursiveDFSTraversal(graph, "A"));
    expect(result.order).toEqual(["A"]);
    expect(result.parents).toEqual({ A: null });
  });

  it("traverses a linear graph recursively with parent tracking", () => {
    const graph = makeGraph({ vertices: ["A", "B", "C", "D"] });
    [["A", "B"], ["B", "C"], ["C", "D"]].forEach(([from, to]) => graph.addEdge(from, to));

    const result = finalResult(recursiveDFSTraversal(graph, "A"));
    expect(result.order).toEqual(["A", "B", "C", "D"]);
    expect(result.parents).toEqual({ A: null, B: "A", C: "B", D: "C" });
  });

  it("handles cycles in recursive and iterative traversals", () => {
    const graph = makeGraph();
    [["A", "B"], ["B", "C"], ["C", "A"], ["C", "D"]]
      .forEach(([from, to]) => graph.addEdge(from, to));

    const recursive = finalResult(recursiveDFSTraversal(graph, "A"));
    const iterative = finalResult(iterativeDFSTraversal(graph, "A"));
    expect(recursive.order).toEqual(["A", "B", "C", "D"]);
    expect(iterative.order).toEqual(recursive.order);
    expect(new Set(iterative.order).size).toBe(iterative.order.length);
  });

  it("only visits vertices reachable from the chosen start", () => {
    const graph = makeGraph();
    graph.addEdge("A", "B");
    graph.addEdge("C", "D");

    const result = finalResult(dfsTraversal(graph, "A"));
    expect(result.order).toEqual(["A", "B"]);
    expect(result.unreachable).toEqual(["C", "D", "E"]);
  });

  it("follows outgoing edges only in directed graphs", () => {
    const graph = makeGraph({ directed: true, vertices: ["A", "B", "C"] });
    graph.addEdge("A", "B");
    graph.addEdge("C", "B");

    expect(finalResult(recursiveDFSTraversal(graph, "B")).order).toEqual(["B"]);
    expect(finalResult(iterativeDFSTraversal(graph, "A")).order).toEqual(["A", "B"]);
  });

  it("preserves neighbor order in recursive and iterative DFS", () => {
    const graph = makeGraph({ vertices: ["A", "B", "C", "D", "E"] });
    [["A", "B"], ["A", "C"], ["B", "D"], ["C", "E"]]
      .forEach(([from, to]) => graph.addEdge(from, to));

    expect(finalResult(recursiveDFSTraversal(graph, "A")).order).toEqual(["A", "B", "D", "C", "E"]);
    expect(finalResult(iterativeDFSTraversal(graph, "A")).order).toEqual(["A", "B", "D", "C", "E"]);
  });

  it("records the active explicit stack and recursive depth in snapshots", () => {
    const graph = makeGraph({ vertices: ["A", "B", "C"] });
    graph.addEdge("A", "B");
    graph.addEdge("B", "C");

    const recursiveSteps = recursiveDFSTraversal(graph, "A");
    const iterativeSteps = iterativeDFSTraversal(graph, "A");
    expect(recursiveSteps.find((step) => step.label === "Visit C").recursionDepth).toBe(2);
    expect(iterativeSteps.find((step) => step.label === "Push C").stack).toEqual(["A", "B", "C"]);
  });

  it("returns an explicit invalid-start step", () => {
    const graph = makeGraph();
    const steps = dfsTraversal(graph, "missing");
    expect(steps).toHaveLength(1);
    expect(steps[0].label).toBe("Invalid start vertex");
    expect(steps[0].result).toBeNull();
  });

  it("keeps snapshots independent when one snapshot is modified", () => {
    const graph = makeGraph();
    graph.addEdge("A", "B");
    graph.addEdge("A", "C");
    const steps = recursiveDFSTraversal(graph, "A");
    const firstVisit = steps.find((step) => step.label === "Visit A");
    const laterVisit = steps.find((step) => step.label === "Visit B");

    firstVisit.parents.B = "corrupted";
    firstVisit.stack.push("corrupted");
    firstVisit.adjacencyList.A.length = 0;

    expect(laterVisit.parents.B).toBe("A");
    expect(laterVisit.stack).toEqual(["A", "B"]);
    expect(laterVisit.adjacencyList.A).toHaveLength(2);
  });

  it("does not mutate the source graph", () => {
    const graph = makeGraph();
    [["A", "B"], ["B", "C"], ["C", "A"]].forEach(([from, to]) => graph.addEdge(from, to));
    const before = {
      vertices: [...graph.vertices],
      adjacency: graph.adjacencyList(),
      edges: graph.edgeList(),
      matrix: graph.adjacencyMatrix(),
    };

    new DFSAlgorithm(graph, "A", "iterative").run();

    expect(graph.vertices).toEqual(before.vertices);
    expect(graph.adjacencyList()).toEqual(before.adjacency);
    expect(graph.edgeList()).toEqual(before.edges);
    expect(graph.adjacencyMatrix()).toEqual(before.matrix);
  });

  it("supports rerunning an algorithm with a selected approach", () => {
    const graph = makeGraph({ vertices: ["A", "B"] });
    graph.addEdge("A", "B");
    const algorithm = new DFSAlgorithm(graph, "A");

    expect(finalResult(algorithm.run("iterative")).mode).toBe("iterative");
    expect(finalResult(algorithm.run("recursive")).mode).toBe("recursive");
    expect(() => algorithm.run("unknown")).toThrow(TypeError);
  });
});
