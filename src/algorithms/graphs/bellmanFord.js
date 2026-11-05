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

function cloneResult(result) {
  if (!result) {
    return null;
  }

  return {
    ...result,
    distances: { ...result.distances },
    parents: { ...result.parents },
    processedEdges: [...result.processedEdges],
    unreachable: [...result.unreachable],
    affectedByNegativeCycle: [...result.affectedByNegativeCycle],
    negativeCycle: [...result.negativeCycle],
  };
}

export class BellmanFordAlgorithm {
  constructor(graph, sourceVertex) {
    this.graph = graph;
    this.sourceVertex = sourceVertex;
    this.steps = [];
    this.distances = {};
    this.parents = {};
    this.affectedByNegativeCycle = new Set();
  }

  _snapshot(label, explanation, state = {}) {
    const {
      pass = null,
      currentEdge = null,
      activeVertices = [],
      activeEdges = [],
      distances = {},
      parents = {},
      processedEdges = [],
      changed = false,
      negativeCycleStatus = "Checking",
      affectedByNegativeCycle = [],
      result = null,
    } = state;
    const matrix = this.graph?.adjacencyMatrix() ?? { vertices: [], matrix: [] };
    const adjacencyList = this.graph?.adjacencyList() ?? {};

    return deepFreeze({
      label,
      explanation,
      pass,
      currentEdge: currentEdge
        ? { from: vertexKey(currentEdge.from), to: vertexKey(currentEdge.to), weight: currentEdge.weight }
        : null,
      activeVertices: [...new Set(activeVertices.map(vertexKey))],
      activeEdges: [...new Set(activeEdges)],
      distances: { ...distances },
      parents: { ...parents },
      processedEdges: [...processedEdges],
      changed,
      negativeCycleStatus,
      affectedByNegativeCycle: [...affectedByNegativeCycle].map(vertexKey),
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

  _directedEdges() {
    return this.graph.vertices.flatMap((from) => this.graph.getNeighbors(from).map(({ vertex: to, weight }) => ({
      from,
      to,
      weight,
    })));
  }

  _baseResult({ valid = true, reason = null, negativeCycleDetected = false, negativeCycle = [], processedEdges = [] } = {}) {
    const vertices = this.graph.vertices.map(vertexKey);
    return {
      valid,
      reason,
      source: this.sourceVertex === undefined ? null : vertexKey(this.sourceVertex),
      distances: { ...this.distances },
      parents: { ...this.parents },
      negativeCycleDetected,
      negativeCycle: [...negativeCycle],
      affectedByNegativeCycle: [...this.affectedByNegativeCycle],
      unreachable: vertices.filter((vertex) => this.distances[vertex] === Infinity),
      processedEdges: [...processedEdges],
    };
  }

  _extractCycle(changedVertex) {
    let current = changedVertex;
    for (let count = 0; count < this.graph.vertices.length; count += 1) {
      current = this.parents[vertexKey(current)];
      if (current === null || current === undefined) {
        return [];
      }
    }

    const cycle = [];
    const start = vertexKey(current);
    let cursor = current;
    do {
      const currentKey = vertexKey(cursor);
      cycle.push(currentKey);
      cursor = this.parents[currentKey];
      if (cursor === null || cursor === undefined || cycle.length > this.graph.vertices.length + 1) {
        return [];
      }
    } while (vertexKey(cursor) !== start);
    cycle.push(start);
    return cycle.reverse();
  }

  shortestPath(targetVertex) {
    const targetKey = vertexKey(targetVertex);
    if (!Object.prototype.hasOwnProperty.call(this.distances, targetKey)
      || this.distances[targetKey] === Infinity
      || this.distances[targetKey] === -Infinity
      || this.affectedByNegativeCycle.has(targetKey)) {
      return [];
    }

    const path = [];
    const seen = new Set();
    let current = targetKey;
    while (current !== null && current !== undefined) {
      if (seen.has(current)) {
        return [];
      }
      seen.add(current);
      path.unshift(current);
      current = this.parents[current];
    }
    return path[0] === vertexKey(this.sourceVertex) ? path : [];
  }

  run() {
    this.steps = [];
    this.distances = {};
    this.parents = {};
    this.affectedByNegativeCycle = new Set();

    if (!this.graph || !Array.isArray(this.graph.vertices)) {
      throw new TypeError("Bellman-Ford requires a Graph instance.");
    }

    const vertices = this.graph.vertices;
    if (vertices.length === 0) {
      const result = {
        valid: true,
        reason: null,
        source: null,
        distances: {},
        parents: {},
        negativeCycleDetected: false,
        negativeCycle: [],
        affectedByNegativeCycle: [],
        unreachable: [],
        processedEdges: [],
      };
      this.steps.push(this._snapshot("Empty graph", "The graph has no vertices, so there are no shortest paths to compute.", { result }));
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
        negativeCycleDetected: false,
        negativeCycle: [],
        affectedByNegativeCycle: [],
        unreachable: vertices.map(vertexKey),
        processedEdges: [],
      };
      this.steps.push(this._snapshot("Invalid source vertex", result.reason, { result }));
      return this.steps;
    }

    const edges = this._directedEdges();
    if (edges.some((edge) => !Number.isFinite(edge.weight))) {
      const result = {
        valid: false,
        reason: "Bellman-Ford requires finite numeric edge weights.",
        source: vertexKey(source),
        distances: {},
        parents: {},
        negativeCycleDetected: false,
        negativeCycle: [],
        affectedByNegativeCycle: [],
        unreachable: vertices.map(vertexKey),
        processedEdges: [],
      };
      this.steps.push(this._snapshot("Invalid edge weight", result.reason, { result }));
      return this.steps;
    }

    this.distances = Object.fromEntries(vertices.map((vertex) => [vertexKey(vertex), Infinity]));
    this.parents = Object.fromEntries(vertices.map((vertex) => [vertexKey(vertex), null]));
    this.distances[vertexKey(source)] = 0;
    this.steps.push(this._snapshot(
      `Initialize from ${vertexKey(source)}`,
      `Set the source distance to zero; all other vertices begin at infinity. Up to V−1 edge-relaxation passes follow.`,
      { distances: this.distances, parents: this.parents, negativeCycleStatus: "Not checked" }
    ));

    for (let pass = 1; pass < vertices.length; pass += 1) {
      let changed = false;
      const processedEdges = [];
      this.steps.push(this._snapshot(
        `Start pass ${pass}`,
        `Pass ${pass} considers each directed edge and propagates shortest paths of up to ${pass} edges.`,
        { pass, distances: this.distances, parents: this.parents, negativeCycleStatus: "Not checked" }
      ));

      for (const edge of edges) {
        const fromKey = vertexKey(edge.from);
        const toKey = vertexKey(edge.to);
        processedEdges.push(`${fromKey}->${toKey}`);
        const previous = this.distances[toKey];
        const candidate = this.distances[fromKey] === Infinity
          ? Infinity
          : this.distances[fromKey] + edge.weight;
        const improved = candidate < previous;

        if (improved) {
          this.distances[toKey] = candidate;
          this.parents[toKey] = fromKey;
          changed = true;
        }
        this.steps.push(this._snapshot(
          improved ? `Relax ${fromKey} → ${toKey}` : `Keep ${toKey}`,
          improved
            ? `A route through ${fromKey} improves ${toKey} from ${previous === Infinity ? "∞" : previous} to ${candidate}.`
            : (candidate === Infinity
              ? `${fromKey} is unreachable from the source, so this edge cannot improve ${toKey}.`
              : `The route through ${fromKey} costs ${candidate}; ${toKey} already has distance ${previous}.`),
          {
            pass,
            currentEdge: edge,
            activeVertices: [edge.from, edge.to],
            activeEdges: [`${fromKey}->${toKey}`],
            distances: this.distances,
            parents: this.parents,
            processedEdges,
            changed,
            negativeCycleStatus: "Not checked",
          }
        ));
      }

      if (!changed) {
        this.steps.push(this._snapshot(
          `Stop early after pass ${pass}`,
          "No distance changed in this pass, so all reachable shortest paths are settled and further passes are unnecessary.",
          {
            pass,
            distances: this.distances,
            parents: this.parents,
            processedEdges,
            changed: false,
            negativeCycleStatus: "Not checked",
          }
        ));
        break;
      }
    }

    let changedVertex = null;
    const relaxableVertices = new Set();
    const cycleCheckDistances = { ...this.distances };
    const cycleCheckEdges = [];
    for (const edge of edges) {
      const fromKey = vertexKey(edge.from);
      const toKey = vertexKey(edge.to);
      const candidate = cycleCheckDistances[fromKey] === Infinity
        ? Infinity
        : cycleCheckDistances[fromKey] + edge.weight;
      const improved = candidate < cycleCheckDistances[toKey];
      cycleCheckEdges.push(`${fromKey}->${toKey}`);

      if (improved) {
        this.parents[toKey] = fromKey;
        changedVertex = edge.to;
        relaxableVertices.add(edge.to);
      }
      this.steps.push(this._snapshot(
        improved ? `Negative-cycle check: improve ${toKey}` : `Negative-cycle check: keep ${toKey}`,
        improved
          ? `This edge can still improve a reachable distance after V−1 passes, proving a reachable negative cycle.`
          : `This edge cannot further improve a reachable distance.`,
        {
          pass: vertices.length,
          currentEdge: edge,
          activeVertices: [edge.from, edge.to],
          activeEdges: [`${fromKey}->${toKey}`],
          distances: cycleCheckDistances,
          parents: this.parents,
          processedEdges: cycleCheckEdges,
          negativeCycleStatus: "Checking",
        }
      ));
    }

    let negativeCycle = [];
    if (changedVertex !== null) {
      negativeCycle = this._extractCycle(changedVertex);
      const queue = [...relaxableVertices];
      for (const vertex of queue) {
        const vertexKeyValue = vertexKey(vertex);
        if (this.affectedByNegativeCycle.has(vertexKeyValue)) {
          continue;
        }
        this.affectedByNegativeCycle.add(vertexKeyValue);
        for (const { vertex: neighbor } of this.graph.getNeighbors(vertex)) {
          if (!this.affectedByNegativeCycle.has(vertexKey(neighbor))) {
            queue.push(neighbor);
          }
        }
      }
      this.affectedByNegativeCycle.forEach((vertex) => {
        this.distances[vertex] = -Infinity;
        this.parents[vertex] = null;
      });
    }

    const result = this._baseResult({
      reason: changedVertex !== null
        ? "A reachable negative cycle exists from the selected source; shortest distances for affected vertices are undefined."
        : null,
      negativeCycleDetected: changedVertex !== null,
      negativeCycle,
      processedEdges: cycleCheckEdges,
    });
    this.steps.push(this._snapshot(
      result.negativeCycleDetected ? "Reachable negative cycle detected" : "Bellman-Ford complete",
      result.negativeCycleDetected
        ? `A negative cycle is reachable from ${vertexKey(source)}. Distances for affected vertices are undefined (−∞): ${result.affectedByNegativeCycle.join(", ")}. Negative cycles unreachable from the source do not affect these paths.`
        : "No reachable negative cycle exists. Finite distances are valid shortest paths; vertices at infinity are unreachable.",
      {
        distances: this.distances,
        parents: this.parents,
        processedEdges: cycleCheckEdges,
        negativeCycleStatus: result.negativeCycleDetected ? "Reachable negative cycle" : "No reachable negative cycle",
        affectedByNegativeCycle: this.affectedByNegativeCycle,
        result,
      }
    ));
    return this.steps;
  }
}

export function bellmanFord(graph, sourceVertex) {
  return new BellmanFordAlgorithm(graph, sourceVertex).run();
}

export default BellmanFordAlgorithm;
