function vertexKey(vertex) {
  return String(vertex);
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

class MinPriorityQueue {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  push(item) {
    this.items.push(item);
    let index = this.items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.items[parent].distance <= this.items[index].distance) {
        break;
      }
      [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
      index = parent;
    }
  }

  pop() {
    if (this.items.length === 0) {
      return null;
    }

    const minimum = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = last;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;
        if (left < this.items.length && this.items[left].distance < this.items[smallest].distance) {
          smallest = left;
        }
        if (right < this.items.length && this.items[right].distance < this.items[smallest].distance) {
          smallest = right;
        }
        if (smallest === index) {
          break;
        }
        [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
        index = smallest;
      }
    }
    return minimum;
  }

  snapshot() {
    return this.items
      .map(({ vertex, distance }) => ({ vertex: vertexKey(vertex), distance }))
      .sort((left, right) => left.distance - right.distance);
  }
}

function cloneResult(result) {
  if (!result) {
    return null;
  }

  return {
    ...result,
    distances: { ...result.distances },
    parents: { ...result.parents },
    finalized: [...result.finalized],
    unreachable: [...result.unreachable],
  };
}

export class DijkstraAlgorithm {
  constructor(graph, sourceVertex) {
    this.graph = graph;
    this.sourceVertex = sourceVertex;
    this.steps = [];
    this.distances = {};
    this.parents = {};
    this.finalized = new Set();
  }

  _snapshot(label, explanation, state = {}) {
    const {
      currentVertex = null,
      activeVertices = [],
      activeEdges = [],
      priorityQueue = [],
      distances = {},
      parents = {},
      finalized = [],
      path = [],
      result = null,
    } = state;
    const matrix = this.graph?.adjacencyMatrix() ?? { vertices: [], matrix: [] };
    const adjacencyList = this.graph?.adjacencyList() ?? {};

    return deepFreeze({
      label,
      explanation,
      currentVertex: currentVertex === null ? null : vertexKey(currentVertex),
      activeVertices: [...new Set(activeVertices.map(vertexKey))],
      activeEdges: [...new Set(activeEdges)],
      priorityQueue: priorityQueue.map(({ vertex, distance }) => ({
        vertex: vertexKey(vertex),
        distance,
      })),
      distances: { ...distances },
      parents: { ...parents },
      finalized: [...finalized].map(vertexKey),
      path: [...path].map(vertexKey),
      vertices: (this.graph?.vertices ?? []).map(vertexKey),
      adjacencyList: Object.fromEntries(
        Object.entries(adjacencyList).map(([vertex, neighbors]) => [
          vertex,
          neighbors.map(({ vertex: neighbor, weight }) => ({ vertex: vertexKey(neighbor), weight })),
        ])
      ),
      adjacencyMatrix: {
        vertices: matrix.vertices.map(vertexKey),
        matrix: matrix.matrix.map((row) => [...row]),
      },
      edgeList: (this.graph?.edgeList() ?? []).map((edge) => ({
        ...edge,
        from: vertexKey(edge.from),
        to: vertexKey(edge.to),
      })),
      directed: Boolean(this.graph?.directed),
      result: cloneResult(result),
    });
  }

  _result(reason = null) {
    const vertices = (this.graph?.vertices ?? []).map(vertexKey);
    return {
      valid: reason === null,
      reason,
      source: this.sourceVertex === undefined ? null : vertexKey(this.sourceVertex),
      distances: { ...this.distances },
      parents: { ...this.parents },
      finalized: [...this.finalized],
      unreachable: vertices.filter((vertex) => this.distances[vertex] === Infinity),
    };
  }

  shortestPath(targetVertex) {
    const targetKey = vertexKey(targetVertex);
    if (!Object.prototype.hasOwnProperty.call(this.distances, targetKey)
      || this.distances[targetKey] === Infinity) {
      return [];
    }

    const path = [];
    const visited = new Set();
    let current = targetKey;
    while (current !== null && current !== undefined) {
      if (visited.has(current)) {
        return [];
      }
      visited.add(current);
      path.unshift(current);
      current = this.parents[current];
    }

    return path[0] === vertexKey(this.sourceVertex) ? path : [];
  }

  run() {
    this.steps = [];
    this.distances = {};
    this.parents = {};
    this.finalized = new Set();

    if (!this.graph || !Array.isArray(this.graph.vertices)) {
      throw new TypeError("Dijkstra requires a Graph instance.");
    }

    const vertices = this.graph.vertices;
    if (vertices.length === 0) {
      const result = {
        valid: true,
        reason: null,
        source: null,
        distances: {},
        parents: {},
        finalized: [],
        unreachable: [],
      };
      this.steps.push(this._snapshot(
        "Empty graph",
        "The graph has no vertices, so there are no shortest paths to compute.",
        { result }
      ));
      return this.steps;
    }

    const source = vertices.find((vertex) => vertexKey(vertex) === vertexKey(this.sourceVertex));
    if (source === undefined) {
      const result = {
        valid: false,
        reason: `Source vertex ${vertexKey(this.sourceVertex)} is not in the graph.`,
        source: vertexKey(this.sourceVertex),
        distances: {},
        parents: {},
        finalized: [],
        unreachable: vertices.map(vertexKey),
      };
      this.steps.push(this._snapshot(
        "Invalid source vertex",
        result.reason,
        { result }
      ));
      return this.steps;
    }

    for (const edge of this.graph.edgeList()) {
      if (!Number.isFinite(edge.weight) || edge.weight < 0) {
        const result = {
          valid: false,
          reason: `Dijkstra requires finite, non-negative edge weights. Edge ${vertexKey(edge.from)} → ${vertexKey(edge.to)} has weight ${edge.weight}.`,
          source: vertexKey(source),
          distances: {},
          parents: {},
          finalized: [],
          unreachable: vertices.map(vertexKey),
        };
        this.steps.push(this._snapshot(
          "Invalid edge weight",
          result.reason,
          {
            currentVertex: edge.from,
            activeVertices: [edge.from, edge.to],
            activeEdges: [`${vertexKey(edge.from)}->${vertexKey(edge.to)}`],
            result,
          }
        ));
        return this.steps;
      }
    }

    this.distances = Object.fromEntries(vertices.map((vertex) => [vertexKey(vertex), Infinity]));
    this.parents = Object.fromEntries(vertices.map((vertex) => [vertexKey(vertex), null]));
    this.distances[vertexKey(source)] = 0;
    const queue = new MinPriorityQueue();
    queue.push({ vertex: source, distance: 0 });

    this.steps.push(this._snapshot(
      `Start at ${vertexKey(source)}`,
      `Set the source distance to zero and insert it into the min-priority queue.`,
      {
        currentVertex: source,
        activeVertices: [source],
        priorityQueue: queue.snapshot(),
        distances: this.distances,
        parents: this.parents,
      }
    ));

    while (queue.size > 0) {
      const entry = queue.pop();
      const current = entry.vertex;
      const currentKey = vertexKey(current);

      if (entry.distance !== this.distances[currentKey] || this.finalized.has(currentKey)) {
        this.steps.push(this._snapshot(
          `Discard stale entry for ${currentKey}`,
          `This queued distance is no longer the best known distance for ${currentKey}; ignore the outdated entry.`,
          {
            currentVertex: current,
            priorityQueue: queue.snapshot(),
            distances: this.distances,
            parents: this.parents,
            finalized: this.finalized,
          }
        ));
        continue;
      }

      this.finalized.add(currentKey);
      this.steps.push(this._snapshot(
        `Finalize ${currentKey}`,
        `The smallest tentative distance is now final: ${currentKey} is at distance ${this.distances[currentKey]}.`,
        {
          currentVertex: current,
          activeVertices: [current],
          priorityQueue: queue.snapshot(),
          distances: this.distances,
          parents: this.parents,
          finalized: this.finalized,
        }
      ));

      for (const { vertex: neighbor, weight } of this.graph.getNeighbors(current)) {
        const neighborKey = vertexKey(neighbor);
        const candidate = this.distances[currentKey] + weight;
        const previous = this.distances[neighborKey];

        if (candidate < previous) {
          this.distances[neighborKey] = candidate;
          this.parents[neighborKey] = currentKey;
          queue.push({ vertex: neighbor, distance: candidate });
          this.steps.push(this._snapshot(
            `Relax ${currentKey} → ${neighborKey}`,
            `The route through ${currentKey} costs ${candidate}, improving ${neighborKey}'s previous distance ${previous === Infinity ? "∞" : previous}.`,
            {
              currentVertex: current,
              activeVertices: [current, neighbor],
              activeEdges: [`${currentKey}->${neighborKey}`],
              priorityQueue: queue.snapshot(),
              distances: this.distances,
              parents: this.parents,
              finalized: this.finalized,
            }
          ));
        } else {
          this.steps.push(this._snapshot(
            `Keep distance to ${neighborKey}`,
            `The route through ${currentKey} costs ${candidate}, which does not improve ${neighborKey}'s known distance ${previous}.`,
            {
              currentVertex: current,
              activeVertices: [current, neighbor],
              activeEdges: [`${currentKey}->${neighborKey}`],
              priorityQueue: queue.snapshot(),
              distances: this.distances,
              parents: this.parents,
              finalized: this.finalized,
            }
          ));
        }
      }
    }

    const result = this._result();
    this.steps.push(this._snapshot(
      "Dijkstra complete",
      result.unreachable.length
        ? `All reachable distances from ${vertexKey(source)} are final. Unreachable vertices: ${result.unreachable.join(", ")}.`
        : `All shortest distances from ${vertexKey(source)} are final.`,
      {
        distances: this.distances,
        parents: this.parents,
        finalized: this.finalized,
        result,
      }
    ));
    return this.steps;
  }
}

export function dijkstra(graph, sourceVertex) {
  return new DijkstraAlgorithm(graph, sourceVertex).run();
}

export default DijkstraAlgorithm;
