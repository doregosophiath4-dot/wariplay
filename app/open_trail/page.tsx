'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

// ─── Images ────────────────────────────────────────────────────────────────
const PLATFORM_IMG = '/imgs/platform.png';
const HILLS_IMG = '/imgs/hills.png';
const BACKGROUND_IMG = '/imgs/background.png';
const PLATFORM_SMALL_TALL_IMG = '/imgs/platformSmallTall.png';
const SPRITE_RUN_LEFT_IMG = '/imgs/spriteRunLeft.png';
const SPRITE_RUN_RIGHT_IMG = '/imgs/spriteRunRight.png';
const SPRITE_STAND_LEFT_IMG = '/imgs/spriteStandLeft.png';
const SPRITE_STAND_RIGHT_IMG = '/imgs/spriteStandRight.png';

// ─── Canvas dimensions ─────────────────────────────────────────────────────
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
const GRAVITY = 1.5;

// ─── Paramètres d'espace entre plateformes ─────────────────────────────────
const BASE_MIN_SPACE = 230;
const SPACE_INCREMENT = 60;
const SCORE_THRESHOLD = 30;

// ─── Seuils du niveau volant ────────────────────────────────────────────────
const FLYING_LEVEL_START = 70;   // Score où commence le niveau volant
const FLYING_LEVEL_END = 100;    // Score où finit le niveau volant

// ═══════════════════════════════════════════
//  PLAYER CLASS
// ═══════════════════════════════════════════
class Player {
  speed: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  width: number;
  height: number;
  image: HTMLImageElement;
  frames: number;
  sprites: {
    stand: {
      right: HTMLImageElement;
      left: HTMLImageElement;
      cropWidth: number;
      width: number;
    };
    run: {
      right: HTMLImageElement;
      left: HTMLImageElement;
      cropWidth: number;
      width: number;
    };
  };
  currentSprite: HTMLImageElement;
  currentCropWidth: number;

  constructor() {
    this.speed = 10;
    this.position = {
      x: 100,
      y: 100,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };

    this.width = 66;
    this.height = 150;

    this.image = createImage(SPRITE_STAND_RIGHT_IMG);
    this.frames = 0;
    this.sprites = {
      stand: {
        right: createImage(SPRITE_STAND_RIGHT_IMG),
        left: createImage(SPRITE_STAND_LEFT_IMG),
        cropWidth: 177,
        width: 66,
      },
      run: {
        right: createImage(SPRITE_RUN_RIGHT_IMG),
        left: createImage(SPRITE_RUN_LEFT_IMG),
        cropWidth: 341,
        width: 127.875,
      },
    };

    this.currentSprite = this.sprites.stand.right;
    this.currentCropWidth = 177;
  }

  draw(c: CanvasRenderingContext2D) {
    c.drawImage(
      this.currentSprite,
      this.currentCropWidth * this.frames,
      0,
      this.currentCropWidth,
      400,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update(c: CanvasRenderingContext2D, canvasHeight: number) {
    this.frames++;
    if (
      this.frames > 59 &&
      (this.currentSprite === this.sprites.stand.right ||
        this.currentSprite === this.sprites.stand.left)
    )
      this.frames = 0;
    else if (
      this.frames > 29 &&
      (this.currentSprite === this.sprites.run.right ||
        this.currentSprite === this.sprites.run.left)
    )
      this.frames = 0;
    this.draw(c);
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvasHeight)
      this.velocity.y += GRAVITY;
  }
}

// ═══════════════════════════════════════════
//  PLATFORM CLASS
// ═══════════════════════════════════════════
class Platform {
  position: { x: number; y: number };
  image: HTMLImageElement;
  width: number;
  height: number;

  constructor({ x, y, image }: { x: number; y: number; image: HTMLImageElement }) {
    this.position = {
      x,
      y,
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }

  draw(c: CanvasRenderingContext2D) {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

// ═══════════════════════════════════════════
//  GENERICOBJECT CLASS
// ═══════════════════════════════════════════
class GenericObject {
  position: { x: number; y: number };
  image: HTMLImageElement;
  width: number;
  height: number;

  constructor({ x, y, image }: { x: number; y: number; image: HTMLImageElement }) {
    this.position = {
      x,
      y,
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }

  draw(c: CanvasRenderingContext2D) {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

// ═══════════════════════════════════════════
//  CREATEIMAGE
// ═══════════════════════════════════════════
function createImage(imageSrc: string): HTMLImageElement {
  const image = new Image();
  image.src = imageSrc;
  image.width = 582;
  image.height = 126;
  return image;
}

export default function Wariplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const c = canvas.getContext('2d');
    if (!c) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    container.addEventListener('wheel', preventScroll, { passive: false });
    container.addEventListener('touchmove', preventScroll, { passive: false });

    const preventKeyScroll = (e: KeyboardEvent) => {
      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === ' ' ||
        e.code === 'Space'
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', preventKeyScroll, { passive: false });

    let platformImage: HTMLImageElement;
    let platformSmallTallImage: HTMLImageElement;
    let player: Player;
    let platforms: Platform[];
    let genericObjects: GenericObject[];
    let lastKey: string;
    const keys = {
      right: { pressed: false },
      left: { pressed: false },
    };
    let scrollOffset = 0;
    let animationId: number;
    let canJump = true;

    let currentScore = 0;
    let wasOnPlatform = false;
    let lastPlatformX: number | null = null;
    let inFlyingLevel = false;

    // ═══════════════════════════════════════════
    //  CALCULER L'ESPACE MINIMUM SELON LE SCORE
    // ═══════════════════════════════════════════
    function getMinSpace(): number {
      const multiplier = Math.floor(currentScore / SCORE_THRESHOLD);
      return BASE_MIN_SPACE + (multiplier * SPACE_INCREMENT);
    }

    // ═══════════════════════════════════════════
    //  VÉRIFIER SI ON EST DANS LE NIVEAU VOLANT
    // ═══════════════════════════════════════════
    function isFlyingLevel(): boolean {
      return currentScore >= FLYING_LEVEL_START && currentScore < FLYING_LEVEL_END;
    }

    // ═══════════════════════════════════════════
    //  GÉNÉRER UNE POSITION Y POUR NIVEAU VOLANT
    // ═══════════════════════════════════════════
    function getFlyingY(): number {
      // Hauteurs possibles pour les plateformes volantes (style escalier Mario)
      // Entre 200 et 450 pour rester jouable
      const heights = [200, 250, 300, 350, 400, 450];
      return heights[Math.floor(Math.random() * heights.length)];
    }

    // ═══════════════════════════════════════════
    //  INIT
    // ═══════════════════════════════════════════
    function init() {
      platformImage = createImage(PLATFORM_IMG);
      platformSmallTallImage = createImage(PLATFORM_SMALL_TALL_IMG);

      player = new Player();

      const minSpace = getMinSpace();
      const flying = isFlyingLevel();
      inFlyingLevel = flying;

      let currentX = -1;

      if (flying) {
        // ═══ NIVEAU VOLANT : uniquement platformSmallTall flottantes ═══
        platforms = [
          new Platform({
            x: currentX,
            y: getFlyingY(),
            image: platformSmallTallImage,
          }),
        ];

        for (let i = 0; i < 15; i++) {
          const espace = minSpace + Math.random() * 150;
          currentX = currentX + platformSmallTallImage.width + espace;

          platforms.push(
            new Platform({
              x: currentX,
              y: getFlyingY(),
              image: platformSmallTallImage,
            })
          );
        }
      } else {
        // ═══ NIVEAU NORMAL : uniquement platform.png au sol ═══
        platforms = [
          new Platform({
            x: currentX,
            y: 470,
            image: platformImage,
          }),
        ];

        for (let i = 0; i < 10; i++) {
          const espace = minSpace + Math.random() * 200;
          currentX = currentX + platformImage.width + espace;

          platforms.push(
            new Platform({
              x: currentX,
              y: 470,
              image: platformImage,
            })
          );
        }
      }

      genericObjects = [];

      const bgImage = createImage(BACKGROUND_IMG);
      const hillsImage = createImage(HILLS_IMG);

      const margin = CANVAS_WIDTH;

      for (let x = -margin; x < CANVAS_WIDTH + margin; x += bgImage.width) {
        genericObjects.push(
          new GenericObject({
            x: x,
            y: -1,
            image: bgImage,
          })
        );
      }

      for (let x = -margin; x < CANVAS_WIDTH + margin; x += hillsImage.width * 0.85) {
        genericObjects.push(
          new GenericObject({
            x: x,
            y: -1,
            image: hillsImage,
          })
        );
      }

      scrollOffset = 0;
      canJump = true;
      currentScore = 0;
      wasOnPlatform = false;
      lastPlatformX = null;
      inFlyingLevel = false;
      setScore(0);
    }

    // ═══════════════════════════════════════════
    //  RECYCLER LES PLATEFORMES
    // ═══════════════════════════════════════════
    function recyclePlatforms() {
      if (platforms.length === 0) return;

      let maxX = -Infinity;
      for (const platform of platforms) {
        if (platform.position.x > maxX) {
          maxX = platform.position.x;
        }
      }

      const deleteThreshold = -CANVAS_WIDTH * 2;
      platforms = platforms.filter((platform) => {
        return platform.position.x + platform.width > deleteThreshold;
      });

      const flying = isFlyingLevel();
      const generateThreshold = CANVAS_WIDTH * 2;

      if (flying && !inFlyingLevel) {
        // Transition vers niveau volant : vider et régénérer
        inFlyingLevel = true;
        platforms = [];
        maxX = scrollOffset - CANVAS_WIDTH;
      } else if (!flying && inFlyingLevel) {
        // Transition vers niveau normal : vider et régénérer
        inFlyingLevel = false;
        platforms = [];
        maxX = scrollOffset - CANVAS_WIDTH;
      }

      while (maxX < scrollOffset + generateThreshold) {
        const minSpace = getMinSpace();

        if (flying) {
          // Générer des plateformes volantes (small tall)
          const espace = minSpace + Math.random() * 150;
          maxX = maxX + platformSmallTallImage.width + espace;

          platforms.push(
            new Platform({
              x: maxX,
              y: getFlyingY(),
              image: platformSmallTallImage,
            })
          );
        } else {
          // Générer des plateformes normales au sol
          const espace = minSpace + Math.random() * 200;
          maxX = maxX + platformImage.width + espace;

          platforms.push(
            new Platform({
              x: maxX,
              y: 470,
              image: platformImage,
            })
          );
        }
      }
    }

    // ═══════════════════════════════════════════
    //  RECYCLER LES ARRIÈRE-PLANS
    // ═══════════════════════════════════════════
    function recycleGenericObjects() {
      const bgObjects: GenericObject[] = [];
      const hillsObjects: GenericObject[] = [];

      genericObjects.forEach((obj) => {
        if (obj.image.src.includes('hills')) {
          hillsObjects.push(obj);
        } else {
          bgObjects.push(obj);
        }
      });

      for (const obj of bgObjects) {
        if (obj.position.x + obj.width < -CANVAS_WIDTH) {
          let maxX = -CANVAS_WIDTH;
          for (const other of bgObjects) {
            if (other.position.x > maxX) {
              maxX = other.position.x;
            }
          }
          obj.position.x = maxX + obj.width;
        }
        if (obj.position.x > CANVAS_WIDTH * 2) {
          let minX = CANVAS_WIDTH * 2;
          for (const other of bgObjects) {
            if (other.position.x < minX) {
              minX = other.position.x;
            }
          }
          obj.position.x = minX - obj.width;
        }
      }

      const hillsWidth = hillsObjects[0]?.image.width || 582;
      for (const obj of hillsObjects) {
        if (obj.position.x + obj.width < -CANVAS_WIDTH) {
          let maxX = -CANVAS_WIDTH;
          for (const other of hillsObjects) {
            if (other.position.x > maxX) {
              maxX = other.position.x;
            }
          }
          obj.position.x = maxX + hillsWidth * 0.85;
        }
        if (obj.position.x > CANVAS_WIDTH * 2) {
          let minX = CANVAS_WIDTH * 2;
          for (const other of hillsObjects) {
            if (other.position.x < minX) {
              minX = other.position.x;
            }
          }
          obj.position.x = minX - hillsWidth * 0.85;
        }
      }
    }

    // ═══════════════════════════════════════════
    //  ANIMATE
    // ═══════════════════════════════════════════
    function animate() {
      animationId = requestAnimationFrame(animate);
      c.fillStyle = 'white';
      c.fillRect(0, 0, canvas.width, canvas.height);

      genericObjects.forEach((genericObject) => {
        genericObject.draw(c);
      });

      platforms.forEach((platform) => {
        platform.draw(c);
      });

      player.update(c, canvas.height);

      if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = player.speed;
      } else if (
        (keys.left.pressed && player.position.x > 100) ||
        (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
      ) {
        player.velocity.x = -player.speed;
      } else {
        player.velocity.x = 0;

        if (keys.right.pressed) {
          scrollOffset += player.speed;
          platforms.forEach((platform) => {
            platform.position.x -= player.speed;
          });
          genericObjects.forEach((genericObject) => {
            genericObject.position.x -= player.speed * 0.66;
          });
          recyclePlatforms();
          recycleGenericObjects();
        } else if (keys.left.pressed && scrollOffset > 0) {
          scrollOffset -= player.speed;
          platforms.forEach((platform) => {
            platform.position.x += player.speed * 0.66;
          });
          genericObjects.forEach((genericObject) => {
            genericObject.position.x += player.speed * 0.66;
          });
        }
      }

      // ═══════════════════════════════════════════
      //  COLLISIONS + SCORE
      // ═══════════════════════════════════════════
      let onPlatform = false;
      let currentPlatformX: number | null = null;

      platforms.forEach((platform) => {
        if (
          player.position.y + player.height <= platform.position.y &&
          player.position.y + player.height + player.velocity.y >= platform.position.y &&
          player.position.x + player.width >= platform.position.x &&
          player.position.x <= platform.position.x + platform.width
        ) {
          player.velocity.y = 0;
          player.position.y = platform.position.y - player.height;
          onPlatform = true;
          currentPlatformX = platform.position.x;
        }
      });

      // ─── Logique du score ───────────────────────────────────────────────
      if (onPlatform && !wasOnPlatform && currentPlatformX !== null) {
        if (lastPlatformX !== null && currentPlatformX !== lastPlatformX) {
          const oldFlying = isFlyingLevel();
          currentScore += 5;
          const newFlying = isFlyingLevel();
          setScore(currentScore);

          // Détection de transition de niveau
          if (!oldFlying && newFlying) {
            // Transition vers niveau volant
            console.log('🚀 NIVEAU VOLANT ! Score:', currentScore);
          } else if (oldFlying && !newFlying) {
            // Transition vers niveau normal
            console.log('🏠 Retour au niveau normal ! Score:', currentScore);
          }
        }
        lastPlatformX = currentPlatformX;
      }

      wasOnPlatform = onPlatform;

      if (onPlatform) {
        canJump = true;
      }

      if (player.position.y < 0) {
        player.position.y = 0;
        player.velocity.y = 0;
      }

      if (
        keys.right.pressed &&
        lastKey === 'right' &&
        player.currentSprite !== player.sprites.run.right
      ) {
        player.frames = 1;
        player.currentSprite = player.sprites.run.right;
        player.currentCropWidth = player.sprites.run.cropWidth;
        player.width = player.sprites.run.width;
      } else if (
        keys.left.pressed &&
        lastKey === 'left' &&
        player.currentSprite !== player.sprites.run.left
      ) {
        player.currentSprite = player.sprites.run.left;
        player.currentCropWidth = player.sprites.run.cropWidth;
        player.width = player.sprites.run.width;
      } else if (
        !keys.left.pressed &&
        lastKey === 'left' &&
        player.currentSprite !== player.sprites.stand.left
      ) {
        player.currentSprite = player.sprites.stand.left;
        player.currentCropWidth = player.sprites.stand.cropWidth;
        player.width = player.sprites.stand.width;
      } else if (
        !keys.right.pressed &&
        lastKey === 'right' &&
        player.currentSprite !== player.sprites.stand.right
      ) {
        player.currentSprite = player.sprites.stand.right;
        player.currentCropWidth = player.sprites.stand.cropWidth;
        player.width = player.sprites.stand.width;
      }

      if (player.position.y > canvas.height) {
        init();
      }
    }

    // ═══════════════════════════════════════════
    //  KEYDOWN
    // ═══════════════════════════════════════════
    function handleKeyDown({ keyCode }: KeyboardEvent) {
      console.log(keyCode);
      switch (keyCode) {
        case 65:
          console.log('left');
          keys.left.pressed = true;
          lastKey = 'left';
          break;
        case 83:
          console.log('down');
          break;
        case 68:
          console.log('right');
          keys.right.pressed = true;
          lastKey = 'right';
          break;
        case 87:
          console.log('up');
          if (canJump) {
            player.velocity.y -= 25;
            canJump = false;
          }
          break;
      }
    }

    // ═══════════════════════════════════════════
    //  KEYUP
    // ═══════════════════════════════════════════
    function handleKeyUp({ keyCode }: KeyboardEvent) {
      console.log(keyCode);
      switch (keyCode) {
        case 65:
          console.log('left');
          keys.left.pressed = false;
          break;
        case 83:
          console.log('down');
          break;
        case 68:
          console.log('right');
          keys.right.pressed = false;
          break;
        case 87:
          break;
      }
    }

    // ─── Démarrer le jeu ───────────────────────────────────────────────────
    init();
    animate();

    addEventListener('keydown', handleKeyDown);
    addEventListener('keyup', handleKeyUp);

    // ─── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationId);
      removeEventListener('keydown', handleKeyDown);
      removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', preventKeyScroll);
      container.removeEventListener('wheel', preventScroll);
      container.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div
        ref={scoreRef}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          zIndex: 10,
          fontFamily: 'monospace',
        }}
      >
        SCORE: {score}
      </div>
      <canvas ref={canvasRef} className={styles.canvas}></canvas>
    </div>
  );
}