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

function edgeKey(edge) {
  return `${vertexKey(edge.from)}->${vertexKey(edge.to)}`;
}

class UnionFind {
  constructor(vertices) {
    this.parent = new Map(vertices.map((vertex) => [vertexKey(vertex), vertexKey(vertex)]));
    this.rank = new Map(vertices.map((vertex) => [vertexKey(vertex), 0]));
  }

  find(vertex) {
    const key = vertexKey(vertex);
    const parent = this.parent.get(key);
    if (parent !== key) {
      this.parent.set(key, this.find(parent));
    }
    return this.parent.get(key);
  }

  union(left, right) {
    let leftRoot = this.find(left);
    let rightRoot = this.find(right);
    if (leftRoot === rightRoot) return false;

    const leftRank = this.rank.get(leftRoot);
    const rightRank = this.rank.get(rightRoot);
    if (leftRank < rightRank) {
      [leftRoot, rightRoot] = [rightRoot, leftRoot];
    }
    this.parent.set(rightRoot, leftRoot);
    if (leftRank === rightRank) {
      this.rank.set(leftRoot, this.rank.get(leftRoot) + 1);
    }
    return true;
  }

  components(vertices) {
    const groups = new Map();
    for (const vertex of vertices) {
      const root = this.find(vertex);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(vertex);
    }
    return [...groups.values()];
  }
}

function cloneResult(result) {
  if (!result) return null;
  return {
    ...result,
    edges: result.edges.map((edge) => ({ ...edge })),
    rejectedEdges: result.rejectedEdges.map((edge) => ({ ...edge })),
    components: result.components.map((component) => [...component]),
    isolatedVertices: [...result.isolatedVertices],
  };
}

export class KruskalAlgorithm {
  constructor(graph) {
    this.graph = graph;
    this.steps = [];
  }

  _snapshot(label, explanation, state = {}) {
    const {
      currentEdge = null,
      activeEdges = [],
      selectedEdges = [],
      rejectedEdges = [],
      sortedEdges = [],
      processedEdges = [],
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
      activeEdges: [...activeEdges],
      selectedEdges: selectedEdges.map((edge) => ({ ...edge })),
      rejectedEdges: rejectedEdges.map((edge) => ({ ...edge })),
      sortedEdges: sortedEdges.map((edge) => ({ ...edge })),
      processedEdges: processedEdges.map((edge) => ({ ...edge })),
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

  _result(selectedEdges, rejectedEdges, components, totalWeight, valid = true, reason = null) {
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
      rejectedEdges: rejectedEdges.map((edge) => ({ ...edge, from: vertexKey(edge.from), to: vertexKey(edge.to) })),
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
      throw new TypeError("Kruskal's algorithm requires a Graph instance.");
    }
    const vertices = this.graph.vertices;
    const edges = this.graph.edgeList().map((edge, index) => ({ ...edge, index }));

    if (this.graph.directed) {
      const result = this._result([], [], [], 0, false, "Kruskal's algorithm requires an undirected graph.");
      this.steps.push(this._snapshot("Invalid graph — undirected graph required", result.reason, { result }));
      return this.steps;
    }
    const invalidEdge = edges.find((edge) => !Number.isFinite(edge.weight));
    if (invalidEdge) {
      const result = this._result([], [], [], 0, false, `Edge weights must be finite numbers; invalid weight on ${edgeKey(invalidEdge)}.`);
      this.steps.push(this._snapshot("Invalid edge weight", result.reason, { result }));
      return this.steps;
    }
    const sortedEdges = edges
      .map((edge, index) => ({ edge, index }))
      .filter(({ edge }) => vertexKey(edge.from) !== vertexKey(edge.to))
      .sort((left, right) => left.edge.weight - right.edge.weight || left.index - right.index)
      .map(({ edge }) => edge);
    const unionFind = new UnionFind(vertices);
    const selectedEdges = [];
    const rejectedEdges = edges.filter((edge) => vertexKey(edge.from) === vertexKey(edge.to));
    const processedEdges = [];
    let totalWeight = 0;

    this.steps.push(this._snapshot(
      "Sort edges by weight",
      "Kruskal considers edges from lightest to heaviest and uses Union-Find to avoid cycles.",
      { sortedEdges, rejectedEdges }
    ));

    for (const edge of sortedEdges) {
      if (selectedEdges.length === Math.max(vertices.length - 1, 0)
        && unionFind.components(vertices).length <= 1) {
        break;
      }
      processedEdges.push(edge);
      const joinsComponents = unionFind.union(edge.from, edge.to);
      if (joinsComponents) {
        selectedEdges.push(edge);
        totalWeight += edge.weight;
      } else {
        rejectedEdges.push(edge);
      }
      const components = unionFind.components(vertices);
      this.steps.push(this._snapshot(
        joinsComponents ? `Select ${edgeKey(edge)}` : `Reject ${edgeKey(edge)}`,
        joinsComponents
          ? `This edge joins two separate components; add it to the forest (total weight ${totalWeight}).`
          : `Both endpoints already belong to the same component, so adding this edge would create a cycle.`,
        {
          currentEdge: edge,
          activeEdges: [edgeKey(edge)],
          selectedEdges,
          rejectedEdges,
          sortedEdges,
          processedEdges,
          totalWeight,
          components,
        }
      ));
    }

    const components = unionFind.components(vertices);
    const result = this._result(selectedEdges, rejectedEdges, components, totalWeight);
    this.steps.push(this._snapshot(
      components.length > 1 ? "Minimum spanning forest complete" : "Minimum spanning tree complete",
      components.length > 1
        ? `The graph is disconnected. The minimum spanning forest has ${components.length} components and total weight ${totalWeight}.`
        : `Kruskal selected ${selectedEdges.length} edges with total weight ${totalWeight}.`,
      { selectedEdges, rejectedEdges, sortedEdges, processedEdges, totalWeight, components, result }
    ));
    return this.steps;
  }
}

export function kruskal(graph) {
  return new KruskalAlgorithm(graph).run();
}

export default KruskalAlgorithm;
