import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Code2,
  Layers3,
  RotateCcw,
  Shuffle,
  Target,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Visualizer from "./components/Visualizer";
import Controls from "./components/Controls";
import { moduleGroups, quickStats, dataStructures, practiceProblems } from "./data/catalog";
import { sortingAlgorithms } from "./algorithms/sorting";
import { searchingAlgorithms } from "./algorithms/searching";
import LinkedLists from "./pages/LinkedLists";
import Stacks from "./pages/Stacks";
import Queues from "./pages/Queues";
import Hashing from "./pages/Hashing";
import BinaryTrees from "./pages/BinaryTrees";
import BinarySearchTrees from "./pages/BinarySearchTrees";
import AVLTreePage from "./pages/AVLTree";
import HeapsPage from "./pages/Heaps";
import HeapSortPage from "./pages/HeapSort";
import SegmentTreePage from "./pages/SegmentTree";
import FenwickTreePage from "./pages/FenwickTree";
import GraphFundamentalsPage from "./pages/GraphFundamentals";
import BFSPage from "./pages/BFS";
import DFSPage from "./pages/DFS";
import CycleDetectionPage from "./pages/CycleDetection";
import TopologicalSortPage from "./pages/TopologicalSort";
import DijkstraPage from "./pages/Dijkstra";
import BellmanFordPage from "./pages/BellmanFord";
import FloydWarshallPage from "./pages/FloydWarshall";
import MinimumSpanningTreePage from "./pages/MinimumSpanningTree";
import DisjointSetPage from "./pages/DisjointSet";
import StronglyConnectedComponentsPage from "./pages/StronglyConnectedComponents";
import BridgesArticulationPointsPage from "./pages/BridgesArticulationPoints";
import "./App.css";

const initialArray = [42, 17, 56, 9, 31, 24, 68, 13, 48, 35];

const allAlgorithms = [...sortingAlgorithms, ...searchingAlgorithms];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Sorting");
  const [selectedAlgorithmKey, setSelectedAlgorithmKey] = useState("bubble-sort");
  const [array, setArray] = useState(initialArray);
  const [speed, setSpeed] = useState(55);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedConcepts, setCompletedConcepts] = useState(() => {
    try {
      const savedProgress = JSON.parse(localStorage.getItem("algoflow-progress") ?? "{}") || {};
      return Array.isArray(savedProgress.completed) ? savedProgress.completed : [];
    } catch {
      return [];
    }
  });

  const currentAlgorithm =
    allAlgorithms.find((item) => item.key === selectedAlgorithmKey) ?? allAlgorithms[0];

  useEffect(() => {
    localStorage.setItem(
      "algoflow-progress",
      JSON.stringify({ completed: completedConcepts })
    );
  }, [completedConcepts]);

  const randomize = () => {
    setArray(
      Array.from({ length: 12 }, () => Math.floor(Math.random() * 90) + 10)
    );
    setIsPlaying(false);
  };

  const resetArray = () => {
    setArray(initialArray);
    setIsPlaying(false);
  };

  const runSelectedAlgorithm = () => {
    const entry = allAlgorithms.find((item) => item.key === selectedAlgorithmKey);
    if (!entry) {
      return;
    }

    const result = entry.runner([...array]);
    const sortedValues = Array.isArray(result) ? result : result.values ?? [];
    setArray(sortedValues);
    setIsPlaying(false);
  };

  const navigate = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
    setIsPlaying(false);
  };

  const markCompleted = () => {
    setCompletedConcepts((previous) => {
      if (previous.includes(selectedAlgorithmKey)) {
        return previous;
      }
      return [...previous, selectedAlgorithmKey];
    });
  };

  const renderDashboard = () => (
    <>
      <section className="welcome-section">
        <div>
          <p className="eyebrow">LEARN • VISUALIZE • MASTER</p>
          <h1>
            Understand algorithms <span>visually.</span>
          </h1>
          <p className="subtitle">
            Explore arrays, strings, sorting, searching, and data structures with interactive visual guidance.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        {quickStats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <span>{stat.label}</span>
            <h2>{stat.value}</h2>
            <small>{stat.detail}</small>
          </div>
        ))}
      </section>

      <section className="quick-start">
        <div className="section-heading">
          <div>
            <p className="eyebrow">GET STARTED</p>
            <h2>Explore the curriculum</h2>
          </div>
        </div>

        <div className="quick-grid">
          <button className="quick-card" onClick={() => { setSelectedCategory("Sorting"); navigate("Algorithms"); }}>
            <BarChart3 size={20} />
            <h3>Sorting Algorithms</h3>
            <p>Understand how items move and compare through each pass.</p>
            <span>
              Explore sorting <ArrowRight size={15} />
            </span>
          </button>

          <button className="quick-card" onClick={() => { setSelectedCategory("Searching"); navigate("Algorithms"); }}>
            <Target size={20} />
            <h3>Searching Algorithms</h3>
            <p>Learn linear and binary strategies with clear complexity tradeoffs.</p>
            <span>
              Explore searching <ArrowRight size={15} />
            </span>
          </button>

          <button className="quick-card" onClick={() => navigate("Data Structures")}>
            <Layers3 size={20} />
            <h3>Data Structures</h3>
            <p>Review arrays, stacks, queues, trees, and hash-based layouts.</p>
            <span>
              Explore structures <ArrowRight size={15} />
            </span>
          </button>
        </div>
      </section>
    </>
  );

  const renderLearn = () => (
    <section className="workspace-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CURRICULUM</p>
          <h2>Learn DSA modules</h2>
          <p className="subtitle">From arrays to advanced graph and DP concepts, each track is structured for guided learning.</p>
        </div>
      </div>

      <div className="module-grid">
        {moduleGroups.map((module) => (
          <article key={module.title} className="module-card">
            <span className="badge">{module.difficulty}</span>
            <h3>{module.title}</h3>
            <p>{module.focus}</p>
            <ul>
              {module.concepts.map((concept) => (
                <li key={concept}>{concept}</li>
              ))}
            </ul>
            <button
              className="text-btn"
              onClick={() => {
                setSelectedCategory(module.title === "Searching" ? "Searching" : "Sorting");
                setActivePage("Algorithms");
              }}
            >
              Open module <ArrowRight size={15} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );

  const renderAlgorithms = () => {
    const availableConcepts =
      selectedCategory === "Sorting"
        ? sortingAlgorithms
        : selectedCategory === "Searching"
          ? searchingAlgorithms
          : sortingAlgorithms;

    return (
    <section className="workspace-card algorithm-layout">
      <div className="algorithm-sidebar">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">TOPIC FILTER</p>
            <h2>Algorithms</h2>
          </div>
        </div>

        <div className="category-tabs">
          {[
            "Sorting",
            "Searching",
            "Arrays",
            "Strings",
          ].map((category) => (
            <button
              key={category}
              className={`tab-item ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="concept-list">
          {availableConcepts.map((algorithm) => (
            <button
              key={algorithm.key}
              className={`concept-button ${selectedAlgorithmKey === algorithm.key ? "selected" : ""}`}
              onClick={() => setSelectedAlgorithmKey(algorithm.key)}
            >
              {algorithm.label}
            </button>
          ))}
        </div>
      </div>

      <div className="algorithm-content">
        <div className="algorithm-header">
          <div>
            <p className="eyebrow">CURRENT CONCEPT</p>
            <h3>{currentAlgorithm.label}</h3>
          </div>
          <button className="secondary-btn small" onClick={markCompleted}>
            {completedConcepts.includes(selectedAlgorithmKey) ? "Completed" : "Mark complete"}
          </button>
        </div>

        <p className="subtitle detail-copy">{currentAlgorithm.description}</p>

        <div className="metrics-grid">
          <div className="metric-box">
            <span>Time</span>
            <strong>{currentAlgorithm.complexity}</strong>
          </div>
          <div className="metric-box">
            <span>Pattern</span>
            <strong>{selectedCategory}</strong>
          </div>
          <div className="metric-box">
            <span>Learning</span>
            <strong>{completedConcepts.includes(selectedAlgorithmKey) ? "Mastered" : "In progress"}</strong>
          </div>
        </div>

        <div className="visualizer-stack">
          <Visualizer array={array} activeIndices={currentAlgorithm.key === "bubble-sort" ? [0, 1] : [Math.floor(array.length / 2)]} />
          <div className="toolbar compact-toolbar">
            <button className="primary-btn" onClick={runSelectedAlgorithm}>
              <Code2 size={17} />
              Run concept
            </button>
            <button className="secondary-btn" onClick={resetArray}>
              <RotateCcw size={17} />
              Reset
            </button>
            <button className="secondary-btn" onClick={randomize}>
              <Shuffle size={17} />
              Randomize
            </button>
          </div>
        </div>

        <div className="code-panel">
          <h4>JavaScript implementation</h4>
          <pre>{currentAlgorithm.sampleCode}</pre>
        </div>
      </div>
    </section>
    );
  };

  const renderStructures = () => (
    <section className="workspace-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">DATA STRUCTURES</p>
          <h2>Core layouts and usage</h2>
          <p className="subtitle">The best structure depends on access patterns, mutation cost, and the problem constraints.</p>
        </div>
      </div>

      <div className="module-grid">
        {dataStructures.map((structure) => (
          <article key={structure.name} className="module-card">
            <span className="badge">DS</span>
            <h3>{structure.name}</h3>
            <p>{structure.summary}</p>
            <ul>
              <li>Efficient access</li>
              <li>Clear invariants</li>
              <li>Common interview use</li>
            </ul>
          </article>
        ))}
      </div>
    </section>
  );

  const renderPractice = () => (
    <section className="workspace-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PRACTICE</p>
          <h2>Curated problem sets</h2>
          <p className="subtitle">Build confidence with focused learning tasks spread across beginner and intermediate difficulty levels.</p>
        </div>
      </div>

      <div className="practice-grid">
        {practiceProblems.map((problem) => (
          <article key={problem.title} className="practice-card">
            <div className="practice-topline">
              <span className="badge">{problem.difficulty}</span>
              <BookOpen size={16} />
            </div>
            <h3>{problem.title}</h3>
            <p>{problem.summary}</p>
            <strong>Hint</strong>
            <p>{problem.hint}</p>
          </article>
        ))}
      </div>
    </section>
  );

  const renderProgress = () => (
    <section className="workspace-card empty-state progress-panel">
      <BrainCircuit size={40} />
      <h2>Learning progress</h2>
      <p className="subtitle">
        {completedConcepts.length} concept{completedConcepts.length === 1 ? "" : "s"} completed and stored locally.
      </p>
      <div className="progress-bar">
        <span style={{ width: `${Math.min((completedConcepts.length / allAlgorithms.length) * 100, 100)}%` }} />
      </div>
      <button className="primary-btn" onClick={() => navigate("Dashboard")}>
        Return home
      </button>
    </section>
  );

  const renderVisualizer = () => (
    <section className="workspace-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">VISUALIZER</p>
          <h2>{currentAlgorithm.label}</h2>
          <p className="subtitle">Compare values, inspect movement, and reason about the algorithmic pattern in motion.</p>
        </div>
      </div>

      <div className="toolbar">
        <div>
          <label>SELECT ALGORITHM</label>
          <select
            value={selectedAlgorithmKey}
            onChange={(event) => setSelectedAlgorithmKey(event.target.value)}
          >
            {allAlgorithms.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="array-info">
          <label>ARRAY SIZE</label>
          <strong>{array.length} Elements</strong>
        </div>
      </div>

      <Visualizer array={array} activeIndices={[0, 1, 2]} />

      <Controls
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(!isPlaying)}
        onReset={resetArray}
        onRandomize={randomize}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <div className="complexity-card">
        <h3>Complexity snapshot</h3>
        <div className="complexity-grid">
          <div>
            <span>TIME COMPLEXITY</span>
            <strong>{currentAlgorithm.complexity}</strong>
          </div>
          <div>
            <span>SPACE COMPLEXITY</span>
            <strong>O(1) to O(n)</strong>
          </div>
        </div>
        <p className="subtitle">Use the visualization as a concrete guide while tracing the algorithm step by step.</p>
      </div>
    </section>
  );

  const renderContent = () => {
    switch (activePage) {
      case "Learn DSA":
        return renderLearn();
      case "Algorithms":
        return renderAlgorithms();
      case "Data Structures":
        return renderStructures();
      case "Linked Lists":
        return <LinkedLists />;
      case "Stacks":
        return <Stacks />;
      case "Queues":
        return <Queues />;
      case "Hashing":
        return <Hashing />;
      case "Binary Trees":
        return <BinaryTrees />;
      case "Binary Search Trees":
        return <BinarySearchTrees />;
      case "AVL Trees":
        return <AVLTreePage />;
      case "Heaps":
        return <HeapsPage />;
      case "Heap Sort":
        return <HeapSortPage />;
      case "Segment Tree":
        return <SegmentTreePage />;
      case "Fenwick Tree":
        return <FenwickTreePage />;
      case "Graph Fundamentals":
        return <GraphFundamentalsPage />;
      case "BFS":
        return <BFSPage />;
      case "DFS":
        return <DFSPage />;
      case "Cycle Detection":
        return <CycleDetectionPage />;
      case "Topological Sort":
        return <TopologicalSortPage />;
      case "Dijkstra":
        return <DijkstraPage />;
      case "Bellman-Ford":
        return <BellmanFordPage />;
      case "Floyd-Warshall":
        return <FloydWarshallPage />;
      case "Minimum Spanning Tree":
        return <MinimumSpanningTreePage />;
      case "Disjoint Set Union":
        return <DisjointSetPage />;
      case "Strongly Connected Components":
        return <StronglyConnectedComponentsPage />;
      case "Bridges and Articulation Points":
        return <BridgesArticulationPointsPage />;
      case "Visualizer":
        return renderVisualizer();
      case "Practice":
        return renderPractice();
      case "Progress":
        return renderProgress();
      case "Dashboard":
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={navigate}
      />

      <main className="main-content">
        <Header
          title={activePage}
          isMobileMenuOpen={isMobileMenuOpen}
          onMenuClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        />
        {renderContent()}

        <footer>AlgoFlow © 2026 · Built to understand algorithms.</footer>
      </main>
    </div>
  );
}

export default App;
