// cameraShake.js
// Port JS de camera_shake.py : tremblement de caméra avec léger zoom,
// piloté par Tween (voir tween.js).

class CameraShake {
  constructor() {
    this.tween = new Tween();
    this.offsetX = 0;
    this.offsetY = 0;
    this.zoom = 1.0;
    this.shakeActive = false;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
  }

  demarrerSecousse(intensite = 8, duree = 0.3) {
    this.shakeActive = true;
    this.shakeIntensity = intensite;
    this.shakeDuration = duree;
    this.shakeTimer = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.zoom = 1.0;

    // Zoom avant
    this.tween
      .tweenProperty(this, "zoom", 1.03, 0.08)
      .setTrans(TransitionType.QUAD)
      .setEase(EaseType.EASE_OUT)
      .setOnComplete(() => {
        // Puis zoom arrière (retour à la normale)
        this.tween
          .tweenProperty(this, "zoom", 1.0, 0.15)
          .setTrans(TransitionType.QUAD)
          .setEase(EaseType.EASE_IN);
      });
  }

  update(dt) {
    this.tween.update(dt);

    if (this.shakeActive) {
      this.shakeTimer += dt;

      if (this.shakeTimer >= this.shakeDuration) {
        this.shakeActive = false;
        this.offsetX = 0;
        this.offsetY = 0;
      } else {
        const progression = this.shakeTimer / this.shakeDuration;
        const attenuation = 1.0 - progression; // décroissance linéaire
        const intensite = this.shakeIntensity * attenuation;
        this.offsetX = (Math.random() * 2 - 1) * intensite;
        this.offsetY = (Math.random() * 2 - 1) * intensite;
      }
    }
  }

  estActif() {
    return this.shakeActive || Math.abs(this.zoom - 1.0) > 0.001;
  }

  // Applique la transformation caméra au contexte canvas. Toujours suivi
  // d'un appel à restaurer() une fois la scène dessinée.
  appliquerTransform(ctx, largeur, hauteur) {
    ctx.save();
    if (!this.estActif()) return;

    const cx = largeur / 2;
    const cy = hauteur / 2;
    ctx.translate(cx + this.offsetX, cy + this.offsetY);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-cx, -cy);
  }

  restaurer(ctx) {
    ctx.restore();
  }
}