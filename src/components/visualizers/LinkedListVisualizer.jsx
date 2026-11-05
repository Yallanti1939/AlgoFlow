function LinkedListVisualizer({ values, type = "singly", activeIndex = null }) {
  if (!values.length) {
    return <div className="empty-visualizer">Empty list</div>;
  }

  return (
    <div className="linked-list-visualizer">
      {values.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className={`node-box ${activeIndex === index ? "active" : ""}`}
        >
          <div className="node-value">{value}</div>
          {type === "doubly" && <div className="node-meta">Prev</div>}
          <div className="node-meta">Next</div>
        </div>
      ))}
    </div>
  );
}

export default LinkedListVisualizer;
