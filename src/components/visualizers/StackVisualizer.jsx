function StackVisualizer({ values, top = null, capacity = null }) {
  return (
    <div className="stack-visualizer">
      <div className="stack-topline">
        <span>TOP</span>
        <strong>{top ?? "-"}</strong>
      </div>
      <div className="stack-column">
        {values.length === 0 ? (
          <div className="empty-stack">Empty stack</div>
        ) : (
          [...values].reverse().map((value, index) => (
            <div
              key={`${value}-${index}`}
              className={`stack-item ${values[values.length - 1] === value ? "active" : ""}`}
            >
              {value}
            </div>
          ))
        )}
      </div>
      {capacity && <div className="stack-meta">Capacity: {capacity}</div>}
    </div>
  );
}

export default StackVisualizer;
