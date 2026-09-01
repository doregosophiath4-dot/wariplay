"use client";

import { useEffect, useRef, useState } from "react";

/* ---------- Classes du jeu (moteur canvas, inchangé) ---------- */

class Player {
  WALK_ANIMATION_TIMER = 200;
  walkAnimationTimer = this.WALK_ANIMATION_TIMER;
  dinoRunImages: HTMLImageElement[] = [];

  jumpPressed = false;
  jumpInProgress = false;
  falling = false;
  JUMP_SPEED = 0.6;
  GRAVITY = 0.4;

  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  minJumpHeight: number;
  maxJumpHeight: number;
  scaleRatio: number;
  x: number;
  y: number;
  yStandingPosition: number;
  standingStillImage: HTMLImageElement;
  image: HTMLImageElement;

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    minJumpHeight: number,
    maxJumpHeight: number,
    scaleRatio: number
  ) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.width = width;
    this.height = height;
    this.minJumpHeight = minJumpHeight;
    this.maxJumpHeight = maxJumpHeight;
    this.scaleRatio = scaleRatio;

    this.x = 10 * scaleRatio;
    this.y = this.canvas.height - this.height - 1.5 * scaleRatio;
    this.yStandingPosition = this.y;

    this.standingStillImage = new Image();
    this.standingStillImage.src = "/images/standing_still.png";
    this.image = this.standingStillImage;

    const dinoRunImage1 = new Image();
    dinoRunImage1.src = "/images/dino_run1.png";

    const dinoRunImage2 = new Image();
    dinoRunImage2.src = "/images/dino_run2.png";

    this.dinoRunImages.push(dinoRunImage1);
    this.dinoRunImages.push(dinoRunImage2);

    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);
    window.addEventListener("touchstart", this.touchstart);
    window.addEventListener("touchend", this.touchend);
  }

  touchstart = () => {
    this.jumpPressed = true;
  };

  touchend = () => {
    this.jumpPressed = false;
  };

  keydown = (event: KeyboardEvent) => {
    if (event.code === "Space") {
      this.jumpPressed = true;
    }
  };

  keyup = (event: KeyboardEvent) => {
    if (event.code === "Space") {
      this.jumpPressed = false;
    }
  };

  destroy() {
    window.removeEventListener("keydown", this.keydown);
    window.removeEventListener("keyup", this.keyup);
    window.removeEventListener("touchstart", this.touchstart);
    window.removeEventListener("touchend", this.touchend);
  }

  update(gameSpeed: number, frameTimeDelta: number) {
    this.run(gameSpeed, frameTimeDelta);

    if (this.jumpInProgress) {
      this.image = this.standingStillImage;
    }

    this.jump(frameTimeDelta);
  }

  jump(frameTimeDelta: number) {
    if (this.jumpPressed) {
      this.jumpInProgress = true;
    }

    if (this.jumpInProgress && !this.falling) {
      if (
        this.y > this.canvas.height - this.minJumpHeight ||
        (this.y > this.canvas.height - this.maxJumpHeight && this.jumpPressed)
      ) {
        this.y -= this.JUMP_SPEED * frameTimeDelta * this.scaleRatio;
      } else {
        this.falling = true;
      }
    } else {
      if (this.y < this.yStandingPosition) {
        this.y += this.GRAVITY * frameTimeDelta * this.scaleRatio;
        if (this.y + this.height > this.canvas.height) {
          this.y = this.yStandingPosition;
        }
      } else {
        this.falling = false;
        this.jumpInProgress = false;
      }
    }
  }

  run(gameSpeed: number, frameTimeDelta: number) {
    if (this.walkAnimationTimer <= 0) {
      if (this.image === this.dinoRunImages[0]) {
        this.image = this.dinoRunImages[1];
      } else {
        this.image = this.dinoRunImages[0];
      }
      this.walkAnimationTimer = this.WALK_ANIMATION_TIMER;
    }
    this.walkAnimationTimer -= frameTimeDelta * gameSpeed;
  }

  draw() {
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

class Ground {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  speed: number;
  scaleRatio: number;
  x: number;
  y: number;
  groundImage: HTMLImageElement;

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    speed: number,
    scaleRatio: number
  ) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.scaleRatio = scaleRatio;

    this.x = 0;
    this.y = this.canvas.height - this.height;

    this.groundImage = new Image();
    this.groundImage.src = "/images/ground.png";
  }

  update(gameSpeed: number, frameTimeDelta: number) {
    this.x -= gameSpeed * frameTimeDelta * this.speed * this.scaleRatio;
  }

  draw() {
    this.ctx.drawImage(this.groundImage, this.x, this.y, this.width, this.height);
    this.ctx.drawImage(
      this.groundImage,
      this.x + this.width,
      this.y,
      this.width,
      this.height
    );

    if (this.x < -this.width) {
      this.x = 0;
    }
  }

  reset() {
    this.x = 0;
  }
}

class Cactus {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  image: HTMLImageElement;

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    image: HTMLImageElement
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
  }

  update(speed: number, gameSpeed: number, frameTimeDelta: number, scaleRatio: number) {
    this.x -= speed * gameSpeed * frameTimeDelta * scaleRatio;
  }

  draw() {
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  collideWith(sprite: { x: number; y: number; width: number; height: number }) {
    const adjustBy = 1.4;
    return (
      sprite.x < this.x + this.width / adjustBy &&
      sprite.x + sprite.width / adjustBy > this.x &&
      sprite.y < this.y + this.height / adjustBy &&
      sprite.height + sprite.y / adjustBy > this.y
    );
  }
}

type CactusImageConfig = { image: HTMLImageElement; width: number; height: number };

class CactiController {
  CACTUS_INTERVAL_MIN = 500;
  CACTUS_INTERVAL_MAX = 2000;

  nextCactusInterval = 0;
  cacti: Cactus[] = [];

  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  cactiImages: CactusImageConfig[];
  scaleRatio: number;
  speed: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    cactiImages: CactusImageConfig[],
    scaleRatio: number,
    speed: number
  ) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.cactiImages = cactiImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;

    this.setNextCactusTime();
  }

  setNextCactusTime() {
    this.nextCactusInterval = this.getRandomNumber(
      this.CACTUS_INTERVAL_MIN,
      this.CACTUS_INTERVAL_MAX
    );
  }

  getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createCactus() {
    const index = this.getRandomNumber(0, this.cactiImages.length - 1);
    const cactusImage = this.cactiImages[index];
    const x = this.canvas.width * 1.5;
    const y = this.canvas.height - cactusImage.height;
    const cactus = new Cactus(
      this.ctx,
      x,
      y,
      cactusImage.width,
      cactusImage.height,
      cactusImage.image
    );

    this.cacti.push(cactus);
  }

  update(gameSpeed: number, frameTimeDelta: number) {
    if (this.nextCactusInterval <= 0) {
      this.createCactus();
      this.setNextCactusTime();
    }
    this.nextCactusInterval -= frameTimeDelta;

    this.cacti.forEach((cactus) => {
      cactus.update(this.speed, gameSpeed, frameTimeDelta, this.scaleRatio);
    });

    this.cacti = this.cacti.filter((cactus) => cactus.x > -cactus.width);
  }

  draw() {
    this.cacti.forEach((cactus) => cactus.draw());
  }

  collideWith(sprite: { x: number; y: number; width: number; height: number }) {
    return this.cacti.some((cactus) => cactus.collideWith(sprite));
  }

  reset() {
    this.cacti = [];
  }
}

class Cloud {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  image: HTMLImageElement;

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    image: HTMLImageElement
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
  }

  update(speed: number, frameTimeDelta: number, scaleRatio: number) {
    this.x -= speed * frameTimeDelta * scaleRatio;
  }

  draw() {
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

class CloudController {
  CLOUD_INTERVAL_MIN = 800;
  CLOUD_INTERVAL_MAX = 2000;

  MIN_SCALE = 0.6;
  MAX_SCALE = 1.3;

  nextCloudInterval = 0;
  clouds: Cloud[] = [];

  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  cloudImage: HTMLImageElement;
  scaleRatio: number;
  speed: number;
  width: number;
  height: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    cloudImage: HTMLImageElement,
    scaleRatio: number,
    speed: number,
    width: number,
    height: number
  ) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.cloudImage = cloudImage;
    this.scaleRatio = scaleRatio;
    this.speed = speed;
    this.width = width;
    this.height = height;

    this.setNextCloudTime();
    this.populateInitialClouds();
  }

  setNextCloudTime() {
    this.nextCloudInterval = this.getRandomNumber(
      this.CLOUD_INTERVAL_MIN,
      this.CLOUD_INTERVAL_MAX
    );
  }

  getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  populateInitialClouds() {
    const cloudCount = 4;
    for (let i = 0; i < cloudCount; i++) {
      const x = this.getRandomNumber(0, this.canvas.width);
      this.createCloud(x);
    }
  }

  createCloud(forcedX: number | null = null) {
    const scale = this.MIN_SCALE + Math.random() * (this.MAX_SCALE - this.MIN_SCALE);
    const width = this.width * scale;
    const height = this.height * scale;

    const x = forcedX !== null ? forcedX : this.canvas.width + width;
    const y = this.getRandomNumber(5 * this.scaleRatio, this.canvas.height / 2);

    const cloud = new Cloud(this.ctx, x, y, width, height, this.cloudImage);

    this.clouds.push(cloud);
  }

  update(frameTimeDelta: number) {
    if (this.nextCloudInterval <= 0) {
      this.createCloud();
      this.setNextCloudTime();
    }
    this.nextCloudInterval -= frameTimeDelta;

    this.clouds.forEach((cloud) => {
      cloud.update(this.speed, frameTimeDelta, this.scaleRatio);
    });

    this.clouds = this.clouds.filter((cloud) => cloud.x > -cloud.width);
  }

  draw() {
    this.clouds.forEach((cloud) => cloud.draw());
  }

  reset() {
    this.clouds = [];
    this.setNextCloudTime();
    this.populateInitialClouds();
  }
}

class Pterodactyl {
  FLAP_ANIMATION_TIMER = 200;
  flapAnimationTimer = this.FLAP_ANIMATION_TIMER;

  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  images: HTMLImageElement[];
  image: HTMLImageElement;

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    images: HTMLImageElement[]
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.images = images;
    this.image = images[0];
  }

  update(speed: number, gameSpeed: number, frameTimeDelta: number, scaleRatio: number) {
    this.x -= speed * gameSpeed * frameTimeDelta * scaleRatio;

    if (this.flapAnimationTimer <= 0) {
      this.image = this.image === this.images[0] ? this.images[1] : this.images[0];
      this.flapAnimationTimer = this.FLAP_ANIMATION_TIMER;
    }
    this.flapAnimationTimer -= frameTimeDelta * gameSpeed;
  }

  draw() {
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  collideWith(sprite: { x: number; y: number; width: number; height: number }) {
    const adjustBy = 1.4;
    return (
      sprite.x < this.x + this.width / adjustBy &&
      sprite.x + sprite.width / adjustBy > this.x &&
      sprite.y < this.y + this.height / adjustBy &&
      sprite.height + sprite.y / adjustBy > this.y
    );
  }
}

class PterodactylController {
  PTERODACTYL_INTERVAL_MIN = 3000;
  PTERODACTYL_INTERVAL_MAX = 7000;

  nextPterodactylInterval = 0;
  pterodactyls: Pterodactyl[] = [];

  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  images: HTMLImageElement[];
  scaleRatio: number;
  speed: number;
  width: number;
  height: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    images: HTMLImageElement[],
    scaleRatio: number,
    speed: number,
    width: number,
    height: number
  ) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.images = images;
    this.scaleRatio = scaleRatio;
    this.speed = speed;
    this.width = width;
    this.height = height;

    this.setNextPterodactylTime();
  }

  setNextPterodactylTime() {
    this.nextPterodactylInterval = this.getRandomNumber(
      this.PTERODACTYL_INTERVAL_MIN,
      this.PTERODACTYL_INTERVAL_MAX
    );
  }

  getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createPterodactyl() {
    const x = this.canvas.width * 1.5;

    const groundY = this.canvas.height - this.height - 1.5 * this.scaleRatio;
    const highY = groundY - 45 * this.scaleRatio;
    const midY = groundY - 22 * this.scaleRatio;
    const possibleY = [groundY, midY, highY];
    const y = possibleY[this.getRandomNumber(0, possibleY.length - 1)];

    const pterodactyl = new Pterodactyl(
      this.ctx,
      x,
      y,
      this.width,
      this.height,
      this.images
    );

    this.pterodactyls.push(pterodactyl);
  }

  update(gameSpeed: number, frameTimeDelta: number) {
    if (this.nextPterodactylInterval <= 0) {
      this.createPterodactyl();
      this.setNextPterodactylTime();
    }
    this.nextPterodactylInterval -= frameTimeDelta;

    this.pterodactyls.forEach((pterodactyl) => {
      pterodactyl.update(this.speed, gameSpeed, frameTimeDelta, this.scaleRatio);
    });

    this.pterodactyls = this.pterodactyls.filter(
      (pterodactyl) => pterodactyl.x > -pterodactyl.width
    );
  }

  draw() {
    this.pterodactyls.forEach((pterodactyl) => pterodactyl.draw());
  }

  collideWith(sprite: { x: number; y: number; width: number; height: number }) {
    return this.pterodactyls.some((pterodactyl) => pterodactyl.collideWith(sprite));
  }

  reset() {
    this.pterodactyls = [];
    this.setNextPterodactylTime();
  }
}

class Score {
  score = 0;
  HIGH_SCORE_KEY = "highScore";

  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  scaleRatio: number;

  constructor(ctx: CanvasRenderingContext2D, scaleRatio: number) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  update(frameTimeDelta: number) {
    this.score += frameTimeDelta * 0.01;
  }

  reset() {
    this.score = 0;
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, String(Math.floor(this.score)));
    }
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = "#525250";
    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, "0");
    const highScorePadded = highScore.toString().padStart(6, "0");

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

/* ---------- Système de mise ---------- */

type ObjectiveType = "time" | "score";

interface Objective {
  type: ObjectiveType;
  target: number;
  label: string;
}

interface GameResult {
  won: boolean;
  amount: number;
  objective: Objective;
}

interface GameController {
  startGame: (objective: Objective) => void;
}

const BALANCE_STORAGE_KEY = "dino_balance_xof";
const DEFAULT_BALANCE = 10000;
const MIN_BET = 100;

function formatXOF(amount: number) {
  return `${Math.round(amount).toLocaleString("fr-FR")} XOF`;
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateObjective(): Objective {
  const type: ObjectiveType = Math.random() < 0.5 ? "time" : "score";

  if (type === "time") {
    const seconds = getRandomInt(15, 45);
    return {
      type,
      target: seconds * 1000,
      label: `Survivre ${seconds} secondes`,
    };
  }

  const points = getRandomInt(150, 600);
  return {
    type,
    target: points,
    label: `Atteindre ${points} points de score`,
  };
}

/* ============================================================
   Composant React — Tailwind CSS
   ============================================================ */

export default function Dino() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<GameController | null>(null);
  const handleGameEndRef = useRef<(won: boolean) => void>(() => {});

  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState(DEFAULT_BALANCE);
  const [phase, setPhase] = useState<"betting" | "playing" | "result">("betting");
  const [betAmount, setBetAmount] = useState(1000);
  const [objective, setObjective] = useState<Objective | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(BALANCE_STORAGE_KEY);
    if (stored !== null && !Number.isNaN(Number(stored))) {
      setBalance(Number(stored));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(BALANCE_STORAGE_KEY, String(balance));
    }
  }, [balance, mounted]);

  useEffect(() => {
    handleGameEndRef.current = (won: boolean) => {
      setBalance((prev) => (won ? prev + betAmount : prev - betAmount));
      setResult({ won, amount: betAmount, objective: objective as Objective });
      setPhase("result");
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const GAME_SPEED_START = 1;
    const GAME_SPEED_INCREMENT = 0.00001;

    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 200;
    const PLAYER_WIDTH = 88 / 1.5;
    const PLAYER_HEIGHT = 94 / 1.5;
    const MAX_JUMP_HEIGHT = GAME_HEIGHT;
    const MIN_JUMP_HEIGHT = 150;
    const GROUND_WIDTH = 2400;
    const GROUND_HEIGHT = 24;
    const GROUND_AND_CACTUS_SPEED = 0.5;

    const CLOUD_SPEED = GROUND_AND_CACTUS_SPEED * 0.4;
    const CLOUD_WIDTH = 90;
    const CLOUD_HEIGHT = 50;

    const PTERODACTYL_SPEED = GROUND_AND_CACTUS_SPEED * 1.2;
    const PTERODACTYL_WIDTH = 84 / 1.5;
    const PTERODACTYL_HEIGHT = 58 / 1.5;

    const CACTI_CONFIG = [
      { width: 48 / 1.5, height: 100 / 1.5, image: "/images/cactus_1.png" },
      { width: 98 / 1.5, height: 100 / 1.5, image: "/images/cactus_2.png" },
      { width: 68 / 1.5, height: 70 / 1.5, image: "/images/cactus_3.png" },
    ];

    let player: Player | null = null;
    let ground: Ground | null = null;
    let cactiController: CactiController | null = null;
    let score: Score | null = null;
    let cloudController: CloudController | null = null;
    let pterodactylController: PterodactylController | null = null;

    let scaleRatio = 1;
    let previousTime: number | null = null;
    let gameSpeed = GAME_SPEED_START;
    let gameOver = false;
    let waitingToStart = true;
    let animationFrameId = 0;
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    let activeObjective: Objective | null = null;
    let elapsedPlayTime = 0;

    function createSprites() {
      if (player) player.destroy();

      const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
      const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
      const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
      const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

      const groundWidthInGame = GROUND_WIDTH * scaleRatio;
      const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

      const cloudWidthInGame = CLOUD_WIDTH * scaleRatio;
      const cloudHeightInGame = CLOUD_HEIGHT * scaleRatio;

      const pterodactylWidthInGame = PTERODACTYL_WIDTH * scaleRatio;
      const pterodactylHeightInGame = PTERODACTYL_HEIGHT * scaleRatio;

      player = new Player(
        ctx,
        playerWidthInGame,
        playerHeightInGame,
        minJumpHeightInGame,
        maxJumpHeightInGame,
        scaleRatio
      );

      ground = new Ground(
        ctx,
        groundWidthInGame,
        groundHeightInGame,
        GROUND_AND_CACTUS_SPEED,
        scaleRatio
      );

      const cactiImages: CactusImageConfig[] = CACTI_CONFIG.map((cactus) => {
        const image = new Image();
        image.src = cactus.image;
        return {
          image,
          width: cactus.width * scaleRatio,
          height: cactus.height * scaleRatio,
        };
      });

      cactiController = new CactiController(
        ctx,
        cactiImages,
        scaleRatio,
        GROUND_AND_CACTUS_SPEED
      );

      const cloudImage = new Image();
      cloudImage.src = "/images/cloud.svg";

      cloudController = new CloudController(
        ctx,
        cloudImage,
        scaleRatio,
        CLOUD_SPEED,
        cloudWidthInGame,
        cloudHeightInGame
      );

      const pterodactylImage1 = new Image();
      pterodactylImage1.src = "/images/pterodactyl_1.png";

      const pterodactylImage2 = new Image();
      pterodactylImage2.src = "/images/pterodactyl_2.png";

      pterodactylController = new PterodactylController(
        ctx,
        [pterodactylImage1, pterodactylImage2],
        scaleRatio,
        PTERODACTYL_SPEED,
        pterodactylWidthInGame,
        pterodactylHeightInGame
      );

      score = new Score(ctx, scaleRatio);
    }

    function getScaleRatio() {
      const screenHeight = Math.min(
        window.innerHeight,
        document.documentElement.clientHeight
      );
      const screenWidth = Math.min(
        window.innerWidth,
        document.documentElement.clientWidth
      );

      if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
        return screenWidth / GAME_WIDTH;
      } else {
        return screenHeight / GAME_HEIGHT;
      }
    }

    function setScreen() {
      scaleRatio = getScaleRatio();
      canvas!.width = GAME_WIDTH * scaleRatio;
      canvas!.height = GAME_HEIGHT * scaleRatio;
      createSprites();
    }

    function showGameOver() {
      const fontSize = 70 * scaleRatio;
      ctx!.font = `${fontSize}px Verdana`;
      ctx!.fillStyle = "grey";
      const x = canvas!.width / 4.5;
      const y = canvas!.height / 2;
      ctx!.fillText("GAME OVER", x, y);
    }

    function showStartGameText() {
      const fontSize = 28 * scaleRatio;
      ctx!.font = `${fontSize}px Verdana`;
      ctx!.fillStyle = "grey";
      const x = canvas!.width / 14;
      const y = canvas!.height / 2;
      ctx!.fillText("Placez votre mise pour commencer", x, y);
    }

    function updateGameSpeed(frameTimeDelta: number) {
      gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;
    }

    function clearScreen() {
      ctx!.fillStyle = "white";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
    }

    function startGame(objective: Objective) {
      activeObjective = objective;
      elapsedPlayTime = 0;
      gameOver = false;
      waitingToStart = false;
      ground?.reset();
      cactiController?.reset();
      cloudController?.reset();
      pterodactylController?.reset();
      score?.reset();
      gameSpeed = GAME_SPEED_START;
    }

    function endGame(won: boolean) {
      if (gameOver) return;
      gameOver = true;
      activeObjective = null;
      score?.setHighScore();
      handleGameEndRef.current(won);
    }

    function gameLoop(currentTime: number) {
      if (previousTime === null) {
        previousTime = currentTime;
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }
      const frameTimeDelta = currentTime - previousTime;
      previousTime = currentTime;

      clearScreen();

      if (!gameOver && !waitingToStart) {
        cloudController?.update(frameTimeDelta);
        ground?.update(gameSpeed, frameTimeDelta);
        cactiController?.update(gameSpeed, frameTimeDelta);
        pterodactylController?.update(gameSpeed, frameTimeDelta);
        player?.update(gameSpeed, frameTimeDelta);
        score?.update(frameTimeDelta);
        updateGameSpeed(frameTimeDelta);
        elapsedPlayTime += frameTimeDelta;
      }

      if (
        !gameOver &&
        !waitingToStart &&
        player &&
        (cactiController?.collideWith(player) ||
          pterodactylController?.collideWith(player))
      ) {
        endGame(false);
      }

      if (!gameOver && !waitingToStart && activeObjective && score) {
        const reached =
          activeObjective.type === "score"
            ? score.score >= activeObjective.target
            : elapsedPlayTime >= activeObjective.target;

        if (reached) {
          endGame(true);
        }
      }

      cloudController?.draw();
      ground?.draw();
      cactiController?.draw();
      pterodactylController?.draw();
      player?.draw();
      score?.draw();

      if (gameOver) {
        showGameOver();
      }

      if (waitingToStart) {
        showStartGameText();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    function debouncedSetScreen() {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setScreen, 200);
    }

    function orientationFallback() {
      setTimeout(setScreen, 300);
    }

    setScreen();
    animationFrameId = requestAnimationFrame(gameLoop);

    window.addEventListener("resize", debouncedSetScreen);

    if (screen.orientation) {
      screen.orientation.addEventListener("change", setScreen);
    } else {
      window.addEventListener("orientationchange", orientationFallback);
    }

    controllerRef.current = { startGame };

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeTimeout) clearTimeout(resizeTimeout);

      window.removeEventListener("resize", debouncedSetScreen);

      if (screen.orientation) {
        screen.orientation.removeEventListener("change", setScreen);
      } else {
        window.removeEventListener("orientationchange", orientationFallback);
      }

      player?.destroy();
      controllerRef.current = null;
    };
  }, []);

  function handleConfirmBet() {
    if (!Number.isFinite(betAmount) || betAmount < MIN_BET) {
      setError(`La mise minimale est de ${formatXOF(MIN_BET)}.`);
      return;
    }
    if (betAmount > balance) {
      setError("Solde insuffisant pour cette mise.");
      return;
    }

    const obj = generateObjective();
    setObjective(obj);
    setResult(null);
    setError("");
    setPhase("playing");
    controllerRef.current?.startGame(obj);
  }

  function handlePlayAgain() {
    setBetAmount((prev) => Math.min(prev, balance) || MIN_BET);
    setPhase("betting");
  }

  function handleResetBalance() {
    setBalance(DEFAULT_BALANCE);
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-white touch-none select-none font-sans">
      <canvas ref={canvasRef} className="block" />

      {/* Bouton règles */}
      <button
        onClick={() => setShowRules(true)}
        className="absolute top-4 left-4 z-20 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
      >
        Règles du jeu
      </button>

      {/* Solde */}
      {mounted && (
        <div className="absolute top-4 right-4 z-20 px-3.5 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 text-sm">
          Solde : {formatXOF(balance)}
        </div>
      )}

      {/* HUD partie */}
      {mounted && phase === "playing" && objective && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-lg bg-white/90 border border-gray-300 text-gray-600 text-sm text-center">
          Mise : {formatXOF(betAmount)} &nbsp;|&nbsp; Objectif : {objective.label}
        </div>
      )}

      {/* Popup de mise */}
      {mounted && phase === "betting" && (
        <Overlay>
          <Card>
            <h2 className="text-xl text-gray-600 font-semibold mb-3">Placez votre mise</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              Solde disponible : <strong>{formatXOF(balance)}</strong>
            </p>

            {balance < MIN_BET ? (
              <>
                <p className="text-sm text-red-700 leading-relaxed mb-2">
                  Solde insuffisant pour miser.
                </p>
                <button
                  className="w-full mt-2 px-4 py-3 text-white bg-gray-600 rounded-lg font-semibold text-sm cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={handleResetBalance}
                >
                  Réinitialiser le solde ({formatXOF(DEFAULT_BALANCE)})
                </button>
              </>
            ) : (
              <>
                <input
                  type="number"
                  min={MIN_BET}
                  max={balance}
                  step={100}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-base rounded-lg border border-gray-300 mb-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />

                {error && <p className="text-sm text-red-700 leading-relaxed mb-2">{error}</p>}

                <button
                  className="w-full mt-2 px-4 py-3 text-white bg-gray-600 rounded-lg font-semibold text-sm cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={handleConfirmBet}
                >
                  Miser {formatXOF(betAmount || 0)} et jouer
                </button>
              </>
            )}

            <button
              onClick={() => setShowRules(true)}
              className="w-full mt-3 px-2 py-2 text-sm text-gray-600 bg-transparent border-none underline cursor-pointer hover:text-gray-800 transition-colors"
            >
              Voir les règles du jeu
            </button>
          </Card>
        </Overlay>
      )}

      {/* Popup de résultat */}
      {mounted && phase === "result" && result && (
        <Overlay>
          <Card>
            <h2
              className={`text-xl font-semibold mb-3 ${
                result.won ? "text-green-700" : "text-red-700"
              }`}
            >
              {result.won ? "Objectif atteint ! 🎉" : "Objectif manqué"}
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              Objectif : <strong>{result.objective.label}</strong>
            </p>

            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              {result.won ? (
                <>
                  Vous remportez <strong>{formatXOF(result.amount * 2)}</strong> (mise
                  doublée).
                </>
              ) : (
                <>
                  Vous perdez votre mise de <strong>{formatXOF(result.amount)}</strong>.
                </>
              )}
            </p>

            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              Nouveau solde : <strong>{formatXOF(balance)}</strong>
            </p>

            <button
              className="w-full mt-2 px-4 py-3 text-white bg-gray-600 rounded-lg font-semibold text-sm cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={handlePlayAgain}
            >
              Rejouer
            </button>
          </Card>
        </Overlay>
      )}

      {/* Popup des règles */}
      {showRules && (
        <Overlay onBackdropClick={() => setShowRules(false)}>
          <Card>
            <h2 className="text-xl text-gray-600 font-semibold mb-3">Règles du jeu</h2>

            <h3 className="text-base text-gray-600 font-semibold mt-4 mb-1.5">Comment jouer</h3>
            <ul className="text-sm text-gray-600 leading-relaxed pl-5 list-disc">
              <li>Appuyez sur Espace (ou touchez l'écran) pour faire sauter le dinosaure.</li>
              <li>Évitez les cactus et les ptérodactyles qui arrivent.</li>
              <li>Toucher un obstacle met fin immédiatement à la partie.</li>
            </ul>

            <h3 className="text-base text-gray-600 font-semibold mt-4 mb-1.5">Système de mise</h3>
            <ul className="text-sm text-gray-600 leading-relaxed pl-5 list-disc">
              <li>Avant de jouer, vous devez placer une mise en XOF (minimum {formatXOF(MIN_BET)}).</li>
              <li>
                Un objectif aléatoire vous est assigné au moment de la mise : soit{" "}
                <strong>survivre un certain temps</strong>, soit{" "}
                <strong>atteindre un certain score</strong>.
              </li>
              <li>
                Si vous atteignez l'objectif avant de toucher un obstacle, votre mise est{" "}
                <strong>doublée</strong>.
              </li>
              <li>
                Si vous touchez un obstacle avant d'avoir atteint l'objectif, votre mise est{" "}
                <strong>perdue</strong>.
              </li>
            </ul>

            <button
              className="w-full mt-2 px-4 py-3 text-white bg-gray-600 rounded-lg font-semibold text-sm cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => setShowRules(false)}
            >
              Fermer
            </button>
          </Card>
        </Overlay>
      )}
    </div>
  );
}

/* ---------- Composants UI ---------- */

function Overlay({
  children,
  onBackdropClick,
}: {
  children: React.ReactNode;
  onBackdropClick?: () => void;
}) {
  return (
    <div
      onClick={onBackdropClick}
      className="absolute inset-0 z-30 bg-black/45 flex items-center justify-center p-4"
    >
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-xl"
    >
      {children}
    </div>
  );
}