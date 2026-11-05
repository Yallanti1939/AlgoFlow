import { useMemo, useState } from "react";

import HeapVisualizer from "../components/visualizers/HeapVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { HeapSortAlgorithm } from "../data-structures/heapSort";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { heapSortCode, heapSortComplexity, heapSortPracticeSets } from "../data/learningModules";

const defaultValues = [12, 3, 9, 5, 18, 7, 1, 15];

function parseInput(value) {
  const cleaned = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => Number(entry));

  return cleaned.filter((entry) => Number.isFinite(entry));
}

function HeapSortPage() {
  const metadata = dataStructureMetadata.heapSort ?? {
    title: "Heap Sort",
    overview: "Heap sort repeatedly places the current maximum at the end of the unsorted section and reheapifies the remaining structure.",
  };

  const [inputValue, setInputValue] = useState(defaultValues.join(", "));
  const [steps, setSteps] = useState(() => new HeapSortAlgorithm(defaultValues).sort(defaultValues));
  const [selectedPractice, setSelectedPractice] = useState(heapSortPracticeSets[0]);
  const [status, setStatus] = useState("Ready");
  const [playbackIndex, setPlaybackIndex] = useState(0);

  const activeStep = steps[playbackIndex] ?? steps[0] ?? null;

  const finalSortedArray = useMemo(() => {
    const lastStep = steps.at(-1);
    return lastStep?.values ?? defaultValues.slice().sort((a, b) => a - b);
  }, [steps]);

  const currentHeap = useMemo(() => ({
    toArray: () => activeStep?.values ?? [],
  }), [activeStep]);

  const handleSort = () => {
    const parsed = parseInput(inputValue);

    if (parsed.length === 0) {
      setStatus("Enter at least one numeric value before running heap sort.");
      return;
    }

    const nextSteps = new HeapSortAlgorithm(parsed).sort(parsed);
    setSteps(nextSteps);
    setPlaybackIndex(0);
    setStatus(`Sorted ${parsed.length} values with heap sort.`);
  };

  const handleReset = () => {
    setInputValue(defaultValues.join(", "));
    const resetSteps = new HeapSortAlgorithm(defaultValues).sort(defaultValues);
    setSteps(resetSteps);
    setPlaybackIndex(0);
    setStatus("Reset to the default example.");
  };

  const activeDescription = activeStep
    ? `${activeStep.label} — ${activeStep.explanation}`
    : "No active step available.";

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 4 · HEAP SORT</p>
          <h2>{metadata.title}</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>ARRAY INPUT</label>
              <input value={inputValue} onChange={(event) => setInputValue(event.target.value)} />
            </div>
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={handleSort}>Run heap sort</button>
            <button className="secondary-btn" onClick={handleReset}>Reset</button>
          </div>

          <div className="status-box">Status: {status}</div>
        </div>

        <div className="panel-card">
          <h3>Why heap sort?</h3>
          <p className="stack-demo-summary">
            Heap sort uses the max-heap property to repeatedly extract the current maximum and place it at the end of the unsorted section.
          </p>
          <p className="stack-demo-summary">
            Its strength comes from <strong>O(log n)</strong> reheapification after each swap, giving a total running time of <strong>O(n log n)</strong> without extra memory.
          </p>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>Heap visualization</h3>
          <HeapVisualizer
            heap={currentHeap}
            mode="max"
            highlightedIndices={activeStep?.heapIndices ?? []}
            comparedIndices={activeStep?.compared ?? []}
            swappedIndices={activeStep?.swapped ?? []}
          />

          <div className="info-grid compact-grid">
            <div className="info-card">
              <h4>Current heap</h4>
              <p>{activeStep?.values?.join(", ") ?? "[]"}</p>
            </div>
            <div className="info-card">
              <h4>Sorted tail</h4>
              <p>{activeStep?.sortedIndices?.length ? activeStep.sortedIndices.map((index) => activeStep.values[index]).join(", ") : "None yet"}</p>
            </div>
            <div className="info-card">
              <h4>Final result</h4>
              <p>{finalSortedArray.join(", ")}</p>
            </div>
          </div>

          <PlaybackPanel
            steps={steps}
            title="Heap sort playback"
            speed={700}
            onStepChange={(nextStatus) => setPlaybackIndex(nextStatus.index)}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>Live explanation</h3>
          <div className="result-box">
            <strong>Active step:</strong> {activeDescription}
          </div>

          <div className="snapshot-grid">
            {steps.slice(0, 8).map((step, index) => (
              <div key={`${step.label}-${index}`} className="snapshot-box">
                <strong>{step.label}</strong>
                <span>{step.values.join(", ") || "[]"}</span>
              </div>
            ))}
          </div>

          <div className="result-box">
            <strong>Original array:</strong> {parseInput(inputValue).join(", ") || "[]"}
          </div>
          <div className="result-box">
            <strong>Sorted array:</strong> {finalSortedArray.join(", ") || "[]"}
          </div>
        </div>
      </div>

      <div className="info-grid">
        {heapSortComplexity.map((item) => (
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
            <h2>Heap sort challenges</h2>
          </div>
        </div>

        <div className="practice-list">
          {heapSortPracticeSets.map((problem) => (
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
            <h2>Heap sort pseudocode</h2>
          </div>
        </div>

        <CodeViewer
          title="Heap sort pattern"
          summary={heapSortCode.summary}
          code={heapSortCode.code}
          explanation={heapSortCode.explanation}
        />
      </div>
    </section>
  );
}

export default HeapSortPage;
