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

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function cloneResult(result) {
  if (!result) {
    return null;
  }

  return {
    ...result,
    vertices: [...result.vertices],
    distances: cloneMatrix(result.distances),
    nextHop: cloneMatrix(result.nextHop),
    negativeCycleVertices: [...result.negativeCycleVertices],
    undefinedPairs: result.undefinedPairs.map((pair) => [...pair]),
  };
}

export class FloydWarshallAlgorithm {
  constructor(graph) {
    this.graph = graph;
    this.steps = [];
    this.result = null;
  }

  _snapshot(label, explanation, state = {}) {
    const {
      intermediate = null,
      source = null,
      destination = null,
      activeVertices = [],
      activeEdges = [],
      distances = [],
      nextHop = [],
      beforeValue = null,
      afterValue = null,
      negativeCycleVertices = [],
      result = null,
    } = state;
    const matrix = this.graph?.adjacencyMatrix() ?? { vertices: [], matrix: [] };
    const adjacencyList = this.graph?.adjacencyList() ?? {};

    return deepFreeze({
      label,
      explanation,
      intermediate: intermediate === null ? null : vertexKey(intermediate),
      source: source === null ? null : vertexKey(source),
      destination: destination === null ? null : vertexKey(destination),
      matrixCell: source === null || destination === null ? null : {
        row: vertexKey(source),
        column: vertexKey(destination),
        intermediate: intermediate === null ? null : vertexKey(intermediate),
      },
      activeVertices: [...new Set(activeVertices.map(vertexKey))],
      activeEdges: [...new Set(activeEdges)],
      beforeValue,
      afterValue,
      distances: cloneMatrix(distances),
      nextHop: cloneMatrix(nextHop),
      negativeCycleVertices: [...negativeCycleVertices].map(vertexKey),
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

  _result(negativeCycleVertices = [], undefinedPairs = []) {
    return {
      valid: true,
      hasNegativeCycle: negativeCycleVertices.length > 0,
      vertices: this.graph.vertices.map(vertexKey),
      distances: cloneMatrix(this.distances),
      nextHop: cloneMatrix(this.nextHop),
      negativeCycleVertices: [...negativeCycleVertices].map(vertexKey),
      undefinedPairs: undefinedPairs.map((pair) => [...pair]),
      reason: negativeCycleVertices.length
        ? `Negative cycle detected at ${negativeCycleVertices.map(vertexKey).join(", ")}; affected source-destination distances are undefined.`
        : null,
    };
  }

  shortestPath(fromVertex, toVertex) {
    if (!this.result || !this.result.valid) {
      return [];
    }

    const vertices = this.graph.vertices;
    const from = vertices.findIndex((vertex) => vertexKey(vertex) === vertexKey(fromVertex));
    const to = vertices.findIndex((vertex) => vertexKey(vertex) === vertexKey(toVertex));
    if (from < 0 || to < 0 || this.result.distances[from][to] === Infinity
      || this.result.distances[from][to] === -Infinity) {
      return [];
    }
    if (from === to) {
      return [vertexKey(vertices[from])];
    }

    const path = [vertexKey(vertices[from])];
    let current = from;
    for (let count = 0; current !== to && count < vertices.length; count += 1) {
      const next = this.result.nextHop[current][to];
      if (next === null || next === undefined || next < 0) {
        return [];
      }
      current = next;
      path.push(vertexKey(vertices[current]));
    }
    return current === to ? path : [];
  }

  run() {
    this.steps = [];
    this.result = null;

    if (!this.graph || !Array.isArray(this.graph.vertices)) {
      throw new TypeError("Floyd-Warshall requires a Graph instance.");
    }

    const vertices = this.graph.vertices;
    const size = vertices.length;
    this.distances = Array.from({ length: size }, (_, from) => (
      Array.from({ length: size }, (_, to) => (from === to ? 0 : Infinity))
    ));
    this.nextHop = Array.from({ length: size }, () => Array(size).fill(null));

    if (this.graph.vertices.length === 0) {
      this.result = this._result();
      this.steps.push(this._snapshot(
        "Empty graph",
        "The empty graph has an empty all-pairs distance matrix and no negative cycles.",
        { result: this.result }
      ));
      return this.steps;
    }

    for (let from = 0; from < size; from += 1) {
      for (const { vertex: neighbor, weight } of this.graph.getNeighbors(vertices[from])) {
        if (!Number.isFinite(weight)) {
          const result = {
            valid: false,
            hasNegativeCycle: false,
            vertices: vertices.map(vertexKey),
            distances: cloneMatrix(this.distances),
            nextHop: cloneMatrix(this.nextHop),
            negativeCycleVertices: [],
            undefinedPairs: [],
            reason: "Floyd-Warshall requires finite numeric edge weights.",
          };
          this.steps.push(this._snapshot("Invalid edge weight", result.reason, { result }));
          this.result = result;
          return this.steps;
        }
        const to = vertices.findIndex((vertex) => vertex === neighbor);
        if (to >= 0 && weight < this.distances[from][to]) {
          this.distances[from][to] = weight;
          this.nextHop[from][to] = to;
        }
      }
    }

    this.steps.push(this._snapshot(
      "Initialize distance matrix",
      "Set diagonal distances to zero, direct edges to their weights, and absent edges to infinity.",
      { distances: this.distances, nextHop: this.nextHop }
    ));

    for (let k = 0; k < size; k += 1) {
      this.steps.push(this._snapshot(
        `Use ${vertexKey(vertices[k])} as intermediate`,
        `Check whether routes become shorter when ${vertexKey(vertices[k])} is allowed as an intermediate vertex.`,
        {
          intermediate: vertices[k],
          distances: this.distances,
          nextHop: this.nextHop,
        }
      ));

      for (let i = 0; i < size; i += 1) {
        for (let j = 0; j < size; j += 1) {
          const beforeValue = this.distances[i][j];
          const viaIntermediate = this.distances[i][k] === Infinity || this.distances[k][j] === Infinity
            ? Infinity
            : this.distances[i][k] + this.distances[k][j];
          let updated = false;
          if (viaIntermediate < beforeValue) {
            this.distances[i][j] = viaIntermediate;
            this.nextHop[i][j] = this.nextHop[i][k];
            updated = true;
          }

          const source = vertices[i];
          const destination = vertices[j];
          const middle = vertices[k];
          const activeEdges = [];
          if (i !== k && this.nextHop[i][k] !== null) {
            activeEdges.push(`${vertexKey(source)}->${vertexKey(middle)}`);
          }
          if (k !== j && this.nextHop[k][j] !== null) {
            activeEdges.push(`${vertexKey(middle)}->${vertexKey(destination)}`);
          }
          this.steps.push(this._snapshot(
            updated
              ? `Update ${vertexKey(source)} → ${vertexKey(destination)} via ${vertexKey(middle)}`
              : `Keep ${vertexKey(source)} → ${vertexKey(destination)} via ${vertexKey(middle)}`,
            updated
              ? `Using ${vertexKey(middle)} improves the distance from ${beforeValue === Infinity ? "∞" : beforeValue} to ${viaIntermediate}.`
              : `The route via ${vertexKey(middle)} costs ${viaIntermediate === Infinity ? "∞" : viaIntermediate}, so the current distance ${beforeValue === Infinity ? "∞" : beforeValue} stays.`,
            {
              intermediate: middle,
              source,
              destination,
              activeVertices: [source, middle, destination],
              activeEdges,
              distances: this.distances,
              nextHop: this.nextHop,
              beforeValue,
              afterValue: this.distances[i][j],
            }
          ));
        }
      }
    }

    const negativeCycleIndices = [];
    for (let index = 0; index < size; index += 1) {
      if (this.distances[index][index] < 0) {
        negativeCycleIndices.push(index);
      }
    }
    const undefinedPairs = [];
    for (const cycleIndex of negativeCycleIndices) {
      for (let from = 0; from < size; from += 1) {
        if (this.distances[from][cycleIndex] === Infinity) continue;
        for (let to = 0; to < size; to += 1) {
          if (this.distances[cycleIndex][to] !== Infinity) {
            this.distances[from][to] = -Infinity;
            this.nextHop[from][to] = null;
            undefinedPairs.push([vertexKey(vertices[from]), vertexKey(vertices[to])]);
          }
        }
      }
    }

    this.result = this._result(negativeCycleIndices.map((index) => vertices[index]), undefinedPairs);
    this.steps.push(this._snapshot(
      this.result.hasNegativeCycle ? "Negative cycle detected" : "Floyd-Warshall complete",
      this.result.hasNegativeCycle
        ? `${this.result.reason} Pairs affected by a negative cycle are shown as −∞ (undefined).`
        : "All-pairs shortest distances are complete; no negative diagonal entry was found.",
      {
        distances: this.distances,
        nextHop: this.nextHop,
        negativeCycleVertices: this.result.negativeCycleVertices,
        result: this.result,
      }
    ));
    return this.steps;
  }
}

export function floydWarshall(graph) {
  return new FloydWarshallAlgorithm(graph).run();
}

export default FloydWarshallAlgorithm;
