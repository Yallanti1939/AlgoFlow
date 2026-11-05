import { useMemo, useState } from "react";
import HashTableVisualizer from "../components/visualizers/HashTableVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { HashTable } from "../data-structures/hashing";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { complexityPanels, modulePracticeSets } from "../data/learningModules";

const strategyMap = {
  linear: "linear",
  quadratic: "quadratic",
  double: "double",
  chaining: "separate-chaining",
};

function Hashing() {
  const [strategy, setStrategy] = useState("linear");
  const [key, setKey] = useState("A");
  const [value, setValue] = useState("10");
  const [status, setStatus] = useState("Ready");
  const [table, setTable] = useState(() => new HashTable(7, "linear"));
  const [selectedPractice, setSelectedPractice] = useState(modulePracticeSets.hashing[0]);

  const metadata = dataStructureMetadata.hashing;
  const displayTable = useMemo(() => table.toDisplay(), [table]);
  const playbackSteps = [
    { label: "Hash computation", explanation: `The key ${key} is hashed into the table using the ${strategy} strategy.` },
    { label: "Collision handling", explanation: "If the bucket is occupied, the algorithm probes or chains until it finds a valid slot." },
    { label: "Result", explanation: "The key and value remain retrievable in constant average time when the table is well distributed." },
  ];

  const handleStrategyChange = (nextStrategy) => {
    setStrategy(nextStrategy);
    setTable(new HashTable(7, strategyMap[nextStrategy]));
    setStatus(`${nextStrategy} probing strategy ready`);
  };

  const applyOperation = (operation) => {
    const nextTable = new HashTable(7, strategyMap[strategy]);
    nextTable.table = table.table.map((bucket) => (Array.isArray(bucket) ? [...bucket] : bucket ? { ...bucket } : bucket));

    switch (operation) {
      case "insert":
        nextTable.insert(key, value);
        setStatus(`Inserted key ${key} with value ${value}`);
        break;
      case "search":
        setStatus(`Search result for ${key}: ${nextTable.search(key) ?? "not found"}`);
        break;
      case "delete":
        setStatus(nextTable.delete(key) ? `Deleted key ${key}` : `Key ${key} not found`);
        break;
      case "clear":
        nextTable.clear();
        setStatus("Hash table cleared");
        break;
      default:
        break;
    }

    setTable(nextTable);
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">HASHING</p>
          <h2>Hash Tables</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>STRATEGY</label>
              <select value={strategy} onChange={(event) => handleStrategyChange(event.target.value)}>
                <option value="linear">Linear Probing</option>
                <option value="quadratic">Quadratic Probing</option>
                <option value="double">Double Hashing</option>
                <option value="chaining">Separate Chaining</option>
              </select>
            </div>
            <div>
              <label>KEY</label>
              <input value={key} onChange={(event) => setKey(event.target.value)} />
            </div>
            <div>
              <label>VALUE</label>
              <input value={value} onChange={(event) => setValue(event.target.value)} />
            </div>
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={() => applyOperation("insert")}>Insert</button>
            <button className="secondary-btn" onClick={() => applyOperation("search")}>Search</button>
            <button className="secondary-btn" onClick={() => applyOperation("delete")}>Delete</button>
            <button className="secondary-btn" onClick={() => applyOperation("clear")}>Clear</button>
          </div>

          <div className="status-box">Status: {status}</div>
        </div>

        <div className="panel-card">
          <h3>Visualization</h3>
          <HashTableVisualizer buckets={displayTable} />
        </div>
      </div>

      <div className="panel-card">
        <PlaybackPanel steps={playbackSteps} title="Hash table probing" speed={700} />
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h4>Collision handling</h4>
          <p>When a hash collision happens, a probing strategy or separate chaining resolves the conflict.</p>
        </div>
        <div className="info-card">
          <h4>Examples</h4>
          <p>Hash tables are used in character frequency counters, dictionary lookups, and duplicate detection.</p>
        </div>
        <div className="info-card">
          <h4>Complexity</h4>
          <p>Average-case insertion, search, and delete operations are O(1); worst-case behavior can degrade to O(n).</p>
        </div>
      </div>

      <div className="collection-panel">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">PRACTICE</p>
            <h2>Hashing practice problems</h2>
          </div>
        </div>

        <div className="practice-list">
          {modulePracticeSets.hashing.map((problem) => (
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
          {complexityPanels.hashing.map((entry) => (
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

export default Hashing;
