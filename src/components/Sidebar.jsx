import {
  BarChart3,
  BookOpen,
  Code2,
  LayoutDashboard,
  Layers3,
  ListChecks,
  Settings,
  Target,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Learn DSA", icon: BookOpen },
  { name: "Algorithms", icon: Code2 },
  { name: "Data Structures", icon: Layers3 },
  { name: "Linked Lists", icon: Layers3 },
  { name: "Stacks", icon: BarChart3 },
  { name: "Queues", icon: BarChart3 },
  { name: "Hashing", icon: Target },
  { name: "Binary Trees", icon: Layers3 },
  { name: "Binary Search Trees", icon: Layers3 },
  { name: "AVL Trees", icon: Layers3 },
  { name: "Heaps", icon: Layers3 },
  { name: "Heap Sort", icon: Layers3 },
  { name: "Segment Tree", icon: Layers3 },
  { name: "Fenwick Tree", icon: Layers3 },
  { name: "Graph Fundamentals", icon: Layers3 },
  { name: "BFS", icon: Layers3 },
  { name: "DFS", icon: Layers3 },
  { name: "Cycle Detection", icon: Layers3 },
  { name: "Topological Sort", icon: Layers3 },
  { name: "Dijkstra", icon: Layers3 },
  { name: "Bellman-Ford", icon: Layers3 },
  { name: "Floyd-Warshall", icon: Layers3 },
  { name: "Minimum Spanning Tree", icon: Layers3 },
  { name: "Disjoint Set Union", icon: Layers3 },
  { name: "Strongly Connected Components", icon: Layers3 },
  { name: "Bridges and Articulation Points", icon: Layers3 },
  { name: "Visualizer", icon: BarChart3 },
  { name: "Practice", icon: ListChecks },
  { name: "Progress", icon: Target },
];

function Sidebar({ activePage, isMobileMenuOpen, onClose, onNavigate }) {
  return (
    <>
      {isMobileMenuOpen && (
        <button
          className="mobile-nav-backdrop"
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${isMobileMenuOpen ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="brand-icon">
          <Code2 size={22} />
        </div>
        <h2>
          Algo<span>Flow</span>
        </h2>
      </div>

      <p className="menu-label">WORKSPACE</p>

      <nav className="sidebar-nav">
        {menuItems.map(({ name, icon: Icon }) => (
          <button
            key={name}
            className={`nav-item ${activePage === name ? "active" : ""}`}
            onClick={() => onNavigate(name)}
          >
            <Icon size={19} />
            <span>{name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item">
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div className="profile">
          <div className="avatar">D</div>
          <div>
            <strong>Developer</strong>
            <small>DSA Explorer</small>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}

export default Sidebar;
