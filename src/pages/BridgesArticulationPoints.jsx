import { useMemo, useState } from "react";

import { BridgesAlgorithm } from "../algorithms/graphs/bridges";
import { ArticulationPointsAlgorithm } from "../algorithms/graphs/articulationPoints";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import GraphVisualizer from "../components/visualizers/GraphVisualizer";
import { Graph } from "../data-structures/graphs/graph";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import {
  bridgesArticulationComplexity,
  bridgesArticulationLearning,
  bridgesArticulationPracticeSets,
} from "../data/learningModules";

function buildSampleGraph(directed = false) {
  const graph = new Graph({ directed, weighted: false });
  ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].forEach((vertex) => graph.addVertex(vertex));
  [
    ["A", "B"], ["B", "C"], ["C", "A"],
    ["C", "D"],
    ["D", "E"], ["E", "F"], ["F", "D"],
    ["G", "H"], ["G", "I"],
  ].forEach(([from, to]) => graph.addEdge(from, to));
  return graph;
}

function layoutVertices(vertices) {
  const positions = {
    A: { x: 100, y: 120 },
    B: { x: 200, y: 60 },
    C: { x: 200, y: 180 },
    D: { x: 350, y: 120 },
    E: { x: 470, y: 60 },
    F: { x: 470, y: 180 },
    G: { x: 100, y: 330 },
    H: { x: 230, y: 270 },
    I: { x: 230, y: 390 },
    J: { x: 540, y: 330 },
  };
  vertices.forEach((vertex, index) => {
    positions[String(vertex)] ??= { x: 80 + (index % 6) * 110, y: 90 + Math.floor(index / 6) * 180 };
  });
  return positions;
}

function edgeKey(edge) {
  return `${String(edge.from)}->${String(edge.to)}`;
}

function reverseEdgeKey(key) {
  const separator = key.indexOf("->");
  return separator < 0 ? key : `${key.slice(separator + 2)}->${key.slice(0, separator)}`;
}

function getEdgeClassNames(step) {
  const classes = {};
  const bridgeKeys = new Set((step?.bridges ?? []).map(edgeKey));
  const treeKeys = new Set((step?.dfsTreeEdges ?? []).map(edgeKey));
  const backKeys = new Set((step?.backEdges ?? []).map(edgeKey));

  [...bridgeKeys, ...treeKeys, ...backKeys].forEach((key) => {
    const reverse = reverseEdgeKey(key);
    if (bridgeKeys.has(key)) {
      classes[key] = "graph-edge-bridge";
      classes[reverse] = "graph-edge-bridge";
    } else if (treeKeys.has(key)) {
      classes[key] = "graph-edge-tree";
      classes[reverse] = "graph-edge-tree";
    } else if (backKeys.has(key)) {
      classes[key] = "graph-edge-back";
      classes[reverse] = "graph-edge-back";
    }
  });
  return classes;
}

function normalizeEdges(edges = []) {
  return edges.map((edge) => ({
    ...edge,
    from: String(edge.from),
    to: String(edge.to),
  }));
}

function BridgesArticulationPointsPage() {
  const metadata = dataStructureMetadata.bridgesArticulationPoints;
  const [algorithm, setAlgorithm] = useState("bridges");
  const [directed, setDirected] = useState(false);
  const [graph, setGraph] = useState(() => buildSampleGraph());
  const [steps, setSteps] = useState(() => new BridgesAlgorithm(buildSampleGraph()).run());
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackRevision, setPlaybackRevision] = useState(0);
  const [selectedPractice, setSelectedPractice] = useState(bridgesArticulationPracticeSets[0]);

  const activeStep = steps[playbackIndex] ?? steps[0] ?? null;
  const finalResult = steps.at(-1)?.result;
  const positions = useMemo(() => layoutVertices(graph.vertices), [graph.vertices]);
  const code = algorithm === "bridges"
    ? bridgesArticulationLearning.bridgeCode
    : bridgesArticulationLearning.articulationCode;
  const explanation = algorithm === "bridges"
    ? bridgesArticulationLearning.bridgeDefinition
    : bridgesArticulationLearning.articulationDefinition;
  const identifiedEdges = (activeStep?.bridges ?? []).map(edgeKey);
  const edgeClassNames = getEdgeClassNames(activeStep);
  const articulationSet = new Set(activeStep?.articulationPoints ?? []);
  const vertexClassNames = Object.fromEntries(
    graph.vertices
      .filter((vertex) => articulationSet.has(String(vertex)))
      .map((vertex) => [String(vertex), "graph-node-articulation"])
  );
  const visibleEdges = activeStep?.edgeList ?? graph.edgeList();

  const runAlgorithm = (nextGraph = graph, nextAlgorithm = algorithm) => {
    const nextSteps = nextAlgorithm === "bridges"
      ? new BridgesAlgorithm(nextGraph).run()
      : new ArticulationPointsAlgorithm(nextGraph).run();
    setSteps(nextSteps);
    setPlaybackIndex(0);
    setPlaybackRevision((revision) => revision + 1);
  };

  const loadGraph = (nextDirected = directed) => {
    const nextGraph = buildSampleGraph(nextDirected);
    setDirected(nextDirected);
    setGraph(nextGraph);
    runAlgorithm(nextGraph);
  };

  const selectAlgorithm = (nextAlgorithm) => {
    setAlgorithm(nextAlgorithm);
    runAlgorithm(graph, nextAlgorithm);
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 5 · BRIDGES AND ARTICULATION POINTS</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <h3>Choose a low-link analysis</h3>
          <div className="toolbar">
            <div>
              <label htmlFor="low-link-algorithm">ALGORITHM</label>
              <select id="low-link-algorithm" value={algorithm} onChange={(event) => selectAlgorithm(event.target.value)}>
                <option value="bridges">Bridges</option>
                <option value="articulationPoints">Articulation points</option>
              </select>
            </div>
            <div>
              <label htmlFor="low-link-graph-type">GRAPH TYPE</label>
              <select id="low-link-graph-type" value={directed ? "directed" : "undirected"} onChange={(event) => loadGraph(event.target.value === "directed")}>
                <option value="undirected">Undirected sample</option>
                <option value="directed">Directed (rejected)</option>
              </select>
            </div>
          </div>
          <div className="action-grid">
            <button className="primary-btn" onClick={() => runAlgorithm()}>
              Find {algorithm === "bridges" ? "bridges" : "articulation points"}
            </button>
            <button className="secondary-btn" onClick={() => loadGraph(false)}>Reset undirected sample</button>
          </div>
          {!finalResult?.valid && finalResult?.reason && <div className="status-box" role="status">{finalResult.reason}</div>}
        </div>

        <div className="panel-card">
          <h3>Low-link DFS</h3>
          <p className="stack-demo-summary">{bridgesArticulationLearning.lowLinkExplanation}</p>
          <p className="stack-demo-summary">{bridgesArticulationLearning.comparison}</p>
          <div className="info-grid compact-grid">
            <div className="info-card"><h4>Current vertex</h4><p>{activeStep?.currentVertex ?? "—"}</p></div>
            <div className="info-card"><h4>Parent</h4><p>{activeStep?.parent ?? "—"}</p></div>
            <div className="info-card"><h4>Connected components</h4><p>{activeStep?.components?.length ?? 0}</p></div>
          </div>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>Undirected graph and DFS classification</h3>
          <GraphVisualizer
            vertices={graph.vertices.map(String)}
            positions={positions}
            edges={normalizeEdges(visibleEdges)}
            selectedVertex={activeStep?.currentVertex ?? null}
            highlightedEdges={activeStep?.activeEdges ?? []}
            selectedEdges={identifiedEdges}
            vertexClassNames={vertexClassNames}
            edgeClassNames={edgeClassNames}
            directed={false}
          />
          <div className="low-link-legend">
            <span><i className="low-link-swatch low-link-tree" />DFS tree edge</span>
            <span><i className="low-link-swatch low-link-back" />Back edge</span>
            <span><i className="low-link-swatch low-link-bridge" />Bridge</span>
            <span><i className="low-link-swatch low-link-articulation" />Articulation point</span>
          </div>
          <div className="info-grid compact-grid">
            <div className="info-card"><h4>Visited</h4><p>{activeStep?.visited?.join(" → ") || "None"}</p></div>
            <div className="info-card"><h4>DFS stack</h4><p>{activeStep?.activeStack?.join(" → ") || "Empty"}</p></div>
            <div className="info-card"><h4>Active edge</h4><p>{activeStep?.activeEdges?.[0]?.replace("->", " — ") ?? "None"}</p></div>
          </div>
          <PlaybackPanel
            key={playbackRevision}
            steps={steps}
            title={`${algorithm === "bridges" ? "Bridge" : "Articulation-point"} DFS`}
            speed={700}
            onStepChange={(nextStatus) => setPlaybackIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Discovery and low-link state</h3>
          <div className="snapshot-grid">
            {graph.vertices.map((vertex) => (
              <div className="snapshot-box" key={String(vertex)}>
                <strong>{String(vertex)}</strong>
                <span>Discovery: {activeStep?.discovery?.[String(vertex)] ?? "—"}</span>
                <span>Low-link: {activeStep?.lowLink?.[String(vertex)] ?? "—"}</span>
                <span>Parent: {activeStep?.parents?.[String(vertex)] ?? "—"}</span>
                <span>{activeStep?.articulationPoints?.includes(String(vertex)) ? "Articulation point" : "Not identified"}</span>
              </div>
            ))}
          </div>
          <div className="result-box"><strong>DFS tree edges:</strong> {activeStep?.dfsTreeEdges?.map((edge) => `${String(edge.from)}—${String(edge.to)}`).join(", ") || "None"}</div>
          <div className="result-box"><strong>Back edges:</strong> {activeStep?.backEdges?.map((edge) => `${String(edge.from)}—${String(edge.to)}`).join(", ") || "None"}</div>
          <div className="result-box"><strong>Bridges:</strong> {activeStep?.bridges?.map((edge) => `${String(edge.from)}—${String(edge.to)}`).join(", ") || "None found so far"}</div>
          <div className="result-box"><strong>Articulation points:</strong> {activeStep?.articulationPoints?.join(", ") || "None found so far"}</div>
          <div className="result-box"><strong>Final result:</strong> {finalResult?.valid
            ? (algorithm === "bridges"
              ? `${finalResult.bridges.length} bridge${finalResult.bridges.length === 1 ? "" : "s"}`
              : `${finalResult.articulationPoints.length} articulation point${finalResult.articulationPoints.length === 1 ? "" : "s"}`)
            : finalResult?.reason ?? "Ready"}</div>
          <div className="result-box"><strong>Explanation:</strong> {activeStep?.explanation ?? "Start DFS to compute discovery and low-link values."}</div>
          <div className="info-card"><h4>Applications</h4><p>{bridgesArticulationLearning.applications}</p></div>
        </div>
      </div>

      <div className="info-grid">
        {bridgesArticulationComplexity.map((item) => <div key={item.title} className="info-card"><h4>{item.title}</h4><p>{item.description}</p></div>)}
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">PRACTICE</p><h2>Critical connection challenges</h2></div></div>
        <div className="practice-list">
          {bridgesArticulationPracticeSets.map((problem) => (
            <button key={problem.title} className={`practice-item ${selectedPractice.title === problem.title ? "selected" : ""}`} onClick={() => setSelectedPractice(problem)}>
              <span>{problem.title}</span><small>{problem.difficulty}</small>
            </button>
          ))}
        </div>
        <CodeViewer title={selectedPractice.title} summary={selectedPractice.statement} code={selectedPractice.solution} explanation={`${selectedPractice.explanation} ${selectedPractice.complexity}`} />
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">LEARN</p><h2>Bridge and articulation tests</h2></div></div>
        <div className="info-grid">
          <div className="info-card"><h4>Bridge condition</h4><p>{bridgesArticulationLearning.bridgeDefinition}</p></div>
          <div className="info-card"><h4>Articulation point</h4><p>{bridgesArticulationLearning.articulationDefinition}</p></div>
          <div className="info-card"><h4>DFS root</h4><p>{bridgesArticulationLearning.rootCondition}</p></div>
          <div className="info-card"><h4>Non-root vertex</h4><p>{bridgesArticulationLearning.nonRootCondition}</p></div>
        </div>
        <CodeViewer title="Tarjan low-link pseudocode" summary="A single undirected DFS finds bridges and articulation points in linear time." code={bridgesArticulationLearning.pseudocode} explanation={bridgesArticulationLearning.lowLinkExplanation} />
        <CodeViewer
          title={algorithm === "bridges" ? "Bridge-finding implementation" : "Articulation-point implementation"}
          summary="The selected analysis uses DFS discovery times, low-link values, and exact parent-edge identity."
          code={code}
          explanation={explanation}
        />
      </div>
    </section>
  );
}

export default BridgesArticulationPointsPage;
