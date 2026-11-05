import { useMemo, useState } from "react";

import { FloydWarshallAlgorithm } from "../algorithms/graphs/floydWarshall";
import GraphVisualizer from "../components/visualizers/GraphVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { Graph } from "../data-structures/graphs/graph";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { floydWarshallCode, floydWarshallComplexity, floydWarshallPracticeSets } from "../data/learningModules";

function buildSampleGraph(hasNegativeCycle = false) {
  const graph = new Graph({ directed: true, weighted: true });
  ["A", "B", "C", "D"].forEach((vertex) => graph.addVertex(vertex));
  [
    ["A", "B", 3],
    ["A", "C", 10],
    ["B", "C", -2],
    ["C", "D", 4],
  ].forEach(([from, to, weight]) => graph.addEdge(from, to, weight));
  if (hasNegativeCycle) {
    graph.addEdge("D", "B", -4);
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
  if (distance === -Infinity) return "−∞";
  return distance;
}

function reconstructPath(result, vertices, fromVertex, toVertex) {
  if (!result?.valid) return [];
  const from = vertices.findIndex((vertex) => String(vertex) === fromVertex);
  const to = vertices.findIndex((vertex) => String(vertex) === toVertex);
  if (from < 0 || to < 0 || result.distances[from][to] === Infinity
    || result.distances[from][to] === -Infinity) {
    return [];
  }
  if (from === to) return [String(vertices[from])];

  const path = [String(vertices[from])];
  let current = from;
  for (let count = 0; current !== to && count < vertices.length; count += 1) {
    current = result.nextHop[current][to];
    if (current === null || current === undefined || current < 0) return [];
    path.push(String(vertices[current]));
  }
  return current === to ? path : [];
}

function FloydWarshallPage() {
  const metadata = dataStructureMetadata.floydWarshall;
  const [hasNegativeCycle, setHasNegativeCycle] = useState(false);
  const [graph, setGraph] = useState(() => buildSampleGraph());
  const [source, setSource] = useState("A");
  const [target, setTarget] = useState("D");
  const [selectedPractice, setSelectedPractice] = useState(floydWarshallPracticeSets[0]);
  const [steps, setSteps] = useState(() => new FloydWarshallAlgorithm(buildSampleGraph()).run());
  const [playbackIndex, setPlaybackIndex] = useState(0);

  const activeStep = steps[playbackIndex] ?? steps[0] ?? null;
  const positions = useMemo(() => layoutVertices(graph.vertices), [graph.vertices]);
  const finalResult = steps.at(-1)?.result;
  const sourceIndex = graph.vertices.findIndex((vertex) => String(vertex) === source);
  const targetIndex = graph.vertices.findIndex((vertex) => String(vertex) === target);
  const path = reconstructPath(finalResult, graph.vertices, source, target);
  const highlightedPathEdges = path.slice(0, -1).map((vertex, index) => `${vertex}->${path[index + 1]}`);
  const matrix = activeStep?.distances ?? [];
  const matrixVertices = activeStep?.vertices ?? [];

  const runAlgorithm = (nextGraph = graph) => {
    const nextSteps = new FloydWarshallAlgorithm(nextGraph).run();
    setSteps(nextSteps);
    setPlaybackIndex(0);
  };

  const loadGraph = (nextHasCycle) => {
    const nextGraph = buildSampleGraph(nextHasCycle);
    setHasNegativeCycle(nextHasCycle);
    setGraph(nextGraph);
    setSource("A");
    setTarget("D");
    runAlgorithm(nextGraph);
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 5 · FLOYD–WARSHALL</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>EXAMPLE GRAPH</label>
              <select value={hasNegativeCycle ? "cycle" : "dag"} onChange={(event) => loadGraph(event.target.value === "cycle")}>
                <option value="dag">Negative edge, no negative cycle</option>
                <option value="cycle">Negative cycle</option>
              </select>
            </div>
            <div>
              <label>PATH SOURCE</label>
              <select value={source} onChange={(event) => setSource(event.target.value)}>
                {graph.vertices.map((vertex) => <option key={String(vertex)} value={String(vertex)}>{String(vertex)}</option>)}
              </select>
            </div>
            <div>
              <label>PATH DESTINATION</label>
              <select value={target} onChange={(event) => setTarget(event.target.value)}>
                {graph.vertices.map((vertex) => <option key={String(vertex)} value={String(vertex)}>{String(vertex)}</option>)}
              </select>
            </div>
          </div>
          <div className="action-grid">
            <button className="primary-btn" onClick={() => runAlgorithm()}>Run Floyd–Warshall</button>
            <button className="secondary-btn" onClick={() => loadGraph(false)}>Reset example</button>
          </div>
        </div>

        <div className="panel-card">
          <h3>All-pairs shortest paths</h3>
          <p className="stack-demo-summary">
            Floyd–Warshall tests every vertex k as a possible intermediate point for each source-destination pair (i, j), updating the matrix whenever i→k→j is shorter.
          </p>
          <p className="stack-demo-summary">
            It supports negative edges. A negative diagonal entry indicates a negative cycle; pairs that can pass through that cycle have undefined distances.
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
            selectedVertex={activeStep?.source ?? activeStep?.currentVertex ?? null}
            highlightedVertices={[...(activeStep?.activeVertices ?? []), ...path]}
            highlightedEdges={[...(activeStep?.activeEdges ?? []), ...highlightedPathEdges]}
            directed
          />
          <div className="info-grid compact-grid">
            <div className="info-card"><h4>Intermediate k</h4><p>{activeStep?.intermediate ?? "—"}</p></div>
            <div className="info-card"><h4>Current pair (i, j)</h4><p>{activeStep?.source && activeStep?.destination ? `${activeStep.source}, ${activeStep.destination}` : "—"}</p></div>
            <div className="info-card"><h4>Cell update</h4><p>{activeStep?.beforeValue === null ? "—" : `${showDistance(activeStep.beforeValue)} → ${showDistance(activeStep.afterValue)}`}</p></div>
          </div>
          <PlaybackPanel
            steps={steps}
            title="Floyd–Warshall playback"
            speed={700}
            onStepChange={(nextStatus) => setPlaybackIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Distance matrix</h3>
          {matrix.length === 0 ? (
            <p className="subtitle">No vertices in the graph.</p>
          ) : (
            <div className="floyd-matrix-scroll">
              <table className="floyd-matrix">
                <thead>
                  <tr>
                    <th>From \ To</th>
                    {matrixVertices.map((vertex) => <th key={`head-${vertex}`}>{vertex}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, rowIndex) => (
                    <tr key={matrixVertices[rowIndex]}>
                      <th>{matrixVertices[rowIndex]}</th>
                      {row.map((distance, columnIndex) => {
                        const active = activeStep?.matrixCell?.row === matrixVertices[rowIndex]
                          && activeStep?.matrixCell?.column === matrixVertices[columnIndex];
                        return (
                          <td key={`${rowIndex}-${columnIndex}`} className={active ? "active-cell" : ""}>
                            {showDistance(distance)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="result-box"><strong>Path {source} → {target}:</strong> {path.length ? path.join(" → ") : (finalResult?.distances?.[sourceIndex]?.[targetIndex] === -Infinity ? "Undefined due to negative cycle" : "No path")}</div>
          <div className="result-box"><strong>Negative-cycle status:</strong> {finalResult?.hasNegativeCycle ? `Detected at ${finalResult.negativeCycleVertices.join(", ")}` : "No negative cycle detected"}</div>
          <div className="result-box"><strong>Explanation:</strong> {activeStep?.explanation}</div>
        </div>
      </div>

      <div className="info-grid">
        {floydWarshallComplexity.map((item) => <div key={item.title} className="info-card"><h4>{item.title}</h4><p>{item.description}</p></div>)}
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">PRACTICE</p><h2>Floyd–Warshall challenges</h2></div></div>
        <div className="practice-list">
          {floydWarshallPracticeSets.map((problem) => (
            <button key={problem.title} className={`practice-item ${selectedPractice.title === problem.title ? "selected" : ""}`} onClick={() => setSelectedPractice(problem)}>
              <span>{problem.title}</span><small>{problem.difficulty}</small>
            </button>
          ))}
        </div>
        <CodeViewer title={selectedPractice.title} summary={selectedPractice.statement} code={selectedPractice.solution} explanation={`${selectedPractice.explanation} Complexity: ${selectedPractice.complexity}`} />
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">LEARN</p><h2>Floyd–Warshall algorithm</h2></div></div>
        <div className="info-grid">
          <div className="info-card"><h4>Dynamic programming</h4><p>Each k iteration allows one more vertex as an intermediate. The recurrence compares the current route with a route split through k.</p></div>
          <div className="info-card"><h4>Path reconstruction</h4><p>The next-hop matrix records the first vertex to visit after the source on the best known route.</p></div>
          <div className="info-card"><h4>Applications</h4><p>All-pairs routing, transitive reachability extensions, and dense graphs where every pairwise distance is needed.</p></div>
        </div>
        <CodeViewer title="Floyd–Warshall implementation" summary={floydWarshallCode.summary} code={floydWarshallCode.code} explanation={floydWarshallCode.explanation} />
      </div>
    </section>
  );
}

export default FloydWarshallPage;
