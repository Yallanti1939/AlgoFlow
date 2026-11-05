import { useMemo, useState } from "react";
import TreeVisualizer from "../components/visualizers/TreeVisualizer";
import PlaybackPanel from "../components/PlaybackPanel";
import CodeViewer from "../components/CodeViewer";
import { BinarySearchTree } from "../data-structures/binarySearchTree";
import { dataStructureMetadata } from "../data/dataStructureMetadata";
import { bstComplexity, bstPracticeSets, bstTraversalCode } from "../data/learningModules";

const defaultTree = new BinarySearchTree([50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85]);

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
  { id: "min", label: "Min" },
  { id: "max", label: "Max" },
  { id: "successor", label: "Successor" },
  { id: "predecessor", label: "Predecessor" },
  { id: "lca", label: "LCA" },
  { id: "validate", label: "Validate" },
];

function cloneTree(tree) {
  return new BinarySearchTree(tree.traverse("inorder"));
}

function BinarySearchTrees() {
  const metadata = dataStructureMetadata.binarySearchTrees;
  const [tree, setTree] = useState(() => defaultTree);
  const [value, setValue] = useState("42");
  const [valueB, setValueB] = useState("60");
  const [status, setStatus] = useState("Ready");
  const [selectedOperation, setSelectedOperation] = useState("insert");
  const [selectedTraversal, setSelectedTraversal] = useState("inorder");
  const [selectedPractice, setSelectedPractice] = useState(bstPracticeSets[0]);
  const [currentAnimation, setCurrentAnimation] = useState([]);
  const [highlightedValues, setHighlightedValues] = useState([]);
  const [changedValues, setChangedValues] = useState([]);
  const [comparisonValues, setComparisonValues] = useState([]);

  const traversalCode = bstTraversalCode[selectedTraversal];

  const playbackSteps = useMemo(() => currentAnimation ?? [], [currentAnimation]);

  const applyOperation = (operation) => {
    const parsedValue = Number(value);
    const parsedSecond = Number(valueB);
    const nextTree = cloneTree(tree);

    if (operation === "insert") {
      if (Number.isNaN(parsedValue)) {
        setStatus("Enter a valid number for insert");
        return;
      }

      const steps = nextTree.insertWithAnimation(parsedValue);
      setTree(nextTree);
      setCurrentAnimation(steps);
      setHighlightedValues(steps.at(-1)?.visited ?? []);
      setChangedValues(steps.at(-1)?.changed ?? []);
      setComparisonValues([]);
      setStatus(`Inserted ${parsedValue}`);
      return;
    }

    if (operation === "search") {
      if (Number.isNaN(parsedValue)) {
        setStatus("Enter a valid number for search");
        return;
      }

      const steps = nextTree.searchWithAnimation(parsedValue);
      setCurrentAnimation(steps);
      setHighlightedValues(steps.at(-1)?.visited ?? []);
      setChangedValues(steps.at(-1)?.changed ?? []);
      setComparisonValues(steps.map((step) => step.visited).flat().filter((item) => Number.isFinite(item)));
      setStatus(nextTree.search(parsedValue) ? `Found ${parsedValue}` : `Value ${parsedValue} not found`);
      return;
    }

    if (operation === "delete") {
      if (Number.isNaN(parsedValue)) {
        setStatus("Enter a valid number for delete");
        return;
      }

      const steps = nextTree.deleteWithAnimation(parsedValue);
      setTree(nextTree);
      setCurrentAnimation(steps);
      setHighlightedValues(steps.at(-1)?.visited ?? []);
      setChangedValues(steps.at(-1)?.changed ?? []);
      setComparisonValues([]);
      setStatus(nextTree.search(parsedValue) ? `Delete failed for ${parsedValue}` : `Deleted ${parsedValue}`);
      return;
    }

    if (operation === "min") {
      const minNode = nextTree.findMin();
      setCurrentAnimation([
        {
          label: "Find minimum",
          explanation: minNode ? `The minimum value is ${minNode.value}.` : "The tree is empty.",
          visited: minNode ? [minNode.value] : [],
          changed: minNode ? [minNode.value] : [],
          tree: nextTree.toSnapshot(),
        },
      ]);
      setHighlightedValues(minNode ? [minNode.value] : []);
      setChangedValues(minNode ? [minNode.value] : []);
      setComparisonValues([]);
      setStatus(minNode ? `Min is ${minNode.value}` : "Tree is empty");
      return;
    }

    if (operation === "max") {
      const maxNode = nextTree.findMax();
      setCurrentAnimation([
        {
          label: "Find maximum",
          explanation: maxNode ? `The maximum value is ${maxNode.value}.` : "The tree is empty.",
          visited: maxNode ? [maxNode.value] : [],
          changed: maxNode ? [maxNode.value] : [],
          tree: nextTree.toSnapshot(),
        },
      ]);
      setHighlightedValues(maxNode ? [maxNode.value] : []);
      setChangedValues(maxNode ? [maxNode.value] : []);
      setComparisonValues([]);
      setStatus(maxNode ? `Max is ${maxNode.value}` : "Tree is empty");
      return;
    }

    if (operation === "successor") {
      if (Number.isNaN(parsedValue)) {
        setStatus("Enter a valid number for successor");
        return;
      }
      const node = nextTree.findSuccessor(parsedValue);
      setCurrentAnimation([
        {
          label: `Find successor of ${parsedValue}`,
          explanation: node ? `The inorder successor of ${parsedValue} is ${node.value}.` : `No successor exists for ${parsedValue}.`,
          visited: node ? [parsedValue, node.value] : [parsedValue],
          changed: node ? [node.value] : [],
          tree: nextTree.toSnapshot(),
        },
      ]);
      setHighlightedValues(node ? [parsedValue, node.value] : [parsedValue]);
      setChangedValues(node ? [node.value] : []);
      setComparisonValues([]);
      setStatus(node ? `Successor of ${parsedValue} is ${node.value}` : `No successor for ${parsedValue}`);
      return;
    }

    if (operation === "predecessor") {
      if (Number.isNaN(parsedValue)) {
        setStatus("Enter a valid number for predecessor");
        return;
      }
      const node = nextTree.findPredecessor(parsedValue);
      setCurrentAnimation([
        {
          label: `Find predecessor of ${parsedValue}`,
          explanation: node ? `The inorder predecessor of ${parsedValue} is ${node.value}.` : `No predecessor exists for ${parsedValue}.`,
          visited: node ? [parsedValue, node.value] : [parsedValue],
          changed: node ? [node.value] : [],
          tree: nextTree.toSnapshot(),
        },
      ]);
      setHighlightedValues(node ? [parsedValue, node.value] : [parsedValue]);
      setChangedValues(node ? [node.value] : []);
      setComparisonValues([]);
      setStatus(node ? `Predecessor of ${parsedValue} is ${node.value}` : `No predecessor for ${parsedValue}`);
      return;
    }

    if (operation === "lca") {
      if (Number.isNaN(parsedValue) || Number.isNaN(parsedSecond)) {
        setStatus("Enter valid values for LCA");
        return;
      }
      const node = nextTree.findLCA(parsedValue, parsedSecond);
      setCurrentAnimation([
        {
          label: `Find LCA of ${parsedValue} and ${parsedSecond}`,
          explanation: node ? `The lowest common ancestor is ${node.value}.` : "No common ancestor exists.",
          visited: node ? [parsedValue, parsedSecond, node.value] : [parsedValue, parsedSecond],
          changed: node ? [node.value] : [],
          tree: nextTree.toSnapshot(),
        },
      ]);
      setHighlightedValues(node ? [parsedValue, parsedSecond, node.value] : [parsedValue, parsedSecond]);
      setChangedValues(node ? [node.value] : []);
      setComparisonValues([]);
      setStatus(node ? `LCA is ${node.value}` : "No LCA found");
      return;
    }

    if (operation === "validate") {
      const valid = nextTree.validateBST();
      const steps = [{
        label: "Validate BST property",
        explanation: valid ? "The tree satisfies the BST ordering invariant." : "The tree violates the BST ordering invariant.",
        visited: nextTree.traverse("inorder"),
        changed: nextTree.traverse("inorder"),
        tree: nextTree.toSnapshot(),
      }];
      setCurrentAnimation(steps);
      setHighlightedValues(nextTree.traverse("inorder"));
      setChangedValues(nextTree.traverse("inorder"));
      setComparisonValues([]);
      setStatus(valid ? "BST property holds" : "BST property violated");
    }
  };

  const handleTraversal = () => {
    const nextTree = cloneTree(tree);
    const steps = nextTree.traverseWithAnimation(selectedTraversal);
    setCurrentAnimation(steps);
    setHighlightedValues(steps.at(-1)?.visited ?? []);
    setChangedValues(steps.at(-1)?.changed ?? []);
    setComparisonValues([]);
    setStatus(`${selectedTraversal} traversal completed`);
  };

  const handleReset = () => {
    const freshTree = new BinarySearchTree([50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85]);
    setTree(freshTree);
    setCurrentAnimation([]);
    setHighlightedValues([]);
    setChangedValues([]);
    setComparisonValues([]);
    setStatus("Tree reset to the default BST");
  };

  const traverseResult = tree.traverse(selectedTraversal).join(" -> ") || "empty";

  return (
    <section className="workspace-card learning-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PHASE 4 · TREE MODULE</p>
          <h2>Binary Search Trees</h2>
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
              <label>VALUE A</label>
              <input value={value} onChange={(event) => setValue(event.target.value)} />
            </div>
            <div>
              <label>VALUE B</label>
              <input value={valueB} onChange={(event) => setValueB(event.target.value)} />
            </div>
          </div>

          <div className="action-grid">
            <button className="primary-btn" onClick={() => applyOperation(selectedOperation)}>Run operation</button>
            <button className="secondary-btn" onClick={handleTraversal}>Traverse</button>
            <button className="secondary-btn" onClick={handleReset}>Reset</button>
          </div>

          <div className="status-box">Status: {status}</div>
          <div className="status-box">Traversal result: {traverseResult}</div>
        </div>

        <div className="panel-card">
          <h3>BST visualization</h3>
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
            speed={650}
            onStepChange={(nextStatus) => {
              const currentStep = playbackSteps[nextStatus.index] ?? playbackSteps[0] ?? null;
              setHighlightedValues(currentStep?.visited ?? []);
              setChangedValues(currentStep?.changed ?? []);
            }}
          />
        </div>

        <div className="panel-card wide-panel">
          <h3>BST properties</h3>
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
          <p className="stack-demo-summary"><strong>Height:</strong> {tree.findHeight()}</p>
          <p className="stack-demo-summary"><strong>Valid BST:</strong> {tree.validateBST() ? "Yes" : "No"}</p>
          <p className="stack-demo-summary"><strong>Min:</strong> {tree.findMin()?.value ?? "None"}</p>
          <p className="stack-demo-summary"><strong>Max:</strong> {tree.findMax()?.value ?? "None"}</p>
        </div>
      </div>

      <div className="info-grid">
        {bstComplexity.map((item) => (
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
            <h2>BST problems</h2>
          </div>
        </div>

        <div className="practice-list">
          {bstPracticeSets.map((problem) => (
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

export default BinarySearchTrees;
