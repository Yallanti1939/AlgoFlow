function vertexKey(vertex) {
  return String(vertex);
}

function copyResult(result) {
  if (!result) {
    return null;
  }

  return {
    ...result,
    cycle: [...result.cycle],
    visited: [...result.visited],
  };
}

export class CycleDetectionAlgorithm {
  constructor(graph, mode = graph?.directed ? "directed" : "undirected") {
    this.graph = graph;
    this.mode = mode;
    this.steps = [];
  }

  _snapshot(label, explanation, state = {}) {
    const {
      currentVertex = null,
      activeVertices = [],
      activeEdges = [],
      visited = [],
      stack = [],
      queue = [],
      cycle = [],
      detectionStatus = "Searching",
      result = null,
    } = state;
    const graph = this.graph;
    const vertices = (graph?.vertices ?? []).map(vertexKey);
    const adjacencyList = graph?.adjacencyList() ?? {};

    return {
      label,
      explanation,
      mode: this.mode,
      directed: Boolean(graph?.directed),
      currentVertex: currentVertex === null ? null : vertexKey(currentVertex),
      activeVertices: [...new Set(activeVertices.map(vertexKey))],
      activeEdges: [...new Set(activeEdges)],
      visited: [...new Set(visited.map(vertexKey))],
      stack: [...stack.map(vertexKey)],
      queue: [...queue.map(vertexKey)],
      cycle: [...cycle.map(vertexKey)],
      detectionStatus,
      vertices,
      adjacencyList: Object.fromEntries(
        Object.entries(adjacencyList).map(([vertex, neighbors]) => [
          vertex,
          neighbors.map(({ vertex: neighbor, weight }) => ({ vertex: neighbor, weight })),
        ])
      ),
      adjacencyMatrix: {
        vertices: [...(graph?.adjacencyMatrix().vertices ?? [])],
        matrix: (graph?.adjacencyMatrix().matrix ?? []).map((row) => [...row]),
      },
      edgeList: (graph?.edgeList() ?? []).map((edge) => ({ ...edge })),
      result: copyResult(result),
    };
  }

  _edge(from, to) {
    const fromKey = vertexKey(from);
    const toKey = vertexKey(to);
    const edge = this.graph.edgeList().find((item) => {
      const edgeFrom = vertexKey(item.from);
      const edgeTo = vertexKey(item.to);
      return (edgeFrom === fromKey && edgeTo === toKey)
        || (!this.graph.directed && edgeFrom === toKey && edgeTo === fromKey);
    });

    return edge ? [`${vertexKey(edge.from)}->${vertexKey(edge.to)}`] : [];
  }

  _state(visited, stack, extra = {}) {
    return {
      visited: [...visited],
      stack: [...stack],
      ...extra,
    };
  }

  _reconstructUndirectedCycle(current, ancestor, parents) {
    const path = [vertexKey(current)];
    let node = current;

    while (vertexKey(node) !== vertexKey(ancestor)) {
      node = parents.get(vertexKey(node));
      if (node === undefined) {
        return [vertexKey(current), vertexKey(ancestor), vertexKey(current)];
      }
      path.push(vertexKey(node));
    }

    path.reverse();
    path.push(vertexKey(ancestor));
    return path;
  }

  _detectUndirected() {
    const visited = new Set();
    const parents = new Map();
    const activePath = [];
    let foundCycle = [];

    const visit = (vertex, parent) => {
      const key = vertexKey(vertex);
      visited.add(key);
      activePath.push(vertex);
      this.steps.push(this._snapshot(
        `Visit ${key}`,
        `Mark ${key} visited and inspect its neighbors, ignoring the edge back to its DFS parent.`,
        this._state(visited, activePath, {
          currentVertex: vertex,
          activeVertices: [vertex],
        })
      ));

      for (const { vertex: neighbor } of this.graph.getNeighbors(vertex)) {
        const neighborKey = vertexKey(neighbor);
        const edge = this._edge(vertex, neighbor);

        if (neighborKey === key) {
          foundCycle = [key, key];
          this.steps.push(this._snapshot(
            `Self-loop at ${key}`,
            `An undirected self-loop starts and ends at ${key}, so it is a cycle.`,
            this._state(visited, activePath, {
              currentVertex: vertex,
              activeVertices: [vertex],
              activeEdges: edge,
              cycle: foundCycle,
              detectionStatus: "Cycle detected",
            })
          ));
          return true;
        }

        if (parent !== null && neighborKey === vertexKey(parent)) {
          this.steps.push(this._snapshot(
            `Skip parent edge ${key} — ${neighborKey}`,
            `The edge to ${neighborKey} is the tree edge used to reach ${key}; it is not a cycle.`,
            this._state(visited, activePath, {
              currentVertex: vertex,
              activeVertices: [vertex, neighbor],
              activeEdges: edge,
            })
          ));
          continue;
        }

        if (visited.has(neighborKey)) {
          foundCycle = this._reconstructUndirectedCycle(vertex, neighbor, parents);
          this.steps.push(this._snapshot(
            `Cycle detected at ${key} — ${neighborKey}`,
            `The visited neighbor ${neighborKey} is not ${key}'s parent. The tree path plus this edge closes a cycle.`,
            this._state(visited, activePath, {
              currentVertex: vertex,
              activeVertices: [vertex, neighbor],
              activeEdges: edge,
              cycle: foundCycle,
              detectionStatus: "Cycle detected",
            })
          ));
          return true;
        }

        parents.set(neighborKey, vertex);
        this.steps.push(this._snapshot(
          `Explore ${key} — ${neighborKey}`,
          `${neighborKey} is unvisited. Record ${key} as its parent and continue DFS.`,
          this._state(visited, activePath, {
            currentVertex: vertex,
            activeVertices: [vertex, neighbor],
            activeEdges: edge,
          })
        ));

        if (visit(neighbor, vertex)) {
          return true;
        }
      }

      activePath.pop();
      this.steps.push(this._snapshot(
        `Backtrack from ${key}`,
        `All neighbors of ${key} were checked without finding another cycle; backtrack.`,
        this._state(visited, activePath, { currentVertex: vertex })
      ));
      return false;
    };

    for (const vertex of this.graph.vertices) {
      if (visited.has(vertexKey(vertex))) {
        continue;
      }
      parents.set(vertexKey(vertex), null);
      if (visit(vertex, null)) {
        break;
      }
    }

    return { cycle: foundCycle, visited: [...visited] };
  }

  _detectDirected() {
    const state = new Map();
    const activePath = [];
    const pathIndex = new Map();
    const visited = new Set();
    let foundCycle = [];

    const visit = (vertex) => {
      const key = vertexKey(vertex);
      state.set(key, 1);
      pathIndex.set(key, activePath.length);
      activePath.push(vertex);
      visited.add(key);
      this.steps.push(this._snapshot(
        `Enter ${key}`,
        `Color ${key} visiting (gray) and explore its outgoing edges.`,
        this._state(visited, activePath, {
          currentVertex: vertex,
          activeVertices: [vertex],
        })
      ));

      for (const { vertex: neighbor } of this.graph.getNeighbors(vertex)) {
        const neighborKey = vertexKey(neighbor);
        const edge = this._edge(vertex, neighbor);
        const neighborState = state.get(neighborKey) ?? 0;

        if (neighborState === 1) {
          foundCycle = [
            ...activePath.slice(pathIndex.get(neighborKey)).map(vertexKey),
            neighborKey,
          ];
          this.steps.push(this._snapshot(
            `Back edge ${key} → ${neighborKey}`,
            `${neighborKey} is still visiting (gray), so this back edge closes a directed cycle.`,
            this._state(visited, activePath, {
              currentVertex: vertex,
              activeVertices: [vertex, neighbor],
              activeEdges: edge,
              cycle: foundCycle,
              detectionStatus: "Cycle detected",
            })
          ));
          return true;
        }

        if (neighborState === 2) {
          this.steps.push(this._snapshot(
            `Skip finished ${neighborKey}`,
            `${neighborKey} is already fully explored (black); this edge does not form a back edge.`,
            this._state(visited, activePath, {
              currentVertex: vertex,
              activeVertices: [vertex, neighbor],
              activeEdges: edge,
            })
          ));
          continue;
        }

        this.steps.push(this._snapshot(
          `Explore ${key} → ${neighborKey}`,
          `${neighborKey} is unvisited (white); recursively explore it.`,
          this._state(visited, activePath, {
            currentVertex: vertex,
            activeVertices: [vertex, neighbor],
            activeEdges: edge,
          })
        ));
        if (visit(neighbor)) {
          return true;
        }
      }

      activePath.pop();
      pathIndex.delete(key);
      state.set(key, 2);
      this.steps.push(this._snapshot(
        `Finish ${key}`,
        `All outgoing edges from ${key} are processed; color it visited (black).`,
        this._state(visited, activePath, {
          currentVertex: vertex,
          activeVertices: [vertex],
        })
      ));
      return false;
    };

    for (const vertex of this.graph.vertices) {
      if ((state.get(vertexKey(vertex)) ?? 0) === 0 && visit(vertex)) {
        break;
      }
    }

    return { cycle: foundCycle, visited: [...visited] };
  }

  run(mode = this.mode) {
    if (!["directed", "undirected"].includes(mode)) {
      throw new TypeError('Cycle detection mode must be "directed" or "undirected".');
    }
    if (!this.graph || !Array.isArray(this.graph.vertices)) {
      throw new TypeError("Cycle detection requires a Graph instance.");
    }
    if (Boolean(this.graph.directed) !== (mode === "directed")) {
      throw new TypeError(`The selected ${mode} cycle detection requires a ${mode} graph.`);
    }

    this.mode = mode;
    this.steps = [];
    if (this.graph.vertices.length === 0) {
      const result = { hasCycle: false, cycle: [], visited: [], mode };
      this.steps.push(this._snapshot("Empty graph", "An empty graph contains no cycle.", {
        detectionStatus: "No cycle",
        result,
      }));
      return this.steps;
    }

    this.steps.push(this._snapshot(
      `Start ${mode} cycle detection`,
      mode === "directed"
        ? "Run three-color DFS over every component; an edge to a visiting vertex indicates a cycle."
        : "Run DFS over every component; a visited neighbor other than the parent indicates a cycle."
    ));

    const detection = mode === "directed"
      ? this._detectDirected()
      : this._detectUndirected();
    const result = {
      hasCycle: detection.cycle.length > 0,
      cycle: [...detection.cycle],
      visited: [...detection.visited],
      mode,
    };
    this.steps.push(this._snapshot(
      result.hasCycle ? "Cycle detection complete: cycle found" : "Cycle detection complete: no cycle",
      result.hasCycle
        ? `A cycle was found: ${result.cycle.join(" → ")}.`
        : "Every component was explored and no cycle was found.",
      {
        activeVertices: result.cycle,
        activeEdges: result.cycle.slice(0, -1).flatMap((from, index) => {
          const to = result.cycle[index + 1];
          return this._edge(from, to);
        }),
        visited: detection.visited,
        cycle: result.cycle,
        detectionStatus: result.hasCycle ? "Cycle detected" : "No cycle",
        result,
      }
    ));
    return this.steps;
  }
}

export function detectUndirectedCycle(graph) {
  return new CycleDetectionAlgorithm(graph, "undirected").run();
}

export function detectDirectedCycle(graph) {
  return new CycleDetectionAlgorithm(graph, "directed").run();
}

export function detectCycle(graph, mode = graph?.directed ? "directed" : "undirected") {
  return new CycleDetectionAlgorithm(graph, mode).run();
}

export default CycleDetectionAlgorithm;
