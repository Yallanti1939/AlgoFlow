function layoutHeap(values, index = 0, depth = 0, x = 0, positions = [], spread = 180) {
  if (index >= values.length) {
    return positions;
  }

  positions.push({ value: values[index], index, x, y: depth * 88 + 26, depth });

  const nextSpread = spread / (depth + 1.5);
  const leftIndex = index * 2 + 1;
  const rightIndex = index * 2 + 2;

  if (leftIndex < values.length) {
    layoutHeap(values, leftIndex, depth + 1, x - nextSpread, positions, spread);
  }

  if (rightIndex < values.length) {
    layoutHeap(values, rightIndex, depth + 1, x + nextSpread, positions, spread);
  }

  return positions;
}

function HeapVisualizer({ heap, mode = "min", highlightedIndices = [], swappedIndices = [], comparedIndices = [] }) {
  const values = heap?.toArray?.() ?? [];
  const nodes = layoutHeap(values);
  const nodeMap = new Map(nodes.map((node) => [node.index, node]));

  const renderLinks = (index) => {
    const node = nodeMap.get(index);
    if (!node) return null;

    const leftIndex = index * 2 + 1;
    const rightIndex = index * 2 + 2;
    const leftNode = nodeMap.get(leftIndex);
    const rightNode = nodeMap.get(rightIndex);

    return (
      <>
        {leftNode && (
          <line
            key={`${index}-left`}
            x1={node.x}
            y1={node.y + 18}
            x2={leftNode.x}
            y2={leftNode.y - 18}
            className="tree-edge"
          />
        )}
        {rightNode && (
          <line
            key={`${index}-right`}
            x1={node.x}
            y1={node.y + 18}
            x2={rightNode.x}
            y2={rightNode.y - 18}
            className="tree-edge"
          />
        )}
        {leftNode && renderLinks(leftIndex)}
        {rightNode && renderLinks(rightIndex)}
      </>
    );
  };

  return (
    <div className="heap-visualizer-wrapper">
      <div className="heap-tree-panel">
        <svg viewBox="-260 0 520 320" className="tree-visualizer" aria-label="Heap tree visualization">
          {values.length > 0 && renderLinks(0)}
          {nodes.map((node) => {
            const active = highlightedIndices.includes(node.index);
            const swapped = swappedIndices.includes(node.index);
            const compared = comparedIndices.includes(node.index);

            return (
              <g key={`${node.index}-${node.depth}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  className={`tree-node ${active ? "tree-node-highlighted" : ""} ${swapped ? "tree-node-changed" : ""} ${compared ? "tree-node-compared" : ""}`}
                />
                <text x={node.x} y={node.y + 4} textAnchor="middle" className="tree-node-label">
                  {node.value}
                </text>
                <text x={node.x} y={node.y + 28} textAnchor="middle" className="heap-index-label">
                  {node.index}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="heap-array-panel">
        {values.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className={`heap-array-slot ${highlightedIndices.includes(index) ? "highlighted" : ""} ${swappedIndices.includes(index) ? "swapped" : ""} ${comparedIndices.includes(index) ? "compared" : ""}`}
          >
            <span className="heap-array-index">[{index}]</span>
            <span className="heap-array-value">{value}</span>
            <small>{mode === "min" ? "parent" : "parent"}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HeapVisualizer;
