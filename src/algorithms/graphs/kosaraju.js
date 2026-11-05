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

function cloneComponents(components) {
  return components.map((component) => [...component]);
}

export class KosarajuAlgorithm {
  constructor(graph) {
    this.graph = graph;
    this.steps = [];
  }

  _snapshot(label, explanation, state = {}) {
    const {
      phase = "first-pass",
      currentVertex = null,
      visited = [],
      activeStack = [],
      finishingOrder = [],
      components = [],
      currentComponent = [],
      activeEdges = [],
      result = null,
    } = state;
    const vertices = (this.graph?.vertices ?? []).map(vertexKey);
    const edgeList = state.edgeList ?? this.graph?.edgeList() ?? [];

    return deepFreeze({
      algorithm: "kosaraju",
      phase,
      label,
      explanation,
      currentVertex: currentVertex === null ? null : vertexKey(currentVertex),
      visited: [...new Set([...visited].map(vertexKey))],
      activeStack: [...activeStack.map(vertexKey)],
      finishingOrder: [...finishingOrder.map(vertexKey)],
      components: cloneComponents(components),
      currentComponent: [...currentComponent],
      activeEdges: [...activeEdges],
      vertices,
      edgeList: edgeList.map((edge) => ({
        ...edge,
        from: vertexKey(edge.from),
        to: vertexKey(edge.to),
      })),
      directed: Boolean(this.graph?.directed),
      result: result ? {
        ...result,
        components: cloneComponents(result.components),
        finishingOrder: [...result.finishingOrder],
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
      throw new TypeError("Kosaraju's algorithm requires a Graph instance.");
    }

    if (!this.graph.directed) {
      const result = {
        valid: false,
        reason: "Kosaraju's algorithm requires a directed graph.",
        components: [],
        finishingOrder: [],
        vertices: this.graph.vertices.map(vertexKey),
      };
      this.steps.push(this._snapshot(
        "Invalid graph — directed graph required",
        result.reason,
        { phase: "invalid", result }
      ));
      return this.steps;
    }

    const visited = new Set();
    const finishingOrder = [];
    const firstPass = (vertex, stack) => {
      visited.add(vertex);
      stack.push(vertex);
      this.steps.push(this._snapshot(
        `Visit ${vertexKey(vertex)} in first pass`,
        `Explore outgoing edges from ${vertexKey(vertex)} before recording its finishing time.`,
        { currentVertex: vertex, visited: [...visited], activeStack: stack, finishingOrder }
      ));

      for (const { vertex: neighbor } of this.graph.getNeighbors(vertex)) {
        if (visited.has(neighbor)) {
          this.steps.push(this._snapshot(
            `Skip visited ${vertexKey(neighbor)}`,
            `${vertexKey(neighbor)} has already been visited in the first DFS pass.`,
            {
              currentVertex: vertex,
              visited: [...visited],
              activeStack: stack,
              finishingOrder,
              activeEdges: [this._edgeKey(vertex, neighbor)],
            }
          ));
          continue;
        }
        this.steps.push(this._snapshot(
          `Explore ${vertexKey(vertex)} → ${vertexKey(neighbor)}`,
          `Follow the outgoing edge to an unvisited vertex.`,
          {
            currentVertex: vertex,
            visited: [...visited],
            activeStack: stack,
            finishingOrder,
            activeEdges: [this._edgeKey(vertex, neighbor)],
          }
        ));
        firstPass(neighbor, stack);
      }

      stack.pop();
      finishingOrder.push(vertex);
      this.steps.push(this._snapshot(
        `Finish ${vertexKey(vertex)}`,
        `All outgoing neighbors are finished. Append ${vertexKey(vertex)} to finishing order.`,
        { currentVertex: vertex, visited: [...visited], activeStack: stack, finishingOrder }
      ));
    };

    for (const vertex of this.graph.vertices) {
      if (!visited.has(vertex)) firstPass(vertex, []);
    }

    const reversedEdges = this.graph.edgeList().map((edge) => ({
      ...edge,
      from: edge.to,
      to: edge.from,
    }));
    this.steps.push(this._snapshot(
      "Reverse every directed edge",
      "The second pass uses the transpose graph, with each directed edge reversed.",
      {
        phase: "reversed",
        visited,
        finishingOrder,
        edgeList: reversedEdges,
      }
    ));

    const reverseAdjacency = new Map(this.graph.vertices.map((vertex) => [vertex, []]));
    reversedEdges.forEach(({ from, to }) => reverseAdjacency.get(from).push(to));
    const secondPassVisited = new Set();
    const components = [];
    const secondPass = (vertex, component, stack) => {
      secondPassVisited.add(vertex);
      component.push(vertexKey(vertex));
      stack.push(vertex);
      this.steps.push(this._snapshot(
        `Visit ${vertexKey(vertex)} in reversed graph`,
        `Start a DFS on the reversed graph; all reached unassigned vertices belong to this SCC.`,
        {
          phase: "second-pass",
          currentVertex: vertex,
          visited: [...secondPassVisited],
          activeStack: stack,
          finishingOrder,
          components,
          currentComponent: component,
          edgeList: reversedEdges,
        }
      ));

      for (const neighbor of reverseAdjacency.get(vertex)) {
        const edge = this._edgeKey(vertex, neighbor);
        if (secondPassVisited.has(neighbor)) {
          this.steps.push(this._snapshot(
            `Skip assigned ${vertexKey(neighbor)}`,
            `${vertexKey(neighbor)} was already assigned to an SCC during the second pass.`,
            {
              phase: "second-pass",
              currentVertex: vertex,
              visited: [...secondPassVisited],
              activeStack: stack,
              finishingOrder,
              components,
              currentComponent: component,
              activeEdges: [edge],
              edgeList: reversedEdges,
            }
          ));
          continue;
        }
        this.steps.push(this._snapshot(
          `Explore reversed edge ${vertexKey(vertex)} → ${vertexKey(neighbor)}`,
          "Continue through the reversed graph to collect this strongly connected component.",
          {
            phase: "second-pass",
            currentVertex: vertex,
            visited: [...secondPassVisited],
            activeStack: stack,
            finishingOrder,
            components,
            currentComponent: component,
            activeEdges: [edge],
            edgeList: reversedEdges,
          }
        ));
        secondPass(neighbor, component, stack);
      }

      stack.pop();
    };

    for (const vertex of [...finishingOrder].reverse()) {
      if (secondPassVisited.has(vertex)) continue;
      const component = [];
      secondPass(vertex, component, []);
      components.push(component);
      this.steps.push(this._snapshot(
        `Record SCC ${components.length}`,
        `The reversed-graph search is complete; record ${component.join(", ")} as one strongly connected component.`,
        {
          phase: "second-pass",
          currentVertex: vertex,
          visited: [...secondPassVisited],
          finishingOrder,
          components,
          edgeList: reversedEdges,
        }
      ));
    }

    const result = {
      valid: true,
      reason: null,
      components: cloneComponents(components),
      finishingOrder: finishingOrder.map(vertexKey),
      vertices: this.graph.vertices.map(vertexKey),
    };
    this.steps.push(this._snapshot(
      "Kosaraju complete",
      `Found ${components.length} strongly connected component${components.length === 1 ? "" : "s"}.`,
      { phase: "complete", visited: secondPassVisited, finishingOrder, components, result }
    ));
    return this.steps;
  }
}

export function kosarajuSCC(graph) {
  const steps = new KosarajuAlgorithm(graph).run();
  return steps.at(-1)?.result ?? null;
}

export default kosarajuSCC;
