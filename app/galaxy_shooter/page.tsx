'use client';
// @ts-nocheck
/* eslint-disable */

import { useEffect } from 'react';

// ============================================================
// Composant Next.js — Galaxy Shooter
// Port fidèle du jeu HTML/CSS/JS original en TSX.
// Toute la logique du jeu est conservée à l'identique.
// Les images sont désormais servies depuis /public/galaxy/
// (auparavant /Assets/).
// ============================================================

export default function GalaxyShooterGame() {
    useEffect(() => {
        // ============================================================
        // Références de nettoyage (React / Next.js)
        // ============================================================
        let animationFrameId: number | null = null;
        const cleanupFns: Array<() => void> = [];

        // ============================================================
        // 0. DÉTECTION DE L'APPAREIL ET CHARGEMENT DU FOND
        // ============================================================

        function detectDevice() {
            const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua.toLowerCase());
            const isSmallScreen = window.innerWidth < 768;
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isMobileDevice = isMobile || (isSmallScreen && isTouchDevice);

            return {
                isMobile: isMobileDevice,
                isDesktop: !isMobileDevice,
                isTouch: isTouchDevice,
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight
            };
        }

        // Charger l'image de fond appropriée depuis le dossier galaxy/
        function loadBackgroundImage(deviceInfo: any) {
            return new Promise((resolve) => {
                const img = new Image();
                const imagePath = deviceInfo.isMobile ? '/galaxy/mobile.webp' : '/galaxy/desktop.webp';

                img.onload = () => {
                    document.body.style.backgroundImage = `url('${imagePath}')`;
                    console.log(`✅ Fond chargé: ${imagePath}`);
                    resolve(img);
                };

                img.onerror = () => {
                    console.warn(`❌ Impossible de charger ${imagePath}, utilisation de la couleur de fond par défaut.`);
                    document.body.style.backgroundColor = '#0a0a0a';
                    document.body.style.backgroundImage = 'none';
                    resolve(null);
                };

                img.src = imagePath;
            });
        }

        // Détecter l'appareil et charger le fond
        const deviceInfo = detectDevice();
        console.log('📱 Appareil détecté:', deviceInfo.isMobile ? 'Mobile' : 'Desktop');
        console.log('👆 Touch:', deviceInfo.isTouch);
        console.log('📐 Dimensions:', deviceInfo.screenWidth, 'x', deviceInfo.screenHeight);

        // Charger l'image de fond
        let backgroundLoaded = false;
        loadBackgroundImage(deviceInfo).then(() => {
            backgroundLoaded = true;
            if (assetsLoaded === totalAssetsToLoad) {
                hideLoading();
            }
        });

        // Réagir au redimensionnement
        const handleBgResize = () => {
            const newDeviceInfo = detectDevice();
            if (newDeviceInfo.isMobile !== deviceInfo.isMobile) {
                loadBackgroundImage(newDeviceInfo);
            }
        };
        window.addEventListener('resize', handleBgResize);
        cleanupFns.push(() => window.removeEventListener('resize', handleBgResize));

        // Fonction pour cacher l'écran de chargement
        function hideLoading() {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.classList.add('hidden');
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 500);
            }
        }

        // ============================================================
        // 1. CONFIGURATION RESPONSIVE
        // ============================================================

        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;

        const BASE_WIDTH = 464;
        const BASE_HEIGHT = 688;
        const GAME_RATIO = BASE_WIDTH / BASE_HEIGHT;

        let CANVAS_WIDTH = 0;
        let CANVAS_HEIGHT = 0;
        let SCALE = 1;

        function resizeCanvas() {
            const container = document.getElementById('gameContainer')!;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            let width = containerWidth;
            let height = containerHeight;

            if (width / height > GAME_RATIO) {
                width = height * GAME_RATIO;
            } else {
                height = width / GAME_RATIO;
            }

            const padding = 0.92;
            width *= padding;
            height *= padding;

            CANVAS_WIDTH = Math.floor(width);
            CANVAS_HEIGHT = Math.floor(height);
            SCALE = CANVAS_WIDTH / BASE_WIDTH;

            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;
            canvas.style.width = CANVAS_WIDTH + 'px';
            canvas.style.height = CANVAS_HEIGHT + 'px';
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        cleanupFns.push(() => window.removeEventListener('resize', resizeCanvas));

        const handleOrientationChange = () => {
            setTimeout(resizeCanvas, 300);
        };
        window.addEventListener('orientationchange', handleOrientationChange);
        cleanupFns.push(() => window.removeEventListener('orientationchange', handleOrientationChange));

        // ============================================================
        // 2. CHARGEMENT DES ASSETS
        // ============================================================

        const assets: any = {
            fond: null,
            joueurFrames: [],
            monstreFrames: [],
            tir: null
        };

        let assetsLoaded = 0;
        const totalAssetsToLoad = 3;

        function checkAllLoaded() {
            assetsLoaded++;
            if (assetsLoaded === totalAssetsToLoad) {
                if (backgroundLoaded) {
                    hideLoading();
                }
                initGame();
            }
        }

        // Fond
        const COLS_FOND = 8;
        const ROWS_FOND = 19;
        const TOTAL_FRAMES_FOND = COLS_FOND * ROWS_FOND;
        const framesFond: HTMLCanvasElement[] = [];

        const spritesheetFond = new Image();
        spritesheetFond.src = '/galaxy/galaxy_spritesheet.webp';
        spritesheetFond.onload = () => {
            for (let row = 0; row < ROWS_FOND; row++) {
                for (let col = 0; col < COLS_FOND; col++) {
                    let x = col * BASE_WIDTH;
                    let y = row * BASE_HEIGHT;
                    let offScreenCanvas = document.createElement('canvas');
                    offScreenCanvas.width = BASE_WIDTH;
                    offScreenCanvas.height = BASE_HEIGHT;
                    let offCtx = offScreenCanvas.getContext('2d')!;
                    offCtx.drawImage(spritesheetFond, x, y, BASE_WIDTH, BASE_HEIGHT, 0, 0, BASE_WIDTH, BASE_HEIGHT);
                    framesFond.push(offScreenCanvas);
                }
            }
            checkAllLoaded();
        };
        spritesheetFond.onerror = () => {
            console.warn('❌ Impossible de charger le spritesheet de fond');
            checkAllLoaded();
        };

        // Joueur
        const JOUEUR_FRAME_START = 1;
        const JOUEUR_FRAME_END = 8;
        const JOUEUR_FRAME_COUNT = JOUEUR_FRAME_END - JOUEUR_FRAME_START + 1;
        let joueurLoadedCount = 0;
        const rawJoueurFrames: HTMLImageElement[] = [];

        for (let i = JOUEUR_FRAME_START; i <= JOUEUR_FRAME_END; i++) {
            let img = new Image();
            img.src = `/galaxy/frames_joueur/${i}.webp`;
            rawJoueurFrames.push(img);
            img.onload = () => {
                joueurLoadedCount++;
                if (joueurLoadedCount === JOUEUR_FRAME_COUNT) {
                    const SCALE_FACTOR = 0.3;
                    rawJoueurFrames.forEach(f => {
                        let w = f.width * SCALE_FACTOR;
                        let h = f.height * SCALE_FACTOR;
                        (window as any).NEW_JOUEUR_WIDTH = w;
                        (window as any).NEW_JOUEUR_HEIGHT = h;
                        let c = document.createElement('canvas');
                        c.width = w;
                        c.height = h;
                        let cx = c.getContext('2d')!;
                        cx.drawImage(f, 0, 0, w, h);
                        assets.joueurFrames.push(c);
                    });
                    checkAllLoaded();
                }
            };
            img.onerror = () => {
                joueurLoadedCount++;
                if (joueurLoadedCount === JOUEUR_FRAME_COUNT) {
                    checkAllLoaded();
                }
            };
        }

        // Monstres
        const MONSTRE_FRAME_START = 0;
        const MONSTRE_FRAME_END = 119;
        const MONSTRE_FRAME_COUNT = MONSTRE_FRAME_END - MONSTRE_FRAME_START + 1;
        let monstreLoadedCount = 0;
        const rawMonstreFrames: HTMLImageElement[] = [];

        function padZero(num: number, size: number) {
            let s = num + '';
            while (s.length < size) s = '0' + s;
            return s;
        }

        for (let i = MONSTRE_FRAME_START; i <= MONSTRE_FRAME_END; i++) {
            let img = new Image();
            let frameName = `frame_${padZero(i, 4)}.webp`;
            img.src = `/galaxy/mes_frames/${frameName}`;
            rawMonstreFrames.push(img);
            img.onload = () => {
                monstreLoadedCount++;
                if (monstreLoadedCount === MONSTRE_FRAME_COUNT) {
                    const MONSTRE_SCALE = 0.25;
                    rawMonstreFrames.forEach(f => {
                        let w = f.width * MONSTRE_SCALE;
                        let h = f.height * MONSTRE_SCALE;
                        (window as any).MONSTRE_WIDTH = w;
                        (window as any).MONSTRE_HEIGHT = h;
                        let c = document.createElement('canvas');
                        c.width = w;
                        c.height = h;
                        let cx = c.getContext('2d')!;
                        cx.drawImage(f, 0, 0, w, h);
                        assets.monstreFrames.push(c);
                    });
                    checkAllLoaded();
                }
            };
            img.onerror = () => {
                monstreLoadedCount++;
                if (monstreLoadedCount === MONSTRE_FRAME_COUNT) {
                    checkAllLoaded();
                }
            };
        }

        (window as any).MONSTRE_WIDTH = 30;
        (window as any).MONSTRE_HEIGHT = 30;
        (window as any).NEW_JOUEUR_WIDTH = 40;
        (window as any).NEW_JOUEUR_HEIGHT = 40;

        // Tir
        const tirImage = new Image();
        tirImage.src = '/galaxy/tire.webp';
        tirImage.onload = () => {
            const TIR_SCALE = 0.15;
            (window as any).TIR_WIDTH = tirImage.width * TIR_SCALE;
            (window as any).TIR_HEIGHT = tirImage.height * TIR_SCALE;
            let c = document.createElement('canvas');
            c.width = (window as any).TIR_WIDTH;
            c.height = (window as any).TIR_HEIGHT;
            c.getContext('2d')!.drawImage(tirImage, 0, 0, (window as any).TIR_WIDTH, (window as any).TIR_HEIGHT);
            assets.tir = c;
            checkAllLoaded();
        };
        tirImage.onerror = () => {
            console.warn("❌ Impossible de charger l'image de tir");
            checkAllLoaded();
        };

        // ============================================================
        // 3. CLASSES DU JEU
        // ============================================================

        function scaleX(x: number) { return x * SCALE; }
        function scaleY(y: number) { return y * SCALE; }
        function scaleSize(s: number) { return s * SCALE; }

        class Explosion {
            x: number; y: number; currentFrame: number; animationTimer: number;
            frameDuration: number; finished: boolean; frames: HTMLCanvasElement[];

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.currentFrame = 0;
                this.animationTimer = 0;
                this.frameDuration = 50;
                this.finished = false;
                this.frames = [];
                this.createExplosionFrames();
            }

            createExplosionFrames() {
                const colors = ['#ffff00', '#ffc800', '#ff6400', '#ff3200', '#960000'];
                const sizes = [10, 25, 40, 50, 55];

                for (let i = 0; i < colors.length; i++) {
                    let size = sizes[i] * SCALE;
                    let c = document.createElement('canvas');
                    c.width = size * 2;
                    c.height = size * 2;
                    let cx = c.getContext('2d')!;

                    cx.fillStyle = colors[i];
                    cx.beginPath();
                    cx.arc(size, size, size, 0, Math.PI * 2);
                    cx.fill();

                    if (i < colors.length - 1) {
                        cx.fillStyle = '#ffffff';
                        cx.beginPath();
                        cx.arc(size, size, size * 0.7, 0, Math.PI * 2);
                        cx.fill();
                    }

                    if (i > 1) {
                        cx.fillStyle = '#ffffff';
                        for (let p = 0; p < 5; p++) {
                            let px = size + (Math.random() * size - size / 2);
                            let py = size + (Math.random() * size - size / 2);
                            cx.beginPath();
                            cx.arc(px, py, 3 * SCALE, 0, Math.PI * 2);
                            cx.fill();
                        }
                    }
                    this.frames.push(c);
                }
            }

            update(currentTime: number) {
                if (!this.finished) {
                    if (currentTime - this.animationTimer >= this.frameDuration) {
                        this.currentFrame++;
                        this.animationTimer = currentTime;
                        if (this.currentFrame >= this.frames.length) {
                            this.finished = true;
                        }
                    }
                }
            }

            draw(ctx: CanvasRenderingContext2D) {
                if (!this.finished && this.frames[this.currentFrame]) {
                    let frame = this.frames[this.currentFrame];
                    ctx.drawImage(frame, this.x - frame.width / 2, this.y - frame.height / 2);
                }
            }
        }

        class Tir {
            x: number; y: number; speed: number; width: number; height: number;

            constructor(x: number, y: number) {
                const scaledWidth = scaleSize((window as any).NEW_JOUEUR_WIDTH);
                const scaledTirWidth = scaleSize((window as any).TIR_WIDTH);
                const scaledTirHeight = scaleSize((window as any).TIR_HEIGHT);

                this.x = x + (scaledWidth / 2) - (scaledTirWidth / 2);
                this.y = y - scaledTirHeight;
                this.speed = 8 * SCALE;
                this.width = scaledTirWidth;
                this.height = scaledTirHeight;
            }

            update() {
                this.y -= this.speed;
            }

            draw(ctx: CanvasRenderingContext2D) {
                if (assets.tir) {
                    const scaledWidth = scaleSize((window as any).TIR_WIDTH);
                    const scaledHeight = scaleSize((window as any).TIR_HEIGHT);
                    ctx.drawImage(assets.tir, this.x, this.y, scaledWidth, scaledHeight);
                }
            }

            getRect() {
                return { x: this.x, y: this.y, width: this.width, height: this.height };
            }
        }

        class Monstre {
            x: number; y: number; difficultyScore: number; currentFrame: number;
            animationTimer: number; width: number; height: number; behaviorType: string;
            baseSpeed!: number; currentSpeed!: number;
            zigzagAmplitude?: number; zigzagFrequency?: number; initialX?: number; timeOffset?: number;
            homingStrength?: number; waveAmplitude?: number; waveFrequency?: number; acceleration?: number;

            constructor(x: number, y: number, difficultyScore: number) {
                this.x = x;
                this.y = y;
                this.difficultyScore = difficultyScore;
                this.currentFrame = 0;
                this.animationTimer = 0;
                this.width = scaleSize((window as any).MONSTRE_WIDTH);
                this.height = scaleSize((window as any).MONSTRE_HEIGHT);

                this.behaviorType = this.determineBehavior();
                this.calculateAttributes();
            }

            determineBehavior() {
                const behaviors = ['straight', 'zigzag', 'homing', 'wave', 'accelerating'];
                let weights = [0.5, 0.2, 0.1, 0.15, 0.05];
                if (this.difficultyScore > 500) weights = [0.2, 0.25, 0.3, 0.15, 0.1];
                else if (this.difficultyScore > 200) weights = [0.3, 0.3, 0.2, 0.15, 0.05];

                let randomVal = Math.random();
                let cumulative = 0;
                for (let i = 0; i < weights.length; i++) {
                    cumulative += weights[i];
                    if (randomVal <= cumulative) return behaviors[i];
                }
                return 'straight';
            }

            calculateAttributes() {
                let baseSpeed = 1.5 * SCALE;
                let difficultyMultiplier = 1 + (this.difficultyScore / 200);
                let randomFactor = 0.8 + Math.random() * 0.7;

                const modifiers: any = { straight: 1.0, zigzag: 0.8, homing: 1.2, wave: 0.9, accelerating: 0.5 };

                this.baseSpeed = baseSpeed * difficultyMultiplier * randomFactor;
                this.currentSpeed = this.baseSpeed * modifiers[this.behaviorType];

                const ampScale = SCALE;
                if (this.behaviorType === 'zigzag') {
                    this.zigzagAmplitude = (30 + Math.random() * 50) * ampScale;
                    this.zigzagFrequency = 0.02 + Math.random() * 0.03;
                    this.initialX = this.x;
                    this.timeOffset = Math.random() * Math.PI * 2;
                } else if (this.behaviorType === 'homing') {
                    this.homingStrength = 0.01 + Math.random() * 0.02;
                } else if (this.behaviorType === 'wave') {
                    this.waveAmplitude = (50 + Math.random() * 50) * ampScale;
                    this.waveFrequency = 0.01 + Math.random() * 0.02;
                    this.timeOffset = Math.random() * Math.PI * 2;
                } else if (this.behaviorType === 'accelerating') {
                    this.acceleration = 0.01 + Math.random() * 0.02;
                }
            }

            update(currentTime: number, frameDuration: number, joueurX: number | undefined) {
                if (currentTime - this.animationTimer >= frameDuration) {
                    if (assets.monstreFrames.length > 0) {
                        this.currentFrame = (this.currentFrame + 1) % assets.monstreFrames.length;
                    }
                    this.animationTimer = currentTime;
                }

                const canvasWidth = CANVAS_WIDTH;

                if (this.behaviorType === 'straight') {
                    this.y += this.currentSpeed;
                } else if (this.behaviorType === 'zigzag') {
                    this.y += this.currentSpeed;
                    this.x = (this.initialX as number) + Math.sin(this.y * (this.zigzagFrequency as number) + (this.timeOffset as number)) * (this.zigzagAmplitude as number);
                } else if (this.behaviorType === 'homing' && joueurX !== undefined) {
                    this.y += this.currentSpeed;
                    let dx = joueurX - this.x;
                    this.x += dx * (this.homingStrength as number);
                    this.x = Math.max(0, Math.min(this.x, canvasWidth - this.width));
                } else if (this.behaviorType === 'wave') {
                    this.y += this.currentSpeed;
                    this.x = (canvasWidth / 2) + Math.sin(this.y * (this.waveFrequency as number) + (this.timeOffset as number)) * (this.waveAmplitude as number);
                    this.x = Math.max(0, Math.min(this.x, canvasWidth - this.width));
                } else if (this.behaviorType === 'accelerating') {
                    this.currentSpeed += (this.acceleration as number);
                    this.y += this.currentSpeed;
                }
            }

            draw(ctx: CanvasRenderingContext2D) {
                if (assets.monstreFrames.length > 0 && assets.monstreFrames[this.currentFrame]) {
                    const w = scaleSize((window as any).MONSTRE_WIDTH);
                    const h = scaleSize((window as any).MONSTRE_HEIGHT);
                    ctx.drawImage(assets.monstreFrames[this.currentFrame], Math.floor(this.x), Math.floor(this.y), w, h);
                }
            }

            getRect() {
                return { x: Math.floor(this.x), y: Math.floor(this.y), width: this.width, height: this.height };
            }

            isOffScreen() {
                return this.y > CANVAS_HEIGHT + 100;
            }
        }

        class DifficultyManager {
            difficultyScore = 0;
            monstresTues = 0;
            tempsSurvie = 0;
            precisionTir = 0;
            tirsEffectues = 0;
            tirsReussis = 0;
            spawnRateMultiplier = 1.0;
            monsterSpeedMultiplier = 1.0;
            maxMonstersMultiplier = 1.0;

            update(dt: number, monstresTuesDelta = 0, tirReussi = false, tirEffectue = false) {
                this.monstresTues += monstresTuesDelta;
                this.tempsSurvie += dt;
                if (tirEffectue) this.tirsEffectues++;
                if (tirReussi) this.tirsReussis++;

                if (this.tirsEffectues > 0) {
                    this.precisionTir = this.tirsReussis / this.tirsEffectues;
                }

                let diffKills = this.monstresTues * 2;
                let diffTime = this.tempsSurvie * 0.5;
                let diffAcc = (this.precisionTir > 0) ? (1 - this.precisionTir) * 100 : 0;
                let accBonus = (this.precisionTir > 0.7 && this.tirsEffectues > 20) ? 50 : 0;

                this.difficultyScore = Math.floor(diffKills + diffTime + diffAcc + accBonus);
                this.spawnRateMultiplier = Math.min(3.0, 1 + (this.difficultyScore / 300));
                this.maxMonstersMultiplier = Math.min(4.0, 1 + (this.difficultyScore / 200));
            }

            getSpawnDelay(baseDelay: number) {
                return Math.max(200, baseDelay / this.spawnRateMultiplier);
            }

            getMaxMonsters(baseMax: number) {
                return Math.floor(baseMax * this.maxMonstersMultiplier);
            }
        }

        // ============================================================
        // 4. VARIABLES GLOBALES
        // ============================================================

        let gameState = 'START';
        let difficultyManager = new DifficultyManager();
        let joueurX = 0, joueurY = 0;
        let joueurVelocityX = 0;
        let joueurSpeed = 0;
        let monstres: any[] = [];
        let tirs: any[] = [];
        let explosions: any[] = [];
        let score = 0;

        let currentFrameFond = 0;
        let currentFrameJoueur = 0;
        let lastFrameTime = 0;
        const ANIMATION_FPS = 30;
        const frameDuration = 1000 / ANIMATION_FPS;

        let baseSpawnDelay = 800;
        let baseMaxMonsters = 8;
        let lastSpawnTime = 0;
        let tirDelay = 250;
        let lastTirTime = 0;

        let touchLeft = false;
        let touchRight = false;

        // ============================================================
        // 4bis. SYSTÈME DE MISE
        // ============================================================

        const MIN_BET = 100;
        const MAX_BET = 500;
        let balance = 10000;
        let currentBet = 0;
        let betPopupOpen = false;

        const betOverlay = document.getElementById('betOverlay')!;
        const betInput = document.getElementById('betInput') as HTMLInputElement;
        const betConfirmBtn = document.getElementById('betConfirmBtn') as HTMLButtonElement;
        const betSoldeEl = document.getElementById('betSolde')!;
        const betErrorEl = document.getElementById('betError')!;

        function formatXOF(n: number) {
            return n.toLocaleString('fr-FR') + ' XOF';
        }

        function updateBetSoldeDisplay() {
            betSoldeEl.textContent = `Solde : ${formatXOF(balance)}`;
        }

        function openBetPopup() {
            betPopupOpen = true;
            betErrorEl.textContent = '';
            updateBetSoldeDisplay();

            if (balance < MIN_BET) {
                betErrorEl.textContent = `Solde insuffisant pour miser (min ${formatXOF(MIN_BET)}).`;
                betInput.disabled = true;
                betConfirmBtn.disabled = true;
            } else {
                betInput.disabled = false;
                betConfirmBtn.disabled = false;
                betInput.value = '';
                betInput.max = String(Math.min(MAX_BET, balance));
            }

            betOverlay.classList.add('visible');
            setTimeout(() => betInput.focus(), 50);
        }

        function closeBetPopup() {
            betPopupOpen = false;
            betOverlay.classList.remove('visible');
        }

        function tryConfirmBet(amount: string) {
            const bet = parseInt(amount, 10);

            if (isNaN(bet)) {
                betErrorEl.textContent = 'Veuillez entrer un montant.';
                return;
            }
            if (bet < MIN_BET || bet > MAX_BET) {
                betErrorEl.textContent = `La mise doit être entre ${formatXOF(MIN_BET)} et ${formatXOF(MAX_BET)}.`;
                return;
            }
            if (bet > balance) {
                betErrorEl.textContent = 'Solde insuffisant pour cette mise.';
                return;
            }

            balance -= bet;
            currentBet = bet;
            updateBetSoldeDisplay();
            closeBetPopup();

            generateObjectif();
            openObjectifPopup();
        }

        const handleBetConfirmClick = () => tryConfirmBet(betInput.value);
        betConfirmBtn.addEventListener('click', handleBetConfirmClick);
        cleanupFns.push(() => betConfirmBtn.removeEventListener('click', handleBetConfirmClick));

        const handleBetInputKeydown = (e: KeyboardEvent) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                tryConfirmBet(betInput.value);
            }
        };
        betInput.addEventListener('keydown', handleBetInputKeydown);
        cleanupFns.push(() => betInput.removeEventListener('keydown', handleBetInputKeydown));

        // ============================================================
        // 4ter. SYSTÈME D'OBJECTIFS
        // ============================================================

        let objectifPopupOpen = false;
        let currentObjectif: any = null;
        let objectifStartTime = 0;
        let gameOverReason: string | null = null; // 'collision' | 'timeout' | null

        const objectifOverlay = document.getElementById('objectifOverlay')!;
        const objectifInputEl = document.getElementById('objectifInput')!;
        const objectifConfirmBtn = document.getElementById('objectifConfirmBtn') as HTMLButtonElement;

        function randInt(min: number, max: number) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function generateObjectif() {
            const types = ['SCORE', 'TIME', 'KILLS', 'KILLS_IN_TIME', 'SCORE_IN_TIME'];
            const type = types[randInt(0, types.length - 1)];

            let obj: any = { type };

            if (type === 'SCORE') {
                obj.scoreTarget = randInt(5, 25) * 10;
                obj.description = `Atteins ${obj.scoreTarget} points`;
            } else if (type === 'TIME') {
                obj.timeTarget = randInt(20, 60);
                obj.description = `Joue pendant ${obj.timeTarget} secondes`;
            } else if (type === 'KILLS') {
                obj.killsTarget = randInt(5, 25);
                obj.description = `Élimine ${obj.killsTarget} aliens`;
            } else if (type === 'KILLS_IN_TIME') {
                obj.killsTarget = randInt(5, 15);
                obj.timeLimit = randInt(20, 45);
                obj.description = `Élimine ${obj.killsTarget} aliens en ${obj.timeLimit} secondes`;
            } else if (type === 'SCORE_IN_TIME') {
                obj.scoreTarget = randInt(5, 15) * 10;
                obj.timeLimit = randInt(20, 45);
                obj.description = `Atteins ${obj.scoreTarget} points en ${obj.timeLimit} secondes`;
            }

            currentObjectif = obj;
            return obj;
        }

        function openObjectifPopup() {
            objectifPopupOpen = true;
            objectifInputEl.textContent = currentObjectif.description;
            objectifOverlay.classList.add('visible');
        }

        function closeObjectifPopup() {
            objectifPopupOpen = false;
            objectifOverlay.classList.remove('visible');
        }

        function startPlayingWithObjectif() {
            closeObjectifPopup();
            gameOverReason = null;
            gameState = 'PLAYING';
            resetGame();
            objectifStartTime = Date.now();
        }

        objectifConfirmBtn.addEventListener('click', startPlayingWithObjectif);
        cleanupFns.push(() => objectifConfirmBtn.removeEventListener('click', startPlayingWithObjectif));

        function checkObjectifProgress() {
            if (!currentObjectif || gameState !== 'PLAYING') return;

            const elapsed = (Date.now() - objectifStartTime) / 1000;
            let achieved = false;

            switch (currentObjectif.type) {
                case 'SCORE':
                    achieved = score >= currentObjectif.scoreTarget;
                    break;
                case 'TIME':
                    achieved = elapsed >= currentObjectif.timeTarget;
                    break;
                case 'KILLS':
                    achieved = difficultyManager.monstresTues >= currentObjectif.killsTarget;
                    break;
                case 'KILLS_IN_TIME':
                    achieved = difficultyManager.monstresTues >= currentObjectif.killsTarget;
                    break;
                case 'SCORE_IN_TIME':
                    achieved = score >= currentObjectif.scoreTarget;
                    break;
            }

            if (achieved) {
                gameState = 'WON';
                balance += currentBet * 2;
                updateBetSoldeDisplay();
                showResultPopup(true);
                return;
            }

            if ((currentObjectif.type === 'KILLS_IN_TIME' || currentObjectif.type === 'SCORE_IN_TIME') &&
                elapsed >= currentObjectif.timeLimit) {
                gameOverReason = 'timeout';
                gameState = 'GAMEOVER';
                showResultPopup(false);
            }
        }

        // ============================================================
        // 4quater. POPUP DE RÉSULTAT (GAME OVER / GAME WIN)
        // ============================================================

        let resultPopupOpen = false;

        const resultOverlay = document.getElementById('resultOverlay')!;
        const resultBadgeEl = document.getElementById('resultBadge')!;
        const resultInputEl = document.getElementById('resultInput')!;
        const resultConfirmBtn = document.getElementById('resultConfirmBtn') as HTMLButtonElement;

        function showResultPopup(isWin: boolean) {
            resultPopupOpen = true;
            resultBadgeEl.classList.remove('over', 'win');
            resultBadgeEl.classList.add(isWin ? 'win' : 'over');

            const objDesc = currentObjectif ? currentObjectif.description : '';
            let reasonLine = '';
            if (!isWin) {
                reasonLine = gameOverReason === 'timeout'
                    ? "Temps écoulé avant d'atteindre l'objectif"
                    : 'Touché par un alien';
            }

            resultInputEl.innerHTML = `
                <div>${objDesc}</div>
                ${reasonLine ? `<div>${reasonLine}</div>` : ''}
                <div>Score : ${score} — Tués : ${difficultyManager.monstresTues}</div>
                <div class="gainLine" style="color:${isWin ? '#7fffb0' : '#ff8080'};">
                    ${isWin ? `Gains : +${formatXOF(currentBet * 2)}` : `Mise perdue : -${formatXOF(currentBet)}`}
                </div>
                <div>Solde : ${formatXOF(balance)}</div>
            `;

            resultOverlay.classList.add('visible');
        }

        function closeResultPopup() {
            resultPopupOpen = false;
            resultOverlay.classList.remove('visible');
        }

        const handleResultConfirmClick = () => {
            closeResultPopup();
            openBetPopup();
        };
        resultConfirmBtn.addEventListener('click', handleResultConfirmClick);
        cleanupFns.push(() => resultConfirmBtn.removeEventListener('click', handleResultConfirmClick));

        // ============================================================
        // 5. CONTROLES
        // ============================================================

        // Clavier (toujours actif)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
            }

            if (betPopupOpen || objectifPopupOpen || resultPopupOpen) {
                if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
                    if (resultPopupOpen) resultConfirmBtn.click();
                }
                return;
            }

            if (e.key === 'ArrowLeft') { joueurVelocityX = -joueurSpeed; }
            if (e.key === 'ArrowRight') { joueurVelocityX = joueurSpeed; }
            if (e.key === ' ' || e.key === 'Spacebar') {
                if (gameState === 'START') {
                    openBetPopup();
                } else if (gameState === 'PLAYING') {
                    fireTir();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        cleanupFns.push(() => window.removeEventListener('keydown', handleKeyDown));

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                joueurVelocityX = 0;
            }
        };
        window.addEventListener('keyup', handleKeyUp);
        cleanupFns.push(() => window.removeEventListener('keyup', handleKeyUp));

        // Touches tactiles (uniquement sur mobile)
        const btnLeft = document.getElementById('btnLeft');
        const btnRight = document.getElementById('btnRight');
        const btnFire = document.getElementById('btnFire');

        function setupTouchButton(element: HTMLElement | null, onStart: () => void, onEnd: () => void) {
            if (!element) return;

            const onTouchStart = (e: TouchEvent) => {
                e.preventDefault();
                e.stopPropagation();
                onStart();
            };
            const onTouchEnd = (e: TouchEvent) => {
                e.preventDefault();
                e.stopPropagation();
                onEnd();
            };
            const onTouchCancel = (e: TouchEvent) => {
                e.preventDefault();
                e.stopPropagation();
                onEnd();
            };
            const onMouseDown = (e: MouseEvent) => {
                e.preventDefault();
                onStart();
            };
            const onMouseUp = (e: MouseEvent) => {
                e.preventDefault();
                onEnd();
            };
            const onMouseLeave = () => {
                onEnd();
            };

            element.addEventListener('touchstart', onTouchStart, { passive: false });
            element.addEventListener('touchend', onTouchEnd, { passive: false });
            element.addEventListener('touchcancel', onTouchCancel, { passive: false });
            element.addEventListener('mousedown', onMouseDown);
            element.addEventListener('mouseup', onMouseUp);
            element.addEventListener('mouseleave', onMouseLeave);

            cleanupFns.push(() => {
                element.removeEventListener('touchstart', onTouchStart);
                element.removeEventListener('touchend', onTouchEnd);
                element.removeEventListener('touchcancel', onTouchCancel);
                element.removeEventListener('mousedown', onMouseDown);
                element.removeEventListener('mouseup', onMouseUp);
                element.removeEventListener('mouseleave', onMouseLeave);
            });
        }

        setupTouchButton(btnLeft,
            () => {
                touchLeft = true;
                joueurVelocityX = -joueurSpeed;
            },
            () => {
                touchLeft = false;
                if (!touchRight) joueurVelocityX = 0;
            }
        );

        setupTouchButton(btnRight,
            () => {
                touchRight = true;
                joueurVelocityX = joueurSpeed;
            },
            () => {
                touchRight = false;
                if (!touchLeft) joueurVelocityX = 0;
            }
        );

        setupTouchButton(btnFire,
            () => {
                if (betPopupOpen || objectifPopupOpen || resultPopupOpen) return;
                if (gameState === 'START') {
                    openBetPopup();
                } else if (gameState === 'PLAYING') {
                    fireTir();
                }
            },
            () => {}
        );

        function fireTir() {
            let now = Date.now();
            if (now - lastTirTime >= tirDelay) {
                tirs.push(new Tir(joueurX, joueurY));
                lastTirTime = now;
                difficultyManager.update(0, 0, false, true);
            }
        }

        // Empêcher le défilement sur mobile
        const handleTouchMove = (e: TouchEvent) => { e.preventDefault(); };
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        cleanupFns.push(() => document.removeEventListener('touchmove', handleTouchMove));

        // ============================================================
        // 6. FONCTIONS DU JEU
        // ============================================================

        function resetGame() {
            difficultyManager = new DifficultyManager();
            const scaledWidth = scaleSize((window as any).NEW_JOUEUR_WIDTH);
            joueurX = (CANVAS_WIDTH - scaledWidth) / 2;
            joueurY = CANVAS_HEIGHT - scaledWidth - 10;
            monstres = [];
            tirs = [];
            explosions = [];
            score = 0;
            lastSpawnTime = Date.now();
            lastTirTime = Date.now();
            joueurSpeed = 5 * SCALE;
        }

        function initGame() {
            resetGame();
            animationFrameId = requestAnimationFrame(gameLoop);
            openBetPopup();
        }

        function checkCollision(r1: any, r2: any) {
            return r1.x < r2.x + r2.width &&
                r1.x + r1.width > r2.x &&
                r1.y < r2.y + r2.height &&
                r1.y + r1.height > r2.y;
        }

        // ============================================================
        // 7. BOUCLE PRINCIPALE
        // ============================================================

        let lastTime = performance.now();

        function gameLoop(timestamp: number) {
            let dt = (timestamp - lastTime) / 1000.0;
            lastTime = timestamp;

            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            if (timestamp - lastFrameTime >= frameDuration) {
                currentFrameFond = (currentFrameFond + 1) % TOTAL_FRAMES_FOND;
                if (assets.joueurFrames.length > 0) {
                    currentFrameJoueur = (currentFrameJoueur + 1) % assets.joueurFrames.length;
                }
                lastFrameTime = timestamp;
            }

            if (framesFond[currentFrameFond]) {
                ctx.drawImage(framesFond[currentFrameFond], 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            } else {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }

            if (gameState === 'START') {
                // Le popup de mise s'affiche automatiquement au chargement.
                // On garde juste le décor animé en fond.

            } else if (gameState === 'PLAYING') {
                let now = Date.now();

                joueurX += joueurVelocityX;
                const scaledWidth = scaleSize((window as any).NEW_JOUEUR_WIDTH);
                joueurX = Math.max(0, Math.min(joueurX, CANVAS_WIDTH - scaledWidth));

                difficultyManager.update(dt);

                let spawnDelay = difficultyManager.getSpawnDelay(baseSpawnDelay);
                let maxMonsters = difficultyManager.getMaxMonsters(baseMaxMonsters);

                if (now - lastSpawnTime >= spawnDelay && monstres.length < maxMonsters) {
                    const scaledMonsterWidth = scaleSize((window as any).MONSTRE_WIDTH);
                    let spawnX = Math.random() * (CANVAS_WIDTH - scaledMonsterWidth - 20) + 10;
                    monstres.push(new Monstre(spawnX, -scaleSize((window as any).MONSTRE_HEIGHT), difficultyManager.difficultyScore));
                    lastSpawnTime = now;
                }

                for (let i = tirs.length - 1; i >= 0; i--) {
                    tirs[i].update();
                    if (tirs[i].y < 0) tirs.splice(i, 1);
                }

                let playerRect = {
                    x: joueurX,
                    y: joueurY,
                    width: scaleSize((window as any).NEW_JOUEUR_WIDTH),
                    height: scaleSize((window as any).NEW_JOUEUR_HEIGHT)
                };

                for (let i = monstres.length - 1; i >= 0; i--) {
                    let m = monstres[i];
                    m.update(now, frameDuration, joueurX);

                    if (m.isOffScreen()) {
                        monstres.splice(i, 1);
                        continue;
                    }

                    if (checkCollision(m.getRect(), playerRect)) {
                        gameOverReason = 'collision';
                        gameState = 'GAMEOVER';
                        showResultPopup(false);
                        break;
                    }
                }

                for (let t = tirs.length - 1; t >= 0; t--) {
                    let tirHit = false;
                    for (let m = monstres.length - 1; m >= 0; m--) {
                        if (checkCollision(tirs[t].getRect(), monstres[m].getRect())) {
                            explosions.push(new Explosion(
                                monstres[m].x + monstres[m].width / 2,
                                monstres[m].y + monstres[m].height / 2
                            ));
                            monstres.splice(m, 1);
                            tirs.splice(t, 1);
                            score += 10;
                            difficultyManager.update(dt, 1, true, false);
                            tirHit = true;
                            break;
                        }
                    }
                    if (tirHit) continue;
                }

                for (let i = explosions.length - 1; i >= 0; i--) {
                    explosions[i].update(now);
                    if (explosions[i].finished) explosions.splice(i, 1);
                }

                checkObjectifProgress();

                tirs.forEach(t => t.draw(ctx));
                monstres.forEach(m => m.draw(ctx));
                explosions.forEach(e => e.draw(ctx));

                if (assets.joueurFrames.length > 0 && assets.joueurFrames[currentFrameJoueur]) {
                    const w = scaleSize((window as any).NEW_JOUEUR_WIDTH);
                    const h = scaleSize((window as any).NEW_JOUEUR_HEIGHT);
                    ctx.drawImage(assets.joueurFrames[currentFrameJoueur], joueurX, joueurY, w, h);
                }

                const fontSize = Math.floor(14 * SCALE);
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillStyle = 'white';
                ctx.fillText(`Score: ${score}`, 10, 10);

            } else if (gameState === 'GAMEOVER' || gameState === 'WON') {
                // Le résultat détaillé est affiché dans la popup #resultOverlay.
                // On garde juste le décor du jeu figé en fond, légèrement assombri.
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }

            animationFrameId = requestAnimationFrame(gameLoop);
        }

        // ============================================================
        // 8. DÉMARRAGE
        // ============================================================

        if (assetsLoaded === totalAssetsToLoad && backgroundLoaded) {
            hideLoading();
            initGame();
        }

        // ============================================================
        // NETTOYAGE (démontage du composant)
        // ============================================================
        return () => {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
            cleanupFns.forEach(fn => fn());
        };
    }, []);

    return (
        <>
            {/* Écran de chargement */}
            <div id="loading">
                <div className="spinner"></div>
                <span className="loading-text">Chargement du jeu...</span>
            </div>

            <div id="gameContainer">
                <canvas id="gameCanvas"></canvas>

                {/* Contrôles tactiles - disposés comme demandé */}
                <div id="touchControls">
                    <button id="btnLeft">◀</button>
                    <button id="btnFire">🔥</button>
                    <button id="btnRight">▶</button>
                </div>
            </div>

            {/* Popup de mise */}
            <div id="betOverlay">
                <div id="betSolde">Solde : 10 000 XOF</div>
                <div id="betCard">
                    <input id="betInput" type="number" inputMode="numeric" placeholder="100 - 500" min={100} max={500} step={1} />
                    <button id="betConfirmBtn" aria-label="Valider la mise"></button>
                </div>
                <div id="betHint">Mise min : 100 XOF — Mise max : 500 XOF</div>
                <div id="betError"></div>
            </div>

            {/* Popup d'objectif */}
            <div id="objectifOverlay">
                <div id="objectifCard">
                    <div id="objectifInput"></div>
                    <button id="objectifConfirmBtn" aria-label="Valider l'objectif"></button>
                </div>
            </div>

            {/* Popup de résultat (Game Over / Game Win) */}
            <div id="resultOverlay">
                <div id="resultCard">
                    <div id="resultBadge"></div>
                    <div id="resultInput"></div>
                    <button id="resultConfirmBtn" aria-label="Continuer"></button>
                </div>
            </div>

            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    width: 100vw;
                    overflow: hidden;
                    font-family: Arial, sans-serif;
                    touch-action: none;
                    user-select: none;
                    -webkit-user-select: none;
                    background-color: #0a0a0a;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    transition: background-image 0.8s ease;
                }

                #gameContainer {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                }

                #gameCanvas {
                    display: block;
                    background: black;
                    image-rendering: pixelated;
                    image-rendering: crisp-edges;
                    border-radius: 12px;
                    box-shadow: 0 0 60px rgba(0, 150, 255, 0.15);
                }

                /* ============================================================
                   CONTROLES TACTILES - UNIQUEMENT SUR MOBILE
                   ============================================================ */
                #touchControls {
                    position: absolute;
                    bottom: 30px;
                    left: 0;
                    right: 0;
                    display: none; /* Caché par défaut */
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 20px;
                    pointer-events: none;
                    z-index: 10;
                    height: 100px;
                }

                /* Affichage uniquement sur mobile */
                @media (max-width: 768px) {
                    #touchControls {
                        display: flex !important;
                    }
                }

                @media (pointer: coarse) {
                    #touchControls {
                        display: flex !important;
                    }
                }

                /* Bouton Gauche - à gauche */
                #btnLeft {
                    pointer-events: auto;
                    width: 75px;
                    height: 75px;
                    border-radius: 50%;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    color: white;
                    font-size: 32px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    touch-action: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                }

                #btnLeft:active {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(0.9);
                }

                /* Bouton Tir - au centre */
                #btnFire {
                    pointer-events: auto;
                    width: 85px;
                    height: 85px;
                    border-radius: 50%;
                    border: 4px solid rgba(255, 50, 50, 0.6);
                    background: rgba(255, 50, 50, 0.25);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    color: white;
                    font-size: 28px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    touch-action: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 20px rgba(255, 50, 50, 0.3);
                    margin: 0 auto;
                }

                #btnFire:active {
                    background: rgba(255, 50, 50, 0.6);
                    transform: scale(0.9);
                    box-shadow: 0 0 30px rgba(255, 50, 50, 0.5);
                }

                /* Bouton Droite - à droite */
                #btnRight {
                    pointer-events: auto;
                    width: 75px;
                    height: 75px;
                    border-radius: 50%;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    color: white;
                    font-size: 32px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    touch-action: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                }

                #btnRight:active {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(0.9);
                }

                /* Adaptation pour très petits écrans */
                @media (max-width: 400px) {
                    #btnLeft, #btnRight {
                        width: 60px;
                        height: 60px;
                        font-size: 26px;
                    }
                    #btnFire {
                        width: 70px;
                        height: 70px;
                        font-size: 24px;
                    }
                    #touchControls {
                        bottom: 20px;
                        padding: 0 15px;
                        height: 80px;
                    }
                }

                @media (max-width: 350px) {
                    #btnLeft, #btnRight {
                        width: 50px;
                        height: 50px;
                        font-size: 20px;
                    }
                    #btnFire {
                        width: 60px;
                        height: 60px;
                        font-size: 20px;
                    }
                    #touchControls {
                        bottom: 15px;
                        padding: 0 10px;
                        height: 70px;
                    }
                }

                /* Animation de chargement */
                #loading {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.85);
                    z-index: 9999;
                    color: white;
                    font-size: 24px;
                    flex-direction: column;
                    gap: 20px;
                    transition: opacity 0.5s ease;
                }

                #loading.hidden {
                    opacity: 0;
                    pointer-events: none;
                }

                #loading .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    border-top-color: #00aaff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                #loading .loading-text {
                    font-size: 18px;
                    color: #aaa;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* ============================================================
                   POPUP DE MISE
                   ============================================================ */
                #betOverlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    display: none;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    gap: 14px;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    z-index: 5000;
                    padding: 16px;
                }

                #betOverlay.visible {
                    display: flex;
                }

                #betSolde {
                    color: #ffe066;
                    font-weight: bold;
                    font-size: clamp(15px, 4vw, 20px);
                    text-shadow: 0 0 8px rgba(0,0,0,0.8);
                    letter-spacing: 0.5px;
                }

                #betCard {
                    position: relative;
                    width: min(92vw, 460px);
                    aspect-ratio: 1536 / 1024;
                    background-image: url('/galaxy/bet.webp');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                }

                #betInput {
                    position: absolute;
                    left: 22.47%;
                    top: 43.26%;
                    width: 54.66%;
                    height: 20.74%;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #ffffff;
                    text-align: center;
                    font-family: Arial, sans-serif;
                    font-weight: bold;
                    font-size: clamp(16px, 4.2vw, 26px);
                    text-shadow: 0 0 6px rgba(255,255,255,0.35);
                    -moz-appearance: textfield;
                }

                #betInput::-webkit-outer-spin-button,
                #betInput::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                #betInput::placeholder {
                    color: rgba(255,255,255,0.45);
                    font-weight: normal;
                }

                #betConfirmBtn {
                    position: absolute;
                    left: 29.81%;
                    top: 67.89%;
                    width: 40.72%;
                    height: 21.23%;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }

                #betHint {
                    color: #dcdcdc;
                    font-size: clamp(11px, 3vw, 13px);
                    text-align: center;
                }

                #betError {
                    color: #ff5c5c;
                    font-weight: bold;
                    font-size: clamp(12px, 3.2vw, 14px);
                    min-height: 18px;
                    text-align: center;
                    text-shadow: 0 0 6px rgba(0,0,0,0.8);
                }

                /* ============================================================
                   POPUP D'OBJECTIF
                   ============================================================ */
                #objectifOverlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    display: none;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    gap: 14px;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    z-index: 5100;
                    padding: 16px;
                }

                #objectifOverlay.visible {
                    display: flex;
                }

                #objectifCard {
                    position: relative;
                    width: min(92vw, 420px);
                    aspect-ratio: 853 / 743;
                    background-image: url('/galaxy/objectif.jpg');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                }

                #objectifInput {
                    position: absolute;
                    left: 10.02%;
                    top: 24.47%;
                    width: 80.59%;
                    height: 52.17%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: #ffffff;
                    font-family: Arial, sans-serif;
                    font-weight: bold;
                    font-size: clamp(15px, 5vw, 22px);
                    line-height: 1.3;
                    text-shadow: 0 0 6px rgba(255,255,255,0.3);
                    padding: 4%;
                }

                #objectifConfirmBtn {
                    position: absolute;
                    left: 22.30%;
                    top: 78.75%;
                    width: 56.46%;
                    height: 19.77%;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }

                /* ============================================================
                   POPUP DE RÉSULTAT (GAME OVER / GAME WIN)
                   ============================================================ */
                #resultOverlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    display: none;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    gap: 14px;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    z-index: 5200;
                    padding: 16px;
                }

                #resultOverlay.visible {
                    display: flex;
                }

                #resultCard {
                    position: relative;
                    width: min(92vw, 440px);
                    aspect-ratio: 854 / 793;
                    background-image: url('/galaxy/result_card.webp');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                }

                #resultBadge {
                    position: absolute;
                    left: 14%;
                    top: 21%;
                    width: 72%;
                    height: 15%;
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                }

                #resultBadge.over {
                    background-image: url('/galaxy/badge_over.webp');
                }

                #resultBadge.win {
                    background-image: url('/galaxy/badge_win.webp');
                }

                #resultInput {
                    position: absolute;
                    left: 6.88%;
                    top: 39.86%;
                    width: 85.98%;
                    height: 24.55%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: #ffffff;
                    font-family: Arial, sans-serif;
                    font-size: clamp(12px, 3.4vw, 15px);
                    line-height: 1.5;
                    text-shadow: 0 0 6px rgba(255,255,255,0.25);
                    padding: 2% 6%;
                    gap: 2px;
                }

                #resultInput .gainLine {
                    font-weight: bold;
                    font-size: clamp(14px, 4vw, 18px);
                }

                #resultConfirmBtn {
                    position: absolute;
                    left: 24.48%;
                    top: 73.64%;
                    width: 52.80%;
                    height: 21.39%;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }
            `}</style>
        </>
    );
}