function GraphVisualizer({
  vertices = [],
  positions = {},
  edges = [],
  selectedVertex = null,
  highlightedVertices = [],
  highlightedEdges = [],
  selectedEdges = [],
  rejectedEdges = [],
  vertexClassNames = {},
  edgeClassNames = {},
  directed = false,
}) {
  const nodeRadius = 24;

  return (
    <div className="graph-visualizer-wrapper">
      <svg viewBox="0 0 720 420" className="graph-visualizer" aria-label="Graph visualization">
        {edges.map((edge, index) => {
          const fromPosition = positions[String(edge.from)] ?? { x: 120, y: 120 };
          const toPosition = positions[String(edge.to)] ?? { x: 220, y: 180 };
          const matchesEdge = (item) => (
            String(item) === `${String(edge.from)}->${String(edge.to)}`
            || (!directed && String(item) === `${String(edge.to)}->${String(edge.from)}`)
          );
          const isSelected = selectedEdges.some((item) => matchesEdge(item));
          const isRejected = rejectedEdges.some((item) => matchesEdge(item));
          const isHighlighted = highlightedEdges.some(
            (item) => String(item) === `${String(edge.from)}->${String(edge.to)}`
              || (!directed && String(item) === `${String(edge.to)}->${String(edge.from)}`)
          );
          const customEdgeClass = edgeClassNames[`${String(edge.from)}->${String(edge.to)}`]
            ?? (!directed ? edgeClassNames[`${String(edge.to)}->${String(edge.from)}`] : "");

          const dx = toPosition.x - fromPosition.x;
          const dy = toPosition.y - fromPosition.y;
          const angle = Math.atan2(dy, dx);
          const arrowLength = 10;
          const arrowX = toPosition.x - Math.cos(angle) * nodeRadius;
          const arrowY = toPosition.y - Math.sin(angle) * nodeRadius;

          return (
            <g key={`${String(edge.from)}-${String(edge.to)}-${index}`}>
              <line
                x1={fromPosition.x}
                y1={fromPosition.y}
                x2={toPosition.x}
                y2={toPosition.y}
                className={`graph-edge ${isHighlighted ? "graph-edge-active" : ""} ${isSelected ? "graph-edge-selected" : ""} ${isRejected ? "graph-edge-rejected" : ""} ${customEdgeClass}`}
              />
              {directed && (
                <line
                  x1={arrowX}
                  y1={arrowY}
                  x2={arrowX - Math.cos(angle - Math.PI / 6) * arrowLength}
                  y2={arrowY - Math.sin(angle - Math.PI / 6) * arrowLength}
                  className="graph-arrow"
                />
              )}
              {directed && (
                <line
                  x1={arrowX}
                  y1={arrowY}
                  x2={arrowX - Math.cos(angle + Math.PI / 6) * arrowLength}
                  y2={arrowY - Math.sin(angle + Math.PI / 6) * arrowLength}
                  className="graph-arrow"
                />
              )}
              {edge.weight !== undefined && edge.weight !== null && (
                <text x={(fromPosition.x + toPosition.x) / 2} y={(fromPosition.y + toPosition.y) / 2 - 8} className="graph-edge-weight">
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}

        {vertices.map((vertex) => {
          const position = positions[String(vertex)] ?? { x: 120, y: 120 };
          const isSelected = selectedVertex === vertex;
          const isHighlighted = highlightedVertices.includes(vertex);

          return (
            <g key={String(vertex)}>
              <circle
                cx={position.x}
                cy={position.y}
                r={nodeRadius}
                className={`graph-node ${isSelected ? "graph-node-selected graph-node-scc-current" : ""} ${isHighlighted ? "graph-node-highlighted" : ""} ${vertexClassNames[String(vertex)] ?? ""}`}
              />
              <text x={position.x} y={position.y + 5} textAnchor="middle" className="graph-node-label">
                {String(vertex)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default GraphVisualizer;
