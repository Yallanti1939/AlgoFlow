import { useMemo, useState } from "react";
import HeapVisualizer from "../components/visualizers/HeapVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { MinHeap } from "../data-structures/minHeap";
import { MaxHeap } from "../data-structures/maxHeap";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { heapComplexity, heapPracticeSets, heapCode } from "../data/learningModules";

const defaultValues = [8, 3, 10, 1, 6, 14, 4, 7, 13, 2];

function cloneMinHeap(heap) {
  return new MinHeap(heap.toArray());
}

function cloneMaxHeap(heap) {
  return new MaxHeap(heap.toArray());
}

function HeapsPage() {
  const metadata = dataStructureMetadata.heaps;
  const [minHeap, setMinHeap] = useState(() => new MinHeap(defaultValues));
  const [maxHeap, setMaxHeap] = useState(() => new MaxHeap(defaultValues));
  const [inputValue, setInputValue] = useState("9");
  const [status, setStatus] = useState("Ready");
  const [selectedHullMode, setSelectedHullMode] = useState("min");
  const [selectedPractice, setSelectedPractice] = useState(heapPracticeSets[0]);
  const [minSteps, setMinSteps] = useState([]);
  const [maxSteps, setMaxSteps] = useState([]);
  const [minHighlights, setMinHighlights] = useState([]);
  const [maxHighlights, setMaxHighlights] = useState([]);
  const [minSwaps, setMinSwaps] = useState([]);
  const [maxSwaps, setMaxSwaps] = useState([]);
  const [minCompared, setMinCompared] = useState([]);
  const [maxCompared, setMaxCompared] = useState([]);

  const minSummary = useMemo(() => ({
    peak: minHeap.peek(),
    valid: minHeap.validateMinHeap(),
    size: minHeap.size,
  }), [minHeap]);

  const maxSummary = useMemo(() => ({
    peak: maxHeap.peek(),
    valid: maxHeap.validateMaxHeap(),
    size: maxHeap.size,
  }), [maxHeap]);

  const handleInsert = (mode) => {
    const parsed = Number(inputValue);
    if (Number.isNaN(parsed)) {
      setStatus("Please enter a valid number");
      return;
    }

    if (mode === "min") {
      const next = cloneMinHeap(minHeap);
      const steps = next.insertWithAnimation(parsed);
      setMinHeap(next);
      setMinSteps(steps);
      setMinHighlights(steps.at(-1)?.visited ?? []);
      setMinSwaps(steps.at(-1)?.changed ?? []);
      setMinCompared(steps.flatMap((step) => step.visited));
      setStatus(`Inserted ${parsed} into the min-heap`);
      return;
    }

    const next = cloneMaxHeap(maxHeap);
    const steps = next.insertWithAnimation(parsed);
    setMaxHeap(next);
    setMaxSteps(steps);
    setMaxHighlights(steps.at(-1)?.visited ?? []);
    setMaxSwaps(steps.at(-1)?.changed ?? []);
    setMaxCompared(steps.flatMap((step) => step.visited));
    setStatus(`Inserted ${parsed} into the max-heap`);
  };

  const handleExtract = (mode) => {
    if (mode === "min") {
      const next = cloneMinHeap(minHeap);
      const steps = next.extractMinWithAnimation();
      setMinHeap(next);
      setMinSteps(steps);
      setMinHighlights(steps.at(-1)?.visited ?? []);
      setMinSwaps(steps.at(-1)?.changed ?? []);
      setMinCompared(steps.flatMap((step) => step.visited));
      setStatus(`Extracted ${next.peek() ?? "nothing"} from the min-heap`);
      return;
    }

    const next = cloneMaxHeap(maxHeap);
    const steps = next.extractMaxWithAnimation();
    setMaxHeap(next);
    setMaxSteps(steps);
    setMaxHighlights(steps.at(-1)?.visited ?? []);
    setMaxSwaps(steps.at(-1)?.changed ?? []);
    setMaxCompared(steps.flatMap((step) => step.visited));
    setStatus(`Extracted ${next.peek() ?? "nothing"} from the max-heap`);
  };

  const handleDelete = (mode) => {
    const parsed = Number(inputValue);
    if (Number.isNaN(parsed)) {
      setStatus("Please enter a valid number");
      return;
    }

    if (mode === "min") {
      const next = cloneMinHeap(minHeap);
      const steps = next.deleteWithAnimation(parsed);
      setMinHeap(next);
      setMinSteps(steps);
      setMinHighlights(steps.at(-1)?.visited ?? []);
      setMinSwaps(steps.at(-1)?.changed ?? []);
      setMinCompared(steps.flatMap((step) => step.visited));
      setStatus(next.values.includes(parsed) ? `Delete failed for ${parsed}` : `Deleted ${parsed} from the min-heap`);
      return;
    }

    const next = cloneMaxHeap(maxHeap);
    const steps = next.deleteWithAnimation(parsed);
    setMaxHeap(next);
    setMaxSteps(steps);
    setMaxHighlights(steps.at(-1)?.visited ?? []);
    setMaxSwaps(steps.at(-1)?.changed ?? []);
    setMaxCompared(steps.flatMap((step) => step.visited));
    setStatus(next.values.includes(parsed) ? `Delete failed for ${parsed}` : `Deleted ${parsed} from the max-heap`);
  };

  const handleBuild = (mode) => {
    if (mode === "min") {
      const rebuilt = new MinHeap(defaultValues);
      setMinHeap(rebuilt);
      setMinSteps([]);
      setStatus("Min-heap rebuilt from the default array");
      return;
    }

    const rebuilt = new MaxHeap(defaultValues);
    setMaxHeap(rebuilt);
    setMaxSteps([]);
    setStatus("Max-heap rebuilt from the default array");
  };

  const handleReset = () => {
    setMinHeap(new MinHeap(defaultValues));
    setMaxHeap(new MaxHeap(defaultValues));
    setMinSteps([]);
    setMaxSteps([]);
    setStatus("Both heaps reset to the default sample");
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 4 · HEAP MODULE</p>
          <h2>Min Heap &amp; Max Heap</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>HEAP TYPE</label>
              <select value={selectedHullMode} onChange={(event) => setSelectedHullMode(event.target.value)}>
                <option value="min">Min Heap</option>
                <option value="max">Max Heap</option>
              </select>
            </div>
            <div>
              <label>VALUE</label>
              <input value={inputValue} onChange={(event) => setInputValue(event.target.value)} />
            </div>
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={() => handleInsert(selectedHullMode)}>Insert</button>
            <button className="secondary-btn" onClick={() => handleExtract(selectedHullMode)}>Extract</button>
            <button className="secondary-btn" onClick={() => handleDelete(selectedHullMode)}>Delete</button>
            <button className="secondary-btn" onClick={() => handleBuild(selectedHullMode)}>Build</button>
            <button className="secondary-btn" onClick={handleReset}>Reset</button>
          </div>

          <div className="status-box">Status: {status}</div>
        </div>

        <div className="panel-card">
          <h3>Heap fundamentals</h3>
          <p className="stack-demo-summary"><strong>Complete binary tree:</strong> Every level is full except maybe the last, filled left to right.</p>
          <p className="stack-demo-summary"><strong>Min-heap:</strong> Parent value is always smaller than or equal to both children.</p>
          <p className="stack-demo-summary"><strong>Max-heap:</strong> Parent value is always greater than or equal to both children.</p>
          <p className="stack-demo-summary"><strong>Array indexing:</strong> For index i, parent = floor((i - 1) / 2), left = 2i + 1, right = 2i + 2.</p>
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <h3>Min Heap</h3>
          <HeapVisualizer
            heap={minHeap}
            mode="min"
            highlightedIndices={minHighlights}
            comparedIndices={minCompared}
            swappedIndices={minSwaps}
          />
          <div className="info-grid compact-grid">
            <div className="info-card">
              <h4>Peak</h4>
              <p>{minSummary.peak ?? "None"}</p>
            </div>
            <div className="info-card">
              <h4>Valid</h4>
              <p>{minSummary.valid ? "Yes" : "No"}</p>
            </div>
            <div className="info-card">
              <h4>Size</h4>
              <p>{minSummary.size}</p>
            </div>
          </div>
          <PlaybackPanel steps={minSteps} title="Min heap playback" speed={700} />
        </div>

        <div className="panel-card wide-panel">
          <h3>Max Heap</h3>
          <HeapVisualizer
            heap={maxHeap}
            mode="max"
            highlightedIndices={maxHighlights}
            comparedIndices={maxCompared}
            swappedIndices={maxSwaps}
          />
          <div className="info-grid compact-grid">
            <div className="info-card">
              <h4>Peak</h4>
              <p>{maxSummary.peak ?? "None"}</p>
            </div>
            <div className="info-card">
              <h4>Valid</h4>
              <p>{maxSummary.valid ? "Yes" : "No"}</p>
            </div>
            <div className="info-card">
              <h4>Size</h4>
              <p>{maxSummary.size}</p>
            </div>
          </div>
          <PlaybackPanel steps={maxSteps} title="Max heap playback" speed={700} />
        </div>
      </div>

      <div className="info-grid">
        {heapComplexity.map((item) => (
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
            <h2>Heap problems</h2>
          </div>
        </div>

        <div className="practice-list">
          {heapPracticeSets.map((problem) => (
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
            <h2>Heap implementation patterns</h2>
          </div>
        </div>

        <CodeViewer
          title="Heapify pattern"
          summary={heapCode.summary}
          code={heapCode.code}
          explanation={heapCode.explanation}
        />
      </div>
    </section>
  );
}

export default HeapsPage;
