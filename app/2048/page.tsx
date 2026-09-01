'use client';

import React, { useEffect, useRef } from 'react';

export default function Game2048() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const betInputRef = useRef<HTMLInputElement | null>(null);
  const winInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const betInputElement = betInputRef.current;
    const winInputElement = winInputRef.current;
    if (!betInputElement || !winInputElement) return;

    const WIDTH = 576;
    const HEIGHT = 1024;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = WIDTH * DPR;
    canvas.height = HEIGHT * DPR;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    /* ============================================================
       ASSETS
    ============================================================ */

    const assets: { [key: string]: HTMLImageElement } = {};
    const files: { [key: string]: string } = {
      top: 'Top UI.png',
      bottom: 'Bottom UI.png',
      empty: 'Tile Background.png',
      green: 'Green Button.png',
      pink: 'Pink Button.png',
      2: '2 Tile.png',
      4: '4 Tile.png',
      8: '8 Tile.png',
      16: '16 Tile.png',
      32: '32 Tile.png',
      64: '64 Tile.png',
      128: '128 Tile.png',
      256: '256 Tile.png',
      512: '512 Tile.png',
      1024: '1024 Tile.png',
      2048: '2048 Tile.png',
      4096: '4096 Tile.png',
      8192: '8192 Tile.png',
      16384: '16384 Tile.png',
      32768: '32768 Tile.png',
      65536: '65536 Tile.png',
      gameover: 'GameOver Background.png',
      quit: 'Quit Button.png',
      restart: 'Restart Button.png',
      pauseBtn: 'Pause Button.png',
      pausePanel: 'Pause Panel.png',
      continuePause: 'Continue Button Pause.png',
      quitPause: 'Quit Button Pause.png',
      misePanel: 'Mise_Panel.png',
      continueMise: 'Continue Button Game Win.png',
      objectifPanel: 'Objectif.png',
      continueObjectif: 'Continue Button Pause.png',
      winPanel: 'Win Panel.png',
      continueWin: 'Continue Button Game Win.png'
    };

    for (const key in files) {
      const image = new Image();
      image.src = '/2048/' + files[key];
      assets[key] = image;
    }

    /* ============================================================
       BOARD & COORDS & OBJECTIFS
    ============================================================ */

    const board = { x: 32, y: 316, tile: 128, size: 512 };

    let grid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    let score = 0;
    let combinations = 0;
    let movesLeft = 30;
    let gameOver = false;

    let playerBalance = 1000;
    let currentBet = 100;
    let waitingForMise = true;
    let waitingForObjectif = false;
    let paused = false;

    let gameStartTime = 0;
    let elapsedPlayTime = 0;
    let currentObjective: any = null;

    let popup = { type: null as string | null, phase: 'closed', start: 0, afterClose: null as any };
    const POPUP_OPEN_DURATION = 300;
    const POPUP_CLOSE_DURATION = 200;

    function openPopup(type: string) {
      popup.type = type;
      popup.phase = 'opening';
      popup.start = performance.now();
      popup.afterClose = null;

      if (type === 'mise') {
        betInputElement.value = String(currentBet);
        betInputElement.style.display = 'block';
        updateHtmlInputsPosition();
      } else if (type === 'win') {
        winInputElement.value = '+' + (currentBet * 2) + ' XOF';
        winInputElement.style.display = 'block';
        updateHtmlInputsPosition();
      }
    }

    function closePopup(afterClose?: () => void) {
      betInputElement.style.display = 'none';
      winInputElement.style.display = 'none';
      popup.phase = 'closing';
      popup.start = performance.now();
      popup.afterClose = afterClose || null;
    }

    let pressedButton: string | null = null;
    let animating = false;
    let animationStart = 0;
    const MOVE_DURATION = 150;
    const SPAWN_DURATION = 180;
    const MERGE_DURATION = 190;
    let movingTiles: any[] = [];
    let spawnAnimations: any[] = [];
    let mergeAnimations: any[] = [];
    let nextGrid: number[][] | null = null;
    let nextScore = 0;
    let nextCombinations = 0;

    const gameOverPanel = { x: 32, y: 300, width: 512, height: 547 };
    const quitButton = { x: 70, y: 610, width: 190, height: 190 };
    const restartButton = { x: 316, y: 610, width: 190, height: 190 };

    const bottomButton1 = { x: 38, y: 880, width: 96, height: 96 };
    const bottomButton2 = { x: 180, y: 880, width: 96, height: 96 };
    const bottomButton3 = { x: 312, y: 880, width: 96, height: 96 };
    const bottomButton4 = { x: 444, y: 880, width: 96, height: 96 };

    const pausePanelBox = { x: 32, y: 300, width: 512, height: 547 };
    const continuePauseButton = { x: 70, y: 610, width: 190, height: 190 };
    const quitPauseButton = { x: 316, y: 610, width: 190, height: 190 };

    const misePanelBox = { x: 32, y: 300, width: 512, height: 547 };
    const miseInputBox = { x: 87, y: 524, width: 400, height: 100 };
    const continueMiseButton = { x: 61, y: 677, width: 436, height: 110 };

    const objectifPanelBox = { x: 32, y: 300, width: 512, height: 547 };
    const objectifTextBox = { x: 61, y: 466, width: 454, height: 180 };
    const continueObjectifButton = { x: 61, y: 677, width: 436, height: 110 };

    const winPanelBox = { x: 32, y: 300, width: 512, height: 547 };
    const winInputBox = { x: 87, y: 525, width: 400, height: 90 };
    const continueWinButton = { x: 61, y: 677, width: 436, height: 110 };

    function assignRandomObjective() {
      const types = ['score', 'time', 'combinations'];
      const chosenType = types[Math.floor(Math.random() * types.length)];

      switch (chosenType) {
        case 'score':
          currentObjective = { type: 'score', targetScore: 200 + Math.floor(Math.random() * 4) * 100 };
          break;
        case 'time':
          currentObjective = { type: 'time', targetTime: 15 + Math.floor(Math.random() * 3) * 5 };
          break;
        case 'combinations':
          currentObjective = { type: 'combinations', targetCombos: 3 + Math.floor(Math.random() * 4) };
          break;
      }
    }

    function checkObjectiveProgress() {
      if (waitingForMise || waitingForObjectif || gameOver || paused) return;

      elapsedPlayTime = (performance.now() - gameStartTime) / 1000;

      let success = false;
      let failed = false;

      if (currentObjective.type === 'score') {
        if (score >= currentObjective.targetScore) success = true;
        else if (movesLeft <= 0) failed = true;
      } else if (currentObjective.type === 'time') {
        if (elapsedPlayTime >= currentObjective.targetTime) success = true;
        else if (movesLeft <= 0) failed = true;
      } else if (currentObjective.type === 'combinations') {
        if (combinations >= currentObjective.targetCombos) success = true;
        else if (movesLeft <= 0) failed = true;
      }

      if (success) {
        gameOver = true;
        playerBalance += currentBet * 2;
        openPopup('win');
      } else if (failed) {
        gameOver = true;
        playerBalance -= currentBet;
        openPopup('gameover');
      }
    }

    function updateHtmlInputsPosition() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / WIDTH;
      const scaleY = rect.height / HEIGHT;

      betInputElement.style.left = (rect.left + window.scrollX + miseInputBox.x * scaleX) + 'px';
      betInputElement.style.top = (rect.top + window.scrollY + miseInputBox.y * scaleY) + 'px';
      betInputElement.style.width = (miseInputBox.width * scaleX) + 'px';
      betInputElement.style.height = (miseInputBox.height * scaleY) + 'px';
      betInputElement.style.fontSize = Math.floor(36 * scaleY) + 'px';

      winInputElement.style.left = (rect.left + window.scrollX + winInputBox.x * scaleX) + 'px';
      winInputElement.style.top = (rect.top + window.scrollY + winInputBox.y * scaleY) + 'px';
      winInputElement.style.width = (winInputBox.width * scaleX) + 'px';
      winInputElement.style.height = (winInputBox.height * scaleY) + 'px';
      winInputElement.style.fontSize = Math.floor(36 * scaleY) + 'px';
    }

    const handleResize = () => {
      if (popup.phase !== 'closed') {
        updateHtmlInputsPosition();
      }
    };
    window.addEventListener('resize', handleResize);

    const handleInput = (e: any) => {
      const val = parseInt(e.target.value);
      currentBet = isNaN(val) ? 0 : val;
    };
    betInputElement.addEventListener('input', handleInput);

    /* ============================================================
       IMAGE DRAW & HELPERS
    ============================================================ */

    function drawImage(name: string, x: number, y: number, width: number, height: number) {
      const image = assets[name];
      if (image && image.complete && image.naturalWidth > 0) {
        ctx.drawImage(image, x, y, width, height);
      }
    }

    const BUTTON_PRESS_SCALE = 0.90;

    function drawButtonImage(name: string, rect: any, key: string) {
      const pressed = pressedButton === key;
      const scale = pressed ? BUTTON_PRESS_SCALE : 1;
      const width = rect.width * scale;
      const height = rect.height * scale;
      const x = rect.x + (rect.width - width) / 2;
      const y = rect.y + (rect.height - height) / 2;
      drawImage(name, x, y, width, height);
    }

    function drawBackground() {
      // Le fond est désormais géré par le CSS du body (Background body.png ou Background.jpg)
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }

    function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
    function easeOutBack(t: number) {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    function easeInCubic(t: number) { return t * t * t; }

    function drawTile(value: number, x: number, y: number, scale = 1) {
      const image = assets[String(value)];
      if (!image || !image.complete || !image.naturalWidth) return;
      const centerX = board.x + x * 128 + 64;
      const centerY = board.y + y * 128 + 64;
      const size = 128 * scale;
      ctx.drawImage(image, centerX - size / 2, centerY - size / 2, size, size);
    }

    function drawTopNumber(value: number, x: number, y: number) {
      const text = String(value);
      let size = 39;
      if (text.length >= 5) size = 32;
      if (text.length >= 7) size = 27;
      if (text.length >= 9) size = 22;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${size}px 'Kenney Future Narrow', Arial, sans-serif`;
      ctx.lineJoin = 'round';
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#3b3940';
      ctx.strokeText(text, x, y + 2);
      ctx.fillStyle = '#fffbea';
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    function drawTop() {
      drawImage('top', 0, 0, 576, 192);
      drawTopNumber(combinations, 93, 68);
      drawTopNumber(score, 476, 67);
      drawTopNumber(movesLeft, 285, 87);
    }

    function drawBottom() {
      drawImage('bottom', 0, 880, 576, 128);
      drawImage('pink', bottomButton1.x, bottomButton1.y, bottomButton1.width, bottomButton1.height);
      drawImage('pink', bottomButton2.x, bottomButton2.y, bottomButton2.width, bottomButton2.height);
      drawImage('pink', bottomButton3.x, bottomButton3.y, bottomButton3.width, bottomButton3.height);
      drawButtonImage('pauseBtn', bottomButton4, 'pauseBtn');
    }

    /* ============================================================
       LOGIQUE DE JEU
    ============================================================ */

    function getEmptyCells() {
      const cells = [];
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          if (grid[y][x] === 0) cells.push({ x, y });
        }
      }
      return cells;
    }

    function addRandomTile() {
      const cells = getEmptyCells();
      if (cells.length === 0) return null;
      const cell = cells[Math.floor(Math.random() * cells.length)];
      const value = Math.random() < .9 ? 2 : 4;
      grid[cell.y][cell.x] = value;
      return { x: cell.x, y: cell.y, value, start: performance.now() };
    }

    function newGame() {
      grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      score = 0;
      combinations = 0;
      movesLeft = 30;
      gameOver = false;
      paused = false;
      waitingForMise = true;
      waitingForObjectif = false;
      pressedButton = null;
      animating = false;
      movingTiles = [];
      spawnAnimations = [];
      mergeAnimations = [];
      nextGrid = null;
      nextScore = 0;
      nextCombinations = 0;

      openPopup('mise');

      const first = addRandomTile();
      const second = addRandomTile();
      if (first) spawnAnimations.push(first);
      if (second) spawnAnimations.push(second);
    }

    function cloneGrid(source: number[][]) { return source.map(row => [...row]); }

    function processLine(line: number[]) {
      const values = line.filter(value => value !== 0);
      const result = [];
      let gained = 0;
      let merges = 0;
      for (let i = 0; i < values.length; i++) {
        if (i + 1 < values.length && values[i] === values[i + 1]) {
          const value = values[i] * 2;
          result.push(value);
          gained += value;
          merges++;
          i++;
        } else {
          result.push(values[i]);
        }
      }
      while (result.length < 4) result.push(0);
      return { result, gained, merges };
    }

    function simulateMove(direction: string) {
      const old = cloneGrid(grid);
      const next = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      let gained = 0;
      let merges = 0;

      if (direction === 'left') {
        for (let y = 0; y < 4; y++) {
          const res = processLine(old[y]);
          next[y] = res.result;
          gained += res.gained;
          merges += res.merges;
        }
      } else if (direction === 'right') {
        for (let y = 0; y < 4; y++) {
          const res = processLine([...old[y]].reverse());
          next[y] = [...res.result].reverse();
          gained += res.gained;
          merges += res.merges;
        }
      } else if (direction === 'up') {
        for (let x = 0; x < 4; x++) {
          const line = [old[0][x], old[1][x], old[2][x], old[3][x]];
          const res = processLine(line);
          for (let y = 0; y < 4; y++) next[y][x] = res.result[y];
          gained += res.gained;
          merges += res.merges;
        }
      } else if (direction === 'down') {
        for (let x = 0; x < 4; x++) {
          const line = [old[3][x], old[2][x], old[1][x], old[0][x]];
          const res = processLine(line);
          const rev = [...res.result].reverse();
          for (let y = 0; y < 4; y++) next[y][x] = rev[y];
          gained += res.gained;
          merges += res.merges;
        }
      }

      let changed = false;
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          if (old[y][x] !== next[y][x]) changed = true;
        }
      }
      if (!changed) return null;
      return { old, next, gained, merges };
    }

    function createMovementTiles(oldGrid: number[][], direction: string) {
      const result = [];
      if (direction === 'left') {
        for (let y = 0; y < 4; y++) {
          const items = [];
          for (let x = 0; x < 4; x++) {
            if (oldGrid[y][x] !== 0) items.push({ value: oldGrid[y][x], x, y });
          }
          let target = 0;
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (i + 1 < items.length && item.value === items[i + 1].value) {
              result.push({ value: item.value, fromX: item.x, fromY: y, toX: target, toY: y });
              result.push({ value: items[i + 1].value, fromX: items[i + 1].x, fromY: y, toX: target, toY: y });
              target++;
              i++;
            } else {
              result.push({ value: item.value, fromX: item.x, fromY: y, toX: target, toY: y });
              target++;
            }
          }
        }
      } else {
        for (let line = 0; line < 4; line++) {
          const items = [];
          for (let position = 0; position < 4; position++) {
            let x, y;
            if (direction === 'right') { x = 3 - position; y = line; }
            else if (direction === 'up') { x = line; y = position; }
            else { x = line; y = 3 - position; }
            const value = oldGrid[y][x];
            if (value !== 0) items.push({ value, x, y });
          }
          let target = 0;
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            let tx, ty;
            if (direction === 'right') { tx = 3 - target; ty = line; }
            else if (direction === 'up') { tx = line; ty = target; }
            else { tx = line; ty = 3 - target; }
            if (i + 1 < items.length && item.value === items[i + 1].value) {
              result.push({ value: item.value, fromX: item.x, fromY: item.y, toX: tx, toY: ty });
              result.push({ value: items[i + 1].value, fromX: items[i + 1].x, fromY: item.y, toX: tx, toY: ty });
              target++;
              i++;
            } else {
              result.push({ value: item.value, fromX: item.x, fromY: item.y, toX: tx, toY: ty });
              target++;
            }
          }
        }
      }
      return result;
    }

    function move(direction: string) {
      if (animating || gameOver || paused || waitingForMise || waitingForObjectif) return;
      const simulation = simulateMove(direction);
      if (!simulation) return;

      movingTiles = createMovementTiles(simulation.old, direction);
      nextGrid = cloneGrid(simulation.next);
      nextScore = simulation.gained;
      nextCombinations = simulation.merges;
      mergeAnimations = [];

      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const oldValue = simulation.old[y][x];
          const newValue = simulation.next[y][x];
          if (newValue > oldValue && newValue >= 4) {
            mergeAnimations.push({ x, y, value: newValue, start: performance.now() + MOVE_DURATION - 20 });
          }
        }
      }
      animationStart = performance.now();
      animating = true;
    }

    function finishMove() {
      if (!nextGrid) return;
      grid = cloneGrid(nextGrid);
      score += nextScore;
      combinations += nextCombinations;
      nextGrid = null;
      nextScore = 0;
      nextCombinations = 0;

      movesLeft--;
      if (movesLeft < 0) movesLeft = 0;

      const spawned = addRandomTile();
      if (spawned) spawnAnimations.push(spawned);

      movingTiles = [];
      animating = false;

      checkObjectiveProgress();
    }

    /* ============================================================
       RENDU DU PLATEAU
    ============================================================ */

    function drawBoard() {
      ctx.save();
      ctx.fillStyle = 'rgba(48,57,77,.80)';
      ctx.beginPath();
      // @ts-ignore
      ctx.roundRect(32, 316, 512, 512, 24);
      ctx.fill();
      ctx.restore();

      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          drawImage('empty', board.x + x * 128, board.y + y * 128, 128, 128);
        }
      }

      if (animating) {
        const elapsed = performance.now() - animationStart;
        const progress = Math.min(elapsed / MOVE_DURATION, 1);
        const eased = easeOutCubic(progress);

        for (const tile of movingTiles) {
          const x = tile.fromX + (tile.toX - tile.fromX) * eased;
          const y = tile.fromY + (tile.toY - tile.fromY) * eased;
          drawTile(tile.value, x, y, 1);
        }
        if (progress >= 1) finishMove();
        return;
      }

      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const value = grid[y][x];
          if (value === 0) continue;
          let scale = 1;
          const spawn = spawnAnimations.find(item => item.x === x && item.y === y && item.value === value);
          if (spawn) {
            const elapsed = performance.now() - spawn.start;
            const progress = Math.min(elapsed / SPAWN_DURATION, 1);
            scale = easeOutBack(progress);
            if (progress >= 1) spawnAnimations = spawnAnimations.filter(item => item !== spawn);
          }
          drawTile(value, x, y, scale);
        }
      }

      const now = performance.now();
      for (const effect of mergeAnimations) {
        const elapsed = now - effect.start;
        if (elapsed < 0 || elapsed > MERGE_DURATION) continue;
        const progress = Math.min(elapsed / MERGE_DURATION, 1);
        const scale = 1 + .16 * Math.sin(progress * Math.PI);
        drawTile(effect.value, effect.x, effect.y, scale);
      }
      mergeAnimations = mergeAnimations.filter(effect => now - effect.start < MERGE_DURATION);
    }

    /* ============================================================
       POPUPS
    ============================================================ */

    function drawGenericPopup(box: any, panelName: string, drawCustomContent?: () => void) {
      const elapsed = performance.now() - popup.start;
      let scale = 1, alpha = 1;

      if (popup.phase === 'opening') {
        const progress = Math.min(elapsed / POPUP_OPEN_DURATION, 1);
        scale = easeOutBack(progress);
        alpha = Math.min(progress * 1.5, 1);
        if (progress >= 1) popup.phase = 'open';
      } else if (popup.phase === 'closing') {
        const progress = Math.min(elapsed / POPUP_CLOSE_DURATION, 1);
        scale = 1 - easeInCubic(progress);
        alpha = 1 - progress;
        if (progress >= 1) {
          const callback = popup.afterClose;
          popup.phase = 'closed';
          popup.type = null;
          popup.afterClose = null;
          if (callback) callback();
          return;
        }
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);

      drawImage(panelName, box.x, box.y, box.width, box.height);
      if (drawCustomContent) drawCustomContent();

      ctx.restore();
    }

    function drawMise() {
      if (popup.type !== 'mise' || popup.phase === 'closed') return;
      drawGenericPopup(misePanelBox, 'misePanel', () => {
        updateHtmlInputsPosition();
        drawButtonImage('continueMise', continueMiseButton, 'continueMise');
      });
    }

    function drawObjectif() {
      if (popup.type !== 'objectif' || popup.phase === 'closed') return;
      drawGenericPopup(objectifPanelBox, 'objectifPanel', () => {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let line1 = '';
        let line2: any = '';
        if (currentObjective.type === 'score') {
          line1 = 'Atteindre le score de';
          line2 = currentObjective.targetScore;
        } else if (currentObjective.type === 'time') {
          line1 = 'Jouer pendant';
          line2 = currentObjective.targetTime + ' secondes';
        } else if (currentObjective.type === 'combinations') {
          line1 = 'Faire';
          line2 = currentObjective.targetCombos + ' combinaisons';
        }

        const centerX = objectifTextBox.x + objectifTextBox.width / 2;
        const centerY = objectifTextBox.y + objectifTextBox.height / 2;

        ctx.font = "32px 'Kenney Future Narrow', Arial, sans-serif";
        ctx.fillStyle = '#fffbea';
        ctx.fillText(line1, centerX, centerY - 25);

        ctx.font = "42px 'Kenney Future Narrow', Arial, sans-serif";
        ctx.fillText(line2, centerX, centerY + 35);

        ctx.restore();

        drawButtonImage('continueObjectif', continueObjectifButton, 'continueObjectif');
      });
    }

    function drawWin() {
      if (popup.type !== 'win' || popup.phase === 'closed') return;
      drawGenericPopup(winPanelBox, 'winPanel', () => {
        updateHtmlInputsPosition();
        drawButtonImage('continueWin', continueWinButton, 'continueWin');
      });
    }

    function drawGameOver() {
      if (popup.type !== 'gameover' || popup.phase === 'closed') return;
      drawGenericPopup(gameOverPanel, 'gameover', () => {
        drawButtonImage('quit', quitButton, 'quit');
        drawButtonImage('restart', restartButton, 'restart');
      });
    }

    function drawPause() {
      if (popup.type !== 'pause' || popup.phase === 'closed') return;
      drawGenericPopup(pausePanelBox, 'pausePanel', () => {
        drawButtonImage('continuePause', continuePauseButton, 'continue');
        drawButtonImage('quitPause', quitPauseButton, 'quitPause');
      });
    }

    /* ============================================================
       INTERACTIONS CLICS / TOUCHES
    ============================================================ */

    function inside(x: number, y: number, rect: any) {
      return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
    }

    function canvasPosition(event: any) {
      const rect = canvas!.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * WIDTH / rect.width,
        y: (event.clientY - rect.top) * HEIGHT / rect.height
      };
    }

    const handlePointerDown = (event: any) => {
      const pos = canvasPosition(event);
      pressedButton = null;

      if (waitingForMise && popup.phase === 'open') {
        if (inside(pos.x, pos.y, continueMiseButton)) pressedButton = 'continueMise';
      } else if (waitingForObjectif && popup.phase === 'open') {
        if (inside(pos.x, pos.y, continueObjectifButton)) pressedButton = 'continueObjectif';
      } else if (popup.type === 'win' && popup.phase === 'open') {
        if (inside(pos.x, pos.y, continueWinButton)) pressedButton = 'continueWin';
      } else if (gameOver && popup.phase === 'open') {
        if (inside(pos.x, pos.y, restartButton)) pressedButton = 'restart';
        else if (inside(pos.x, pos.y, quitButton)) pressedButton = 'quit';
      } else if (paused && popup.phase === 'open') {
        if (inside(pos.x, pos.y, continuePauseButton)) pressedButton = 'continue';
        else if (inside(pos.x, pos.y, quitPauseButton)) pressedButton = 'quitPause';
      } else if (!gameOver && !paused && !waitingForMise && !waitingForObjectif && popup.type === null) {
        if (inside(pos.x, pos.y, bottomButton4)) pressedButton = 'pauseBtn';
      }
    };
    canvas.addEventListener('pointerdown', handlePointerDown);

    const handlePointerCancel = () => { pressedButton = null; };
    const handlePointerLeave = () => { pressedButton = null; };
    canvas.addEventListener('pointercancel', handlePointerCancel);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    const handlePointerUp = (event: any) => {
      const pos = canvasPosition(event);
      pressedButton = null;

      if (waitingForMise) {
        if (popup.phase !== 'open') return;
        if (inside(pos.x, pos.y, continueMiseButton)) {
          if (currentBet > playerBalance) {
            alert('Solde insuffisant pour cette mise !');
            return;
          }
          closePopup(() => {
            waitingForMise = false;
            assignRandomObjective();
            waitingForObjectif = true;
            openPopup('objectif');
          });
          return;
        }
        return;
      }

      if (waitingForObjectif) {
        if (popup.phase !== 'open') return;
        if (inside(pos.x, pos.y, continueObjectifButton)) {
          closePopup(() => {
            waitingForObjectif = false;
            gameStartTime = performance.now();
          });
          return;
        }
        return;
      }

      if (popup.type === 'win') {
        if (popup.phase !== 'open') return;
        if (inside(pos.x, pos.y, continueWinButton)) {
          closePopup(() => { newGame(); });
          return;
        }
        return;
      }

      if (gameOver) {
        if (popup.phase !== 'open') return;
        if (inside(pos.x, pos.y, restartButton)) { closePopup(() => { newGame(); }); return; }
        if (inside(pos.x, pos.y, quitButton)) { closePopup(() => { newGame(); }); return; }
        return;
      }

      if (paused) {
        if (popup.phase !== 'open') return;
        if (inside(pos.x, pos.y, continuePauseButton)) { closePopup(() => { paused = false; }); return; }
        if (inside(pos.x, pos.y, quitPauseButton)) { closePopup(() => { newGame(); }); return; }
        return;
      }

      if (inside(pos.x, pos.y, bottomButton4)) {
        paused = true;
        openPopup('pause');
        return;
      }
    };
    canvas.addEventListener('pointerup', handlePointerUp);

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchDown = (event: any) => {
      touchStartX = event.clientX;
      touchStartY = event.clientY;
    };
    canvas.addEventListener('pointerdown', handleTouchDown);

    const handleTouchUp = (event: any) => {
      if (gameOver || paused || waitingForMise || waitingForObjectif || popup.type !== null) return;
      const dx = event.clientX - touchStartX;
      const dy = event.clientY - touchStartY;
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      if (distance < 30) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    };
    canvas.addEventListener('pointerup', handleTouchUp);

    /* ============================================================
       CLAVIER
    ============================================================ */

    const handleKeyDown = (event: any) => {
      if (waitingForMise) {
        if (popup.phase === 'open' && event.key === 'Enter') {
          closePopup(() => {
            waitingForMise = false;
            assignRandomObjective();
            waitingForObjectif = true;
            openPopup('objectif');
          });
        }
        return;
      }
      if (waitingForObjectif) {
        if (popup.phase === 'open' && event.key === 'Enter') {
          closePopup(() => {
            waitingForObjectif = false;
            gameStartTime = performance.now();
          });
        }
        return;
      }
      if (popup.type === 'win') {
        if (popup.phase === 'open' && event.key === 'Enter') {
          closePopup(() => { newGame(); });
        }
        return;
      }
      if (gameOver) {
        if (popup.phase === 'open' && (event.key === 'Enter' || event.key.toLowerCase() === 'r')) {
          closePopup(() => { newGame(); });
        }
        return;
      }
      if (paused) {
        if (popup.phase === 'open' && (event.key === 'Escape' || event.key.toLowerCase() === 'p')) {
          closePopup(() => { paused = false; });
        }
        return;
      }

      if (event.key === 'Escape' || event.key.toLowerCase() === 'p') {
        paused = true;
        openPopup('pause');
        return;
      }

      if (event.key === 'ArrowLeft') { event.preventDefault(); move('left'); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move('right'); }
      if (event.key === 'ArrowUp') { event.preventDefault(); move('up'); }
      if (event.key === 'ArrowDown') { event.preventDefault(); move('down'); }
      if (event.key.toLowerCase() === 'r') { newGame(); }
    };
    document.addEventListener('keydown', handleKeyDown);

    /* ============================================================
       BOUCLE PRINCIPALE
    ============================================================ */

    let animationFrameId: number;

    function render() {
      drawBackground();
      drawTop();
      drawBoard();
      drawBottom();
      drawMise();
      drawObjectif();
      drawWin();
      drawGameOver();
      drawPause();
    }

    function loop() {
      render();
      animationFrameId = requestAnimationFrame(loop);
    }

    newGame();
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      betInputElement.removeEventListener('input', handleInput);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointercancel', handlePointerCancel);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerdown', handleTouchDown);
      canvas.removeEventListener('pointerup', handleTouchUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="game-container">
      <canvas ref={canvasRef} id="game"></canvas>
      <input ref={betInputRef} type="number" id="betInput" className="interactive-input" min="1" />
      <input ref={winInputRef} type="text" id="winInput" className="interactive-input" readOnly />

      <style jsx global>{`
        @font-face {
          font-family: 'Kenney Future Narrow';
          src: url('/2048/Kenney Future Narrow.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }

        *{
            margin:0;
            padding:0;
            box-sizing:border-box;
        }

        html,
        body{
            width:100%;
            height:100%;
            overflow:hidden;
            background: url('/2048/Background.png') no-repeat center center fixed;
            background-size: cover;
        }

        @media (min-width: 768px) {
            html,
            body {
                background: url('/2048/Background body.png') no-repeat center center fixed;
                background-size: cover;
            }
        }

        .game-container {
            display:flex;
            justify-content:center;
            align-items:center;
            width: 100vw;
            height: 100vh;
            touch-action:none;
            user-select:none;
            -webkit-user-select:none;
            position: relative;
            font-family: 'Kenney Future Narrow', Arial, sans-serif;
            background: transparent;
            overflow: hidden;
        }

        canvas{
            display:block;
            width:min(100vw,56.25vh);
            height:min(177.7778vw,100vh);
            image-rendering:auto;
        }

        .interactive-input {
            position: absolute;
            display: none;
            background: transparent;
            border: none;
            color: #fffbea;
            font-family: 'Kenney Future Narrow', Arial, sans-serif;
            font-weight: normal;
            text-align: center;
            outline: none;
            z-index: 1000;
        }

        .interactive-input::-webkit-outer-spin-button,
        .interactive-input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        .interactive-input {
            -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}