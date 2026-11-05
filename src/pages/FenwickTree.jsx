import { useMemo, useState } from "react";

import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import FenwickTreeVisualizer from "../components/visualizers/FenwickTreeVisualizer";
import { FenwickTree } from "../data-structures/advanced-trees/fenwickTree";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { fenwickTreeCode, fenwickTreeComplexity, fenwickTreePracticeSets } from "../data/learningModules";

const defaultValues = [5, 2, 7, 1, 4];

function parseValues(raw) {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

function FenwickTreePage() {
  const metadata = dataStructureMetadata.fenwickTree ?? {
    title: "Fenwick Tree",
    overview: "Fenwick trees maintain prefix sums efficiently and support logarithmic point updates and range queries.",
  };

  const [inputValue, setInputValue] = useState(defaultValues.join(", "));
  const [tree, setTree] = useState(() => new FenwickTree(defaultValues));
  const [steps, setSteps] = useState(() => {
    const initial = new FenwickTree(defaultValues);
    return [
      {
        label: "Build Fenwick tree",
        explanation: "Every index stores a cumulative summary so updates and prefix sums can be handled in logarithmic time.",
        highlighted: [],
        range: null,
        result: null,
        before: null,
        after: null,
        array: [...initial.values],
        bit: [...initial.tree],
        nodes: initial.values.map((value, index) => ({ index, value, bitValue: initial.tree[index + 1] ?? 0 })),
      },
    ];
  });
  const [selectedPractice, setSelectedPractice] = useState(fenwickTreePracticeSets[0]);
  const [status, setStatus] = useState("Ready");
  const [prefixIndex, setPrefixIndex] = useState("3");
  const [rangeStart, setRangeStart] = useState("1");
  const [rangeEnd, setRangeEnd] = useState("4");
  const [pointIndex, setPointIndex] = useState("2");
  const [pointValue, setPointValue] = useState("9");
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const activeStep = steps[activeStepIndex] ?? steps[0] ?? null;

  const currentResult = useMemo(() => {
    if (!activeStep) {
      return "No result yet";
    }

    if (typeof activeStep.result === "number") {
      return String(activeStep.result);
    }

    return activeStep.result ?? "No result yet";
  }, [activeStep]);

  const handleBuildTree = () => {
    const parsed = parseValues(inputValue);

    if (parsed.length === 0) {
      setStatus("Enter at least one number to build the Fenwick tree.");
      return;
    }

    const nextTree = new FenwickTree(parsed);
    const buildStep = {
      label: "Build Fenwick tree",
      explanation: "The BIT stores partial aggregates that allow fast prefix queries and efficient point updates.",
      highlighted: [],
      range: null,
      result: null,
      before: null,
      after: null,
      array: [...nextTree.values],
      bit: [...nextTree.tree],
      nodes: nextTree.values.map((value, index) => ({ index, value, bitValue: nextTree.tree[index + 1] ?? 0 })),
    };

    setTree(nextTree);
    setSteps([buildStep]);
    setActiveStepIndex(0);
    setStatus(`Built a Fenwick tree for ${parsed.join(", ")}.`);
  };

  const handlePrefixQuery = () => {
    const parsed = parseValues(inputValue);
    if (parsed.length === 0) {
      setStatus("Build the tree first before querying it.");
      return;
    }

    const nextTree = new FenwickTree(tree.values);
    const index = Number(prefixIndex);
    const stepList = nextTree.prefixSum(index);

    setTree(nextTree);
    setSteps(stepList);
    setActiveStepIndex(0);
    setStatus(`Prefix sum for index ${index} computed.`);
  };

  const handleRangeQuery = () => {
    const parsed = parseValues(inputValue);
    if (parsed.length === 0) {
      setStatus("Build the tree first before range queries.");
      return;
    }

    const nextTree = new FenwickTree(tree.values);
    const left = Number(rangeStart);
    const right = Number(rangeEnd);
    const stepList = nextTree.rangeSum(left, right);

    setTree(nextTree);
    setSteps(stepList);
    setActiveStepIndex(0);
    setStatus(`Range sum [${left}, ${right}] computed.`);
  };

  const handlePointUpdate = () => {
    const parsed = parseValues(inputValue);
    if (parsed.length === 0) {
      setStatus("Build the tree before updating a value.");
      return;
    }

    const nextTree = new FenwickTree(tree.values);
    const index = Number(pointIndex);
    const value = Number(pointValue);
    const stepList = nextTree.pointUpdate(index, value);

    setTree(nextTree);
    setSteps(stepList);
    setActiveStepIndex(0);
    setStatus(`Updated index ${index} to ${value}.`);
  };

  const handleReset = () => {
    const nextTree = new FenwickTree(defaultValues);
    setInputValue(defaultValues.join(", "));
    setTree(nextTree);
    setSteps([
      {
        label: "Reset to defaults",
        explanation: "The default sample array has been restored and the Fenwick tree rebuilt.",
        highlighted: [],
        range: null,
        result: null,
        before: null,
        after: null,
        array: [...nextTree.values],
        bit: [...nextTree.tree],
        nodes: nextTree.values.map((value, index) => ({ index, value, bitValue: nextTree.tree[index + 1] ?? 0 })),
      },
    ]);
    setActiveStepIndex(0);
    setStatus("Reset to the default sample.");
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 4 · FENWICK TREE</p>
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
          </div>

          <div className="toolbar">
            <div>
              <label>PREFIX INDEX</label>
              <input value={prefixIndex} onChange={(event) => setPrefixIndex(event.target.value)} />
            </div>
            <div>
              <label>POINT INDEX</label>
              <input value={pointIndex} onChange={(event) => setPointIndex(event.target.value)} />
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
              <label>NEW VALUE</label>
              <input value={pointValue} onChange={(event) => setPointValue(event.target.value)} />
            </div>
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={handleBuildTree}>Build tree</button>
            <button className="secondary-btn" onClick={handlePrefixQuery}>Prefix sum</button>
            <button className="secondary-btn" onClick={handleRangeQuery}>Range sum</button>
            <button className="secondary-btn" onClick={handlePointUpdate}>Point update</button>
            <button className="secondary-btn" onClick={handleReset}>Reset</button>
          </div>

          <div className="status-box">Status: {status}</div>
          <div className="status-box">Current result: {currentResult}</div>
        </div>

        <div className="panel-card">
          <h3>Fenwick tree overview</h3>
          <p className="stack-demo-summary"><strong>Prefix sums:</strong> each index stores a partial total so cumulative sums are easy to compute.</p>
          <p className="stack-demo-summary"><strong>Point updates:</strong> increment or decrement the BIT along the index update path.</p>
          <p className="stack-demo-summary"><strong>Range query:</strong> subtract two prefix sums to get any range total.</p>
          <p className="stack-demo-summary"><strong>Array:</strong> {tree.values.join(", ") || "[]"}</p>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>BIT visualization</h3>
          <FenwickTreeVisualizer
            values={activeStep?.array ?? tree.values}
            bit={activeStep?.bit ?? tree.tree}
            highlighted={activeStep?.highlighted ?? []}
            range={activeStep?.range ?? null}
            explanation={activeStep?.explanation ?? "No active step"}
            result={activeStep?.result ?? null}
            before={activeStep?.before ?? null}
            after={activeStep?.after ?? null}
          />

          <PlaybackPanel
            steps={steps}
            title="Fenwick Tree playback"
            speed={650}
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
        {fenwickTreeComplexity.map((item) => (
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
            <h2>Fenwick tree problems</h2>
          </div>
        </div>

        <div className="practice-list">
          {fenwickTreePracticeSets.map((problem) => (
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
            <h2>Fenwick tree pattern</h2>
          </div>
        </div>

        <CodeViewer
          title="Fenwick Tree operations"
          summary={fenwickTreeCode.summary}
          code={fenwickTreeCode.code}
          explanation={fenwickTreeCode.explanation}
        />
      </div>
    </section>
  );
}

export default FenwickTreePage;
