"use client";

import { useEffect, useRef, useState } from "react";

export default function Game() {
  const gameRef = useRef<HTMLDivElement>(null);
  const birdRef = useRef<HTMLDivElement>(null);
  const birdImageRef = useRef<HTMLImageElement>(null);
  const scoreElementRef = useRef<HTMLDivElement>(null);
  const cloudLayerRef = useRef<HTMLDivElement>(null);
  const balanceDisplayRef = useRef<HTMLDivElement>(null);
  const currentBetDisplayRef = useRef<HTMLDivElement>(null);
  const betScreenRef = useRef<HTMLDivElement>(null);
  const gameOverRef = useRef<HTMLDivElement>(null);
  const betInputRef = useRef<HTMLInputElement>(null);
  const betBalanceRef = useRef<HTMLDivElement>(null);
  const betInfoRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const resultScoreRef = useRef<HTMLDivElement>(null);
  const resultBetRef = useRef<HTMLDivElement>(null);
  const resultChangeRef = useRef<HTMLDivElement>(null);
  const resultBalanceRef = useRef<HTMLDivElement>(null);
  const objectivePopupRef = useRef<HTMLDivElement>(null);
  const objectiveIconRef = useRef<HTMLDivElement>(null);
  const objectiveTitleRef = useRef<HTMLDivElement>(null);
  const objectiveDescriptionRef = useRef<HTMLDivElement>(null);
  const objectiveRewardRef = useRef<HTMLDivElement>(null);
  const rulesPopupRef = useRef<HTMLDivElement>(null);

  const [betValue, setBetValue] = useState("");

  useEffect(() => {
    const game = gameRef.current!;
    const bird = birdRef.current!;
    const birdImage = birdImageRef.current!;
    const scoreElement = scoreElementRef.current!;
    const cloudLayer = cloudLayerRef.current!;
    const balanceDisplay = balanceDisplayRef.current!;
    const currentBetDisplay = currentBetDisplayRef.current!;
    const betScreen = betScreenRef.current!;
    const gameOver = gameOverRef.current!;
    const betInput = betInputRef.current!;
    const betBalance = betBalanceRef.current!;
    const betInfo = betInfoRef.current!;
    const playButton = playButtonRef.current!;
    const resultScore = resultScoreRef.current!;
    const resultBet = resultBetRef.current!;
    const resultChange = resultChangeRef.current!;
    const resultBalance = resultBalanceRef.current!;
    const objectivePopup = objectivePopupRef.current!;
    const objectiveIcon = objectiveIconRef.current!;
    const objectiveTitle = objectiveTitleRef.current!;
    const objectiveDescription = objectiveDescriptionRef.current!;
    const objectiveReward = objectiveRewardRef.current!;
    const rulesPopup = rulesPopupRef.current!;

    const START_BALANCE = 10000;
    const MIN_BET = 100;
    const MAX_BET = 500;
    const CURRENCY = "XOF";

    let balance = START_BALANCE;
    let currentBet = 0;
    let score = 0;

    let gameRunning = false;
    let lastTime = 0;
    let pipeTimer = 0;

    let currentObjective: any = null;
    let objectiveStartTime = 0;
    let objectiveCompleted = false;

    const timeIconSVG = `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="w-[60px] h-[60px]">
        <circle cx="32" cy="32" r="28" fill="none" stroke="#fff" stroke-width="4"/>
        <path d="M32 16 L32 32 L44 36" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="32" cy="32" r="4" fill="#fff"/>
      </svg>
    `;

    const scoreIconSVG = `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="w-[60px] h-[60px]">
        <circle cx="32" cy="32" r="28" fill="none" stroke="#fff" stroke-width="4"/>
        <circle cx="32" cy="32" r="12" fill="none" stroke="#fff" stroke-width="4"/>
        <circle cx="32" cy="32" r="4" fill="#fff"/>
        <line x1="32" y1="4" x2="32" y2="12" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
        <line x1="32" y1="52" x2="32" y2="60" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
        <line x1="4" y1="32" x2="12" y2="32" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
        <line x1="52" y1="32" x2="60" y2="32" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `;

    const birdFrames = [
      "/flappy/upflap.png",
      "/flappy/midflap.png",
      "/flappy/downflap.png",
      "/flappy/midflap.png",
    ];

    let birdFrame = 0;
    let birdAnimationTimer = 0;
    const BIRD_ANIMATION_SPEED = 90;

    let birdY = 0;
    let birdVelocity = 0;
    const groundHeight = 90;
    const GRAVITY = 0.42;
    const JUMP_FORCE = -7.5;

    let pipes: any[] = [];
    const PIPE_WIDTH = 64;
    const START_PIPE_SPEED = 3.2;
    const MAX_PIPE_SPEED = 6.5;
    const START_PIPE_GAP = 190;
    const MIN_PIPE_GAP = 115;
    const START_PIPE_INTERVAL = 1500;
    const MIN_PIPE_INTERVAL = 900;

    function formatNumber(number: number) {
      return Math.floor(number).toLocaleString("fr-FR");
    }

    function updateBalanceUI() {
      const text = `Solde : ${formatNumber(balance)} ${CURRENCY}`;
      balanceDisplay.textContent = text;
      betBalance.textContent = `${formatNumber(balance)} ${CURRENCY}`;
    }

    function updateBetUI() {
      if (currentBet > 0) {
        currentBetDisplay.textContent = `Mise : ${formatNumber(
          currentBet
        )} ${CURRENCY}`;
      } else {
        currentBetDisplay.textContent = "Mise : aucune";
      }
    }

    function validateBet() {
      const value = Number(betInput.value);

      if (betInput.value === "") {
        playButton.disabled = true;
        playButton.textContent = "ENTRER UNE MISE";
        betInfo.className = "min-h-[24px] mb-[18px] text-[#777] text-sm font-bold";
        betInfo.textContent = `Mise minimale : ${MIN_BET} ${CURRENCY} — maximale : ${MAX_BET} ${CURRENCY}`;
        return;
      }

      if (!Number.isInteger(value)) {
        playButton.disabled = true;
        playButton.textContent = "MISE INVALIDE";
        betInfo.className = "min-h-[24px] mb-[18px] text-[#d63031] text-sm font-bold";
        betInfo.textContent = "La mise doit être un nombre entier.";
        return;
      }

      if (value < MIN_BET) {
        playButton.disabled = true;
        playButton.textContent = "MISE TROP FAIBLE";
        betInfo.className = "min-h-[24px] mb-[18px] text-[#d63031] text-sm font-bold";
        betInfo.textContent = `La mise minimale est de ${MIN_BET} ${CURRENCY}.`;
        return;
      }

      if (value > MAX_BET) {
        playButton.disabled = true;
        playButton.textContent = "MISE TROP ÉLEVÉE";
        betInfo.className = "min-h-[24px] mb-[18px] text-[#d63031] text-sm font-bold";
        betInfo.textContent = `La mise maximale est de ${MAX_BET} ${CURRENCY}.`;
        return;
      }

      if (value > balance) {
        playButton.disabled = true;
        playButton.textContent = "SOLDE INSUFFISANT";
        betInfo.className = "min-h-[24px] mb-[18px] text-[#d63031] text-sm font-bold";
        betInfo.textContent = "Solde virtuel insuffisant.";
        return;
      }

      playButton.disabled = false;
      playButton.textContent = "JOUER";
      betInfo.className = "min-h-[24px] mb-[18px] text-[#777] text-sm font-bold";
      betInfo.textContent = `Mise sélectionnée : ${formatNumber(
        value
      )} ${CURRENCY}`;
    }

    (window as any).validateBetFromReact = validateBet;

    function generateObjective() {
      const objectiveType = Math.random() < 0.5 ? "time" : "score";

      if (objectiveType === "time") {
        const timeOptions = [15, 20, 25, 30];
        const targetTime =
          timeOptions[Math.floor(Math.random() * timeOptions.length)];

        return {
          type: "time",
          targetTime: targetTime,
          multiplier: 2,
          description: `Jouer pendant ${targetTime} secondes sans mourir`,
          icon: timeIconSVG,
          reward: "Multiplicateur x2",
        };
      } else {
        const scoreOptions = [3, 5, 7, 10];
        const targetScore =
          scoreOptions[Math.floor(Math.random() * scoreOptions.length)];

        return {
          type: "score",
          targetScore: targetScore,
          multiplier: 2,
          description: `Atteindre un score de ${targetScore} points`,
          icon: scoreIconSVG,
          reward: "Multiplicateur x2",
        };
      }
    }

    function showObjectivePopup() {
      currentObjective = generateObjective();
      objectiveCompleted = false;
      objectiveStartTime = 0;

      objectiveIcon.innerHTML = currentObjective.icon;
      objectiveTitle.textContent = "OBJECTIF !";
      objectiveDescription.textContent = currentObjective.description;
      objectiveReward.textContent = currentObjective.reward;

      objectivePopup.classList.remove("hidden");
      objectivePopup.classList.add("block");
    }

    function checkObjective() {
      if (!currentObjective || objectiveCompleted) {
        return false;
      }

      if (currentObjective.type === "time") {
        const elapsedTime =
          (performance.now() - objectiveStartTime) / 1000;

        if (elapsedTime >= currentObjective.targetTime) {
          objectiveCompleted = true;
          return true;
        }
      } else if (currentObjective.type === "score") {
        if (score >= currentObjective.targetScore) {
          objectiveCompleted = true;
          return true;
        }
      }

      return false;
    }

    function calculateResult() {
      if (objectiveCompleted) {
        return currentBet * currentObjective.multiplier;
      } else {
        return 0;
      }
    }

    function endGame() {
      gameRunning = false;

      const change = calculateResult();

      balance += change;

      updateBalanceUI();
      updateBetUI();

      resultScore.textContent = `Score : ${score}`;
      resultBet.textContent = `Mise : ${formatNumber(currentBet)} ${CURRENCY}`;

      if (objectiveCompleted) {
        resultChange.textContent = `Objectif atteint ! Gain : +${formatNumber(
          change
        )} ${CURRENCY}`;
        resultChange.className = "font-black mb-3 text-[24px] text-[#27ae60]";
      } else {
        resultChange.textContent = `Objectif non atteint - Mise perdue`;
        resultChange.className = "font-black mb-3 text-[24px] text-[#e74c3c]";
      }

      resultBalance.textContent = `Solde : ${formatNumber(balance)} ${CURRENCY}`;

      gameOver.classList.remove("hidden");
      gameOver.classList.add("flex");
    }

    function animateBird(delta: number) {
      birdAnimationTimer += delta;

      if (birdAnimationTimer >= BIRD_ANIMATION_SPEED) {
        birdAnimationTimer = 0;
        birdFrame++;

        if (birdFrame >= birdFrames.length) {
          birdFrame = 0;
        }

        birdImage.src = birdFrames[birdFrame];
      }
    }

    const MIN_CLOUDS = 9;
    const MIN_CLOUD_DISTANCE = 170;
    const MAX_CLOUD_DISTANCE = 380;
    let clouds: any[] = [];

    function createCloud(x: number) {
      const element = document.createElement("div");
      
      const random = Math.random();
      let size: string;

      if (random < 0.25) {
        size = "small";
      } else if (random < 0.55) {
        size = "medium";
      } else if (random < 0.85) {
        size = "large";
      } else {
        size = "big";
      }

      element.className = `
        absolute w-[150px] h-[45px] bg-white rounded-full will-change-transform pointer-events-none
        before:content-[''] before:absolute before:bg-white before:rounded-full before:w-[65px] before:h-[65px] before:left-[20px] before:bottom-[15px]
        after:content-[''] after:absolute after:bg-white after:rounded-full after:w-[80px] after:h-[80px] after:right-[20px] after:bottom-[10px]
        ${size === 'small' ? 'opacity-[0.45] scale-[0.55]' : ''}
        ${size === 'medium' ? 'opacity-[0.62] scale-[0.75]' : ''}
        ${size === 'large' ? 'opacity-80 scale-100' : ''}
        ${size === 'big' ? 'opacity-[0.88] scale-[1.25]' : ''}
      `;

      element.style.top = 5 + Math.random() * 55 + "%";

      cloudLayer.appendChild(element);

      let speed: number;

      if (size === "small") {
        speed = 0.22 + Math.random() * 0.12;
      } else if (size === "medium") {
        speed = 0.32 + Math.random() * 0.16;
      } else if (size === "large") {
        speed = 0.45 + Math.random() * 0.2;
      } else {
        speed = 0.55 + Math.random() * 0.22;
      }

      const cloud = { element, x, speed };
      clouds.push(cloud);
      updateCloudVisual(cloud);
    }

    function updateCloudVisual(cloud: any) {
      cloud.element.style.transform = `translate3d(${cloud.x}px, 0, 0)`;
    }

    function getRightmostCloudX() {
      let rightmost = window.innerWidth;

      clouds.forEach((cloud) => {
        if (cloud.x > rightmost) {
          rightmost = cloud.x;
        }
      });

      return rightmost;
    }

    function recycleCloud(cloud: any) {
      const rightmost = getRightmostCloudX();

      cloud.x =
        rightmost +
        MIN_CLOUD_DISTANCE +
        Math.random() * (MAX_CLOUD_DISTANCE - MIN_CLOUD_DISTANCE);

      cloud.element.style.top = 5 + Math.random() * 55 + "%";

      updateCloudVisual(cloud);
    }

    function initializeClouds() {
      clouds.forEach((cloud) => {
        cloud.element.remove();
      });

      clouds = [];

      let x = -100;

      while (x < window.innerWidth + 1000) {
        createCloud(x);
        x +=
          MIN_CLOUD_DISTANCE +
          Math.random() * (MAX_CLOUD_DISTANCE - MIN_CLOUD_DISTANCE);
      }

      while (clouds.length < MIN_CLOUDS) {
        createCloud(window.innerWidth + clouds.length * 250);
      }
    }

    function updateClouds(delta: number) {
      clouds.forEach((cloud) => {
        cloud.x -= cloud.speed * (delta / 16.67);
        updateCloudVisual(cloud);

        if (cloud.x < -300) {
          recycleCloud(cloud);
        }
      });

      while (clouds.length < MIN_CLOUDS) {
        createCloud(getRightmostCloudX() + MIN_CLOUD_DISTANCE);
      }
    }

    function getDifficulty() {
      const stage = Math.floor(score / 5);

      const gap = Math.max(MIN_PIPE_GAP, START_PIPE_GAP - stage * 8);
      const speed = Math.min(MAX_PIPE_SPEED, START_PIPE_SPEED + stage * 0.35);
      const interval = Math.max(
        MIN_PIPE_INTERVAL,
        START_PIPE_INTERVAL - stage * 60
      );

      return { gap, speed, interval };
    }

    function resetGame() {
      birdY = window.innerHeight * 0.45;
      birdVelocity = 0;

      bird.style.top = birdY + "px";
      bird.style.transform = "rotate(0deg)";

      birdFrame = 0;
      birdAnimationTimer = 0;
      birdImage.src = birdFrames[0];

      score = 0;
      scoreElement.textContent = "0";

      pipes.forEach((pipe) => {
        if (pipe.topElement) pipe.topElement.remove();
        if (pipe.bottomElement) pipe.bottomElement.remove();
      });

      pipes = [];
      pipeTimer = 0;
    }

    function jump() {
      if (!gameRunning) {
        return;
      }

      birdVelocity = JUMP_FORCE;
    }

    function createPipe() {
      const difficulty = getDifficulty();
      const screenHeight = window.innerHeight;

      const minTop = 70;
      const minBottom = 70;

      const maxTop =
        screenHeight - groundHeight - difficulty.gap - minBottom;

      const safeMaxTop = Math.max(minTop, maxTop);

      const topHeight = Math.random() * (safeMaxTop - minTop) + minTop;

      const bottomHeight =
        screenHeight - groundHeight - topHeight - difficulty.gap;

      const x = window.innerWidth + 20;

      const topPipe = document.createElement("div");
      topPipe.className = "absolute w-[58px] sm:w-16 overflow-hidden z-[5] pointer-events-none top-0";
      topPipe.style.height = topHeight + "px";
      topPipe.style.left = x + "px";

      const topImage = document.createElement("img");
      topImage.src = "/flappy/toppipe.png";
      topImage.className = "absolute left-0 w-[58px] sm:w-16 h-full block max-w-none [image-rendering:pixelated] bottom-0";
      topPipe.appendChild(topImage);
      game.appendChild(topPipe);

      const bottomPipe = document.createElement("div");
      bottomPipe.className = "absolute w-[58px] sm:w-16 overflow-hidden z-[5] pointer-events-none bottom-[90px]";
      bottomPipe.style.height = bottomHeight + "px";
      bottomPipe.style.left = x + "px";

      const bottomImage = document.createElement("img");
      bottomImage.src = "/flappy/bottompipe.png";
      bottomImage.className = "absolute left-0 w-[58px] sm:w-16 h-full block max-w-none [image-rendering:pixelated] top-0";
      bottomPipe.appendChild(bottomImage);
      game.appendChild(bottomPipe);

      pipes.push({
        x,
        topHeight,
        bottomHeight,
        topElement: topPipe,
        bottomElement: bottomPipe,
        passed: false,
      });
    }

    function checkCollision(pipe: any) {
      const birdLeft = window.innerWidth * 0.2;
      const birdRight = birdLeft + bird.offsetWidth;
      const birdTop = birdY;
      const birdBottom = birdY + bird.offsetHeight;

      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      if (birdRight <= pipeLeft || birdLeft >= pipeRight) {
        return false;
      }

      if (birdTop < pipe.topHeight) {
        return true;
      }

      const bottomPipeTop =
        window.innerHeight - groundHeight - pipe.bottomHeight;

      if (birdBottom > bottomPipeTop) {
        return true;
      }

      return false;
    }

    function startGame() {
      const bet = Number(betInput.value);

      if (
        !Number.isInteger(bet) ||
        bet < MIN_BET ||
        bet > MAX_BET ||
        bet > balance
      ) {
        validateBet();
        return;
      }

      currentBet = bet;
      balance -= currentBet;

      updateBalanceUI();
      updateBetUI();

      resetGame();

      betScreen.classList.add("hidden");
      gameOver.classList.add("hidden");
      gameOver.classList.remove("flex");

      showObjectivePopup();
    }

    function onObjectiveButtonClick() {
      objectivePopup.classList.add("hidden");
      objectivePopup.classList.remove("block");
      objectiveStartTime = performance.now();
      gameRunning = true;
      lastTime = 0;
      requestAnimationFrame(gameLoop);
    }

    function onRulesButtonClick() {
      rulesPopup.classList.remove("hidden");
      rulesPopup.classList.add("block");
    }

    function onCloseRulesButtonClick() {
      rulesPopup.classList.add("hidden");
      rulesPopup.classList.remove("block");
    }

    function onNewGameButtonClick() {
      currentBet = 0;
      currentObjective = null;
      objectiveCompleted = false;

      setBetValue("");
      if (betInput) betInput.value = "";

      updateBetUI();
      updateBalanceUI();
      validateBet();

      gameOver.classList.add("hidden");
      gameOver.classList.remove("flex");
      betScreen.classList.remove("hidden");
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.code === "Space" || event.code === "ArrowUp") {
        if ((event.target as HTMLElement).tagName === "INPUT") return;
        event.preventDefault();

        if (gameRunning) {
          jump();
        }
      }

      if (event.code === "Escape" && !rulesPopup.classList.contains("hidden")) {
        rulesPopup.classList.add("hidden");
        rulesPopup.classList.remove("block");
      }
    }

    function onMouseDown(event: MouseEvent) {
      if ((event.target as HTMLElement).closest("button,input,a,.bet-panel,.result-box,#rulesPopup,#objectivePopup")) {
        return;
      }

      if (gameRunning) {
        jump();
      }
    }

    function onTouchStart(event: TouchEvent) {
      if ((event.target as HTMLElement).closest("button,input,a,.bet-panel,.result-box,#rulesPopup,#objectivePopup")) {
        return;
      }

      if (gameRunning) {
        event.preventDefault();
        jump();
      }
    }

    function gameLoop(timestamp: number) {
      if (!gameRunning) {
        return;
      }

      if (!lastTime) {
        lastTime = timestamp;
      }

      const delta = Math.min(timestamp - lastTime, 40);
      lastTime = timestamp;

      updateClouds(delta);
      animateBird(delta);

      if (checkObjective()) {
        endGame();
        return;
      }

      birdVelocity += GRAVITY * (delta / 16.67);
      birdY += birdVelocity * (delta / 16.67);

      let rotation = birdVelocity * 5;
      rotation = Math.max(-25, Math.min(90, rotation));

      bird.style.transform = `rotate(${rotation}deg)`;
      bird.style.top = birdY + "px";

      if (birdY <= 0) {
        birdY = 0;
        endGame();
        return;
      }

      if (birdY + bird.offsetHeight >= window.innerHeight - groundHeight) {
        endGame();
        return;
      }

      pipeTimer += delta;

      const difficulty = getDifficulty();

      if (pipeTimer >= difficulty.interval) {
        pipeTimer = 0;
        createPipe();
      }

      for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];

        pipe.x -= difficulty.speed * (delta / 16.67);

        pipe.topElement.style.left = pipe.x + "px";
        pipe.bottomElement.style.left = pipe.x + "px";

        if (
          !pipe.passed &&
          pipe.x + PIPE_WIDTH < window.innerWidth * 0.2
        ) {
          pipe.passed = true;
          score++;
          scoreElement.textContent = String(score);

          if (checkObjective()) {
            endGame();
            return;
          }
        }

        if (checkCollision(pipe)) {
          endGame();
          return;
        }

        if (pipe.x + PIPE_WIDTH < -50) {
          pipe.topElement.remove();
          pipe.bottomElement.remove();
          pipes.splice(i, 1);
        }
      }

      requestAnimationFrame(gameLoop);
    }

    let backgroundLastTime = performance.now();

    function backgroundAnimation(timestamp: number) {
      const delta = Math.min(timestamp - backgroundLastTime, 40);
      backgroundLastTime = timestamp;

      if (!gameRunning) {
        updateClouds(delta);
      }

      backgroundAnimationFrame = requestAnimationFrame(backgroundAnimation);
    }

    function onResize() {
      if (!gameRunning) {
        birdY = window.innerHeight * 0.45;
        bird.style.top = birdY + "px";
      }
    }

    playButton.addEventListener("click", startGame);
    document
      .getElementById("rulesButton")!
      .addEventListener("click", onRulesButtonClick);
    document
      .getElementById("closeRulesButton")!
      .addEventListener("click", onCloseRulesButtonClick);
    document
      .getElementById("objectiveButton")!
      .addEventListener("click", onObjectiveButtonClick);
    document
      .getElementById("newGameButton")!
      .addEventListener("click", onNewGameButtonClick);
    document.addEventListener("keydown", onKeyDown);
    game.addEventListener("mousedown", onMouseDown);
    game.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("resize", onResize);

    let backgroundAnimationFrame = 0;

    balance = START_BALANCE;
    currentBet = 0;
    currentObjective = null;
    objectiveCompleted = false;
    updateBalanceUI();
    updateBetUI();
    validateBet();
    initializeClouds();
    resetGame();
    backgroundAnimationFrame = requestAnimationFrame(backgroundAnimation);

    return () => {
      cancelAnimationFrame(backgroundAnimationFrame);
      playButton.removeEventListener("click", startGame);
      document
        .getElementById("rulesButton")
        ?.removeEventListener("click", onRulesButtonClick);
      document
        .getElementById("closeRulesButton")
        ?.removeEventListener("click", onCloseRulesButtonClick);
      document
        .getElementById("objectiveButton")
        ?.removeEventListener("click", onObjectiveButtonClick);
      document
        .getElementById("newGameButton")
        ?.removeEventListener("click", onNewGameButtonClick);
      document.removeEventListener("keydown", onKeyDown);
      game.removeEventListener("mousedown", onMouseDown);
      game.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetValue(e.target.value);
    setTimeout(() => {
      if ((window as any).validateBetFromReact) {
        (window as any).validateBetFromReact();
      }
    }, 0);
  };

  return (
    <div
      id="game"
      ref={gameRef}
      className="relative w-screen h-screen overflow-hidden bg-[linear-gradient(to_bottom,#55c9f5_0%,#8de0ff_70%,#d8f5ff_100%)] select-none font-sans"
    >
      <div className="sun absolute z-[1] rounded-full w-[100px] h-[100px] right-[12%] top-[10%] bg-[#ffe45c] shadow-[0_0_40px_rgba(255,220,70,0.8)]" />

      <div
        id="cloudLayer"
        ref={cloudLayerRef}
        className="absolute left-0 top-0 w-full h-[70%] overflow-hidden pointer-events-none z-[2]"
      />

      <div
        id="balanceDisplay"
        ref={balanceDisplayRef}
        className="absolute z-40 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-white font-bold bg-black/35 text-sm sm:text-[17px] top-[15px] right-3 sm:top-[18px] sm:right-5 [text-shadow:1px_1px_2px_#000]"
      >
        Solde : 10 000 XOF
      </div>

      <div
        id="currentBetDisplay"
        ref={currentBetDisplayRef}
        className="absolute z-40 px-2.5 py-1 sm:px-[13px] sm:py-[7px] rounded-[10px] text-white font-bold bg-black/[0.28] text-xs sm:text-[14px] top-[52px] right-3 sm:top-[62px] sm:right-5"
      >
        Mise : aucune
      </div>

      <div
        id="score"
        ref={scoreElementRef}
        className="absolute z-30 text-white font-bold top-[25px] left-1/2 -translate-x-1/2 text-[50px] sm:text-[64px] [text-shadow:3px_3px_0_#333,-2px_-2px_0_#333]"
      >
        0
      </div>

      <div
        id="bird"
        ref={birdRef}
        className="absolute z-[15] pointer-events-none w-[34px] h-[24px] left-[25%] sm:left-[20%] origin-center"
      >
        <img
          id="birdImage"
          ref={birdImageRef}
          src="/flappy/midflap.png"
          alt=""
          className="block w-[34px] h-[24px] [image-rendering:pixelated]"
        />
      </div>

      <div className="ground absolute left-0 bottom-0 w-full z-20 h-[90px] bg-[repeating-linear-gradient(135deg,#65bd38_0px,#65bd38_20px,#56a92f_20px,#56a92f_40px)] border-t-[8px] border-[#3d8e29]" />

      {/* ECRAN DE MISE */}
      <div
        id="betScreen"
        ref={betScreenRef}
        className="screen absolute inset-0 z-[100] flex flex-col items-center justify-center p-5 bg-black/30 backdrop-blur-[2px]"
      >
        <div className="bet-panel text-center rounded-[20px] p-7 w-[min(420px,92vw)] bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.30)] pointer-events-auto">
          <div className="text-[15px] font-bold mb-1 text-[#555]">
            SOLDE VIRTUEL
          </div>

          <div
            id="betBalance"
            ref={betBalanceRef}
            className="text-[34px] font-black mb-6 text-[#222]"
          >
            10 000 XOF
          </div>

          <label
            className="block text-[17px] font-bold mb-2.5 text-[#333]"
            htmlFor="betInput"
          >
            Entrez votre mise
          </label>

          <input
            id="betInput"
            ref={betInputRef}
            type="number"
            min={100}
            max={500}
            step={1}
            value={betValue}
            onChange={handleInputChange}
            inputMode="numeric"
            placeholder="100 à 500"
            className="w-full h-[55px] px-4 rounded-xl outline-none font-bold text-center mb-4 border-[3px] border-[#ddd] text-[23px] text-black"
          />

          <div id="betInfo" ref={betInfoRef} className="min-h-[24px] mb-[18px] text-[#777] text-sm font-bold">
            Mise minimale : 100 XOF — maximale : 500 XOF
          </div>

          <button
            id="playButton"
            ref={playButtonRef}
            disabled
            className="w-full border-none rounded-[14px] px-[30px] py-[15px] bg-[#ffbd21] text-[#4a3000] text-[20px] font-black shadow-[0_5px_0_#c98a00] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:translate-y-0.5 active:shadow-none transition-all"
          >
            ENTRER UNE MISE
          </button>

          <button
            id="rulesButton"
            className="rules-button mt-4 bg-[#3498db] text-white shadow-[0_5px_0_#2980b9] text-[16px] px-5 py-[12px] rounded-[14px] border-none font-black w-full cursor-pointer active:translate-y-0.5 active:shadow-none transition-all"
          >
            VOIR LES RÈGLES
          </button>
        </div>

        <div className="instructions mt-4 text-center text-white text-[14px] [text-shadow:2px_2px_3px_#333]">
          Les montants utilisés sont fictifs.
        </div>
      </div>

      {/* POPUP OBJECTIF */}
      <div
        id="objectivePopup"
        ref={objectivePopupRef}
        className="hidden absolute z-[200] rounded-[20px] text-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(380px,90vw)] p-[30px] bg-gradient-to-br from-[#667eea] to-[#764ba2] shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300 pointer-events-auto"
      >
        <div
          id="objectiveIcon"
          ref={objectiveIconRef}
          className="mb-4 flex justify-center"
        />

        <div
          id="objectiveTitle"
          ref={objectiveTitleRef}
          className="text-white text-[22px] font-black mb-2.5"
        >
          Objectif
        </div>

        <div
          id="objectiveDescription"
          ref={objectiveDescriptionRef}
          className="mb-5 text-[#f0f0f0] text-[16px] leading-[1.5]"
        >
          Description de l'objectif
        </div>

        <div
          id="objectiveReward"
          ref={objectiveRewardRef}
          className="mb-5 font-bold text-[#ffd700] text-[18px]"
        >
          Récompense : Multiplicateur x2
        </div>

        <button
          id="objectiveButton"
          className="bg-white text-[#667eea] text-[16px] px-[25px] py-[12px] shadow-[0_4px_0_#ddd] border-none rounded-[14px] font-black cursor-pointer active:translate-y-0.5 active:shadow-none transition-all"
        >
          C'EST PARTI !
        </button>
      </div>

      {/* POPUP REGLES */}
      <div
        id="rulesPopup"
        ref={rulesPopupRef}
        className="hidden absolute z-[200] text-left top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(500px,90vw)] max-h-[80vh] overflow-y-auto p-[30px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] pointer-events-auto"
      >
        <div className="text-center font-black mb-5 text-[#333] text-[24px]">
          RÈGLES DU JEU
        </div>

        <div className="mb-5">
          <h3 className="font-black mb-2.5 text-[#667eea] text-[18px]">
            Comment jouer
          </h3>
          <ul className="list-none pl-0">
            <li className="relative pl-5 mb-1 text-[#555] text-[14px] leading-[1.6]">
              <span className="absolute left-[5px] font-bold text-[#667eea]">•</span>
              Cliquez ou appuyez sur Espace pour faire sauter l'oiseau
            </li>
            <li className="relative pl-5 mb-1 text-[#555] text-[14px] leading-[1.6]">
              <span className="absolute left-[5px] font-bold text-[#667eea]">•</span>
              Évitez les tuyaux pour ne pas mourir
            </li>
            <li className="relative pl-5 mb-1 text-[#555] text-[14px] leading-[1.6]">
              <span className="absolute left-[5px] font-bold text-[#667eea]">•</span>
              Chaque tuyau passé rapporte 1 point
            </li>
          </ul>
        </div>

        <div className="mb-5">
          <h3 className="font-black mb-2.5 text-[#667eea] text-[18px]">
            Objectifs
          </h3>
          <ul className="list-none pl-0">
            <li className="relative pl-5 mb-1 text-[#555] text-[14px] leading-[1.6]">
              <span className="absolute left-[5px] font-bold text-[#667eea]">•</span>
              Un objectif est assigné après chaque mise
            </li>
            <li className="relative pl-5 mb-1 text-[#555] text-[14px] leading-[1.6]">
              <span className="absolute left-[5px] font-bold text-[#667eea]">•</span>
              Objectif de temps : survivre pendant X secondes
            </li>
            <li className="relative pl-5 mb-1 text-[#555] text-[14px] leading-[1.6]">
              <span className="absolute left-[5px] font-bold text-[#667eea]">•</span>
              Objectif de score : atteindre X points
            </li>
          </ul>
        </div>

        <div className="mb-5">
          <h3 className="font-black mb-2.5 text-[#667eea] text-[18px]">
            Gains et pertes
          </h3>
          <ul className="list-none pl-0">
            <li className="relative pl-5 mb-1 text-[#555] text-[14px] leading-[1.6]">
              <span className="absolute left-[5px] font-bold text-[#667eea]">•</span>
              Objectif atteint : mise multipliée par 2
            </li>
            <li className="relative pl-5 mb-1 text-[#555] text-[14px] leading-[1.6]">
              <span className="absolute left-[5px] font-bold text-[#667eea]">•</span>
              Objectif non atteint : mise perdue
            </li>
            <li className="relative pl-5 mb-1 text-[#555] text-[14px] leading-[1.6]">
              <span className="absolute left-[5px] font-bold text-[#667eea]">•</span>
              Le jeu s'arrête immédiatement si l'objectif est atteint
            </li>
          </ul>
        </div>

        <div className="mb-5">
          <h3 className="font-black mb-2.5 text-[#667eea] text-[18px]">
            Mises
          </h3>
          <ul className="list-none pl-0">
            <li className="relative pl-5 mb-1 text-[#555] text-[14px] leading-[1.6]">
              <span className="absolute left-[5px] font-bold text-[#667eea]">•</span>
              Mise minimale : 100 XOF
            </li>
            <li className="relative pl-5 mb-1 text-[#555] text-[14px] leading-[1.6]">
              <span className="absolute left-[5px] font-bold text-[#667eea]">•</span>
              Mise maximale : 500 XOF
            </li>
            <li className="relative pl-5 mb-1 text-[#555] text-[14px] leading-[1.6]">
              <span className="absolute left-[5px] font-bold text-[#667eea]">•</span>
              Solde initial : 10 000 XOF virtuels
            </li>
          </ul>
        </div>

        <button
          id="closeRulesButton"
          className="w-full mt-2.5 bg-[#667eea] text-white text-[16px] px-[25px] py-[12px] shadow-[0_4px_0_#4a5ec9] border-none rounded-[14px] font-black cursor-pointer active:translate-y-0.5 active:shadow-none transition-all"
        >
          FERMER
        </button>
      </div>

      {/* GAME OVER */}
      <div
        id="gameOver"
        ref={gameOverRef}
        className="screen absolute inset-0 z-[100] flex-col items-center justify-center p-5 bg-black/30 backdrop-blur-[2px] hidden"
      >
        <div className="result-box text-center rounded-[20px] mb-5 w-[min(400px,92vw)] p-[25px] bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.3)] pointer-events-auto">
          <div
            id="resultScore"
            ref={resultScoreRef}
            className="font-black mb-2.5 text-[#333] text-[25px]"
          >
            Score : 0
          </div>

          <div
            id="resultBet"
            ref={resultBetRef}
            className="mb-2 text-[#666] text-[16px]"
          >
            Mise : 0 XOF
          </div>

          <div
            id="resultChange"
            ref={resultChangeRef}
            className="font-black mb-3 text-[24px]"
          >
            Résultat : 0
          </div>

          <div
            id="resultBalance"
            ref={resultBalanceRef}
            className="font-bold text-[#333] text-[18px]"
          >
            Solde : 10 000 XOF
          </div>
        </div>

        <button
          id="newGameButton"
          className="border-none rounded-[14px] px-[30px] py-[15px] bg-[#ffbd21] text-[#4a3000] text-[20px] font-black shadow-[0_5px_0_#c98a00] cursor-pointer active:translate-y-0.5 active:shadow-none transition-all pointer-events-auto"
        >
          NOUVELLE PARTIE
        </button>

        <div className="instructions mt-4 text-center text-white text-[14px] [text-shadow:2px_2px_3px_#333]">
          Les montants sont fictifs et sans valeur réelle.
        </div>
      </div>
    </div>
  );
}