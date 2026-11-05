
function Visualizer({ array, activeIndices = [] }) {
  return (
    <div className="visualizer">
      <div className="visualizer-label">
        <span>ARRAY VISUALIZATION</span>
        <span>{array.length} Elements</span>
      </div>

      <div className="bars">
        {array.map((value, index) => (
          <div className="bar-column" key={index}>
            <span className="bar-value">{value}</span>

            <div
              className={`bar ${
                activeIndices.includes(index) ? "comparing" : ""
              }`}
              style={{ height: `${value * 2.5}px` }}
            />

            <span className="bar-index">{index}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Visualizer;
