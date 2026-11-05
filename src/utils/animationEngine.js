export class AnimationEngine {
  constructor({ steps = [], speed = 700, onChange } = {}) {
    this.steps = Array.isArray(steps) ? steps : [];
    this.speed = speed;
    this.onChange = typeof onChange === "function" ? onChange : () => {};
    this.index = 0;
    this.isPlaying = false;
    this.timer = null;
  }

  setSteps(steps) {
    this.steps = Array.isArray(steps) ? steps : [];
    this.index = 0;
    this.isPlaying = false;
    this.clearTimer();
    this.emit();
  }

  setSpeed(value) {
    this.speed = Number(value) || 700;
    if (this.isPlaying) {
      this.clearTimer();
      this.scheduleNext();
    }
  }

  current() {
    return this.steps[this.index] ?? null;
  }

  reset() {
    this.index = 0;
    this.isPlaying = false;
    this.clearTimer();
    this.emit();
  }

  play() {
    if (this.steps.length === 0) {
      return;
    }

    if (this.index >= this.steps.length - 1) {
      this.index = this.steps.length - 1;
    }

    this.isPlaying = true;
    this.scheduleNext();
    this.emit();
  }

  pause() {
    this.isPlaying = false;
    this.clearTimer();
    this.emit();
  }

  resume() {
    if (this.steps.length === 0) {
      return;
    }

    this.isPlaying = true;
    this.scheduleNext();
    this.emit();
  }

  stepForward() {
    this.isPlaying = false;
    this.clearTimer();
    if (this.index < this.steps.length - 1) {
      this.index += 1;
    }
    this.emit();
  }

  stepBackward() {
    this.isPlaying = false;
    this.clearTimer();
    if (this.index > 0) {
      this.index -= 1;
    }
    this.emit();
  }

  scheduleNext() {
    this.clearTimer();
    if (!this.isPlaying) {
      return;
    }

    this.timer = globalThis.setTimeout(() => {
      if (this.index < this.steps.length - 1) {
        this.index += 1;
        this.emit();

        if (this.index < this.steps.length - 1) {
          this.scheduleNext();
        } else {
          this.isPlaying = false;
          this.emit();
        }
      } else {
        this.isPlaying = false;
        this.emit();
      }
    }, this.speed);
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  emit() {
    this.onChange({
      index: this.index,
      current: this.current(),
      isPlaying: this.isPlaying,
      length: this.steps.length,
    });
  }
}
