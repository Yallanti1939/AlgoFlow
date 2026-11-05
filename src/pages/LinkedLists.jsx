import { useMemo, useState } from "react";
import LinkedListVisualizer from "../components/visualizers/LinkedListVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { CircularLinkedList, DoublyLinkedList, SinglyLinkedList } from "../data-structures/linkedLists";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { complexityPanels, modulePracticeSets } from "../data/learningModules";

const listMap = {
  singly: SinglyLinkedList,
  doubly: DoublyLinkedList,
  circular: CircularLinkedList,
};

function LinkedLists() {
  const [listType, setListType] = useState("singly");
  const [value, setValue] = useState("15");
  const [position, setPosition] = useState("1");
  const [status, setStatus] = useState("Ready");
  const [list, setList] = useState(() => new SinglyLinkedList([10, 20, 30]));
  const [selectedPractice, setSelectedPractice] = useState(modulePracticeSets.linkedLists[0]);

  const metadata = dataStructureMetadata.linkedLists;
  const currentValues = useMemo(() => list.toArray(), [list]);
  const playbackSteps = [
    { label: "Initial state", explanation: `The ${listType} list currently holds: ${currentValues.join(" -> ") || "empty"}.` },
    { label: "Traversal", explanation: "Each node is visited one step at a time, making insertion and deletion O(n) in the general case." },
    { label: "Result", explanation: "Pointer updates complete the operation and maintain list integrity." },
  ];

  const refreshList = (nextList) => {
    setList(nextList);
  };

  const createFromCurrentType = () => {
    const ListClass = listMap[listType];
    return new ListClass(currentValues.map((entry) => (typeof entry === "number" ? entry : entry.value)));
  };

  const applyOperation = (operation) => {
    const nextList = createFromCurrentType();

    try {
      switch (operation) {
        case "insert-begin":
          nextList.insertAtBeginning(Number(value));
          setStatus("Inserted at the beginning");
          break;
        case "insert-end":
          nextList.insertAtEnd(Number(value));
          setStatus("Inserted at the end");
          break;
        case "insert-position":
          nextList.insertAtPosition(Number(value), Number(position));
          setStatus(`Inserted at position ${position}`);
          break;
        case "delete-begin":
          nextList.deleteFromBeginning();
          setStatus("Deleted from the beginning");
          break;
        case "delete-end":
          nextList.deleteFromEnd();
          setStatus("Deleted from the end");
          break;
        case "delete-position":
          nextList.deleteAtPosition(Number(position));
          setStatus(`Deleted from position ${position}`);
          break;
        case "search": {
          const found = nextList.search(Number(value));
          setStatus(found ? `Found value ${value} at index ${found.index}` : `Value ${value} not found`);
          break;
        }
        case "update": {
          const updated = nextList.update(Number(value), Number(position));
          setStatus(updated ? `Updated ${value} to ${position}` : "Update failed");
          break;
        }
        case "reverse":
          nextList.reverse();
          setStatus("Reversed the list");
          break;
        case "middle":
          setStatus(`Middle node value: ${nextList.getMiddle() ?? "none"}`);
          break;
        case "cycle":
          setStatus(nextList.hasCycle() ? "Cycle detected" : "No cycle detected");
          break;
        case "clear":
          nextList.clear();
          setStatus("List cleared");
          break;
        default:
          break;
      }
    } catch (error) {
      setStatus(error.message || "Operation failed");
      return;
    }

    refreshList(nextList);
  };

  const handleTypeChange = (nextType) => {
    setListType(nextType);
    const ListClass = listMap[nextType];
    setList(new ListClass([10, 20, 30, 40]));
    setStatus(`${nextType} list initialized`);
  };

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 3</p>
          <h2>Linked Lists</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>LIST TYPE</label>
              <select value={listType} onChange={(event) => handleTypeChange(event.target.value)}>
                <option value="singly">Singly</option>
                <option value="doubly">Doubly</option>
                <option value="circular">Circular</option>
              </select>
            </div>
            <div>
              <label>VALUE</label>
              <input value={value} onChange={(event) => setValue(event.target.value)} />
            </div>
            <div>
              <label>POSITION</label>
              <input value={position} onChange={(event) => setPosition(event.target.value)} />
            </div>
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={() => applyOperation("insert-begin")}>Insert at beginning</button>
            <button className="secondary-btn" onClick={() => applyOperation("insert-end")}>Insert at end</button>
            <button className="secondary-btn" onClick={() => applyOperation("insert-position")}>Insert at position</button>
            <button className="secondary-btn" onClick={() => applyOperation("delete-begin")}>Delete beginning</button>
            <button className="secondary-btn" onClick={() => applyOperation("delete-end")}>Delete end</button>
            <button className="secondary-btn" onClick={() => applyOperation("delete-position")}>Delete at position</button>
            <button className="secondary-btn" onClick={() => applyOperation("search")}>Search</button>
            <button className="secondary-btn" onClick={() => applyOperation("update")}>Update</button>
            <button className="secondary-btn" onClick={() => applyOperation("reverse")}>Reverse</button>
            <button className="secondary-btn" onClick={() => applyOperation("middle")}>Middle</button>
            <button className="secondary-btn" onClick={() => applyOperation("cycle")}>Detect cycle</button>
            <button className="secondary-btn" onClick={() => applyOperation("clear")}>Clear</button>
          </div>

          <div className="status-box">Status: {status}</div>
        </div>

        <div className="panel-card">
          <h3>Visualization</h3>
          <LinkedListVisualizer values={currentValues.map((entry) => (typeof entry === "number" ? entry : entry.value))} type={listType} />
        </div>
      </div>

      <div className="panel-card">
        <PlaybackPanel steps={playbackSteps} title="Linked list traversal" speed={700} />
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h4>What is it?</h4>
          <p>Linked lists are linear collections of nodes where each node stores data and a pointer to the next node.</p>
        </div>
        <div className="info-card">
          <h4>Complexity</h4>
          <p>Search: O(n), insertion at head: O(1), deletion by value: O(n), space: O(n).</p>
        </div>
        <div className="info-card">
          <h4>Applications</h4>
          <p>Use linked lists for dynamic memory, stacks, queues, and adjacency lists.</p>
        </div>
      </div>

      <div className="collection-panel">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">PRACTICE</p>
            <h2>Linked list practice problems</h2>
          </div>
        </div>

        <div className="practice-list">
          {modulePracticeSets.linkedLists.map((problem) => (
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
          {complexityPanels.linkedLists.map((entry) => (
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

export default LinkedLists;
