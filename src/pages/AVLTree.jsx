import { useMemo, useState } from "react";
import TreeVisualizer from "../components/visualizers/TreeVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { AVLTree } from "../data-structures/trees/avlTree";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { avlComplexity, avlPracticeSets, avlTraversalCode } from "../data/learningModules";

const defaultTree = new AVLTree([30, 20, 40, 10, 25, 35, 50, 5, 15]);

const traversalOptions = [
  { id: "inorder", label: "Inorder" },
  { id: "preorder", label: "Preorder" },
  { id: "postorder", label: "Postorder" },
  { id: "levelorder", label: "Level-order" },
];

const operationOptions = [
  { id: "insert", label: "Insert" },
  { id: "search", label: "Search" },
  { id: "delete", label: "Delete" },
  { id: "validate", label: "Validate" },
];

function cloneTree(tree) {
  return new AVLTree(tree.traverse("inorder"));
}

function AVLTreePage() {
  const metadata = dataStructureMetadata.avlTrees;
  const [tree, setTree] = useState(() => new AVLTree(defaultTree.traverse("inorder")));
  const [value, setValue] = useState("18");
  const [status, setStatus] = useState("Ready");
  const [selectedOperation, setSelectedOperation] = useState("insert");
  const [selectedTraversal, setSelectedTraversal] = useState("inorder");
  const [selectedPractice, setSelectedPractice] = useState(avlPracticeSets[0]);
  const [playbackSteps, setPlaybackSteps] = useState([]);
  const [highlightedValues, setHighlightedValues] = useState([]);
  const [changedValues, setChangedValues] = useState([]);
  const [comparisonValues, setComparisonValues] = useState([]);

  const traversalCode = avlTraversalCode[selectedTraversal];
  const details = useMemo(() => tree.getNodeMetrics(), [tree]);

  const applyOperation = (operation) => {
    const parsedValue = Number(value);
    const nextTree = cloneTree(tree);

    if (operation === "insert") {
      if (Number.isNaN(parsedValue)) {
        setStatus("Enter a valid integer value");
        return;
      }

      const steps = nextTree.insertWithAnimation(parsedValue);
      setTree(nextTree);
      setPlaybackSteps(steps);
      setHighlightedValues(steps.at(-1)?.visited ?? []);
      setChangedValues(steps.at(-1)?.changed ?? []);
      setComparisonValues(steps.at(-1)?.comparison ?? []);
      setStatus(`Inserted ${parsedValue} and rebalanced the tree if needed.`);
      return;
    }

    if (operation === "search") {
      if (Number.isNaN(parsedValue)) {
        setStatus("Enter a valid integer value");
        return;
      }

      const steps = nextTree.searchWithAnimation(parsedValue);
      setPlaybackSteps(steps);
      setHighlightedValues(steps.at(-1)?.visited ?? []);
      setChangedValues(steps.at(-1)?.changed ?? []);
      setComparisonValues(steps.at(-1)?.comparison ?? []);
      setStatus(nextTree.search(parsedValue) ? `Found ${parsedValue}` : `Value ${parsedValue} not found`);
      return;
    }

    if (operation === "delete") {
      if (Number.isNaN(parsedValue)) {
        setStatus("Enter a valid integer value");
        return;
      }

      const steps = nextTree.deleteWithAnimation(parsedValue);
      setTree(nextTree);
      setPlaybackSteps(steps);
      setHighlightedValues(steps.at(-1)?.visited ?? []);
      setChangedValues(steps.at(-1)?.changed ?? []);
      setComparisonValues(steps.at(-1)?.comparison ?? []);
      setStatus(nextTree.search(parsedValue) ? `Delete failed for ${parsedValue}` : `Deleted ${parsedValue}`);
      return;
    }

    if (operation === "validate") {
      const valid = nextTree.validateAVL();
      const steps = [
        {
          label: "Validate AVL property",
          explanation: valid
            ? "Every node satisfies the AVL balance condition and all subtrees stay within one level of height."
            : "At least one node exceeds the allowed height difference, so the tree is not AVL-balanced.",
          visited: nextTree.getNodeMetrics().map((entry) => entry.value),
          changed: nextTree.getNodeMetrics().map((entry) => entry.value),
          comparison: [],
        },
      ];
      setPlaybackSteps(steps);
      setHighlightedValues(steps[0].visited);
      setChangedValues(steps[0].changed);
      setComparisonValues([]);
      setStatus(valid ? "AVL property holds" : "AVL property violated");
    }
  };

  const handleTraversal = () => {
    const nextTree = cloneTree(tree);
    const steps = nextTree.traverseWithAnimation(selectedTraversal);
    setPlaybackSteps(steps);
    setHighlightedValues(steps.at(-1)?.visited ?? []);
    setChangedValues(steps.at(-1)?.changed ?? []);
    setComparisonValues(steps.at(-1)?.comparison ?? []);
    setStatus(`${selectedTraversal} traversal completed`);
  };

  const handleReset = () => {
    const freshTree = new AVLTree([30, 20, 40, 10, 25, 35, 50, 5, 15]);
    setTree(freshTree);
    setPlaybackSteps([]);
    setHighlightedValues([]);
    setChangedValues([]);
    setComparisonValues([]);
    setStatus("Tree reset to the default AVL sample");
  };

  const traversalResult = tree.traverse(selectedTraversal).join(" -> ") || "empty";

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 4 · TREE MODULE</p>
          <h2>AVL Trees</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>OPERATION</label>
              <select value={selectedOperation} onChange={(event) => setSelectedOperation(event.target.value)}>
                {operationOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label>VALUE</label>
              <input value={value} onChange={(event) => setValue(event.target.value)} />
            </div>
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={() => applyOperation(selectedOperation)}>Run operation</button>
            <button className="secondary-btn" onClick={handleTraversal}>Traverse</button>
            <button className="secondary-btn" onClick={handleReset}>Reset</button>
          </div>

          <div className="status-box">Status: {status}</div>
          <div className="status-box">Traversal result: {traversalResult}</div>
        </div>

        <div className="panel-card">
          <h3>AVL visualization</h3>
          <TreeVisualizer
            tree={tree}
            highlightedValues={highlightedValues}
            changedValues={changedValues}
            comparisonValues={comparisonValues}
          />
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <PlaybackPanel
            steps={playbackSteps}
            title={`${selectedOperation} playback`}
            speed={700}
            onStepChange={(nextStatus) => {
              const currentStep = playbackSteps[nextStatus.index] ?? playbackSteps[0] ?? null;
              setHighlightedValues(currentStep?.visited ?? []);
              setChangedValues(currentStep?.changed ?? []);
              setComparisonValues(currentStep?.comparison ?? []);
            }}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>AVL properties</h3>
          <div className="feature-list">
            {traversalOptions.map((option) => (
              <button
                key={option.id}
                className={`feature-pill ${selectedTraversal === option.id ? "selected" : ""}`}
                onClick={() => setSelectedTraversal(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="stack-demo-summary"><strong>Root:</strong> {tree.root?.value ?? "None"}</p>
          <p className="stack-demo-summary"><strong>Height:</strong> {tree.root ? tree.getHeight(tree.root) : 0}</p>
          <p className="stack-demo-summary"><strong>Valid AVL:</strong> {tree.validateAVL() ? "Yes" : "No"}</p>
          <p className="stack-demo-summary"><strong>Min:</strong> {tree.findMin()?.value ?? "None"}</p>
          <p className="stack-demo-summary"><strong>Max:</strong> {tree.findMax()?.value ?? "None"}</p>
        </div>
      </div>

      <div className="panel-card">
        <h3>Node heights and balances</h3>
        <div className="practice-list">
          {details.map((entry) => (
            <div key={entry.value} className="practice-item selected">
              <span>{entry.value}</span>
              <small>height: {entry.height} · BF: {entry.balanceFactor}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="info-grid">
        {avlComplexity.map((item) => (
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
            <h2>AVL tree problems</h2>
          </div>
        </div>

        <div className="practice-list">
          {avlPracticeSets.map((problem) => (
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
            <h2>Traversal implementations</h2>
          </div>
        </div>

        <CodeViewer
          title={`${selectedTraversal.charAt(0).toUpperCase()}${selectedTraversal.slice(1)} traversal`}
          summary={traversalCode.summary}
          code={traversalCode.code}
          explanation={traversalCode.explanation}
        />
      </div>
    </section>
  );
}

export default AVLTreePage;
