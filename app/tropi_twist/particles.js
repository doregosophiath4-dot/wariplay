// particles.js
// Port JS de particles.py : une particule étoile par bonbon détruit, plus
// une animation d'explosion à plusieurs frames à la même position.

class Particle {
  constructor(x, y, imageEntry, dureeVie = 45) {
    this.x = x;
    this.y = y;
    this.imageEntry = imageEntry; // { image, loaded } depuis AssetLoader
    this.dureeVie = dureeVie;
    this.age = 0;
    this.alpha = 255;

    this.rotation = 0;
    this.rotationSpeed = Math.random() * 16 - 8; // -8..8

    this.taille = 1.0;
    this.tailleSpeed = 0.02 + Math.random() * 0.03; // 0.02..0.05
    this.tailleMax = 1.5;
  }

  update() {
    this.age++;
    this.rotation += this.rotationSpeed;

    this.taille += this.tailleSpeed;
    if (this.taille >= this.tailleMax || this.taille <= 0.5) {
      this.tailleSpeed *= -1;
    }

    if (this.age > this.dureeVie * 0.6) {
      this.alpha = 255 * (1 - (this.age - this.dureeVie * 0.6) / (this.dureeVie * 0.4));
    }
  }

  estVivante() {
    return this.age < this.dureeVie && this.alpha > 0;
  }

  dessiner(ctx, tailleBase) {
    if (!this.estVivante()) return;
    if (!this.imageEntry.loaded || !this.imageEntry.image) return;

    const taillePx = tailleBase * this.taille;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(255, this.alpha)) / 255;
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.drawImage(this.imageEntry.image, -taillePx / 2, -taillePx / 2, taillePx, taillePx);
    ctx.restore();
  }
}

class Explosion {
  constructor(x, y, frames, dureeParFrame = 6) {
    this.x = x;
    this.y = y;
    this.frames = frames; // liste d'entrées AssetLoader
    this.dureeParFrame = dureeParFrame;
    this.frameActuelle = 0;
    this.compteur = 0;
    this.terminee = false;
  }

  update() {
    if (this.terminee) return;
    this.compteur++;
    if (this.compteur >= this.dureeParFrame) {
      this.compteur = 0;
      this.frameActuelle++;
      if (this.frameActuelle >= this.frames.length) {
        this.terminee = true;
      }
    }
  }

  estVivante() {
    return !this.terminee;
  }

  dessiner(ctx, taille) {
    if (this.terminee || this.frameActuelle >= this.frames.length) return;
    const entry = this.frames[this.frameActuelle];
    if (!entry.loaded || !entry.image) return;
    ctx.drawImage(entry.image, this.x - taille / 2, this.y - taille / 2, taille, taille);
  }
}

class ParticleSystem {
  constructor(assets) {
    this.assets = assets;
    this.particules = [];
    this.explosions = [];
    this.tailleParticule = 30;
    this.tailleExplosion = 80;
    this._chargerImages();
  }

  _chargerImages() {
    this.particleEntry = this.assets.charger(`${CONFIG.PARTICLES_PATH}/${CONFIG.STAR_PARTICLE_FILE}`);
    this.explosionEntries = CONFIG.EXPLOSION_FILES.map((f) =>
      this.assets.charger(`${CONFIG.EXPLOSION_PATH}/${f}`)
    );
  }

  redimensionner(tailleParticule, tailleExplosion) {
    this.tailleParticule = tailleParticule;
    this.tailleExplosion = tailleExplosion;
  }

  creerParticule(x, y) {
    if (!this.particleEntry) return;
    this.particules.push(new Particle(x, y, this.particleEntry, 45));
  }

  creerExplosion(x, y) {
    if (this.explosionEntries.length > 0) {
      this.explosions.push(new Explosion(x, y, this.explosionEntries, 4));
    }
  }

  // Crée une particule ET une explosion pour chaque position [x, y]
  creerParticulesAuxPositions(positions) {
    for (const [x, y] of positions) {
      this.creerParticule(x, y);
      this.creerExplosion(x, y);
    }
  }

  update() {
    this.particules = this.particules.filter((p) => {
      p.update();
      return p.estVivante();
    });
    this.explosions = this.explosions.filter((e) => {
      e.update();
      return e.estVivante();
    });
  }

  dessiner(ctx) {
    for (const explosion of this.explosions) explosion.dessiner(ctx, this.tailleExplosion);
    for (const particule of this.particules) particule.dessiner(ctx, this.tailleParticule);
  }

  estActif() {
    return this.particules.length > 0 || this.explosions.length > 0;
  }
}