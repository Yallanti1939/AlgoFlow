import { useMemo, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { AnimationEngine } from "../utils/animationEngine";

function PlaybackPanel({ steps = [], title = "Animation playback", speed = 700, onStepChange }) {
  const [status, setStatus] = useState({ index: 0, current: steps[0] ?? null, isPlaying: false, length: steps.length });

  const engine = useMemo(
    () =>
      new AnimationEngine({
        steps,
        speed,
        onChange: (nextStatus) => {
          setStatus(nextStatus);
          onStepChange?.(nextStatus);
        },
      }),
    [steps, speed, onStepChange]
  );

  const currentStep = steps[status.index] ?? steps[0] ?? null;

  const handlePlay = () => {
    if (status.length !== steps.length) {
      setStatus({ index: 0, current: steps[0] ?? null, isPlaying: false, length: steps.length });
      engine.reset();
    }

    if (status.isPlaying) {
      engine.pause();
      return;
    }

    if (status.index >= Math.max(steps.length - 1, 0)) {
      engine.reset();
    }
    engine.play();
  };

  return (
    <div className="playback-panel">
      <div className="playback-header">
        <div>
          <p className="eyebrow">PLAYBACK</p>
          <h3>{title}</h3>
        </div>
        <div className="playback-controls">
          <button className="secondary-btn" onClick={() => engine.stepBackward()} aria-label="Step backward">
            <SkipBack size={16} />
          </button>
          <button className="primary-btn" onClick={handlePlay}>
            {status.isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {status.isPlaying ? "Pause" : "Play"}
          </button>
          <button className="secondary-btn" onClick={() => engine.stepForward()} aria-label="Step forward">
            <SkipForward size={16} />
          </button>
          <button className="secondary-btn" onClick={() => engine.reset()} aria-label="Reset playback">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="speed-slider">
        <label htmlFor="playback-speed">Playback speed</label>
        <input
          id="playback-speed"
          type="range"
          min="200"
          max="1500"
          step="50"
          value={speed}
          onChange={(event) => engine.setSpeed(Number(event.target.value))}
        />
        <span>{speed} ms</span>
      </div>

      <div className="playback-state">
        <strong>Step {Math.min(status.index + 1, Math.max(steps.length, 1))} / {Math.max(steps.length, 1)}</strong>
        {currentStep && (
          <>
            <p className="step-label">{currentStep.label}</p>
            {currentStep.stack && <p>Stack: {JSON.stringify(currentStep.stack)}</p>}
            {currentStep.output && <p>Output: {JSON.stringify(currentStep.output)}</p>}
            <p>{currentStep.explanation}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default PlaybackPanel;
