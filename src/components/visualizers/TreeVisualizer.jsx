function layoutTree(node, depth = 0, x = 0, positions = []) {
  if (!node) return positions;

  positions.push({ value: node.value, x, y: depth * 90 + 40, depth });

  const gap = 160 / (depth + 1);

  if (node.left) {
    layoutTree(node.left, depth + 1, x - gap, positions);
  }

  if (node.right) {
    layoutTree(node.right, depth + 1, x + gap, positions);
  }

  return positions;
}

function TreeVisualizer({ tree, highlightedValues = [], changedValues = [], comparisonValues = [] }) {
  const root = tree?.root ?? null;
  const nodes = layoutTree(root);
  const positions = new Map(nodes.map((item) => [item.value, item]));

  const renderLinks = (currentNode) => {
    if (!currentNode) return null;

    const current = positions.get(currentNode.value);
    const left = currentNode.left ? positions.get(currentNode.left.value) : null;
    const right = currentNode.right ? positions.get(currentNode.right.value) : null;

    return (
      <>
        {left && (
          <line
            key={`${currentNode.value}-left`}
            x1={current.x}
            y1={current.y + 18}
            x2={left.x}
            y2={left.y - 18}
            className={`tree-edge ${comparisonValues.includes(currentNode.value) ? "tree-edge-active" : ""}`}
          />
        )}
        {right && (
          <line
            key={`${currentNode.value}-right`}
            x1={current.x}
            y1={current.y + 18}
            x2={right.x}
            y2={right.y - 18}
            className={`tree-edge ${comparisonValues.includes(currentNode.value) ? "tree-edge-active" : ""}`}
          />
        )}
        {currentNode.left && renderLinks(currentNode.left)}
        {currentNode.right && renderLinks(currentNode.right)}
      </>
    );
  };

  return (
    <div className="tree-visualizer-wrapper">
      <svg viewBox="-240 0 480 360" className="tree-visualizer" aria-label="Binary tree visualization">
        {root && renderLinks(root)}
        {nodes.map((node) => {
          const active = highlightedValues.includes(node.value);
          const changed = changedValues.includes(node.value);
          const compared = comparisonValues.includes(node.value);

          return (
            <g key={`${node.value}-${node.depth}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={22}
                className={`tree-node ${active ? "tree-node-highlighted" : ""} ${changed ? "tree-node-changed" : ""} ${compared ? "tree-node-compared" : ""}`}
              />
              <text x={node.x} y={node.y + 4} textAnchor="middle" className="tree-node-label">
                {node.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default TreeVisualizer;
