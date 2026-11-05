import { useMemo, useState } from "react";

import { TopologicalSortAlgorithm } from "../algorithms/graphs/topologicalSort";
import GraphVisualizer from "../components/visualizers/GraphVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { Graph } from "../data-structures/graphs/graph";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import {
  topologicalSortCode,
  topologicalSortComplexity,
  topologicalSortPracticeSets,
} from "../data/learningModules";

function buildSampleGraph(hasCycle = false) {
  const graph = new Graph({ directed: true, weighted: false });
  ["Plan", "Code", "Test", "Review", "Deploy", "Docs"].forEach((vertex) => graph.addVertex(vertex));
  const edges = [
    ["Plan", "Code"],
    ["Plan", "Docs"],
    ["Code", "Test"],
    ["Test", "Review"],
    ["Review", "Deploy"],
  ];
  if (hasCycle) {
    edges.push(["Deploy", "Code"]);
  }
  edges.forEach(([from, to]) => graph.addEdge(from, to));
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

function TopologicalSortPage() {
  const metadata = dataStructureMetadata.topologicalSort;
  const [mode, setMode] = useState("kahn");
  const [hasCycle, setHasCycle] = useState(false);
  const [graph, setGraph] = useState(() => buildSampleGraph());
  const [steps, setSteps] = useState(() => new TopologicalSortAlgorithm(buildSampleGraph()).run());
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [selectedPractice, setSelectedPractice] = useState(topologicalSortPracticeSets[0]);
  const [status, setStatus] = useState("Ready");

  const activeStep = steps[playbackIndex] ?? steps[0] ?? null;
  const positions = useMemo(() => layoutVertices(graph.vertices), [graph.vertices]);
  const finalResult = steps.at(-1)?.result;
  const codeExample = mode === "kahn"
    ? topologicalSortCode.kahnCode
    : topologicalSortCode.dfsCode;
  const codeExplanation = mode === "kahn"
    ? topologicalSortCode.kahnExplanation
    : topologicalSortCode.dfsExplanation;

  const runSort = (nextGraph = graph, nextMode = mode) => {
    const nextSteps = new TopologicalSortAlgorithm(nextGraph, nextMode).run();
    setSteps(nextSteps);
    setPlaybackIndex(0);
    const result = nextSteps.at(-1)?.result;
    setStatus(result?.valid
      ? "Topological ordering is valid."
      : (result?.reason ?? "Topological ordering failed."));
  };

  const loadGraph = (nextHasCycle) => {
    const nextGraph = buildSampleGraph(nextHasCycle);
    setHasCycle(nextHasCycle);
    setGraph(nextGraph);
    runSort(nextGraph);
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 5 · TOPOLOGICAL SORTING</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>ALGORITHM</label>
              <select value={mode} onChange={(event) => {
                const nextMode = event.target.value;
                setMode(nextMode);
                runSort(graph, nextMode);
              }}>
                <option value="kahn">Kahn&apos;s algorithm (queue)</option>
                <option value="dfs">DFS (reverse finishing order)</option>
              </select>
            </div>
            <div>
              <label>EXAMPLE GRAPH</label>
              <select
                value={hasCycle ? "cyclic" : "dag"}
                onChange={(event) => loadGraph(event.target.value === "cyclic")}
              >
                <option value="dag">Dependency DAG</option>
                <option value="cyclic">Directed cycle</option>
              </select>
            </div>
          </div>
          <div className="action-grid">
            <button className="primary-btn" onClick={() => runSort()}>Run sort</button>
            <button className="secondary-btn" onClick={() => loadGraph(false)}>Reset DAG example</button>
          </div>
          <div className="status-box">Status: {status}</div>
        </div>

        <div className="panel-card">
          <h3>What is topological sorting?</h3>
          <p className="stack-demo-summary">
            A topological ordering of a directed acyclic graph (DAG) places every vertex before all vertices it points to. It exists only when the graph has no directed cycle.
          </p>
          <p className="stack-demo-summary">
            Kahn&apos;s algorithm repeatedly removes a zero-in-degree vertex. DFS instead appends vertices after all outgoing neighbors finish, then reverses that finish order.
          </p>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>Directed dependency graph</h3>
          <GraphVisualizer
            vertices={graph.vertices}
            positions={positions}
            edges={graph.edgeList()}
            selectedVertex={activeStep?.currentVertex ?? null}
            highlightedVertices={activeStep?.activeVertices ?? []}
            highlightedEdges={activeStep?.activeEdges ?? []}
            directed
          />
          <div className="info-grid compact-grid">
            <div className="info-card">
              <h4>Detection</h4>
              <p>{activeStep?.detectionStatus ?? "Searching"}</p>
            </div>
            <div className="info-card">
              <h4>{mode === "kahn" ? "Current queue" : "Current recursion stack"}</h4>
              <p>{(mode === "kahn" ? activeStep?.queue : activeStep?.stack)?.join(" → ") || "Empty"}</p>
            </div>
            <div className="info-card">
              <h4>Topological ordering</h4>
              <p>{activeStep?.order?.join(" → ") || "Not complete"}</p>
            </div>
          </div>
          <PlaybackPanel
            steps={steps}
            title={`${mode === "kahn" ? "Kahn's algorithm" : "DFS"} playback`}
            speed={700}
            onStepChange={(nextStatus) => setPlaybackIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Algorithm state</h3>
          <div className="result-box"><strong>Current vertex:</strong> {activeStep?.currentVertex ?? "—"}</div>
          <div className="result-box"><strong>Processed:</strong> {activeStep?.processed?.join(" → ") || "None"}</div>
          {mode === "kahn" && (
            <div className="snapshot-grid">
              {graph.vertices.map((vertex) => (
                <div key={String(vertex)} className="snapshot-box">
                  <strong>{String(vertex)}</strong>
                  <span>In-degree: {activeStep?.inDegrees?.[String(vertex)] ?? 0}</span>
                </div>
              ))}
            </div>
          )}
          {mode === "dfs" && (
            <div className="result-box"><strong>Recursion stack:</strong> {activeStep?.stack?.join(" → ") || "Empty"}</div>
          )}
          <div className="result-box"><strong>Explanation:</strong> {activeStep?.explanation}</div>
          <div className="result-box">
            <strong>Final result:</strong> {finalResult?.valid
              ? (finalResult.order.length ? finalResult.order.join(" → ") : "Valid empty ordering")
              : (finalResult?.reason ?? "Pending")}
          </div>
          {finalResult && !finalResult.valid && finalResult.cycle.length > 0 && (
            <div className="result-box"><strong>Cycle:</strong> {finalResult.cycle.join(" → ")}</div>
          )}
        </div>
      </div>

      <div className="info-grid">
        {topologicalSortComplexity.map((item) => (
          <div key={item.title} className="info-card">
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <div className="collection-panel">
        <div className="section-heading compact">
          <div><p className="eyebrow">PRACTICE</p><h2>Topological sort challenges</h2></div>
        </div>
        <div className="practice-list">
          {topologicalSortPracticeSets.map((problem) => (
            <button
              key={problem.title}
              className={`practice-item ${selectedPractice.title === problem.title ? "selected" : ""}`}
              onClick={() => setSelectedPractice(problem)}
            >
              <span>{problem.title}</span><small>{problem.difficulty}</small>
            </button>
          ))}
        </div>
        <CodeViewer
          title={selectedPractice.title}
          summary={selectedPractice.statement}
          code={selectedPractice.solution}
          explanation={`${selectedPractice.explanation} Complexity: ${selectedPractice.complexity}`}
        />
      </div>

      <div className="collection-panel">
        <div className="section-heading compact">
          <div><p className="eyebrow">LEARN</p><h2>{mode === "kahn" ? "Kahn's algorithm" : "DFS-based ordering"}</h2></div>
        </div>
        <div className="info-grid">
          <div className="info-card"><h4>Dependencies</h4><p>Model tasks as vertices and prerequisite relationships as directed edges. A topological ordering gives a valid execution sequence.</p></div>
          <div className="info-card"><h4>Multiple valid orders</h4><p>When several vertices are ready at once, different queue/tie-breaking choices can produce different valid orders.</p></div>
          <div className="info-card"><h4>Cycle rule</h4><p>If a directed cycle exists, no valid topological order exists. A partial processing sequence is never returned as a valid result.</p></div>
        </div>
        <CodeViewer
          title={mode === "kahn" ? "Kahn's topological sort" : "DFS topological sort"}
          summary={topologicalSortCode.summary}
          code={codeExample}
          explanation={codeExplanation}
        />
      </div>
    </section>
  );
}

export default TopologicalSortPage;
