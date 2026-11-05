import { useMemo, useState } from "react";

import SegmentTreeVisualizer from "../components/visualizers/SegmentTreeVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { SegmentTree } from "../data-structures/advanced-trees/segmentTree";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { segmentTreeCode, segmentTreeComplexity, segmentTreePracticeSets } from "../data/learningModules";

const defaultValues = [8, 7, 3, 9, 5, 1];

function parseValues(raw) {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry));
}

function SegmentTreePage() {
  const metadata = dataStructureMetadata.segmentTree ?? {
    title: "Segment Tree",
    overview: "Segment trees split the array into intervals so range queries and updates can be handled efficiently with logarithmic time cost.",
  };

  const [inputValue, setInputValue] = useState(defaultValues.join(", "));
  const [tree, setTree] = useState(() => new SegmentTree(defaultValues));
  const [steps, setSteps] = useState(() => {
    const initialTree = new SegmentTree(defaultValues);
    return [
      {
        label: "Build segment tree",
        explanation: "The initial array is grouped into a balanced binary tree of ranges, each storing a summary value needed for fast queries.",
        visited: [],
        updated: [],
        range: null,
        result: null,
        mode: "sum",
        array: [...initialTree.values],
        tree: [...initialTree.tree],
        minTree: [...initialTree.minTree],
        lazy: [...initialTree.lazy],
        nodes: initialTree.describeTree("sum"),
      },
    ];
  });
  const [selectedPractice, setSelectedPractice] = useState(segmentTreePracticeSets[0]);
  const [status, setStatus] = useState("Ready");
  const [queryMode, setQueryMode] = useState("sum");
  const [queryStart, setQueryStart] = useState("1");
  const [queryEnd, setQueryEnd] = useState("4");
  const [pointIndex, setPointIndex] = useState("2");
  const [pointValue, setPointValue] = useState("10");
  const [rangeStart, setRangeStart] = useState("1");
  const [rangeEnd, setRangeEnd] = useState("4");
  const [rangeDelta, setRangeDelta] = useState("4");
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const activeStep = steps[activeStepIndex] ?? steps[0] ?? null;

  const currentResult = useMemo(() => {
    if (!activeStep) {
      return "No result yet";
    }

    if (typeof activeStep.result === "number") {
      return String(activeStep.result);
    }

    if (Array.isArray(activeStep.result)) {
      return activeStep.result.join(", ");
    }

    return "No result yet";
  }, [activeStep]);

  const handleBuildTree = () => {
    const parsed = parseValues(inputValue);

    if (parsed.length === 0) {
      setStatus("Enter at least one number to build the segment tree.");
      return;
    }

    const nextTree = new SegmentTree(parsed);
    const buildStep = {
      label: "Build segment tree",
      explanation: "The tree stores aggregate information for each range so updates and queries can be handled efficiently.",
      visited: [],
      updated: [],
      range: null,
      result: null,
      mode: queryMode,
      array: [...nextTree.values],
      tree: [...nextTree.tree],
      minTree: [...nextTree.minTree],
      lazy: [...nextTree.lazy],
      nodes: nextTree.describeTree(queryMode),
    };

    setTree(nextTree);
    setSteps([buildStep]);
    setActiveStepIndex(0);
    setStatus(`Built a segment tree for ${parsed.join(", ")}.`);
  };

  const handleRangeSum = () => {
    const parsed = parseValues(inputValue);
    if (parsed.length === 0) {
      setStatus("Build the tree first, then run a range sum query.");
      return;
    }

    const nextTree = new SegmentTree(tree.values);
    const left = Number(queryStart);
    const right = Number(queryEnd);
    const stepList = nextTree.rangeSumQuery(left, right);

    setTree(nextTree);
    setSteps(stepList);
    setActiveStepIndex(0);
    setStatus(`Range sum query for [${left}, ${right}] completed.`);
  };

  const handleRangeMin = () => {
    const parsed = parseValues(inputValue);
    if (parsed.length === 0) {
      setStatus("Build the tree first, then run a range minimum query.");
      return;
    }

    const nextTree = new SegmentTree(tree.values);
    const left = Number(queryStart);
    const right = Number(queryEnd);
    const stepList = nextTree.rangeMinQuery(left, right);

    setTree(nextTree);
    setSteps(stepList);
    setActiveStepIndex(0);
    setStatus(`Range minimum query for [${left}, ${right}] completed.`);
  };

  const handlePointUpdate = () => {
    const parsed = parseValues(inputValue);
    if (parsed.length === 0) {
      setStatus("Build the tree before updating a point.");
      return;
    }

    const nextTree = new SegmentTree(tree.values);
    const index = Number(pointIndex);
    const value = Number(pointValue);
    const stepList = nextTree.pointUpdate(index, value);

    setTree(nextTree);
    setSteps(stepList);
    setActiveStepIndex(0);
    setStatus(`Updated index ${index} to ${value}.`);
  };

  const handleRangeUpdate = () => {
    const parsed = parseValues(inputValue);
    if (parsed.length === 0) {
      setStatus("Build the tree before range updates.");
      return;
    }

    const nextTree = new SegmentTree(tree.values);
    const left = Number(rangeStart);
    const right = Number(rangeEnd);
    const delta = Number(rangeDelta);
    const stepList = nextTree.rangeUpdate(left, right, delta);

    setTree(nextTree);
    setSteps(stepList);
    setActiveStepIndex(0);
    setStatus(`Added ${delta} to [${left}, ${right}].`);
  };

  const handleReset = () => {
    setInputValue(defaultValues.join(", "));
    const nextTree = new SegmentTree(defaultValues);
    setTree(nextTree);
    setSteps([
      {
        label: "Reset to default array",
        explanation: "The default sample array has been restored and the segment tree rebuilt.",
        visited: [],
        updated: [],
        range: null,
        result: null,
        mode: "sum",
        array: [...nextTree.values],
        tree: [...nextTree.tree],
        minTree: [...nextTree.minTree],
        lazy: [...nextTree.lazy],
        nodes: nextTree.describeTree("sum"),
      },
    ]);
    setActiveStepIndex(0);
    setStatus("Reset to the default sample.");
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 4 · SEGMENT TREE</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>ARRAY</label>
              <input value={inputValue} onChange={(event) => setInputValue(event.target.value)} />
            </div>
            <div>
              <label>QUERY TYPE</label>
              <select value={queryMode} onChange={(event) => setQueryMode(event.target.value)}>
                <option value="sum">Range sum</option>
                <option value="min">Range min</option>
              </select>
            </div>
          </div>

          <div className="toolbar">
            <div>
              <label>QUERY START</label>
              <input value={queryStart} onChange={(event) => setQueryStart(event.target.value)} />
            </div>
            <div>
              <label>QUERY END</label>
              <input value={queryEnd} onChange={(event) => setQueryEnd(event.target.value)} />
            </div>
          </div>

          <div className="toolbar">
            <div>
              <label>POINT INDEX</label>
              <input value={pointIndex} onChange={(event) => setPointIndex(event.target.value)} />
            </div>
            <div>
              <label>NEW VALUE</label>
              <input value={pointValue} onChange={(event) => setPointValue(event.target.value)} />
            </div>
          </div>

          <div className="toolbar">
            <div>
              <label>RANGE START</label>
              <input value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} />
            </div>
            <div>
              <label>RANGE END</label>
              <input value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} />
            </div>
            <div>
              <label>DELTA</label>
              <input value={rangeDelta} onChange={(event) => setRangeDelta(event.target.value)} />
            </div>
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={handleBuildTree}>Build tree</button>
            <button className="secondary-btn" onClick={() => (queryMode === "sum" ? handleRangeSum() : handleRangeMin())}>Query range</button>
            <button className="secondary-btn" onClick={handlePointUpdate}>Point update</button>
            <button className="secondary-btn" onClick={handleRangeUpdate}>Range update</button>
            <button className="secondary-btn" onClick={handleReset}>Reset</button>
          </div>

          <div className="status-box">Status: {status}</div>
          <div className="status-box">Current result: {currentResult}</div>
        </div>

        <div className="panel-card">
          <h3>Segment tree overview</h3>
          <p className="stack-demo-summary"><strong>Range sum:</strong> each node stores the sum of its interval.</p>
          <p className="stack-demo-summary"><strong>Range min:</strong> each node stores the minimum value in its interval.</p>
          <p className="stack-demo-summary"><strong>Lazy propagation:</strong> updates can mark a node as needing a bulk adjustment without fully descending into every child.</p>
          <p className="stack-demo-summary"><strong>Array:</strong> {tree.values.join(", ") || "[]"}</p>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>Tree visualization</h3>
          <SegmentTreeVisualizer
            nodes={activeStep?.nodes ?? tree.describeTree(queryMode)}
            highlightedNodeIds={activeStep?.visited ?? []}
            updatedNodeIds={activeStep?.updated ?? []}
            lazyNodeIds={activeStep?.lazy ? activeStep.lazy.map((value, index) => (value !== 0 ? index : null)).filter((value) => value !== null) : []}
            activeRange={activeStep?.range ?? null}
          />

          <div className="info-grid compact-grid">
            <div className="info-card">
              <h4>Current array</h4>
              <p>{activeStep?.array?.join(", ") ?? tree.values.join(", ")}</p>
            </div>
            <div className="info-card">
              <h4>Active range</h4>
              <p>{activeStep?.range ? `[${activeStep.range.start}, ${activeStep.range.end}]` : "N/A"}</p>
            </div>
            <div className="info-card">
              <h4>Lazy flags</h4>
              <p>{activeStep?.lazy?.some((value) => value !== 0) ? "Visible" : "None"}</p>
            </div>
          </div>

          <PlaybackPanel
            steps={steps}
            title="Segment tree playback"
            speed={700}
            onStepChange={(nextStatus) => setActiveStepIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Operation detail</h3>
          <div className="result-box">
            <strong>Active step:</strong> {activeStep ? `${activeStep.label} — ${activeStep.explanation}` : "No active step"}
          </div>

          <div className="snapshot-grid">
            {steps.slice(0, 8).map((step, index) => (
              <div key={`${step.label}-${index}`} className="snapshot-box">
                <strong>{step.label}</strong>
                <span>{step.array?.join(", ") || "[]"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="info-grid">
        {segmentTreeComplexity.map((item) => (
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
            <h2>Segment tree problems</h2>
          </div>
        </div>

        <div className="practice-list">
          {segmentTreePracticeSets.map((problem) => (
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
            <h2>Segment tree pattern</h2>
          </div>
        </div>

        <CodeViewer
          title="Segment tree operations"
          summary={segmentTreeCode.summary}
          code={segmentTreeCode.code}
          explanation={segmentTreeCode.explanation}
        />
      </div>
    </section>
  );
}

export default SegmentTreePage;
