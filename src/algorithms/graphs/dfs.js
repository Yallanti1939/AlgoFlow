function normalizeVertex(vertex) {
  return String(vertex);
}

function cloneResult(result) {
  if (!result) {
    return null;
  }

  return {
    ...result,
    order: [...result.order],
    visited: [...result.visited],
    parents: { ...result.parents },
    unreachable: [...result.unreachable],
  };
}

export class DFSAlgorithm {
  constructor(graph, startVertex, mode = "recursive") {
    this.graph = graph;
    this.startVertex = startVertex;
    this.mode = mode;
    this.steps = [];
    this.order = [];
    this.parents = {};
    this.visited = new Set();
  }

  static dfsTraversal(graph, startVertex, mode = "recursive") {
    return new DFSAlgorithm(graph, startVertex, mode).run();
  }

  _snapshot(label, explanation, state = {}) {
    const {
      currentVertex = null,
      activeVertices = [],
      activeEdges = [],
      stack = [],
      recursionDepth = null,
      visited = [],
      order = [],
      parents = {},
      result = null,
    } = state;
    const vertices = (this.graph?.vertices ?? []).map(normalizeVertex);

    return {
      label,
      explanation,
      mode: this.mode,
      currentVertex,
      activeVertices: [...new Set(activeVertices.map(normalizeVertex))],
      activeEdges: [...new Set(activeEdges)],
      stack: [...stack.map(normalizeVertex)],
      recursionDepth,
      visited: [...new Set(visited.map(normalizeVertex))],
      order: [...order.map(normalizeVertex)],
      parents: Object.fromEntries(
        Object.entries(parents).map(([vertex, parent]) => [
          vertex,
          parent === null ? null : normalizeVertex(parent),
        ])
      ),
      result: cloneResult(result),
      vertices,
      adjacencyList: this.graph?.adjacencyList() ?? {},
      adjacencyMatrix: this.graph?.adjacencyMatrix() ?? { vertices: [], matrix: [] },
      edgeList: this.graph?.edgeList() ?? [],
      directed: Boolean(this.graph?.directed),
    };
  }

  _activeEdge(from, to) {
    const fromKey = normalizeVertex(from);
    const toKey = normalizeVertex(to);
    const edge = this.graph.edgeList().find(({ from: edgeFrom, to: edgeTo }) => (
      (normalizeVertex(edgeFrom) === fromKey && normalizeVertex(edgeTo) === toKey)
      || (!this.graph.directed
        && normalizeVertex(edgeFrom) === toKey
        && normalizeVertex(edgeTo) === fromKey)
    ));

    if (!edge) {
      return [];
    }

    return [`${normalizeVertex(edge.from)}->${normalizeVertex(edge.to)}`];
  }

  _baseState() {
    return {
      visited: [...this.visited],
      order: [...this.order],
      parents: { ...this.parents },
    };
  }

  _visit(vertex, stack, depth = null) {
    const key = normalizeVertex(vertex);
    this.visited.add(key);
    this.order.push(key);

    this.steps.push(this._snapshot(
      `Visit ${key}`,
      this.mode === "recursive"
        ? `Enter ${key} recursively at depth ${depth}.`
        : `Pop ${key} from the explicit stack and mark it visited.`,
      {
        ...this._baseState(),
        currentVertex: key,
        activeVertices: [key],
        stack,
        recursionDepth: depth,
      }
    ));
  }

  _complete(startKey) {
    const vertices = (this.graph?.vertices ?? []).map(normalizeVertex);
    const result = {
      start: startKey,
      mode: this.mode,
      order: [...this.order],
      visited: [...this.visited],
      parents: { ...this.parents },
      unreachable: vertices.filter((vertex) => !this.visited.has(vertex)),
    };

    this.steps.push(this._snapshot(
      "DFS complete",
      result.unreachable.length
        ? `Traversal from ${startKey} is complete. ${result.unreachable.join(", ")} are not reachable from the selected start.`
        : `Traversal from ${startKey} visited every vertex.`,
      {
        ...this._baseState(),
        activeVertices: [...this.visited],
        result,
      }
    ));
  }

  _runRecursive(startVertex) {
    const visit = (vertex, path) => {
      const key = normalizeVertex(vertex);
      path.push(key);
      this._visit(key, path, path.length - 1);

      for (const neighbor of this.graph.getNeighbors(vertex)) {
        const neighborKey = normalizeVertex(neighbor.vertex);
        const edge = this._activeEdge(vertex, neighbor.vertex);

        if (this.visited.has(neighborKey)) {
          this.steps.push(this._snapshot(
            `Skip visited ${neighborKey}`,
            `${neighborKey} was already visited, so DFS does not recurse into it again.`,
            {
              ...this._baseState(),
              currentVertex: key,
              activeVertices: [key, neighborKey],
              activeEdges: edge,
              stack: path,
              recursionDepth: path.length - 1,
            }
          ));
          continue;
        }

        this.parents[neighborKey] = key;
        this.steps.push(this._snapshot(
          `Explore ${key} → ${neighborKey}`,
          `${neighborKey} is unvisited. Record ${key} as its parent and recursively explore it.`,
          {
            ...this._baseState(),
            currentVertex: key,
            activeVertices: [key, neighborKey],
            activeEdges: edge,
            stack: path,
            recursionDepth: path.length - 1,
          }
        ));
        visit(neighbor.vertex, path);
      }

      path.pop();
      this.steps.push(this._snapshot(
        `Backtrack from ${key}`,
        `All outgoing neighbors of ${key} have been explored; return to its caller.`,
        {
          ...this._baseState(),
          currentVertex: key,
          activeVertices: [key],
          stack: path,
          recursionDepth: path.length - 1,
        }
      ));
    };

    visit(startVertex, []);
  }

  _runIterative(startVertex) {
    const startKey = normalizeVertex(startVertex);
    const frames = [{ vertex: startVertex, neighbors: this.graph.getNeighbors(startVertex), index: 0 }];
    this.parents[startKey] = null;
    this._visit(startVertex, [startKey]);

    while (frames.length > 0) {
      const frame = frames[frames.length - 1];
      const currentKey = normalizeVertex(frame.vertex);

      if (frame.index >= frame.neighbors.length) {
        frames.pop();
        this.steps.push(this._snapshot(
          `Pop ${currentKey}`,
          `Every neighbor of ${currentKey} has been checked; remove its frame from the DFS stack.`,
          {
            ...this._baseState(),
            currentVertex: currentKey,
            activeVertices: [currentKey],
            stack: frames.map(({ vertex }) => vertex),
          }
        ));
        continue;
      }

      const neighbor = frame.neighbors[frame.index];
      frame.index += 1;
      const neighborKey = normalizeVertex(neighbor.vertex);
      const edge = this._activeEdge(frame.vertex, neighbor.vertex);

      if (this.visited.has(neighborKey)) {
        this.steps.push(this._snapshot(
          `Skip visited ${neighborKey}`,
          `${neighborKey} is already visited; leave it off the explicit stack.`,
          {
            ...this._baseState(),
            currentVertex: currentKey,
            activeVertices: [currentKey, neighborKey],
            activeEdges: edge,
            stack: frames.map(({ vertex }) => vertex),
          }
        ));
        continue;
      }

      this.parents[neighborKey] = currentKey;
      frames.push({
        vertex: neighbor.vertex,
        neighbors: this.graph.getNeighbors(neighbor.vertex),
        index: 0,
      });
      this.steps.push(this._snapshot(
        `Push ${neighborKey}`,
        `Discover ${neighborKey} from ${currentKey}, record its parent, and push it onto the DFS stack.`,
        {
          ...this._baseState(),
          currentVertex: currentKey,
          activeVertices: [currentKey, neighborKey],
          activeEdges: edge,
          stack: frames.map(({ vertex }) => vertex),
        }
      ));
      this._visit(neighbor.vertex, frames.map(({ vertex }) => vertex));
    }
  }

  run(mode = this.mode) {
    if (!["recursive", "iterative"].includes(mode)) {
      throw new TypeError('DFS mode must be "recursive" or "iterative".');
    }

    this.mode = mode;
    this.steps = [];
    this.order = [];
    this.parents = {};
    this.visited = new Set();

    if (!this.graph || !Array.isArray(this.graph.vertices) || this.graph.vertices.length === 0) {
      this.steps = [this._snapshot(
        "Empty graph",
        "The graph has no vertices, so depth-first search cannot start.",
        { result: { start: null, mode, order: [], visited: [], parents: {}, unreachable: [] } }
      )];
      return this.steps;
    }

    const startKey = normalizeVertex(this.startVertex);
    const startVertex = this.graph.vertices.find((vertex) => normalizeVertex(vertex) === startKey);

    if (startVertex === undefined) {
      this.steps = [this._snapshot(
        "Invalid start vertex",
        `Vertex ${startKey} is not present in the graph, so DFS cannot start.`,
        { currentVertex: startKey, activeVertices: [startKey] }
      )];
      return this.steps;
    }

    this.parents[startKey] = null;
    this.steps.push(this._snapshot(
      `Start DFS at ${startKey}`,
      mode === "recursive"
        ? `Begin the recursive call at ${startKey}.`
        : `Push ${startKey} onto the explicit DFS stack.`,
      {
        ...this._baseState(),
        currentVertex: startKey,
        activeVertices: [startKey],
        stack: mode === "iterative" ? [startKey] : [],
        recursionDepth: mode === "recursive" ? 0 : null,
      }
    ));

    if (mode === "recursive") {
      this.parents = { [startKey]: null };
      this._runRecursive(startVertex);
    } else {
      this.parents = {};
      this._runIterative(startVertex);
    }

    this._complete(startKey);
    return this.steps;
  }
}

export function recursiveDFSTraversal(graph, startVertex) {
  return new DFSAlgorithm(graph, startVertex, "recursive").run();
}

export function iterativeDFSTraversal(graph, startVertex) {
  return new DFSAlgorithm(graph, startVertex, "iterative").run();
}

export function dfsTraversal(graph, startVertex, mode = "recursive") {
  return new DFSAlgorithm(graph, startVertex, mode).run();
}

export default DFSAlgorithm;
