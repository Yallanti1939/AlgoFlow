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

class EdgeMinHeap {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  push(edge) {
    this.items.push(edge);
    let index = this.items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.items[parent].weight <= this.items[index].weight) break;
      [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
      index = parent;
    }
  }

  pop() {
    if (this.items.length === 0) return null;
    const minimum = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = last;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;
        if (left < this.items.length && this.items[left].weight < this.items[smallest].weight) smallest = left;
        if (right < this.items.length && this.items[right].weight < this.items[smallest].weight) smallest = right;
        if (smallest === index) break;
        [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
        index = smallest;
      }
    }
    return minimum;
  }

  snapshot() {
    return this.items.map((edge) => ({ ...edge })).sort((a, b) => a.weight - b.weight);
  }
}

function edgeKey(edge) {
  return `${vertexKey(edge.from)}->${vertexKey(edge.to)}`;
}

function cloneResult(result) {
  if (!result) return null;
  return {
    ...result,
    edges: result.edges.map((edge) => ({ ...edge })),
    components: result.components.map((component) => [...component]),
    isolatedVertices: [...result.isolatedVertices],
  };
}

export class PrimAlgorithm {
  constructor(graph, startVertex) {
    this.graph = graph;
    this.startVertex = startVertex;
    this.steps = [];
  }

  _snapshot(label, explanation, state = {}) {
    const {
      currentEdge = null,
      activeVertices = [],
      activeEdges = [],
      selectedEdges = [],
      rejectedEdges = [],
      visited = [],
      priorityQueue = [],
      totalWeight = 0,
      components = [],
      result = null,
    } = state;
    const matrix = this.graph?.adjacencyMatrix() ?? { vertices: [], matrix: [] };
    const adjacencyList = this.graph?.adjacencyList() ?? {};

    return deepFreeze({
      label,
      explanation,
      currentEdge: currentEdge ? { ...currentEdge } : null,
      activeVertices: [...new Set(activeVertices.map(vertexKey))],
      activeEdges: [...new Set(activeEdges)],
      selectedEdges: selectedEdges.map((edge) => ({ ...edge })),
      rejectedEdges: rejectedEdges.map((edge) => ({ ...edge })),
      visited: [...visited].map(vertexKey),
      priorityQueue: priorityQueue.map((edge) => ({ ...edge })),
      totalWeight,
      components: components.map((component) => [...component]),
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

  _edges() {
    return this.graph.edgeList().map((edge) => ({ ...edge }));
  }

  _finalResult(selectedEdges, components, totalWeight, valid = true, reason = null) {
    const vertices = this.graph.vertices.map(vertexKey);
    const componentMap = new Map();
    components.forEach((component, index) => component.forEach((vertex) => componentMap.set(vertexKey(vertex), index)));
    const isolatedVertices = vertices.filter((vertex) => (
      this.graph.getNeighbors(this.graph.vertices.find((item) => vertexKey(item) === vertex)).length === 0
    ));
    return {
      valid,
      reason,
      edges: selectedEdges.map((edge) => ({ ...edge, from: vertexKey(edge.from), to: vertexKey(edge.to) })),
      totalWeight,
      components: components.map((component) => component.map(vertexKey)),
      componentCount: components.length,
      connected: components.length <= 1,
      isSpanningTree: valid && components.length <= 1,
      isSpanningForest: valid,
      isolatedVertices,
      vertices,
      componentMap: Object.fromEntries(componentMap),
    };
  }

  run() {
    this.steps = [];
    if (!this.graph || !Array.isArray(this.graph.vertices)) {
      throw new TypeError("Prim's algorithm requires a Graph instance.");
    }
    const vertices = this.graph.vertices;
    const edges = this._edges();
    if (this.graph.directed) {
      const result = this._finalResult([], [], 0, false, "Prim's algorithm requires an undirected graph.");
      this.steps.push(this._snapshot("Invalid graph — undirected graph required", result.reason, { result }));
      return this.steps;
    }
    const invalidEdge = edges.find((edge) => !Number.isFinite(edge.weight));
    if (invalidEdge) {
      const result = this._finalResult([], [], 0, false, `Edge weights must be finite numbers; invalid weight on ${edgeKey(invalidEdge)}.`);
      this.steps.push(this._snapshot("Invalid edge weight", result.reason, { result }));
      return this.steps;
    }
    if (vertices.length === 0) {
      const result = this._finalResult([], [], 0);
      this.steps.push(this._snapshot("Empty graph", "The empty graph has an empty minimum spanning forest.", { result }));
      return this.steps;
    }
    const start = vertices.find((vertex) => vertexKey(vertex) === vertexKey(this.startVertex));
    if (start === undefined) {
      const result = this._finalResult([], [], 0, false, `Start vertex ${vertexKey(this.startVertex)} is not in the graph.`);
      this.steps.push(this._snapshot("Invalid start vertex", result.reason, { result }));
      return this.steps;
    }

    const selectedEdges = [];
    const rejectedEdges = [];
    const visited = new Set();
    const components = [];
    let totalWeight = 0;
    const componentStarts = [start, ...vertices.filter((vertex) => vertexKey(vertex) !== vertexKey(start))];

    this.steps.push(this._snapshot(
      `Start Prim at ${vertexKey(start)}`,
      "Grow a minimum spanning tree from the selected start, then repeat from any unvisited component.",
      { activeVertices: [start] }
    ));

    for (const componentStart of componentStarts) {
      const componentKey = vertexKey(componentStart);
      if (visited.has(componentKey)) continue;
      const componentVertices = [];
      const queue = new EdgeMinHeap();
      visited.add(componentKey);
      componentVertices.push(componentStart);
      this.steps.push(this._snapshot(
        `Start component at ${componentKey}`,
        `Begin a new forest component at ${componentKey}; isolated vertices also form components.`,
        { activeVertices: [componentStart], visited, selectedEdges, rejectedEdges, totalWeight, components: [...components, componentVertices] }
      ));

      const pushFrontier = (vertex) => {
        for (const neighbor of this.graph.getNeighbors(vertex)) {
          if (!visited.has(vertexKey(neighbor.vertex))
            || vertexKey(neighbor.vertex) === vertexKey(vertex)) {
            queue.push({ from: vertex, to: neighbor.vertex, weight: neighbor.weight });
          }
        }
      };
      pushFrontier(componentStart);

      while (queue.size > 0) {
        const candidate = queue.pop();
        const fromVisited = visited.has(vertexKey(candidate.from));
        const toVisited = visited.has(vertexKey(candidate.to));
        if (fromVisited === toVisited) {
          rejectedEdges.push(candidate);
          this.steps.push(this._snapshot(
            `Reject ${edgeKey(candidate)}`,
            "Both endpoints are already in the current forest (or neither is); adding this edge would not connect a new vertex.",
            {
              currentEdge: candidate,
              activeVertices: [candidate.from, candidate.to],
              activeEdges: [edgeKey(candidate)],
              selectedEdges,
              rejectedEdges,
              visited,
              priorityQueue: queue.snapshot(),
              totalWeight,
              components: [...components, componentVertices],
            }
          ));
          continue;
        }

        const nextVertex = fromVisited ? candidate.to : candidate.from;
        selectedEdges.push(candidate);
        totalWeight += candidate.weight;
        visited.add(vertexKey(nextVertex));
        componentVertices.push(nextVertex);
        this.steps.push(this._snapshot(
          `Select ${edgeKey(candidate)}`,
          `This minimum candidate edge connects ${vertexKey(nextVertex)} to the growing tree without creating a cycle.`,
          {
            currentEdge: candidate,
            activeVertices: [candidate.from, candidate.to],
            activeEdges: [edgeKey(candidate)],
            selectedEdges,
            rejectedEdges,
            visited,
            priorityQueue: queue.snapshot(),
            totalWeight,
            components: [...components, componentVertices],
          }
        ));
        pushFrontier(nextVertex);
      }

      components.push(componentVertices);
    }

    const result = this._finalResult(selectedEdges, components, totalWeight);
    this.steps.push(this._snapshot(
      components.length > 1 ? "Minimum spanning forest complete" : "Minimum spanning tree complete",
      components.length > 1
        ? `The graph is disconnected. The minimum spanning forest has ${components.length} components and total weight ${totalWeight}.`
        : `The connected graph's MST contains ${selectedEdges.length} edges with total weight ${totalWeight}.`,
      { selectedEdges, rejectedEdges, visited, totalWeight, components, result }
    ));
    return this.steps;
  }
}

export function prim(graph, startVertex) {
  return new PrimAlgorithm(graph, startVertex).run();
}

export default PrimAlgorithm;
