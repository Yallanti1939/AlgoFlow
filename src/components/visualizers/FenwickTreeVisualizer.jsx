function FenwickTreeVisualizer({ values = [], bit = [], highlighted = [], range = null, explanation = "", result = null, before = null, after = null }) {
  const renderRow = (items, prefix, activeIndices = []) => (
    <div className="fenwick-row">
      {items.map((item, index) => {
        const isActive = activeIndices.includes(index + prefix);
        const isRange = range && index >= range.start && index <= range.end;
        const label = typeof item === "number" ? item : item.value;

        return (
          <div
            key={`${prefix}-${index}`}
            className={`fenwick-cell ${isActive ? "active" : ""} ${isRange ? "range" : ""}`}
          >
            <small>{index}</small>
            <strong>{label}</strong>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fenwick-visualizer">
      <div className="fenwick-section">
        <h4>Original array</h4>
        {renderRow(values, 0, range ? Array.from({ length: range.end - range.start + 1 }, (_, offset) => range.start + offset) : [])}
      </div>

      <div className="fenwick-section">
        <h4>Fenwick tree / BIT array</h4>
        {renderRow(bit.slice(1), 1, highlighted)}
      </div>

      <div className="fenwick-meta">
        {before !== null && after !== null ? (
          <div className="fenwick-badge">
            <span>Before</span>
            <strong>{before}</strong>
          </div>
        ) : null}
        {after !== null ? (
          <div className="fenwick-badge">
            <span>After</span>
            <strong>{after}</strong>
          </div>
        ) : null}
        {result !== null ? (
          <div className="fenwick-badge fenwick-result">
            <span>Result</span>
            <strong>{result}</strong>
          </div>
        ) : null}
      </div>

      <p className="subtitle">{explanation}</p>
    </div>
  );
}

export default FenwickTreeVisualizer;
