import { useMemo, useState } from "react";

import { KosarajuAlgorithm } from "../algorithms/graphs/kosaraju";
import { TarjanAlgorithm } from "../algorithms/graphs/tarjan";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import GraphVisualizer from "../components/visualizers/GraphVisualizer";
import { Graph } from "../data-structures/graphs/graph";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import {
  sccComplexity,
  sccLearning,
  sccPracticeSets,
} from "../data/learningModules";

const SCC_COLORS = ["scc-node-0", "scc-node-1", "scc-node-2", "scc-node-3", "scc-node-4", "scc-node-5"];

function buildSampleGraph(directed = true) {
  const graph = new Graph({ directed, weighted: false });
  ["A", "B", "C", "D", "E", "F", "G", "H"].forEach((vertex) => graph.addVertex(vertex));
  [
    ["A", "B"], ["B", "C"], ["C", "A"],
    ["B", "D"],
    ["D", "E"], ["E", "D"],
    ["E", "F"],
    ["F", "G"], ["G", "F"],
  ].forEach(([from, to]) => graph.addEdge(from, to));
  return graph;
}

function layoutVertices(vertices) {
  const positions = {};
  const groups = [
    { members: ["A", "B", "C"], centerX: 150, centerY: 205, radius: 68 },
    { members: ["D", "E"], centerX: 350, centerY: 205, radius: 56 },
    { members: ["F", "G"], centerX: 530, centerY: 205, radius: 56 },
  ];
  groups.forEach(({ members, centerX, centerY, radius }) => {
    members.forEach((vertex, index) => {
      const angle = (index / members.length) * Math.PI * 2 - Math.PI / 2;
      positions[vertex] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });
  });
  positions.H = { x: 660, y: 205 };
  vertices.forEach((vertex, index) => {
    positions[String(vertex)] ??= { x: 80 + (index % 6) * 110, y: 80 + Math.floor(index / 6) * 150 };
  });
  return positions;
}

function componentClassNames(step) {
  const memberships = {};
  const components = [...(step?.components ?? [])];
  if (step?.currentComponent?.length) {
    components.push(step.currentComponent);
  }
  if (step?.extractedComponent?.length) {
    components.push(step.extractedComponent);
  }
  components.forEach((component, componentIndex) => {
    const className = SCC_COLORS[componentIndex % SCC_COLORS.length];
    component.forEach((vertex) => {
      memberships[String(vertex)] = className;
    });
  });
  return memberships;
}

function normalizeEdges(edges = []) {
  return edges.map((edge) => ({
    ...edge,
    from: String(edge.from),
    to: String(edge.to),
  }));
}

function StronglyConnectedComponentsPage() {
  const metadata = dataStructureMetadata.stronglyConnectedComponents;
  const [algorithm, setAlgorithm] = useState("kosaraju");
  const [directed, setDirected] = useState(true);
  const [graph, setGraph] = useState(() => buildSampleGraph());
  const [steps, setSteps] = useState(() => new KosarajuAlgorithm(buildSampleGraph()).run());
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackRevision, setPlaybackRevision] = useState(0);
  const [selectedPractice, setSelectedPractice] = useState(sccPracticeSets[0]);

  const activeStep = steps[playbackIndex] ?? steps[0] ?? null;
  const finalResult = steps.at(-1)?.result;
  const positions = useMemo(() => layoutVertices(graph.vertices), [graph.vertices]);
  const vertexClassNames = componentClassNames(activeStep);
  const code = algorithm === "kosaraju" ? sccLearning.kosarajuCode : sccLearning.tarjanCode;
  const explanation = algorithm === "kosaraju" ? sccLearning.kosarajuExplanation : sccLearning.tarjanExplanation;
  const visibleEdges = activeStep?.edgeList ?? graph.edgeList();

  const runAlgorithm = (nextGraph = graph, nextAlgorithm = algorithm) => {
    const nextSteps = nextAlgorithm === "kosaraju"
      ? new KosarajuAlgorithm(nextGraph).run()
      : new TarjanAlgorithm(nextGraph).run();
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
          <p className="eyebrow">PHASE 5 · STRONGLY CONNECTED COMPONENTS</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <h3>Choose an SCC algorithm</h3>
          <div className="toolbar">
            <div>
              <label htmlFor="scc-algorithm">ALGORITHM</label>
              <select id="scc-algorithm" value={algorithm} onChange={(event) => selectAlgorithm(event.target.value)}>
                <option value="kosaraju">Kosaraju&apos;s algorithm</option>
                <option value="tarjan">Tarjan&apos;s algorithm</option>
              </select>
            </div>
            <div>
              <label htmlFor="scc-graph-type">GRAPH TYPE</label>
              <select id="scc-graph-type" value={directed ? "directed" : "undirected"} onChange={(event) => loadGraph(event.target.value === "directed")}>
                <option value="directed">Directed sample</option>
                <option value="undirected">Undirected (rejected)</option>
              </select>
            </div>
          </div>
          <div className="action-grid">
            <button className="primary-btn" onClick={() => runAlgorithm()}>Run {algorithm === "kosaraju" ? "Kosaraju" : "Tarjan"}</button>
            <button className="secondary-btn" onClick={() => loadGraph(true)}>Reset directed sample</button>
          </div>
          {!finalResult?.valid && finalResult?.reason && <div className="status-box" role="status">{finalResult.reason}</div>}
        </div>

        <div className="panel-card">
          <h3>Mutual reachability</h3>
          <p className="stack-demo-summary">{sccLearning.introduction}</p>
          <p className="stack-demo-summary">{sccLearning.directedGraphs}</p>
          <div className="info-grid compact-grid">
            <div className="info-card"><h4>Algorithm phase</h4><p>{activeStep?.phase ?? "—"}</p></div>
            <div className="info-card"><h4>Found components</h4><p>{activeStep?.components?.length ?? 0}</p></div>
            <div className="info-card"><h4>Current vertex</h4><p>{activeStep?.currentVertex ?? "—"}</p></div>
          </div>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>{activeStep?.phase === "second-pass" ? "Reversed directed graph" : "Directed graph"}</h3>
          <GraphVisualizer
            vertices={graph.vertices.map(String)}
            positions={positions}
            edges={normalizeEdges(visibleEdges)}
            selectedVertex={activeStep?.currentVertex ?? null}
            highlightedEdges={activeStep?.activeEdges ?? []}
            vertexClassNames={vertexClassNames}
            directed={activeStep?.directed ?? true}
          />
          <div className="scc-color-legend">
            {(activeStep?.components ?? []).map((component, index) => (
              <div className="scc-legend-item" key={component.join("|")}>
                <span className={`scc-legend-swatch ${SCC_COLORS[index % SCC_COLORS.length]}`} />
                <span>SCC {index + 1}: {component.join(", ")}</span>
              </div>
            ))}
            {activeStep?.currentComponent?.length > 0 && (
              <div className="scc-legend-item">
                <span className={`scc-legend-swatch ${SCC_COLORS[(activeStep.components.length) % SCC_COLORS.length]}`} />
                <span>Current SCC search: {activeStep.currentComponent.join(", ")}</span>
              </div>
            )}
            {activeStep?.extractedComponent?.length > 0 && (
              <div className="scc-legend-item">
                <span className={`scc-legend-swatch ${SCC_COLORS[(activeStep.components.length) % SCC_COLORS.length]}`} />
                <span>Current extraction: {activeStep.extractedComponent.join(", ")}</span>
              </div>
            )}
          </div>
          <div className="info-grid compact-grid">
            <div className="info-card"><h4>Visited</h4><p>{activeStep?.visited?.join(" → ") || "None"}</p></div>
            {algorithm === "kosaraju"
              ? <div className="info-card"><h4>Finishing order</h4><p>{activeStep?.finishingOrder?.join(" → ") || "None"}</p></div>
              : <div className="info-card"><h4>Active stack</h4><p>{activeStep?.activeStack?.join(" → ") || "Empty"}</p></div>}
            <div className="info-card"><h4>Active edge</h4><p>{activeStep?.activeEdges?.[0] ?? "None"}</p></div>
          </div>
          <PlaybackPanel
            key={playbackRevision}
            steps={steps}
            title={`${algorithm === "kosaraju" ? "Kosaraju" : "Tarjan"} SCC playback`}
            speed={700}
            onStepChange={(nextStatus) => setPlaybackIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>DFS state and SCC partition</h3>
          {algorithm === "tarjan" && (
            <div className="snapshot-grid">
              {graph.vertices.map((vertex) => (
                <div className="snapshot-box" key={String(vertex)}>
                  <strong>{String(vertex)}</strong>
                  <span>Discovery: {activeStep?.discovery?.[String(vertex)] ?? "—"}</span>
                  <span>Low-link: {activeStep?.lowLink?.[String(vertex)] ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
          {algorithm === "kosaraju" && (
            <div className="result-box"><strong>Finishing order:</strong> {activeStep?.finishingOrder?.join(" → ") || "Not calculated yet"}</div>
          )}
          <div className="snapshot-grid">
            {(activeStep?.components ?? []).map((component, index) => (
              <div className={`snapshot-box scc-component-card ${SCC_COLORS[index % SCC_COLORS.length]}`} key={component.join("|")}>
                <strong>SCC {index + 1}</strong>
                <span>Members: {component.join(", ")}</span>
              </div>
            ))}
          </div>
          <div className="result-box"><strong>Status:</strong> {finalResult?.valid ? `${finalResult.components.length} component${finalResult.components.length === 1 ? "" : "s"} found` : finalResult?.reason ?? "Ready"}</div>
          <div className="result-box"><strong>Current step:</strong> {activeStep?.label ?? "No step"}</div>
          <div className="result-box"><strong>Explanation:</strong> {activeStep?.explanation ?? "Choose an algorithm to begin."}</div>
          <div className="info-card"><h4>Real-world applications</h4><p>{sccComplexity.at(-1).description}</p></div>
        </div>
      </div>

      <div className="info-grid">
        {sccComplexity.map((item) => <div key={item.title} className="info-card"><h4>{item.title}</h4><p>{item.description}</p></div>)}
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">PRACTICE</p><h2>SCC challenges</h2></div></div>
        <div className="practice-list">
          {sccPracticeSets.map((problem) => (
            <button key={problem.title} className={`practice-item ${selectedPractice.title === problem.title ? "selected" : ""}`} onClick={() => setSelectedPractice(problem)}>
              <span>{problem.title}</span><small>{problem.difficulty}</small>
            </button>
          ))}
        </div>
        <CodeViewer title={selectedPractice.title} summary={selectedPractice.statement} code={selectedPractice.solution} explanation={`${selectedPractice.explanation} ${selectedPractice.complexity}`} />
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">LEARN</p><h2>{algorithm === "kosaraju" ? "Kosaraju's algorithm" : "Tarjan's algorithm"}</h2></div></div>
        <div className="info-grid">
          <div className="info-card"><h4>Kosaraju</h4><p>{sccLearning.kosarajuExplanation}</p></div>
          <div className="info-card"><h4>Tarjan</h4><p>{sccLearning.tarjanExplanation}</p></div>
          <div className="info-card"><h4>Comparison</h4><p>{sccComplexity[2].description}</p></div>
        </div>
        <CodeViewer
          title={`${algorithm === "kosaraju" ? "Kosaraju" : "Tarjan"} JavaScript implementation`}
          summary="Both algorithms return the same strongly connected component partition in O(V + E) time."
          code={code}
          explanation={explanation}
        />
      </div>
    </section>
  );
}

export default StronglyConnectedComponentsPage;
