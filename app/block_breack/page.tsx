// app/page.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
}

interface Ball {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  trail: { x: number; y: number }[];
}

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  break: boolean;
  hits: number;
  maxHits: number;
  color: string;
  row: number;
  isDoubleBrick: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface Powerup {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  color: string;
  symbol: string;
  velocityY: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
}

interface NebulaParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  driftX: number;
  driftY: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface Objective {
  type: 'SCORE' | 'TEMPS' | 'SCORE_TEMPS';
  cible?: number;
  cibleScore?: number;
  cibleTemps?: number;
}

type PopupType = 'miser' | 'objectif' | 'resultat' | 'regles' | null;

interface ActivePowerups {
  wide: number;
  slow: number;
  multi: number;
  fire: number;
  life: number;
}

const BLOCK_COLORS = [
  ['#ff6b6b', '#ff8787', '#ffa8a8', '#ffd4d4'],
  ['#ffa500', '#ffb733', '#ffc966', '#ffdba3'],
  ['#ffd700', '#ffe14d', '#ffe680', '#fff0b3'],
  ['#4ecdc4', '#6ed8d0', '#8ee3dc', '#aeede8'],
  ['#45b7d1', '#6ec8dd', '#97d9e9', '#c0eaf5'],
  ['#ff69b4', '#ff85c1', '#ffa1ce', '#ffbddb']
];

const POWERUP_TYPES = [
  { type: 'wide', color: '#00ff00', symbol: 'W', duration: 300 },
  { type: 'slow', color: '#00ffff', symbol: 'S', duration: 300 },
  { type: 'multi', color: '#ff00ff', symbol: 'M', duration: 0 },
  { type: 'fire', color: '#ff4500', symbol: 'F', duration: 360 },
  { type: 'life', color: '#ff1493', symbol: 'L', duration: 0 }
];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const [gameState, setGameState] = useState({
    solde: 1000,
    miseEnCours: 0,
    gameActive: false,
    gameOver: false,
    score: 0,
    lives: 3,
    tempsRestant: 0,
    tempsEcoule: 0,
    objectif: null as Objective | null,
  });
  
  const [popupType, setPopupType] = useState<PopupType>('miser');
  const [betAmount, setBetAmount] = useState(100);
  const [betError, setBetError] = useState('');
  const [resultat, setResultat] = useState<{ success: boolean; details: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // REFS temps réel (évitent les closures stale dans le gameLoop)
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const objectifRef = useRef<Objective | null>(null);
  const gameActiveRef = useRef(false);
  const gameOverRef = useRef(false);
  const tempsRestantRef = useRef(0);
  const objectifTermineRef = useRef(false);
  const miseEnCoursRef = useRef(0);
  
  const playerRef = useRef<Player>({ x: 0, y: 0, width: 80, height: 10, velocityX: 10 });
  const ballRef = useRef<Ball>({ x: 0, y: 0, width: 8, height: 8, velocityX: 3, velocityY: 3, trail: [] });
  const blocksRef = useRef<Block[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerupsRef = useRef<Powerup[]>([]);
  const ballsRef = useRef<Ball[]>([]);
  const starsRef = useRef<Star[]>([]);
  const nebulaRef = useRef<NebulaParticle[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  
  const activePowerupsRef = useRef<ActivePowerups>({ wide: 0, slow: 0, multi: 0, fire: 0, life: 0 });
  
  const boardWidthRef = useRef<number>(0);
  const boardHeightRef = useRef<number>(0);
  const isMobileRef = useRef<boolean>(false);
  const baseBallSpeedRef = useRef<number>(3);
  const ballVelocityXRef = useRef<number>(3);
  const ballVelocityYRef = useRef<number>(2.4);
  const blockWidthRef = useRef<number>(50);
  const blockHeightRef = useRef<number>(15);
  const blockRowsRef = useRef<number>(4);
  const blockCountRef = useRef<number>(0);
  const blockXRef = useRef<number>(0);
  const blockYRef = useRef<number>(60);
  const comboRef = useRef<number>(0);
  const comboTimerRef = useRef<number>(0);
  const speedMultiplierRef = useRef<number>(1);
  const powerupFrequencyRef = useRef<number>(0.15);
  const blockDensityRef = useRef<number>(1);
  const doubleBrickChanceRef = useRef<number>(0.3);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const isTouchingRef = useRef<boolean>(false);
  const keysPressedRef = useRef<Set<string>>(new Set());
  const gameLoopRunningRef = useRef<boolean>(true);
  
  // Synchroniser les refs avec le state
  useEffect(() => { scoreRef.current = gameState.score; }, [gameState.score]);
  useEffect(() => { livesRef.current = gameState.lives; }, [gameState.lives]);
  useEffect(() => { objectifRef.current = gameState.objectif; }, [gameState.objectif]);
  useEffect(() => { gameActiveRef.current = gameState.gameActive; }, [gameState.gameActive]);
  useEffect(() => { gameOverRef.current = gameState.gameOver; }, [gameState.gameOver]);
  useEffect(() => { tempsRestantRef.current = gameState.tempsRestant; }, [gameState.tempsRestant]);
  useEffect(() => { miseEnCoursRef.current = gameState.miseEnCours; }, [gameState.miseEnCours]);

  // ========== INITIALIZATION ==========
  
  const generateRandomDifficulty = useCallback(() => {
    speedMultiplierRef.current = 0.7 + Math.random() * 0.6;
    const blockRowsRandom = 3 + Math.floor(Math.random() * 5);
    powerupFrequencyRef.current = 0.1 + Math.random() * 0.2;
    blockDensityRef.current = 0.8 + Math.random() * 0.4;
    doubleBrickChanceRef.current = 0.2 + Math.random() * 0.3;
    
    ballVelocityXRef.current = baseBallSpeedRef.current * speedMultiplierRef.current;
    ballVelocityYRef.current = baseBallSpeedRef.current * speedMultiplierRef.current * 0.8;
    
    blockRowsRef.current = blockRowsRandom;
  }, []);

  const initBackground = useCallback(() => {
    starsRef.current = [];
    for (let i = 0; i < 60; i++) {
      starsRef.current.push({
        x: Math.random() * boardWidthRef.current,
        y: Math.random() * boardHeightRef.current,
        size: Math.random() * 1.5 + 0.5,
        brightness: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.01
      });
    }
    
    nebulaRef.current = [];
    for (let i = 0; i < 10; i++) {
      nebulaRef.current.push({
        x: Math.random() * boardWidthRef.current,
        y: Math.random() * boardHeightRef.current,
        size: Math.random() * 80 + 40,
        color: `rgba(${Math.floor(Math.random() * 100 + 50)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 150 + 100)}, 0.08)`,
        driftX: Math.random() * 0.3 - 0.15,
        driftY: Math.random() * 0.3 - 0.15
      });
    }
  }, []);

  const createBlocks = useCallback(() => {
    const blocks: Block[] = [];
    const spacing = isMobileRef.current ? 6 : 8;
    const availableWidth = boardWidthRef.current - (isMobileRef.current ? 20 : 30);
    
    blockWidthRef.current = Math.floor((isMobileRef.current ? 40 : 50) * blockDensityRef.current);
    const blockColumns = Math.max(4, Math.min(Math.floor((availableWidth + spacing) / (blockWidthRef.current + spacing)), 10));
    blockWidthRef.current = Math.floor((availableWidth - (blockColumns - 1) * spacing) / blockColumns);
    blockXRef.current = (boardWidthRef.current - (blockColumns * blockWidthRef.current + (blockColumns - 1) * spacing)) / 2;
    
    for (let c = 0; c < blockColumns; c++) {
      for (let r = 0; r < blockRowsRef.current; r++) {
        const colorIndex = Math.min(Math.floor(r / 2), BLOCK_COLORS.length - 1);
        const isDoubleBrick = Math.random() < doubleBrickChanceRef.current;
        
        blocks.push({
          x: blockXRef.current + c * (blockWidthRef.current + spacing),
          y: blockYRef.current + r * (blockHeightRef.current + (isMobileRef.current ? 5 : 4)),
          width: blockWidthRef.current,
          height: blockHeightRef.current,
          break: false,
          hits: isDoubleBrick ? 2 : 1,
          maxHits: isDoubleBrick ? 2 : 1,
          color: BLOCK_COLORS[colorIndex][r % 4],
          row: r,
          isDoubleBrick
        });
      }
    }
    
    blocksRef.current = blocks;
    blockCountRef.current = blocks.length;
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    boardWidthRef.current = window.innerWidth;
    boardHeightRef.current = window.innerHeight;
    
    canvas.width = boardWidthRef.current;
    canvas.height = boardHeightRef.current;
    canvas.style.width = `${boardWidthRef.current}px`;
    canvas.style.height = `${boardHeightRef.current}px`;
    
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    isMobileRef.current = mobile;
    setIsMobile(mobile);
    
    if (isMobileRef.current) {
      playerRef.current.width = Math.min(130, boardWidthRef.current * 0.35);
      playerRef.current.height = 12;
      playerRef.current.velocityX = 18;
      ballRef.current.width = 12;
      ballRef.current.height = 12;
      baseBallSpeedRef.current = 3.5;
      blockHeightRef.current = 16;
      blockYRef.current = 70;
    } else {
      playerRef.current.width = 90;
      playerRef.current.height = 8;
      playerRef.current.velocityX = 12;
      ballRef.current.width = 7;
      ballRef.current.height = 7;
      baseBallSpeedRef.current = 2.8;
      blockHeightRef.current = 12;
      blockYRef.current = 50;
    }
    
    playerRef.current.y = boardHeightRef.current - playerRef.current.height - (isMobileRef.current ? 20 : 15);
    
    if (!gameState.gameOver) {
      ballRef.current.x = Math.min(ballRef.current.x, boardWidthRef.current - ballRef.current.width);
      ballRef.current.y = Math.min(ballRef.current.y, boardHeightRef.current - ballRef.current.height);
    }
    
    if (isInitialized.current) {
      createBlocks();
    }
  }, [gameState.gameOver, createBlocks]);

  const isInitialized = useRef(false);

  const resetGame = useCallback(() => {
    objectifTermineRef.current = false;
    scoreRef.current = 0;
    livesRef.current = 3;
    
    setGameState(prev => ({
      ...prev,
      gameOver: false,
      score: 0,
      lives: 3,
      tempsEcoule: 0
    }));
    
    particlesRef.current = [];
    powerupsRef.current = [];
    ballsRef.current = [];
    ballRef.current.trail = [];
    
    activePowerupsRef.current = { wide: 0, slow: 0, multi: 0, fire: 0, life: 0 };
    
    playerRef.current.x = boardWidthRef.current / 2 - playerRef.current.width / 2;
    playerRef.current.y = boardHeightRef.current - playerRef.current.height - (isMobileRef.current ? 20 : 15);
    
    ballRef.current = {
      x: boardWidthRef.current / 2,
      y: boardHeightRef.current / 2,
      width: ballRef.current.width,
      height: ballRef.current.height,
      velocityX: ballVelocityXRef.current,
      velocityY: ballVelocityYRef.current,
      trail: []
    };
    
    generateRandomDifficulty();
    createBlocks();
  }, [createBlocks, generateRandomDifficulty]);

  // ========== GAME LOGIC ==========
  
  const createParticles = useCallback((x: number, y: number, count: number, color: string) => {
    for (let i = 0; i < Math.min(count, 5); i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * (isMobileRef.current ? 4 : 3),
        vy: (Math.random() - 0.5) * (isMobileRef.current ? 4 : 3),
        life: 20,
        color,
        size: Math.random() * (isMobileRef.current ? 3 : 1.5) + 0.5
      });
    }
  }, []);

  const detectCollision = useCallback((a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) => {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }, []);

  const handlePlayerCollision = useCallback((ballObj: Ball) => {
    const hitPosition = (ballObj.x + ballObj.width / 2 - playerRef.current.x) / playerRef.current.width;
    const angle = (hitPosition - 0.5) * Math.PI * 0.75;
    const speed = Math.sqrt(ballObj.velocityX ** 2 + ballObj.velocityY ** 2);
    
    ballObj.velocityX = speed * Math.sin(angle);
    ballObj.velocityY = -speed * Math.cos(angle);
    
    createParticles(ballObj.x + ballObj.width / 2, ballObj.y + ballObj.height, 3, '#4ecdc4');
  }, [createParticles]);

  const applyPowerup = useCallback((type: string) => {
    switch(type) {
      case 'wide':
        activePowerupsRef.current.wide = POWERUP_TYPES[0].duration;
        playerRef.current.width = playerRef.current.width * 1.4;
        break;
      case 'slow':
        activePowerupsRef.current.slow = POWERUP_TYPES[1].duration;
        ballRef.current.velocityX *= 0.6;
        ballRef.current.velocityY *= 0.6;
        break;
      case 'multi':
        for (let i = 0; i < 2; i++) {
          ballsRef.current.push({
            x: ballRef.current.x,
            y: ballRef.current.y,
            width: ballRef.current.width,
            height: ballRef.current.height,
            velocityX: ballRef.current.velocityX + (Math.random() - 0.5) * 3,
            velocityY: ballRef.current.velocityY + (Math.random() - 0.5) * 3,
            trail: []
          });
        }
        break;
      case 'fire':
        activePowerupsRef.current.fire = POWERUP_TYPES[3].duration;
        break;
      case 'life':
        setGameState(prev => ({ ...prev, lives: prev.lives + 1 }));
        break;
    }
  }, []);

  const spawnPowerup = useCallback((x: number, y: number) => {
    const powerupType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    powerupsRef.current.push({
      x, y,
      width: isMobileRef.current ? 20 : 16,
      height: isMobileRef.current ? 20 : 16,
      type: powerupType.type,
      color: powerupType.color,
      symbol: powerupType.symbol,
      velocityY: isMobileRef.current ? 1.8 : 1.2
    });
  }, []);

  const handleBlockCollisions = useCallback((ballObj: Ball) => {
    for (let i = 0; i < blocksRef.current.length; i++) {
      const block = blocksRef.current[i];
      if (block.break) continue;

      if (detectCollision(ballObj, block)) {
        if (activePowerupsRef.current.fire > 0 && ballObj === ballRef.current) {
          block.break = true;
          blockCountRef.current--;
          scoreRef.current += 15;
          setGameState(prev => ({ ...prev, score: scoreRef.current }));
          createParticles(block.x + block.width / 2, block.y + block.height / 2, 4, '#ff4500');
          continue;
        }
        
        block.hits--;
        
        if (block.hits <= 0) {
          block.break = true;
          blockCountRef.current--;
          
          comboRef.current++;
          comboTimerRef.current = 50;
          scoreRef.current += (block.isDoubleBrick ? 15 : 8) + comboRef.current;
          setGameState(prev => ({ ...prev, score: scoreRef.current }));
          
          if (Math.random() < powerupFrequencyRef.current) {
            spawnPowerup(block.x + block.width / 2, block.y + block.height / 2);
          }
          
          createParticles(block.x + block.width / 2, block.y + block.height / 2, 4, block.color);
        } else {
          scoreRef.current += 4;
          setGameState(prev => ({ ...prev, score: scoreRef.current }));
          createParticles(block.x + block.width / 2, block.y + block.height / 2, 2, block.color);
        }
        
        const ballCenterX = ballObj.x + ballObj.width / 2;
        const ballCenterY = ballObj.y + ballObj.height / 2;
        const blockCenterX = block.x + block.width / 2;
        const blockCenterY = block.y + block.height / 2;
        
        const overlapX = (ballObj.width / 2 + block.width / 2) - Math.abs(ballCenterX - blockCenterX);
        const overlapY = (ballObj.height / 2 + block.height / 2) - Math.abs(ballCenterY - blockCenterY);
        
        if (overlapX < overlapY) {
          ballObj.velocityX *= -1;
        } else {
          ballObj.velocityY *= -1;
        }
        
        break;
      }
    }
  }, [createParticles, detectCollision, spawnPowerup]);

  const loseLife = useCallback(() => {
    const newLives = livesRef.current - 1;
    livesRef.current = newLives;
    
    if (newLives <= 0) {
      setGameState(prev => ({ ...prev, lives: 0 }));
      return;
    }
    
    setGameState(prev => ({ ...prev, lives: newLives }));
    
    ballRef.current.x = boardWidthRef.current / 2;
    ballRef.current.y = boardHeightRef.current / 2;
    ballRef.current.velocityX = ballVelocityXRef.current * (Math.random() > 0.5 ? 1 : -1);
    ballRef.current.velocityY = ballVelocityYRef.current;
    ballRef.current.trail = [];
    
    ballsRef.current = [];
    
    playerRef.current.x = boardWidthRef.current / 2 - playerRef.current.width / 2;
    
    activePowerupsRef.current = { wide: 0, slow: 0, multi: 0, fire: 0, life: 0 };
    playerRef.current.width = isMobileRef.current ? Math.min(130, boardWidthRef.current * 0.35) : 90;
  }, []);

  const updateBall = useCallback((ballObj: Ball) => {
    if (ballObj.trail.length > 5) ballObj.trail.shift();
    ballObj.trail.push({ x: ballObj.x, y: ballObj.y });

    ballObj.x += ballObj.velocityX;
    ballObj.y += ballObj.velocityY;

    if (detectCollision(ballObj, playerRef.current)) {
      handlePlayerCollision(ballObj);
    }

    if (ballObj.y <= 0) {
      ballObj.velocityY = Math.abs(ballObj.velocityY);
      createParticles(ballObj.x + ballObj.width / 2, ballObj.y + ballObj.height, 3, '#ffd700');
    } else if (ballObj.x <= 0 || (ballObj.x + ballObj.width >= boardWidthRef.current)) {
      ballObj.velocityX *= -1;
      createParticles(ballObj.x + ballObj.width / 2, ballObj.y + ballObj.height / 2, 3, '#4ecdc4');
    } else if (ballObj.y + ballObj.height >= boardHeightRef.current) {
      if (ballObj === ballRef.current) {
        loseLife();
      } else {
        ballObj.y = boardHeightRef.current + 100;
      }
    }

    handleBlockCollisions(ballObj);
  }, [createParticles, detectCollision, handleBlockCollisions, handlePlayerCollision, loseLife]);

  const updateActivePowerups = useCallback(() => {
    if (activePowerupsRef.current.wide > 0) {
      activePowerupsRef.current.wide--;
      if (activePowerupsRef.current.wide === 0) {
        playerRef.current.width = isMobileRef.current ? Math.min(130, boardWidthRef.current * 0.35) : 90;
      }
    }
    if (activePowerupsRef.current.slow > 0) {
      activePowerupsRef.current.slow--;
      if (activePowerupsRef.current.slow === 0) {
        ballRef.current.velocityX *= 1.67;
        ballRef.current.velocityY *= 1.67;
      }
    }
    if (activePowerupsRef.current.fire > 0) {
      activePowerupsRef.current.fire--;
    }
  }, []);

  const updateBackground = useCallback(() => {
    for (const star of starsRef.current) {
      star.brightness += (Math.random() - 0.5) * star.twinkleSpeed;
      star.brightness = Math.max(0.2, Math.min(1, star.brightness));
    }
    
    for (const nebula of nebulaRef.current) {
      nebula.x += nebula.driftX;
      nebula.y += nebula.driftY;
      
      if (nebula.x < -nebula.size) nebula.x = boardWidthRef.current + nebula.size;
      if (nebula.x > boardWidthRef.current + nebula.size) nebula.x = -nebula.size;
      if (nebula.y < -nebula.size) nebula.y = boardHeightRef.current + nebula.size;
      if (nebula.y > boardHeightRef.current + nebula.size) nebula.y = -nebula.size;
    }
    
    if (Math.random() < 0.003 && shootingStarsRef.current.length < 2) {
      shootingStarsRef.current.push({
        x: Math.random() * boardWidthRef.current,
        y: Math.random() * boardHeightRef.current * 0.3,
        vx: (Math.random() * 3 + 1.5) * (Math.random() > 0.5 ? 1 : -1),
        vy: Math.random() * 1.5 + 0.5,
        life: 20,
        maxLife: 20
      });
    }
    
    for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
      const star = shootingStarsRef.current[i];
      star.x += star.vx;
      star.y += star.vy;
      star.life--;
      
      if (star.life <= 0) {
        shootingStarsRef.current.splice(i, 1);
      }
    }
  }, []);

  const handleLevelComplete = useCallback(() => {
    comboRef.current++;
    scoreRef.current += 300;
    setGameState(prev => ({ ...prev, score: scoreRef.current }));
    
    generateRandomDifficulty();
    
    ballRef.current.velocityX = ballVelocityXRef.current * (ballRef.current.velocityX > 0 ? 1 : -1);
    ballRef.current.velocityY = ballVelocityYRef.current * (ballRef.current.velocityY > 0 ? 1 : -1);
    
    createBlocks();
  }, [createBlocks, generateRandomDifficulty]);

  // ========== RENDERING ==========
  
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, boardHeightRef.current);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, boardWidthRef.current, boardHeightRef.current);
    
    for (const nebula of nebulaRef.current) {
      const gradient2 = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.size);
      gradient2.addColorStop(0, nebula.color);
      gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient2;
      ctx.fillRect(nebula.x - nebula.size, nebula.y - nebula.size, nebula.size * 2, nebula.size * 2);
    }
    
    for (const star of starsRef.current) {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    for (const star of shootingStarsRef.current) {
      const alpha = star.life / star.maxLife;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(star.x - star.vx * 4, star.y - star.vy * 4);
      ctx.lineTo(star.x, star.y);
      ctx.stroke();
    }
  }, []);

  const drawPlayer = useCallback((ctx: CanvasRenderingContext2D) => {
    const player = playerRef.current;
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#4ecdc4';
    
    const gradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.height);
    gradient.addColorStop(0, '#4ecdc4');
    gradient.addColorStop(1, '#45b7d1');
    ctx.fillStyle = gradient;
    
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(player.x, player.y, player.width, player.height, 4);
    } else {
      ctx.rect(player.x, player.y, player.width, player.height);
    }
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(player.x + 2, player.y + 1, player.width - 4, player.height / 3, 2);
    } else {
      ctx.rect(player.x + 2, player.y + 1, player.width - 4, player.height / 3);
    }
    ctx.fill();
    
    ctx.strokeStyle = '#7fffd4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(player.x, player.y, player.width, player.height, 4);
    } else {
      ctx.rect(player.x, player.y, player.width, player.height);
    }
    ctx.stroke();
  }, []);

  const drawBall = useCallback((ctx: CanvasRenderingContext2D, ballObj: Ball) => {
    const isMainBall = ballObj === ballRef.current;
    const ballSize = isMainBall ? ballObj.width : ballObj.width * 0.8;
    
    ctx.shadowBlur = isMainBall ? 8 : 6;
    ctx.shadowColor = isMainBall ? '#ffd700' : '#ff69b4';
    
    ctx.fillStyle = isMainBall ? '#ffd700' : '#ff69b4';
    
    if (activePowerupsRef.current.fire > 0 && isMainBall) {
      ctx.fillStyle = '#ff4500';
      ctx.shadowColor = '#ff4500';
    }
    
    ctx.beginPath();
    ctx.arc(ballObj.x + ballObj.width / 2, ballObj.y + ballObj.height / 2, ballSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(ballObj.x + ballObj.width / 2 - ballSize / 4, ballObj.y + ballObj.height / 2 - ballSize / 4, ballSize / 6, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawTrail = useCallback((ctx: CanvasRenderingContext2D, ballObj: Ball) => {
    for (let i = 0; i < ballObj.trail.length; i++) {
      const alpha = (i / ballObj.trail.length) * 0.3;
      const size = (i / ballObj.trail.length) * ballObj.width;
      
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      if (activePowerupsRef.current.fire > 0) {
        ctx.fillStyle = `rgba(255, 69, 0, ${alpha})`;
      }
      
      ctx.beginPath();
      ctx.arc(ballObj.trail[i].x + ballObj.width / 2, ballObj.trail[i].y + ballObj.height / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const drawBlocks = useCallback((ctx: CanvasRenderingContext2D) => {
    for (const block of blocksRef.current) {
      if (!block.break) {
        ctx.shadowBlur = 3;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowOffsetY = 1;
        
        const gradient = ctx.createLinearGradient(block.x, block.y, block.x, block.y + block.height);
        gradient.addColorStop(0, block.color);
        gradient.addColorStop(1, darkenColor(block.color, 25));
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(block.x, block.y, block.width, block.height, 2);
        } else {
          ctx.rect(block.x, block.y, block.width, block.height);
        }
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(block.x + 1, block.y + 1, block.width - 2, block.height / 3, 1);
        } else {
          ctx.rect(block.x + 1, block.y + 1, block.width - 2, block.height / 3);
        }
        ctx.fill();
        
        if (block.isDoubleBrick && block.hits === 1) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(block.x + block.width / 2, block.y);
          ctx.lineTo(block.x + block.width / 3, block.y + block.height / 2);
          ctx.lineTo(block.x + block.width / 2, block.y + block.height);
          ctx.stroke();
        }
      }
    }
  }, []);

  const drawPowerups = useCallback((ctx: CanvasRenderingContext2D) => {
    for (const powerup of powerupsRef.current) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = powerup.color;
      
      ctx.fillStyle = powerup.color;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(powerup.x - powerup.width / 2, powerup.y - powerup.height / 2, powerup.width, powerup.height, 4);
      } else {
        ctx.rect(powerup.x - powerup.width / 2, powerup.y - powerup.height / 2, powerup.width, powerup.height);
      }
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.font = `bold ${isMobileRef.current ? 12 : 10}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(powerup.symbol, powerup.x, powerup.y + (isMobileRef.current ? 4 : 3));
      ctx.textAlign = 'left';
    }
  }, []);

  const darkenColor = useCallback((color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
  }, []);

  const updateParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      particle.vy += 0.08;
      
      if (particle.life <= 0) {
        particlesRef.current.splice(i, 1);
      } else {
        const alpha = particle.life / 20;
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }, []);

  // ========== OBJECTIVE HANDLING ==========
  
  const terminerPartie = useCallback((success: boolean) => {
    if (objectifTermineRef.current) return;
    objectifTermineRef.current = true;
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    const mise = miseEnCoursRef.current;
    const scoreFinal = scoreRef.current;
    
    if (success) {
      setGameState(prev => ({
        ...prev,
        gameActive: false,
        gameOver: true,
        solde: prev.solde + mise * 2,
        objectif: null
      }));
      setResultat({ success: true, details: `Objectif atteint ! Mise : ${mise} XOF. Gain : +${mise * 2} XOF` });
    } else {
      setGameState(prev => ({
        ...prev,
        gameActive: false,
        gameOver: true,
        objectif: null
      }));
      setResultat({ success: false, details: `Objectif non atteint. Mise perdue : -${mise} XOF. Score : ${scoreFinal}` });
    }
    
    setPopupType('resultat');
  }, []);

  // Détection de fin de partie quand les vies atteignent 0
  useEffect(() => {
    if (gameState.lives === 0 && gameState.gameActive && !objectifTermineRef.current) {
      terminerPartie(false);
    }
  }, [gameState.lives, gameState.gameActive, terminerPartie]);

  // ========== TIMER (objectif) ==========
  
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    timerIntervalRef.current = setInterval(() => {
      if (!gameActiveRef.current || gameOverRef.current || objectifTermineRef.current) return;
      
      setGameState(prev => {
        if (!prev.gameActive || prev.gameOver) return prev;
        
        const newTempsRestant = prev.tempsRestant - 1;
        
        if (newTempsRestant <= 0) {
          const obj = prev.objectif;
          if (obj?.type === 'TEMPS') {
            return { ...prev, tempsRestant: 0 };
          } else if (obj?.type === 'SCORE_TEMPS') {
            if (prev.score < (obj.cibleScore || 0)) {
              return { ...prev, tempsRestant: 0 };
            }
          }
          return { ...prev, tempsRestant: 0 };
        }
        
        return { ...prev, tempsRestant: newTempsRestant };
      });
    }, 1000);
  }, []);

  // Surveiller tempsRestant pour déclencher la fin quand il atteint 0
  useEffect(() => {
    if (gameState.tempsRestant === 0 && gameState.gameActive && !gameState.gameOver && gameState.objectif) {
      const obj = gameState.objectif;
      if (obj.type === 'TEMPS') {
        terminerPartie(true);
      } else if (obj.type === 'SCORE_TEMPS') {
        if (gameState.score < (obj.cibleScore || 0)) {
          terminerPartie(false);
        } else {
          terminerPartie(true);
        }
      }
    }
  }, [gameState.tempsRestant, gameState.gameActive, gameState.gameOver, gameState.objectif, gameState.score, terminerPartie]);

  // Nettoyer le timer objectif si le jeu s'arrête
  useEffect(() => {
    if (!gameState.gameActive && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [gameState.gameActive]);

  // ========== CHRONOMÈTRE DE JEU (toujours actif) ==========
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.gameActive && !gameState.gameOver) {
      interval = setInterval(() => {
        setGameState(prev => ({ ...prev, tempsEcoule: prev.tempsEcoule + 1 }));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.gameActive, gameState.gameOver]);

  // ========== MAIN GAME LOOP ==========
  
  const gameLoop = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx || !gameLoopRunningRef.current) return;
    
    if (!gameActiveRef.current) {
      ctx.clearRect(0, 0, boardWidthRef.current, boardHeightRef.current);
      drawBackground(ctx);
      return;
    }

    if (gameOverRef.current || objectifTermineRef.current) {
      drawBackground(ctx);
      return;
    }

    ctx.clearRect(0, 0, boardWidthRef.current, boardHeightRef.current);
    drawBackground(ctx);
    updateBackground();

    updateActivePowerups();

    if (ballRef.current.y + ballRef.current.height < boardHeightRef.current) {
      updateBall(ballRef.current);
    }

    for (let i = ballsRef.current.length - 1; i >= 0; i--) {
      if (ballsRef.current[i].y + ballsRef.current[i].height >= boardHeightRef.current) {
        ballsRef.current.splice(i, 1);
      } else {
        updateBall(ballsRef.current[i]);
      }
    }

    drawPlayer(ctx);
    
    drawTrail(ctx, ballRef.current);
    drawBall(ctx, ballRef.current);
    for (const b of ballsRef.current) {
      drawTrail(ctx, b);
      drawBall(ctx, b);
    }

    drawBlocks(ctx);
    
    for (let i = powerupsRef.current.length - 1; i >= 0; i--) {
      const powerup = powerupsRef.current[i];
      powerup.y += powerup.velocityY;
      
      if (detectCollision(powerup, playerRef.current)) {
        applyPowerup(powerup.type);
        createParticles(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, 6, powerup.color);
        powerupsRef.current.splice(i, 1);
        continue;
      }
      
      if (powerup.y > boardHeightRef.current) {
        powerupsRef.current.splice(i, 1);
      }
    }
    
    drawPowerups(ctx);
    updateParticles(ctx);

    if (comboTimerRef.current > 0) {
      comboTimerRef.current--;
      if (comboTimerRef.current === 0) {
        comboRef.current = 0;
      }
    }

    // Vérification objectif en temps réel via les refs
    const obj = objectifRef.current;
    if (obj && !objectifTermineRef.current) {
      if (obj.type === 'SCORE' && scoreRef.current >= (obj.cible || 0)) {
        terminerPartie(true);
        return;
      } else if (obj.type === 'SCORE_TEMPS' && scoreRef.current >= (obj.cibleScore || 0)) {
        terminerPartie(true);
        return;
      }
    }

    if (blockCountRef.current === 0) {
      handleLevelComplete();
    }
  }, [applyPowerup, createParticles, detectCollision, drawBackground, drawBall, drawBlocks, drawPlayer, drawPowerups, drawTrail, handleLevelComplete, terminerPartie, updateActivePowerups, updateBall, updateBackground, updateParticles]);

  // ========== POPUP HANDLING ==========
  
  const confirmBet = useCallback(() => {
    if (betAmount < 100) {
      setBetError('Mise minimum : 100 XOF');
      return;
    }
    if (betAmount > 500) {
      setBetError('Mise maximum : 500 XOF');
      return;
    }
    if (betAmount > gameState.solde) {
      setBetError('Solde insuffisant !');
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      solde: prev.solde - betAmount,
      miseEnCours: betAmount
    }));
    
    setBetError('');
    
    const typeRand = Math.random();
    let objective: Objective;
    
    if (typeRand < 0.4) {
      const targetScore = Math.floor(150 + Math.random() * 600);
      objective = { type: 'SCORE', cible: targetScore };
    } else if (typeRand < 0.7) {
      const targetTime = Math.floor(30 + Math.random() * 90);
      objective = { type: 'TEMPS', cible: targetTime };
    } else {
      const targetScore = Math.floor(200 + Math.random() * 500);
      const targetTime = Math.floor(30 + Math.random() * 60);
      objective = { type: 'SCORE_TEMPS', cibleScore: targetScore, cibleTemps: targetTime };
    }
    
    setGameState(prev => ({ ...prev, objectif: objective }));
    setPopupType('objectif');
  }, [betAmount, gameState.solde]);

  const showRules = useCallback(() => {
    setPopupType('regles');
  }, []);

  const backToBet = useCallback(() => {
    setPopupType('miser');
  }, []);

  const startGameWithObjective = useCallback(() => {
    setPopupType(null);
    resetGame();
    
    const objective = gameState.objectif;
    let temps = 0;
    if (objective) {
      if (objective.type === 'TEMPS') {
        temps = objective.cible || 0;
      } else if (objective.type === 'SCORE_TEMPS') {
        temps = objective.cibleTemps || 0;
      }
    }
    
    setGameState(prev => ({
      ...prev,
      gameActive: true,
      gameOver: false,
      tempsRestant: temps,
      tempsEcoule: 0
    }));
    
    if (objective && (objective.type === 'TEMPS' || objective.type === 'SCORE_TEMPS')) {
      startTimer();
    }
  }, [resetGame, startTimer, gameState.objectif]);

  const cancelObjective = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      solde: prev.solde + prev.miseEnCours,
      miseEnCours: 0,
      objectif: null
    }));
    setPopupType('miser');
  }, []);

  const playAgain = useCallback(() => {
    objectifTermineRef.current = false;
    setPopupType(null);
    setGameState(prev => ({
      ...prev,
      gameActive: false,
      gameOver: false,
      solde: Math.max(100, prev.solde),
      miseEnCours: 0,
      objectif: null,
      tempsEcoule: 0
    }));
    setPopupType('miser');
  }, []);

  const quitToMenu = useCallback(() => {
    objectifTermineRef.current = false;
    setPopupType(null);
    setGameState(prev => ({
      ...prev,
      gameActive: false,
      gameOver: false,
      solde: Math.max(100, prev.solde),
      miseEnCours: 0,
      objectif: null,
      tempsEcoule: 0
    }));
    setPopupType('miser');
  }, []);

  // ========== INPUT HANDLING ==========
  
  const movePlayer = useCallback((e: KeyboardEvent) => {
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
      e.preventDefault();
      keysPressedRef.current.add(e.code);
    }
  }, []);

  const stopPlayer = useCallback((e: KeyboardEvent) => {
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
      e.preventDefault();
      keysPressedRef.current.delete(e.code);
    }
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (popupType !== null) return;
    if (gameOverRef.current) return;
    
    isTouchingRef.current = true;
    
    const touchX = e.touches[0].clientX;
    const newX = touchX - playerRef.current.width / 2;
    playerRef.current.x = Math.max(0, Math.min(boardWidthRef.current - playerRef.current.width, newX));
  }, [popupType]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTouchingRef.current || gameOverRef.current || popupType !== null) return;
    
    const touchX = e.touches[0].clientX;
    const newX = touchX - playerRef.current.width / 2;
    playerRef.current.x = Math.max(0, Math.min(boardWidthRef.current - playerRef.current.width, newX));
  }, [popupType]);

  const handleTouchEnd = useCallback(() => {
    isTouchingRef.current = false;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (keysPressedRef.current.has("ArrowLeft")) {
        playerRef.current.x = Math.max(0, playerRef.current.x - playerRef.current.velocityX);
      }
      if (keysPressedRef.current.has("ArrowRight")) {
        playerRef.current.x = Math.min(boardWidthRef.current - playerRef.current.width, playerRef.current.x + playerRef.current.velocityX);
      }
    }, 16);
    
    return () => clearInterval(interval);
  }, []);

  // ========== INITIALIZATION ==========
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    contextRef.current = ctx;
    
    boardWidthRef.current = window.innerWidth;
    boardHeightRef.current = window.innerHeight;
    canvas.width = boardWidthRef.current;
    canvas.height = boardHeightRef.current;
    
    isInitialized.current = true;
    
    resizeCanvas();
    initBackground();
    generateRandomDifficulty();
    
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('keydown', movePlayer);
    document.addEventListener('keyup', stopPlayer);
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };
    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('keydown', movePlayer);
      document.removeEventListener('keyup', stopPlayer);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', preventScroll);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [resizeCanvas, initBackground, generateRandomDifficulty, movePlayer, stopPlayer, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Game loop
  useEffect(() => {
    let animationId: number;
    
    const loop = () => {
      gameLoop();
      animationId = requestAnimationFrame(loop);
    };
    
    animationId = requestAnimationFrame(loop);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameLoop]);

  // ========== RENDER ==========
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: isMobile ? 'default' : 'none' }}
      />
      
      {/* HUD */}
      {gameState.gameActive && (
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 pointer-events-none z-10">
          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg min-w-[100px]">
            <div className="text-white font-bold text-base">Score: {gameState.score}</div>
          </div>
          
          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-center min-w-[100px]">
            <div className="text-yellow-400 font-bold text-lg font-mono">
              {formatTime(gameState.tempsEcoule)}
            </div>
          </div>
          
          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg min-w-[100px] text-right">
            <div className="text-red-400 font-bold text-base">Vies: {gameState.lives}</div>
          </div>
        </div>
      )}
      
      <AnimatePresence>
        {/* POPUP: MISER */}
        {popupType === 'miser' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 max-w-[380px] w-[90%] shadow-2xl border-2 border-yellow-500/50 text-center"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider mb-4">
                Système de Mise
              </h2>
              
              <div className="bg-yellow-500/10 rounded-xl p-3 mb-4 border-l-4 border-yellow-500">
                <div className="flex items-center justify-center">
                  <span className="text-white text-base">Solde actuel : <strong className="text-yellow-400">{gameState.solde} XOF</strong></span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">
                  MISE (XOF)
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      setBetAmount(Math.max(100, Math.min(500, val)));
                    }
                    setBetError('');
                  }}
                  min={100}
                  max={500}
                  className="w-full px-4 py-2.5 bg-slate-800 border-2 border-gray-700 rounded-xl text-yellow-400 text-lg font-bold text-center focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                />
                <div className="text-gray-500 text-xs mt-2">Minimum : 100 XOF | Maximum : 500 XOF</div>
              </div>
              
              {betError && (
                <div className="text-red-400 text-sm mb-3">
                  {betError}
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmBet}
                className="w-full py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-full text-base uppercase tracking-wide shadow-lg hover:shadow-xl transition-all mb-2"
              >
                Confirmer la Mise
              </motion.button>
              
              <button
                onClick={showRules}
                className="w-full py-2 border-2 border-gray-600 text-gray-400 font-semibold rounded-full hover:border-yellow-500 hover:text-yellow-500 transition-colors text-sm"
              >
                📜 Règles du Jeu
              </button>
            </motion.div>
          </motion.div>
        )}
        
        {/* POPUP: RÈGLES */}
        {popupType === 'regles' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 overflow-y-auto py-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 max-w-[420px] w-[90%] shadow-2xl border-2 border-yellow-500/50 text-left max-h-[85vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider mb-6 text-center">
                📜 Règles du Jeu
              </h2>
              
              <div className="space-y-4 text-gray-300 text-sm">
                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                  <h3 className="text-yellow-400 font-bold uppercase text-xs mb-2">💰 Système de Mise</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Mise minimum : <strong className="text-white">100 XOF</strong></li>
                    <li>Mise maximum : <strong className="text-white">500 XOF</strong></li>
                    <li>Votre solde de départ est de <strong className="text-white">1000 XOF</strong></li>
                  </ul>
                </div>
                
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                  <h3 className="text-green-400 font-bold uppercase text-xs mb-2">🏆 Gains</h3>
                  <p>Si vous atteignez votre objectif, vous remportez <strong className="text-white">le double de votre mise</strong> !</p>
                  <p className="mt-1 text-xs text-gray-400">Ex: Mise 200 XOF → Gain 400 XOF (net +200 XOF)</p>
                </div>
                
                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                  <h3 className="text-red-400 font-bold uppercase text-xs mb-2">💸 Pertes</h3>
                  <p>Si vous échouez, vous perdez <strong className="text-white">votre mise intégrale</strong>.</p>
                  <p className="mt-1 text-xs text-gray-400">Échec = Mise perdue (ex: -200 XOF)</p>
                </div>
                
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                  <h3 className="text-blue-400 font-bold uppercase text-xs mb-2">🎯 Types d'Objectifs</h3>
                  <ul className="space-y-2">
                    <li><strong className="text-white">Score :</strong> Atteindre un certain nombre de points</li>
                    <li><strong className="text-white">Temps :</strong> Survivre un nombre de secondes défini</li>
                    <li><strong className="text-white">Score + Temps :</strong> Atteindre le score avant la fin du chrono</li>
                  </ul>
                </div>
                
                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                  <h3 className="text-purple-400 font-bold uppercase text-xs mb-2">🎮 Commandes</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li><strong className="text-white">PC :</strong> Flèches ← → ou touches A/D</li>
                    <li><strong className="text-white">Mobile :</strong> Glissez votre doigt sur l'écran</li>
                  </ul>
                </div>
                
                <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
                  <h3 className="text-cyan-400 font-bold uppercase text-xs mb-2">⚡ Power-ups</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span><strong className="text-green-400">W</strong> — Raquette large</span>
                    <span><strong className="text-cyan-400">S</strong> — Ralentir</span>
                    <span><strong className="text-fuchsia-400">M</strong> — Multi-balle</span>
                    <span><strong className="text-orange-400">F</strong> — Balle de feu</span>
                    <span><strong className="text-pink-400">L</strong> — Vie extra</span>
                  </div>
                </div>
                
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                  <h3 className="text-gray-300 font-bold uppercase text-xs mb-2">❤️ Vies</h3>
                  <p>Vous commencez avec <strong className="text-white">3 vies</strong>. Chaque fois que la balle tombe, vous perdez une vie. À 0 vie, la partie est terminée.</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={backToBet}
                className="w-full mt-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-full text-base uppercase tracking-wide shadow-lg hover:shadow-xl transition-all"
              >
                ← Retour à la Mise
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        
        {/* POPUP: OBJECTIF */}
        {popupType === 'objectif' && gameState.objectif && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 max-w-[380px] w-[90%] shadow-2xl border-2 border-yellow-500/50 text-center"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider mb-4">
                Votre Défi
              </h2>
              
              <div className="bg-yellow-500/10 rounded-xl p-4 mb-4 border border-yellow-500/30">
                <h3 className="text-yellow-400 font-semibold uppercase text-sm mb-2">
                  Objectif à atteindre
                </h3>
                <div className="text-white text-lg font-bold">
                  {gameState.objectif.type === 'SCORE' && `Atteindre ${gameState.objectif.cible} points`}
                  {gameState.objectif.type === 'TEMPS' && `Survivre ${gameState.objectif.cible} secondes`}
                  {gameState.objectif.type === 'SCORE_TEMPS' && `Score ${gameState.objectif.cibleScore} ET ${gameState.objectif.cibleTemps}s`}
                </div>
              </div>
              
              <div className="flex justify-between text-gray-400 text-sm border-t border-gray-700 pt-3 mb-4">
                <span>Mise : <strong className="text-white">{gameState.miseEnCours} XOF</strong></span>
                <span>Gain : <strong className="text-yellow-400">{gameState.miseEnCours * 2} XOF</strong></span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startGameWithObjective}
                className="w-full py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-full text-base uppercase tracking-wide shadow-lg hover:shadow-xl transition-all mb-2"
              >
                Commencer
              </motion.button>
              
              <button
                onClick={cancelObjective}
                className="w-full py-2 border-2 border-gray-600 text-gray-400 font-semibold rounded-full hover:border-yellow-500 hover:text-yellow-500 transition-colors text-sm"
              >
                Abandonner la partie
              </button>
            </motion.div>
          </motion.div>
        )}
        
        {/* POPUP: RESULTAT */}
        {popupType === 'resultat' && resultat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 max-w-[380px] w-[90%] shadow-2xl border-2 border-yellow-500/50 text-center"
            >
              <h2 className={`text-2xl font-bold uppercase tracking-wider mb-4 ${
                resultat.success
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent'
              }`}>
                {resultat.success ? 'Victoire !' : 'Défaite'}
              </h2>
              
              <div className="bg-yellow-500/10 rounded-xl p-3 mb-3 border-l-4 border-yellow-500">
                <div className="flex items-center justify-center">
                  <span className="text-white text-base">Solde après partie : <strong className="text-yellow-400">{gameState.solde} XOF</strong></span>
                </div>
              </div>
              
              <div className="text-gray-300 mb-4">
                <p className={resultat.success ? 'text-green-400' : 'text-red-400'}>{resultat.details}</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={playAgain}
                className="w-full py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-full text-base uppercase tracking-wide shadow-lg hover:shadow-xl transition-all mb-2"
              >
                Rejouer
              </motion.button>
              
              <button
                onClick={quitToMenu}
                className="w-full py-2 border-2 border-gray-600 text-gray-400 font-semibold rounded-full hover:border-yellow-500 hover:text-yellow-500 transition-colors text-sm"
              >
                Quitter
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}