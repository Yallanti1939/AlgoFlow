import { useMemo, useState } from "react";

import { DijkstraAlgorithm } from "../algorithms/graphs/dijkstra";
import GraphVisualizer from "../components/visualizers/GraphVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { Graph } from "../data-structures/graphs/graph";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { dijkstraCode, dijkstraComplexity, dijkstraPracticeSets } from "../data/learningModules";

function buildSampleGraph(directed = false) {
  const graph = new Graph({ directed, weighted: true });
  ["A", "B", "C", "D", "E", "F"].forEach((vertex) => graph.addVertex(vertex));
  [
    ["A", "B", 4],
    ["A", "C", 2],
    ["C", "B", 1],
    ["B", "D", 5],
    ["C", "D", 8],
    ["C", "E", 10],
    ["D", "E", 2],
  ].forEach(([from, to, weight]) => graph.addEdge(from, to, weight));
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
  return distance === Infinity ? "∞" : distance;
}

function pathEdgeKeys(graph, path) {
  const edges = graph.edgeList();
  return path.slice(0, -1).map((vertex, index) => {
    const next = path[index + 1];
    const edge = edges.find((item) => (
      (String(item.from) === vertex && String(item.to) === next)
      || (!graph.directed && String(item.from) === next && String(item.to) === vertex)
    ));
    return edge ? `${String(edge.from)}->${String(edge.to)}` : `${vertex}->${next}`;
  });
}

function DijkstraPage() {
  const metadata = dataStructureMetadata.dijkstra;
  const [directed, setDirected] = useState(false);
  const [graph, setGraph] = useState(() => buildSampleGraph());
  const [source, setSource] = useState("A");
  const [target, setTarget] = useState("E");
  const [selectedPractice, setSelectedPractice] = useState(dijkstraPracticeSets[0]);
  const [steps, setSteps] = useState(() => new DijkstraAlgorithm(buildSampleGraph(), "A").run());
  const [playbackIndex, setPlaybackIndex] = useState(0);

  const activeStep = steps[playbackIndex] ?? steps[0] ?? null;
  const positions = useMemo(() => layoutVertices(graph.vertices), [graph.vertices]);
  const finalResult = steps.at(-1)?.result;
  const path = [];
  if (finalResult?.valid && finalResult.distances[String(target)] !== Infinity) {
    let current = String(target);
    const seen = new Set();
    while (current !== null && current !== undefined && !seen.has(current)) {
      seen.add(current);
      path.unshift(current);
      current = finalResult.parents[current];
    }
    if (path[0] !== String(source)) {
      path.length = 0;
    }
  }

  const runDijkstra = (nextGraph = graph, nextSource = source) => {
    const nextSteps = new DijkstraAlgorithm(nextGraph, nextSource).run();
    setSteps(nextSteps);
    setPlaybackIndex(0);
  };

  const loadGraph = (nextDirected) => {
    const nextGraph = buildSampleGraph(nextDirected);
    setDirected(nextDirected);
    setGraph(nextGraph);
    setSource("A");
    setTarget("E");
    runDijkstra(nextGraph, "A");
  };

  const distances = activeStep?.distances ?? {};
  const parents = activeStep?.parents ?? {};
  const highlightedPathEdges = pathEdgeKeys(graph, path);
  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 5 · DIJKSTRA</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>GRAPH TYPE</label>
              <select value={directed ? "directed" : "undirected"} onChange={(event) => loadGraph(event.target.value === "directed")}>
                <option value="undirected">Undirected</option>
                <option value="directed">Directed</option>
              </select>
            </div>
            <div>
              <label>SOURCE</label>
              <select value={source} onChange={(event) => {
                setSource(event.target.value);
                runDijkstra(graph, event.target.value);
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
            <button className="primary-btn" onClick={() => runDijkstra()}>Run Dijkstra</button>
            <button className="secondary-btn" onClick={() => loadGraph(directed)}>Reset example</button>
          </div>
          {finalResult?.reason && <div className="status-box">{finalResult.reason}</div>}
        </div>

        <div className="panel-card">
          <h3>Greedy shortest paths</h3>
          <p className="stack-demo-summary">
            Dijkstra repeatedly finalizes the reachable vertex with the smallest tentative distance, then relaxes its outgoing edges. A min-priority queue efficiently selects the next vertex.
          </p>
          <p className="stack-demo-summary">
            Edge weights must be finite and non-negative. A negative edge invalidates Dijkstra&apos;s greedy finalization, so the algorithm explicitly rejects such input.
          </p>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>Weighted graph</h3>
          <GraphVisualizer
            vertices={graph.vertices}
            positions={positions}
            edges={graph.edgeList()}
            selectedVertex={activeStep?.currentVertex ?? null}
            highlightedVertices={[...(activeStep?.activeVertices ?? []), ...path]}
            highlightedEdges={[...(activeStep?.activeEdges ?? []), ...highlightedPathEdges]}
            directed={graph.directed}
          />
          <div className="info-grid compact-grid">
            <div className="info-card"><h4>Priority queue</h4><p>{activeStep?.priorityQueue?.map(({ vertex, distance }) => `${vertex}(${distance})`).join(" → ") || "Empty"}</p></div>
            <div className="info-card"><h4>Finalized</h4><p>{activeStep?.finalized?.join(" → ") || "None"}</p></div>
            <div className="info-card"><h4>Current step</h4><p>{activeStep?.label ?? "No step"}</p></div>
          </div>
          <PlaybackPanel
            steps={steps}
            title="Dijkstra playback"
            speed={700}
            onStepChange={(nextStatus) => setPlaybackIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Shortest-path state</h3>
          <div className="snapshot-grid">
            {graph.vertices.map((vertex) => {
              const vertexKey = String(vertex);
              return (
                <div key={vertexKey} className="snapshot-box">
                  <strong>{vertexKey}</strong>
                  <span>Distance: {showDistance(distances[vertexKey] ?? Infinity)}</span>
                  <span>Parent: {parents[vertexKey] ?? "—"}</span>
                  <span>{activeStep?.finalized?.includes(vertexKey) ? "Finalized" : "Tentative"}</span>
                </div>
              );
            })}
          </div>
          <div className="result-box"><strong>Target path:</strong> {path.length ? path.join(" → ") : (finalResult?.valid ? "Unreachable" : "Unavailable")}</div>
          <div className="result-box"><strong>Path distance:</strong> {path.length ? showDistance(finalResult.distances[String(target)]) : "—"}</div>
          <div className="result-box"><strong>Explanation:</strong> {activeStep?.explanation}</div>
        </div>
      </div>

      <div className="info-grid">
        {dijkstraComplexity.map((item) => <div key={item.title} className="info-card"><h4>{item.title}</h4><p>{item.description}</p></div>)}
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">PRACTICE</p><h2>Dijkstra challenges</h2></div></div>
        <div className="practice-list">
          {dijkstraPracticeSets.map((problem) => (
            <button key={problem.title} className={`practice-item ${selectedPractice.title === problem.title ? "selected" : ""}`} onClick={() => setSelectedPractice(problem)}>
              <span>{problem.title}</span><small>{problem.difficulty}</small>
            </button>
          ))}
        </div>
        <CodeViewer title={selectedPractice.title} summary={selectedPractice.statement} code={selectedPractice.solution} explanation={`${selectedPractice.explanation} Complexity: ${selectedPractice.complexity}`} />
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">LEARN</p><h2>Dijkstra&apos;s algorithm</h2></div></div>
        <div className="info-grid">
          <div className="info-card"><h4>Relaxation</h4><p>For an edge u→v, compare dist[u] + weight(u,v) with the current dist[v]. If smaller, update v&apos;s tentative distance and parent.</p></div>
          <div className="info-card"><h4>Applications</h4><p>Route planning, network routing, robot navigation, and any non-negative weighted shortest-path problem.</p></div>
          <div className="info-card"><h4>Unreachable vertices</h4><p>Vertices left at infinity have no path from the selected source. Path reconstruction returns an empty path for them.</p></div>
        </div>
        <CodeViewer title="Dijkstra implementation" summary={dijkstraCode.summary} code={dijkstraCode.code} explanation={dijkstraCode.explanation} />
      </div>
    </section>
  );
}

export default DijkstraPage;
