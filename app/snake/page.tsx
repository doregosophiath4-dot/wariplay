'use client';

import { useEffect, useRef } from 'react';
import './style.css';

const CELL_NUMBER = 18;

/* ===================== CLASSES DU JEU (logique intacte) ===================== */

class SNAKE {
  body: { x: number; y: number }[];
  direction: { x: number; y: number };
  new_block: boolean;

  constructor() {
    this.body = [];
    this.direction = { x: 0, y: 0 };
    this.new_block = false;
    this.reset();
  }
  reset() {
    this.body = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ];
    this.direction = { x: 0, y: 0 };
    this.new_block = false;
  }
  move_snake() {
    if (this.direction.x === 0 && this.direction.y === 0) return;
    const headCopy = {
      x: this.body[0].x + this.direction.x,
      y: this.body[0].y + this.direction.y,
    };
    this.body.unshift(headCopy);
    if (this.new_block) {
      this.new_block = false;
    } else {
      this.body.pop();
    }
  }
  add_block() {
    this.new_block = true;
  }
}

class FRUIT {
  pos: { x: number; y: number };
  constructor() {
    this.pos = { x: 0, y: 0 };
  }
  randomize(excludePositions: { x: number; y: number }[]) {
    while (true) {
      const x = Math.floor(Math.random() * CELL_NUMBER);
      const y = Math.floor(Math.random() * CELL_NUMBER);
      if (!excludePositions.some((p) => p.x === x && p.y === y)) {
        this.pos = { x, y };
        break;
      }
    }
  }
}

type Objective =
  | { type: 'TIME'; target: number }
  | { type: 'POINTS'; target: number }
  | { type: 'APPLES'; target: number };

/* ===================== COMPOSANT REACT ===================== */

export default function SnakeGame() {
  const initialized = useRef(false);

  useEffect(() => {
    const gameContainerEl = document.getElementById('game-container') as HTMLDivElement | null;

    // Garde-fou anti double-initialisation (ex: double montage du Strict Mode en dev).
    // Si une boucle de jeu est déjà active sur ce conteneur, on ne relance pas
    // une seconde instance (c'est ce qui causait le clignotement/la disparition
    // partielle du serpent : deux boucles qui se marchaient dessus).
    if (gameContainerEl?.dataset.snakeInitialized === 'true') {
      return;
    }
    if (gameContainerEl) gameContainerEl.dataset.snakeInitialized = 'true';

    const bodyGrassLayer = document.getElementById('body-grass-layer') as HTMLDivElement;
    const grassLayer = document.getElementById('grass-layer') as HTMLDivElement;
    const gameLayer = document.getElementById('game-layer') as HTMLDivElement;

    const betScreen = document.getElementById('bet-screen') as HTMLDivElement;
    const objectiveScreen = document.getElementById('objective-screen') as HTMLDivElement;
    const rulesScreen = document.getElementById('rules-screen') as HTMLDivElement;
    const gameoverScreen = document.getElementById('gameover-screen') as HTMLDivElement;

    const crunchSound = document.getElementById('crunch-sound') as HTMLAudioElement;
    const valPoints = document.getElementById('val-points') as HTMLSpanElement;
    const valScore = document.getElementById('val-score') as HTMLSpanElement;
    const valTimer = document.getElementById('val-timer') as HTMLSpanElement;
    const valBalance = document.getElementById('val-balance') as HTMLSpanElement;

    const betInput = document.getElementById('bet-amount') as HTMLInputElement;
    const betError = document.getElementById('bet-error') as HTMLDivElement;
    const objText = document.getElementById('obj-text') as HTMLDivElement;
    const objReward = document.getElementById('obj-reward') as HTMLDivElement;

    const btnSubmitBet = document.getElementById('btn-submit-bet') as HTMLButtonElement;
    const btnStartGame = document.getElementById('btn-start-game') as HTMLButtonElement;
    const btnOpenRules1 = document.getElementById('btn-open-rules-1') as HTMLButtonElement;
    const btnOpenRules2 = document.getElementById('btn-open-rules-2') as HTMLButtonElement;
    const btnCloseRules = document.getElementById('btn-close-rules') as HTMLButtonElement;
    const btnRestart = document.getElementById('btn-restart') as HTMLButtonElement;

    const goTitle = document.getElementById('go-title') as HTMLDivElement;
    const goMsg = document.getElementById('go-msg') as HTMLDivElement;

    function drawBodyGrass() {
      bodyGrassLayer.innerHTML = '';
      const tileSize = 40;
      const cols = Math.ceil(window.innerWidth / tileSize);
      const rows = Math.ceil(window.innerHeight / tileSize);

      bodyGrassLayer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      bodyGrassLayer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = document.createElement('div');
          if ((r % 2 === 0 && c % 2 === 0) || (r % 2 !== 0 && c % 2 !== 0)) {
            cell.className = 'grass-cell';
          }
          bodyGrassLayer.appendChild(cell);
        }
      }
    }
    drawBodyGrass();
    window.addEventListener('resize', drawBodyGrass);

    function drawGrass() {
      grassLayer.innerHTML = '';
      for (let row = 0; row < CELL_NUMBER; row++) {
        for (let col = 0; col < CELL_NUMBER; col++) {
          const cell = document.createElement('div');
          cell.style.gridColumnStart = String(col + 1);
          cell.style.gridRowStart = String(row + 1);
          if ((row % 2 === 0 && col % 2 === 0) || (row % 2 !== 0 && col % 2 !== 0)) {
            cell.className = 'grass-cell';
          }
          grassLayer.appendChild(cell);
        }
      }
    }
    drawGrass();

    class MAIN {
      snake: SNAKE;
      fruits: FRUIT[];
      game_active: boolean;
      state: 'BET' | 'OBJECTIVE' | 'RULES' | 'PLAYING' | 'GAMEOVER';
      previousState: 'BET' | 'OBJECTIVE' | 'RULES' | 'PLAYING' | 'GAMEOVER';
      points: number;
      balance: number;
      currentBet: number;
      start_time: number;
      objective: Objective | null;
      fruitEls: HTMLImageElement[];
      bodyEls: HTMLImageElement[];

      constructor() {
        this.snake = new SNAKE();
        this.fruits = [];
        this.game_active = false;
        this.state = 'BET';
        this.previousState = 'BET';
        this.points = 0;
        this.balance = 10000;
        this.currentBet = 0;
        this.start_time = 0;
        this.objective = null;
        this.fruitEls = [];
        this.bodyEls = [];
      }

      // Aligne le nombre d'éléments <img> du tableau `pool` sur `count`,
      // en réutilisant les éléments existants (évite de tout effacer/recréer
      // à chaque tick, ce qui provoquait un clignotement/disparition du serpent).
      syncPool(pool: HTMLImageElement[], count: number, layer: HTMLDivElement) {
        while (pool.length < count) {
          const img = document.createElement('img');
          img.className = 'game-img';
          layer.appendChild(img);
          pool.push(img);
        }
        while (pool.length > count) {
          const img = pool.pop();
          img?.remove();
        }
      }

      submitBet() {
        const amount = parseInt(betInput.value, 10);
        if (isNaN(amount) || amount < 100 || amount > 500) {
          betError.textContent = 'Mise entre 100 et 500 XOF.';
          return;
        }
        if (amount > this.balance) {
          betError.textContent = 'Solde insuffisant.';
          return;
        }

        betError.textContent = '';
        this.currentBet = amount;
        this.balance -= amount;
        valBalance.textContent = String(this.balance);

        this.generateObjective();
        betScreen.classList.add('hidden');
        objectiveScreen.classList.remove('hidden');
        this.state = 'OBJECTIVE';
      }

      generateObjective() {
        const types: Objective['type'][] = ['TIME', 'POINTS', 'APPLES'];
        const selectedType = types[Math.floor(Math.random() * types.length)];

        if (selectedType === 'TIME') {
          const targetSec = Math.floor(Math.random() * 21) + 20;
          this.objective = { type: 'TIME', target: targetSec };
          objText.textContent = `Survivre pendant au moins ${targetSec} secondes`;
        } else if (selectedType === 'POINTS') {
          const targetPts = (Math.floor(Math.random() * 5) + 4) * 10;
          this.objective = { type: 'POINTS', target: targetPts };
          objText.textContent = `Obtenir un minimum de ${targetPts} points`;
        } else {
          const targetApples = Math.floor(Math.random() * 5) + 4;
          this.objective = { type: 'APPLES', target: targetApples };
          objText.textContent = `Manger au moins ${targetApples} pommes`;
        }

        objReward.textContent = `Récompense: ${this.currentBet * 2} XOF !`;
      }

      openRules() {
        this.previousState = this.state;
        this.state = 'RULES';
        betScreen.classList.add('hidden');
        objectiveScreen.classList.add('hidden');
        rulesScreen.classList.remove('hidden');
      }

      closeRules() {
        rulesScreen.classList.add('hidden');
        this.state = this.previousState;
        if (this.state === 'BET') betScreen.classList.remove('hidden');
        else if (this.state === 'OBJECTIVE') objectiveScreen.classList.remove('hidden');
      }

      startGame() {
        this.snake.reset();
        this.spawn_fruits(3);
        this.game_active = true;
        this.state = 'PLAYING';
        this.points = 0;
        this.start_time = Date.now();

        objectiveScreen.classList.add('hidden');
        gameoverScreen.classList.add('hidden');
      }

      spawn_fruits(count: number) {
        this.fruits = [];
        const occupied = [...this.snake.body];
        for (let i = 0; i < count; i++) {
          const fruit = new FRUIT();
          fruit.randomize(occupied);
          this.fruits.push(fruit);
          occupied.push(fruit.pos);
        }
      }

      update() {
        if (!this.game_active) return;
        this.snake.move_snake();
        this.check_collision();
        this.check_objective();
        this.check_fail();
      }

      check_collision() {
        this.fruits.forEach((fruit) => {
          if (fruit.pos.x === this.snake.body[0].x && fruit.pos.y === this.snake.body[0].y) {
            this.snake.add_block();
            crunchSound.currentTime = 0;
            crunchSound.play().catch(() => {});
            this.points += 10;

            const occupied = [
              ...this.snake.body,
              ...this.fruits.filter((f) => f !== fruit).map((f) => f.pos),
            ];
            fruit.randomize(occupied);
          }
        });
      }

      check_objective() {
        if (!this.objective) return;
        const applesEaten = this.snake.body.length - 3;
        const elapsedSec = Math.floor((Date.now() - this.start_time) / 1000);
        let reached = false;

        if (this.objective.type === 'TIME' && elapsedSec >= this.objective.target) reached = true;
        else if (this.objective.type === 'POINTS' && this.points >= this.objective.target) reached = true;
        else if (this.objective.type === 'APPLES' && applesEaten >= this.objective.target) reached = true;

        if (reached) {
          this.game_win();
        }
      }

      game_win() {
        this.game_active = false;
        this.state = 'GAMEOVER';

        const winAmount = this.currentBet * 2;
        this.balance += winAmount;
        valBalance.textContent = String(this.balance);

        goTitle.textContent = 'VICTOIRE !';
        goMsg.textContent = `Objectif rempli ! Vous remportez ${winAmount} XOF !`;
        gameoverScreen.classList.remove('hidden');
      }

      check_fail() {
        const head = this.snake.body[0];
        const collisionBoundary =
          head.x < 0 || head.x >= CELL_NUMBER || head.y < 0 || head.y >= CELL_NUMBER;
        let collisionSelf = false;

        for (let i = 1; i < this.snake.body.length; i++) {
          if (this.snake.body[i].x === head.x && this.snake.body[i].y === head.y) {
            collisionSelf = true;
            break;
          }
        }

        if (collisionBoundary || collisionSelf) {
          this.game_over();
        }
      }

      game_over() {
        this.game_active = false;
        this.state = 'GAMEOVER';

        goTitle.textContent = 'GAME OVER';
        goMsg.textContent = `Vous avez échoué. Votre mise de ${this.currentBet} XOF a été perdue.`;
        gameoverScreen.classList.remove('hidden');
      }

      reset_to_bet() {
        this.game_active = false;
        this.points = 0;
        this.start_time = 0;
        gameoverScreen.classList.add('hidden');
        betScreen.classList.remove('hidden');
        this.state = 'BET';
      }

      render() {
        if (this.state === 'BET' || this.state === 'OBJECTIVE' || this.state === 'RULES') {
          // Écrans sans plateau visible : on vide une seule fois (pas à chaque tick)
          if (this.fruitEls.length || this.bodyEls.length) {
            this.syncPool(this.fruitEls, 0, gameLayer);
            this.syncPool(this.bodyEls, 0, gameLayer);
          }
          return;
        }

        // --- Fruits : on réutilise les <img> existants, on ne recrée que si le nombre change ---
        const desiredFruits = this.game_active ? this.fruits : [];
        this.syncPool(this.fruitEls, desiredFruits.length, gameLayer);
        desiredFruits.forEach((fruit, i) => {
          const img = this.fruitEls[i];
          if (img.getAttribute('src') !== '/snake/Graphics/apple.png') {
            img.src = '/snake/Graphics/apple.png';
          }
          img.style.gridColumnStart = String(fruit.pos.x + 1);
          img.style.gridRowStart = String(fruit.pos.y + 1);
        });

        // --- Corps du serpent : même principe, on met juste à jour position + src ---
        const body = this.snake.body;
        this.syncPool(this.bodyEls, body.length, gameLayer);

        for (let i = 0; i < body.length; i++) {
          const block = body[i];
          const img = this.bodyEls[i];
          img.style.gridColumnStart = String(block.x + 1);
          img.style.gridRowStart = String(block.y + 1);

          let src = '';
          if (i === 0) {
            const relation = { x: body[1].x - block.x, y: body[1].y - block.y };
            if (relation.x === 1) src = '/snake/Graphics/head_left.png';
            else if (relation.x === -1) src = '/snake/Graphics/head_right.png';
            else if (relation.y === 1) src = '/snake/Graphics/head_up.png';
            else if (relation.y === -1) src = '/snake/Graphics/head_down.png';
          } else if (i === body.length - 1) {
            const relation = { x: body[i - 1].x - block.x, y: body[i - 1].y - block.y };
            if (relation.x === 1) src = '/snake/Graphics/tail_left.png';
            else if (relation.x === -1) src = '/snake/Graphics/tail_right.png';
            else if (relation.y === 1) src = '/snake/Graphics/tail_up.png';
            else if (relation.y === -1) src = '/snake/Graphics/tail_down.png';
          } else {
            const prev = { x: body[i + 1].x - block.x, y: body[i + 1].y - block.y };
            const next = { x: body[i - 1].x - block.x, y: body[i - 1].y - block.y };

            if (prev.x === next.x) src = '/snake/Graphics/body_vertical.png';
            else if (prev.y === next.y) src = '/snake/Graphics/body_horizontal.png';
            else {
              if ((prev.x === -1 && next.y === -1) || (prev.y === -1 && next.x === -1))
                src = '/snake/Graphics/body_tl.png';
              else if ((prev.x === -1 && next.y === 1) || (prev.y === 1 && next.x === -1))
                src = '/snake/Graphics/body_bl.png';
              else if ((prev.x === 1 && next.y === -1) || (prev.y === -1 && next.x === 1))
                src = '/snake/Graphics/body_tr.png';
              else if ((prev.x === 1 && next.y === 1) || (prev.y === 1 && next.x === 1))
                src = '/snake/Graphics/body_br.png';
            }
          }
          if (src && img.getAttribute('src') !== src) {
            img.src = src;
          }
        }

        valPoints.textContent = String(this.points);
        valScore.textContent = String(this.snake.body.length - 3);
        valBalance.textContent = String(this.balance);

        const elapsedMs = this.game_active && this.start_time > 0 ? Date.now() - this.start_time : 0;
        const totalSec = Math.floor(elapsedMs / 1000);
        const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const secs = String(totalSec % 60).padStart(2, '0');
        valTimer.textContent = `${mins}:${secs}`;
      }
    }

    const game = new MAIN();

    const onSubmitBet = () => game.submitBet();
    const onStartGame = () => game.startGame();
    const onOpenRules = () => game.openRules();
    const onCloseRules = () => game.closeRules();
    const onRestart = () => game.reset_to_bet();

    btnSubmitBet.addEventListener('click', onSubmitBet);
    btnStartGame.addEventListener('click', onStartGame);
    btnOpenRules1.addEventListener('click', onOpenRules);
    btnOpenRules2.addEventListener('click', onOpenRules);
    btnCloseRules.addEventListener('click', onCloseRules);
    btnRestart.addEventListener('click', onRestart);

    const intervalId = setInterval(() => {
      game.update();
      game.render();
    }, 150);

    // Clavier
    const onKeyDown = (e: KeyboardEvent) => {
      if (game.state === 'BET' && e.key === 'Enter') {
        game.submitBet();
        return;
      }
      if (game.state === 'OBJECTIVE' && (e.key === 'Enter' || e.code === 'Space')) {
        game.startGame();
        return;
      }
      if (game.state === 'GAMEOVER' && e.code === 'Space') {
        game.reset_to_bet();
        return;
      }

      if (!game.game_active) return;

      switch (e.key) {
        case 'ArrowUp':
          if (game.snake.direction.y !== 1) game.snake.direction = { x: 0, y: -1 };
          break;
        case 'ArrowRight':
          if (game.snake.direction.x !== -1) game.snake.direction = { x: 1, y: 0 };
          break;
        case 'ArrowDown':
          if (game.snake.direction.y !== -1) game.snake.direction = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (game.snake.direction.x !== 1) game.snake.direction = { x: -1, y: 0 };
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // Tactile
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (!game.game_active) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!game.game_active) return;

      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;

      if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 0 && game.snake.direction.x !== -1) game.snake.direction = { x: 1, y: 0 };
          else if (diffX < 0 && game.snake.direction.x !== 1) game.snake.direction = { x: -1, y: 0 };
        } else {
          if (diffY > 0 && game.snake.direction.y !== -1) game.snake.direction = { x: 0, y: 1 };
          else if (diffY < 0 && game.snake.direction.y !== 1) game.snake.direction = { x: 0, y: -1 };
        }
      }
    };

    // Empêche le pull-to-refresh / scroll du navigateur mobile pendant un swipe
    // sur la zone de jeu (sinon glisser vers le bas recharge la page).
    const onTouchMove = (e: TouchEvent) => {
      if (!game.game_active) return;
      e.preventDefault();
    };

    window.addEventListener('touchstart', onTouchStart, false);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, false);

    initialized.current = true;

    // Nettoyage complet au démontage du composant
    return () => {
      if (gameContainerEl) gameContainerEl.dataset.snakeInitialized = 'false';
      clearInterval(intervalId);
      window.removeEventListener('resize', drawBodyGrass);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart, false);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd, false);
      btnSubmitBet.removeEventListener('click', onSubmitBet);
      btnStartGame.removeEventListener('click', onStartGame);
      btnOpenRules1.removeEventListener('click', onOpenRules);
      btnOpenRules2.removeEventListener('click', onOpenRules);
      btnCloseRules.removeEventListener('click', onCloseRules);
      btnRestart.removeEventListener('click', onRestart);
    };
  }, []);

  return (
    <>
      {/* @font-face embarquée directement dans le composant (police servie depuis /snake/Font) */}
      <style>{`
        @font-face {
          font-family: 'GameFont';
          src: url('/snake/Font/PoetsenOne-Regular.ttf') format('truetype');
        }
      `}</style>

      <div id="body-grass-layer" />

      <div id="game-container">
        <div id="grass-layer" />
        <div id="game-layer" />

        {/* HUD */}
        <div id="hud-points" className="hud-element">
          Pts: <span id="val-points">0</span>
        </div>
        <div id="hud-timer" className="hud-element">
          <span id="val-timer">00:00</span>
        </div>
        <div id="hud-balance" className="hud-element">
          Solde: <span id="val-balance">10000</span>
        </div>
        <div id="hud-score" className="hud-element">
          <img src="/snake/Graphics/apple.png" alt="apple" />
          <span id="val-score">0</span>
        </div>

        {/* 1. Popup de Mise */}
        <div id="bet-screen" className="screen-overlay">
          <div className="title">SNAKE GAME</div>
          <div className="instruction">Placer votre mise pour jouer</div>

          <div className="bet-box">
            <div className="bet-input-group">
              <input
                type="number"
                id="bet-amount"
                className="bet-input"
                defaultValue={100}
                min={100}
                max={500}
                step={50}
              />
              <span style={{ fontSize: 20, fontWeight: 'bold' }}>XOF</span>
            </div>
            <div id="bet-error" className="error-msg" />
            <button id="btn-submit-bet" className="btn-play">
              VALIDER LA MISE
            </button>
            <button id="btn-open-rules-1" className="btn-play btn-rules">
              RÈGLES DU JEU
            </button>
          </div>
        </div>

        {/* 2. Popup d'Objectif */}
        <div id="objective-screen" className="screen-overlay hidden">
          <div className="title">VOTRE OBJECTIF</div>
          <div className="objective-card" id="obj-text">
            Chargement...
          </div>
          <div className="reward-tag" id="obj-reward">
            Gagnez le double de votre mise !
          </div>
          <button id="btn-start-game" className="btn-play" style={{ marginTop: 15 }}>
            COMMENCER
          </button>
          <button id="btn-open-rules-2" className="btn-play btn-rules">
            RÈGLES DU JEU
          </button>
        </div>

        {/* 3. Popup des Règles */}
        <div id="rules-screen" className="screen-overlay hidden">
          <div className="title">RÈGLES & GAINS</div>
          <div className="rules-content">
            <h3>Comment Jouer ?</h3>
            <ul>
              <li>Utilisez les flèches du clavier ou glissez votre doigt (mobile) pour diriger le serpent.</li>
              <li>Évitez de percuter les murs ou le corps du serpent.</li>
            </ul>
            <h3>Mises & Objectifs</h3>
            <ul>
              <li>
                Mise minimale: <strong>100 XOF</strong> | Maximale: <strong>500 XOF</strong>.
              </li>
              <li>Un objectif aléatoire vous est attribué avant chaque partie.</li>
            </ul>
            <h3>Conditions de Gains et Pertes</h3>
            <ul>
              <li>
                <strong>VICTOIRE :</strong> Remplissez l'objectif (Temps, Points ou Pommes). Le jeu s'arrête
                instantanément et votre mise est <strong>DOUBLÉE (x2)</strong> !
              </li>
              <li>
                <strong>DÉFAITE :</strong> Si vous touchez un mur ou votre propre corps avant d'atteindre
                l'objectif, vous perdez votre mise.
              </li>
            </ul>
          </div>
          <button id="btn-close-rules" className="btn-play">
            FERMER
          </button>
        </div>

        {/* 4. Popup Fin de Partie */}
        <div id="gameover-screen" className="screen-overlay hidden">
          <div className="title" id="go-title">
            GAME OVER
          </div>
          <div className="instruction" id="go-msg">
            ...
          </div>
          <button id="btn-restart" className="btn-play">
            REJOUER
          </button>
        </div>
      </div>

      <audio id="crunch-sound" src="/snake/Sound/crunch.wav" preload="auto" />
    </>
  );
}