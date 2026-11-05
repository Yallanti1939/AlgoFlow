function QueueVisualizer({ values, front = null, rear = null }) {
  return (
    <div className="queue-visualizer">
      <div className="queue-pointers">
        <span>Front: {front ?? "-"}</span>
        <span>Rear: {rear ?? "-"}</span>
      </div>
      <div className="queue-row">
        {values.length === 0 ? (
          <div className="empty-queue">Empty queue</div>
        ) : (
          values.map((value, index) => (
            <div key={`${value}-${index}`} className="queue-item">
              {value}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default QueueVisualizer;
