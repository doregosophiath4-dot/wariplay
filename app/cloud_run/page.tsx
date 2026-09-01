"use client";

import { useEffect, useRef } from "react";

/**
 * Migration fidèle du jeu "Ballon de Foot Volant" (HTML/CSS/JS) vers Next.js (TSX).
 *
 * Choix technique important :
 * - Pour garantir un rendu et un comportement STRICTEMENT identiques à l'original
 *   (clamp(), keyframes, backdrop-filter, media queries précises, etc.), le CSS
 *   d'origine est conservé quasiment tel quel dans un bloc <style jsx global>.
 *   Tailwind n'est pas capable de reproduire clamp()/keyframes personnalisées
 *   sans configuration additionnelle, donc on évite de "traduire" ce CSS en
 *   classes Tailwind afin de ne rien changer visuellement.
 * - Toute la logique JS (variables de jeu, boucle de rendu, collisions, mises,
 *   objectifs, etc.) est reprise à l'identique dans un seul useEffect, avec les
 *   `document.getElementById` remplacés par des `useRef`.
 * - Les images doivent être placées dans /public/cloud-run/ :
 *     public/cloud-run/desktop.png
 *     public/cloud-run/mobile.png
 *     public/cloud-run/ballon.jpg
 *     public/cloud-run/cloud.jpg
 */

export default function Game() {
  // --- Refs DOM (remplacent les document.getElementById) ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const scoreElRef = useRef<HTMLSpanElement | null>(null);
  const difficultyElRef = useRef<HTMLSpanElement | null>(null);
  const finalScoreElRef = useRef<HTMLSpanElement | null>(null);
  const restartHintRef = useRef<HTMLDivElement | null>(null);

  const betContainerRef = useRef<HTMLDivElement | null>(null);
  const balanceDisplayRef = useRef<HTMLSpanElement | null>(null);
  const betInputRef = useRef<HTMLInputElement | null>(null);
  const betErrorRef = useRef<HTMLDivElement | null>(null);
  const betButtonRef = useRef<HTMLButtonElement | null>(null);
  const rulesButtonRef = useRef<HTMLButtonElement | null>(null);

  const rulesContainerRef = useRef<HTMLDivElement | null>(null);
  const rulesCloseButtonRef = useRef<HTMLButtonElement | null>(null);

  const objectiveContainerRef = useRef<HTMLDivElement | null>(null);
  const objectiveContentRef = useRef<HTMLDivElement | null>(null);
  const objectiveSubRef = useRef<HTMLDivElement | null>(null);
  const objectiveButtonRef = useRef<HTMLButtonElement | null>(null);

  const countdownContainerRef = useRef<HTMLDivElement | null>(null);
  const countdownDisplayRef = useRef<HTMLDivElement | null>(null);

  const winContainerRef = useRef<HTMLDivElement | null>(null);
  const winAmountRef = useRef<HTMLDivElement | null>(null);
  const winDetailRef = useRef<HTMLDivElement | null>(null);
  const winButtonRef = useRef<HTMLButtonElement | null>(null);

  const gameOverContainerRef = useRef<HTMLDivElement | null>(null);
  const objectiveResultRef = useRef<HTMLDivElement | null>(null);
  const winLoseDisplayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // ===================================================================
    // Tout le code ci-dessous est la transposition quasi 1:1 du <script>
    // d'origine, en remplaçant getElementById par les refs React.
    // ===================================================================

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const scoreEl = scoreElRef.current!;
    const finalScoreEl = finalScoreElRef.current!;
    const difficultyEl = difficultyElRef.current!;
    const restartHint = restartHintRef.current!;

    const betContainer = betContainerRef.current!;
    const balanceDisplay = balanceDisplayRef.current!;
    const betInput = betInputRef.current!;
    const betError = betErrorRef.current!;

    const rulesContainer = rulesContainerRef.current!;

    const gameOverContainer = gameOverContainerRef.current!;
    const winLoseDisplay = winLoseDisplayRef.current!;
    const objectiveResult = objectiveResultRef.current!;

    const countdownContainer = countdownContainerRef.current!;
    const countdownDisplay = countdownDisplayRef.current!;

    const objectiveContainer = objectiveContainerRef.current!;
    const objectiveContent = objectiveContentRef.current!;
    const objectiveSub = objectiveSubRef.current!;

    const winContainer = winContainerRef.current!;
    const winAmountEl = winAmountRef.current!;
    const winDetailEl = winDetailRef.current!;

    // --- GESTION DU BACKGROUND ---
    const urlPC = "/cloud-run/desktop.png";
    const urlMobile = "/cloud-run/mobile.png";

    function setBackground() {
      if (window.innerWidth > 768) {
        document.body.style.backgroundImage = `url('${urlPC}')`;
      } else {
        document.body.style.backgroundImage = `url('${urlMobile}')`;
      }
    }

    // --- GESTION DES MISES ---
    let balance = 10000;
    let currentBet = 100;

    function updateBalanceDisplay() {
      balanceDisplay.textContent = balance.toLocaleString();
    }

    function validateBet() {
      const amount = parseInt(betInput.value);
      if (isNaN(amount) || amount < 100) {
        betError.textContent = "La mise minimale est de 100 XOF";
        return false;
      }
      if (amount > 500) {
        betError.textContent = "La mise maximale est de 500 XOF";
        return false;
      }
      if (amount > balance) {
        betError.textContent = "Solde insuffisant !";
        return false;
      }
      betError.textContent = "";
      return true;
    }

    // --- GESTION DES RÈGLES ---
    function showRules() {
      rulesContainer.classList.add("active");
    }
    function closeRules() {
      rulesContainer.classList.remove("active");
    }

    // --- GESTION DES OBJECTIFS ---
    type ObjectiveType = "score" | "time" | "avoid";
    let currentObjective: { type: ObjectiveType; target: number } | null = null;
    let gameStartTime = 0;
    let cloudsAvoided = 0;
    let objectiveCompleted = false;
    let objectiveDisplayed = false;
    let gameWinTriggered = false;

    function generateObjective() {
      const types: ObjectiveType[] = ["score", "time", "avoid"];
      const type = types[Math.floor(Math.random() * types.length)];
      let target = 0;
      switch (type) {
        case "score":
          target = Math.floor(Math.random() * 5 + 3) * 50;
          break;
        case "time":
          target = Math.floor(Math.random() * 5 + 5);
          break;
        case "avoid":
          target = Math.floor(Math.random() * 5 + 5);
          break;
      }
      return { type, target };
    }

    function showObjectivePopup() {
      currentObjective = generateObjective();
      objectiveCompleted = false;
      cloudsAvoided = 0;
      objectiveDisplayed = false;
      gameWinTriggered = false;

      let displayText = "";
      switch (currentObjective.type) {
        case "score":
          displayText =
            'Atteindre <span class="highlight">' +
            currentObjective.target +
            "</span> points";
          break;
        case "time":
          displayText =
            'Jouer pendant <span class="highlight">' +
            currentObjective.target +
            "</span> secondes";
          break;
        case "avoid":
          displayText =
            'Eviter <span class="highlight">' +
            currentObjective.target +
            "</span> nuages";
          break;
      }
      objectiveContent.innerHTML = displayText;
      objectiveSub.textContent = "Reussis cet objectif pour doubler ta mise";
      objectiveContainer.classList.add("active");
    }

    let countdownInterval: ReturnType<typeof setInterval> | null = null;

    function startCountdown() {
      objectiveContainer.classList.remove("active");
      objectiveDisplayed = true;
      gameStartTime = Date.now();

      let count = 3;
      countdownContainer.classList.add("active");
      countdownDisplay.textContent = String(count);
      countdownDisplay.className = "countdown-number";

      countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
          countdownDisplay.textContent = String(count);
          countdownDisplay.style.animation = "none";
          setTimeout(() => {
            countdownDisplay.style.animation = "countdownPulse 0.8s ease-in-out";
          }, 10);
        } else if (count === 0) {
          countdownDisplay.textContent = "GO!";
          countdownDisplay.className = "countdown-number go";
          countdownDisplay.style.animation = "countdownPulse 0.8s ease-in-out";
        } else {
          if (countdownInterval) clearInterval(countdownInterval);
          countdownContainer.classList.remove("active");
          resetGame();
        }
      }, 800);
    }

    function updateObjectiveProgress() {
      if (!currentObjective || !objectiveDisplayed || gameWinTriggered) return;
      let progress = 0;
      const max = currentObjective.target;
      switch (currentObjective.type) {
        case "score":
          progress = Math.min(score, max);
          break;
        case "time":
          progress = Math.min(Math.floor((Date.now() - gameStartTime) / 1000), max);
          break;
        case "avoid":
          progress = Math.min(cloudsAvoided, max);
          break;
      }
      if (progress >= max && !objectiveCompleted) {
        objectiveCompleted = true;
        gameWinTriggered = true;
        gameRunning = false;
        showWinPopup();
      }
    }

    function showWinPopup() {
      const winAmountValue = currentBet * 2;
      balance += winAmountValue;
      updateBalanceDisplay();
      winAmountEl.textContent = "+ " + winAmountValue + " XOF";
      winDetailEl.textContent = "Objectif atteint ! Mise doublee (x2)";
      winContainer.classList.add("active");
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      drawGameOverScreen();
    }

    function continueAfterWin() {
      winContainer.classList.remove("active");
      betContainer.classList.add("active");
      updateBalanceDisplay();
      objectiveDisplayed = false;
      gameWinTriggered = false;
    }

    // --- CODE DU JEU ---
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();

    function updateRestartHint() {
      restartHint.textContent =
        window.innerWidth > 768
          ? "Appuie sur Espace ou clique pour rejouer"
          : "Touche l'ecran pour rejouer";
    }
    updateRestartHint();

    // --- VARIABLES DU JEU ---
    let score = 0;
    let gameRunning = false;
    let gameSpeed = 4;
    let spawnInterval = 75;
    let maxClouds = 3;
    let level = 1;
    let animationId: number | null = null;
    let spawnTimer = 0;

    // --- BALLOON ---
    const balloonImg = new Image();
    balloonImg.src = "/cloud-run/ballon.jpg";

    function getBalloonSize() {
      const w = window.innerWidth;
      if (w < 400) return 40;
      if (w < 600) return 50;
      if (w < 900) return 60;
      return 70;
    }

    const balloon = {
      x: 0,
      y: window.innerHeight / 2,
      radius: 25,
      size: getBalloonSize(),
      dy: 0,
      jumpForce: -7.5,
      gravity: 0.45,
      getJumpForce() {
        const w = window.innerWidth;
        if (w < 400) return -6.5;
        if (w < 600) return -7.0;
        if (w < 900) return -7.8;
        return -8.5;
      },
      updatePosition() {
        this.x = canvas.width * 0.12;
        if (this.x < this.size / 2) this.x = this.size / 2;
      },
      draw() {
        const size = this.size;
        if (balloonImg.complete && balloonImg.naturalWidth !== 0) {
          ctx.drawImage(balloonImg, this.x - size / 2, this.y - size / 2, size, size);
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = "#ff4757";
          ctx.fill();
          ctx.strokeStyle = "#2f3542";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.closePath();
        }
      },
      update() {
        this.updatePosition();
        this.dy += this.gravity;
        this.y += this.dy;
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
          gameRunning = false;
          showGameOver();
        }
      },
      flap() {
        if (gameRunning) this.dy = this.getJumpForce();
      },
      updateSize() {
        this.size = getBalloonSize();
        this.radius = this.size / 2;
        this.updatePosition();
      },
    };
    balloon.updatePosition();
    balloon.updateSize();

    // --- GESTION DES NUAGES ---
    const cloudSheet = new Image();
    cloudSheet.src = "/cloud-run/cloud.jpg";
    const sheetCols = 4;
    const sheetRows = 3;

    function getCloudSize() {
      const w = window.innerWidth;
      if (w < 400) return { w: 110, h: 85 };
      if (w < 600) return { w: 140, h: 105 };
      if (w < 900) return { w: 170, h: 125 };
      return { w: 190, h: 140 };
    }

    class Cloud {
      width: number;
      height: number;
      x: number;
      y: number;
      cloudIndex: number;
      speedOffset: number;
      wasAvoided: boolean;

      constructor() {
        const sizes = getCloudSize();
        this.width = sizes.w;
        this.height = sizes.h;
        this.x = canvas.width + 50;
        const margin = this.height + 30;
        this.y = Math.random() * (canvas.height - margin * 2) + margin;
        this.cloudIndex = Math.floor(Math.random() * (sheetCols * sheetRows));
        this.speedOffset = 0.7 + Math.random() * 0.6;
        this.wasAvoided = false;
      }
      draw() {
        if (cloudSheet.complete && cloudSheet.naturalWidth !== 0) {
          const imgWidth = cloudSheet.naturalWidth;
          const imgHeight = cloudSheet.naturalHeight;
          const cellWidth = imgWidth / sheetCols;
          const cellHeight = imgHeight / sheetRows;
          const col = this.cloudIndex % sheetCols;
          const row = Math.floor(this.cloudIndex / sheetCols);
          ctx.drawImage(
            cloudSheet,
            col * cellWidth,
            row * cellHeight,
            cellWidth,
            cellHeight,
            this.x,
            this.y,
            this.width,
            this.height
          );
        } else {
          ctx.fillStyle = "rgba(200, 230, 255, 0.8)";
          ctx.beginPath();
          ctx.arc(this.x + 30, this.y + 30, 30, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(this.x + 70, this.y + 25, 28, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(this.x + 50, this.y + 55, 32, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      update() {
        this.x -= gameSpeed * this.speedOffset;
        if (!this.wasAvoided && this.x + this.width < 0) {
          this.wasAvoided = true;
          cloudsAvoided++;
          updateObjectiveProgress();
        }
      }
      getHitbox() {
        const padding = 8;
        return {
          x: this.x + padding,
          y: this.y + padding,
          width: this.width - padding * 2,
          height: this.height - padding * 2,
        };
      }
    }

    let clouds: Cloud[] = [];

    function checkCollision(
      circle: { x: number; y: number; radius: number },
      rect: { x: number; y: number; width: number; height: number }
    ) {
      const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
      const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
      const dx = circle.x - closestX;
      const dy = circle.y - closestY;
      return dx * dx + dy * dy < circle.radius * circle.radius;
    }

    function updateDifficulty() {
      level = Math.floor(score / 40) + 1;
      gameSpeed = Math.min(16, 4 + (level - 1) * 0.9);
      spawnInterval = Math.max(25, 75 - (level - 1) * 4);
      maxClouds = Math.min(12, Math.round(3 + (level - 1) * 0.4));
      let stars = "";
      if (level <= 3) stars = "⭐".repeat(level);
      else if (level <= 6) stars = "🌟🌟🌟 +" + (level - 3);
      else if (level <= 10) stars = "🔥 Niv." + level;
      else stars = "💀 Niv." + level;
      difficultyEl.textContent = stars + ` (${maxClouds}☁️)`;
      if (level <= 3) difficultyEl.style.color = "#4ade80";
      else if (level <= 6) difficultyEl.style.color = "#fbbf24";
      else if (level <= 9) difficultyEl.style.color = "#fb923c";
      else if (level <= 12) difficultyEl.style.color = "#f87171";
      else {
        difficultyEl.style.color = "#ef4444";
        difficultyEl.style.fontWeight = "900";
      }
    }

    function startGame() {
      if (!validateBet()) return;
      currentBet = parseInt(betInput.value);
      balance -= currentBet;
      updateBalanceDisplay();
      betContainer.classList.remove("active");
      showObjectivePopup();
    }

    function showGameOver() {
      gameRunning = false;
      const objectiveSuccess = objectiveCompleted;
      let winAmountValue = 0;
      let isWin = false;
      if (objectiveSuccess) {
        winAmountValue = currentBet * 2;
        balance += winAmountValue;
        isWin = true;
      }
      finalScoreEl.textContent = String(score);
      updateBalanceDisplay();
      objectiveResult.textContent = objectiveSuccess ? "Objectif reussi !" : "Objectif non atteint";
      objectiveResult.style.color = objectiveSuccess ? "#4ade80" : "#f87171";
      winLoseDisplay.className = "win-lose " + (isWin ? "win" : "lose");
      winLoseDisplay.textContent = isWin
        ? "+" + winAmountValue + " XOF (Gagne)"
        : "-" + currentBet + " XOF (Perdu)";
      gameOverContainer.classList.add("active");
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      drawGameOverScreen();
    }

    function drawGameOverScreen() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      balloon.draw();
      for (const c of clouds) c.draw();
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function resetGame() {
      score = 0;
      clouds = [];
      gameSpeed = 4;
      spawnInterval = 75;
      maxClouds = 3;
      level = 1;
      spawnTimer = 0;
      gameRunning = true;
      balloon.y = canvas.height / 2;
      balloon.dy = 0;
      balloon.updateSize();
      balloon.updatePosition();
      gameOverContainer.classList.remove("active");
      winContainer.classList.remove("active");
      scoreEl.innerText = "0";
      updateDifficulty();
      if (animationId) cancelAnimationFrame(animationId);
      loop();
    }

    // ============================================================
    // GESTION DES CLICS / TAPS
    // ============================================================
    function goToBetScreen() {
      if (gameOverContainer.classList.contains("active")) {
        gameOverContainer.classList.remove("active");
        betContainer.classList.add("active");
        updateBalanceDisplay();
        objectiveDisplayed = false;
        return true;
      }
      return false;
    }

    function handleCanvasTap(e: Event) {
      if (e) e.preventDefault();
      if (gameRunning) {
        balloon.flap();
        return;
      }
      if (gameOverContainer.classList.contains("active")) {
        goToBetScreen();
        return;
      }
      if (winContainer.classList.contains("active")) {
        return;
      }
    }

    function handleKeydown(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (gameRunning) {
          balloon.flap();
        } else if (gameOverContainer.classList.contains("active")) {
          goToBetScreen();
        }
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.target === canvas) e.preventDefault();
    }

    function handleGameOverClick(e: Event) {
      if (e.target === gameOverContainer) {
        goToBetScreen();
      }
    }
    function handleGameOverTouch(e: TouchEvent) {
      if (e.target === gameOverContainer) {
        e.preventDefault();
        goToBetScreen();
      }
    }

    function stopPropagation(e: Event) {
      e.stopPropagation();
    }

    // --- BOUCLE PRINCIPALE ---
    function loop() {
      if (!gameRunning) {
        drawGameOverScreen();
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      balloon.update();
      balloon.draw();
      updateDifficulty();
      spawnTimer++;
      if (spawnTimer >= spawnInterval && clouds.length < maxClouds) {
        let spawnCount = 1;
        if (level >= 8 && Math.random() < 0.3) spawnCount = 2;
        if (level >= 12 && Math.random() < 0.4) spawnCount = 3;
        for (let i = 0; i < spawnCount && clouds.length < maxClouds; i++) {
          clouds.push(new Cloud());
        }
        spawnTimer = 0;
      }
      for (let i = clouds.length - 1; i >= 0; i--) {
        clouds[i].update();
        clouds[i].draw();
        const cloudHitbox = clouds[i].getHitbox();
        if (checkCollision(balloon, cloudHitbox)) {
          gameRunning = false;
          showGameOver();
          return;
        }
        if (clouds[i].x + clouds[i].width < -20) {
          clouds.splice(i, 1);
          score += 10;
          scoreEl.innerText = String(score);
          updateObjectiveProgress();
        }
      }
      scoreEl.innerText = String(score);
      animationId = requestAnimationFrame(loop);
    }

    function handleResize() {
      resizeCanvas();
      updateRestartHint();
      balloon.updateSize();
      balloon.updatePosition();
      if (balloon.y + balloon.radius > canvas.height) balloon.y = canvas.height - balloon.radius;
      if (balloon.y - balloon.radius < 0) balloon.y = balloon.radius;
    }

    // --- LANCEMENT ---
    let imagesLoaded = 0;
    const totalImages = 2;
    function onImageLoad() {
      imagesLoaded++;
      if (imagesLoaded >= totalImages) {
        balloon.updatePosition();
        updateDifficulty();
        updateBalanceDisplay();
      }
    }
    balloonImg.onload = onImageLoad;
    cloudSheet.onload = onImageLoad;
    if (balloonImg.complete && balloonImg.naturalWidth !== 0) imagesLoaded++;
    if (cloudSheet.complete && cloudSheet.naturalWidth !== 0) imagesLoaded++;
    if (imagesLoaded >= totalImages) {
      balloon.updatePosition();
      updateDifficulty();
      updateBalanceDisplay();
    }

    // --- ATTACHE DES ÉVÉNEMENTS ---
    window.addEventListener("load", setBackground);
    setBackground();
    window.addEventListener("resize", setBackground);
    window.addEventListener("resize", handleResize);

    canvas.addEventListener("click", handleCanvasTap);
    canvas.addEventListener("touchstart", handleCanvasTap, { passive: false });
    window.addEventListener("keydown", handleKeydown);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    gameOverContainer.addEventListener("click", handleGameOverClick);
    gameOverContainer.addEventListener("touchstart", handleGameOverTouch, { passive: false });

    const allButtons = document.querySelectorAll("button");
    allButtons.forEach((btn) => {
      btn.addEventListener("click", stopPropagation);
      btn.addEventListener("touchstart", stopPropagation, { passive: true });
    });

    const betBtn = betButtonRef.current!;
    const rulesBtn = rulesButtonRef.current!;
    const rulesCloseBtn = rulesCloseButtonRef.current!;
    const objectiveBtn = objectiveButtonRef.current!;
    const winBtn = winButtonRef.current!;

    const onStartGame = () => startGame();
    const onShowRules = () => showRules();
    const onCloseRules = () => closeRules();
    const onStartCountdown = () => startCountdown();
    const onContinueAfterWin = () => continueAfterWin();

    betBtn.addEventListener("click", onStartGame);
    rulesBtn.addEventListener("click", onShowRules);
    rulesCloseBtn.addEventListener("click", onCloseRules);
    objectiveBtn.addEventListener("click", onStartCountdown);
    winBtn.addEventListener("click", onContinueAfterWin);

    updateBalanceDisplay();

    // --- NETTOYAGE ---
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (countdownInterval) clearInterval(countdownInterval);

      window.removeEventListener("load", setBackground);
      window.removeEventListener("resize", setBackground);
      window.removeEventListener("resize", handleResize);

      canvas.removeEventListener("click", handleCanvasTap);
      canvas.removeEventListener("touchstart", handleCanvasTap);
      window.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("touchmove", handleTouchMove);

      gameOverContainer.removeEventListener("click", handleGameOverClick);
      gameOverContainer.removeEventListener("touchstart", handleGameOverTouch);

      allButtons.forEach((btn) => {
        btn.removeEventListener("click", stopPropagation);
        btn.removeEventListener("touchstart", stopPropagation);
      });

      betBtn.removeEventListener("click", onStartGame);
      rulesBtn.removeEventListener("click", onShowRules);
      rulesCloseBtn.removeEventListener("click", onCloseRules);
      objectiveBtn.removeEventListener("click", onStartCountdown);
      winBtn.removeEventListener("click", onContinueAfterWin);
    };
  }, []);

  return (
    <>
      <div id="score-board">
        <span id="score" ref={scoreElRef}>
          0
        </span>
        <span id="difficulty-indicator" ref={difficultyElRef}>
          Niv. 1
        </span>
      </div>

      {/* POPUP DE MISE */}
      <div id="betContainer" className="active" ref={betContainerRef}>
        <div className="bet-message">
          <h1>Mise</h1>
          <div className="balance">
            Solde : <span ref={balanceDisplayRef}>10 000</span> XOF
          </div>
          <div className="bet-input-group">
            <label htmlFor="betInput">Montant de la mise</label>
            <input
              type="number"
              id="betInput"
              ref={betInputRef}
              min={100}
              max={500}
              defaultValue={100}
              step={100}
            />
            <div className="bet-error" ref={betErrorRef} />
          </div>
          <div className="bet-buttons-group">
            <button className="bet-button" ref={betButtonRef}>
              Jouer
            </button>
            <button className="rules-button" ref={rulesButtonRef}>
              <svg
                className="svg-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
          </div>
          <div className="rules">Min : 100 XOF | Max : 500 XOF</div>
        </div>
      </div>

      {/* POPUP RÈGLES */}
      <div id="rulesContainer" ref={rulesContainerRef}>
        <div className="rules-message">
          <h2>Regles</h2>
          <div className="rules-section">
            <h3>Comment jouer</h3>
            <p>
              Appuie sur <span className="highlight-info">Espace</span> (PC) ou{" "}
              <span className="highlight-info">tape l&apos;ecran</span> (Mobile) pour faire voler le
              ballon.
            </p>
            <p>Evite les nuages et atteins ton objectif !</p>
          </div>
          <div className="rules-section">
            <h3>Gains &amp; Pertes</h3>
            <p>
              • <span className="highlight-win">Objectif atteint</span> : Mise{" "}
              <span className="highlight-win">DOUBLEE</span> (x2)
            </p>
            <p>
              • <span className="highlight-lose">Objectif non atteint</span> : Perte totale de la
              mise
            </p>
            <p>
              • <span className="highlight-info">Pas de gain partiel</span> : Seul l&apos;objectif
              compte
            </p>
          </div>
          <div className="rules-section">
            <h3>Objectifs</h3>
            <p>Un objectif aleatoire te sera donne avant chaque partie :</p>
            <p>
              • <span className="highlight-info">Atteindre X points</span>
            </p>
            <p>
              • <span className="highlight-info">Jouer pendant X secondes</span>
            </p>
            <p>
              • <span className="highlight-info">Eviter X nuages</span>
            </p>
          </div>
          <div className="rules-section">
            <h3>Controles</h3>
            <div className="controls">
              <span>Espace</span>
              <span>Clic</span>
              <span>Tap</span>
            </div>
          </div>
          <button className="rules-close-button" ref={rulesCloseButtonRef}>
            Fermer
          </button>
        </div>
      </div>

      {/* POPUP OBJECTIF */}
      <div id="objectiveContainer" ref={objectiveContainerRef}>
        <div className="objective-message">
          <h2>OBJECTIF</h2>
          <div className="objective-content" ref={objectiveContentRef}>
            Atteindre <span className="highlight">200</span> points
          </div>
          <div className="objective-sub" ref={objectiveSubRef}>
            Reussis cet objectif pour doubler ta mise
          </div>
          <button className="objective-button" ref={objectiveButtonRef}>
            Pret ?
          </button>
        </div>
      </div>

      {/* COMPTE À REBOURS */}
      <div id="countdownContainer" ref={countdownContainerRef}>
        <div className="countdown-number" ref={countdownDisplayRef}>
          3
        </div>
      </div>

      {/* POPUP GAME WIN */}
      <div id="winContainer" ref={winContainerRef}>
        <div className="win-message">
          <h1>Victoire</h1>
          <div className="win-amount" ref={winAmountRef}>
            + 200 XOF
          </div>
          <div className="win-detail" ref={winDetailRef}>
            Objectif atteint ! Mise doublee
          </div>
          <button className="win-button" ref={winButtonRef}>
            Continuer
          </button>
        </div>
      </div>

      {/* GAME OVER POPUP */}
      <div id="gameOverContainer" ref={gameOverContainerRef}>
        <div className="game-over-message">
          <h1>Game Over</h1>
          <div className="final-score">
            Score : <span ref={finalScoreElRef}>0</span>
          </div>
          <div className="objective-result" ref={objectiveResultRef} />
          <div className="win-lose" ref={winLoseDisplayRef} />
          <div className="restart-hint" ref={restartHintRef}>
            Appuie pour rejouer
          </div>
        </div>
      </div>

      <canvas id="gameCanvas" ref={canvasRef} />

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          color: white;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          height: 100vh;
          width: 100vw;
          touch-action: none;
        }

        canvas {
          display: block;
          background-color: transparent;
          width: 100%;
          height: 100%;
          touch-action: none;
        }

        #score-board {
          position: absolute;
          top: clamp(10px, 3vh, 30px);
          left: 50%;
          transform: translateX(-50%);
          font-size: clamp(20px, 5vw, 48px);
          font-weight: 900;
          letter-spacing: 0.05em;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4);
          z-index: 10;
          background: rgba(0, 0, 0, 0.25);
          padding: 0.2em 1.2em;
          border-radius: 60px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          white-space: nowrap;
          pointer-events: none;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        #score-board span {
          color: #fff;
          font-weight: 900;
        }

        #difficulty-indicator {
          font-size: clamp(12px, 2vw, 20px);
          background: rgba(255, 255, 255, 0.15);
          padding: 0.1em 0.8em;
          border-radius: 40px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .svg-icon {
          width: clamp(20px, 2.5vw, 30px);
          height: clamp(20px, 2.5vw, 30px);
          display: inline-block;
          vertical-align: middle;
          fill: currentColor;
        }

        #betContainer,
        #rulesContainer,
        #objectiveContainer,
        #countdownContainer,
        #winContainer,
        #gameOverContainer {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 30;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        #betContainer.active,
        #rulesContainer.active,
        #objectiveContainer.active,
        #countdownContainer.active,
        #winContainer.active,
        #gameOverContainer.active {
          display: flex;
        }

        #betContainer {
          z-index: 30;
        }
        #rulesContainer {
          z-index: 35;
        }
        #objectiveContainer {
          z-index: 26;
        }
        #countdownContainer {
          z-index: 25;
        }
        #winContainer {
          z-index: 27;
        }
        #gameOverContainer {
          z-index: 20;
        }

        @keyframes popupFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes contentSlideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes countdownPulse {
          0% {
            transform: scale(1.5);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes winPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes winAmountPop {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .bet-message,
        .rules-message,
        .objective-message,
        .win-message,
        .game-over-message {
          text-align: center;
          padding: clamp(30px, 5vh, 50px) clamp(20px, 4vw, 40px);
          max-width: 450px;
          width: 90%;
          animation: contentSlideIn 0.5s ease-out;
        }

        .rules-message {
          text-align: left;
          max-height: 80vh;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 25px;
          border: 2px solid rgba(135, 206, 235, 0.15);
        }

        .rules-message::-webkit-scrollbar {
          width: 4px;
        }
        .rules-message::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .rules-message::-webkit-scrollbar-thumb {
          background: #87ceeb;
          border-radius: 10px;
        }

        .bet-message h1,
        .win-message h1,
        .game-over-message h1 {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 900;
          text-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
          letter-spacing: 0.05em;
          color: #87ceeb;
          background: rgba(0, 0, 0, 0.4);
          padding: 0.2em 0.8em;
          border-radius: 20px;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: inline-block;
          border: 2px solid rgba(135, 206, 235, 0.2);
          margin-bottom: 20px;
        }

        .win-message h1 {
          animation: winPulse 1s ease-in-out;
          border-color: rgba(135, 206, 235, 0.3);
        }

        .bet-message .balance,
        .win-message .win-amount {
          font-size: clamp(1.2rem, 3vw, 2rem);
          color: #87ceeb;
          font-weight: 700;
          background: rgba(0, 0, 0, 0.4);
          padding: 12px 24px;
          border-radius: 15px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid rgba(135, 206, 235, 0.2);
          margin-bottom: 25px;
          display: inline-block;
        }

        .win-message .win-amount {
          color: #4ade80;
          border-color: rgba(74, 222, 128, 0.2);
          animation: winAmountPop 0.5s ease-out 0.3s both;
        }

        .bet-message .balance span {
          color: #fff;
          font-weight: 900;
        }

        .bet-input-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .bet-input-group label {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .bet-input-group input {
          padding: 15px 20px;
          font-size: clamp(1.2rem, 3vw, 1.8rem);
          border-radius: 15px;
          border: 2px solid rgba(135, 206, 235, 0.2);
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          color: white;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: all 0.3s;
          width: 100%;
        }

        .bet-input-group input:focus {
          border-color: #87ceeb;
          background: rgba(0, 0, 0, 0.6);
          box-shadow: 0 0 30px rgba(135, 206, 235, 0.1);
        }

        .bet-error {
          color: #f87171;
          font-size: clamp(0.8rem, 1.5vw, 1rem);
          min-height: 25px;
          font-weight: 500;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .bet-buttons-group {
          display: flex;
          gap: 10px;
          width: 100%;
        }

        .bet-buttons-group .bet-button {
          flex: 3;
        }
        .bet-buttons-group .rules-button {
          flex: 1;
          padding: 15px 20px;
          font-size: clamp(0.8rem, 1.5vw, 1rem);
          font-weight: 700;
          border: 2px solid rgba(135, 206, 235, 0.3);
          border-radius: 15px;
          background: rgba(135, 206, 235, 0.1);
          color: #87ceeb;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
        }

        .bet-buttons-group .rules-button:hover {
          background: rgba(135, 206, 235, 0.2);
          border-color: #87ceeb;
          transform: translateY(-2px);
        }

        .bet-button {
          padding: 15px 40px;
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          font-weight: 800;
          border: none;
          border-radius: 15px;
          background: #87ceeb;
          color: #1a1a2e;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 15px rgba(135, 206, 235, 0.3);
          width: 100%;
        }

        .bet-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(135, 206, 235, 0.4);
          background: #7bb8d4;
        }

        .bet-message .rules {
          font-size: clamp(0.7rem, 1.2vw, 0.9rem);
          color: rgba(255, 255, 255, 0.5);
          margin-top: 15px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .rules-message h2 {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          color: #87ceeb;
          text-align: center;
          margin-bottom: 15px;
          font-weight: 900;
          letter-spacing: 0.05em;
        }

        .rules-message .rules-section {
          margin-bottom: 15px;
        }
        .rules-message .rules-section h3 {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          color: #87ceeb;
          margin-bottom: 5px;
          font-weight: 700;
        }
        .rules-message .rules-section p {
          font-size: clamp(0.8rem, 1.5vw, 0.95rem);
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin-bottom: 3px;
        }
        .rules-message .rules-section .highlight-win {
          color: #4ade80;
          font-weight: 600;
        }
        .rules-message .rules-section .highlight-lose {
          color: #f87171;
          font-weight: 600;
        }
        .rules-message .rules-section .highlight-info {
          color: #87ceeb;
          font-weight: 600;
        }

        .rules-message .controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin: 10px 0;
        }
        .rules-message .controls span {
          background: rgba(135, 206, 235, 0.15);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: clamp(0.7rem, 1.2vw, 0.85rem);
          color: #87ceeb;
          border: 1px solid rgba(135, 206, 235, 0.2);
        }

        .rules-close-button,
        .objective-button,
        .win-button {
          padding: 12px 40px;
          font-size: clamp(1rem, 2vw, 1.3rem);
          font-weight: 700;
          border: none;
          border-radius: 15px;
          background: #87ceeb;
          color: #1a1a2e;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          width: 100%;
          margin-top: 10px;
          box-shadow: 0 4px 20px rgba(135, 206, 235, 0.2);
        }

        .rules-close-button:hover,
        .objective-button:hover,
        .win-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(135, 206, 235, 0.3);
          background: #7bb8d4;
        }

        .objective-message h2 {
          font-size: clamp(1.2rem, 3vw, 2rem);
          font-weight: 700;
          color: rgba(255, 255, 255, 0.6);
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          margin-bottom: 15px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .objective-message .objective-content {
          font-size: clamp(1.8rem, 5vw, 3.5rem);
          font-weight: 900;
          color: #87ceeb;
          text-shadow: 0 0 40px rgba(135, 206, 235, 0.2), 0 4px 20px rgba(0, 0, 0, 0.5);
          background: rgba(0, 0, 0, 0.4);
          padding: 20px 30px;
          border-radius: 20px;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: 2px solid rgba(135, 206, 235, 0.2);
          margin-bottom: 20px;
        }

        .objective-message .objective-content .highlight {
          color: #fff;
          font-size: clamp(2rem, 6vw, 4rem);
        }

        .objective-message .objective-sub {
          font-size: clamp(0.9rem, 2vw, 1.2rem);
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 20px;
        }

        .countdown-number {
          font-size: clamp(8rem, 25vw, 20rem);
          font-weight: 900;
          color: #87ceeb;
          text-shadow: 0 0 60px rgba(135, 206, 235, 0.3), 0 0 120px rgba(135, 206, 235, 0.2);
          animation: countdownPulse 0.8s ease-in-out;
          user-select: none;
        }

        .countdown-number.go {
          color: #4ade80;
          text-shadow: 0 0 60px rgba(74, 222, 128, 0.3), 0 0 120px rgba(74, 222, 128, 0.2);
          font-size: clamp(6rem, 20vw, 15rem);
        }

        .win-message .win-detail {
          font-size: clamp(0.9rem, 2vw, 1.2rem);
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 20px;
        }

        .game-over-message .final-score {
          font-size: clamp(1.2rem, 4vw, 2.5rem);
          margin-top: 0.5rem;
          color: #87ceeb;
          background: rgba(0, 0, 0, 0.5);
          padding: 0.2em 1.2em;
          border-radius: 40px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: inline-block;
        }

        .game-over-message .win-lose {
          font-size: clamp(1.5rem, 5vw, 3rem);
          margin-top: 0.5rem;
          font-weight: 900;
          display: inline-block;
          padding: 0.2em 1em;
          border-radius: 20px;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .game-over-message .win-lose.win {
          color: #4ade80;
          border: 2px solid rgba(74, 222, 128, 0.3);
        }

        .game-over-message .win-lose.lose {
          color: #f87171;
          border: 2px solid rgba(248, 113, 113, 0.3);
        }

        .game-over-message .objective-result {
          font-size: clamp(0.9rem, 2vw, 1.2rem);
          margin-top: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          background: rgba(0, 0, 0, 0.4);
          padding: 0.3em 1.2em;
          border-radius: 40px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: inline-block;
        }

        .game-over-message .restart-hint {
          font-size: clamp(1rem, 3vw, 1.8rem);
          margin-top: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
          font-weight: 500;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.4em 1.2em;
          border-radius: 40px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: inline-block;
        }

        @media (max-width: 480px) {
          #score-board {
            top: 8px;
            padding: 0.1em 0.8em;
            font-size: clamp(16px, 4.5vw, 24px);
            border-radius: 40px;
            gap: 6px;
          }
          #difficulty-indicator {
            font-size: clamp(10px, 2vw, 14px);
            padding: 0.05em 0.5em;
          }
          .bet-message {
            padding: 20px 15px;
          }
          .bet-input-group input {
            padding: 12px 15px;
            font-size: 1.2rem;
          }
          .bet-message h1 {
            font-size: clamp(1.8rem, 7vw, 2.5rem);
          }
          .countdown-number {
            font-size: clamp(6rem, 20vw, 12rem);
          }
          .countdown-number.go {
            font-size: clamp(4rem, 15vw, 10rem);
          }
          .objective-message .objective-content {
            font-size: clamp(1.4rem, 4vw, 2.5rem);
            padding: 15px 20px;
          }
          .objective-message .objective-content .highlight {
            font-size: clamp(1.6rem, 5vw, 3rem);
          }
          .win-message h1 {
            font-size: clamp(2.5rem, 8vw, 4rem);
          }
          .win-message .win-amount {
            font-size: clamp(1.5rem, 4vw, 2.5rem);
            padding: 12px 20px;
          }
          .bet-buttons-group {
            flex-direction: column;
          }
          .bet-buttons-group .rules-button {
            padding: 10px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}