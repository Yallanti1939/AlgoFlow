export class BFSAlgorithm {
  constructor(graph, startVertex) {
    this.graph = graph;
    this.startVertex = startVertex;
    this.steps = [];
    this.parents = {};
    this.distances = {};
    this.order = [];
    this.queue = [];
    this.visited = new Set();
  }

  static bfsTraversal(graph, startVertex) {
    return new BFSAlgorithm(graph, startVertex).run();
  }

  _snapshot(label, explanation, options = {}) {
    const {
      currentVertex = null,
      activeVertices = [],
      activeEdges = [],
      queued = [],
      visited = [],
      order = [],
      parentMap = {},
      distanceMap = {},
      result = null,
    } = options;

    return {
      label,
      explanation,
      currentVertex,
      activeVertices: [...new Set(activeVertices.map((vertex) => String(vertex)))],
      activeEdges: [...new Set(activeEdges)],
      queued: [...queued.map((vertex) => String(vertex))],
      visited: [...new Set(visited.map((vertex) => String(vertex)))],
      order: [...order.map((vertex) => String(vertex))],
      parents: Object.fromEntries(Object.entries(parentMap).map(([key, value]) => [String(key), value === null ? null : String(value)])),
      distances: Object.fromEntries(Object.entries(distanceMap).map(([key, value]) => [String(key), Number(value)])),
      queue: [...queued.map((vertex) => String(vertex))],
      result,
      vertices: [...(this.graph?.vertices ?? [])].map((vertex) => String(vertex)),
      adjacencyList: this.graph?.adjacencyList() ?? {},
      adjacencyMatrix: this.graph?.adjacencyMatrix() ?? { vertices: [], matrix: [] },
      edgeList: this.graph?.edgeList() ?? [],
    };
  }

  _normalizeValue(value) {
    return String(value);
  }

  shortestPath(targetVertex) {
    const targetKey = this._normalizeValue(targetVertex);

    if (!this.graph || !this.graph.vertices || this.graph.vertices.length === 0) {
      return [];
    }

    if (!this.graph.vertices.some((vertex) => this._normalizeValue(vertex) === targetKey)) {
      return [];
    }

    if (!Object.prototype.hasOwnProperty.call(this.parents, targetKey)) {
      return [];
    }

    const path = [targetKey];
    let current = targetKey;

    while (this.parents[current] !== null && this.parents[current] !== undefined) {
      current = this.parents[current];
      path.unshift(current);
    }

    return path;
  }

  run() {
    if (!this.graph || !this.graph.vertices || this.graph.vertices.length === 0) {
      const emptyStep = this._snapshot(
        "Empty graph",
        "The graph has no vertices, so breadth-first search cannot start.",
        {
          queued: [],
          visited: [],
          order: [],
          parentMap: {},
          distanceMap: {},
          result: null,
        }
      );
      this.steps = [emptyStep];
      return this.steps;
    }

    const startKey = this._normalizeValue(this.startVertex);
    const graphHasStart = this.graph.vertices.some((vertex) => this._normalizeValue(vertex) === startKey);

    if (!graphHasStart) {
      const invalidStep = this._snapshot(
        "Invalid start vertex",
        `Vertex ${startKey} is not present in the graph, so BFS cannot start.`,
        {
          currentVertex: startKey,
          activeVertices: [startKey],
          queued: [],
          visited: [],
          order: [],
          parentMap: {},
          distanceMap: {},
          result: null,
        }
      );
      this.steps = [invalidStep];
      return this.steps;
    }

    const queue = [startKey];
    const visited = new Set([startKey]);
    const parents = { [startKey]: null };
    const distances = { [startKey]: 0 };
    const order = [];

    this.queue = queue;
    this.visited = visited;
    this.parents = parents;
    this.distances = distances;
    this.order = order;

    const initialStep = this._snapshot(
      `Start BFS at ${startKey}`,
      `Begin with ${startKey} in the queue and mark it as visited at distance 0.`,
      {
        currentVertex: startKey,
        activeVertices: [startKey],
        activeEdges: [],
        queued: queue,
        visited: [...visited],
        order: [...order],
        parentMap: parents,
        distanceMap: distances,
        result: {
          start: startKey,
          order: [...order],
          parents: { ...parents },
          distances: { ...distances },
        },
      }
    );
    this.steps = [initialStep];

    while (queue.length > 0) {
      const currentKey = queue.shift();
      order.push(currentKey);
      const neighbors = this.graph.getNeighbors(currentKey);

      this.currentVertex = currentKey;
      this.queue = [...queue];

      const processStep = this._snapshot(
        "Visit " + currentKey,
        `Process ${currentKey} and inspect every adjacent vertex in queue order.`,
        {
          currentVertex: currentKey,
          activeVertices: [currentKey, ...neighbors.map((neighbor) => neighbor.vertex)],
          activeEdges: neighbors.map((neighbor) => `${this._normalizeValue(currentKey)}->${this._normalizeValue(neighbor.vertex)}`),
          queued: [...queue],
          visited: [...visited],
          order: [...order],
          parentMap: { ...parents },
          distanceMap: { ...distances },
          result: {
            currentVertex: currentKey,
            queue: [...queue],
            order: [...order],
            parents: { ...parents },
            distances: { ...distances },
          },
        }
      );
      this.steps.push(processStep);

      for (const neighbor of neighbors) {
        const neighborKey = this._normalizeValue(neighbor.vertex);

        if (visited.has(neighborKey)) {
          const seenStep = this._snapshot(
            `Seen before ${neighborKey}`,
            `${neighborKey} was already encountered, so BFS skips it to avoid redundant work.`,
            {
              currentVertex: currentKey,
              activeVertices: [currentKey, neighborKey],
              activeEdges: [`${currentKey}->${neighborKey}`],
              queued: [...queue],
              visited: [...visited],
              order: [...order],
              parentMap: { ...parents },
              distanceMap: { ...distances },
              result: {
                currentVertex: currentKey,
                neighbor: neighborKey,
                skipped: true,
                queue: [...queue],
              },
            }
          );
          this.steps.push(seenStep);
          continue;
        }

        visited.add(neighborKey);
        parents[neighborKey] = currentKey;
        distances[neighborKey] = (distances[currentKey] ?? 0) + 1;
        queue.push(neighborKey);

        const neighborStep = this._snapshot(
          `Queue ${neighborKey}`,
          `${neighborKey} is discovered from ${currentKey} at distance ${distances[neighborKey]}.`,
          {
            currentVertex: currentKey,
            activeVertices: [currentKey, neighborKey],
            activeEdges: [`${currentKey}->${neighborKey}`],
            queued: [...queue],
            visited: [...visited],
            order: [...order],
            parentMap: { ...parents },
            distanceMap: { ...distances },
            result: {
              currentVertex: currentKey,
              neighbor: neighborKey,
              parent: currentKey,
              distance: distances[neighborKey],
              queue: [...queue],
            },
          }
        );
        this.steps.push(neighborStep);
      }
    }

    const finalStep = this._snapshot(
      "BFS complete",
      `Traversal finished. The shortest path distances and parent links are recorded for all reachable vertices from ${startKey}.`,
      {
        currentVertex: null,
        activeVertices: [...visited],
        activeEdges: [],
        queued: [],
        visited: [...visited],
        order: [...order],
        parentMap: { ...parents },
        distanceMap: { ...distances },
        result: {
          start: startKey,
          order: [...order],
          parents: { ...parents },
          distances: { ...distances },
        },
      }
    );
    this.steps.push(finalStep);

    this.parents = parents;
    this.distances = distances;
    this.order = order;
    this.queue = [];
    this.visited = visited;

    return this.steps;
  }
}

export function bfsTraversal(graph, startVertex) {
  return BFSAlgorithm.bfsTraversal(graph, startVertex);
}

export default BFSAlgorithm;
