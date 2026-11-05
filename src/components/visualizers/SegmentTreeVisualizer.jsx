function layoutNodes(nodes) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const positions = new Map();

  const walk = (nodeId, x = 0, depth = 0) => {
    const currentNode = nodeMap.get(nodeId);
    if (!currentNode) {
      return;
    }

    positions.set(nodeId, {
      ...currentNode,
      x,
      y: depth * 82 + 40,
    });

    const leftNode = nodeMap.get(nodeId * 2);
    const rightNode = nodeMap.get(nodeId * 2 + 1);

    if (leftNode) {
      walk(nodeId * 2, x - 140 / (depth + 1.5), depth + 1);
    }

    if (rightNode) {
      walk(nodeId * 2 + 1, x + 140 / (depth + 1.5), depth + 1);
    }
  };

  const root = nodeMap.get(1);
  if (root) {
    walk(1, 0, 0);
  }

  return positions;
}

function SegmentTreeVisualizer({ nodes = [], highlightedNodeIds = [], updatedNodeIds = [], lazyNodeIds = [], activeRange = null }) {
  const positions = layoutNodes(nodes);

  return (
    <div className="tree-visualizer-wrapper">
      <svg viewBox="-260 0 520 360" className="tree-visualizer" aria-label="Segment tree visualization">
        {Array.from(positions.values()).map((node) => {
          const parent = positions.get(Math.floor(node.id / 2));
          if (parent) {
            return (
              <line
                key={`${parent.id}-${node.id}`}
                x1={parent.x}
                y1={parent.y + 24}
                x2={node.x}
                y2={node.y - 18}
                className={highlightedNodeIds.includes(node.id) ? "tree-edge-active" : "tree-edge"}
              />
            );
          }
          return null;
        })}

        {Array.from(positions.values()).map((node) => {
          const active = highlightedNodeIds.includes(node.id);
          const updated = updatedNodeIds.includes(node.id);
          const lazy = lazyNodeIds.includes(node.id);
          const matchesRange = activeRange && node.left >= activeRange.start && node.right <= activeRange.end;

          return (
            <g key={`node-${node.id}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={22}
                className={`tree-node ${active ? "tree-node-highlighted" : ""} ${updated ? "tree-node-changed" : ""} ${lazy ? "tree-node-compared" : ""} ${matchesRange ? "tree-node-changed" : ""}`}
              />
              <text x={node.x} y={node.y - 4} textAnchor="middle" className="tree-node-label">
                {node.value}
              </text>
              <text x={node.x} y={node.y + 12} textAnchor="middle" className="heap-index-label">
                [{node.left}, {node.right}]
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default SegmentTreeVisualizer;
