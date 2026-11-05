import { useMemo, useState } from "react";

import { DFSAlgorithm } from "../algorithms/graphs/dfs";
import GraphVisualizer from "../components/visualizers/GraphVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { Graph } from "../data-structures/graphs/graph";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import {
  dfsCode,
  dfsComplexity,
  dfsIterativeCode,
  dfsPracticeSets,
} from "../data/learningModules";

function buildSampleGraph(graphType = "undirected") {
  const graph = new Graph({ directed: graphType === "directed", weighted: false });
  ["A", "B", "C", "D", "E", "F"].forEach((vertex) => graph.addVertex(vertex));
  [
    ["A", "B"],
    ["A", "C"],
    ["B", "D"],
    ["B", "E"],
    ["C", "F"],
    ["E", "F"],
  ].forEach(([from, to]) => graph.addEdge(from, to));
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

function DFSPage() {
  const metadata = dataStructureMetadata.dfs;
  const [graphType, setGraphType] = useState("undirected");
  const [graph, setGraph] = useState(() => buildSampleGraph());
  const [startVertex, setStartVertex] = useState("A");
  const [mode, setMode] = useState("recursive");
  const [selectedPractice, setSelectedPractice] = useState(dfsPracticeSets[0]);
  const [steps, setSteps] = useState(() => new DFSAlgorithm(buildSampleGraph(), "A").run());
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [status, setStatus] = useState("Ready");

  const activeStep = steps[playbackIndex] ?? steps[0] ?? null;
  const positions = useMemo(() => layoutVertices(graph.vertices), [graph.vertices]);
  const finalResult = steps.at(-1)?.result;

  const runDFS = (nextGraph = graph, nextStart = startVertex, nextMode = mode) => {
    const traversal = new DFSAlgorithm(nextGraph, String(nextStart).trim(), nextMode).run();
    setSteps(traversal);
    setPlaybackIndex(0);
    setStatus(traversal[0]?.label === "Invalid start vertex"
      ? `Vertex ${String(nextStart).trim()} is not in the graph.`
      : `Running ${nextMode} DFS from ${String(nextStart).trim()}.`);
  };

  const handleGraphType = (nextType) => {
    const nextGraph = buildSampleGraph(nextType);
    setGraphType(nextType);
    setGraph(nextGraph);
    setStartVertex("A");
    runDFS(nextGraph, "A", mode);
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 5 · DFS</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>GRAPH TYPE</label>
              <select value={graphType} onChange={(event) => handleGraphType(event.target.value)}>
                <option value="undirected">Undirected</option>
                <option value="directed">Directed</option>
              </select>
            </div>
            <div>
              <label>DFS APPROACH</label>
              <select value={mode} onChange={(event) => {
                const nextMode = event.target.value;
                setMode(nextMode);
                runDFS(graph, startVertex, nextMode);
              }}>
                <option value="recursive">Recursive</option>
                <option value="iterative">Iterative (explicit stack)</option>
              </select>
            </div>
            <div>
              <label>START VERTEX</label>
              <input value={startVertex} onChange={(event) => setStartVertex(event.target.value)} />
            </div>
          </div>
          <div className="action-grid">
            <button className="primary-btn" onClick={() => runDFS()}>Run DFS</button>
            <button className="secondary-btn" onClick={() => {
              const nextGraph = buildSampleGraph(graphType);
              setGraph(nextGraph);
              setStartVertex("A");
              runDFS(nextGraph, "A", mode);
              setStatus("Reset DFS example.");
            }}>Reset example</button>
          </div>
          <div className="status-box">Status: {status}</div>
        </div>

        <div className="panel-card">
          <h3>Depth-first search</h3>
          <p className="stack-demo-summary">
            DFS follows one path as far as possible before backtracking. The recursive version uses the call stack; the iterative version models that stack explicitly.
          </p>
          <p className="stack-demo-summary">
            Traversal starts at the selected vertex and visits only vertices reachable by following outgoing edges. Disconnected vertices are reported as unreachable.
          </p>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>Graph traversal</h3>
          <GraphVisualizer
            vertices={graph.vertices}
            positions={positions}
            edges={graph.edgeList()}
            selectedVertex={activeStep?.currentVertex ?? null}
            highlightedVertices={activeStep?.activeVertices ?? []}
            highlightedEdges={activeStep?.activeEdges ?? []}
            directed={graph.directed}
          />
          <div className="info-grid compact-grid">
            <div className="info-card">
              <h4>Traversal order</h4>
              <p>{(finalResult?.order ?? []).join(" → ") || "No traversal yet"}</p>
            </div>
            <div className="info-card">
              <h4>{mode === "recursive" ? "Recursion depth" : "Stack"}</h4>
              <p>{mode === "recursive"
                ? (activeStep?.recursionDepth ?? "—")
                : (activeStep?.stack?.join(" → ") || "Empty")}</p>
            </div>
            <div className="info-card">
              <h4>Current step</h4>
              <p>{activeStep?.label ?? "No step"}</p>
            </div>
          </div>
          <PlaybackPanel
            steps={steps}
            title={`${mode === "recursive" ? "Recursive" : "Iterative"} DFS playback`}
            speed={700}
            onStepChange={(nextStatus) => setPlaybackIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Traversal state</h3>
          <div className="result-box"><strong>Visited:</strong> {activeStep?.visited?.join(" → ") || "None"}</div>
          {mode === "iterative" ? (
            <div className="result-box"><strong>Stack (bottom → top):</strong> {activeStep?.stack?.join(" → ") || "Empty"}</div>
          ) : (
            <div className="result-box"><strong>Call path:</strong> {activeStep?.stack?.join(" → ") || "No active calls"}</div>
          )}
          <div className="result-box"><strong>Parents:</strong> {JSON.stringify(activeStep?.parents ?? {})}</div>
          <div className="snapshot-grid">
            {graph.vertices.map((vertex) => {
              const key = String(vertex);
              return (
                <div key={key} className="snapshot-box">
                  <strong>{key}</strong>
                  <span>{activeStep?.visited?.includes(key) ? "Visited" : "Unvisited"}</span>
                  <span>Parent: {activeStep?.parents?.[key] ?? "—"}</span>
                </div>
              );
            })}
          </div>
          {finalResult?.unreachable?.length > 0 && (
            <div className="result-box"><strong>Unreachable:</strong> {finalResult.unreachable.join(", ")}</div>
          )}
          <div className="result-box"><strong>Explanation:</strong> {activeStep?.explanation}</div>
        </div>
      </div>

      <div className="info-grid">
        {dfsComplexity.map((item) => (
          <div key={item.title} className="info-card">
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <div className="collection-panel">
        <div className="section-heading compact">
          <div><p className="eyebrow">PRACTICE</p><h2>DFS challenges</h2></div>
        </div>
        <div className="practice-list">
          {dfsPracticeSets.map((problem) => (
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
          <div><p className="eyebrow">LEARN</p><h2>DFS approaches and walkthrough</h2></div>
        </div>
        <div className="info-grid">
          <div className="info-card"><h4>Recursive DFS</h4><p>Visit a vertex, then recursively explore each unvisited neighbor. Returning from a call is the backtracking step.</p></div>
          <div className="info-card"><h4>Iterative DFS</h4><p>Use an explicit stack of traversal frames to reproduce recursive depth-first order without relying on the JavaScript call stack.</p></div>
          <div className="info-card"><h4>Applications</h4><p>DFS supports maze solving, reachability, connected components, cycle detection, and the foundations of topological and component algorithms.</p></div>
        </div>
        <CodeViewer
          title={`${mode === "recursive" ? "Recursive" : "Iterative"} DFS implementation`}
          summary={(mode === "recursive" ? dfsCode : dfsIterativeCode).summary}
          code={(mode === "recursive" ? dfsCode : dfsIterativeCode).code}
          explanation={(mode === "recursive" ? dfsCode : dfsIterativeCode).explanation}
        />
      </div>
    </section>
  );
}

export default DFSPage;
