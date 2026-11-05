import { useMemo, useState } from "react";

import { BellmanFordAlgorithm } from "../algorithms/graphs/bellmanFord";
import GraphVisualizer from "../components/visualizers/GraphVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { Graph } from "../data-structures/graphs/graph";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { bellmanFordCode, bellmanFordComplexity, bellmanFordPracticeSets } from "../data/learningModules";

function buildSampleGraph(hasCycle = false) {
  const graph = new Graph({ directed: true, weighted: true });
  ["A", "B", "C", "D", "E", "F"].forEach((vertex) => graph.addVertex(vertex));
  [
    ["A", "B", 4],
    ["A", "C", 5],
    ["C", "B", -2],
    ["B", "D", 4],
    ["C", "D", 6],
    ["D", "E", 1],
  ].forEach(([from, to, weight]) => graph.addEdge(from, to, weight));
  if (hasCycle) {
    graph.addEdge("E", "C", -5);
  }
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

function showDistance(distance) {
  if (distance === Infinity) return "∞";
  if (distance === -Infinity) return "−∞ (undefined)";
  return distance;
}

function BellmanFordPage() {
  const metadata = dataStructureMetadata.bellmanFord;
  const [hasCycle, setHasCycle] = useState(false);
  const [graph, setGraph] = useState(() => buildSampleGraph());
  const [source, setSource] = useState("A");
  const [target, setTarget] = useState("E");
  const [selectedPractice, setSelectedPractice] = useState(bellmanFordPracticeSets[0]);
  const [steps, setSteps] = useState(() => new BellmanFordAlgorithm(buildSampleGraph(), "A").run());
  const [playbackIndex, setPlaybackIndex] = useState(0);

  const activeStep = steps[playbackIndex] ?? steps[0] ?? null;
  const positions = useMemo(() => layoutVertices(graph.vertices), [graph.vertices]);
  const finalResult = steps.at(-1)?.result;
  const distances = activeStep?.distances ?? {};
  const parents = activeStep?.parents ?? {};
  const path = [];
  if (finalResult && finalResult.distances[String(target)] !== Infinity
    && finalResult.distances[String(target)] !== -Infinity) {
    let current = String(target);
    const seen = new Set();
    while (current !== null && current !== undefined && !seen.has(current)) {
      seen.add(current);
      path.unshift(current);
      current = finalResult.parents[current];
    }
    if (path[0] !== String(source)) path.length = 0;
  }
  const highlightedPathEdges = path.slice(0, -1).map((vertex, index) => `${vertex}->${path[index + 1]}`);
  const negativeCycleEdges = (finalResult?.negativeCycle ?? [])
    .slice(0, -1)
    .map((vertex, index) => `${vertex}->${finalResult.negativeCycle[index + 1]}`);

  const runAlgorithm = (nextGraph = graph, nextSource = source) => {
    const nextSteps = new BellmanFordAlgorithm(nextGraph, nextSource).run();
    setSteps(nextSteps);
    setPlaybackIndex(0);
  };

  const loadGraph = (nextHasCycle) => {
    const nextGraph = buildSampleGraph(nextHasCycle);
    setHasCycle(nextHasCycle);
    setGraph(nextGraph);
    setSource("A");
    setTarget("E");
    runAlgorithm(nextGraph, "A");
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 5 · BELLMAN–FORD</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>EXAMPLE GRAPH</label>
              <select value={hasCycle ? "cycle" : "dag"} onChange={(event) => loadGraph(event.target.value === "cycle")}>
                <option value="dag">Negative edge, no cycle</option>
                <option value="cycle">Reachable negative cycle</option>
              </select>
            </div>
            <div>
              <label>SOURCE</label>
              <select value={source} onChange={(event) => {
                setSource(event.target.value);
                runAlgorithm(graph, event.target.value);
              }}>
                {graph.vertices.map((vertex) => <option key={String(vertex)} value={String(vertex)}>{String(vertex)}</option>)}
              </select>
            </div>
            <div>
              <label>TARGET</label>
              <select value={target} onChange={(event) => setTarget(event.target.value)}>
                {graph.vertices.map((vertex) => <option key={String(vertex)} value={String(vertex)}>{String(vertex)}</option>)}
              </select>
            </div>
          </div>
          <div className="action-grid">
            <button className="primary-btn" onClick={() => runAlgorithm()}>Run Bellman–Ford</button>
            <button className="secondary-btn" onClick={() => loadGraph(false)}>Reset example</button>
          </div>
        </div>

        <div className="panel-card">
          <h3>Relax every edge</h3>
          <p className="stack-demo-summary">
            Bellman–Ford makes up to V−1 passes over all edges. Each pass propagates shortest paths with one more edge; if a pass makes no changes, it stops early.
          </p>
          <p className="stack-demo-summary">
            A further check detects only negative cycles reachable from the source. Vertices reachable from such a cycle have undefined shortest distances, shown as −∞ (undefined).
          </p>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>Weighted directed graph</h3>
          <GraphVisualizer
            vertices={graph.vertices}
            positions={positions}
            edges={graph.edgeList()}
            selectedVertex={activeStep?.currentEdge?.from ?? activeStep?.currentVertex ?? null}
            highlightedVertices={[...(activeStep?.activeVertices ?? []), ...path, ...(finalResult?.negativeCycle ?? [])]}
            highlightedEdges={[...(activeStep?.activeEdges ?? []), ...highlightedPathEdges, ...negativeCycleEdges]}
            directed
          />
          <div className="info-grid compact-grid">
            <div className="info-card"><h4>Pass</h4><p>{activeStep?.pass ?? "—"} / {Math.max(graph.vertices.length - 1, 0)}</p></div>
            <div className="info-card"><h4>Active edge</h4><p>{activeStep?.currentEdge ? `${activeStep.currentEdge.from} → ${activeStep.currentEdge.to} (${activeStep.currentEdge.weight})` : "None"}</p></div>
            <div className="info-card"><h4>Negative-cycle status</h4><p>{activeStep?.negativeCycleStatus ?? "Not checked"}</p></div>
          </div>
          <PlaybackPanel
            steps={steps}
            title="Bellman–Ford playback"
            speed={700}
            onStepChange={(nextStatus) => setPlaybackIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Distance table</h3>
          <div className="snapshot-grid">
            {graph.vertices.map((vertex) => {
              const vertexKey = String(vertex);
              const affected = activeStep?.affectedByNegativeCycle?.includes(vertexKey);
              return (
                <div key={vertexKey} className="snapshot-box">
                  <strong>{vertexKey}</strong>
                  <span>Distance: {showDistance(distances[vertexKey] ?? Infinity)}</span>
                  <span>Parent: {parents[vertexKey] ?? "—"}</span>
                  {affected && <span>Affected by reachable negative cycle</span>}
                </div>
              );
            })}
          </div>
          <div className="result-box"><strong>Target path:</strong> {path.length ? path.join(" → ") : (finalResult?.distances?.[String(target)] === -Infinity ? "Undefined: reachable negative cycle" : "Unreachable or unavailable")}</div>
          <div className="result-box"><strong>Explanation:</strong> {activeStep?.explanation}</div>
          {finalResult?.negativeCycleDetected && (
            <div className="result-box">
              <strong>Negative cycle:</strong> {finalResult.negativeCycle.join(" → ") || "Detected; cycle reconstruction unavailable"}.
              Affected vertices: {finalResult.affectedByNegativeCycle.join(", ")}.
            </div>
          )}
        </div>
      </div>

      <div className="info-grid">
        {bellmanFordComplexity.map((item) => <div key={item.title} className="info-card"><h4>{item.title}</h4><p>{item.description}</p></div>)}
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">PRACTICE</p><h2>Bellman–Ford challenges</h2></div></div>
        <div className="practice-list">
          {bellmanFordPracticeSets.map((problem) => (
            <button key={problem.title} className={`practice-item ${selectedPractice.title === problem.title ? "selected" : ""}`} onClick={() => setSelectedPractice(problem)}>
              <span>{problem.title}</span><small>{problem.difficulty}</small>
            </button>
          ))}
        </div>
        <CodeViewer title={selectedPractice.title} summary={selectedPractice.statement} code={selectedPractice.solution} explanation={`${selectedPractice.explanation} Complexity: ${selectedPractice.complexity}`} />
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">LEARN</p><h2>Bellman–Ford algorithm</h2></div></div>
        <div className="info-grid">
          <div className="info-card"><h4>Negative edges</h4><p>Unlike Dijkstra, Bellman–Ford supports finite negative edge weights because it repeatedly relaxes every edge.</p></div>
          <div className="info-card"><h4>Reachable cycles</h4><p>A reachable negative cycle can reduce a route indefinitely. Its downstream vertices have no finite shortest distance.</p></div>
          <div className="info-card"><h4>Disconnected cycles</h4><p>Edges from vertices at infinity cannot relax a path; a negative cycle outside the source-reachable region does not invalidate source distances.</p></div>
        </div>
        <CodeViewer title="Bellman–Ford implementation" summary={bellmanFordCode.summary} code={bellmanFordCode.code} explanation={bellmanFordCode.explanation} />
      </div>
    </section>
  );
}

export default BellmanFordPage;
