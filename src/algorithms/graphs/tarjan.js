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

function objectFromMap(map) {
  return Object.fromEntries([...map].map(([vertex, value]) => [vertexKey(vertex), value]));
}

function cloneComponents(components) {
  return components.map((component) => [...component]);
}

export class TarjanAlgorithm {
  constructor(graph) {
    this.graph = graph;
    this.steps = [];
  }

  _snapshot(label, explanation, state = {}) {
    const {
      currentVertex = null,
      visited = [],
      activeStack = [],
      onStack = [],
      discovery = new Map(),
      lowLink = new Map(),
      components = [],
      activeEdges = [],
      before = null,
      after = null,
      extractedComponent = [],
      result = null,
    } = state;
    const vertices = (this.graph?.vertices ?? []).map(vertexKey);
    return deepFreeze({
      algorithm: "tarjan",
      phase: state.phase ?? "search",
      label,
      explanation,
      currentVertex: currentVertex === null ? null : vertexKey(currentVertex),
      visited: [...new Set([...visited].map(vertexKey))],
      activeStack: [...activeStack.map(vertexKey)],
      onStack: [...onStack].map(vertexKey),
      discovery: objectFromMap(discovery),
      lowLink: objectFromMap(lowLink),
      lowLinkUpdate: before === null && after === null ? null : { before, after },
      components: cloneComponents(components),
      extractedComponent: [...extractedComponent],
      activeEdges: [...activeEdges],
      vertices,
      edgeList: (this.graph?.edgeList() ?? []).map((edge) => ({
        ...edge,
        from: vertexKey(edge.from),
        to: vertexKey(edge.to),
      })),
      directed: Boolean(this.graph?.directed),
      result: result ? {
        ...result,
        components: cloneComponents(result.components),
        discovery: { ...result.discovery },
        lowLink: { ...result.lowLink },
        vertices: [...result.vertices],
      } : null,
    });
  }

  _edgeKey(from, to) {
    return `${vertexKey(from)}->${vertexKey(to)}`;
  }

  run() {
    this.steps = [];
    if (!this.graph || !Array.isArray(this.graph.vertices) || typeof this.graph.getNeighbors !== "function") {
      throw new TypeError("Tarjan's algorithm requires a Graph instance.");
    }

    if (!this.graph.directed) {
      const result = {
        valid: false,
        reason: "Tarjan's algorithm requires a directed graph.",
        components: [],
        discovery: {},
        lowLink: {},
        vertices: this.graph.vertices.map(vertexKey),
      };
      this.steps.push(this._snapshot(
        "Invalid graph — directed graph required",
        result.reason,
        { phase: "invalid", result }
      ));
      return this.steps;
    }

    const discovery = new Map();
    const lowLink = new Map();
    const activeStack = [];
    const onStack = new Set();
    const components = [];
    let time = 0;

    const state = (overrides = {}) => ({
      visited: discovery.keys(),
      activeStack,
      onStack,
      discovery,
      lowLink,
      components,
      ...overrides,
    });

    const visit = (vertex) => {
      discovery.set(vertex, time);
      lowLink.set(vertex, time);
      time += 1;
      activeStack.push(vertex);
      onStack.add(vertex);
      this.steps.push(this._snapshot(
        `Discover ${vertexKey(vertex)}`,
        `Assign discovery index ${discovery.get(vertex)} and initialize its low-link value.`,
        state({ currentVertex: vertex })
      ));

      for (const { vertex: neighbor } of this.graph.getNeighbors(vertex)) {
        const edge = this._edgeKey(vertex, neighbor);
        if (!discovery.has(neighbor)) {
          this.steps.push(this._snapshot(
            `Explore ${vertexKey(vertex)} → ${vertexKey(neighbor)}`,
            "The neighbor is undiscovered; recurse before updating this vertex's low-link value.",
            state({ currentVertex: vertex, activeEdges: [edge] })
          ));
          visit(neighbor);
          const previous = lowLink.get(vertex);
          const next = Math.min(previous, lowLink.get(neighbor));
          lowLink.set(vertex, next);
          this.steps.push(this._snapshot(
            `Update low-link of ${vertexKey(vertex)}`,
            `Return from ${vertexKey(neighbor)} and compare low[${vertexKey(vertex)}] with low[${vertexKey(neighbor)}].`,
            state({ currentVertex: vertex, activeEdges: [edge], before: previous, after: next })
          ));
        } else if (onStack.has(neighbor)) {
          const previous = lowLink.get(vertex);
          const next = Math.min(previous, discovery.get(neighbor));
          lowLink.set(vertex, next);
          this.steps.push(this._snapshot(
            `Use back edge to ${vertexKey(neighbor)}`,
            `The neighbor is still active; compare low[${vertexKey(vertex)}] with discovery[${vertexKey(neighbor)}].`,
            state({ currentVertex: vertex, activeEdges: [edge], before: previous, after: next })
          ));
        } else {
          this.steps.push(this._snapshot(
            `Ignore completed ${vertexKey(neighbor)}`,
            `${vertexKey(neighbor)} has already been assigned to a completed SCC and cannot lower this low-link value.`,
            state({ currentVertex: vertex, activeEdges: [edge] })
          ));
        }
      }

      if (lowLink.get(vertex) === discovery.get(vertex)) {
        const component = [];
        let member;
        do {
          member = activeStack.pop();
          onStack.delete(member);
          component.push(vertexKey(member));
          this.steps.push(this._snapshot(
            `Extract ${vertexKey(member)} from stack`,
            `${vertexKey(member)} belongs to the SCC rooted at ${vertexKey(vertex)}.`,
            state({
              phase: "extract",
              currentVertex: vertex,
              extractedComponent: [...component],
            })
          ));
        } while (member !== vertex);

        components.push(component);
        this.steps.push(this._snapshot(
          `Record SCC ${components.length}`,
          `${vertexKey(vertex)} has low[${vertexKey(vertex)}] = discovery[${vertexKey(vertex)}], so this component is complete.`,
          state({ phase: "component", currentVertex: vertex })
        ));
      }
    };

    for (const vertex of this.graph.vertices) {
      if (!discovery.has(vertex)) visit(vertex);
    }

    const result = {
      valid: true,
      reason: null,
      components: cloneComponents(components),
      discovery: objectFromMap(discovery),
      lowLink: objectFromMap(lowLink),
      vertices: this.graph.vertices.map(vertexKey),
    };
    this.steps.push(this._snapshot(
      "Tarjan complete",
      `Found ${components.length} strongly connected component${components.length === 1 ? "" : "s"}.`,
      state({ phase: "complete", result })
    ));
    return this.steps;
  }
}

export function tarjanSCC(graph) {
  const steps = new TarjanAlgorithm(graph).run();
  return steps.at(-1)?.result ?? null;
}

export default tarjanSCC;
