export class Graph {
  constructor(options = {}) {
    const { directed = false, weighted = false, vertices = [] } = options;
    this.directed = Boolean(directed);
    this.weighted = Boolean(weighted);
    this.vertices = [];
    this.adjacency = new Map();

    vertices.forEach((vertex) => this.addVertex(vertex));
  }

  _snapshot(label, explanation, options = {}) {
    const {
      activeVertices = [],
      activeEdges = [],
      result = null,
      before = null,
      after = null,
    } = options;

    return {
      label,
      explanation,
      activeVertices: [...new Set(activeVertices)],
      activeEdges: [...new Set(activeEdges)],
      result,
      before,
      after,
      vertices: [...this.vertices],
      adjacencyList: this.adjacencyList(),
      adjacencyMatrix: this.adjacencyMatrix(),
      edgeList: this.edgeList(),
      directed: this.directed,
      weighted: this.weighted,
    };
  }

  _edgeKey(from, to) {
    return `${String(from)}->${String(to)}`;
  }

  addVertex(vertex) {
    if (this.vertices.includes(vertex)) {
      return this._snapshot(
        "Duplicate vertex",
        `Vertex ${String(vertex)} already exists in the graph.`,
        { activeVertices: [vertex], result: null }
      );
    }

    this.vertices.push(vertex);
    this.adjacency.set(vertex, new Map());

    return this._snapshot(
      `Add vertex ${String(vertex)}`,
      `Vertex ${String(vertex)} was added to the graph.`,
      { activeVertices: [vertex], result: { vertex, added: true } }
    );
  }

  removeVertex(vertex) {
    if (!this.adjacency.has(vertex)) {
      return this._snapshot(
        "Invalid vertex",
        `Vertex ${String(vertex)} does not exist in the graph.`,
        { activeVertices: [vertex], result: null }
      );
    }

    this.vertices = this.vertices.filter((item) => item !== vertex);

    for (const [currentVertex, neighbors] of this.adjacency.entries()) {
      if (currentVertex !== vertex) {
        neighbors.delete(vertex);
      }
    }

    this.adjacency.delete(vertex);

    return this._snapshot(
      `Remove vertex ${String(vertex)}`,
      `Vertex ${String(vertex)} and any incident edges were removed.`,
      { activeVertices: [vertex], result: { vertex, removed: true } }
    );
  }

  addEdge(from, to, weight = 1) {
    if (!this.adjacency.has(from) || !this.adjacency.has(to)) {
      return this._snapshot(
        "Invalid edge",
        "Both vertices must exist before an edge can be created.",
        { activeVertices: [from, to], result: null }
      );
    }

    if (this.adjacency.get(from).has(to)) {
      return this._snapshot(
        "Duplicate edge",
        `An edge already connects ${String(from)} to ${String(to)}.`,
        {
          activeVertices: [from, to],
          activeEdges: [this._edgeKey(from, to)],
          result: { from, to, weight: this.adjacency.get(from).get(to) },
        }
      );
    }

    const normalizedWeight = this.weighted ? Number(weight) : 1;

    if (Number.isNaN(normalizedWeight)) {
      return this._snapshot(
        "Invalid weight",
        "Edge weights must be numeric values.",
        { activeVertices: [from, to], result: null }
      );
    }

    this.adjacency.get(from).set(to, normalizedWeight);

    if (!this.directed) {
      this.adjacency.get(to).set(from, normalizedWeight);
    }

    return this._snapshot(
      `Add edge ${String(from)} -> ${String(to)}`,
      this.directed
        ? `Edge ${String(from)} -> ${String(to)} was added with weight ${normalizedWeight}.`
        : `Edge ${String(from)} -- ${String(to)} was added with weight ${normalizedWeight}.`,
      {
        activeVertices: [from, to],
        activeEdges: [this._edgeKey(from, to)],
        result: { from, to, weight: normalizedWeight },
      }
    );
  }

  removeEdge(from, to) {
    if (!this.adjacency.has(from) || !this.adjacency.has(to)) {
      return this._snapshot(
        "Invalid edge",
        "You cannot remove an edge from vertices that do not exist.",
        { activeVertices: [from, to], result: null }
      );
    }

    if (!this.adjacency.get(from).has(to)) {
      return this._snapshot(
        "Missing edge",
        `There is no edge from ${String(from)} to ${String(to)}.`,
        { activeVertices: [from, to], result: null }
      );
    }

    const weight = this.adjacency.get(from).get(to);
    this.adjacency.get(from).delete(to);

    if (!this.directed) {
      this.adjacency.get(to).delete(from);
    }

    return this._snapshot(
      `Remove edge ${String(from)} -> ${String(to)}`,
      `Edge ${String(from)} -> ${String(to)} was removed.`,
      {
        activeVertices: [from, to],
        activeEdges: [this._edgeKey(from, to)],
        before: { from, to, weight },
        result: { from, to, removed: true },
      }
    );
  }

  hasEdge(from, to) {
    return Boolean(this.adjacency.get(from)?.has(to));
  }

  getNeighbors(vertex) {
    if (!this.adjacency.has(vertex)) {
      return [];
    }

    return [...this.adjacency.get(vertex).entries()].map(([neighbor, weight]) => ({
      vertex: neighbor,
      weight,
    }));
  }

  getDegree(vertex) {
    if (!this.adjacency.has(vertex)) {
      return 0;
    }

    if (this.directed) {
      return this.getInDegree(vertex) + this.getOutDegree(vertex);
    }

    return this.adjacency.get(vertex).size;
  }

  getInDegree(vertex) {
    if (!this.adjacency.has(vertex)) {
      return 0;
    }

    if (!this.directed) {
      return this.adjacency.get(vertex).size;
    }

    let inDegree = 0;

    for (const [currentVertex, neighbors] of this.adjacency.entries()) {
      if (currentVertex !== vertex && neighbors.has(vertex)) {
        inDegree += 1;
      }
      if (currentVertex === vertex && neighbors.has(vertex)) {
        inDegree += 1;
      }
    }

    return inDegree;
  }

  getOutDegree(vertex) {
    if (!this.adjacency.has(vertex)) {
      return 0;
    }

    return this.adjacency.get(vertex).size;
  }

  adjacencyList() {
    const list = {};

    this.vertices.forEach((vertex) => {
      list[String(vertex)] = this.getNeighbors(vertex).map((neighbor) => ({
        vertex: neighbor.vertex,
        weight: neighbor.weight,
      }));
    });

    return list;
  }

  adjacencyMatrix() {
    const labels = [...this.vertices];
    const matrix = labels.map(() => labels.map(() => 0));

    labels.forEach((from, fromIndex) => {
      const neighbors = this.adjacency.get(from) ?? new Map();
      neighbors.forEach((weight, to) => {
        const toIndex = labels.indexOf(to);
        if (toIndex !== -1) {
          matrix[fromIndex][toIndex] = weight;
        }
      });
    });

    return {
      vertices: labels,
      matrix,
    };
  }

  edgeList() {
    const edges = [];
    const seen = new Set();

    this.vertices.forEach((from) => {
      const neighbors = this.adjacency.get(from) ?? new Map();
      neighbors.forEach((weight, to) => {
        const key = this.directed
          ? this._edgeKey(from, to)
          : [String(from), String(to)].sort().join("::");

        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ from, to, weight });
        }
      });
    });

    return edges;
  }

  getWeight(from, to) {
    return this.adjacency.get(from)?.get(to) ?? null;
  }

  clear() {
    this.vertices = [];
    this.adjacency = new Map();
  }
}

export default Graph;
