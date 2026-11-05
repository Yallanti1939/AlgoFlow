import { useMemo, useState } from "react";
import StackVisualizer from "../components/visualizers/StackVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { StackArray, StackLinkedList } from "../data-structures/stacks";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { complexityPanels, modulePracticeSets, stackApplications } from "../data/learningModules";

const stackMap = {
  array: StackArray,
  linked: StackLinkedList,
};

function Stacks() {
  const [stackType, setStackType] = useState("array");
  const [value, setValue] = useState("25");
  const [status, setStatus] = useState("Ready");
  const [stack, setStack] = useState(() => new StackArray(6, [10, 20, 30]));
  const [selectedAppId, setSelectedAppId] = useState(stackApplications[0].id);
  const [demoInput, setDemoInput] = useState(stackApplications[0].input);
  const [demoResult, setDemoResult] = useState(() => stackApplications[0].runner(stackApplications[0].input));
  const [selectedPractice, setSelectedPractice] = useState(modulePracticeSets.stacks[0]);

  const metadata = dataStructureMetadata.stacks;
  const values = useMemo(() => stack.toArray(), [stack]);
  const selectedApp = stackApplications.find((app) => app.id === selectedAppId) ?? stackApplications[0];

  const applyOperation = (operation) => {
    const StackClass = stackMap[stackType];
    const nextStack = new StackClass(stackType === "array" ? 6 : undefined, values);

    switch (operation) {
      case "push":
        nextStack.push(Number(value));
        setStatus(`Pushed ${value}`);
        break;
      case "pop": {
        const popped = nextStack.pop();
        setStatus(popped === null ? "Underflow: stack is empty" : `Popped ${popped}`);
        break;
      }
      case "peek":
        setStatus(`Top value: ${nextStack.peek() ?? "none"}`);
        break;
      case "empty":
        setStatus(nextStack.isEmpty() ? "Stack is empty" : "Stack is not empty");
        break;
      case "clear":
        nextStack.clear();
        setStatus("Stack cleared");
        break;
      default:
        break;
    }

    setStack(nextStack);
  };

  const handleTypeChange = (nextType) => {
    setStackType(nextType);
    setStack(nextType === "array" ? new StackArray(6, [10, 20, 30]) : new StackLinkedList([10, 20, 30]));
  };

  const runDemo = () => {
    const nextResult = selectedApp.runner(demoInput);
    setDemoResult(nextResult);
  };

  const handleAppChange = (appId) => {
    const nextApp = stackApplications.find((app) => app.id === appId) ?? stackApplications[0];
    setSelectedAppId(nextApp.id);
    setDemoInput(nextApp.input);
    setDemoResult(nextApp.runner(nextApp.input));
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">LINEAR DATA STRUCTURES</p>
          <h2>Stacks</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>STACK TYPE</label>
              <select value={stackType} onChange={(event) => handleTypeChange(event.target.value)}>
                <option value="array">Array-based</option>
                <option value="linked">Linked list-based</option>
              </select>
            </div>
            <div>
              <label>VALUE</label>
              <input value={value} onChange={(event) => setValue(event.target.value)} />
            </div>
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={() => applyOperation("push")}>Push</button>
            <button className="secondary-btn" onClick={() => applyOperation("pop")}>Pop</button>
            <button className="secondary-btn" onClick={() => applyOperation("peek")}>Peek</button>
            <button className="secondary-btn" onClick={() => applyOperation("empty")}>IsEmpty</button>
            <button className="secondary-btn" onClick={() => applyOperation("clear")}>Clear</button>
          </div>

          <div className="status-box">Status: {status}</div>
        </div>

        <div className="panel-card">
          <h3>Visualization</h3>
          <StackVisualizer values={values} top={values[values.length - 1] ?? null} capacity={stackType === "array" ? 6 : null} />
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <div className="toolbar stacked-toolbar">
            <div>
              <label>APPLICATION</label>
              <select value={selectedAppId} onChange={(event) => handleAppChange(event.target.value)}>
                {stackApplications.map((app) => (
                  <option key={app.id} value={app.id}>{app.title}</option>
                ))}
              </select>
            </div>
            <div className="input-block">
              <label>INPUT</label>
              <input value={demoInput} onChange={(event) => setDemoInput(event.target.value)} />
            </div>
          </div>

          <div className="action-grid narrow-grid">
            <button className="primary-btn" onClick={runDemo}>Run demo</button>
          </div>

          <div className="result-box">
            <strong>Result:</strong> {demoResult?.result ?? "No result yet"}
          </div>

          <PlaybackPanel steps={demoResult?.steps ?? []} title={selectedApp.title} speed={700} />
        </div>

        <div className="panel-card wide-panel">
          <h3>Stack applications</h3>
          <div className="feature-list">
            {stackApplications.map((app) => (
              <button key={app.id} className={`feature-pill ${selectedAppId === app.id ? "selected" : ""}`} onClick={() => handleAppChange(app.id)}>
                {app.title}
              </button>
            ))}
          </div>
          <p className="stack-demo-summary">{selectedApp.description}</p>
          <p className="stack-demo-summary"><strong>Complexity:</strong> {selectedApp.complexity}</p>
          <p className="stack-demo-summary"><strong>Explanation:</strong> {selectedApp.explanation}</p>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h4>How it works</h4>
          <p>The newest element sits on top, and popping removes the top item first.</p>
        </div>
        <div className="info-card">
          <h4>Applications</h4>
          <p>Stacks are used in undo operations, recursion, browser history, and expression evaluation.</p>
        </div>
        <div className="info-card">
          <h4>Complexity</h4>
          <p>Push, pop, and peek are all O(1) on a stack. Search is O(n).</p>
        </div>
      </div>

      <div className="collection-panel">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">PRACTICE</p>
            <h2>Stack practice problems</h2>
          </div>
        </div>

        <div className="practice-list">
          {modulePracticeSets.stacks.map((problem) => (
            <button key={problem.title} className={`practice-item ${selectedPractice.title === problem.title ? "selected" : ""}`} onClick={() => setSelectedPractice(problem)}>
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
            <p className="eyebrow">ANALYSIS</p>
            <h2>Complexity analysis</h2>
          </div>
        </div>

        <div className="info-grid compact-grid">
          {complexityPanels.stacks.map((entry) => (
            <div key={entry.label} className="info-card">
              <h4>{entry.label}</h4>
              <p>{entry.details}</p>
              <small>{entry.note}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stacks;
