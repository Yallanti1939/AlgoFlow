import { useMemo, useState } from "react";

import CodeViewer from "../components/CodeViewer";
import GraphVisualizer from "../components/visualizers/GraphVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import { Graph } from "../data-structures/graphs/graph";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { graphFundamentalsCode, graphFundamentalsComplexity, graphFundamentalsPracticeSets } from "../data/learningModules";

const defaultVertexSet = ["A", "B", "C", "D"];

function layoutVertices(vertices) {
  const positions = {};

  vertices.forEach((vertex, index) => {
    const angle = (index / Math.max(vertices.length, 1)) * Math.PI * 2;
    const radius = Math.min(220, 130 + vertices.length * 8);
    const x = 360 + Math.cos(angle) * radius;
    const y = 210 + Math.sin(angle) * radius;
    positions[String(vertex)] = { x, y };
  });

  return positions;
}

function parseVertices(raw) {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry);
}

function GraphFundamentalsPage() {
  const metadata = dataStructureMetadata.graphFundamentals ?? {
    title: "Graph Fundamentals",
    overview: "Graphs model relationships between entities, from road maps to dependency networks and social connections.",
  };

  const [graphType, setGraphType] = useState("directed");
  const [weighted, setWeighted] = useState(true);
  const [vertexInput, setVertexInput] = useState("A, B, C, D");
  const [newVertex, setNewVertex] = useState("E");
  const [fromVertex, setFromVertex] = useState("A");
  const [toVertex, setToVertex] = useState("B");
  const [edgeWeight, setEdgeWeight] = useState("3");
  const [selectedVertex, setSelectedVertex] = useState(null);
  const [status, setStatus] = useState("Ready");
  const [selectedPractice, setSelectedPractice] = useState(graphFundamentalsPracticeSets[0]);
  const [graph, setGraph] = useState(() => {
    const baseGraph = new Graph({ directed: true, weighted: true });
    defaultVertexSet.forEach((vertex) => baseGraph.addVertex(vertex));
    [
      ["A", "B", 3],
      ["B", "C", 5],
      ["C", "D", 2],
      ["A", "D", 7],
    ].forEach(([from, to, weight]) => baseGraph.addEdge(from, to, weight));
    return baseGraph;
  });
  const [positions, setPositions] = useState(() => layoutVertices(defaultVertexSet));
  const [steps, setSteps] = useState(() => {
    const baseGraph = new Graph({ directed: true, weighted: true });
    defaultVertexSet.forEach((vertex) => baseGraph.addVertex(vertex));
    return [
      {
        label: "Sample graph",
        explanation: "This sample graph illustrates directed connections and weighted edges between the vertices.",
        activeVertices: [],
        activeEdges: [],
        result: null,
        vertices: [...baseGraph.vertices],
        adjacencyList: baseGraph.adjacencyList(),
        adjacencyMatrix: baseGraph.adjacencyMatrix(),
        edgeList: baseGraph.edgeList(),
      },
    ];
  });

  const adjacencyList = useMemo(() => graph.adjacencyList(), [graph]);
  const adjacencyMatrix = useMemo(() => graph.adjacencyMatrix(), [graph]);
  const edgeList = useMemo(() => graph.edgeList(), [graph]);

  const activeStep = steps[0] ?? null;

  const buildGraphFromInput = (nextVertices) => {
    const nextGraph = new Graph({ directed: graphType === "directed", weighted });
    nextVertices.forEach((vertex) => nextGraph.addVertex(vertex));
    setGraph(nextGraph);
    setPositions(layoutVertices(nextVertices));
    setStatus(`Built a ${graphType} graph with ${nextVertices.length} vertices.`);
    setSteps([
      {
        label: "Graph built",
        explanation: `A ${graphType} graph with weighted=${String(weighted)} was created using the current vertex list.`,
        activeVertices: [],
        activeEdges: [],
        result: null,
        vertices: [...nextGraph.vertices],
        adjacencyList: nextGraph.adjacencyList(),
        adjacencyMatrix: nextGraph.adjacencyMatrix(),
        edgeList: nextGraph.edgeList(),
      },
    ]);
  };

  const handleCreateSampleGraph = () => {
    const nextGraph = new Graph({ directed: graphType === "directed", weighted });
    ["A", "B", "C", "D", "E"].forEach((vertex) => nextGraph.addVertex(vertex));
    [
      ["A", "B", 4],
      ["A", "C", 2],
      ["B", "C", 1],
      ["B", "D", 6],
      ["C", "D", 3],
      ["D", "E", 2],
      ["E", "A", 5],
    ].forEach(([from, to, weight]) => nextGraph.addEdge(from, to, weight));
    setGraph(nextGraph);
    setPositions(layoutVertices(nextGraph.vertices));
    setStatus("Sample graph created.");
    setSteps([
      {
        label: "Sample graph",
        explanation: "The sample graph demonstrates basic vertex relationships, edge weights, and graph directionality.",
        activeVertices: [],
        activeEdges: [],
        result: null,
        vertices: [...nextGraph.vertices],
        adjacencyList: nextGraph.adjacencyList(),
        adjacencyMatrix: nextGraph.adjacencyMatrix(),
        edgeList: nextGraph.edgeList(),
      },
    ]);
  };

  const handleAddVertex = () => {
    if (!newVertex.trim()) {
      setStatus("Enter a vertex label before adding it.");
      return;
    }

    const nextGraph = new Graph({ directed: graphType === "directed", weighted });
    graph.vertices.forEach((vertex) => nextGraph.addVertex(vertex));
    const result = nextGraph.addVertex(newVertex.trim());
    setGraph(nextGraph);
    setPositions((previous) => ({
      ...previous,
      ...layoutVertices(nextGraph.vertices),
    }));
    setStatus(result.label);
    setSteps([result]);
  };

  const handleRemoveVertex = () => {
    if (!selectedVertex) {
      setStatus("Select a vertex to remove.");
      return;
    }

    const nextGraph = new Graph({ directed: graphType === "directed", weighted });
    graph.vertices.forEach((vertex) => {
      if (vertex !== selectedVertex) {
        nextGraph.addVertex(vertex);
      }
    });

    const edges = graph.edgeList();
    edges.forEach(({ from, to, weight }) => {
      if (from !== selectedVertex && to !== selectedVertex) {
        nextGraph.addEdge(from, to, weight);
      }
    });

    setGraph(nextGraph);
    setSelectedVertex(null);
    setStatus(`Removed vertex ${selectedVertex}.`);
    setSteps([
      {
        label: `Remove vertex ${selectedVertex}`,
        explanation: `Vertex ${selectedVertex} and all incident edges were removed from the graph.`,
        activeVertices: [selectedVertex],
        activeEdges: [],
        result: { vertex: selectedVertex, removed: true },
        vertices: [...nextGraph.vertices],
        adjacencyList: nextGraph.adjacencyList(),
        adjacencyMatrix: nextGraph.adjacencyMatrix(),
        edgeList: nextGraph.edgeList(),
      },
    ]);
  };

  const handleAddEdge = () => {
    if (!fromVertex || !toVertex) {
      setStatus("Select both source and destination vertices.");
      return;
    }

    const nextGraph = new Graph({ directed: graphType === "directed", weighted });
    graph.vertices.forEach((vertex) => nextGraph.addVertex(vertex));
    graph.edgeList().forEach(({ from, to, weight }) => nextGraph.addEdge(from, to, weight));

    const result = nextGraph.addEdge(fromVertex.trim(), toVertex.trim(), Number(edgeWeight || 1));
    setGraph(nextGraph);
    setStatus(result.label);
    setSteps([result]);
  };

  const handleRemoveEdge = () => {
    if (!fromVertex || !toVertex) {
      setStatus("Select both edge endpoints.");
      return;
    }

    const nextGraph = new Graph({ directed: graphType === "directed", weighted });
    graph.vertices.forEach((vertex) => nextGraph.addVertex(vertex));
    graph.edgeList().forEach(({ from, to, weight }) => nextGraph.addEdge(from, to, weight));

    const result = nextGraph.removeEdge(fromVertex.trim(), toVertex.trim());
    setGraph(nextGraph);
    setStatus(result.label);
    setSteps([result]);
  };

  const handleGraphTypeChange = (value) => {
    const nextGraph = new Graph({ directed: value === "directed", weighted });
    graph.vertices.forEach((vertex) => nextGraph.addVertex(vertex));
    graph.edgeList().forEach(({ from, to, weight }) => {
      if (value === "directed") {
        nextGraph.addEdge(from, to, weight);
      } else {
        nextGraph.addEdge(from, to, weight);
      }
    });
    setGraph(nextGraph);
    setGraphType(value);
    setStatus(`Switched to a ${value} graph.`);
  };

  const handleBuildFromText = () => {
    const parsed = parseVertices(vertexInput);
    if (parsed.length === 0) {
      setStatus("Enter at least one vertex label.");
      return;
    }
    buildGraphFromInput(parsed);
  };

  const handlePointerMove = (event) => {
    if (!selectedVertex) {
      return;
    }

    const svg = event.currentTarget.closest("svg");
    if (!svg) {
      return;
    }

    const rect = svg.getBoundingClientRect();
    const x = Math.min(680, Math.max(40, event.clientX - rect.left));
    const y = Math.min(380, Math.max(40, event.clientY - rect.top));

    setPositions((previous) => ({
      ...previous,
      [String(selectedVertex)]: { x, y },
    }));
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 5 · GRAPH FUNDAMENTALS</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>GRAPH TYPE</label>
              <select value={graphType} onChange={(event) => handleGraphTypeChange(event.target.value)}>
                <option value="directed">Directed</option>
                <option value="undirected">Undirected</option>
              </select>
            </div>
            <div>
              <label>WEIGHTED</label>
              <select value={weighted ? "weighted" : "unweighted"} onChange={(event) => setWeighted(event.target.value === "weighted")}>
                <option value="weighted">Weighted</option>
                <option value="unweighted">Unweighted</option>
              </select>
            </div>
          </div>

          <div className="toolbar stacked-toolbar">
            <div className="input-block">
              <label>VERTEX LIST</label>
              <input value={vertexInput} onChange={(event) => setVertexInput(event.target.value)} />
            </div>
            <button className="primary-btn" onClick={handleBuildFromText}>Apply vertices</button>
          </div>

          <div className="toolbar stacked-toolbar">
            <div className="input-block">
              <label>NEW VERTEX</label>
              <input value={newVertex} onChange={(event) => setNewVertex(event.target.value)} />
            </div>
            <button className="secondary-btn" onClick={handleAddVertex}>Add vertex</button>
            <button className="secondary-btn" onClick={handleRemoveVertex}>Remove selected</button>
          </div>

          <div className="toolbar stacked-toolbar">
            <div className="input-block">
              <label>FROM</label>
              <input value={fromVertex} onChange={(event) => setFromVertex(event.target.value)} />
            </div>
            <div className="input-block">
              <label>TO</label>
              <input value={toVertex} onChange={(event) => setToVertex(event.target.value)} />
            </div>
            <div className="input-block">
              <label>WEIGHT</label>
              <input value={edgeWeight} onChange={(event) => setEdgeWeight(event.target.value)} />
            </div>
            <button className="secondary-btn" onClick={handleAddEdge}>Add edge</button>
            <button className="secondary-btn" onClick={handleRemoveEdge}>Remove edge</button>
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={handleCreateSampleGraph}>Sample graph</button>
            <button className="secondary-btn" onClick={() => setSelectedVertex(null)}>Clear selection</button>
          </div>

          <div className="status-box">Status: {status}</div>
        </div>

        <div className="panel-card">
          <h3>Graph overview</h3>
          <p className="stack-demo-summary"><strong>Vertices:</strong> {graph.vertices.join(", ") || "None"}</p>
          <p className="stack-demo-summary"><strong>Type:</strong> {graph.directed ? "Directed graph" : "Undirected graph"}</p>
          <p className="stack-demo-summary"><strong>Weighted:</strong> {graph.weighted ? "Yes" : "No"}</p>
          <p className="stack-demo-summary"><strong>Edges:</strong> {edgeList.length}</p>
          <div className="graph-summary-grid">
            {graph.vertices.map((vertex) => (
              <div key={String(vertex)} className="metric-box">
                <span>{String(vertex)}</span>
                <strong>{graph.getDegree(vertex)}</strong>
                <small>degree</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>Interactive graph view</h3>
          <GraphVisualizer
            vertices={graph.vertices}
            positions={positions}
            edges={edgeList}
            selectedVertex={selectedVertex}
            highlightedVertices={selectedVertex ? [selectedVertex] : []}
            highlightedEdges={activeStep?.activeEdges ?? []}
            directed={graph.directed}
          />

          <div className="graph-vertex-grid">
            {graph.vertices.map((vertex) => (
              <button
                key={String(vertex)}
                className={`graph-vertex-button ${selectedVertex === vertex ? "selected" : ""}`}
                onClick={() => setSelectedVertex(vertex)}
                onPointerMove={handlePointerMove}
              >
                {String(vertex)}
              </button>
            ))}
          </div>

          <PlaybackPanel
            steps={steps}
            title="Graph operation playback"
            speed={700}
            onStepChange={() => undefined}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Adjacency list</h3>
          <div className="graph-list-panel">
            {Object.entries(adjacencyList).map(([vertex, neighbors]) => (
              <div key={vertex} className="graph-list-item">
                <strong>{vertex}</strong>
                <span>{neighbors.length ? neighbors.map((neighbor) => `${neighbor.vertex}(${neighbor.weight})`).join(", ") : "—"}</span>
              </div>
            ))}
          </div>

          <h3 className="graph-subhead">Adjacency matrix</h3>
          <div className="matrix-panel">
            <div className="matrix-header">
              <span />
              {graph.vertices.map((vertex) => <span key={String(vertex)}>{String(vertex)}</span>)}
            </div>
            {graph.vertices.map((rowVertex, rowIndex) => (
              <div key={String(rowVertex)} className="matrix-row">
                <span>{String(rowVertex)}</span>
                {graph.vertices.map((colVertex, colIndex) => (
                  <strong key={`${String(rowVertex)}-${String(colVertex)}-${colIndex}`}>
                    {adjacencyMatrix.matrix[rowIndex][colIndex] ?? 0}
                  </strong>
                ))}
              </div>
            ))}
          </div>

          <h3 className="graph-subhead">Edge list</h3>
          <div className="graph-list-panel">
            {edgeList.length ? edgeList.map(({ from, to, weight }, index) => (
              <div key={`${String(from)}-${String(to)}-${index}`} className="graph-list-item">
                <strong>{String(from)}</strong>
                <span>{graph.directed ? "→" : "--"}</span>
                <strong>{String(to)}</strong>
                <small>{weight}</small>
              </div>
            )) : <p className="stack-demo-summary">No edges yet.</p>}
          </div>
        </div>
      </div>

      <div className="info-grid">
        {graphFundamentalsComplexity.map((item) => (
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
            <h2>Graph fundamentals questions</h2>
          </div>
        </div>

        <div className="practice-list">
          {graphFundamentalsPracticeSets.map((problem) => (
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
            <h2>Graph fundamentals</h2>
          </div>
        </div>

        <CodeViewer
          title="Graph basics"
          summary={graphFundamentalsCode.summary}
          code={graphFundamentalsCode.code}
          explanation={graphFundamentalsCode.explanation}
        />
      </div>
    </section>
  );
}

export default GraphFundamentalsPage;
