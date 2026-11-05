function HashTableVisualizer({ buckets }) {
  return (
    <div className="hash-visualizer">
      {buckets.map((bucket, index) => (
        <div key={`bucket-${index}`} className="hash-bucket">
          <span>{index}</span>
          <div className="hash-slot">
            {bucket.bucket.length === 0 ? (
              <small>empty</small>
            ) : (
              bucket.bucket.map((entry) => (
                <div key={`${entry.key}-${index}`} className="hash-entry">
                  <strong>{entry.key}</strong>
                  <span>{entry.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HashTableVisualizer;
