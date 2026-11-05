import { useMemo, useState } from "react";
import TreeVisualizer from "../components/visualizers/TreeVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { BinaryTree } from "../data-structures/binaryTrees";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { binaryTreeComplexity, binaryTreePracticeSets, binaryTreeTraversalCode } from "../data/learningModules";

const defaultTree = new BinaryTree([10, 5, 15, 3, 7, 12, 18, 1, 4, 8, 14]);

const traversalOptions = [
  { id: "inorder", label: "Inorder" },
  { id: "preorder", label: "Preorder" },
  { id: "postorder", label: "Postorder" },
  { id: "levelorder", label: "Level-order" },
];

function BinaryTrees() {
  const metadata = dataStructureMetadata.binaryTrees;
  const [tree, setTree] = useState(() => new BinaryTree(defaultTree.toArray()));
  const [value, setValue] = useState("9");
  const [status, setStatus] = useState("Ready");
  const [selectedTraversal, setSelectedTraversal] = useState("inorder");
  const [selectedPractice, setSelectedPractice] = useState(binaryTreePracticeSets[0]);

  const traversalSteps = useMemo(() => {
    const nextTree = new BinaryTree(tree.toArray());
    return nextTree.stepsFor(selectedTraversal);
  }, [tree, selectedTraversal]);

  const currentTraversal = binaryTreeTraversalCode[selectedTraversal];

  const rebuildTree = (nextTree) => {
    setTree(new BinaryTree(nextTree.toArray()));
  };

  const handleInsert = () => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setStatus("Please enter a valid number");
      return;
    }

    const nextTree = new BinaryTree(tree.toArray());
    nextTree.insert(parsed);
    rebuildTree(nextTree);
    setStatus(`Inserted ${parsed}`);
  };

  const handleDelete = () => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setStatus("Please enter a valid number");
      return;
    }

    const nextTree = new BinaryTree(tree.toArray());
    const existed = nextTree.search(parsed);
    if (!existed) {
      setStatus(`${parsed} was not found in the tree`);
      return;
    }

    nextTree.delete(parsed);
    rebuildTree(nextTree);
    setStatus(`Deleted ${parsed}`);
  };

  const handleReset = () => {
    const nextTree = new BinaryTree([10, 5, 15, 3, 7, 12, 18, 1, 4, 8, 14]);
    setTree(nextTree);
    setStatus("Tree reset to the default sample");
  };

  const result = tree.traverse(selectedTraversal).join(" -> ") || "empty";

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 4 · TREE MODULE</p>
          <h2>Binary Trees &amp; Traversals</h2>
          <p className="subtitle">{metadata.overview}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <div className="toolbar">
            <div>
              <label>VALUE</label>
              <input value={value} onChange={(event) => setValue(event.target.value)} />
            </div>
            <div>
              <label>TRAVERSAL</label>
              <select value={selectedTraversal} onChange={(event) => setSelectedTraversal(event.target.value)}>
                {traversalOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={handleInsert}>Insert</button>
            <button className="secondary-btn" onClick={handleDelete}>Delete</button>
            <button className="secondary-btn" onClick={handleReset}>Reset</button>
          </div>

          <div className="status-box">Status: {status}</div>
          <div className="status-box">Result: {result}</div>
        </div>

        <div className="panel-card">
          <h3>Tree visualization</h3>
          <TreeVisualizer tree={tree} />
        </div>
      </div>

      <div className="module-split">
        <div className="panel-card wide-panel">
          <PlaybackPanel steps={traversalSteps} title={`${selectedTraversal} traversal`} speed={650} />
        </div>

        <div className="panel-card wide-panel">
          <h3>Binary tree overview</h3>
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
          <p className="stack-demo-summary"><strong>Height:</strong> {tree.height()}</p>
          <p className="stack-demo-summary"><strong>Balanced:</strong> {tree.isBalanced() ? "Yes" : "No"}</p>
          <p className="stack-demo-summary"><strong>Min:</strong> {tree.minValue() ?? "None"}</p>
          <p className="stack-demo-summary"><strong>Max:</strong> {tree.maxValue() ?? "None"}</p>
        </div>
      </div>

      <div className="info-grid">
        {binaryTreeComplexity.map((item) => (
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
            <h2>Binary tree problems</h2>
          </div>
        </div>

        <div className="practice-list">
          {binaryTreePracticeSets.map((problem) => (
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
          summary={currentTraversal.summary}
          code={currentTraversal.code}
          explanation={currentTraversal.explanation}
        />
      </div>
    </section>
  );
}

export default BinaryTrees;
