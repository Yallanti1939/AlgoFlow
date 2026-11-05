import { useMemo, useState } from "react";

import { BFSAlgorithm } from "../algorithms/graphs/bfs";
import GraphVisualizer from "../components/visualizers/GraphVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { Graph } from "../data-structures/graphs/graph";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { bfsCode, bfsComplexity, bfsPracticeSets } from "../data/learningModules";

function buildSampleGraph(graphType = "undirected") {
  const graph = new Graph({ directed: graphType === "directed", weighted: false });
  ["A", "B", "C", "D", "E", "F"].forEach((vertex) => graph.addVertex(vertex));

  const edges = [
    ["A", "B"],
    ["A", "C"],
    ["B", "D"],
    ["C", "E"],
    ["D", "F"],
    ["E", "F"],
    ["C", "D"],
  ];

  edges.forEach(([from, to]) => graph.addEdge(from, to));
  return graph;
}

function layoutVertices(vertices) {
  const positions = {};
  vertices.forEach((vertex, index) => {
    const angle = (index / Math.max(vertices.length, 1)) * Math.PI * 2;
    const radius = 130;
    const x = 360 + Math.cos(angle) * radius;
    const y = 210 + Math.sin(angle) * radius;
    positions[String(vertex)] = { x, y };
  });
  return positions;
}

function BFSPage() {
  const metadata = dataStructureMetadata.bfs ?? {
    title: "Breadth-First Search",
    overview: "BFS explores the graph in layers from a source vertex, using a queue so each node is processed in the order it was discovered.",
  };

  const [graphType, setGraphType] = useState("undirected");
  const [graph, setGraph] = useState(() => buildSampleGraph("undirected"));
  const [startVertex, setStartVertex] = useState("A");
  const [status, setStatus] = useState("Ready");
  const [selectedPractice, setSelectedPractice] = useState(bfsPracticeSets[0]);
  const [steps, setSteps] = useState(() => new BFSAlgorithm(buildSampleGraph("undirected"), "A").run());
  const [playbackIndex, setPlaybackIndex] = useState(0);

  const activeStep = steps[playbackIndex] ?? steps[0] ?? null;
  const positions = useMemo(() => layoutVertices(graph.vertices), [graph.vertices]);

  const finalResult = useMemo(() => {
    const lastStep = steps.at(-1);
    return lastStep?.result ?? { order: [], parents: {}, distances: {} };
  }, [steps]);

  const handleRun = () => {
    const normalizedStart = String(startVertex).trim();

    if (!graph.vertices.some((vertex) => String(vertex) === normalizedStart)) {
      setStatus(`Vertex ${normalizedStart} is not in the graph.`);
      setSteps([
        {
          label: "Invalid start vertex",
          explanation: `The source ${normalizedStart} does not exist in the graph, so BFS cannot begin.`,
          currentVertex: normalizedStart,
          activeVertices: [normalizedStart],
          queued: [],
          visited: [],
          order: [],
          parents: {},
          distances: {},
          result: null,
          vertices: graph.vertices.map((vertex) => String(vertex)),
          adjacencyList: graph.adjacencyList(),
          adjacencyMatrix: graph.adjacencyMatrix(),
          edgeList: graph.edgeList(),
        },
      ]);
      setPlaybackIndex(0);
      return;
    }

    const nextSteps = new BFSAlgorithm(graph, normalizedStart).run();
    setSteps(nextSteps);
    setPlaybackIndex(0);
    setStatus(`Running BFS from ${normalizedStart}.`);
  };

  const handleTypeChange = (nextType) => {
    const nextGraph = buildSampleGraph(nextType);
    setGraphType(nextType);
    setGraph(nextGraph);
    setStartVertex("A");
    const nextSteps = new BFSAlgorithm(nextGraph, "A").run();
    setSteps(nextSteps);
    setPlaybackIndex(0);
    setStatus(`Loaded a ${nextType} BFS example.`);
  };

  const handleReset = () => {
    const nextGraph = buildSampleGraph(graphType);
    setGraph(nextGraph);
    setStartVertex("A");
    const nextSteps = new BFSAlgorithm(nextGraph, "A").run();
    setSteps(nextSteps);
    setPlaybackIndex(0);
    setStatus("Reset BFS example.");
  };

  const activeQueue = activeStep?.queue ?? [];
  const activeParents = activeStep?.parents ?? {};
  const activeDistances = activeStep?.distances ?? {};

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 5 · BFS</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>GRAPH TYPE</label>
              <select value={graphType} onChange={(event) => handleTypeChange(event.target.value)}>
                <option value="undirected">Undirected</option>
                <option value="directed">Directed</option>
              </select>
            </div>
            <div>
              <label>START VERTEX</label>
              <input value={startVertex} onChange={(event) => setStartVertex(event.target.value)} />
            </div>
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={handleRun}>Run BFS</button>
            <button className="secondary-btn" onClick={handleReset}>Reset</button>
          </div>

          <div className="status-box">Status: {status}</div>
        </div>

        <div className="panel-card">
          <h3>Insight</h3>
          <p className="stack-demo-summary">
            Breadth-first search explores all vertices at the current depth before moving deeper. This guarantees the shortest path length in unweighted graphs.
          </p>
          <p className="stack-demo-summary">
            The queue stores discovery order, while the parent map lets us reconstruct the exact shortest path from the source to any reachable vertex.
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
              <p>{(finalResult.order ?? []).join(" → ") || "No traversal yet"}</p>
            </div>
            <div className="info-card">
              <h4>Queue</h4>
              <p>{activeQueue.join(" → ") || "Empty"}</p>
            </div>
            <div className="info-card">
              <h4>Current step</h4>
              <p>{activeStep?.label ?? "No step"}</p>
            </div>
          </div>

          <PlaybackPanel
            steps={steps}
            title="BFS playback"
            speed={700}
            onStepChange={(nextStatus) => setPlaybackIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Queue, parents, and distances</h3>
          <div className="result-box">
            <strong>Queue:</strong> {activeQueue.join(" → ") || "Empty"}
          </div>
          <div className="result-box">
            <strong>Parents:</strong> {Object.keys(activeParents).length ? JSON.stringify(activeParents) : "{}"}
          </div>
          <div className="result-box">
            <strong>Distances:</strong> {Object.keys(activeDistances).length ? JSON.stringify(activeDistances) : "{}"}
          </div>

          <div className="snapshot-grid">
            {graph.vertices.map((vertex) => (
              <div key={String(vertex)} className="snapshot-box">
                <strong>{String(vertex)}</strong>
                <span>Parent: {activeParents[String(vertex)] ?? "—"}</span>
                <span>Distance: {activeDistances[String(vertex)] ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="info-grid">
        {bfsComplexity.map((item) => (
          <div key={item.title} className="info-card">
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <div className="collection-panel">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">PRACTICE</p>
            <h2>BFS challenges</h2>
          </div>
        </div>

        <div className="practice-list">
          {bfsPracticeSets.map((problem) => (
            <button
              key={problem.title}
              className={`practice-item ${selectedPractice.title === problem.title ? "selected" : ""}`}
              onClick={() => setSelectedPractice(problem)}
            >
              <span>{problem.title}</span>
              <small>{problem.difficulty}</small>
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
          <div>
            <p className="eyebrow">CODE VIEWER</p>
            <h2>Breadth-first search</h2>
          </div>
        </div>

        <CodeViewer
          title="BFS implementation"
          summary={bfsCode.summary}
          code={bfsCode.code}
          explanation={bfsCode.explanation}
        />
      </div>
    </section>
  );
}

export default BFSPage;
