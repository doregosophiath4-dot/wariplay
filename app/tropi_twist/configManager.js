// configManager.js
// Port JS de config_manager.py. Le navigateur n'a pas accès au système de
// fichiers : on utilise localStorage à la place de game_config.json.

class ConfigManager {
  constructor() {
    this.storageKey = "match3_game_config";
    this.config = {
      sound_enabled: true,
      music_enabled: true,
      levels_unlocked: 1,
      high_scores: {},
      level_select_scroll: 0,
    };
    this.chargerConfig();
  }

  chargerConfig() {
    try {
      const brut = localStorage.getItem(this.storageKey);
      if (brut) {
        const sauvegarde = JSON.parse(brut);
        Object.assign(this.config, sauvegarde);
      }
    } catch (e) {
      console.warn("Impossible de lire la configuration sauvegardée :", e);
    }
  }

  sauvegarderConfig() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (e) {
      console.warn("Impossible de sauvegarder la configuration :", e);
    }
  }

  getSoundEnabled() {
    return this.config.sound_enabled ?? true;
  }

  setSoundEnabled(active) {
    this.config.sound_enabled = active;
    this.sauvegarderConfig();
  }

  toggleSound() {
    this.config.sound_enabled = !this.config.sound_enabled;
    this.sauvegarderConfig();
    return this.config.sound_enabled;
  }

  getLevelsUnlocked() {
    return this.config.levels_unlocked ?? 1;
  }

  unlockLevel(niveau) {
    if (niveau > this.getLevelsUnlocked()) {
      this.config.levels_unlocked = niveau;
      this.sauvegarderConfig();
    }
  }

  isLevelUnlocked(niveau) {
    return niveau <= this.getLevelsUnlocked();
  }

  getHighScore(niveau) {
    return (this.config.high_scores || {})[niveau] || 0;
  }

  setHighScore(niveau, score) {
    if (!this.config.high_scores) this.config.high_scores = {};
    if (score > this.getHighScore(niveau)) {
      this.config.high_scores[niveau] = score;
      this.sauvegarderConfig();
    }
  }

  isLevelCompletedWithMaxScore(niveau, scoreMax) {
    return this.getHighScore(niveau) >= scoreMax;
  }

  getLevelSelectScroll() {
    return this.config.level_select_scroll || 0;
  }

  setLevelSelectScroll(scrollY) {
    this.config.level_select_scroll = scrollY;
    this.sauvegarderConfig();
  }
}