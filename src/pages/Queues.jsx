import { useMemo, useState } from "react";
import QueueVisualizer from "../components/visualizers/QueueVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { CircularQueue, Deque, PriorityQueue, QueueUsingStacks, SimpleQueue } from "../data-structures/queues";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { complexityPanels, modulePracticeSets } from "../data/learningModules";

const queueMap = {
  simple: SimpleQueue,
  circular: CircularQueue,
  priority: PriorityQueue,
  deque: Deque,
  stackQueue: QueueUsingStacks,
};

function Queues() {
  const [queueType, setQueueType] = useState("simple");
  const [value, setValue] = useState("40");
  const [priority, setPriority] = useState("1");
  const [status, setStatus] = useState("Ready");
  const [queue, setQueue] = useState(() => new SimpleQueue(6, [10, 20, 30]));
  const [selectedPractice, setSelectedPractice] = useState(modulePracticeSets.queues[0]);

  const metadata = dataStructureMetadata.queues;
  const values = useMemo(() => queue.toArray(), [queue]);
  const playbackSteps = [
    { label: "Queue initialization", explanation: `Queue starts with ${values.join(", ") || "no values"}.` },
    { label: "Entry operation", explanation: `The system enqueues, dequeues, and reorders items according to FIFO or priority rules.` },
    { label: "Result", explanation: "The head pointer or priority order determines the next item to process." },
  ];

  const handleTypeChange = (nextType) => {
    setQueueType(nextType);
    if (nextType === "simple") setQueue(new SimpleQueue(6, [10, 20, 30]));
    if (nextType === "circular") setQueue(new CircularQueue(5, [10, 20, 30]));
    if (nextType === "priority") setQueue(new PriorityQueue([{ value: 10, priority: 2 }, { value: 20, priority: 1 }, { value: 30, priority: 3 }]));
    if (nextType === "deque") setQueue(new Deque([10, 20, 30]));
    if (nextType === "stackQueue") setQueue(new QueueUsingStacks([10, 20, 30]));
  };

  const applyOperation = (operation) => {
    const QueueClass = queueMap[queueType];
    const nextQueue = new QueueClass(
      queueType === "simple" ? 6 : queueType === "circular" ? 5 : queueType === "priority" ? undefined : queueType === "deque" ? undefined : undefined,
      queueType === "simple" || queueType === "circular" || queueType === "stackQueue" ? values : undefined
    );

    switch (operation) {
      case "enqueue":
        if (queueType === "priority") {
          nextQueue.enqueue(Number(value), Number(priority));
          setStatus(`Enqueued ${value} with priority ${priority}`);
        } else {
          nextQueue.enqueue(Number(value));
          setStatus(`Enqueued ${value}`);
        }
        break;
      case "dequeue":
        setStatus(`Dequeued: ${nextQueue.dequeue() ?? "none"}`);
        break;
      case "front":
        setStatus(`Front: ${nextQueue.front() ?? "none"}`);
        break;
      case "rear":
        setStatus(`Rear: ${nextQueue.rear ? nextQueue.rear() ?? "none" : nextQueue.rearValue ? nextQueue.rearValue() ?? "none" : "none"}`);
        break;
      case "clear":
        nextQueue.clear();
        setStatus("Queue cleared");
        break;
      default:
        break;
    }

    setQueue(nextQueue);
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">LINEAR DATA STRUCTURES</p>
          <h2>Queues</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>QUEUE TYPE</label>
              <select value={queueType} onChange={(event) => handleTypeChange(event.target.value)}>
                <option value="simple">Simple Queue</option>
                <option value="circular">Circular Queue</option>
                <option value="priority">Priority Queue</option>
                <option value="deque">Deque</option>
                <option value="stackQueue">Queue using Stacks</option>
              </select>
            </div>
            <div>
              <label>VALUE</label>
              <input value={value} onChange={(event) => setValue(event.target.value)} />
            </div>
            {queueType === "priority" && (
              <div>
                <label>PRIORITY</label>
                <input value={priority} onChange={(event) => setPriority(event.target.value)} />
              </div>
            )}
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={() => applyOperation("enqueue")}>Enqueue</button>
            <button className="secondary-btn" onClick={() => applyOperation("dequeue")}>Dequeue</button>
            <button className="secondary-btn" onClick={() => applyOperation("front")}>Front</button>
            <button className="secondary-btn" onClick={() => applyOperation("rear")}>Rear</button>
            <button className="secondary-btn" onClick={() => applyOperation("clear")}>Clear</button>
          </div>

          <div className="status-box">Status: {status}</div>
        </div>

        <div className="panel-card">
          <h3>Visualization</h3>
          <QueueVisualizer values={values} front={queue.front ? queue.front() : null} rear={queue.rear ? queue.rear() : queue.rearValue ? queue.rearValue() : null} />
        </div>
      </div>

      <div className="panel-card">
        <PlaybackPanel steps={playbackSteps} title="Queue behavior" speed={700} />
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h4>FIFO order</h4>
          <p>Queues process items in the same order they arrived, which makes them useful for pipelines and breadth-first search.</p>
        </div>
        <div className="info-card">
          <h4>Applications</h4>
          <p>Common uses include scheduling, buffering, printer tasks, and BFS traversal.</p>
        </div>
        <div className="info-card">
          <h4>Complexity</h4>
          <p>Enqueue and dequeue are O(1), and queue space usage grows with the number of elements.</p>
        </div>
      </div>

      <div className="collection-panel">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">PRACTICE</p>
            <h2>Queue practice problems</h2>
          </div>
        </div>

        <div className="practice-list">
          {modulePracticeSets.queues.map((problem) => (
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
          {complexityPanels.queues.map((entry) => (
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

export default Queues;
