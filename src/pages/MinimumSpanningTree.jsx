import { useMemo, useState } from "react";

import { PrimAlgorithm } from "../algorithms/graphs/prim";
import { KruskalAlgorithm } from "../algorithms/graphs/kruskal";
import GraphVisualizer from "../components/visualizers/GraphVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { Graph } from "../data-structures/graphs/graph";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import {
  mstComplexity,
  mstCode,
  mstPracticeSets,
} from "../data/learningModules";

function buildSampleGraph(directed = false, disconnected = false) {
  const graph = new Graph({ directed, weighted: true });
  ["A", "B", "C", "D", "E", "F"].forEach((vertex) => graph.addVertex(vertex));
  const edges = [
    ["A", "B", 4],
    ["A", "C", 0],
    ["B", "C", -1],
    ["B", "D", 5],
    ["C", "D", 8],
    ["C", "E", 10],
    ["D", "E", 2],
    ...(disconnected ? [] : [["E", "F", 3]]),
  ];
  edges.forEach(([from, to, weight]) => graph.addEdge(from, to, weight));
  return graph;
}

function layoutVertices(vertices) {
  const positions = {};
  vertices.forEach((vertex, index) => {
    const angle = (index / Math.max(vertices.length, 1)) * Math.PI * 2;
    positions[String(vertex)] = {
      x: 360 + Math.cos(angle) * 130,
      y: 210 + Math.sin(angle) * 130,
    };
  });
  return positions;
}

function edgeKeys(graph, edges) {
  return edges.map((edge) => {
    const actual = graph.edgeList().find((item) => (
      (String(item.from) === String(edge.from) && String(item.to) === String(edge.to))
      || (String(item.from) === String(edge.to) && String(item.to) === String(edge.from))
    ));
    return actual ? `${String(actual.from)}->${String(actual.to)}` : `${String(edge.from)}->${String(edge.to)}`;
  });
}

function MinimumSpanningTreePage() {
  const metadata = dataStructureMetadata.minimumSpanningTree;
  const [algorithm, setAlgorithm] = useState("prim");
  const [directed, setDirected] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [graph, setGraph] = useState(() => buildSampleGraph());
  const [startVertex, setStartVertex] = useState("A");
  const [selectedPractice, setSelectedPractice] = useState(mstPracticeSets[0]);
  const [steps, setSteps] = useState(() => new PrimAlgorithm(buildSampleGraph(), "A").run());
  const [playbackIndex, setPlaybackIndex] = useState(0);

  const activeStep = steps[playbackIndex] ?? steps[0] ?? null;
  const positions = useMemo(() => layoutVertices(graph.vertices), [graph.vertices]);
  const finalResult = steps.at(-1)?.result;
  const code = algorithm === "prim" ? mstCode.primCode : mstCode.kruskalCode;
  const explanation = algorithm === "prim" ? mstCode.primExplanation : mstCode.kruskalExplanation;
  const selectedEdgeKeys = edgeKeys(graph, activeStep?.selectedEdges ?? []);
  const rejectedEdgeKeys = edgeKeys(graph, activeStep?.rejectedEdges ?? []);
  const candidateKeys = edgeKeys(graph, activeStep?.currentEdge ? [activeStep.currentEdge] : []);
  const visited = activeStep?.visited ?? [];

  const runAlgorithm = (nextGraph = graph, nextAlgorithm = algorithm, nextStart = startVertex) => {
    const nextSteps = nextAlgorithm === "prim"
      ? new PrimAlgorithm(nextGraph, nextStart).run()
      : new KruskalAlgorithm(nextGraph).run();
    setSteps(nextSteps);
    setPlaybackIndex(0);
  };

  const loadGraph = (nextDirected = directed, nextDisconnected = disconnected) => {
    const nextGraph = buildSampleGraph(nextDirected, nextDisconnected);
    setDirected(nextDirected);
    setDisconnected(nextDisconnected);
    setGraph(nextGraph);
    setStartVertex("A");
    runAlgorithm(nextGraph, algorithm, "A");
  };

  const selectAlgorithm = (nextAlgorithm) => {
    setAlgorithm(nextAlgorithm);
    runAlgorithm(graph, nextAlgorithm);
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 5 · MINIMUM SPANNING TREE</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>ALGORITHM</label>
              <select value={algorithm} onChange={(event) => selectAlgorithm(event.target.value)}>
                <option value="prim">Prim&apos;s algorithm</option>
                <option value="kruskal">Kruskal&apos;s algorithm</option>
              </select>
            </div>
            <div>
              <label>GRAPH TYPE</label>
              <select value={directed ? "directed" : "undirected"} onChange={(event) => loadGraph(event.target.value === "directed", disconnected)}>
                <option value="undirected">Undirected</option>
                <option value="directed">Directed (rejected)</option>
              </select>
            </div>
            <div>
              <label>CONNECTIVITY</label>
              <select value={disconnected ? "disconnected" : "connected"} onChange={(event) => loadGraph(directed, event.target.value === "disconnected")}>
                <option value="connected">Connected sample</option>
                <option value="disconnected">Disconnected sample</option>
              </select>
            </div>
            {algorithm === "prim" && (
              <div>
                <label>START VERTEX</label>
                <select value={startVertex} onChange={(event) => {
                  setStartVertex(event.target.value);
                  runAlgorithm(graph, algorithm, event.target.value);
                }}>
                  {graph.vertices.map((vertex) => <option key={String(vertex)} value={String(vertex)}>{String(vertex)}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="action-grid">
            <button className="primary-btn" onClick={() => runAlgorithm()}>Run {algorithm === "prim" ? "Prim" : "Kruskal"}</button>
            <button className="secondary-btn" onClick={() => loadGraph(false, false)}>Reset example</button>
          </div>
          {finalResult?.reason && <div className="status-box">{finalResult.reason}</div>}
        </div>

        <div className="panel-card">
          <h3>Minimum spanning tree</h3>
          <p className="stack-demo-summary">
            An MST connects every vertex in a connected, weighted, undirected graph with minimum total edge weight and no cycles. Prim grows a tree from a start vertex; Kruskal adds globally light edges that join different components.
          </p>
          <p className="stack-demo-summary">
            On disconnected graphs, both algorithms return a minimum spanning forest—one minimum tree per connected component. Negative and zero weights are valid.
          </p>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>Weighted undirected graph</h3>
          <GraphVisualizer
            vertices={graph.vertices}
            positions={positions}
            edges={graph.edgeList()}
            selectedVertex={activeStep?.currentEdge?.from ?? null}
            highlightedVertices={activeStep?.activeVertices ?? []}
            highlightedEdges={candidateKeys}
            selectedEdges={selectedEdgeKeys}
            rejectedEdges={rejectedEdgeKeys}
          />
          <div className="info-grid compact-grid">
            <div className="info-card"><h4>Candidate edge</h4><p>{activeStep?.currentEdge ? `${String(activeStep.currentEdge.from)} — ${String(activeStep.currentEdge.to)} (${activeStep.currentEdge.weight})` : "None"}</p></div>
            <div className="info-card"><h4>Total weight</h4><p>{activeStep?.totalWeight ?? 0}</p></div>
            <div className="info-card"><h4>Visited vertices</h4><p>{visited.join(" → ") || "None"}</p></div>
          </div>
          <div className="result-box"><strong>Selected edges:</strong> {(activeStep?.selectedEdges ?? []).map((edge) => `${String(edge.from)}—${String(edge.to)} (${edge.weight})`).join(", ") || "None"}</div>
          <div className="result-box"><strong>Rejected edges:</strong> {(activeStep?.rejectedEdges ?? []).map((edge) => `${String(edge.from)}—${String(edge.to)} (${edge.weight})`).join(", ") || "None"}</div>
          {algorithm === "prim" && (
            <div className="result-box"><strong>Priority queue:</strong> {(activeStep?.priorityQueue ?? []).map((edge) => `${String(edge.from)}—${String(edge.to)} (${edge.weight})`).join(", ") || "Empty"}</div>
          )}
          {algorithm === "kruskal" && (
            <div className="result-box"><strong>Sorted edge list:</strong> {(activeStep?.sortedEdges ?? []).map((edge) => `${String(edge.from)}—${String(edge.to)} (${edge.weight})`).join(", ") || "Empty"}</div>
          )}
          <PlaybackPanel
            steps={steps}
            title={`${algorithm === "prim" ? "Prim" : "Kruskal"} playback`}
            speed={700}
            onStepChange={(nextStatus) => setPlaybackIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Minimum spanning forest result</h3>
          <div className="result-box"><strong>Status:</strong> {finalResult?.valid
            ? (finalResult.connected ? "Connected spanning tree" : "Disconnected minimum spanning forest")
            : (finalResult?.reason ?? "Pending")}</div>
          <div className="result-box"><strong>Total weight:</strong> {finalResult?.totalWeight ?? 0}</div>
          <div className="result-box"><strong>Components:</strong> {finalResult?.components?.map((component) => component.join(", ")).join(" | ") || "None"}</div>
          <div className="result-box"><strong>Isolated vertices:</strong> {finalResult?.isolatedVertices?.join(", ") || "None"}</div>
          <div className="result-box"><strong>Final edges:</strong> {finalResult?.edges?.map((edge) => `${edge.from}—${edge.to} (${edge.weight})`).join(", ") || "None"}</div>
          <div className="result-box"><strong>Current explanation:</strong> {activeStep?.explanation}</div>
          <div className="info-card"><h4>Real-world applications</h4><p>Network cabling, road and pipeline planning, circuit design, and connecting distributed locations at minimum construction cost.</p></div>
        </div>
      </div>

      <div className="info-grid">
        {mstComplexity.map((item) => <div key={item.title} className="info-card"><h4>{item.title}</h4><p>{item.description}</p></div>)}
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">PRACTICE</p><h2>MST challenges</h2></div></div>
        <div className="practice-list">
          {mstPracticeSets.map((problem) => (
            <button key={problem.title} className={`practice-item ${selectedPractice.title === problem.title ? "selected" : ""}`} onClick={() => setSelectedPractice(problem)}>
              <span>{problem.title}</span><small>{problem.difficulty}</small>
            </button>
          ))}
        </div>
        <CodeViewer title={selectedPractice.title} summary={selectedPractice.statement} code={selectedPractice.solution} explanation={`${selectedPractice.explanation} Complexity: ${selectedPractice.complexity}`} />
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">LEARN</p><h2>{algorithm === "prim" ? "Prim's algorithm" : "Kruskal's algorithm"}</h2></div></div>
        <div className="info-grid">
          <div className="info-card"><h4>Prim</h4><p>Choose the lightest frontier edge that adds a new vertex; restart at unvisited vertices to build a forest.</p></div>
          <div className="info-card"><h4>Kruskal</h4><p>Sort edges by weight, use Union-Find to detect cycles, and accept only edges joining separate components.</p></div>
          <div className="info-card"><h4>Union-Find</h4><p>Path compression and union by rank make each disjoint-set operation nearly constant amortized time.</p></div>
        </div>
        <CodeViewer title={`${algorithm === "prim" ? "Prim" : "Kruskal"} implementation`} summary={mstCode.summary} code={code} explanation={explanation} />
      </div>
    </section>
  );
}

export default MinimumSpanningTreePage;
