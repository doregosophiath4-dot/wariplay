"use client";

import { useEffect } from "react";

// ============================================================================
// Jeu de Dames — contre l'IA (minimax)
// Portage 1:1 depuis la version HTML/CSS/JS d'origine.
// La logique de jeu reste imperative (manipulation directe du DOM via
// useEffect) afin de reproduire EXACTEMENT le comportement original,
// sans réécrire le moteur en state React.
//
// Images attendues dans /public/dame/ :
//   /dame/board.png
//   /dame/mobile.jpg
//   /dame/desktop.jpg
//   /dame/pion_light.png
//   /dame/pion_dark.png
// ============================================================================

export default function Game() {
  useEffect(() => {
    // --- background responsive ---
    function setBg() {
      const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
      document.body.style.backgroundImage = isMobile ? "url('/dame/mobile.webp')" : "url('/dame/desktop.webp')";
    }
    setBg();
    window.addEventListener('resize', setBg);

    // --- ÉLÉMENTS DOM ---
    const gridEl = document.getElementById('grid') as HTMLDivElement;
    const boardWrap = document.getElementById('boardWrap') as HTMLDivElement;
    const statusEl = document.getElementById('status') as HTMLDivElement;
    const turnIndicator = document.getElementById('turnIndicator') as HTMLDivElement;
    const lightCountEl = document.getElementById('lightCount') as HTMLElement;
    const darkCountEl = document.getElementById('darkCount') as HTMLElement;
    const balanceDisplay = document.getElementById('balanceDisplay') as HTMLElement;
    const popupBalance = document.getElementById('popupBalance') as HTMLElement;
    const betOverlay = document.getElementById('betOverlay') as HTMLDivElement;
    const betInput = document.getElementById('betInput') as HTMLInputElement;
    const betError = document.getElementById('betError') as HTMLDivElement;
    const betConfirm = document.getElementById('betConfirm') as HTMLButtonElement;
    const rulesOverlay = document.getElementById('rulesOverlay') as HTMLDivElement;
    const btnRules = document.getElementById('btnRules') as HTMLButtonElement;
    const btnCloseRules = document.getElementById('btnCloseRules') as HTMLButtonElement;
    const resultOverlay = document.getElementById('resultOverlay') as HTMLDivElement;
    const resultTitle = document.getElementById('resultTitle') as HTMLElement;
    const resultAmount = document.getElementById('resultAmount') as HTMLElement;
    const resultContinue = document.getElementById('resultContinue') as HTMLButtonElement;
    const btnNew = document.getElementById('btnNew') as HTMLButtonElement;

    // --- TYPES ---
    type Color = 'light' | 'dark';
    type Piece = { color: Color; king: boolean } | null;
    type Board = Piece[][];
    type Pos = { r: number; c: number };
    type Move = { from: Pos; to: Pos; capture: Pos | null };

    // --- STATE (closures, comme dans l'IIFE d'origine) ---
    let board: Board, turn: Color, selected: Pos | null, forced: boolean | null,
      gameOver: boolean, history: any[], aiThinking: boolean;
    let animating = false;
    let balance = 10000;
    let currentBet = 0;
    let gameStarted = false;
    let gameResult: string | null = null;

    // --- CELLS ---
    // On vide la grille avant de la reconstruire : rend l'effet rejouable
    // sans dupliquer les cases (utile notamment en React Strict Mode, qui
    // monte/nettoie/remonte l'effet une fois en développement).
    gridEl.innerHTML = '';
    const cells: HTMLDivElement[][] = [];
    for (let r = 0; r < 8; r++) {
      const row: HTMLDivElement[] = [];
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = String(r); cell.dataset.c = String(c);
        cell.addEventListener('click', (e) => { e.stopPropagation(); onCellClick(r, c); });
        cell.addEventListener('touchend', (e) => { e.preventDefault(); onCellClick(r, c); });
        gridEl.appendChild(cell);
        row.push(cell);
      }
      cells.push(row);
    }

    // --- HELPERS ---
    function cloneBoard(b: Board): Board { return b.map(row => row.map(cell => cell ? { ...cell } : null)); }
    function inBounds(r: number, c: number) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

    // --- BOARD ---
    function freshBoard(): Board {
      const b: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r][c] = { color: 'dark', king: false };
      for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r][c] = { color: 'light', king: false };
      return b;
    }

    // --- MOVES ---
    function pieceMoves(b: Board, r: number, c: number): { steps: Move[]; captures: Move[] } {
      const p = b[r][c];
      if (!p) return { steps: [], captures: [] };
      const dirs = p.king
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : (p.color === 'light' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);
      const steps: Move[] = [], captures: Move[] = [];
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (!inBounds(nr, nc)) continue;
        const occ = b[nr][nc];
        if (!occ) {
          steps.push({ from: { r, c }, to: { r: nr, c: nc }, capture: null });
        } else if (occ.color !== p.color) {
          const jr = nr + dr, jc = nc + dc;
          if (inBounds(jr, jc) && !b[jr][jc]) {
            captures.push({ from: { r, c }, to: { r: jr, c: jc }, capture: { r: nr, c: nc } });
          }
        }
      }
      return { steps, captures };
    }

    function getAllMoves(b: Board, color: Color): Move[] {
      let allSteps: Move[] = [], allCaptures: Move[] = [];
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (p && p.color === color) {
          const { steps, captures } = pieceMoves(b, r, c);
          allSteps.push(...steps);
          allCaptures.push(...captures);
        }
      }
      return allCaptures.length > 0 ? allCaptures : allSteps;
    }

    function getForcedContinuation(b: Board, r: number, c: number): Move[] {
      return pieceMoves(b, r, c).captures;
    }

    function applyMove(b: Board, move: Move): { board: Board; captured: boolean; promoted: boolean; landing: Pos } {
      const nb = cloneBoard(b);
      const piece = nb[move.from.r][move.from.c]!;
      nb[move.from.r][move.from.c] = null;
      if (move.capture) nb[move.capture.r][move.capture.c] = null;
      let promoted = false;
      if (!piece.king) {
        if (piece.color === 'light' && move.to.r === 0) { piece.king = true; promoted = true; }
        if (piece.color === 'dark' && move.to.r === 7) { piece.king = true; promoted = true; }
      }
      nb[move.to.r][move.to.c] = piece;
      return { board: nb, captured: !!move.capture, promoted, landing: move.to };
    }

    // --- RENDER ---
    const pieceWrappers = new Map<string, HTMLDivElement>();

    function render() {
      for (const wrapper of pieceWrappers.values()) { wrapper.remove(); }
      pieceWrappers.clear();

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const cell = cells[r][c];
          cell.classList.remove('selected', 'hint', 'hint-capture', 'playable');
          if ((r + c) % 2 === 1) cell.classList.add('playable');
          const p = board[r][c];
          if (p) {
            const wrapper = document.createElement('div');
            wrapper.className = 'piece-wrapper';
            const img = document.createElement('img');
            img.className = 'piece';
            img.src = p.color === 'light' ? '/dame/pion_light.webp' : '/dame/pion_dark.webp';
            wrapper.appendChild(img);
            if (p.king) {
              const ring = document.createElement('div');
              ring.className = 'king-ring';
              wrapper.appendChild(ring);
            }
            cell.appendChild(wrapper);
            pieceWrappers.set(r + ',' + c, wrapper);
          }
        }
      }

      if (selected) {
        cells[selected.r][selected.c].classList.add('selected');
        const moves = forced ? getForcedContinuation(board, selected.r, selected.c) : movesForSelected();
        moves.forEach(m => {
          cells[m.to.r][m.to.c].classList.add(m.capture ? 'hint-capture' : 'hint');
        });
      }

      let lightN = 0, darkN = 0;
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) { p.color === 'light' ? lightN++ : darkN++; }
      }
      lightCountEl.textContent = String(lightN);
      darkCountEl.textContent = String(darkN);
      balanceDisplay.textContent = String(balance);
    }

    function animateMove(fromR: number, fromC: number, toR: number, toC: number, callback: () => void) {
      const key = fromR + ',' + fromC;
      const wrapper = pieceWrappers.get(key);
      if (!wrapper) { callback(); return; }
      const fromCell = cells[fromR][fromC];
      const toCell = cells[toR][toC];
      if (!fromCell || !toCell) { callback(); return; }

      const fromRect = fromCell.getBoundingClientRect();
      const toRect = toCell.getBoundingClientRect();
      const dx = toRect.left - fromRect.left;
      const dy = toRect.top - fromRect.top;

      wrapper.style.transform = `translate(${dx}px, ${dy}px)`;
      wrapper.classList.add('moving');

      setTimeout(() => {
        wrapper.style.transform = '';
        wrapper.classList.remove('moving');
        callback();
      }, 320);
    }

    // --- HUMAN MOVES ---
    function movesForSelected(): Move[] {
      const all = getAllMoves(board, 'light');
      return all.filter(m => m.from.r === selected!.r && m.from.c === selected!.c);
    }

    function onCellClick(r: number, c: number) {
      if (!gameStarted || gameOver || aiThinking || animating || turn !== 'light') return;
      const p = board[r][c];

      if (selected) {
        const moves = forced ? getForcedContinuation(board, selected.r, selected.c) : movesForSelected();
        const move = moves.find(m => m.to.r === r && m.to.c === c);
        if (move) {
          animating = true;
          const fromR = selected.r, fromC = selected.c;
          const toR = move.to.r, toC = move.to.c;

          animateMove(fromR, fromC, toR, toC, () => {
            pushHistory();
            const res = applyMove(board, move);
            board = res.board;
            render();

            if (res.captured && !res.promoted) {
              const further = getForcedContinuation(board, res.landing.r, res.landing.c);
              if (further.length > 0) {
                selected = { r: res.landing.r, c: res.landing.c };
                forced = true;
                render();
                setStatus('Prise en chaîne : continuez.');
                animating = false;
                return;
              }
            }
            selected = null; forced = null;
            render();
            animating = false;
            endHumanTurn();
          });
          return;
        }
        if (!forced && p && p.color === 'light') {
          selected = { r, c };
          render();
          return;
        }
        if (!forced) {
          selected = null;
          render();
        }
        return;
      }

      if (p && p.color === 'light') {
        const all = getAllMoves(board, 'light');
        const mine = all.filter(m => m.from.r === r && m.from.c === c);
        if (mine.length === 0) {
          const anyCapture = all.some(m => m.capture);
          setStatus(anyCapture ? 'Une prise est obligatoire avec un autre pion.' : '');
          return;
        }
        selected = { r, c };
        render();
      }
    }

    function endHumanTurn() {
      const darkMoves = getAllMoves(board, 'dark');
      if (darkMoves.length === 0) { finishGame('light'); return; }
      turn = 'dark';
      updateTurnIndicator();
      setStatus('');
      aiThinking = true;
      boardWrap.classList.add('thinking');
      setTimeout(() => aiStep(), 380);
    }

    function checkHumanCanMove() {
      const lightMoves = getAllMoves(board, 'light');
      if (lightMoves.length === 0) { finishGame('dark'); return false; }
      return true;
    }

    function finishGame(winner: Color) {
      gameOver = true;
      aiThinking = false;
      boardWrap.classList.remove('thinking');

      if (winner === 'light') {
        const gain = currentBet * 2;
        balance += gain;
        gameResult = 'win';
        showResult('Victoire !', gain, 'win');
        setStatus('Bravo ! Vous remportez ' + gain + ' XOF.');
      } else if (winner === 'dark') {
        gameResult = 'lose';
        showResult('Défaite...', currentBet, 'lose');
        setStatus('Perdu... Vous perdez ' + currentBet + ' XOF.');
      } else {
        balance += currentBet;
        gameResult = 'draw';
        showResult('Égalité', currentBet, 'draw');
        setStatus('Égalité ! Vous récupérez votre mise.');
      }

      balanceDisplay.textContent = String(balance);
      gameStarted = false;

      if (balance < 100) {
        setTimeout(() => {
          balance = 10000;
          balanceDisplay.textContent = String(balance);
          setStatus('Solde réinitialisé à 10000 XOF.');
          showBetPopup();
        }, 2000);
      }
    }

    function showResult(title: string, amount: number, type: 'win' | 'lose' | 'draw') {
      resultTitle.textContent = title;
      let className = '';
      let sign = '';
      if (type === 'win') {
        className = 'win';
        sign = '+';
      } else if (type === 'lose') {
        className = 'lose';
        sign = '-';
      } else {
        className = 'draw';
        sign = '±';
      }
      resultAmount.innerHTML = sign + ' ' + amount + ' XOF <span class="' + className + '"></span>';
      resultOverlay.style.display = 'flex';
    }

    function setStatus(msg: string) { statusEl.textContent = msg; }
    function updateTurnIndicator() {
      if (gameOver) return;
      turnIndicator.innerHTML = turn === 'light'
        ? '<span class="turn-dot light"></span> À vous de jouer'
        : '<span class="turn-dot dark"></span> L\'IA réfléchit…';
    }

    // --- AI ---
    function evaluate(b: Board) {
      let score = 0;
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (!p) continue;
        let val = p.king ? 1.7 : 1.0;
        const adv = p.color === 'dark' ? r : (7 - r);
        val += adv * 0.03;
        if (c >= 2 && c <= 5) val += 0.05;
        score += (p.color === 'dark' ? val : -val);
      }
      return score;
    }

    function search(b: Board, color: Color, depth: number, alpha: number, beta: number): number {
      const moves = getAllMoves(b, color);
      if (moves.length === 0) return color === 'dark' ? -999 : 999;
      if (depth <= 0) return evaluate(b);
      const isMax = color === 'dark';
      let best = isMax ? -Infinity : Infinity;
      for (const move of moves) {
        const res = applyMove(b, move);
        let value: number;
        if (res.captured && !res.promoted && getForcedContinuation(res.board, res.landing.r, res.landing.c).length > 0) {
          value = search(res.board, color, depth, alpha, beta);
        } else {
          const next: Color = color === 'dark' ? 'light' : 'dark';
          value = search(res.board, next, depth - 1, alpha, beta);
        }
        if (isMax) {
          if (value > best) best = value;
          alpha = Math.max(alpha, value);
        } else {
          if (value < best) best = value;
          beta = Math.min(beta, value);
        }
        if (beta <= alpha) break;
      }
      return best;
    }

    function chooseBestMove(movesPool: Move[], b: Board, depth: number): Move {
      let bestVal = -Infinity, bestMoves: Move[] = [];
      for (const move of movesPool) {
        const res = applyMove(b, move);
        let value: number;
        if (res.captured && !res.promoted && getForcedContinuation(res.board, res.landing.r, res.landing.c).length > 0) {
          value = search(res.board, 'dark', depth, -Infinity, Infinity);
        } else {
          value = search(res.board, 'light', depth - 1, -Infinity, Infinity);
        }
        if (value > bestVal) { bestVal = value; bestMoves = [move]; }
        else if (value === bestVal) { bestMoves.push(move); }
      }
      return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    function aiStep(cont?: Pos) {
      const depth = 4;
      const movesPool = cont ? getForcedContinuation(board, cont.r, cont.c) : getAllMoves(board, 'dark');
      if (movesPool.length === 0) {
        aiThinking = false; boardWrap.classList.remove('thinking');
        turn = 'light'; updateTurnIndicator();
        checkHumanCanMove();
        return;
      }
      const move = chooseBestMove(movesPool, board, depth);
      const fromR = move.from.r, fromC = move.from.c;
      const toR = move.to.r, toC = move.to.c;

      animating = true;
      animateMove(fromR, fromC, toR, toC, () => {
        const res = applyMove(board, move);
        board = res.board;
        render();

        if (res.captured && !res.promoted) {
          const further = getForcedContinuation(board, res.landing.r, res.landing.c);
          if (further.length > 0) {
            animating = false;
            setTimeout(() => aiStep({ r: res.landing.r, c: res.landing.c }), 400);
            return;
          }
        }
        animating = false;
        aiThinking = false;
        boardWrap.classList.remove('thinking');
        turn = 'light';
        updateTurnIndicator();
        setStatus('');
        if (!checkHumanCanMove()) return;
        render();
      });
    }

    // --- HISTORY ---
    function pushHistory() {
      history.push({ board: cloneBoard(board), turn, selected: selected ? { ...selected } : null, forced });
      if (history.length > 200) history.shift();
    }

    // --- BET POPUP ---
    function showBetPopup() {
      betOverlay.style.display = 'flex';
      popupBalance.textContent = String(balance);
      betInput.value = String(Math.min(100, balance));
      betError.textContent = '';
      betConfirm.disabled = false;
      if (balance < 100) {
        betError.textContent = 'Solde insuffisant. Réinitialisation à 10000 XOF.';
        setTimeout(() => {
          balance = 10000;
          balanceDisplay.textContent = String(balance);
          popupBalance.textContent = String(balance);
          betError.textContent = '';
        }, 1500);
      }
    }

    function hideBetPopup() {
      betOverlay.style.display = 'none';
    }

    function startGameWithBet() {
      const val = parseInt(betInput.value);
      if (isNaN(val) || val < 100) {
        betError.textContent = 'La mise minimale est de 100 XOF.';
        return;
      }
      if (val > 500) {
        betError.textContent = 'La mise maximale est de 500 XOF.';
        return;
      }
      if (val > balance) {
        betError.textContent = 'Solde insuffisant.';
        return;
      }
      currentBet = val;
      balance -= currentBet;
      balanceDisplay.textContent = String(balance);
      hideBetPopup();
      board = freshBoard();
      turn = 'light';
      selected = null; forced = null; gameOver = false; aiThinking = false; animating = false;
      history = [];
      boardWrap.classList.remove('thinking');
      gameStarted = true;
      gameResult = null;
      render();
      updateTurnIndicator();
      setStatus('Mise de ' + currentBet + ' XOF. Bonne chance !');
    }

    // --- EVENTS POPUP ---
    const onBetConfirm = () => startGameWithBet();
    betConfirm.addEventListener('click', onBetConfirm);

    const onBetInput = () => {
      const val = parseInt(betInput.value);
      if (!isNaN(val) && val >= 100 && val <= 500 && val <= balance) {
        betError.textContent = '';
      }
    };
    betInput.addEventListener('input', onBetInput);

    // --- RESULT POPUP ---
    const onResultContinue = () => {
      resultOverlay.style.display = 'none';
      if (balance < 100) {
        balance = 10000;
        balanceDisplay.textContent = String(balance);
        setStatus('Solde réinitialisé à 10000 XOF.');
      }
      showBetPopup();
    };
    resultContinue.addEventListener('click', onResultContinue);

    // --- REGLES POPUP ---
    const onOpenRules = () => { rulesOverlay.style.display = 'flex'; };
    btnRules.addEventListener('click', onOpenRules);

    const onCloseRules = () => { rulesOverlay.style.display = 'none'; };
    btnCloseRules.addEventListener('click', onCloseRules);

    const onRulesOverlayClick = (e: MouseEvent) => {
      if (e.target === rulesOverlay) {
        rulesOverlay.style.display = 'none';
      }
    };
    rulesOverlay.addEventListener('click', onRulesOverlayClick);

    // --- NEW GAME BUTTON ---
    const onBtnNew = () => {
      if (gameStarted && !gameOver) {
        balance -= currentBet;
        balanceDisplay.textContent = String(balance);
        gameStarted = false;
        gameOver = true;
        setStatus('Partie abandonnée. Vous perdez ' + currentBet + ' XOF.');
        if (balance < 100) {
          setTimeout(() => {
            balance = 10000;
            balanceDisplay.textContent = String(balance);
            setStatus('Solde réinitialisé à 10000 XOF.');
            showBetPopup();
          }, 1500);
        } else {
          setTimeout(showBetPopup, 1200);
        }
      } else {
        showBetPopup();
      }
    };
    btnNew.addEventListener('click', onBtnNew);

    // --- INIT ---
    board = freshBoard();
    turn = 'light';
    selected = null; forced = null; gameOver = false; aiThinking = false; animating = false;
    history = [];
    gameStarted = false;
    balance = 10000;
    balanceDisplay.textContent = String(balance);
    render();
    updateTurnIndicator();
    setStatus('');
    showBetPopup();

    // --- CLEANUP ---
    return () => {
      window.removeEventListener('resize', setBg);
      betConfirm.removeEventListener('click', onBetConfirm);
      betInput.removeEventListener('input', onBetInput);
      resultContinue.removeEventListener('click', onResultContinue);
      btnRules.removeEventListener('click', onOpenRules);
      btnCloseRules.removeEventListener('click', onCloseRules);
      rulesOverlay.removeEventListener('click', onRulesOverlayClick);
      btnNew.removeEventListener('click', onBtnNew);
      // Les écouteurs des 64 cases sont attachés aux éléments eux-mêmes ;
      // les retirer du DOM ici suffit à les libérer proprement.
      gridEl.innerHTML = '';
    };
  }, []);

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
          margin: 0;
          padding: 0;
        }
        html, body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          font-family: 'Segoe UI', Roboto, system-ui, Arial, sans-serif;
          background-color: #1e130c;
          color: #f1e6d4;
          overflow: hidden;
          height: 100%;
          width: 100%;
        }
        body {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100vw;
          padding: 20px;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
        }
        .app {
          display: flex;
          gap: 28px;
          max-width: 1180px;
          width: 100%;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
        }
        .board-section {
          flex: 0 1 auto;
          min-width: 280px;
          max-width: 560px;
          width: 100%;
        }
        .board-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1/1;
          user-select: none;
          flex-shrink: 0;
          touch-action: manipulation;
        }
        .board-img {
          width: 100%;
          height: 100%;
          display: block;
          pointer-events: none;
          filter: drop-shadow(0 18px 30px rgba(0,0,0,0.65));
          transition: filter 0.2s;
        }
        .grid {
          position: absolute;
          left: 16.45%;
          top: 16.45%;
          width: 67.09%;
          height: 67.09%;
          display: grid;
          grid-template-columns: repeat(8,1fr);
          grid-template-rows: repeat(8,1fr);
          pointer-events: none;
        }
        .cell {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          cursor: default;
          touch-action: manipulation;
        }
        .cell.playable { cursor: pointer; }
        .cell.selected::before {
          content: '';
          position: absolute;
          inset: 6%;
          border-radius: 50%;
          box-shadow: 0 0 0 3px #c9973f, 0 0 12px rgba(201,151,63,0.6);
          transition: box-shadow 0.15s;
        }
        .cell.hint::after {
          content: '';
          position: absolute;
          width: 28%;
          height: 28%;
          border-radius: 50%;
          background: #6fbf73;
          opacity: 0.85;
          box-shadow: 0 0 12px rgba(111,191,115,0.5);
        }
        .cell.hint-capture::after {
          background: #d9695f;
          box-shadow: 0 0 12px rgba(217,105,95,0.6);
        }
        .piece-wrapper {
          position: absolute;
          width: 86%;
          height: 86%;
          transition: transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.2s;
          will-change: transform;
          pointer-events: none;
          z-index: 5;
        }
        .piece-wrapper.moving {
          transition: transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.2s;
        }
        .piece {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));
          display: block;
          pointer-events: none;
        }
        .king-ring {
          position: absolute;
          width: 40%;
          height: 40%;
          border-radius: 50%;
          border: 2.5px solid #ffd966;
          box-shadow: 0 0 8px rgba(255,215,0,0.8);
          pointer-events: none;
          top: 30%;
          left: 30%;
        }
        .board-wrap.thinking .grid { opacity: 0.8; pointer-events: none; }
        .board-wrap.thinking .piece-wrapper { filter: brightness(0.7); }

        .panel {
          background: linear-gradient(145deg, #2b1d14, #1f140e);
          border: 1px solid rgba(201,151,63,0.25);
          border-radius: 16px;
          padding: 18px 18px 22px;
          width: min(280px, 100%);
          flex-shrink: 0;
          box-shadow: 0 12px 30px rgba(0,0,0,0.6);
          backdrop-filter: blur(2px);
          align-self: center;
        }
        .section {
          margin-bottom: 18px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .section-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #b8a48a;
          margin: 0 0 10px;
          font-weight: 700;
        }
        .turn-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 700;
        }
        .turn-dot {
          width: 16px; height: 16px;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(0,0,0,0.5) inset;
          flex-shrink: 0;
        }
        .turn-dot.light { background: #d9a55c; }
        .turn-dot.dark { background: #3a2213; }
        .score-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-top: 8px;
          color: #b8a48a;
        }
        .score-row .balance { color: #c9973f; font-weight: 700; }
        button {
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(201,151,63,0.35);
          background: rgba(201,151,63,0.08);
          color: #f1e6d4;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          width: 100%;
          touch-action: manipulation;
        }
        button:hover { background: rgba(201,151,63,0.18); }
        button:active { transform: scale(0.97); }
        button.primary {
          background: #c9973f;
          color: #241708;
          border-color: #c9973f;
          font-weight: 700;
        }
        button.primary:hover { background: #dba84f; }
        .tools { display: flex; flex-direction: column; gap: 8px; }

        /* POPUP DE MISE */
        .bet-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .bet-popup {
          background: rgba(30, 19, 12, 0.92);
          border: 2px solid rgba(201,151,63,0.4);
          border-radius: 24px;
          padding: 32px 28px 28px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 24px 60px rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
        }
        .bet-popup h2 {
          color: #c9973f;
          font-size: 22px;
          text-align: center;
          margin: 0 0 8px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .bet-popup .sub {
          text-align: center;
          color: #b8a48a;
          font-size: 14px;
          margin: 0 0 20px;
        }
        .bet-popup .balance-display {
          text-align: center;
          font-size: 18px;
          font-weight: 700;
          color: #f1e6d4;
          margin-bottom: 20px;
          padding: 10px;
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          border: 1px solid rgba(201,151,63,0.15);
        }
        .bet-popup .balance-display span { color: #c9973f; }
        .bet-popup .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .bet-popup .input-group label {
          font-size: 13px;
          color: #b8a48a;
          font-weight: 600;
        }
        .bet-popup .input-group input {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(201,151,63,0.3);
          background: rgba(0,0,0,0.3);
          color: #f1e6d4;
          font-size: 18px;
          font-weight: 600;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }
        .bet-popup .input-group input:focus {
          border-color: #c9973f;
        }
        .bet-popup .input-group input::placeholder {
          color: #6a5a4a;
          font-weight: 400;
          font-size: 14px;
        }
        .bet-popup .range-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #8a7a6a;
          padding: 0 4px;
          margin-top: -6px;
          margin-bottom: 16px;
        }
        .bet-popup .error-msg {
          color: #d9695f;
          font-size: 13px;
          text-align: center;
          min-height: 20px;
          margin-bottom: 12px;
        }
        .bet-popup .actions {
          display: flex;
          gap: 10px;
        }
        .bet-popup .actions button {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .bet-popup .actions button:active { transform: scale(0.96); }
        .bet-popup .actions .btn-confirm {
          background: #c9973f;
          color: #241708;
          width: 100%;
        }
        .bet-popup .actions .btn-confirm:hover { background: #dba84f; }
        .bet-popup .actions .btn-confirm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* POPUP REGLES */
        .rules-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          padding: 20px;
        }
        .rules-popup {
          background: rgba(30, 19, 12, 0.95);
          border: 2px solid rgba(201,151,63,0.4);
          border-radius: 24px;
          padding: 32px 28px 28px;
          max-width: 480px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 24px 60px rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
        }
        .rules-popup h2 {
          color: #c9973f;
          font-size: 22px;
          text-align: center;
          margin: 0 0 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .rules-popup .rules-content {
          color: #d4c8b8;
          font-size: 14px;
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .rules-popup .rules-content strong { color: #c9973f; }
        .rules-popup .rules-content ul {
          padding-left: 20px;
          margin: 8px 0;
        }
        .rules-popup .rules-content ul li { margin-bottom: 4px; }
        .rules-popup .btn-close-rules {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          border: none;
          background: #c9973f;
          color: #241708;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .rules-popup .btn-close-rules:hover { background: #dba84f; }
        .rules-popup .btn-close-rules:active { transform: scale(0.96); }

        /* POPUP RESULTAT */
        .result-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 1002;
          padding: 20px;
        }
        .result-popup {
          background: rgba(30, 19, 12, 0.95);
          border: 2px solid rgba(201,151,63,0.4);
          border-radius: 24px;
          padding: 32px 28px 28px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 24px 60px rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          text-align: center;
        }
        .result-popup h2 {
          font-size: 24px;
          margin: 0 0 8px;
          font-weight: 700;
        }
        .result-popup .result-amount {
          font-size: 20px;
          font-weight: 700;
          margin: 12px 0;
          padding: 12px;
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
        }
        .result-popup .result-amount .win { color: #6fbf73; }
        .result-popup .result-amount .lose { color: #d9695f; }
        .result-popup .result-amount .draw { color: #c9973f; }
        .result-popup .btn-continue {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          border: none;
          background: #c9973f;
          color: #241708;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .result-popup .btn-continue:hover { background: #dba84f; }
        .result-popup .btn-continue:active { transform: scale(0.96); }

        @media (max-width: 750px) {
          html, body {
            overflow: hidden;
            height: 100%;
            width: 100%;
            position: fixed;
            top: 0;
            left: 0;
            align-items: center;
            justify-content: center;
            padding: 10px;
          }
          body {
            padding: 10px;
            height: 100%;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .app { gap: 16px; justify-content: center; align-items: center; }
          .panel { width: 100%; max-width: 400px; align-self: center; }
          .bet-popup { padding: 24px 18px 20px; }
          .bet-popup h2 { font-size: 19px; }
          .bet-popup .input-group input { font-size: 16px; padding: 10px 12px; }
          .rules-popup { padding: 24px 18px 20px; max-height: 85vh; }
          .result-popup { padding: 24px 18px 20px; }
        }
        @media (max-width: 480px) {
          .panel { padding: 14px 14px 18px; }
          .section { margin-bottom: 14px; padding-bottom: 12px; }
          .turn-indicator { font-size: 14px; }
        }
      `}</style>

      <div className="app">
        <div className="board-section">
          <div className="board-wrap" id="boardWrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="board-img" id="boardImg" src="/dame/board.webp" alt="Plateau" />
            <div className="grid" id="grid"></div>
          </div>
        </div>

        <div className="panel">
          <div className="section">
            <p className="section-title">Tour</p>
            <div className="turn-indicator" id="turnIndicator">
              <span className="turn-dot light"></span> À vous de jouer
            </div>
            <div className="score-row"><span>Pions clairs : <b id="lightCount">12</b></span></div>
            <div className="score-row"><span>Pions foncés : <b id="darkCount">12</b></span></div>
            <div className="score-row"><span>Solde : <b className="balance" id="balanceDisplay">10000</b> XOF</span></div>
            <div className="status" id="status"></div>
          </div>
          <div className="section tools">
            <p className="section-title">Actions</p>
            <button className="primary" id="btnNew">Nouvelle partie</button>
            <button id="btnRules">📖 Règles</button>
          </div>
        </div>
      </div>

      {/* POPUP DE MISE */}
      <div className="bet-overlay" id="betOverlay">
        <div className="bet-popup">
          <h2>💰 Mise</h2>
          <p className="sub">Placez votre mise pour commencer la partie</p>
          <div className="balance-display">Solde : <span id="popupBalance">10000</span> XOF</div>
          <div className="input-group">
            <label htmlFor="betInput">Montant de la mise (XOF)</label>
            <input type="number" id="betInput" min={100} max={500} defaultValue={100} step={10} />
          </div>
          <div className="range-info">
            <span>Min : 100 XOF</span>
            <span>Max : 500 XOF</span>
          </div>
          <div className="error-msg" id="betError"></div>
          <div className="actions">
            <button className="btn-confirm" id="betConfirm">Jouer</button>
          </div>
        </div>
      </div>

      {/* POPUP RESULTAT */}
      <div className="result-overlay" id="resultOverlay">
        <div className="result-popup">
          <h2 id="resultTitle">Résultat</h2>
          <div className="result-amount" id="resultAmount"></div>
          <button className="btn-continue" id="resultContinue">Continuer</button>
        </div>
      </div>

      {/* POPUP REGLES */}
      <div className="rules-overlay" id="rulesOverlay">
        <div className="rules-popup">
          <h2>📖 Règles du jeu de Dames</h2>
          <div className="rules-content">
            <p><strong>But du jeu :</strong> Capturer tous les pions adverses ou le bloquer pour qu&apos;il ne puisse plus jouer.</p>
            <ul>
              <li><strong>Déplacement :</strong> Les pions se déplacent en diagonale d&apos;une case vers l&apos;avant (vers le haut pour les clairs, vers le bas pour les foncés).</li>
              <li><strong>Capture :</strong> Obligatoire ! Si vous pouvez sauter par-dessus un pion adverse, vous devez le faire. La capture se fait en diagonale par-dessus le pion adverse, sur une case vide derrière lui.</li>
              <li><strong>Chaîne de captures :</strong> Après une capture, si le même pion peut encore capturer, il doit continuer sa série de prises.</li>
              <li><strong>Dame (couronne) :</strong> Un pion qui atteint la dernière rangée devient une Dame. Elle peut se déplacer en diagonale dans les 4 directions, d&apos;une case à la fois.</li>
              <li><strong>Victoire :</strong> La partie se termine quand un camp n&apos;a plus de pion ou ne peut plus effectuer de mouvement.</li>
            </ul>
            <p style={{ marginTop: 10 }}><strong>💡 Astuce :</strong> Les prises sont obligatoires, mais vous pouvez choisir entre plusieurs captures possibles.</p>
          </div>
          <button className="btn-close-rules" id="btnCloseRules">Fermer</button>
        </div>
      </div>
    </>
  );
}