
import {
  Play,
  Pause,
  RotateCcw,
  Shuffle,
} from "lucide-react";

function Controls({
  isPlaying,
  onPlay,
  onReset,
  onRandomize,
  speed,
  onSpeedChange,
}) {
  return (
    <div className="controls">
      <div className="control-buttons">
        <button className="primary-btn" onClick={onPlay}>
          {isPlaying ? <Pause size={17} /> : <Play size={17} />}
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button className="secondary-btn" onClick={onReset}>
          <RotateCcw size={17} />
          Reset
        </button>

        <button className="secondary-btn" onClick={onRandomize}>
          <Shuffle size={17} />
          Randomize
        </button>
      </div>

      <div className="speed-control">
        <label>
          Animation Speed <strong>{speed}%</strong>
        </label>

        <input
          type="range"
          min="10"
          max="100"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

export default Controls;
