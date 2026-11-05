import { useMemo, useState } from "react";

import { CycleDetectionAlgorithm } from "../algorithms/graphs/cycleDetection";
import GraphVisualizer from "../components/visualizers/GraphVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { Graph } from "../data-structures/graphs/graph";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import {
  cycleDetectionCode,
  cycleDetectionComplexity,
  cycleDetectionPracticeSets,
} from "../data/learningModules";

function buildSampleGraph(graphType = "undirected", hasCycle = true) {
  const graph = new Graph({ directed: graphType === "directed", weighted: false });
  ["A", "B", "C", "D", "E", "F"].forEach((vertex) => graph.addVertex(vertex));
  const edges = graphType === "directed"
    ? [["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"], ...(hasCycle ? [["E", "B"]] : []), ["F", "F"]]
    : (hasCycle
      ? [["A", "B"], ["B", "C"], ["C", "A"], ["C", "D"], ["E", "F"]]
      : [["A", "B"], ["B", "C"], ["C", "D"], ["E", "F"]]);
  const sampleEdges = graphType === "directed" && !hasCycle
    ? edges.filter(([from, to]) => from !== "F" || to !== "F")
    : edges;
  sampleEdges.forEach(([from, to]) => graph.addEdge(from, to));
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

function CycleDetectionPage() {
  const metadata = dataStructureMetadata.cycleDetection;
  const [graphType, setGraphType] = useState("undirected");
  const [hasSampleCycle, setHasSampleCycle] = useState(true);
  const [graph, setGraph] = useState(() => buildSampleGraph());
  const [steps, setSteps] = useState(() => new CycleDetectionAlgorithm(buildSampleGraph()).run());
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [selectedPractice, setSelectedPractice] = useState(cycleDetectionPracticeSets[0]);
  const [status, setStatus] = useState("Ready");

  const activeStep = steps[playbackIndex] ?? steps[0] ?? null;
  const positions = useMemo(() => layoutVertices(graph.vertices), [graph.vertices]);
  const finalResult = steps.at(-1)?.result;

  const loadGraph = (nextType, nextHasCycle) => {
    const nextGraph = buildSampleGraph(nextType, nextHasCycle);
    setGraphType(nextType);
    setHasSampleCycle(nextHasCycle);
    setGraph(nextGraph);
    const nextSteps = new CycleDetectionAlgorithm(nextGraph).run();
    setSteps(nextSteps);
    setPlaybackIndex(0);
    setStatus(`Loaded ${nextType} sample ${nextHasCycle ? "with" : "without"} a cycle.`);
  };

  const runDetection = () => {
    const nextSteps = new CycleDetectionAlgorithm(graph).run();
    setSteps(nextSteps);
    setPlaybackIndex(0);
    const result = nextSteps.at(-1)?.result;
    setStatus(result?.hasCycle
      ? `Cycle detected: ${result.cycle.join(" → ")}`
      : "No cycle detected.");
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 5 · CYCLE DETECTION</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>GRAPH TYPE</label>
              <select value={graphType} onChange={(event) => loadGraph(event.target.value, hasSampleCycle)}>
                <option value="undirected">Undirected</option>
                <option value="directed">Directed</option>
              </select>
            </div>
            <div>
              <label>SAMPLE</label>
              <select
                value={hasSampleCycle ? "cycle" : "acyclic"}
                onChange={(event) => loadGraph(graphType, event.target.value === "cycle")}
              >
                <option value="cycle">Contains cycle</option>
                <option value="acyclic">Acyclic</option>
              </select>
            </div>
          </div>
          <div className="action-grid">
            <button className="primary-btn" onClick={runDetection}>Detect cycle</button>
            <button className="secondary-btn" onClick={() => loadGraph(graphType, true)}>Reset example</button>
          </div>
          <div className="status-box">Status: {status}</div>
        </div>

        <div className="panel-card">
          <h3>What is a cycle?</h3>
          <p className="stack-demo-summary">
            A cycle is a path that starts and ends at the same vertex without repeating intermediate vertices. A self-loop is a cycle of length one.
          </p>
          <p className="stack-demo-summary">
            Undirected DFS ignores the edge to a vertex's parent; any other visited neighbor closes a cycle. Directed DFS uses white, gray, and black states—an edge to a gray vertex is a back edge.
          </p>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>Cycle detection traversal</h3>
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
              <h4>Detection</h4>
              <p>{activeStep?.detectionStatus ?? "Searching"}</p>
            </div>
            <div className="info-card">
              <h4>Cycle path</h4>
              <p>{activeStep?.cycle?.join(" → ") || "Not found yet"}</p>
            </div>
            <div className="info-card">
              <h4>Current step</h4>
              <p>{activeStep?.label ?? "No step"}</p>
            </div>
          </div>
          <PlaybackPanel
            steps={steps}
            title={`${graph.directed ? "Directed" : "Undirected"} cycle detection playback`}
            speed={700}
            onStepChange={(nextStatus) => setPlaybackIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Search state</h3>
          <div className="result-box"><strong>Current vertex:</strong> {activeStep?.currentVertex ?? "—"}</div>
          <div className="result-box"><strong>Visited:</strong> {activeStep?.visited?.join(" → ") || "None"}</div>
          <div className="result-box"><strong>{graph.directed ? "Recursion stack" : "DFS path"}:</strong> {activeStep?.stack?.join(" → ") || "Empty"}</div>
          {graph.directed && (
            <div className="result-box"><strong>Three-color states:</strong> white = unvisited, gray = active recursion path, black = fully explored.</div>
          )}
          <div className="result-box"><strong>Explanation:</strong> {activeStep?.explanation}</div>
          <div className="result-box">
            <strong>Final result:</strong> {finalResult
              ? (finalResult.hasCycle ? `Cycle: ${finalResult.cycle.join(" → ")}` : "No cycle")
              : "Pending"}
          </div>
        </div>
      </div>

      <div className="info-grid">
        {cycleDetectionComplexity.map((item) => (
          <div key={item.title} className="info-card">
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <div className="collection-panel">
        <div className="section-heading compact">
          <div><p className="eyebrow">PRACTICE</p><h2>Cycle detection challenges</h2></div>
        </div>
        <div className="practice-list">
          {cycleDetectionPracticeSets.map((problem) => (
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
          <div><p className="eyebrow">LEARN</p><h2>Detection strategies</h2></div>
        </div>
        <div className="info-grid">
          <div className="info-card"><h4>Undirected graphs</h4><p>Track each vertex's DFS parent. A visited neighbor other than that parent identifies a cycle; parent links reconstruct the path.</p></div>
          <div className="info-card"><h4>Directed graphs</h4><p>Three-color DFS marks vertices unvisited (white), active (gray), or complete (black). A gray-to-gray back edge identifies a directed cycle.</p></div>
          <div className="info-card"><h4>Disconnected graphs</h4><p>Start DFS from every still-unvisited vertex so cycles in any component are considered.</p></div>
        </div>
        <CodeViewer
          title={cycleDetectionCode.title}
          summary={cycleDetectionCode.summary}
          code={graph.directed ? cycleDetectionCode.directedCode : cycleDetectionCode.undirectedCode}
          explanation={graph.directed ? cycleDetectionCode.directedExplanation : cycleDetectionCode.undirectedExplanation}
        />
      </div>
    </section>
  );
}

export default CycleDetectionPage;
