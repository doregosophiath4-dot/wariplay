'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const CoinsIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const TargetIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 drop-shadow-[0_0_15px_rgba(232,121,249,0.5)]">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const ScrollIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
)

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const TrophyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-500 drop-shadow-[0_0_6px_rgba(255,51,102,0.5)]">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const GamepadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 drop-shadow-[0_0_6px_rgba(232,121,249,0.4)]">
    <line x1="6" y1="11" x2="10" y2="11" />
    <line x1="8" y1="9" x2="8" y2="13" />
    <line x1="15" y1="12" x2="15.01" y2="12" />
    <line x1="18" y1="10" x2="18.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
)

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 drop-shadow-[0_0_6px_rgba(232,121,249,0.4)]">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 drop-shadow-[0_0_6px_rgba(232,121,249,0.4)]">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

/* ═══════════════════════════════════════════
   BOX CLASS — MOTEUR ORIGINAL
   ═══════════════════════════════════════════ */

interface BoxParams {
  width: number
  height: number
  depth: number
  color?: string
  velocity?: { x: number; y: number; z: number }
  position?: { x: number; y: number; z: number }
  zAcceleration?: boolean
}

class Box extends THREE.Mesh {
  width: number
  height: number
  depth: number
  right: number = 0
  left: number = 0
  bottom: number = 0
  top: number = 0
  front: number = 0
  back: number = 0
  velocity: { x: number; y: number; z: number }
  gravity: number = -0.002
  zAcceleration: boolean
  light?: THREE.PointLight

  constructor({ width, height, depth, color = '#00ff00', velocity = { x: 0, y: 0, z: 0 }, position = { x: 0, y: 0, z: 0 }, zAcceleration = false }: BoxParams) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color })
    )
    this.width = width
    this.height = height
    this.depth = depth
    this.position.set(position.x, position.y, position.z)
    this.right = this.position.x + this.width / 2
    this.left = this.position.x - this.width / 2
    this.bottom = this.position.y - this.height / 2
    this.top = this.position.y + this.height / 2
    this.front = this.position.z + this.depth / 2
    this.back = this.position.z - this.depth / 2
    this.velocity = velocity
    this.gravity = -0.002
    this.zAcceleration = zAcceleration
  }

  updateSides() {
    this.right = this.position.x + this.width / 2
    this.left = this.position.x - this.width / 2
    this.bottom = this.position.y - this.height / 2
    this.top = this.position.y + this.height / 2
    this.front = this.position.z + this.depth / 2
    this.back = this.position.z - this.depth / 2
  }

  update(ground: Box) {
    this.updateSides()
    if (this.zAcceleration) this.velocity.z += 0.0003
    this.position.x += this.velocity.x
    this.position.z += this.velocity.z
    this.applyGravity(ground)
  }

  applyGravity(ground: Box) {
    this.velocity.y += this.gravity
    if (boxCollision({ box1: this, box2: ground })) {
      const friction = 0.5
      this.velocity.y *= friction
      this.velocity.y = -this.velocity.y
      if (Math.abs(this.velocity.y) < 0.05) this.velocity.y = 0
    } else {
      this.position.y += this.velocity.y
    }
  }
}

function boxCollision({ box1, box2 }: { box1: Box; box2: Box }): boolean {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right
  const yCollision = box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom
  const zCollision = box1.front >= box2.back && box1.back <= box2.front
  return xCollision && yCollision && zCollision
}

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface Objective {
  type: 'score' | 'time' | 'score_no_life' | 'time_no_life'
  description: string
  targetScore?: number
  targetTime?: number
  maxLivesToLose?: number
  rewardText: string
}

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const INITIAL_BALANCE = 5000
const INITIAL_LIVES = 3
const MIN_BET = 100
const GROUND_Y = -2
const VOID_Y = -10

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function Endless() {
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameTime, setGameTime] = useState(0)
  const [lives, setLives] = useState(INITIAL_LIVES)

  const [showOverlay, setShowOverlay] = useState(true)
  const [overlayEye, setOverlayEye] = useState('— READY —')
  const [overlayTitle, setOverlayTitle] = useState('ENDLESS')
  const [overlaySub, setOverlaySub] = useState('')
  const [showScoreRow, setShowScoreRow] = useState(false)
  const [btnText, setBtnText] = useState('JOUER')

  const [showBetPopup, setShowBetPopup] = useState(true)
  const [showObjectivePopup, setShowObjectivePopup] = useState(false)
  const [showRulesPopup, setShowRulesPopup] = useState(false)
  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [currentBet, setCurrentBet] = useState(MIN_BET)
  const [currentObjective, setCurrentObjective] = useState<Objective | null>(null)
  const [objectiveCompleted, setObjectiveCompleted] = useState(false)
  const [objectiveFailed, setObjectiveFailed] = useState(false)
  const [isBetLoading, setIsBetLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const groundRef = useRef<Box | null>(null)
  const gridHelperRef = useRef<THREE.GridHelper | null>(null)
  const edgesRef = useRef<THREE.Mesh[]>([])
  const starsRef = useRef<THREE.Points | null>(null)
  const pinkLightRef = useRef<THREE.PointLight | null>(null)
  const cyanLightRef = useRef<THREE.PointLight | null>(null)
  const cubeRef = useRef<Box | null>(null)
  const enemiesRef = useRef<Box[]>([])
  const framesRef = useRef(0)
  const spawnRateRef = useRef(200)
  const scoreRef = useRef(0)
  const bestScoreRef = useRef(0)
  const livesRef = useRef(INITIAL_LIVES)
  const gameRunningRef = useRef(false)
  const animationIdRef = useRef<number | null>(null)
  const keysRef = useRef({ a: false, d: false, s: false, w: false })
  const tRef = useRef(0)
  const gameStartTimeRef = useRef(0)
  const invincibleRef = useRef(false)
  const gameTimeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentObjectiveRef = useRef<Objective | null>(null)
  const objectiveCompletedRef = useRef(false)
  const objectiveFailedRef = useRef(false)
  const livesLostThisGameRef = useRef(0)
  const gameEndedRef = useRef(false)

  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { livesRef.current = lives }, [lives])
  useEffect(() => { gameRunningRef.current = gameRunning }, [gameRunning])
  useEffect(() => { objectiveCompletedRef.current = objectiveCompleted }, [objectiveCompleted])
  useEffect(() => { objectiveFailedRef.current = objectiveFailed }, [objectiveFailed])
  useEffect(() => { currentObjectiveRef.current = currentObjective }, [currentObjective])

  /* ═══════════════════════════════════════════
     OBJECTIVE SYSTEM
     ═══════════════════════════════════════════ */

  const generateRandomObjective = useCallback((): Objective => {
    const types = ['score', 'time', 'score_no_life', 'time_no_life']
    const type = types[Math.floor(Math.random() * types.length)]

    switch (type) {
      case 'score': {
        const targetScore = Math.floor(Math.random() * 200) + 100
        return { type: 'score', description: `Atteindre un score de ${targetScore} points`, targetScore, rewardText: `Atteindre ${targetScore} points` }
      }
      case 'time': {
        const targetTime = Math.floor(Math.random() * 45) + 30
        return { type: 'time', description: `Jouer pendant ${targetTime} secondes`, targetTime, rewardText: `Survivre ${targetTime} secondes` }
      }
      case 'score_no_life': {
        const targetScore = Math.floor(Math.random() * 150) + 50
        return { type: 'score_no_life', description: `Atteindre ${targetScore} points sans perdre de vie`, targetScore, rewardText: `Atteindre ${targetScore} points sans perdre de vie` }
      }
      case 'time_no_life': {
        const targetTime = Math.floor(Math.random() * 30) + 20
        const maxLives = Math.floor(Math.random() * 2) + 1
        return { type: 'time_no_life', description: `Jouer ${targetTime} secondes sans perdre plus de ${maxLives} vie${maxLives > 1 ? 's' : ''}`, targetTime, maxLivesToLose: maxLives, rewardText: `Survivre ${targetTime}s (max ${maxLives} vie${maxLives > 1 ? 's' : ''} perdue${maxLives > 1 ? 's' : ''})` }
      }
      default: {
        return { type: 'score', description: 'Atteindre un score de 100 points', targetScore: 100, rewardText: 'Atteindre 100 points' }
      }
    }
  }, [])

  const checkObjective = useCallback(() => {
    const obj = currentObjectiveRef.current
    if (!obj || objectiveCompletedRef.current || objectiveFailedRef.current || gameEndedRef.current) return

    const currentScore = scoreRef.current
    const currentTime = gameTime
    const livesLost = livesLostThisGameRef.current

    let completed = false
    let failed = false

    switch (obj.type) {
      case 'score':
        if (currentScore >= (obj.targetScore || 0)) completed = true
        break
      case 'time':
        if (currentTime >= (obj.targetTime || 0)) completed = true
        break
      case 'score_no_life':
        if (livesLost > 0) failed = true
        else if (currentScore >= (obj.targetScore || 0)) completed = true
        break
      case 'time_no_life':
        if (livesLost > (obj.maxLivesToLose || 0)) failed = true
        else if (currentTime >= (obj.targetTime || 0)) completed = true
        break
    }

    if (completed) {
      setObjectiveCompleted(true)
      objectiveCompletedRef.current = true
      gameEndedRef.current = true
      const winAmount = currentBet * 2
      setBalance(prev => prev + winAmount)
      endGame(true, winAmount)
    } else if (failed) {
      setObjectiveFailed(true)
      objectiveFailedRef.current = true
      gameEndedRef.current = true
      endGame(false, currentBet)
    }
  }, [gameTime, currentBet])

  /* ═══════════════════════════════════════════
     GAME TIMER
     ═══════════════════════════════════════════ */

  const startGameTimer = useCallback(() => {
    gameStartTimeRef.current = Date.now()
    setGameTime(0)
    if (gameTimeIntervalRef.current) clearInterval(gameTimeIntervalRef.current)
    gameTimeIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000)
      setGameTime(elapsed)
      if (!gameEndedRef.current) checkObjective()
    }, 1000)
  }, [checkObjective])

  const stopGameTimer = useCallback(() => {
    if (gameTimeIntervalRef.current) {
      clearInterval(gameTimeIntervalRef.current)
      gameTimeIntervalRef.current = null
    }
  }, [])

  /* ═══════════════════════════════════════════
     THREE.JS INIT
     ═══════════════════════════════════════════ */

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050008)
    scene.fog = new THREE.FogExp2(0x0d0020, 0.018)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 3, 8)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const sun = new THREE.DirectionalLight(0xffffff, 0.8)
    sun.position.set(0, 6, 2)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)
    scene.add(new THREE.AmbientLight(0x1a0030, 1.2))

    const pinkLight = new THREE.PointLight(0xe879f9, 2.5, 30)
    pinkLight.position.set(0, 4, 5)
    scene.add(pinkLight)
    pinkLightRef.current = pinkLight

    const cyanLight = new THREE.PointLight(0x38bdf8, 1.5, 25)
    cyanLight.position.set(0, 2, -10)
    scene.add(cyanLight)
    cyanLightRef.current = cyanLight

    const ground = new Box({ width: 10, height: 0.5, depth: 50, color: '#1a003a', position: { x: 0, y: GROUND_Y, z: 0 } })
    ground.receiveShadow = true
    ground.material.roughness = 0.2
    ground.material.metalness = 0.6
    ;(ground.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x2d0060)
    ;(ground.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3
    scene.add(ground)
    groundRef.current = ground

    const gridHelper = new THREE.GridHelper(50, 20, 0xc026d3, 0x4b0082)
    gridHelper.position.set(0, ground.top + 0.01, 0)
    ;(gridHelper.material as THREE.Material).opacity = 0.6
    ;(gridHelper.material as THREE.Material).transparent = true
    scene.add(gridHelper)
    gridHelperRef.current = gridHelper

    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xe879f9 })
    const edgeGeo = new THREE.BoxGeometry(0.06, 0.06, 50)
    const edges: THREE.Mesh[] = []
    for (const x of [-5, 5]) {
      const edge = new THREE.Mesh(edgeGeo, edgeMat)
      edge.position.set(x, ground.top + 0.03, 0)
      scene.add(edge)
      edges.push(edge)
    }
    edgesRef.current = edges

    const starCount = 600
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3 + 0] = (Math.random() - 0.5) * 120
      starPositions[i * 3 + 1] = Math.random() * 30 + 2
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 120
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.7 })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)
    starsRef.current = stars

    function makeMountainSide(xOffset: number, flip: boolean) {
      const pts: THREE.Vector3[] = []
      let z = -55
      for (let i = 0; i <= 12; i++) {
        const h = Math.random() * 8 + 2
        pts.push(new THREE.Vector3(z, 0, 0))
        pts.push(new THREE.Vector3(z + 4, h, 0))
        z += 8
      }
      pts.push(new THREE.Vector3(z, 0, 0))
      const shape = new THREE.Shape()
      shape.moveTo(pts[0].x, -3)
      pts.forEach(p => shape.lineTo(p.x, p.y))
      shape.lineTo(pts[pts.length - 1].x, -3)
      shape.closePath()
      const geo = new THREE.ShapeGeometry(shape)
      const mat = new THREE.MeshBasicMaterial({ color: 0x0d0020, side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.y = Math.PI / 2
      mesh.position.set(xOffset, -1.75, 0)
      scene.add(mesh)
      const lineMat = new THREE.LineBasicMaterial({ color: flip ? 0xe879f9 : 0x38bdf8, transparent: true, opacity: 0.5 })
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.z, p.y, p.x)))
      const line = new THREE.Line(lineGeo, lineMat)
      line.position.set(xOffset, -1.75, 0)
      scene.add(line)
    }
    makeMountainSide(-6, false)
    makeMountainSide(6, true)

    renderer.render(scene, camera)

    const handleResize = () => {
      if (!camera || !renderer) return
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
      stopGameTimer()
      if (renderer) {
        renderer.dispose()
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      }
      scene.clear()
    }
  }, [stopGameTimer])

  /* ═══════════════════════════════════════════
     KEYBOARD
     ═══════════════════════════════════════════ */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRunningRef.current || gameEndedRef.current) return
      switch (e.code) {
        case 'KeyA': case 'ArrowLeft': keysRef.current.a = true; break
        case 'KeyD': case 'ArrowRight': keysRef.current.d = true; break
        case 'KeyS': keysRef.current.s = true; break
        case 'KeyW': keysRef.current.w = true; break
        case 'Space': case 'ArrowUp': {
          const cube = cubeRef.current
          const ground = groundRef.current
          if (cube && ground && cube.bottom <= ground.top + 0.05) cube.velocity.y = 0.08
          break
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyA': case 'ArrowLeft': keysRef.current.a = false; break
        case 'KeyD': case 'ArrowRight': keysRef.current.d = false; break
        case 'KeyS': keysRef.current.s = false; break
        case 'KeyW': keysRef.current.w = false; break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  /* ═══════════════════════════════════════════
     TOUCH CONTROLS (Mobile)
     ═══════════════════════════════════════════ */

  useEffect(() => {
    let touchStartX = 0
    let touchActive = false

    const handleTouchStart = (e: TouchEvent) => {
      if (!gameRunningRef.current || gameEndedRef.current) return
      touchStartX = e.touches[0].clientX
      touchActive = true
      const cube = cubeRef.current
      const ground = groundRef.current
      if (cube && ground && cube.bottom <= ground.top + 0.05) cube.velocity.y = 0.08
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!gameRunningRef.current || !touchActive || gameEndedRef.current) return
      const dx = e.touches[0].clientX - touchStartX
      if (Math.abs(dx) > 10) {
        if (dx > 0) { keysRef.current.d = true; keysRef.current.a = false }
        else { keysRef.current.a = true; keysRef.current.d = false }
      }
    }

    const handleTouchEnd = () => {
      keysRef.current.a = false
      keysRef.current.d = false
      touchActive = false
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  /* ═══════════════════════════════════════════
     GAME LOOP
     ═══════════════════════════════════════════ */

  const animate = useCallback(() => {
    const scene = sceneRef.current
    const camera = cameraRef.current
    const renderer = rendererRef.current
    const ground = groundRef.current
    const gridHelper = gridHelperRef.current
    const edges = edgesRef.current
    const stars = starsRef.current
    const pinkLight = pinkLightRef.current
    const cyanLight = cyanLightRef.current
    const cube = cubeRef.current
    const enemies = enemiesRef.current

    if (!scene || !camera || !renderer || !ground || !cube) return

    if (gameEndedRef.current) { renderer.render(scene, camera); return }

    animationIdRef.current = requestAnimationFrame(animate)

    tRef.current += 0.01
    const t = tRef.current

    if (pinkLight) pinkLight.intensity = 2.2 + Math.sin(t * 1.3) * 0.5
    if (cyanLight) cyanLight.intensity = 1.3 + Math.sin(t * 0.9 + 1) * 0.4

    const forwardSpeed = 0.05 + framesRef.current * 0.000018
    cube.velocity.x = 0
    cube.velocity.z = -forwardSpeed

    const keys = keysRef.current
    if (keys.a) cube.velocity.x = -0.06
    else if (keys.d) cube.velocity.x = 0.06

    cube.update(ground)

    if (cube.position.y < VOID_Y) {
      if (!objectiveCompletedRef.current) {
        const obj = currentObjectiveRef.current
        if (obj) { setObjectiveFailed(true); objectiveFailedRef.current = true }
        gameEndedRef.current = true
        endGame(false, currentBet)
        return
      }
      return
    }

    ground.position.z = cube.position.z
    ground.updateSides()
    if (gridHelper) gridHelper.position.z = cube.position.z
    edges.forEach(e => { e.position.z = cube.position.z })
    if (stars) stars.position.z = cube.position.z

    camera.position.set(cube.position.x * 0.25, cube.position.y + 3.5, cube.position.z + 8)
    camera.lookAt(cube.position.x * 0.25, cube.position.y + 0.5, cube.position.z - 5)

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i]
      enemy.update(ground)
      if (enemy.position.z > cube.position.z + 6) { scene.remove(enemy); enemies.splice(i, 1); continue }
      if (!invincibleRef.current && boxCollision({ box1: cube, box2: enemy })) {
        const newLives = livesRef.current - 1
        livesRef.current = newLives
        setLives(newLives)
        livesLostThisGameRef.current++
        scene.remove(enemy)
        enemies.splice(i, 1)
        invincibleRef.current = true
        if (cube.light) (cube.light as THREE.PointLight).color.set(0xff0000)
        ;(cube.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0xff0000)
        setTimeout(() => {
          invincibleRef.current = false
          if (cube.light) (cube.light as THREE.PointLight).color.set(0x38bdf8)
          ;(cube.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x0ea5e9)
        }, 2000)
        checkObjective()
        if (gameEndedRef.current) return
        if (newLives <= 0) {
          if (!objectiveCompletedRef.current) { setObjectiveFailed(true); objectiveFailedRef.current = true }
          gameEndedRef.current = true
          endGame(false, currentBet)
          return
        }
        continue
      }
    }

    framesRef.current++
    const newScore = Math.floor(framesRef.current / 6)
    scoreRef.current = newScore
    setScore(newScore)

    if (framesRef.current % spawnRateRef.current === 0) {
      if (spawnRateRef.current > 20) spawnRateRef.current -= 20
      const enemy = new Box({ width: 1, height: 1, depth: 1, position: { x: (Math.random() - 0.5) * 8, y: 0, z: cube.position.z - 28 }, velocity: { x: 0, y: 0, z: 0.002 }, color: 'red', zAcceleration: false })
      ;(enemy.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0xff0000)
      ;(enemy.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6
      ;(enemy.material as THREE.MeshStandardMaterial).roughness = 0.3
      ;(enemy.material as THREE.MeshStandardMaterial).metalness = 0.5
      enemy.castShadow = true
      scene.add(enemy)
      enemies.push(enemy)
    }

    checkObjective()
    renderer.render(scene, camera)
  }, [checkObjective, currentBet])

  /* ═══════════════════════════════════════════
     START / END GAME
     ═══════════════════════════════════════════ */

  const startGame = useCallback(() => {
    const scene = sceneRef.current
    if (!scene) return
    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
    const enemies = enemiesRef.current
    enemies.forEach(e => scene.remove(e))
    enemies.length = 0
    const oldCube = cubeRef.current
    if (oldCube) scene.remove(oldCube)
    framesRef.current = 0
    spawnRateRef.current = 200
    scoreRef.current = 0
    livesRef.current = INITIAL_LIVES
    livesLostThisGameRef.current = 0
    invincibleRef.current = false
    gameEndedRef.current = false
    setScore(0)
    setLives(INITIAL_LIVES)
    setObjectiveCompleted(false)
    setObjectiveFailed(false)
    objectiveCompletedRef.current = false
    objectiveFailedRef.current = false

    const cube = new Box({ width: 1, height: 1, depth: 1, velocity: { x: 0, y: -0.01, z: 0 } })
    ;(cube.material as THREE.MeshStandardMaterial).color.set(0x0ea5e9)
    ;(cube.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x0ea5e9)
    ;(cube.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8
    ;(cube.material as THREE.MeshStandardMaterial).roughness = 0.2
    ;(cube.material as THREE.MeshStandardMaterial).metalness = 0.5
    cube.castShadow = true
    scene.add(cube)
    cubeRef.current = cube

    const pl = new THREE.PointLight(0x38bdf8, 3, 6)
    cube.add(pl)
    cube.light = pl

    setShowOverlay(false)
    gameRunningRef.current = true
    setGameRunning(true)
    startGameTimer()
    animate()
  }, [animate, startGameTimer])

  const endGame = useCallback((won: boolean, amount: number) => {
    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
    stopGameTimer()
    gameRunningRef.current = false
    setGameRunning(false)
    gameEndedRef.current = true

    const currentScore = scoreRef.current
    if (currentScore > bestScoreRef.current) { bestScoreRef.current = currentScore; setBestScore(currentScore) }

    if (won) {
      setOverlayEye('— OBJECTIF ATTEINT —')
      setOverlayTitle('VICTOIRE')
      setOverlaySub(`+${amount} XOF`)
    } else {
      setOverlayEye('— OBJECTIF ECHOUE —')
      setOverlayTitle('DEFAITE')
      setOverlaySub(`-${amount} XOF`)
    }

    setFinalScore(currentScore)
    setShowScoreRow(true)
    setBtnText('REJOUER')
    setShowOverlay(true)
  }, [stopGameTimer])

  /* ═══════════════════════════════════════════
     BET HANDLERS
     ═══════════════════════════════════════════ */

  const handleConfirmBet = useCallback(() => {
    if (currentBet < MIN_BET) return
    if (currentBet > balance) return
    setIsBetLoading(true)
    setTimeout(() => {
      setBalance(prev => prev - currentBet)
      const obj = generateRandomObjective()
      setCurrentObjective(obj)
      currentObjectiveRef.current = obj
      setShowBetPopup(false)
      setShowObjectivePopup(true)
      setIsBetLoading(false)
    }, 2000)
  }, [currentBet, balance, generateRandomObjective])

  const handleStartAfterObjective = useCallback(() => { setShowObjectivePopup(false); startGame() }, [startGame])

  const handleBetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0
    setCurrentBet(Math.max(MIN_BET, val))
  }, [])

  /* ═══════════════════════════════════════════
     FORMAT HELPERS
     ═══════════════════════════════════════════ */

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const isMobileDevice = useCallback(() => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }, [])

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050008] font-['Orbitron',monospace]">
      
      {/* Container Three.js */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* HUD */}
      <div className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 flex gap-4 sm:gap-6 pointer-events-none z-10 bg-[#050008]/60 backdrop-blur-2xl px-4 sm:px-7 py-3 sm:py-3.5 rounded-2xl sm:rounded-3xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]">
        
        <div className="flex flex-col items-center gap-1 sm:gap-1.5 min-w-[50px] sm:min-w-[70px] relative after:absolute after:-right-2 sm:after:-right-3 after:top-1/2 after:-translate-y-1/2 after:w-px after:h-7 after:bg-gradient-to-b after:from-transparent after:via-white/10 after:to-transparent">
          <span className="font-['Orbitron',monospace] text-[7px] sm:text-[9px] font-bold tracking-[2px] sm:tracking-[3px] text-white/40 uppercase drop-shadow-[0_0_8px_rgba(192,38,211,0.4)]">SCORE</span>
          <span className="font-['Orbitron',monospace] text-lg sm:text-2xl font-black text-purple-400 tracking-[2px] leading-none drop-shadow-[0_0_12px_rgba(192,38,211,0.6)]">{score}</span>
        </div>

        <div className="flex flex-col items-center gap-1 sm:gap-1.5 min-w-[50px] sm:min-w-[70px] relative after:absolute after:-right-2 sm:after:-right-3 after:top-1/2 after:-translate-y-1/2 after:w-px after:h-7 after:bg-gradient-to-b after:from-transparent after:via-white/10 after:to-transparent">
          <span className="font-['Orbitron',monospace] text-[7px] sm:text-[9px] font-bold tracking-[2px] sm:tracking-[3px] text-white/40 uppercase drop-shadow-[0_0_8px_rgba(192,38,211,0.4)]">TEMPS</span>
          <span className="font-['Orbitron',monospace] text-lg sm:text-2xl font-black text-purple-400 tracking-[2px] leading-none drop-shadow-[0_0_12px_rgba(192,38,211,0.6)]">{formatTime(gameTime)}</span>
        </div>

        <div className="flex flex-col items-center gap-1 sm:gap-1.5 min-w-[50px] sm:min-w-[70px]">
          <span className="font-['Orbitron',monospace] text-[7px] sm:text-[9px] font-bold tracking-[2px] sm:tracking-[3px] text-white/40 uppercase drop-shadow-[0_0_8px_rgba(192,38,211,0.4)]">VIES</span>
          <span className="flex items-center gap-0.5" style={{ color: lives <= 1 ? '#ff3366' : '#e879f9' }}>
            {Array.from({ length: Math.max(0, lives) }, (_, i) => (
              <HeartIcon key={i} />
            ))}
            {lives <= 0 && <span className="text-sm">0</span>}
          </span>
        </div>
      </div>

      {/* Overlay (Game Over / Start) */}
      {showOverlay && (
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(80,0,120,0.65)_0%,rgba(5,0,8,0.94)_70%)] flex flex-col items-center justify-center z-20 text-white p-8 sm:p-10 backdrop-blur-sm">
          
          <p className="font-['Orbitron',monospace] text-[8px] sm:text-[11px] font-bold tracking-[5px] sm:tracking-[8px] text-purple-300 uppercase mb-3 sm:mb-4 drop-shadow-[0_0_20px_rgba(232,121,249,0.5)] animate-[fadeInDown_0.6s_ease]">
            {overlayEye}
          </p>
          
          <h1 className="font-['Orbitron',monospace] text-5xl sm:text-7xl md:text-8xl font-black leading-none bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-300 bg-clip-text text-transparent mb-2 filter drop-shadow-[0_0_30px_rgba(232,121,249,0.6)] animate-[fadeInUp_0.6s_ease] bg-[length:200%_200%] animate-[gradientShift_3s_ease-in-out_infinite]">
            {overlayTitle}
          </h1>
          
          <p className="font-['Inter',sans-serif] text-xs sm:text-sm font-medium text-white/70 tracking-[2px] mb-8 text-center animate-[fadeInUp_0.7s_ease]">
            {overlaySub}
          </p>

          {showScoreRow && (
            <div className="flex gap-8 sm:gap-14 mb-10 text-center animate-[fadeInUp_0.8s_ease]">
              <div className="relative after:absolute after:-right-4 sm:after:-right-7 after:top-1/2 after:-translate-y-1/2 after:w-px after:h-10 after:bg-gradient-to-b after:from-transparent after:via-white/15 after:to-transparent">
                <span className="block font-['Orbitron',monospace] text-[8px] sm:text-[10px] font-bold tracking-[3px] sm:tracking-[4px] text-white/40 mb-2.5 uppercase">SCORE</span>
                <strong className="font-['Orbitron',monospace] text-3xl sm:text-4xl font-black text-cyan-400 leading-none drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">{finalScore}</strong>
              </div>
              <div>
                <span className="block font-['Orbitron',monospace] text-[8px] sm:text-[10px] font-bold tracking-[3px] sm:tracking-[4px] text-white/40 mb-2.5 uppercase">RECORD</span>
                <strong className="font-['Orbitron',monospace] text-3xl sm:text-4xl font-black text-purple-400 leading-none drop-shadow-[0_0_20px_rgba(232,121,249,0.4)]">{bestScore}</strong>
              </div>
            </div>
          )}

          <button
            onClick={() => { setShowOverlay(false); setShowScoreRow(false); setShowBetPopup(true) }}
            className="relative bg-transparent border-2 border-purple-400 rounded-full py-3.5 sm:py-4 px-12 sm:px-14 font-['Orbitron',monospace] text-xs sm:text-sm font-bold tracking-[3px] sm:tracking-[4px] cursor-pointer text-purple-400 uppercase shadow-[0_0_25px_rgba(232,121,249,0.25),inset_0_0_25px_rgba(232,121,249,0.04)] hover:bg-purple-400/10 hover:border-purple-300 hover:shadow-[0_0_50px_rgba(232,121,249,0.5),inset_0_0_30px_rgba(232,121,249,0.08)] hover:-translate-y-1 hover:text-white active:-translate-y-0.5 active:shadow-[0_0_30px_rgba(232,121,249,0.3)] transition-all duration-400 overflow-hidden before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent hover:before:left-full before:transition-all before:duration-500 animate-[fadeInUp_0.9s_ease]"
          >
            {btnText}
          </button>
        </div>
      )}

      {/* Bet Popup */}
      {showBetPopup && (
        <div className="fixed inset-0 bg-[#030006]/92 flex items-center justify-center z-[100] backdrop-blur-2xl p-6 animate-[overlayFadeIn_0.35s_ease]">
          <div className="bg-[#140028]/95 border-[1.5px] border-purple-400/25 rounded-2xl sm:rounded-3xl p-8 sm:p-10 max-w-[460px] w-full text-center shadow-[0_0_60px_rgba(232,121,249,0.15),0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.03)] relative overflow-hidden animate-[popupSlideIn_0.4s_cubic-bezier(0.4,0,0.2,1)] max-h-[85vh] overflow-y-auto before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-purple-400/50 before:via-cyan-400/50 before:via-purple-400/50 before:to-transparent after:absolute after:-top-1/2 after:-left-1/2 after:w-[200%] after:h-[200%] after:bg-[radial-gradient(ellipse_at_center,rgba(232,121,249,0.03)_0%,transparent_70%)] after:pointer-events-none after:-z-10">
            
            <div className="flex justify-center mb-4">
              <CoinsIcon />
            </div>
            
            <h2 className="font-['Orbitron',monospace] text-xl sm:text-2xl font-black text-purple-400 mb-7 drop-shadow-[0_0_20px_rgba(232,121,249,0.4)] tracking-[3px] uppercase">
              PLACEZ VOTRE MISE
            </h2>

            <div className="bg-purple-400/[0.06] border border-purple-400/15 rounded-2xl py-4 px-6 mb-7 flex justify-between items-center hover:bg-purple-400/[0.08] hover:border-purple-400/25 transition-all duration-300">
              <span className="font-['Orbitron',monospace] text-[10px] sm:text-[11px] font-bold text-white/40 tracking-[3px] uppercase">SOLDE DISPONIBLE</span>
              <strong className="font-['Orbitron',monospace] text-xl sm:text-2xl font-black text-cyan-400 tracking-[1px] drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">{balance.toLocaleString('fr-FR')} XOF</strong>
            </div>

            <div className="mb-7 text-left">
              <label className="block font-['Orbitron',monospace] text-[10px] sm:text-[11px] font-bold text-white/40 tracking-[3px] uppercase mb-3">MONTANT DE LA MISE</label>
              <input
                type="number"
                value={currentBet}
                onChange={handleBetChange}
                min={MIN_BET}
                placeholder={`Minimum ${MIN_BET} XOF`}
                className="w-full py-4 px-5 font-['Orbitron',monospace] text-lg sm:text-xl font-bold text-center bg-white/[0.03] border-2 border-purple-400/20 rounded-xl text-purple-400 outline-none tracking-[1px] hover:border-purple-400/35 hover:bg-white/[0.05] focus:border-purple-400 focus:bg-white/[0.06] focus:shadow-[0_0_30px_rgba(232,121,249,0.2),0_0_0_4px_rgba(232,121,249,0.05)] transition-all duration-300 placeholder:text-white/20 placeholder:text-base [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="block font-['Inter',sans-serif] text-[10px] sm:text-[11px] font-medium text-white/25 mt-2.5 text-center tracking-[0.5px]">Mise minimale: {MIN_BET} XOF</span>
            </div>

            <button
              onClick={handleConfirmBet}
              disabled={isBetLoading || currentBet < MIN_BET || currentBet > balance}
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl font-['Orbitron',monospace] text-sm sm:text-base font-bold tracking-[3px] text-white uppercase shadow-[0_4px_20px_rgba(232,121,249,0.3)] hover:shadow-[0_8px_30px_rgba(232,121,249,0.5),0_0_50px_rgba(232,121,249,0.2)] hover:-translate-y-1 active:-translate-y-0.5 disabled:opacity-45 disabled:cursor-not-allowed disabled:grayscale-[30%] transition-all duration-400 flex items-center justify-center gap-2.5 mb-3 relative overflow-hidden after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-gradient-to-r after:from-transparent after:via-white/[0.08] after:to-transparent hover:after:left-full after:transition-all after:duration-500"
            >
              {isBetLoading ? (
                <>
                  <div className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                  CHARGEMENT...
                </>
              ) : (
                'CONFIRMER LA MISE'
              )}
            </button>

            <button
              onClick={() => { setShowBetPopup(false); setShowRulesPopup(true) }}
              className="w-full py-3.5 bg-transparent border-[1.5px] border-purple-400/25 rounded-xl font-['Orbitron',monospace] text-xs sm:text-sm font-bold tracking-[3px] text-white/70 uppercase hover:bg-purple-400/[0.08] hover:border-purple-400/40 hover:text-purple-400 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(232,121,249,0.15)] transition-all duration-400 flex items-center justify-center gap-2.5"
            >
              <BookIcon /> VOIR LES REGLES
            </button>
          </div>
        </div>
      )}

      {/* Objective Popup */}
      {showObjectivePopup && currentObjective && (
        <div className="fixed inset-0 bg-[#030006]/92 flex items-center justify-center z-[100] backdrop-blur-2xl p-6 animate-[overlayFadeIn_0.35s_ease]">
          <div className="bg-[#140028]/95 border-[1.5px] border-purple-400/25 rounded-2xl sm:rounded-3xl p-8 sm:p-10 max-w-[460px] w-full text-center shadow-[0_0_60px_rgba(232,121,249,0.15),0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.03)] relative overflow-hidden animate-[popupSlideIn_0.4s_cubic-bezier(0.4,0,0.2,1)] max-h-[85vh] overflow-y-auto before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-purple-400/50 before:via-cyan-400/50 before:via-purple-400/50 before:to-transparent">
            
            <div className="flex justify-center mb-4">
              <TargetIcon />
            </div>
            
            <h2 className="font-['Orbitron',monospace] text-xl sm:text-2xl font-black text-purple-400 mb-7 drop-shadow-[0_0_20px_rgba(232,121,249,0.4)] tracking-[3px] uppercase">
              OBJECTIF DU JOUR
            </h2>
            
            <p className="font-['Inter',sans-serif] text-base sm:text-lg font-medium text-white mb-7 leading-relaxed p-5 bg-purple-400/[0.06] rounded-2xl border border-purple-400/15">
              {currentObjective.description}
            </p>

            <div className="flex justify-around mb-7 p-5 bg-black/25 rounded-2xl border border-white/[0.05]">
              <div className="text-center flex-1 relative after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-px after:h-8 after:bg-gradient-to-b after:from-transparent after:via-white/10 after:to-transparent">
                <span className="block font-['Orbitron',monospace] text-[9px] sm:text-[10px] font-bold text-white/40 tracking-[3px] uppercase mb-2">MISE</span>
                <strong className="font-['Orbitron',monospace] text-lg sm:text-xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">{currentBet.toLocaleString('fr-FR')} XOF</strong>
              </div>
              <div className="text-center flex-1">
                <span className="block font-['Orbitron',monospace] text-[9px] sm:text-[10px] font-bold text-white/40 tracking-[3px] uppercase mb-2">GAIN POTENTIEL</span>
                <strong className="font-['Orbitron',monospace] text-lg sm:text-xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">{(currentBet * 2).toLocaleString('fr-FR')} XOF</strong>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 font-['Orbitron',monospace] text-xs sm:text-sm font-semibold text-yellow-400 mb-6 py-3 px-5 bg-yellow-400/[0.06] border border-yellow-400/20 rounded-full tracking-[1px]">
              <TrophyIcon />
              {currentObjective.rewardText}
            </div>

            <button
              onClick={handleStartAfterObjective}
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-xl font-['Orbitron',monospace] text-sm sm:text-base font-bold tracking-[3px] text-white uppercase shadow-[0_4px_20px_rgba(56,189,248,0.3)] hover:shadow-[0_8px_30px_rgba(56,189,248,0.5),0_0_50px_rgba(56,189,248,0.2)] hover:-translate-y-1 active:-translate-y-0.5 transition-all duration-400 flex items-center justify-center gap-2.5 relative overflow-hidden after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-gradient-to-r after:from-transparent after:via-white/[0.08] after:to-transparent hover:after:left-full after:transition-all after:duration-500"
            >
              <PlayIcon /> COMMENCER LE DEFI
            </button>
          </div>
        </div>
      )}

      {/* Rules Popup */}
      {showRulesPopup && (
        <div className="fixed inset-0 bg-[#030006]/92 flex items-center justify-center z-[100] backdrop-blur-2xl p-4 sm:p-6 animate-[overlayFadeIn_0.35s_ease]">
          <div className="bg-[#140028]/95 border-[1.5px] border-purple-400/25 rounded-2xl sm:rounded-3xl p-6 sm:p-7 max-w-[460px] w-full shadow-[0_0_60px_rgba(232,121,249,0.15),0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.03)] relative overflow-hidden animate-[popupSlideIn_0.4s_cubic-bezier(0.4,0,0.2,1)] max-h-[75vh] overflow-y-auto text-left before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-purple-400/50 before:via-cyan-400/50 before:via-purple-400/50 before:to-transparent scrollbar-thin scrollbar-track-white/[0.02] scrollbar-thumb-purple-400/25 hover:scrollbar-thumb-purple-400/40">
            
            <div className="flex justify-center mb-2.5">
              <ScrollIcon />
            </div>
            
            <h2 className="font-['Orbitron',monospace] text-xl sm:text-2xl font-black text-purple-400 mb-7 text-center drop-shadow-[0_0_20px_rgba(232,121,249,0.4)] tracking-[3px] uppercase">
              REGLES DU JEU
            </h2>

            {[
              {
                icon: <GamepadIcon />,
                title: 'COMMENT JOUER',
                content: isMobileDevice() ? (
                  <ul className="space-y-1.5">
                    <li className="text-white/70 text-xs sm:text-sm pl-5 relative before:absolute before:left-[3px] before:top-1/2 before:-translate-y-1/2 before:w-[5px] before:h-[5px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:text-white transition-colors duration-150">Touchez l&apos;ecran pour sauter</li>
                    <li className="text-white/70 text-xs sm:text-sm pl-5 relative before:absolute before:left-[3px] before:top-1/2 before:-translate-y-1/2 before:w-[5px] before:h-[5px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:text-white transition-colors duration-150">Glissez a gauche/droite pour esquiver</li>
                  </ul>
                ) : (
                  <ul className="space-y-1.5">
                    <li className="text-white/70 text-xs sm:text-sm pl-5 relative before:absolute before:left-[3px] before:top-1/2 before:-translate-y-1/2 before:w-[5px] before:h-[5px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:text-white transition-colors duration-150"><strong className="text-purple-300 font-semibold">A / Fleche Gauche</strong> : Esquiver a gauche</li>
                    <li className="text-white/70 text-xs sm:text-sm pl-5 relative before:absolute before:left-[3px] before:top-1/2 before:-translate-y-1/2 before:w-[5px] before:h-[5px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:text-white transition-colors duration-150"><strong className="text-purple-300 font-semibold">D / Fleche Droite</strong> : Esquiver a droite</li>
                    <li className="text-white/70 text-xs sm:text-sm pl-5 relative before:absolute before:left-[3px] before:top-1/2 before:-translate-y-1/2 before:w-[5px] before:h-[5px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:text-white transition-colors duration-150"><strong className="text-purple-300 font-semibold">ESPACE / Fleche Haut</strong> : Sauter</li>
                  </ul>
                )
              },
              {
                icon: <CoinsIcon />,
                title: 'SYSTEME DE MISE',
                content: (
                  <ul className="space-y-1.5">
                    {['Solde initial: 5 000 XOF', 'Mise minimale: 100 XOF', 'Pas de mise maximale', 'Objectif reussi = Gain = Mise x 2', 'Objectif echoue = Perte de la mise'].map((item, i) => (
                      <li key={i} className="text-white/70 text-xs sm:text-sm pl-5 relative before:absolute before:left-[3px] before:top-1/2 before:-translate-y-1/2 before:w-[5px] before:h-[5px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:text-white transition-colors duration-150">{item}</li>
                    ))}
                  </ul>
                )
              },
              {
                icon: <TargetIcon />,
                title: 'OBJECTIFS ALEATOIRES',
                content: (
                  <ul className="space-y-1.5">
                    {[
                      { strong: 'Score', text: ': Atteindre un score cible' },
                      { strong: 'Temps', text: ': Survivre pendant X secondes' },
                      { strong: 'Score sans vie', text: ': Atteindre X points sans perdre de vie' },
                      { strong: 'Temps sans vie', text: ': Survivre X secondes sans perdre trop de vies' }
                    ].map((item, i) => (
                      <li key={i} className="text-white/70 text-xs sm:text-sm pl-5 relative before:absolute before:left-[3px] before:top-1/2 before:-translate-y-1/2 before:w-[5px] before:h-[5px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:text-white transition-colors duration-150"><strong className="text-purple-300 font-semibold">{item.strong}</strong>{item.text}</li>
                    ))}
                  </ul>
                )
              },
              {
                icon: <HeartIcon />,
                title: 'SYSTEME DE VIES',
                content: (
                  <ul className="space-y-1.5">
                    {['Vous commencez avec 3 vies', 'Chaque collision avec un ennemi = -1 vie', "2 secondes d'invincibilite apres chaque coup", '0 vie ou chute dans le vide = Game Over'].map((item, i) => (
                      <li key={i} className="text-white/70 text-xs sm:text-sm pl-5 relative before:absolute before:left-[3px] before:top-1/2 before:-translate-y-1/2 before:w-[5px] before:h-[5px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:text-white transition-colors duration-150">{item}</li>
                    ))}
                  </ul>
                )
              },
              {
                icon: <ChartIcon />,
                title: 'SCORING',
                content: (
                  <ul className="space-y-1.5">
                    {['Le score augmente automatiquement avec le temps de survie', 'La vitesse augmente progressivement', 'Plus vous survivez, plus le jeu devient difficile'].map((item, i) => (
                      <li key={i} className="text-white/70 text-xs sm:text-sm pl-5 relative before:absolute before:left-[3px] before:top-1/2 before:-translate-y-1/2 before:w-[5px] before:h-[5px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:text-white transition-colors duration-150">{item}</li>
                    ))}
                  </ul>
                )
              }
            ].map((section, i) => (
              <div key={i} className={`mb-6 pb-6 border-b border-white/[0.06] last:border-b-0 last:mb-0 last:pb-0 hover:bg-purple-400/[0.02] rounded-xl p-4 -mx-4 sm:hover:px-4 transition-all duration-300`}>
                <h3 className="font-['Orbitron',monospace] text-xs sm:text-sm font-bold text-purple-400 mb-3.5 tracking-[2px] uppercase flex items-center gap-2.5">{section.icon} {section.title}</h3>
                {section.content}
              </div>
            ))}

            <button
              onClick={() => { setShowRulesPopup(false); setShowBetPopup(true) }}
              className="w-full py-3.5 bg-transparent border-[1.5px] border-purple-400/25 rounded-xl font-['Orbitron',monospace] text-xs sm:text-sm font-bold tracking-[3px] text-white/70 uppercase hover:bg-purple-400/[0.08] hover:border-purple-400/40 hover:text-purple-400 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(232,121,249,0.15)] transition-all duration-400 flex items-center justify-center gap-2.5 mt-6"
            >
              <ArrowLeftIcon /> RETOUR A LA MISE
            </button>
          </div>
        </div>
      )}

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.025)_0px,rgba(0,0,0,0.025)_1px,transparent_1px,transparent_2px)]" />
    </div>
  )
}