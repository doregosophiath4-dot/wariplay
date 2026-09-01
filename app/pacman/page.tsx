'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export default function PacmanPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const [gameOver, setGameOver] = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  const restartGame = useCallback(() => {
    window.location.reload()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const bgCanvas = bgCanvasRef.current
    if (!canvas || !container || !bgCanvas) return

    const canvasContext = canvas.getContext('2d')
    const bgCtx = bgCanvas.getContext('2d')
    if (!canvasContext || !bgCtx) return

    const DIRECTION_RIGHT = 4
    const DIRECTION_UP = 3
    const DIRECTION_LEFT = 2
    const DIRECTION_BOTTOM = 1

    let lives = 3
    const ghostCount = 4
    const fps = 30
    let oneBlockSize = 20
    let score = 0
    let wallSpaceWidth = oneBlockSize / 1.6
    let wallOffset = (oneBlockSize - wallSpaceWidth) / 2
    const wallInnerColor = 'black'

    let pacman: any
    let ghosts: any[] = []
    let gameInterval: NodeJS.Timeout
    let bgAnimationId: number

    const map = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1],
      [1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1],
      [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]

    const ghostImageLocations = [
      { x: 0, y: 0 },
      { x: 176, y: 0 },
      { x: 0, y: 121 },
      { x: 176, y: 121 },
    ]

    let randomTargetsForGhosts: any[] = []

    const calculateResponsiveSize = () => {
      const containerWidth = container.clientWidth
      const containerHeight = window.innerHeight
      const maxCanvasWidth = Math.min(containerWidth - 32, 600)
      const maxCanvasHeight = containerHeight - 200

      const mapWidth = map[0].length
      const mapHeight = map.length

      const sizeByWidth = Math.floor(maxCanvasWidth / mapWidth)
      const sizeByHeight = Math.floor(maxCanvasHeight / mapHeight)

      oneBlockSize = Math.max(Math.min(sizeByWidth, sizeByHeight, 24), 14)
      wallSpaceWidth = oneBlockSize / 1.6
      wallOffset = (oneBlockSize - wallSpaceWidth) / 2

      const canvasWidth = mapWidth * oneBlockSize
      const canvasHeight = mapHeight * oneBlockSize

      canvas.width = canvasWidth
      canvas.height = canvasHeight
      canvas.style.width = canvasWidth + 'px'
      canvas.style.height = canvasHeight + 'px'

      randomTargetsForGhosts = [
        { x: 1 * oneBlockSize, y: 1 * oneBlockSize },
        { x: 1 * oneBlockSize, y: (map.length - 2) * oneBlockSize },
        { x: (map[0].length - 2) * oneBlockSize, y: oneBlockSize },
        { x: (map[0].length - 2) * oneBlockSize, y: (map.length - 2) * oneBlockSize },
      ]
    }

    const pacmanFrames = new Image()
    pacmanFrames.src = 'pacman/animations.gif'

    const ghostFrames = new Image()
    ghostFrames.src = 'pacman/ghost.png'

    // =====================================================
    // BACKGROUND ANIMÉ
    // =====================================================
    const stars: { x: number; y: number; size: number; speed: number; alpha: number }[] = []
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        alpha: Math.random(),
      })
    }

    const animateBackground = () => {
      bgCanvas.width = window.innerWidth
      bgCanvas.height = window.innerHeight

      bgCtx.fillStyle = '#0a0a1a'
      bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height)

      // Grid néon subtile
      const gridSize = 40
      const time = Date.now() * 0.001
      const pulse = Math.sin(time) * 0.3 + 0.7

      bgCtx.strokeStyle = `rgba(52, 45, 202, ${0.08 * pulse})`
      bgCtx.lineWidth = 0.5

      for (let x = 0; x < bgCanvas.width; x += gridSize) {
        bgCtx.beginPath()
        bgCtx.moveTo(x, 0)
        bgCtx.lineTo(x, bgCanvas.height)
        bgCtx.stroke()
      }
      for (let y = 0; y < bgCanvas.height; y += gridSize) {
        bgCtx.beginPath()
        bgCtx.moveTo(0, y)
        bgCtx.lineTo(bgCanvas.width, y)
        bgCtx.stroke()
      }

      // Étoiles scintillantes
      for (const star of stars) {
        star.alpha += star.speed * 0.02
        const opacity = (Math.sin(star.alpha) + 1) / 2 * 0.8
        bgCtx.fillStyle = `rgba(255, 255, 200, ${opacity})`
        bgCtx.beginPath()
        bgCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        bgCtx.fill()
      }

      // Vignette
      const gradient = bgCtx.createRadialGradient(
        bgCanvas.width / 2, bgCanvas.height / 2, bgCanvas.width * 0.2,
        bgCanvas.width / 2, bgCanvas.height / 2, bgCanvas.width * 0.8
      )
      gradient.addColorStop(0, 'rgba(0,0,0,0)')
      gradient.addColorStop(1, 'rgba(0,0,0,0.6)')
      bgCtx.fillStyle = gradient
      bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height)

      bgAnimationId = requestAnimationFrame(animateBackground)
    }

    const createRect = (x: number, y: number, width: number, height: number, color: string) => {
      canvasContext.fillStyle = color
      canvasContext.fillRect(x, y, width, height)
    }

    const drawWalls = () => {
      for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
          if (map[i][j] == 1) {
            createRect(j * oneBlockSize, i * oneBlockSize, oneBlockSize, oneBlockSize, '#342DCA')
            if (j > 0 && map[i][j - 1] == 1) {
              createRect(j * oneBlockSize, i * oneBlockSize + wallOffset, wallSpaceWidth + wallOffset, wallSpaceWidth, wallInnerColor)
            }
            if (j < map[0].length - 1 && map[i][j + 1] == 1) {
              createRect(j * oneBlockSize + wallOffset, i * oneBlockSize + wallOffset, wallSpaceWidth + wallOffset, wallSpaceWidth, wallInnerColor)
            }
            if (i < map.length - 1 && map[i + 1][j] == 1) {
              createRect(j * oneBlockSize + wallOffset, i * oneBlockSize + wallOffset, wallSpaceWidth, wallSpaceWidth + wallOffset, wallInnerColor)
            }
            if (i > 0 && map[i - 1][j] == 1) {
              createRect(j * oneBlockSize + wallOffset, i * oneBlockSize, wallSpaceWidth, wallSpaceWidth + wallOffset, wallInnerColor)
            }
          }
        }
      }
    }

    const drawFoods = () => {
      for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
          if (map[i][j] == 2) {
            createRect(j * oneBlockSize + oneBlockSize / 3, i * oneBlockSize + oneBlockSize / 3, oneBlockSize / 3, oneBlockSize / 3, '#FEB897')
          }
        }
      }
    }

    const drawScore = () => {
      canvasContext.font = `${Math.max(12, oneBlockSize * 0.6)}px monospace`
      canvasContext.fillStyle = 'white'
      canvasContext.textAlign = 'left'
      canvasContext.fillText('SCORE: ' + score, oneBlockSize / 2, oneBlockSize * (map.length + 1) - oneBlockSize / 3)
    }

    const drawRemainingLives = () => {
      canvasContext.font = `${Math.max(12, oneBlockSize * 0.6)}px monospace`
      canvasContext.fillStyle = 'white'
      canvasContext.textAlign = 'right'
      canvasContext.fillText('LIVES: ', canvas.width - oneBlockSize * 4, oneBlockSize * (map.length + 1) - oneBlockSize / 3)
      for (let i = 0; i < lives; i++) {
        const size = oneBlockSize * 0.8
        canvasContext.drawImage(pacmanFrames, 2 * oneBlockSize, 0, oneBlockSize, oneBlockSize, canvas.width - oneBlockSize * 3 + i * (size + 2), oneBlockSize * map.length + 2, size, size)
      }
    }

    const draw = () => {
      canvasContext.clearRect(0, 0, canvas.width, canvas.height)
      createRect(0, 0, canvas.width, canvas.height, 'black')
      drawWalls()
      drawFoods()
      drawGhosts()
      pacman.draw()
      drawScore()
      drawRemainingLives()
    }

    // =====================================================
    // PACMAN - CORRECTION SPRITE SHEET (4 frames)
    // =====================================================
    class Pacman {
      x: number
      y: number
      width: number
      height: number
      speed: number
      direction: number
      nextDirection: number
      frameCount: number
      currentFrame: number
      animationInterval: NodeJS.Timeout
      spriteFrameWidth: number

      constructor(x: number, y: number, width: number, height: number, speed: number) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speed = speed
        this.direction = DIRECTION_RIGHT
        this.nextDirection = DIRECTION_RIGHT
        this.frameCount = 4
        this.currentFrame = 0
        this.spriteFrameWidth = 20
        this.animationInterval = setInterval(() => { this.changeAnimation() }, 120)
      }

      moveProcess() {
        this.changeDirectionIfPossible()
        this.moveForwards()
        if (this.checkCollisions()) {
          this.moveBackwards()
          return
        }
      }

      eat() {
        for (let i = 0; i < map.length; i++) {
          for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 2 && this.getMapX() == j && this.getMapY() == i) {
              map[i][j] = 3
              score++
            }
          }
        }
      }

      moveBackwards() {
        switch (this.direction) {
          case DIRECTION_RIGHT: this.x -= this.speed; break
          case DIRECTION_UP: this.y += this.speed; break
          case DIRECTION_LEFT: this.x += this.speed; break
          case DIRECTION_BOTTOM: this.y -= this.speed; break
        }
      }

      moveForwards() {
        switch (this.direction) {
          case DIRECTION_RIGHT: this.x += this.speed; break
          case DIRECTION_UP: this.y -= this.speed; break
          case DIRECTION_LEFT: this.x -= this.speed; break
          case DIRECTION_BOTTOM: this.y += this.speed; break
        }
      }

      checkCollisions() {
        let isCollided = false
        if (map[parseInt(String(this.y / oneBlockSize))][parseInt(String(this.x / oneBlockSize))] == 1 ||
            map[parseInt(String(this.y / oneBlockSize + 0.9999))][parseInt(String(this.x / oneBlockSize))] == 1 ||
            map[parseInt(String(this.y / oneBlockSize))][parseInt(String(this.x / oneBlockSize + 0.9999))] == 1 ||
            map[parseInt(String(this.y / oneBlockSize + 0.9999))][parseInt(String(this.x / oneBlockSize + 0.9999))] == 1) {
          isCollided = true
        }
        return isCollided
      }

      checkGhostCollision(ghosts: any[]) {
        for (let i = 0; i < ghosts.length; i++) {
          if (ghosts[i].getMapX() == this.getMapX() && ghosts[i].getMapY() == this.getMapY()) {
            return true
          }
        }
        return false
      }

      changeDirectionIfPossible() {
        if (this.direction == this.nextDirection) return
        const tempDirection = this.direction
        this.direction = this.nextDirection
        this.moveForwards()
        if (this.checkCollisions()) {
          this.moveBackwards()
          this.direction = tempDirection
        } else {
          this.moveBackwards()
        }
      }

      getMapX() { return parseInt(String(this.x / oneBlockSize)) }
      getMapY() { return parseInt(String(this.y / oneBlockSize)) }
      getMapXRightSide() { return parseInt(String((this.x * 0.99 + oneBlockSize) / oneBlockSize)) }
      getMapYRightSide() { return parseInt(String((this.y * 0.99 + oneBlockSize) / oneBlockSize)) }

      changeAnimation() {
        this.currentFrame = (this.currentFrame + 1) % this.frameCount
      }

      draw() {
        canvasContext.save()
        canvasContext.translate(this.x + oneBlockSize / 2, this.y + oneBlockSize / 2)
        canvasContext.rotate((this.direction * 90 * Math.PI) / 180)
        canvasContext.translate(-this.x - oneBlockSize / 2, -this.y - oneBlockSize / 2)

        // Sprite sheet: 4 frames horizontales, chaque frame = 20px de large
        const frameWidth = this.spriteFrameWidth
        const sx = this.currentFrame * frameWidth

        canvasContext.drawImage(
          pacmanFrames,
          sx, 0, frameWidth, frameWidth,
          this.x, this.y, this.width, this.height
        )
        canvasContext.restore()
      }
    }

    class Ghost {
      x: number
      y: number
      width: number
      height: number
      speed: number
      direction: number
      imageX: number
      imageY: number
      imageWidth: number
      imageHeight: number
      range: number
      randomTargetIndex: number
      target: any
      randomInterval: NodeJS.Timeout

      constructor(x: number, y: number, width: number, height: number, speed: number, imageX: number, imageY: number, imageWidth: number, imageHeight: number, range: number) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speed = speed
        this.direction = DIRECTION_RIGHT
        this.imageX = imageX
        this.imageY = imageY
        this.imageHeight = imageHeight
        this.imageWidth = imageWidth
        this.range = range
        this.randomTargetIndex = parseInt(String(Math.random() * 4))
        this.target = randomTargetsForGhosts[this.randomTargetIndex]
        this.randomInterval = setInterval(() => { this.changeRandomDirection() }, 10000)
      }

      isInRange() {
        const xDistance = Math.abs(pacman.getMapX() - this.getMapX())
        const yDistance = Math.abs(pacman.getMapY() - this.getMapY())
        return Math.sqrt(xDistance * xDistance + yDistance * yDistance) <= this.range
      }

      changeRandomDirection() { this.randomTargetIndex = (this.randomTargetIndex + 1) % 4 }

      moveProcess() {
        this.target = this.isInRange() ? pacman : randomTargetsForGhosts[this.randomTargetIndex]
        this.changeDirectionIfPossible()
        this.moveForwards()
        if (this.checkCollisions()) {
          this.moveBackwards()
          return
        }
      }

      moveBackwards() {
        switch (this.direction) {
          case DIRECTION_RIGHT: this.x -= this.speed; break
          case DIRECTION_UP: this.y += this.speed; break
          case DIRECTION_LEFT: this.x += this.speed; break
          case DIRECTION_BOTTOM: this.y -= this.speed; break
        }
      }

      moveForwards() {
        switch (this.direction) {
          case DIRECTION_RIGHT: this.x += this.speed; break
          case DIRECTION_UP: this.y -= this.speed; break
          case DIRECTION_LEFT: this.x -= this.speed; break
          case DIRECTION_BOTTOM: this.y += this.speed; break
        }
      }

      checkCollisions() {
        let isCollided = false
        if (map[parseInt(String(this.y / oneBlockSize))][parseInt(String(this.x / oneBlockSize))] == 1 ||
            map[parseInt(String(this.y / oneBlockSize + 0.9999))][parseInt(String(this.x / oneBlockSize))] == 1 ||
            map[parseInt(String(this.y / oneBlockSize))][parseInt(String(this.x / oneBlockSize + 0.9999))] == 1 ||
            map[parseInt(String(this.y / oneBlockSize + 0.9999))][parseInt(String(this.x / oneBlockSize + 0.9999))] == 1) {
          isCollided = true
        }
        return isCollided
      }

      changeDirectionIfPossible() {
        const tempDirection = this.direction
        this.direction = this.calculateNewDirection(map, parseInt(String(this.target.x / oneBlockSize)), parseInt(String(this.target.y / oneBlockSize)))
        if (typeof this.direction == 'undefined') {
          this.direction = tempDirection
          return
        }
        if (this.getMapY() != this.getMapYRightSide() && (this.direction == DIRECTION_LEFT || this.direction == DIRECTION_RIGHT)) {
          this.direction = DIRECTION_UP
        }
        if (this.getMapX() != this.getMapXRightSide() && this.direction == DIRECTION_UP) {
          this.direction = DIRECTION_LEFT
        }
        this.moveForwards()
        if (this.checkCollisions()) {
          this.moveBackwards()
          this.direction = tempDirection
        } else {
          this.moveBackwards()
        }
      }

      calculateNewDirection(mapData: number[][], destX: number, destY: number) {
        const mp: number[][] = []
        for (let i = 0; i < mapData.length; i++) { mp[i] = mapData[i].slice() }

        const queue: any[] = [{ x: this.getMapX(), y: this.getMapY(), rightX: this.getMapXRightSide(), rightY: this.getMapYRightSide(), moves: [] as number[] }]

        while (queue.length > 0) {
          const poped = queue.shift()!
          if (poped.x == destX && poped.y == destY) { return poped.moves[0] }
          else {
            mp[poped.y][poped.x] = 1
            const neighborList = this.addNeighbors(poped, mp)
            for (let i = 0; i < neighborList.length; i++) { queue.push(neighborList[i]) }
          }
        }
        return 1
      }

      addNeighbors(poped: any, mp: number[][]) {
        const queue: any[] = []
        const numOfRows = mp.length
        const numOfColumns = mp[0].length

        if (poped.x - 1 >= 0 && poped.x - 1 < numOfRows && mp[poped.y][poped.x - 1] != 1) {
          const tempMoves = poped.moves.slice()
          tempMoves.push(DIRECTION_LEFT)
          queue.push({ x: poped.x - 1, y: poped.y, moves: tempMoves })
        }
        if (poped.x + 1 >= 0 && poped.x + 1 < numOfRows && mp[poped.y][poped.x + 1] != 1) {
          const tempMoves = poped.moves.slice()
          tempMoves.push(DIRECTION_RIGHT)
          queue.push({ x: poped.x + 1, y: poped.y, moves: tempMoves })
        }
        if (poped.y - 1 >= 0 && poped.y - 1 < numOfColumns && mp[poped.y - 1][poped.x] != 1) {
          const tempMoves = poped.moves.slice()
          tempMoves.push(DIRECTION_UP)
          queue.push({ x: poped.x, y: poped.y - 1, moves: tempMoves })
        }
        if (poped.y + 1 >= 0 && poped.y + 1 < numOfColumns && mp[poped.y + 1][poped.x] != 1) {
          const tempMoves = poped.moves.slice()
          tempMoves.push(DIRECTION_BOTTOM)
          queue.push({ x: poped.x, y: poped.y + 1, moves: tempMoves })
        }
        return queue
      }

      getMapX() { return parseInt(String(this.x / oneBlockSize)) }
      getMapY() { return parseInt(String(this.y / oneBlockSize)) }
      getMapXRightSide() { return parseInt(String((this.x * 0.99 + oneBlockSize) / oneBlockSize)) }
      getMapYRightSide() { return parseInt(String((this.y * 0.99 + oneBlockSize) / oneBlockSize)) }

      draw() {
        canvasContext.save()
        canvasContext.drawImage(ghostFrames, this.imageX, this.imageY, this.imageWidth, this.imageHeight, this.x, this.y, this.width, this.height)
        canvasContext.restore()
        canvasContext.beginPath()
        canvasContext.strokeStyle = 'red'
        canvasContext.arc(this.x + oneBlockSize / 2, this.y + oneBlockSize / 2, this.range * oneBlockSize, 0, 2 * Math.PI)
        canvasContext.stroke()
      }
    }

    const updateGhosts = () => { for (let i = 0; i < ghosts.length; i++) { ghosts[i].moveProcess() } }
    const drawGhosts = () => { for (let i = 0; i < ghosts.length; i++) { ghosts[i].draw() } }

    const createNewPacman = () => {
      pacman = new Pacman(oneBlockSize, oneBlockSize, oneBlockSize, oneBlockSize, oneBlockSize / 5)
    }

    const createGhosts = () => {
      ghosts = []
      for (let i = 0; i < ghostCount * 2; i++) {
        const newGhost = new Ghost(
          9 * oneBlockSize + (i % 2 == 0 ? 0 : 1) * oneBlockSize,
          10 * oneBlockSize + (i % 2 == 0 ? 0 : 1) * oneBlockSize,
          oneBlockSize, oneBlockSize, pacman.speed / 2,
          ghostImageLocations[i % 4].x, ghostImageLocations[i % 4].y, 124, 116, 6 + i
        )
        ghosts.push(newGhost)
      }
    }

    const restartPacmanAndGhosts = () => { createNewPacman(); createGhosts() }

    const onGhostCollision = () => {
      lives--
      restartPacmanAndGhosts()
      if (lives == 0) {
        clearInterval(gameInterval)
        setFinalScore(score)
        setGameOver(true)
      }
    }

    const update = () => {
      pacman.moveProcess()
      pacman.eat()
      updateGhosts()
      if (pacman.checkGhostCollision(ghosts)) { onGhostCollision() }
    }

    const gameLoop = () => { update(); draw() }

    const handleKeyDown = (event: KeyboardEvent) => {
      const k = event.keyCode
      if ([37, 38, 39, 40, 65, 87, 68, 83].includes(k)) {
        event.preventDefault()
      }
      setTimeout(() => {
        if (k == 37 || k == 65) pacman.nextDirection = DIRECTION_LEFT
        else if (k == 38 || k == 87) pacman.nextDirection = DIRECTION_UP
        else if (k == 39 || k == 68) pacman.nextDirection = DIRECTION_RIGHT
        else if (k == 40 || k == 83) pacman.nextDirection = DIRECTION_BOTTOM
      }, 1)
    }

    const initGame = () => {
      calculateResponsiveSize()
      createNewPacman()
      createGhosts()
      gameInterval = setInterval(gameLoop, 1000 / fps)
      window.addEventListener('keydown', handleKeyDown)
      animateBackground()
    }

    initGame()

    const handleResize = () => { calculateResponsiveSize() }
    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(gameInterval)
      cancelAnimationFrame(bgAnimationId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden select-none relative" style={{ touchAction: 'none', background: '#0a0a1a' }}>
      <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />

      <div className="relative" style={{ zIndex: 1 }}>
        <canvas ref={canvasRef} className="block mx-auto shadow-2xl" style={{ imageRendering: 'pixelated', borderRadius: '4px' }} />

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded">
            <h2 className="text-3xl font-bold text-yellow-400 mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>GAME OVER</h2>
            <p className="text-white text-lg mb-4" style={{ fontFamily: 'monospace' }}>SCORE: {finalScore}</p>
            <button onClick={restartGame} className="px-6 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300 transition-colors" style={{ fontFamily: 'monospace' }}>
              RESTART
            </button>
          </div>
        )}
      </div>
    </div>
  )
}