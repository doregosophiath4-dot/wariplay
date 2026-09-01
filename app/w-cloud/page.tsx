'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
)

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const TargetIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const TrophyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface ObstacleData {
  mesh: THREE.Group
  rotationSpeed: number
  type: number
}

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  life: number
  color: string
}

interface Bird {
  mesh: THREE.Group
  baseY: number
  amplitude: number
  frequency: number
  speed: number
}

interface GameObjective {
  type: 'score' | 'time'
  target: number
  description: string
}

function generateRandomObjective(): GameObjective {
  const type = Math.random() > 0.5 ? 'score' : 'time'
  if (type === 'score') {
    const target = Math.floor(Math.random() * 30) + 10
    return { type: 'score', target, description: `Atteignez ${target} points` }
  } else {
    const target = Math.floor(Math.random() * 60) + 30
    return { type: 'time', target, description: `Survivez pendant ${target} secondes` }
  }
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function WCloudPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const effectsCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const balloonGroupRef = useRef<THREE.Group | null>(null)
  const flameRef = useRef<THREE.Mesh | null>(null)
  const starsRef = useRef<THREE.Points | null>(null)

  const gameStateRef = useRef({
    currentLevel: 1,
    obstacleSpawnRate: 1500,
    obstacleSpeed: 0.08,
    balloonSpeed: 0.08,
    maxObstacles: 5,
    score: 0,
    gameOver: false,
    paused: false,
    frameCount: 0,
    lastSpawnTime: 0,
    speedX: 0,
    startTime: 0,
    elapsedBeforePause: 0,
    pauseStart: 0,
    betAmount: 0,
    objective: null as GameObjective | null,
    objectiveMet: false,
    gameStarted: false
  })

  const animFrameRef = useRef(0)
  const cloudsRef = useRef<THREE.Group[]>([])
  const obstaclesRef = useRef<ObstacleData[]>([])
  const particlesRef = useRef<Particle[]>([])
  const birdsRef = useRef<Bird[]>([])
  const resetFnRef = useRef<(() => void) | null>(null)

  const [gamePhase, setGamePhase] = useState<'bet' | 'objective' | 'playing' | 'paused' | 'gameover' | 'victory'>('bet')
  const [score, setScore] = useState(0)
  const [betAmount, setBetAmount] = useState(100)
  const [solde] = useState(5000)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [objective, setObjective] = useState<GameObjective | null>(null)
  const [victoryStats, setVictoryStats] = useState({ score: 0, time: 0, gains: 0 })

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    if (gamePhase !== 'playing') return
    const interval = setInterval(() => {
      const gs = gameStateRef.current
      if (gs.startTime > 0) {
        setElapsedTime(Math.floor((Date.now() - gs.startTime) / 1000))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [gamePhase])

  useEffect(() => {
    if (gamePhase !== 'playing') return
    const gs = gameStateRef.current
    if (!gs.objective || gs.objectiveMet) return

    const checkInterval = setInterval(() => {
      if (gs.objectiveMet || gs.gameOver) {
        clearInterval(checkInterval)
        return
      }

      if (gs.objective.type === 'score' && gs.score >= gs.objective.target) {
        gs.objectiveMet = true
        const gain = gs.betAmount * 2
        setVictoryStats({ score: gs.score, time: Math.floor((Date.now() - gs.startTime) / 1000), gains: gain })
        setGamePhase('victory')
        gs.gameOver = true
      }

      if (gs.objective.type === 'time') {
        const elapsed = Math.floor((Date.now() - gs.startTime) / 1000)
        if (elapsed >= gs.objective.target) {
          gs.objectiveMet = true
          const gain = gs.betAmount * 2
          setVictoryStats({ score: gs.score, time: elapsed, gains: gain })
          setGamePhase('victory')
          gs.gameOver = true
        }
      }
    }, 500)

    return () => clearInterval(checkInterval)
  }, [gamePhase])

  /* ═══════════════════════════════════════════
     INIT SCENE
     ═══════════════════════════════════════════ */

  useEffect(() => {
    if (!containerRef.current || !threeCanvasRef.current || !effectsCanvasRef.current) return
    const gs = gameStateRef.current

    const effectsCanvas = effectsCanvasRef.current
    effectsCanvas.width = window.innerWidth
    effectsCanvas.height = window.innerHeight
    const ctx = effectsCanvas.getContext('2d')!

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a2980)
    scene.fog = new THREE.FogExp2(0x1a2980, 0.008)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, -8, 12)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      canvas: threeCanvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    rendererRef.current = renderer

    setLoadingProgress(10)

    /* ── LIGHTS ── */
    scene.add(new THREE.AmbientLight(0xffeedd, 0.6))

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2)
    sunLight.position.set(15, 25, 20)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 80
    sunLight.shadow.camera.left = -20
    sunLight.shadow.camera.right = 20
    sunLight.shadow.camera.top = 20
    sunLight.shadow.camera.bottom = -20
    sunLight.shadow.bias = -0.0001
    scene.add(sunLight)

    const fillLight = new THREE.DirectionalLight(0x88ccff, 0.4)
    fillLight.position.set(-20, 10, 15)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xff8866, 0.3)
    rimLight.position.set(0, -5, 25)
    scene.add(rimLight)

    setLoadingProgress(25)

    /* ── SKY ── */
    const skyGeom = new THREE.SphereGeometry(500, 32, 32)
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x1a2980) },
        bottomColor: { value: new THREE.Color(0x26d0ce) },
        offset: { value: 5 },
        exponent: { value: 0.6 }
      },
      vertexShader: `varying vec3 vWorldPosition;void main(){vec4 wp=modelMatrix*vec4(position,1.0);vWorldPosition=wp.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `uniform vec3 topColor,bottomColor;uniform float offset,exponent;varying vec3 vWorldPosition;void main(){float h=normalize(vWorldPosition+offset).y;gl_FragColor=vec4(mix(bottomColor,topColor,max(pow(max(h,0.0),exponent),0.0)),1.0);}`,
      side: THREE.BackSide
    })
    scene.add(new THREE.Mesh(skyGeom, skyMat))

    /* ── SUN ── */
    const sunGroup = new THREE.Group()
    const sunCoreGeom = new THREE.SphereGeometry(8, 32, 32)
    const sunCore = new THREE.Mesh(sunCoreGeom, new THREE.MeshBasicMaterial({ color: 0xffdd88 }))
    sunGroup.add(sunCore)

    const sunGlowGeom = new THREE.SphereGeometry(10, 32, 32)
    const sunGlow = new THREE.Mesh(sunGlowGeom, new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `varying vec3 vNormal;varying vec3 vPosition;void main(){vNormal=normalize(normalMatrix*normal);vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `varying vec3 vNormal;varying vec3 vPosition;void main(){float intensity=pow(0.65-dot(vNormal,vec3(0,0,1)),3.0);gl_FragColor=vec4(1.0,0.9,0.5,1.0)*intensity;}`,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    }))
    sunGroup.add(sunGlow)
    sunGroup.position.set(100, 120, -200)
    scene.add(sunGroup)

    /* ── STARS ── */
    const starsGeom = new THREE.BufferGeometry()
    const starsCount = 6000
    const posArr = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI * 0.5
      const r = 450 + Math.random() * 50
      posArr[i] = r * Math.sin(phi) * Math.cos(theta)
      posArr[i + 1] = r * Math.sin(phi) * Math.sin(theta) + 50
      posArr[i + 2] = r * Math.cos(phi)
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
    const stars = new THREE.Points(starsGeom, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.6, sizeAttenuation: true,
      blending: THREE.AdditiveBlending, depthWrite: false
    }))
    scene.add(stars)
    starsRef.current = stars

    setLoadingProgress(40)

    /* ── BALLOON ── */
    const balloonGroup = new THREE.Group()
    balloonGroupRef.current = balloonGroup

    const bGeom = new THREE.SphereGeometry(1, 48, 48)
    const bMat = new THREE.MeshStandardMaterial({ color: 0xe83030, roughness: 0.3, metalness: 0.05 })
    const balloonMesh = new THREE.Mesh(bGeom, bMat)
    balloonMesh.castShadow = true
    balloonMesh.receiveShadow = true
    balloonGroup.add(balloonMesh)

    for (let i = 0; i < 8; i++) {
      const sGeom = new THREE.TorusGeometry(1.01, 0.04, 8, 48, Math.PI * 0.3)
      const sMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 })
      const stripe = new THREE.Mesh(sGeom, sMat)
      stripe.rotation.x = Math.PI / 2
      stripe.rotation.z = (i / 8) * Math.PI * 2
      stripe.position.y = Math.sin(i * 0.8) * 0.5
      balloonGroup.add(stripe)
    }

    const basketGeom = new THREE.BoxGeometry(0.6, 0.4, 0.6)
    const basketMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7, metalness: 0.05 })
    const basket = new THREE.Mesh(basketGeom, basketMat)
    basket.position.set(0, -1.7, 0)
    basket.castShadow = true
    basket.receiveShadow = true
    balloonGroup.add(basket)

    for (let i = -0.3; i <= 0.3; i += 0.2) {
      const ropeGeom = new THREE.CylinderGeometry(0.02, 0.02, 1, 8)
      const rope = new THREE.Mesh(ropeGeom, new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 }))
      rope.position.set(i, -0.9, 0)
      rope.rotation.z = i * 1.5
      balloonGroup.add(rope)
    }

    const burnerGeom = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 16)
    const burner = new THREE.Mesh(burnerGeom, new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.4, metalness: 0.8 }))
    burner.position.set(0, -1.7, 0)
    balloonGroup.add(burner)

    const flameGeom = new THREE.ConeGeometry(0.2, 0.5, 16)
    const flame = new THREE.Mesh(flameGeom, new THREE.MeshStandardMaterial({
      color: 0xff4500, emissive: 0xff2200, emissiveIntensity: 1.5, roughness: 0.2
    }))
    flame.position.set(0, -1.9, 0)
    flame.rotation.x = Math.PI
    balloonGroup.add(flame)
    flameRef.current = flame

    const glowGeom = new THREE.SphereGeometry(0.35, 16, 16)
    const glow = new THREE.Mesh(glowGeom, new THREE.MeshBasicMaterial({
      color: 0xff6600, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, depthWrite: false
    }))
    glow.position.set(0, -1.75, 0)
    balloonGroup.add(glow)

    scene.add(balloonGroup)

    setLoadingProgress(55)

    /* ── GROUND ── */
    const groundGeom = new THREE.PlaneGeometry(200, 200, 50, 50)
    const ground = new THREE.Mesh(groundGeom, new THREE.MeshStandardMaterial({
      color: 0x3cb371, roughness: 0.8, side: THREE.DoubleSide
    }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -15
    ground.receiveShadow = true
    scene.add(ground)

    /* ── TREES ── */
    for (let i = 0; i < 15; i++) {
      const treeGroup = new THREE.Group()
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 2 + Math.random() * 3, 8),
        new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 })
      )
      trunk.position.y = 1
      trunk.castShadow = true
      treeGroup.add(trunk)

      const foliage = new THREE.Mesh(
        new THREE.ConeGeometry(0.8 + Math.random() * 0.6, 2 + Math.random() * 2, 12),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.25 + Math.random() * 0.15, 0.6, 0.3 + Math.random() * 0.2),
          roughness: 0.7
        })
      )
      foliage.position.y = 2.5 + Math.random()
      foliage.castShadow = true
      treeGroup.add(foliage)

      treeGroup.position.set((Math.random() - 0.5) * 160, -13, (Math.random() - 0.5) * 160)
      scene.add(treeGroup)
    }

    setLoadingProgress(70)

    /* ── HELPERS ── */
    function createCloud() {
      const cg = new THREE.Group()
      for (let i = 0; i < 8; i++) {
        const sz = 0.3 + Math.random() * 0.5
        const cp = new THREE.Mesh(
          new THREE.SphereGeometry(sz, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, transparent: true, opacity: 0.85 + Math.random() * 0.1 })
        )
        cp.position.set((Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 2.5)
        cp.castShadow = true
        cp.receiveShadow = true
        cg.add(cp)
      }
      cg.position.set((Math.random() - 0.5) * 50, balloonGroup.position.y + 15 + Math.random() * 25, -5 - Math.random() * 8)
      scene.add(cg)
      cloudsRef.current.push(cg)
    }

    function createBird() {
      const bg = new THREE.Group()
      const bodyGeom = new THREE.SphereGeometry(0.25, 16, 12)
      bodyGeom.scale(1, 0.7, 1.5)
      const bodyMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.1, 0.3, 0.2 + Math.random() * 0.3),
        roughness: 0.5
      })
      const body = new THREE.Mesh(bodyGeom, bodyMat)
      body.castShadow = true
      bg.add(body)

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), bodyMat)
      head.position.set(0, 0.2, 0.35)
      bg.add(head)

      const wingGeom = new THREE.BoxGeometry(0.8, 0.05, 0.2)
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 })
      const leftWing = new THREE.Mesh(wingGeom, wingMat)
      leftWing.position.set(-0.4, 0.05, 0)
      bg.add(leftWing)
      const rightWing = new THREE.Mesh(wingGeom, wingMat)
      rightWing.position.set(0.4, 0.05, 0)
      bg.add(rightWing)

      bg.position.set((Math.random() - 0.5) * 30, 10 + Math.random() * 20, -2 - Math.random() * 4)
      scene.add(bg)
      birdsRef.current.push({
        mesh: bg,
        baseY: bg.position.y,
        amplitude: 1 + Math.random() * 2,
        frequency: 0.01 + Math.random() * 0.02,
        speed: 0.02 + Math.random() * 0.04
      })
    }

    function createObstacle() {
      const og = new THREE.Group()
      const t = Math.floor(Math.random() * 4)
      let geom: THREE.BufferGeometry
      let mat: THREE.MeshStandardMaterial

      if (t === 0) {
        geom = new THREE.ConeGeometry(0.5, 1.5, 16)
        mat = new THREE.MeshStandardMaterial({ color: 0x4169e1, roughness: 0.3, metalness: 0.6 })
      } else if (t === 1) {
        geom = new THREE.BoxGeometry(1, 0.3, 1)
        mat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.4, metalness: 0.7 })
      } else if (t === 2) {
        geom = new THREE.ConeGeometry(0.4, 1.2, 6)
        mat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.9 })
        og.rotation.x = Math.PI / 2
      } else {
        geom = new THREE.SphereGeometry(0.7, 32, 32)
        mat = new THREE.MeshStandardMaterial({
          color: 0xff6347, roughness: 0.3, metalness: 0.4,
          emissive: 0x331111, emissiveIntensity: 0.3
        })
      }

      const obs = new THREE.Mesh(geom, mat)
      obs.castShadow = true
      obs.receiveShadow = true
      og.add(obs)

      const pc = 6 + Math.floor(gs.currentLevel / 2)
      for (let i = 0; i < pc; i++) {
        const pMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          new THREE.MeshBasicMaterial({
            color: 0x00ff88, transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending, depthWrite: false
          })
        )
        pMesh.position.set(Math.cos((i / pc) * Math.PI * 2) * 1.3, Math.sin((i / pc) * Math.PI * 2) * 0.7, 0)
        og.add(pMesh)
      }

      og.position.set(
        (Math.random() - 0.5) * (10 + gs.currentLevel * 0.5),
        balloonGroup.position.y + 20 + Math.random() * 15,
        0
      )
      scene.add(og)
      obstaclesRef.current.push({
        mesh: og,
        rotationSpeed: (Math.random() - 0.5) * (0.02 + gs.currentLevel * 0.005),
        type: t
      })
    }

    function createParticle(): Particle {
      return {
        x: balloonGroup.position.x + (Math.random() - 0.5) * 0.8,
        y: balloonGroup.position.y - 1.5,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 0.7 + 0.3,
        life: 1,
        color: `hsl(${Math.random() * 30 + 15}, 100%, 55%)`
      }
    }

    function updateDifficulty() {
      const nl = Math.floor(gs.score / 10) + 1
      if (nl > gs.currentLevel) {
        gs.currentLevel = nl
        gs.obstacleSpawnRate = Math.max(300, 1500 - nl * 120)
        gs.obstacleSpeed = 0.08 + nl * 0.02
        gs.balloonSpeed = 0.08 + nl * 0.01
        gs.maxObstacles = Math.min(20, 5 + nl * 2)
        for (let i = 0; i < 20; i++) {
          particlesRef.current.push({
            x: balloonGroup.position.x, y: balloonGroup.position.y,
            size: Math.random() * 8 + 4, speed: Math.random() * 1.5 + 0.5,
            life: 1.5, color: `hsl(${Math.random() * 60 + 200}, 100%, 50%)`
          })
        }
      }
    }

    function checkCollision(obsGroup: THREE.Group): boolean {
      const obs = obsGroup.children[0]
      if (!obs) return false

      const obsWorldPos = new THREE.Vector3()
      obs.getWorldPosition(obsWorldPos)

      const balloonWorldPos = new THREE.Vector3()
      balloonGroup.getWorldPosition(balloonWorldPos)

      const dx = balloonWorldPos.x - obsWorldPos.x
      const dy = balloonWorldPos.y - obsWorldPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      const balloonRadius = 1.0

      let obsRadius = 0.5
      if (obs instanceof THREE.Mesh) {
        const geom = obs.geometry
        if (geom instanceof THREE.SphereGeometry) {
          obsRadius = (geom.parameters as any).radius || 0.7
        } else if (geom instanceof THREE.ConeGeometry) {
          obsRadius = (geom.parameters as any).radius || 0.5
        } else if (geom instanceof THREE.BoxGeometry) {
          const params = geom.parameters as any
          obsRadius = Math.max(params.width || 1, params.depth || 1) / 2
        }
      }

      const collisionMargin = 0.3
      const collisionThreshold = balloonRadius + obsRadius - collisionMargin

      return distance < collisionThreshold
    }

    function gameOverFn() {
      if (gs.gameOver) return
      gs.gameOver = true
      setGamePhase('gameover')
      for (let j = 0; j < 30; j++) {
        particlesRef.current.push({
          x: balloonGroup.position.x, y: balloonGroup.position.y,
          size: Math.random() * 6 + 3, speed: Math.random() * 2 + 1,
          life: 1, color: `hsl(${Math.random() * 60}, 100%, 50%)`
        })
      }
    }

    /* ── RESET ── */
    function resetGame() {
      obstaclesRef.current.forEach(o => scene.remove(o.mesh))
      obstaclesRef.current = []
      particlesRef.current = []
      cloudsRef.current.forEach(c => scene.remove(c))
      cloudsRef.current = []
      birdsRef.current.forEach(b => scene.remove(b.mesh))
      birdsRef.current = []

      gs.score = 0
      gs.currentLevel = 1
      gs.obstacleSpawnRate = 1500
      gs.obstacleSpeed = 0.08
      gs.balloonSpeed = 0.08
      gs.maxObstacles = 5
      gs.gameOver = false
      gs.paused = false
      gs.frameCount = 0
      gs.lastSpawnTime = Date.now()
      gs.speedX = 0
      gs.startTime = 0
      gs.elapsedBeforePause = 0
      gs.pauseStart = 0
      gs.objective = null
      gs.objectiveMet = false
      gs.gameStarted = false

      balloonGroup.position.set(0, 0, 0)
      balloonGroup.rotation.set(0, 0, 0)
      camera.position.set(0, -8, 12)

      setScore(0)
      setElapsedTime(0)
      setObjective(null)

      for (let i = 0; i < 12; i++) createCloud()
      for (let i = 0; i < 5; i++) createBird()

      setTimeout(() => {
        for (let i = 0; i < 3; i++) setTimeout(() => createObstacle(), i * 800)
      }, 1500)
    }

    resetFnRef.current = resetGame

    /* ── GAME LOOP ── */
    function animate() {
      animFrameRef.current = requestAnimationFrame(animate)

      if (!gs.gameStarted) {
        renderer.render(scene, camera)
        return
      }

      if (!gs.gameOver && !gs.paused) {
        gs.frameCount++

        balloonGroup.position.y += gs.balloonSpeed
        balloonGroup.position.x += gs.speedX
        balloonGroup.position.x = Math.max(-8, Math.min(8, balloonGroup.position.x))
        balloonGroup.rotation.z = Math.sin(gs.frameCount * 0.02) * 0.05
        balloonGroup.rotation.x = Math.sin(gs.frameCount * 0.015) * 0.03
        if (flame) flame.scale.y = 0.8 + Math.sin(gs.frameCount * 0.2) * 0.3

        camera.position.y = balloonGroup.position.y - 8
        camera.lookAt(balloonGroup.position.x, balloonGroup.position.y, 0)

        if (Math.random() < 0.4) particlesRef.current.push(createParticle())

        ctx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height)
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i]
          p.y -= p.speed
          p.life -= 0.015
          if (p.life <= 0) { particlesRef.current.splice(i, 1); continue }
          const v = new THREE.Vector3(p.x, p.y, 0).project(camera)
          const sx = (v.x * 0.5 + 0.5) * effectsCanvas.width
          const sy = -(v.y * 0.5 - 0.5) * effectsCanvas.height
          ctx.beginPath(); ctx.arc(sx, sy, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('hsl', 'hsla'); ctx.fill()
          ctx.beginPath(); ctx.arc(sx, sy + p.size, p.size * 0.7, 0, Math.PI * 2)
          ctx.fillStyle = p.color.replace(')', `, ${p.life * 0.3})`).replace('hsl', 'hsla'); ctx.fill()
        }

        birdsRef.current.forEach(b => {
          b.mesh.position.x += Math.sin(gs.frameCount * b.speed) * 0.05
          b.mesh.position.y = b.baseY + Math.sin(gs.frameCount * b.frequency) * b.amplitude
          b.mesh.rotation.z = Math.sin(gs.frameCount * b.speed * 0.5) * 0.3
          b.mesh.rotation.x = Math.cos(gs.frameCount * b.speed * 0.3) * 0.15
        })

        const now = Date.now()
        if (now - gs.lastSpawnTime > gs.obstacleSpawnRate && obstaclesRef.current.length < gs.maxObstacles) {
          createObstacle()
          gs.lastSpawnTime = now
        }

        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const o = obstaclesRef.current[i]
          o.mesh.rotation.y += o.rotationSpeed
          o.mesh.position.y -= gs.obstacleSpeed

          const hasCollision = checkCollision(o.mesh)

          if (hasCollision) {
            gameOverFn()
            break
          }

          if (o.mesh.position.y < balloonGroup.position.y - 15) {
            scene.remove(o.mesh)
            obstaclesRef.current.splice(i, 1)
            gs.score++
            setScore(gs.score)
            updateDifficulty()
          }
        }

        for (let i = cloudsRef.current.length - 1; i >= 0; i--) {
          if (cloudsRef.current[i].position.y < balloonGroup.position.y - 20) {
            scene.remove(cloudsRef.current[i])
            cloudsRef.current.splice(i, 1)
            createCloud()
          }
        }

        if (stars) stars.rotation.y += 0.0001
      }

      renderer.render(scene, camera)
    }

    /* ── PREPARE GAME ── */
    function prepareGame() {
      const obj = generateRandomObjective()
      gs.betAmount = betAmount
      gs.objective = obj
      gs.objectiveMet = false
      gs.lastSpawnTime = Date.now()
      gs.gameOver = false
      gs.paused = false
      gs.frameCount = 0
      gs.speedX = 0
      gs.gameStarted = false

      balloonGroup.position.set(0, 0, 0)
      camera.position.set(0, -8, 12)

      setObjective(obj)
      setGamePhase('objective')
      setScore(0)
      setElapsedTime(0)

      for (let i = 0; i < 12; i++) createCloud()
      for (let i = 0; i < 5; i++) createBird()
    }

    /* ── LAUNCH GAME ── */
    function launchGame() {
      gs.gameStarted = true
      gs.startTime = Date.now()
      gs.lastSpawnTime = Date.now()

      setGamePhase('playing')

      setTimeout(() => {
        for (let i = 0; i < 3; i++) setTimeout(() => createObstacle(), i * 800)
      }, 1500)
    }

    ;(window as any).__wcloudPrepare = prepareGame
    ;(window as any).__wcloudLaunch = launchGame

    setLoadingProgress(100)

    setTimeout(() => {
      setLoadingProgress(101)
      gs.lastSpawnTime = Date.now()
      animFrameRef.current = requestAnimationFrame(animate)
    }, 500)

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      effectsCanvas.width = window.innerWidth
      effectsCanvas.height = window.innerHeight
    })

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', () => {})
      renderer.dispose()
    }
  }, [])

  /* ── KEYBOARD ── */
  useEffect(() => {
    const gs = gameStateRef.current
    const kd = (e: KeyboardEvent) => {
      if (gs.gameOver || gs.paused) return
      if (e.key === 'ArrowLeft' || e.key === 'a') gs.speedX = -0.25
      if (e.key === 'ArrowRight' || e.key === 'd') gs.speedX = 0.25
      if (e.key === 'Escape' || e.key === 'p') { pauseGame() }
    }
    const ku = () => { gs.speedX = 0 }
    document.addEventListener('keydown', kd)
    document.addEventListener('keyup', ku)
    return () => {
      document.removeEventListener('keydown', kd)
      document.removeEventListener('keyup', ku)
    }
  }, [])

  /* ── TOUCH ── */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const gs = gameStateRef.current
    if (gs.gameOver || gs.paused) return
    if (e.touches.length > 0) {
      gs.speedX = (e.touches[0].clientX / window.innerWidth - 0.5) * 0.5
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    const gs = gameStateRef.current
    if (!gs.paused) gs.speedX = 0
  }, [])

  /* ── ACTIONS ── */
  const pauseGame = useCallback(() => {
    const gs = gameStateRef.current
    if (gs.gameOver || gs.paused) return
    gs.paused = true
    gs.pauseStart = Date.now()
    setGamePhase('paused')
  }, [])

  const resumeGame = useCallback(() => {
    const gs = gameStateRef.current
    if (!gs.paused) return
    gs.paused = false
    if (gs.pauseStart > 0) {
      gs.elapsedBeforePause += Date.now() - gs.pauseStart
    }
    gs.pauseStart = 0
    setGamePhase('playing')
  }, [])

  const handleStartBet = useCallback(() => {
    const prepareFn = (window as any).__wcloudPrepare
    if (prepareFn) prepareFn()
  }, [])

  const handleLaunchGame = useCallback(() => {
    const launchFn = (window as any).__wcloudLaunch
    if (launchFn) launchFn()
  }, [])

  const handleRestart = useCallback(() => {
    if (resetFnRef.current) resetFnRef.current()
    setGamePhase('bet')
    setBetAmount(100)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div
      ref={containerRef}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="fixed inset-0 overflow-hidden bg-gradient-to-b from-[#1a2980] to-[#26d0ce] font-['Arial_Rounded_MT_Bold','Segoe_UI',sans-serif] perspective-[1000px] touch-none"
    >
      <canvas ref={effectsCanvasRef} className="absolute inset-0 z-[5] pointer-events-none" />
      <canvas ref={threeCanvasRef} className="absolute inset-0 z-[1] pointer-events-none" />

      <div className="absolute inset-0 z-[100] text-white">

        {/* Loading Screen */}
        {loadingProgress <= 100 && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a2980] to-[#26d0ce] flex flex-col justify-center items-center z-[300]">
            <h2 className="text-2xl sm:text-3xl mb-5 text-center">Chargement de l&apos;aventure...</h2>
            <div className="w-[300px] h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-full transition-all duration-300" style={{ width: `${Math.min(loadingProgress, 100)}%` }} />
            </div>
          </div>
        )}

        {/* Bet Popup */}
        {gamePhase === 'bet' && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200]">
            <div className="bg-gradient-to-br from-[#1a2980]/95 to-[#26d0ce]/90 rounded-3xl p-8 sm:p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-2 border-white/30 max-w-[400px] w-[90%]">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">Placez votre mise</h2>

              <div className="flex justify-between mb-3 text-base text-white/80">
                <span>Solde disponible</span>
                <span className="font-bold text-yellow-400">{solde.toLocaleString()} XOF</span>
              </div>
              <div className="flex justify-between mb-4 text-base text-white/80">
                <span>Vies</span>
                <span className="font-bold text-red-400">3</span>
              </div>

              <input
                type="number"
                className="w-full py-3.5 px-4 rounded-xl border-2 border-white/30 bg-white/10 text-white text-xl text-center my-4 outline-none focus:border-yellow-400 font-inherit"
                value={betAmount}
                min={100}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 100
                  setBetAmount(Math.max(100, v))
                }}
                placeholder="Mise minimale 100 XOF"
              />

              <button
                onClick={handleStartBet}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white border-none rounded-full text-2xl font-bold cursor-pointer mt-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <PlayIcon />
                JOUER
              </button>

              <p className="text-sm text-white/50 mt-2.5">Mise minimum : 100 XOF</p>
            </div>
          </div>
        )}

        {/* Objective Popup */}
        {gamePhase === 'objective' && objective && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200]">
            <div className="bg-gradient-to-br from-[#1a2980]/95 to-[#26d0ce]/90 rounded-3xl p-8 sm:p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-2 border-white/30 max-w-[400px] w-[90%]">
              <div className="flex justify-center mb-4">
                <TargetIcon />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">Votre Objectif</h2>

              <div className="bg-yellow-400/10 border-2 border-yellow-400/30 rounded-2xl p-5 my-4">
                <p className="text-xl sm:text-2xl font-bold text-yellow-400 mb-2.5">{objective.description}</p>
                <p className="text-sm text-white/60">
                  Mise : {gameStateRef.current.betAmount} XOF — Gains potentiels : {(gameStateRef.current.betAmount * 2).toLocaleString()} XOF
                </p>
              </div>

              <button
                onClick={handleLaunchGame}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white border-none rounded-full text-2xl font-bold cursor-pointer mt-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <PlayIcon />
                COMMENCER
              </button>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {gamePhase === 'paused' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[200]">
            <div className="bg-gradient-to-br from-[#1a2980]/95 to-[#26d0ce]/90 rounded-3xl p-7 sm:p-9 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-2 border-white/30 max-w-[420px] w-[90%]">
              <div className="flex justify-center mb-4">
                <PauseIcon />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">Pause</h2>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Solde', value: `${solde.toLocaleString()} XOF`, icon: <WalletIcon /> },
                  { label: 'Score', value: score.toString(), icon: <StarIcon /> },
                  { label: 'Temps de jeu', value: formatTime(elapsedTime), icon: <ClockIcon /> },
                  { label: 'Mise', value: `${gameStateRef.current.betAmount} XOF`, icon: <CoinsIcon /> },
                  { label: 'Vies', value: '3', icon: <HeartIcon /> }
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.08] rounded-xl py-3 px-3 text-center">
                    <span className="block text-xs text-white/60 mb-1 flex items-center justify-center gap-1.5">
                      {item.icon}
                      {item.label}
                    </span>
                    <span className="block text-lg font-bold">{item.value}</span>
                  </div>
                ))}
                {objective && (
                  <div className="col-span-2 bg-white/[0.08] rounded-xl py-3 px-3 text-center">
                    <span className="block text-xs text-white/60 mb-1">Objectif</span>
                    <span className="block text-base font-bold text-yellow-400">{objective.description}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={resumeGame}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-none rounded-full text-lg font-bold cursor-pointer hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <PlayIcon />
                  Reprendre
                </button>
                <button
                  onClick={() => setShowRules(true)}
                  className="w-full py-3 bg-transparent text-white border-2 border-white/30 rounded-full text-base cursor-pointer hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <BookIcon />
                  Regles
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over */}
        {gamePhase === 'gameover' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-pink-600/92 to-purple-600/92 text-white py-10 px-12 sm:px-16 rounded-3xl text-center z-[200] shadow-[0_15px_35px_rgba(0,0,0,0.5)] border-4 border-white/60 backdrop-blur-xl animate-pulse">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Game Over !</h2>
            <p className="text-xl sm:text-2xl mb-1">Votre score : <span className="font-bold">{score}</span></p>
            {objective && <p className="text-base sm:text-lg mt-2.5">Objectif : {objective.description}</p>}
            <button
              onClick={handleRestart}
              className="bg-gradient-to-r from-orange-500 to-pink-600 text-white border-none py-4 px-8 mt-5 rounded-full cursor-pointer text-xl font-bold shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshIcon />
              VOLER A NOUVEAU
            </button>
          </div>
        )}

        {/* Victory */}
        {gamePhase === 'victory' && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200]">
            <div className="bg-gradient-to-br from-[#1a2980]/95 to-[#26d0ce]/90 rounded-3xl p-8 sm:p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-2 border-white/30 max-w-[400px] w-[90%]">
              <div className="flex justify-center mb-4">
                <TrophyIcon />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Felicitations !</h2>
              <p className="text-base text-white/80 mb-5">Objectif atteint ! Votre mise est doublee.</p>

              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="bg-white/[0.08] rounded-xl py-3.5 px-4 text-center">
                  <span className="block text-xs text-white/60 mb-1">Score</span>
                  <span className="block text-xl font-bold">{victoryStats.score}</span>
                </div>
                <div className="bg-white/[0.08] rounded-xl py-3.5 px-4 text-center">
                  <span className="block text-xs text-white/60 mb-1">Temps de jeu</span>
                  <span className="block text-xl font-bold">{formatTime(victoryStats.time)}</span>
                </div>
                <div className="col-span-2 bg-white/[0.08] rounded-xl py-3.5 px-4 text-center">
                  <span className="block text-xs text-white/60 mb-1">Gains</span>
                  <span className="block text-2xl font-bold text-yellow-400">{victoryStats.gains.toLocaleString()} XOF</span>
                </div>
              </div>

              <button
                onClick={handleRestart}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white border-none rounded-full text-2xl font-bold cursor-pointer mt-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RefreshIcon />
                REJOUER
              </button>
            </div>
          </div>
        )}

        {/* Rules Modal */}
        {showRules && (
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[400]"
            onClick={() => setShowRules(false)}
          >
            <div
              className="bg-gradient-to-br from-[#1a2980]/98 to-[#26d0ce]/95 rounded-3xl p-6 sm:p-8 max-w-[450px] w-[90%] max-h-[80vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-2 border-white/30"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-center">Regles du jeu</h2>

              <div className="text-white/80 space-y-4 text-sm sm:text-base">
                <div>
                  <h3 className="text-yellow-400 text-lg font-bold mb-2">Objectif</h3>
                  <p>Evitez les obstacles et atteignez l&apos;objectif (score ou temps) pour doubler votre mise.</p>
                </div>
                <div>
                  <h3 className="text-yellow-400 text-lg font-bold mb-2">Controles</h3>
                  <p><strong className="text-white">Desktop :</strong> Fleches ou touches A / D</p>
                  <p><strong className="text-white">Mobile :</strong> Glissez votre doigt sur l&apos;ecran</p>
                  <p><strong className="text-white">Pause :</strong> Touche Echap ou P</p>
                </div>
                <div>
                  <h3 className="text-yellow-400 text-lg font-bold mb-2">Obstacles</h3>
                  <p>Evitez les cones, boites, pyramides et spheres. Chaque obstacle evite = 1 point.</p>
                </div>
                <div>
                  <h3 className="text-yellow-400 text-lg font-bold mb-2">Objectifs</h3>
                  <p>Un objectif aleatoire vous est assigne. Si vous l&apos;atteignez, votre mise est doublee. Sinon, c&apos;est Game Over.</p>
                </div>
              </div>

              <button
                onClick={() => setShowRules(false)}
                className="w-full mt-6 py-3.5 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-none rounded-full text-lg font-bold cursor-pointer hover:-translate-y-0.5 transition-all duration-300"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Pause Float Button */}
        {gamePhase === 'playing' && (
          <button
            onClick={pauseGame}
            className="absolute top-5 right-5 w-12 h-12 rounded-full bg-black/40 border-2 border-white/30 text-white text-2xl cursor-pointer z-[150] backdrop-blur-md hover:bg-black/60 hover:scale-110 transition-all duration-300 flex items-center justify-center"
          >
            <PauseIcon />
          </button>
        )}

        {/* Mobile Instructions */}
        {gamePhase === 'playing' && isMobile && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-base py-3 px-6 z-[100] bg-black/50 rounded-2xl backdrop-blur-md border border-white/20 text-white pointer-events-none">
            Glissez votre doigt pour diriger le ballon
          </div>
        )}
      </div>
    </div>
  )
}