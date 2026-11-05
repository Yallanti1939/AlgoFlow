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

function copyEdges(edges) {
  return edges.map((edge) => ({ ...edge }));
}

function edgeLabel(edge) {
  return `${vertexKey(edge.from)}--${vertexKey(edge.to)}`;
}

function resultSnapshot(result) {
  return {
    ...result,
    bridges: copyEdges(result.bridges),
    articulationPoints: [...result.articulationPoints],
    dfsTreeEdges: copyEdges(result.dfsTreeEdges),
    backEdges: copyEdges(result.backEdges),
    components: result.components.map((component) => [...component]),
    discovery: { ...result.discovery },
    lowLink: { ...result.lowLink },
    parents: { ...result.parents },
  };
}

function makeSnapshot(graph, mode, label, explanation, state = {}) {
  const {
    currentVertex = null,
    parent = null,
    visited = [],
    activeStack = [],
    discovery = new Map(),
    lowLink = new Map(),
    parents = new Map(),
    dfsTreeEdges = [],
    backEdges = [],
    bridges = [],
    articulationPoints = [],
    components = [],
    activeEdge = null,
    result = null,
  } = state;
  const edges = graph.edgeList().map((edge) => ({
    ...edge,
    from: vertexKey(edge.from),
    to: vertexKey(edge.to),
  }));
  const snapshot = {
    algorithm: mode,
    label,
    explanation,
    currentVertex: currentVertex === null ? null : vertexKey(currentVertex),
    parent: parent === null ? null : vertexKey(parent),
    visited: [...visited].map(vertexKey),
    activeStack: [...activeStack].map(vertexKey),
    discovery: objectFromMap(discovery),
    lowLink: objectFromMap(lowLink),
    parents: Object.fromEntries([...parents].map(([vertex, value]) => [
      vertexKey(vertex),
      value === null ? null : vertexKey(value),
    ])),
    dfsTreeEdges: copyEdges(dfsTreeEdges),
    backEdges: copyEdges(backEdges),
    bridges: copyEdges(bridges),
    articulationPoints: [...articulationPoints].map(vertexKey),
    components: components.map((component) => [...component].map(vertexKey)),
    activeEdges: activeEdge ? [`${vertexKey(activeEdge.from)}->${vertexKey(activeEdge.to)}`] : [],
    vertices: graph.vertices.map(vertexKey),
    edgeList: edges,
    directed: Boolean(graph.directed),
    result: result ? resultSnapshot(result) : null,
  };
  return deepFreeze(snapshot);
}

function invalidResult(graph, reason) {
  return {
    valid: false,
    reason,
    bridges: [],
    articulationPoints: [],
    discovery: {},
    lowLink: {},
    parents: Object.fromEntries(graph.vertices.map((vertex) => [vertexKey(vertex), null])),
    dfsTreeEdges: [],
    backEdges: [],
    components: [],
    vertices: graph.vertices.map(vertexKey),
  };
}

function runLowLinkTraversal(graph, mode) {
  const algorithmName = mode === "bridges" ? "Bridge finding" : "Articulation-point detection";
  if (!graph || !Array.isArray(graph.vertices) || typeof graph.getNeighbors !== "function"
    || typeof graph.edgeList !== "function") {
    throw new TypeError(`${algorithmName} requires a Graph instance.`);
  }

  const steps = [];
  if (graph.directed) {
    const result = invalidResult(graph, `${algorithmName} requires an undirected graph.`);
    steps.push(makeSnapshot(
      graph,
      mode,
      "Invalid graph — undirected graph required",
      result.reason,
      { result }
    ));
    return steps;
  }

  const discovery = new Map();
  const lowLink = new Map();
  const parents = new Map(graph.vertices.map((vertex) => [vertex, null]));
  const bridges = [];
  const articulationPoints = new Set();
  const dfsTreeEdges = [];
  const backEdges = [];
  const backEdgeIds = new Set();
  const components = [];
  let timestamp = 0;

  const edgeIds = new Map(graph.vertices.map((vertex) => [vertex, new Map()]));
  graph.edgeList().forEach((edge, index) => {
    edgeIds.get(edge.from).set(edge.to, index);
    edgeIds.get(edge.to).set(edge.from, index);
  });

  const snapshotState = (overrides = {}) => ({
    visited: discovery.keys(),
    activeStack: [],
    discovery,
    lowLink,
    parents,
    dfsTreeEdges,
    backEdges,
    bridges,
    articulationPoints,
    components,
    ...overrides,
  });

  const visit = (vertex, parentVertex, parentEdgeId, activeStack, component) => {
    discovery.set(vertex, timestamp);
    lowLink.set(vertex, timestamp);
    timestamp += 1;
    activeStack.push(vertex);
    let childCount = 0;
    steps.push(makeSnapshot(
      graph,
      mode,
      `Discover ${vertexKey(vertex)}`,
      `Assign discovery time ${discovery.get(vertex)} and initialize low[${vertexKey(vertex)}] to the same value.`,
      snapshotState({ currentVertex: vertex, parent: parentVertex, activeStack })
    ));

    for (const { vertex: neighbor } of graph.getNeighbors(vertex)) {
      const edgeId = edgeIds.get(vertex).get(neighbor);
      if (edgeId === parentEdgeId) {
        steps.push(makeSnapshot(
          graph,
          mode,
          `Skip parent edge ${edgeLabel({ from: vertex, to: neighbor })}`,
          "This is the exact DFS tree edge used to reach the parent; do not treat it as a back edge.",
          snapshotState({
            currentVertex: vertex,
            parent: parentVertex,
            activeStack,
            activeEdge: { from: vertex, to: neighbor },
          })
        ));
        continue;
      }

      if (!discovery.has(neighbor)) {
        childCount += 1;
        parents.set(neighbor, vertex);
        const treeEdge = graph.edgeList()[edgeId];
        dfsTreeEdges.push(treeEdge);
        component.push(neighbor);
        steps.push(makeSnapshot(
          graph,
          mode,
          `Explore tree edge ${edgeLabel(treeEdge)}`,
          `Discover ${vertexKey(neighbor)} as a DFS child of ${vertexKey(vertex)}.`,
          snapshotState({
            currentVertex: vertex,
            parent: parentVertex,
            activeStack,
            activeEdge: treeEdge,
          })
        ));

        visit(neighbor, vertex, edgeId, activeStack, component);
        const previousLow = lowLink.get(vertex);
        const nextLow = Math.min(previousLow, lowLink.get(neighbor));
        lowLink.set(vertex, nextLow);
        steps.push(makeSnapshot(
          graph,
          mode,
          `Update low-link of ${vertexKey(vertex)}`,
          `Return from child ${vertexKey(neighbor)}; low[${vertexKey(vertex)}] becomes min(${previousLow}, ${lowLink.get(neighbor)}) = ${nextLow}.`,
          snapshotState({
            currentVertex: vertex,
            parent: parentVertex,
            activeStack,
            activeEdge: treeEdge,
          })
        ));

        if (lowLink.get(neighbor) > discovery.get(vertex)) {
          bridges.push(treeEdge);
          steps.push(makeSnapshot(
            graph,
            mode,
            `Bridge found: ${edgeLabel(treeEdge)}`,
            `low[${vertexKey(neighbor)}] > discovery[${vertexKey(vertex)}], so removing this edge separates the DFS subtree.`,
            snapshotState({
              currentVertex: vertex,
              parent: parentVertex,
              activeStack,
              activeEdge: treeEdge,
            })
          ));
        }

        if (parentVertex !== null && lowLink.get(neighbor) >= discovery.get(vertex)
          && !articulationPoints.has(vertex)) {
          articulationPoints.add(vertex);
          steps.push(makeSnapshot(
            graph,
            mode,
            `Articulation point found: ${vertexKey(vertex)}`,
            `As a non-root vertex, ${vertexKey(vertex)} separates a child subtree because low[${vertexKey(neighbor)}] ≥ discovery[${vertexKey(vertex)}].`,
            snapshotState({
              currentVertex: vertex,
              parent: parentVertex,
              activeStack,
              activeEdge: treeEdge,
            })
          ));
        }
        continue;
      }

      if (discovery.get(neighbor) < discovery.get(vertex) || neighbor === vertex) {
        if (!backEdgeIds.has(edgeId)) {
          const backEdge = graph.edgeList()[edgeId];
          backEdgeIds.add(edgeId);
          backEdges.push(backEdge);
          steps.push(makeSnapshot(
            graph,
            mode,
            `Back edge ${edgeLabel(backEdge)}`,
            neighbor === vertex
              ? "A self-loop is a back edge but cannot lower low-link or disconnect another vertex."
              : `The edge reaches an ancestor; use discovery[${vertexKey(neighbor)}] to update the low-link value.`,
            snapshotState({
              currentVertex: vertex,
              parent: parentVertex,
              activeStack,
              activeEdge: backEdge,
            })
          ));
        }
        const previousLow = lowLink.get(vertex);
        const nextLow = Math.min(previousLow, discovery.get(neighbor));
        lowLink.set(vertex, nextLow);
        steps.push(makeSnapshot(
          graph,
          mode,
          `Update low-link using ${edgeLabel({ from: vertex, to: neighbor })}`,
          `Compare low[${vertexKey(vertex)}] with discovery[${vertexKey(neighbor)}]; the value is ${nextLow}.`,
          snapshotState({
            currentVertex: vertex,
            parent: parentVertex,
            activeStack,
            activeEdge: { from: vertex, to: neighbor },
          })
        ));
      }
    }

    if (parentVertex === null && childCount > 1 && !articulationPoints.has(vertex)) {
      articulationPoints.add(vertex);
      steps.push(makeSnapshot(
        graph,
        mode,
        `Root articulation point: ${vertexKey(vertex)}`,
        `DFS root ${vertexKey(vertex)} has ${childCount} DFS-tree children; removing it disconnects those subtrees.`,
        snapshotState({ currentVertex: vertex, activeStack })
      ));
    }

    activeStack.pop();
    steps.push(makeSnapshot(
      graph,
      mode,
      `Finish ${vertexKey(vertex)}`,
      `All neighbors of ${vertexKey(vertex)} have been processed.`,
      snapshotState({ currentVertex: vertex, parent: parentVertex, activeStack })
    ));
  };

  for (const vertex of graph.vertices) {
    if (discovery.has(vertex)) continue;
    const component = [vertex];
    steps.push(makeSnapshot(
      graph,
      mode,
      `Start component at ${vertexKey(vertex)}`,
      "Begin a DFS from this unvisited vertex to cover another connected component.",
      snapshotState({ currentVertex: vertex })
    ));
    visit(vertex, null, null, [], component);
    components.push(component);
    steps.push(makeSnapshot(
      graph,
      mode,
      `Finish component ${components.length}`,
      `This DFS tree contains ${component.map(vertexKey).join(", ")}.`,
      snapshotState({ currentVertex: vertex, components })
    ));
  }

  const result = {
    valid: true,
    reason: null,
    bridges: copyEdges(bridges),
    articulationPoints: [...articulationPoints].map(vertexKey),
    discovery: objectFromMap(discovery),
    lowLink: objectFromMap(lowLink),
    parents: Object.fromEntries([...parents].map(([key, value]) => [
      vertexKey(key),
      value === null ? null : vertexKey(value),
    ])),
    dfsTreeEdges: copyEdges(dfsTreeEdges),
    backEdges: copyEdges(backEdges),
    components: components.map((component) => component.map(vertexKey)),
    vertices: graph.vertices.map(vertexKey),
  };
  steps.push(makeSnapshot(
    graph,
    mode,
    mode === "bridges" ? "Bridge search complete" : "Articulation-point search complete",
    mode === "bridges"
      ? `Found ${bridges.length} bridge${bridges.length === 1 ? "" : "s"} across ${components.length} connected component${components.length === 1 ? "" : "s"}.`
      : `Found ${articulationPoints.size} articulation point${articulationPoints.size === 1 ? "" : "s"} across ${components.length} connected component${components.length === 1 ? "" : "s"}.`,
    snapshotState({ components, result })
  ));
  return steps;
}

export { runLowLinkTraversal };
