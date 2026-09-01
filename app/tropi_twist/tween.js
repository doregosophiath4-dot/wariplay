// tween.js
// Port JS fidèle de tween.py (reproduit le Tween Node de Godot).

const TransitionType = {
  LINEAR: "linear",
  SINE: "sine",
  QUINT: "quint",
  QUART: "quart",
  QUAD: "quad",
  EXPO: "expo",
  ELASTIC: "elastic",
  CUBIC: "cubic",
  CIRC: "circ",
  BOUNCE: "bounce",
  BACK: "back",
};

const EaseType = {
  EASE_IN: "ease_in",
  EASE_OUT: "ease_out",
  EASE_IN_OUT: "ease_in_out",
  EASE_OUT_IN: "ease_out_in",
};

class Tween {
  constructor() {
    this.tweens = [];
  }

  tweenProperty(obj, propertyName, finalValue, duration) {
    const tweenData = {
      type: "property",
      obj,
      property: propertyName,
      startValue: obj[propertyName],
      finalValue,
      duration,
      elapsed: 0,
      transition: TransitionType.LINEAR,
      ease: EaseType.EASE_IN,
      active: true,
      onComplete: null,
    };
    this.tweens.push(tweenData);
    this._dernier = tweenData;
    return this;
  }

  tweenPropertyDelayed(callback, delay) {
    const tweenData = {
      type: "delayed",
      callback,
      delay,
      elapsed: 0,
      active: true,
    };
    this.tweens.push(tweenData);
    this._dernier = tweenData;
    return this;
  }

  setTrans(transitionType) {
    if (this._dernier) this._dernier.transition = transitionType;
    return this;
  }

  setEase(easeType) {
    if (this._dernier) this._dernier.ease = easeType;
    return this;
  }

  setOnComplete(callback) {
    if (this._dernier) this._dernier.onComplete = callback;
    return this;
  }

  update(deltaTime) {
    const toRemove = [];

    for (const tween of this.tweens) {
      if (!tween.active) continue;

      if (tween.type === "delayed") {
        tween.elapsed += deltaTime;
        if (tween.elapsed >= tween.delay) {
          tween.callback();
          tween.active = false;
          toRemove.push(tween);
        }
        continue;
      }

      if (tween.type !== "property") continue;

      tween.elapsed += deltaTime;

      const progress = tween.duration > 0 ? Math.min(tween.elapsed / tween.duration, 1.0) : 1.0;
      const easedProgress = this._ease(tween.transition, tween.ease, progress);

      const start = tween.startValue;
      const end = tween.finalValue;
      let currentValue;

      if (typeof start === "number") {
        currentValue = start + (end - start) * easedProgress;
      } else if (Array.isArray(start) && start.length === 2) {
        currentValue = [
          start[0] + (end[0] - start[0]) * easedProgress,
          start[1] + (end[1] - start[1]) * easedProgress,
        ];
      } else {
        currentValue = end;
      }

      tween.obj[tween.property] = currentValue;

      if (progress >= 1.0) {
        tween.obj[tween.property] = tween.finalValue;
        tween.active = false;
        toRemove.push(tween);
        if (tween.onComplete) tween.onComplete();
      }
    }

    for (const tween of toRemove) {
      const idx = this.tweens.indexOf(tween);
      if (idx !== -1) this.tweens.splice(idx, 1);
    }
  }

  _ease(transition, easeType, t) {
    switch (easeType) {
      case EaseType.EASE_IN:
        return this._calculerTransition(transition, t);
      case EaseType.EASE_OUT:
        return 1.0 - this._calculerTransition(transition, 1.0 - t);
      case EaseType.EASE_IN_OUT:
        if (t < 0.5) {
          return this._calculerTransition(transition, 2.0 * t) / 2.0;
        }
        return 1.0 - this._calculerTransition(transition, 2.0 * (1.0 - t)) / 2.0;
      case EaseType.EASE_OUT_IN:
        if (t < 0.5) {
          return (1.0 - this._calculerTransition(transition, 1.0 - 2.0 * t)) / 2.0;
        }
        return (1.0 + this._calculerTransition(transition, 2.0 * t - 1.0)) / 2.0;
      default:
        return t;
    }
  }

  _calculerTransition(transition, t) {
    switch (transition) {
      case TransitionType.LINEAR:
        return t;
      case TransitionType.SINE:
        return 1.0 - Math.cos((t * Math.PI) / 2.0);
      case TransitionType.QUINT:
        return t * t * t * t * t;
      case TransitionType.QUART:
        return t * t * t * t;
      case TransitionType.QUAD:
        return t * t;
      case TransitionType.EXPO:
        return t > 0 ? Math.pow(2, 10 * (t - 1)) : 0;
      case TransitionType.ELASTIC:
        if (t === 0 || t === 1) return t;
        return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
      case TransitionType.CUBIC:
        return t * t * t;
      case TransitionType.CIRC:
        return 1.0 - Math.sqrt(1.0 - t * t);
      case TransitionType.BOUNCE:
        return this._bounceOut(t);
      case TransitionType.BACK: {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
      }
      default:
        return t;
    }
  }

  _bounceOut(t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      t -= 1.5 / 2.75;
      return 7.5625 * t * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      t -= 2.25 / 2.75;
      return 7.5625 * t * t + 0.9375;
    } else {
      t -= 2.625 / 2.75;
      return 7.5625 * t * t + 0.984375;
    }
  }

  isActive() {
    return this.tweens.some((t) => t.active);
  }

  killAll() {
    this.tweens.length = 0;
  }
}