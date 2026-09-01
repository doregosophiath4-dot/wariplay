// soundManager.js
// Port JS de sound_manager.py : son de clic, sons de match aléatoires,
// musique de fond en boucle. Utilise HTMLAudioElement (le navigateur n'a
// pas d'équivalent direct de pygame.mixer). cloneNode() permet à plusieurs
// effets de se chevaucher, comme pygame.mixer.Sound.play().

class SoundManager {
  constructor(configManager) {
    this.configManager = configManager;
    this.sounds = {};
    this.matchSounds = [];
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.musicElement = null;

    this.chargerSons();
    this.chargerMusique();

    if (this.configManager.getSoundEnabled()) {
      this.activerSon();
    } else {
      this.desactiverSon();
    }
  }

  _creerAudio(chemin, volume) {
    const audio = new Audio(chemin);
    audio.volume = volume;
    audio.addEventListener("error", () => {
      console.warn(`Son non trouvé : ${chemin}`);
    });
    return audio;
  }

  chargerSons() {
    // Son de clic
    this.sounds.click = this._creerAudio(`${CONFIG.SOUNDS_PATH}/1.ogg`, this.sfxVolume);

    // Sons de match (3.ogg à 7.ogg)
    for (let i = 3; i <= 7; i++) {
      this.matchSounds.push(this._creerAudio(`${CONFIG.SOUNDS_PATH}/${i}.ogg`, this.sfxVolume));
    }
  }

  chargerMusique() {
    this.musicElement = this._creerAudio(`${CONFIG.MUSIC_PATH}/${CONFIG.MUSIC_FILE}`, this.musicVolume);
    this.musicElement.loop = true;
  }

  _jouer(audio) {
    if (!audio) return;
    try {
      const clone = audio.cloneNode();
      clone.volume = audio.volume;
      clone.play().catch(() => {}); // ignore les refus d'autoplay
    } catch (e) {
      // silencieux : un son manquant ne doit jamais interrompre le jeu
    }
  }

  jouerSon(nom) {
    if (!this.configManager.getSoundEnabled()) return;
    if (this.sounds[nom]) this._jouer(this.sounds[nom]);
  }

  jouerClick() {
    this.jouerSon("click");
  }

  jouerMatch() {
    if (!this.configManager.getSoundEnabled()) return;
    if (this.matchSounds.length > 0) {
      const son = this.matchSounds[Math.floor(Math.random() * this.matchSounds.length)];
      this._jouer(son);
    }
  }

  demarrerMusique() {
    if (!this.configManager.getSoundEnabled()) return;
    if (this.musicElement) {
      this.musicElement.play().catch(() => {}); // nécessite un geste utilisateur
    }
  }

  arreterMusique() {
    if (this.musicElement) this.musicElement.pause();
  }

  activerSon() {
    if (this.musicElement) this.musicElement.volume = this.musicVolume;
    if (this.sounds.click) this.sounds.click.volume = this.sfxVolume;
    for (const son of this.matchSounds) son.volume = this.sfxVolume;
    this.demarrerMusique();
  }

  desactiverSon() {
    if (this.musicElement) this.musicElement.volume = 0;
    if (this.sounds.click) this.sounds.click.volume = 0;
    for (const son of this.matchSounds) son.volume = 0;
    this.arreterMusique();
  }

  toggleSon() {
    const actif = this.configManager.toggleSound();
    if (actif) this.activerSon();
    else this.desactiverSon();
    return actif;
  }
}