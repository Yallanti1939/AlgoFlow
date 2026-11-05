function key(vertex) {
  return String(vertex);
}

function copyResult(result) {
  if (!result) {
    return null;
  }

  return {
    ...result,
    order: [...result.order],
    partialOrder: [...result.partialOrder],
    cycle: [...result.cycle],
    processed: [...result.processed],
    inDegrees: { ...result.inDegrees },
  };
}

export class TopologicalSortAlgorithm {
  constructor(graph, mode = "kahn") {
    this.graph = graph;
    this.mode = mode;
    this.steps = [];
  }

  _snapshot(label, explanation, state = {}) {
    const {
      currentVertex = null,
      activeVertices = [],
      activeEdges = [],
      queue = [],
      stack = [],
      processed = [],
      order = [],
      inDegrees = {},
      cycle = [],
      detectionStatus = "Searching",
      result = null,
    } = state;
    const graph = this.graph;
    const matrix = graph?.adjacencyMatrix() ?? { vertices: [], matrix: [] };
    const adjacencyList = graph?.adjacencyList() ?? {};

    return {
      label,
      explanation,
      mode: this.mode,
      currentVertex: currentVertex === null ? null : key(currentVertex),
      activeVertices: [...new Set(activeVertices.map(key))],
      activeEdges: [...new Set(activeEdges)],
      queue: [...queue.map(key)],
      stack: [...stack.map(key)],
      processed: [...processed.map(key)],
      order: [...order.map(key)],
      inDegrees: { ...inDegrees },
      cycle: [...cycle.map(key)],
      detectionStatus,
      directed: Boolean(graph?.directed),
      vertices: (graph?.vertices ?? []).map(key),
      adjacencyList: Object.fromEntries(
        Object.entries(adjacencyList).map(([vertex, neighbors]) => [
          vertex,
          neighbors.map(({ vertex: neighbor, weight }) => ({ vertex: key(neighbor), weight })),
        ])
      ),
      adjacencyMatrix: {
        vertices: matrix.vertices.map(key),
        matrix: matrix.matrix.map((row) => [...row]),
      },
      edgeList: (graph?.edgeList() ?? []).map((edge) => ({
        ...edge,
        from: key(edge.from),
        to: key(edge.to),
      })),
      result: copyResult(result),
    };
  }

  _activeEdge(from, to) {
    const fromKey = key(from);
    const toKey = key(to);
    const edge = this.graph.edgeList().find((item) => key(item.from) === fromKey && key(item.to) === toKey);
    return edge ? [`${fromKey}->${toKey}`] : [];
  }

  _inDegreeMap() {
    const inDegrees = Object.fromEntries(this.graph.vertices.map((vertex) => [key(vertex), 0]));
    for (const vertex of this.graph.vertices) {
      for (const { vertex: neighbor } of this.graph.getNeighbors(vertex)) {
        inDegrees[key(neighbor)] += 1;
      }
    }
    return inDegrees;
  }

  _baseResult({ order = [], partialOrder = [], cycle = [], processed = [], inDegrees = {}, valid = true, reason = null } = {}) {
    return {
      valid,
      order: valid ? [...order] : [],
      partialOrder: [...partialOrder],
      cycle: [...cycle],
      processed: [...processed],
      inDegrees: { ...inDegrees },
      mode: this.mode,
      reason,
    };
  }

  _runKahn() {
    const inDegrees = this._inDegreeMap();
    const queue = this.graph.vertices.filter((vertex) => inDegrees[key(vertex)] === 0);
    const processed = [];
    const order = [];

    this.steps.push(this._snapshot(
      "Calculate in-degrees",
      "Count incoming edges for every vertex, then enqueue all vertices with in-degree zero.",
      { queue, inDegrees, order, processed }
    ));

    while (queue.length > 0) {
      const current = queue.shift();
      const currentKey = key(current);
      order.push(current);
      processed.push(current);
      this.steps.push(this._snapshot(
        `Process ${currentKey}`,
        `${currentKey} has no remaining prerequisites, so append it to the topological order.`,
        { currentVertex: current, activeVertices: [current], queue, inDegrees, order, processed }
      ));

      for (const { vertex: neighbor } of this.graph.getNeighbors(current)) {
        const neighborKey = key(neighbor);
        inDegrees[neighborKey] -= 1;
        const becameReady = inDegrees[neighborKey] === 0;
        if (becameReady) {
          queue.push(neighbor);
        }
        this.steps.push(this._snapshot(
          `Remove ${currentKey} → ${neighborKey}`,
          becameReady
            ? `Removing this prerequisite reduces ${neighborKey}'s in-degree to zero; enqueue it.`
            : `Removing this prerequisite reduces ${neighborKey}'s in-degree to ${inDegrees[neighborKey]}.`,
          {
            currentVertex: current,
            activeVertices: [current, neighbor],
            activeEdges: this._activeEdge(current, neighbor),
            queue,
            inDegrees,
            order,
            processed,
          }
        ));
      }
    }

    const valid = processed.length === this.graph.vertices.length;
    const result = this._baseResult({
      valid,
      order,
      partialOrder: order,
      processed,
      inDegrees,
      reason: valid ? null : "A directed cycle prevents processing every vertex.",
    });

    this.steps.push(this._snapshot(
      valid ? "Topological sort complete" : "Cycle detected — no topological ordering",
      valid
        ? "Every vertex was processed. The resulting order satisfies every directed edge."
        : "Some vertices remain with positive in-degree. The partial sequence is not presented as a valid topological order.",
      {
        activeVertices: valid ? order : [],
        queue,
        inDegrees,
        order: result.order,
        processed,
        detectionStatus: valid ? "Acyclic" : "Cycle detected",
        result,
      }
    ));
  }

  _runDfs() {
    const states = new Map();
    const activePath = [];
    const pathIndices = new Map();
    const finishOrder = [];
    const processed = [];
    let cycle = [];

    const visit = (vertex) => {
      const vertexKey = key(vertex);
      states.set(vertexKey, 1);
      pathIndices.set(vertexKey, activePath.length);
      activePath.push(vertex);
      this.steps.push(this._snapshot(
        `Visit ${vertexKey}`,
        `${vertexKey} is now visiting (gray); recursively examine its outgoing edges.`,
        {
          currentVertex: vertex,
          activeVertices: [vertex],
          stack: activePath,
          processed,
          order: finishOrder,
        }
      ));

      for (const { vertex: neighbor } of this.graph.getNeighbors(vertex)) {
        const neighborKey = key(neighbor);
        const state = states.get(neighborKey) ?? 0;
        const activeEdges = this._activeEdge(vertex, neighbor);

        if (state === 1) {
          cycle = [...activePath.slice(pathIndices.get(neighborKey)).map(key), neighborKey];
          this.steps.push(this._snapshot(
            `Back edge ${vertexKey} → ${neighborKey}`,
            `${neighborKey} is still on the recursion stack, so this back edge forms a directed cycle.`,
            {
              currentVertex: vertex,
              activeVertices: [vertex, neighbor],
              activeEdges,
              stack: activePath,
              processed,
              order: finishOrder,
              cycle,
              detectionStatus: "Cycle detected",
            }
          ));
          return false;
        }

        if (state === 2) {
          this.steps.push(this._snapshot(
            `Skip finished ${neighborKey}`,
            `${neighborKey} is already fully processed; continue to the next outgoing edge.`,
            {
              currentVertex: vertex,
              activeVertices: [vertex, neighbor],
              activeEdges,
              stack: activePath,
              processed,
              order: finishOrder,
            }
          ));
          continue;
        }

        this.steps.push(this._snapshot(
          `Explore ${vertexKey} → ${neighborKey}`,
          `${neighborKey} is unvisited; recurse before finishing ${vertexKey}.`,
          {
            currentVertex: vertex,
            activeVertices: [vertex, neighbor],
            activeEdges,
            stack: activePath,
            processed,
            order: finishOrder,
          }
        ));
        if (!visit(neighbor)) {
          return false;
        }
      }

      activePath.pop();
      pathIndices.delete(vertexKey);
      states.set(vertexKey, 2);
      finishOrder.push(vertex);
      processed.push(vertex);
      this.steps.push(this._snapshot(
        `Finish ${vertexKey}`,
        `All outgoing neighbors of ${vertexKey} are complete; place it on the finish-order list.`,
        {
          currentVertex: vertex,
          activeVertices: [vertex],
          stack: activePath,
          processed,
          order: finishOrder,
        }
      ));
      return true;
    };

    for (const vertex of this.graph.vertices) {
      if ((states.get(key(vertex)) ?? 0) === 0 && !visit(vertex)) {
        break;
      }
    }

    const valid = cycle.length === 0;
    const order = valid ? [...finishOrder].reverse() : [];
    const inDegrees = this._inDegreeMap();
    const result = this._baseResult({
      valid,
      order,
      partialOrder: finishOrder,
      cycle,
      processed,
      inDegrees,
      reason: valid ? null : "A directed cycle prevents a topological ordering.",
    });

    this.steps.push(this._snapshot(
      valid ? "Topological sort complete" : "Cycle detected — no topological ordering",
      valid
        ? "Reverse DFS finishing order to obtain a topological ordering."
        : "The back edge closes a directed cycle; no partial sequence is presented as a valid topological order.",
      {
        activeVertices: valid ? order : cycle,
        activeEdges: cycle.slice(0, -1).flatMap((from, index) => this._activeEdge(from, cycle[index + 1])),
        stack: [],
        processed,
        order: result.order,
        inDegrees,
        cycle,
        detectionStatus: valid ? "Acyclic" : "Cycle detected",
        result,
      }
    ));
  }

  run(mode = this.mode) {
    if (!["kahn", "dfs"].includes(mode)) {
      throw new TypeError('Topological sort mode must be "kahn" or "dfs".');
    }
    if (!this.graph || !Array.isArray(this.graph.vertices)) {
      throw new TypeError("Topological sorting requires a Graph instance.");
    }

    this.mode = mode;
    this.steps = [];

    if (!this.graph.directed) {
      const result = this._baseResult({
        valid: false,
        reason: "Topological sorting requires a directed graph; this graph is undirected.",
      });
      this.steps.push(this._snapshot(
        "Invalid graph — directed graph required",
        result.reason,
        { detectionStatus: "Invalid graph", result }
      ));
      return this.steps;
    }

    if (this.graph.vertices.length === 0) {
      const result = this._baseResult();
      this.steps.push(this._snapshot(
        "Empty graph",
        "An empty directed graph is a DAG; its valid topological ordering is empty.",
        { detectionStatus: "Acyclic", result }
      ));
      return this.steps;
    }

    this.steps.push(this._snapshot(
      mode === "kahn" ? "Start Kahn's algorithm" : "Start DFS topological sort",
      mode === "kahn"
        ? "Start with the directed graph and compute an in-degree count for each vertex."
        : "Run three-color DFS over every component and place vertices after all outgoing neighbors finish."
    ));
    if (mode === "kahn") {
      this._runKahn();
    } else {
      this._runDfs();
    }
    return this.steps;
  }
}

export function kahnTopologicalSort(graph) {
  return new TopologicalSortAlgorithm(graph, "kahn").run();
}

export function dfsTopologicalSort(graph) {
  return new TopologicalSortAlgorithm(graph, "dfs").run();
}

export function topologicalSort(graph, mode = "kahn") {
  return new TopologicalSortAlgorithm(graph, mode).run();
}

export default TopologicalSortAlgorithm;
