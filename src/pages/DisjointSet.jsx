import { useMemo, useState } from "react";

import DisjointSet from "../data-structures/graphs/disjointSet";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import {
  disjointSetComplexity,
  disjointSetLearning,
  disjointSetPracticeSets,
} from "../data/learningModules";

const numericToken = /^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

function parseElements(input) {
  return input.split(",").map((token) => {
    const value = token.trim();
    if (numericToken.test(value)) {
      const number = Number(value);
      if (Number.isFinite(number)) return number;
    }
    return value;
  }).filter((value) => value !== "");
}

function createSampleModel() {
  const disjointSet = new DisjointSet([1, 2, 3, 4, 5, 6]);
  disjointSet.union(1, 2);
  disjointSet.union(3, 4);
  disjointSet.union(3, 5);
  disjointSet.union(1, 3);
  return {
    disjointSet,
    steps: [disjointSet.getSnapshot("Sample components", "Four unions create components {1, 2, 3, 4, 5} and {6}, with a two-edge path ready for compression.")],
  };
}

function DisjointSetForest({ snapshot }) {
  const forest = useMemo(() => {
    if (!snapshot) return { nodes: [], edges: [], groups: [], width: 720, height: 220 };

    const parent = new Map(snapshot.parent);
    const nodes = [];
    const edges = [];
    const groups = [];
    let offsetX = 12;
    let height = 190;

    snapshot.components.forEach((component, componentIndex) => {
      const depths = new Map();
      let maxDepth = 0;
      component.forEach((element) => {
        let current = element;
        let depth = 0;
        while (parent.get(current) !== current) {
          current = parent.get(current);
          depth += 1;
        }
        depths.set(element, depth);
        maxDepth = Math.max(maxDepth, depth);
      });

      const groupWidth = Math.max(component.length * 116 + 28, 152);
      groups.push({
        key: `component-${componentIndex}`,
        x: offsetX,
        y: 12,
        width: groupWidth,
        height: 112 + maxDepth * 92,
        label: `Component ${componentIndex + 1}`,
      });
      const groupNodes = [];
      component.forEach((element, index) => {
        const point = {
          element,
          x: offsetX + 58 + index * 116,
          y: 60 + depths.get(element) * 92,
          root: parent.get(element) === element,
        };
        nodes.push(point);
        groupNodes.push(point);
      });
      groupNodes.forEach((point) => {
        if (!point.root) {
          edges.push({
            key: `${typeof point.element}:${String(point.element)}->${typeof parent.get(point.element)}:${String(parent.get(point.element))}`,
            from: point,
            to: groupNodes.find((node) => Object.is(node.element, parent.get(point.element))),
          });
        }
      });
      height = Math.max(height, 112 + maxDepth * 92 + 28);
      offsetX += groupWidth + 18;
    });

    return { nodes, edges, groups, width: Math.max(720, offsetX), height };
  }, [snapshot]);

  if (!snapshot || snapshot.elements.length === 0) {
    return <div className="empty-state">Initialize elements to visualize the disjoint-set forest.</div>;
  }

  const highlighted = new Set(snapshot.currentPath);
  const compressed = new Set(snapshot.compressed);

  return (
    <div className="dsu-forest-wrapper">
      <svg
        className="dsu-forest-svg"
        viewBox={`0 0 ${forest.width} ${forest.height}`}
        width={forest.width}
        height={forest.height}
        role="img"
        aria-label="Disjoint-set parent forest"
      >
        {forest.groups.map((group) => (
          <g key={group.key}>
            <rect x={group.x} y={group.y} width={group.width} height={group.height} rx="12" className="dsu-component-background" />
            <text x={group.x + 14} y={group.y + 22} className="dsu-component-label">{group.label}</text>
          </g>
        ))}
        {forest.edges.map((edge) => {
          if (!edge.to) return null;
          const isActive = highlighted.has(edge.from.element) && highlighted.has(edge.to.element);
          return (
            <line
              key={edge.key}
              x1={edge.from.x}
              y1={edge.from.y - 20}
              x2={edge.to.x}
              y2={edge.to.y + 20}
              className={`dsu-parent-edge ${isActive ? "dsu-parent-edge-active" : ""}`}
            />
          );
        })}
        {forest.nodes.map((node) => {
          const isActive = highlighted.has(node.element);
          const wasCompressed = compressed.has(node.element);
          return (
            <g key={`${typeof node.element}:${String(node.element)}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r="23"
                className={`dsu-node ${node.root ? "dsu-node-root" : ""} ${isActive ? "dsu-node-active" : ""} ${wasCompressed ? "dsu-node-compressed" : ""}`}
              />
              <text x={node.x} y={node.y + 5} textAnchor="middle" className="dsu-node-label">{String(node.element)}</text>
              {node.root && <text x={node.x} y={node.y + 39} textAnchor="middle" className="dsu-root-label">ROOT</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DisjointSetPage() {
  const metadata = dataStructureMetadata.disjointSet;
  const [model, setModel] = useState(createSampleModel);
  const [elementsInput, setElementsInput] = useState("1, 2, 3, 4, 5, 6");
  const [firstIndex, setFirstIndex] = useState("1");
  const [secondIndex, setSecondIndex] = useState("5");
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackRevision, setPlaybackRevision] = useState(0);
  const [message, setMessage] = useState("Sample sets are ready. Find follows parent links; Union merges components by size.");
  const [selectedPractice, setSelectedPractice] = useState(disjointSetPracticeSets[0]);

  const { disjointSet, steps } = model;
  const activeStep = steps[playbackIndex] ?? steps[0] ?? null;
  const values = disjointSet.elements;
  const firstValue = values[Number(firstIndex)];
  const secondValue = values[Number(secondIndex)];

  const updateAfterOperation = (resultMessage) => {
    setModel({ disjointSet, steps: disjointSet.getSteps() });
    setPlaybackIndex(0);
    setPlaybackRevision((revision) => revision + 1);
    setMessage(resultMessage);
  };

  const initialize = () => {
    const nextValues = parseElements(elementsInput);
    const nextSet = new DisjointSet(nextValues);
    const duplicatesIgnored = nextValues.length - nextSet.elements.length;
    const nextMessage = duplicatesIgnored
      ? `Initialized ${nextSet.elements.length} unique elements; ignored ${duplicatesIgnored} duplicate${duplicatesIgnored === 1 ? "" : "s"}.`
      : `Initialized ${nextSet.elements.length} disjoint component${nextSet.elements.length === 1 ? "" : "s"}.`;
    setModel({
      disjointSet: nextSet,
      steps: [nextSet.getSnapshot("Initialize disjoint sets", "Every unique element starts as its own root component.")],
    });
    setFirstIndex("0");
    setSecondIndex(nextSet.elements.length > 1 ? "1" : "0");
    setPlaybackIndex(0);
    setPlaybackRevision((revision) => revision + 1);
    setMessage(nextMessage);
  };

  const findElement = () => {
    const root = disjointSet.find(firstValue);
    updateAfterOperation(`Find(${String(firstValue)}) returned representative ${String(root)}.`);
  };

  const unionElements = () => {
    const merged = disjointSet.union(firstValue, secondValue);
    updateAfterOperation(merged
      ? `Union(${String(firstValue)}, ${String(secondValue)}) merged two components.`
      : `${String(firstValue)} and ${String(secondValue)} were already in the same component.`);
  };

  const checkConnected = () => {
    const connected = disjointSet.connected(firstValue, secondValue);
    updateAfterOperation(`${String(firstValue)} and ${String(secondValue)} are ${connected ? "connected" : "not connected"}.`);
  };

  const canOperate = values.length > 0;

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 5 · DISJOINT SET UNION</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <h3>Build and query components</h3>
          <div className="toolbar">
            <div className="dsu-input">
              <label htmlFor="dsu-elements">ELEMENTS (comma-separated)</label>
              <input id="dsu-elements" value={elementsInput} onChange={(event) => setElementsInput(event.target.value)} />
            </div>
          </div>
          <div className="action-grid">
            <button className="primary-btn" onClick={initialize}>Initialize sets</button>
            <button className="secondary-btn" onClick={() => {
              const nextModel = createSampleModel();
              setModel(nextModel);
              setElementsInput("1, 2, 3, 4, 5, 6");
              setFirstIndex("1");
              setSecondIndex("5");
              setPlaybackIndex(0);
              setPlaybackRevision((revision) => revision + 1);
              setMessage("Restored the sample components.");
            }}>Reset example</button>
          </div>
          <div className="toolbar">
            <div>
              <label htmlFor="dsu-first">ELEMENT</label>
              <select id="dsu-first" value={firstIndex} onChange={(event) => setFirstIndex(event.target.value)} disabled={!canOperate}>
                {values.map((value, index) => <option key={`${typeof value}:${String(value)}:${index}`} value={String(index)}>{String(value)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="dsu-second">SECOND ELEMENT</label>
              <select id="dsu-second" value={secondIndex} onChange={(event) => setSecondIndex(event.target.value)} disabled={!canOperate}>
                {values.map((value, index) => <option key={`${typeof value}:${String(value)}:${index}`} value={String(index)}>{String(value)}</option>)}
              </select>
            </div>
          </div>
          <div className="action-grid">
            <button className="secondary-btn" onClick={findElement} disabled={!canOperate}>Find representative</button>
            <button className="secondary-btn" onClick={unionElements} disabled={!canOperate}>Union components</button>
            <button className="secondary-btn" onClick={checkConnected} disabled={!canOperate}>Check connected</button>
          </div>
          <div className="status-box" role="status">{message}</div>
        </div>

        <div className="panel-card">
          <h3>Why Union-Find?</h3>
          <p className="stack-demo-summary">{disjointSetLearning.introduction}</p>
          <p className="stack-demo-summary">{disjointSetLearning.comparison}</p>
          <div className="info-grid compact-grid">
            <div className="info-card"><h4>Components</h4><p>{activeStep?.componentCount ?? 0}</p></div>
            <div className="info-card"><h4>Elements</h4><p>{activeStep?.elements.length ?? 0}</p></div>
            <div className="info-card"><h4>Current operation</h4><p>{activeStep?.operation ?? "—"}</p></div>
          </div>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>Parent forest</h3>
          <p className="stack-demo-summary">Each arrow points from a node to its parent. Roots are the component representatives; highlighted paths show the current operation.</p>
          <DisjointSetForest snapshot={activeStep} />
          <div className="info-grid compact-grid">
            <div className="info-card"><h4>Representatives</h4><p>{activeStep?.roots?.map(String).join(", ") || "None"}</p></div>
            <div className="info-card"><h4>Path</h4><p>{activeStep?.currentPath?.map(String).join(" → ") || "None"}</p></div>
            <div className="info-card"><h4>Compressed</h4><p>{activeStep?.compressed?.map(String).join(", ") || "None"}</p></div>
          </div>
          <PlaybackPanel
            key={playbackRevision}
            steps={steps}
            title="Find and union operations"
            speed={700}
            onStepChange={(nextStatus) => setPlaybackIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Component membership</h3>
          <div className="snapshot-grid">
            {(activeStep?.components ?? []).map((component, componentIndex) => (
              <div className="snapshot-box" key={component.map((item) => `${typeof item}:${String(item)}`).join("|")}>
                <strong>Root: {String(activeStep.roots[componentIndex])}</strong>
                <span>Size: {component.length}</span>
                <span>Members: {component.map(String).join(", ")}</span>
              </div>
            ))}
          </div>
          <div className="result-box"><strong>Result:</strong> {activeStep?.result === null || activeStep?.result === undefined ? "—" : String(activeStep.result)}</div>
          <div className="result-box"><strong>Step:</strong> {activeStep?.label ?? "No operation yet"}</div>
          <div className="result-box"><strong>Explanation:</strong> {activeStep?.explanation ?? "Choose an operation to begin."}</div>
          <div className="info-card"><h4>Real-world applications</h4><p>{disjointSetLearning.applications}</p></div>
        </div>
      </div>

      <div className="info-grid">
        {disjointSetComplexity.map((item) => <div key={item.title} className="info-card"><h4>{item.title}</h4><p>{item.description}</p></div>)}
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">PRACTICE</p><h2>Union-Find challenges</h2></div></div>
        <div className="practice-list">
          {disjointSetPracticeSets.map((problem) => (
            <button key={problem.title} className={`practice-item ${selectedPractice.title === problem.title ? "selected" : ""}`} onClick={() => setSelectedPractice(problem)}>
              <span>{problem.title}</span><small>{problem.difficulty}</small>
            </button>
          ))}
        </div>
        <CodeViewer title={selectedPractice.title} summary={selectedPractice.statement} code={selectedPractice.solution} explanation={`${selectedPractice.explanation} ${selectedPractice.complexity}`} />
      </div>

      <div className="collection-panel">
        <div className="section-heading compact"><div><p className="eyebrow">LEARN</p><h2>Path compression and union by size</h2></div></div>
        <div className="info-grid">
          <div className="info-card"><h4>Path compression</h4><p>{disjointSetLearning.pathCompression}</p></div>
          <div className="info-card"><h4>Union by size</h4><p>{disjointSetLearning.unionBySize}</p></div>
          <div className="info-card"><h4>Applications</h4><p>{disjointSetLearning.applications}</p></div>
        </div>
        <CodeViewer title="DSU pseudocode" summary="Find a representative, compress paths, and merge roots by component size." code={disjointSetLearning.pseudocode} explanation="The representative identifies the component. Only distinct roots can be joined; path compression shortens routes after each find." />
        <CodeViewer title="JavaScript implementation" summary="A Map-based Union-Find with path compression and union by size." code={disjointSetLearning.implementation} explanation="This example supports values as map keys. The interactive implementation additionally validates element values, reports component sizes/counts, and records immutable playback snapshots." />
      </div>
    </section>
  );
}

export default DisjointSetPage;
