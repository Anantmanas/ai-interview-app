'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface HeroPyramid {
  group: THREE.Group
  lineMat: THREE.LineBasicMaterial
  faceMat: THREE.MeshBasicMaterial
  basePos: THREE.Vector3
  driftSpeed: THREE.Vector3
  rotSpeed: THREE.Vector3
  baseScale: number
  currentScale: number
  baseOpacity: number
  currentOpacity: number
}

export default function DalaBrainCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // ── 1. Scene, Camera & WebGL Renderer ──
    const scene = new THREE.Scene()
    scene.background = null

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight
    const isMobile = width < 768

    let animId: number = 0
    let isContextLost = false

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 4.8)

    const isWebGLAvailable = () => {
      try {
        const testCanvas = document.createElement('canvas')
        return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')))
      } catch {
        return false
      }
    }

    if (!isWebGLAvailable()) {
      return
    }

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)

    const handleContextLost = (e: Event) => {
      e.preventDefault()
      isContextLost = true
      if (animId) cancelAnimationFrame(animId)
    }

    const handleContextRestored = () => {
      isContextLost = false
      animId = requestAnimationFrame(animate)
    }

    canvas.addEventListener('webglcontextlost', handleContextLost, false)
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false)

    // ── 2. Sprite Textures: Delta Triangle & Circular Micro-Dust ──
    // ── 2. Sprite Textures: High-Fidelity Equilateral Delta Triangle (△) ──
    const createTriangleTexture = () => {
      const texCanvas = document.createElement('canvas')
      texCanvas.width = 256
      texCanvas.height = 256
      const ctx = texCanvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, 256, 256)

        // Atmospheric radial glow
        const glow = ctx.createRadialGradient(128, 138, 8, 128, 138, 120)
        glow.addColorStop(0, 'rgba(255, 255, 255, 0.65)')
        glow.addColorStop(0.32, 'rgba(255, 255, 255, 0.22)')
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = glow
        ctx.fillRect(0, 0, 256, 256)

        // Dala Signature Equilateral Wireframe Triangle (Delta)
        ctx.beginPath()
        ctx.moveTo(128, 22)
        ctx.lineTo(236, 212)
        ctx.lineTo(20, 212)
        ctx.closePath()

        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
        ctx.fill()

        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 12.0
        ctx.lineJoin = 'round'
        ctx.stroke()

        // Center synaptic core node
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(128, 138, 9.5, 0, Math.PI * 2)
        ctx.fill()
      }
      const texture = new THREE.CanvasTexture(texCanvas)
      texture.generateMipmaps = true
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.needsUpdate = true
      return texture
    }

    const triangleTexture = createTriangleTexture()

    // ── 3. Tier 3: Ambient Chromatic Outlined Triangle Field (Adaptive Particles) ──
    // Strictly matching DESIGN(system).md L126-129 & L165: Outlined triangles in saturated chromatic colors, never grayscale
    const dustCount = isMobile ? 450 : 850
    const dustGeo = new THREE.BufferGeometry()
    const dustPositions = new Float32Array(dustCount * 3)
    const dustColors = new Float32Array(dustCount * 3)

    const ambientChromaticPalette = [
      { r: 0.502, g: 0.322, b: 1.000 }, // Electric Iris (#8052ff)
      { r: 1.000, g: 0.722, b: 0.161 }, // Saffron Spark (#ffb829)
      { r: 0.082, g: 0.518, b: 0.431 }, // Deep Verdant (#15846e)
      { r: 0.925, g: 0.282, b: 0.600 }, // Rose Magenta (#ec4899)
      { r: 0.024, g: 0.714, b: 0.831 }, // Electric Cyan (#06b6d4)
      { r: 0.231, g: 0.510, b: 0.965 }, // Vivid Blue (#3b82f6)
      { r: 0.659, g: 0.333, b: 0.969 }, // Bright Violet (#a855f7)
    ]

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 14     // X spread
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 10 // Y spread
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 8  // Z depth

      const col = ambientChromaticPalette[i % ambientChromaticPalette.length]
      dustColors[i * 3] = col.r
      dustColors[i * 3 + 1] = col.g
      dustColors[i * 3 + 2] = col.b
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3))

    const dustMat = new THREE.PointsMaterial({
      size: 0.024,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: triangleTexture,
    })
    const dustPoints = new THREE.Points(dustGeo, dustMat)
    scene.add(dustPoints)

    // ── 4. Tier 1: Hero 3D Wireframe Tetrahedrons (Pyramids with Tumbling Physics) ──
    // Construct regular 3D tetrahedron wireframe & translucent faces
    const v0 = new THREE.Vector3(0, 0.85, 0)
    const v1 = new THREE.Vector3(-0.72, -0.42, 0.48)
    const v2 = new THREE.Vector3(0.72, -0.42, 0.48)
    const v3 = new THREE.Vector3(0, -0.42, -0.76)

    // 6 wireframe edges = 12 line vertices
    const edgeVertices = new Float32Array([
      v0.x, v0.y, v0.z,  v1.x, v1.y, v1.z,
      v0.x, v0.y, v0.z,  v2.x, v2.y, v2.z,
      v0.x, v0.y, v0.z,  v3.x, v3.y, v3.z,
      v1.x, v1.y, v1.z,  v2.x, v2.y, v2.z,
      v2.x, v2.y, v2.z,  v3.x, v3.y, v3.z,
      v3.x, v3.y, v3.z,  v1.x, v1.y, v1.z,
    ])
    const tetrahedronEdgeGeo = new THREE.BufferGeometry()
    tetrahedronEdgeGeo.setAttribute('position', new THREE.BufferAttribute(edgeVertices, 3))

    // 4 triangular faces = 12 vertices
    const faceVertices = new Float32Array([
      v0.x, v0.y, v0.z,  v1.x, v1.y, v1.z,  v2.x, v2.y, v2.z,
      v0.x, v0.y, v0.z,  v2.x, v2.y, v2.z,  v3.x, v3.y, v3.z,
      v0.x, v0.y, v0.z,  v3.x, v3.y, v3.z,  v1.x, v1.y, v1.z,
      v1.x, v1.y, v1.z,  v3.x, v3.y, v3.z,  v2.x, v2.y, v2.z,
    ])
    const tetrahedronFaceGeo = new THREE.BufferGeometry()
    tetrahedronFaceGeo.setAttribute('position', new THREE.BufferAttribute(faceVertices, 3))
    tetrahedronFaceGeo.computeVertexNormals()

    // Dala 4-Band Chromatic Palette for Hero Pyramids
    const pyramidPalette = [
      0xffb829, // Warm Amber Gold
      0xffffff, // Platinum Silver White
      0xec4899, // Vivid Rose / Magenta
      0x8052ff, // Signature Electric Iris
      0x06b6d4, // Electric Cyan
      0x15846e, // Signal Teal
    ]

    const heroPyramids: HeroPyramid[] = []
    const heroPyramidsGroup = new THREE.Group()
    scene.add(heroPyramidsGroup)

    // Spawn 28 standalone 3D wireframe pyramids distributed across viewport depth
    const pyramidConfigs = [
      // Upper Right Hero Quadrant (Harmonizes with hero brain & cockpit)
      { x: 1.6, y: 1.2, z: 1.4, s: 0.14, color: 0xffb829 },
      { x: 2.3, y: 0.6, z: 1.8, s: 0.17, color: 0xffffff },
      { x: 1.1, y: 1.7, z: 0.9, s: 0.11, color: 0xffb829 },
      { x: 2.8, y: 1.4, z: 1.2, s: 0.15, color: 0xec4899 },
      { x: 1.9, y: -0.4, z: 1.6, s: 0.13, color: 0x8052ff },
      { x: 2.5, y: -0.9, z: 1.3, s: 0.16, color: 0x06b6d4 },
      { x: 1.2, y: -1.3, z: 1.1, s: 0.10, color: 0x15846e },
      { x: 3.1, y: 0.1, z: 1.9, s: 0.18, color: 0xffb829 },
      { x: 2.1, y: 1.9, z: 0.7, s: 0.09, color: 0xffffff },
      { x: 1.4, y: 0.2, z: 2.1, s: 0.15, color: 0xec4899 },
      { x: 2.7, y: -1.6, z: 1.4, s: 0.12, color: 0x8052ff },
      { x: 0.9, y: -0.7, z: 1.7, s: 0.11, color: 0x06b6d4 },
      { x: 3.3, y: 1.0, z: 1.1, s: 0.13, color: 0xffb829 },
      { x: 1.7, y: -1.8, z: 1.5, s: 0.12, color: 0x15846e },

      // Mid / Left Field (Creates balanced negative space & responsive framing)
      { x: -1.2, y: 1.4, z: 1.3, s: 0.13, color: 0xffb829 },
      { x: -2.1, y: 0.8, z: 1.7, s: 0.16, color: 0xffffff },
      { x: -1.6, y: -0.2, z: 1.5, s: 0.14, color: 0xec4899 },
      { x: -2.6, y: -0.9, z: 1.8, s: 0.17, color: 0x8052ff },
      { x: -0.8, y: 1.9, z: 0.8, s: 0.10, color: 0xffb829 },
      { x: -2.9, y: 1.3, z: 1.2, s: 0.12, color: 0x06b6d4 },
      { x: -1.4, y: -1.4, z: 1.6, s: 0.13, color: 0x15846e },
      { x: -2.2, y: -1.8, z: 1.1, s: 0.11, color: 0x8052ff },

      // Viewport Perimeter & Lower Float (Continuity across sections)
      { x: -0.2, y: 2.1, z: 1.0, s: 0.11, color: 0xffffff },
      { x: 0.3, y: -2.0, z: 1.4, s: 0.13, color: 0x06b6d4 },
      { x: -3.3, y: 0.2, z: 1.5, s: 0.14, color: 0xec4899 },
      { x: 0.6, y: 2.3, z: 0.9, s: 0.10, color: 0xffb829 },
      { x: -1.9, y: 2.2, z: 1.2, s: 0.12, color: 0x8052ff },
      { x: 3.4, y: -0.8, z: 1.6, s: 0.15, color: 0x06b6d4 },
    ]

    for (let i = 0; i < pyramidConfigs.length; i++) {
      const cfg = pyramidConfigs[i]
      const colorVal = cfg.color || pyramidPalette[i % pyramidPalette.length]
      const baseOpacity = 0.55 + Math.random() * 0.35

      const lineMat = new THREE.LineBasicMaterial({
        color: colorVal,
        transparent: true,
        opacity: baseOpacity,
        blending: THREE.AdditiveBlending,
      })

      const faceMat = new THREE.MeshBasicMaterial({
        color: colorVal,
        transparent: true,
        opacity: baseOpacity * 0.12,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      const lines = new THREE.LineSegments(tetrahedronEdgeGeo, lineMat)
      const mesh = new THREE.Mesh(tetrahedronFaceGeo, faceMat)

      const pGroup = new THREE.Group()
      pGroup.add(lines)
      pGroup.add(mesh)
      pGroup.position.set(cfg.x, cfg.y, cfg.z)
      pGroup.scale.set(cfg.s, cfg.s, cfg.s)

      // Random starting orientations
      pGroup.rotation.x = Math.random() * Math.PI * 2
      pGroup.rotation.y = Math.random() * Math.PI * 2
      pGroup.rotation.z = Math.random() * Math.PI * 2

      heroPyramidsGroup.add(pGroup)

      heroPyramids.push({
        group: pGroup,
        lineMat,
        faceMat,
        basePos: new THREE.Vector3(cfg.x, cfg.y, cfg.z),
        driftSpeed: new THREE.Vector3(
          0.3 + Math.random() * 0.4,
          0.35 + Math.random() * 0.4,
          0.25 + Math.random() * 0.3
        ),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.022,
          (Math.random() - 0.5) * 0.026,
          (Math.random() - 0.5) * 0.022
        ),
        baseScale: cfg.s,
        currentScale: cfg.s,
        baseOpacity,
        currentOpacity: baseOpacity,
      })
    }

    // ── 5. Tier 2: 5-Stage Morphing Neural Constellation (Adaptive Budget: 5,200 mobile / 9,500 desktop) ──
    const count = isMobile ? 5200 : 9500
    const positions = new Float32Array(count * 3)
    const brainPositions = new Float32Array(count * 3)
    const dispersePositions = new Float32Array(count * 3)
    const globePositions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const stemCount = Math.floor(count * 0.14)

    for (let i = 0; i < count; i++) {
      let bx = 0
      let by = 0
      let bz = 0
      let rCol = 1.0
      let gCol = 1.0
      let bCol = 1.0

      if (i < stemCount) {
        // ── Downward Brainstem (medulla oblongata / pons) matching Screenshot-1.png ──
        const stemProgress = i / stemCount // 0 (top) to 1 (bottom)
        by = -0.38 - stemProgress * 1.25 // downwards from -0.38 to -1.63
        const stemRadius = (0.24 - stemProgress * 0.10) * Math.pow(Math.random(), 0.5)
        const stemAngle = Math.random() * Math.PI * 2
        bx = stemRadius * Math.cos(stemAngle) + (Math.random() - 0.5) * 0.05
        bz = -0.15 + stemRadius * Math.sin(stemAngle) + (Math.random() - 0.5) * 0.05

        // Downward stem color: Electric Cyan (#06b6d4) & Signal Teal (#15846e)
        const stemT = Math.random()
        rCol = 0.02 + 0.06 * stemT
        gCol = 0.55 + 0.22 * stemT
        bCol = 0.75 + 0.20 * stemT
      } else {
        // ── Volumetric Dual-Hemisphere Cerebrum with Sulci Folds ──
        const isLeft = Math.random() > 0.5
        const hemisphere = isLeft ? -1 : 1
        const r = Math.pow(Math.random(), 0.42)
        const theta = Math.random() * 2.0 * Math.PI
        const phi = Math.acos(2.0 * Math.random() - 1.0)

        bx = 1.15 * Math.sin(phi) * Math.cos(theta)
        by = 0.88 * Math.cos(phi)
        bz = 1.40 * Math.sin(phi) * Math.sin(theta)

        bx *= (1.0 - 0.16 * bz)
        by *= (1.0 - 0.10 * bz)

        if (by < -0.30 && bz < -0.1) {
          bx *= 0.65
          bz *= 0.65
        }

        const fold = Math.sin(bx * 4.4) * Math.cos(by * 4.4) * Math.sin(bz * 3.4) * 0.15
        bx = (bx * r + fold) + (hemisphere * 0.14)
        by = by * r + fold * 0.8
        bz = bz * r + fold

        // ── Color Mapping matching Screenshot-1.png & Video ──
        const upperParietalCurve = by > 0.38 || (by > 0.15 && Math.hypot(bx, bz) > 0.95)
        if (upperParietalCurve) {
          // Vibrant Golden Amber Crown (#ffb829 / #ffc83b) with platinum accents
          if (Math.random() > 0.28) {
            // Saturated Saffron Spark / Golden Amber
            rCol = 1.000
            gCol = 0.720 + Math.random() * 0.08
            bCol = 0.140 + Math.random() * 0.08
          } else {
            // Sparkling Pure White core highlight
            rCol = 1.000
            gCol = 1.000
            bCol = 1.000
          }
        } else if (by > -0.05) {
          // Mid-section: Dense White & Electric Iris Violet (#8052ff)
          if (Math.random() > 0.45) {
            rCol = 0.502 + (Math.random() - 0.5) * 0.1
            gCol = 0.322 + (Math.random() - 0.5) * 0.1
            bCol = 1.000
          } else {
            rCol = 0.950
            gCol = 0.950
            bCol = 1.000
          }
        } else {
          // Lower Lobes: Electric Iris transitioning to Cyan & Emerald
          if (Math.random() > 0.5) {
            rCol = 0.040 + Math.random() * 0.08
            gCol = 0.650 + Math.random() * 0.15
            bCol = 0.820 + Math.random() * 0.15
          } else {
            rCol = 0.880 + Math.random() * 0.10
            gCol = 0.280 + Math.random() * 0.08
            bCol = 0.600 + Math.random() * 0.10
          }
        }
      }

      brainPositions[i * 3] = bx
      brainPositions[i * 3 + 1] = by
      brainPositions[i * 3 + 2] = bz

      positions[i * 3] = bx
      positions[i * 3 + 1] = by
      positions[i * 3 + 2] = bz

      colors[i * 3] = rCol
      colors[i * 3 + 1] = gCol
      colors[i * 3 + 2] = bCol

      // ── Geometry State 3: Dispersed Viewport-Wide Constellation ──
      const dr = 1.1 + Math.random() * 2.6
      const dTheta = Math.random() * 2.0 * Math.PI
      const dPhi = Math.acos(2.0 * Math.random() - 1.0)
      dispersePositions[i * 3] = dr * 1.55 * Math.sin(dPhi) * Math.cos(dTheta)
      dispersePositions[i * 3 + 1] = dr * 1.05 * Math.cos(dPhi)
      dispersePositions[i * 3 + 2] = dr * 1.35 * Math.sin(dPhi) * Math.sin(dTheta)

      // ── Geometry State 4: Wireframe Spherical Globe ──
      const gr = 1.42 + (Math.random() - 0.5) * 0.12
      const gTheta = Math.random() * 2.0 * Math.PI
      const gPhi = Math.acos(2.0 * Math.random() - 1.0)
      globePositions[i * 3] = gr * Math.sin(gPhi) * Math.cos(gTheta)
      globePositions[i * 3 + 1] = gr * Math.cos(gPhi)
      globePositions[i * 3 + 2] = gr * Math.sin(gPhi) * Math.sin(gTheta)
    }

    const brainGeometry = new THREE.BufferGeometry()
    brainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    brainGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const brainMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.062 : 0.054,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: triangleTexture,
    })

    const brainPoints = new THREE.Points(brainGeometry, brainMaterial)

    const brainGroup = new THREE.Group()
    brainGroup.add(brainPoints)
    brainGroup.rotation.x = 0.22
    brainGroup.rotation.z = -0.05

    // Calibrated responsive desktop placement
    const initialWidth = width
    const initialRespFactor = Math.min(1.0, Math.max(0.5, (initialWidth - 360) / 760))
    brainGroup.position.x = 1.35 * initialRespFactor
    brainGroup.position.y = 0

    scene.add(brainGroup)

    // ── 6. Mouse Interaction & Raycasting Proximity Force Field ──
    let targetMouseX = 0
    let targetMouseY = 0
    let mouseX = 0
    let mouseY = 0

    const raycaster = new THREE.Raycaster()
    const mouseVec = new THREE.Vector2()
    const tempClosestPoint = new THREE.Vector3()
    const tempDirToRay = new THREE.Vector3()

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }

    const handleMouseLeave = () => {
      targetMouseX = 0
      targetMouseY = 0
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    // ── 7. Scroll Progress Engine ──
    let targetScrollProgress = 0
    let currentScrollProgress = 0

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      targetScrollProgress = Math.min(1, Math.max(0, scrollY / maxScroll))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    // ── 8. Responsive Window / Container Resize ──
    const handleResize = () => {
      if (!container || !renderer || !camera) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      handleScroll()
    }

    window.addEventListener('resize', handleResize)

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => handleResize())
      ro.observe(container)
    }

    // ── 9. Render, Physics & 5-Stage Spatial Morphing Loop ──
    const clock = new THREE.Clock()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId)
      } else if (!isContextLost) {
        animId = requestAnimationFrame(animate)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const animate = () => {
      if (isContextLost) return
      animId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Smooth scroll interpolation
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.045
      const p = currentScrollProgress

      // Tier 3: Dust field slow ambient drift & floating sine oscillation
      dustPoints.rotation.y += 0.0004
      dustPoints.position.y = Math.sin(elapsedTime * 0.4) * 0.08

      // Continuous fluid auto-rotation on Y-axis for brain
      brainPoints.rotation.y += 0.0016

      // Spring-damped cursor parallax
      mouseX += (targetMouseX - mouseX) * 0.045
      mouseY += (targetMouseY - mouseY) * 0.045

      // Mouse ray calculation for proximity force field
      mouseVec.set(mouseX, mouseY)
      raycaster.setFromCamera(mouseVec, camera)
      const ray = raycaster.ray

      // ── Tier 1: Hero Pyramids 3D Tumbling & Cursor Proximity Force Field ──
      const proximityThreshold = 1.75

      for (let i = 0; i < heroPyramids.length; i++) {
        const pyr = heroPyramids[i]

        // 1. Autonomous 3D Tumble Physics (Independent wx, wy, wz)
        pyr.group.rotation.x += pyr.rotSpeed.x
        pyr.group.rotation.y += pyr.rotSpeed.y
        pyr.group.rotation.z += pyr.rotSpeed.z

        // 2. Slow Ambient Floating Drift + Scroll Parallax
        const driftX = Math.sin(elapsedTime * pyr.driftSpeed.x) * 0.12
        const driftY = Math.cos(elapsedTime * pyr.driftSpeed.y) * 0.14 - p * pyr.basePos.z * 0.35
        const driftZ = Math.sin(elapsedTime * pyr.driftSpeed.z) * 0.08

        pyr.group.position.x = pyr.basePos.x + driftX
        pyr.group.position.y = pyr.basePos.y + driftY
        pyr.group.position.z = pyr.basePos.z + driftZ

        // 3. Mouse Cursor Proximity Force Field
        const distToRay = ray.distanceToPoint(pyr.group.position)

        if (distToRay < proximityThreshold) {
          const prox = 1.0 - distToRay / proximityThreshold // 0 to 1
          const targetScale = pyr.baseScale * (1.0 + prox * 0.5)
          const targetOpacity = Math.min(1.0, pyr.baseOpacity + prox * 0.45)

          pyr.currentScale += (targetScale - pyr.currentScale) * 0.1
          pyr.currentOpacity += (targetOpacity - pyr.currentOpacity) * 0.1

          // Tilt apex towards cursor ray
          ray.closestPointToPoint(pyr.group.position, tempClosestPoint)
          tempDirToRay.subVectors(tempClosestPoint, pyr.group.position).normalize()
          pyr.group.rotation.x += tempDirToRay.y * prox * 0.03
          pyr.group.rotation.y += tempDirToRay.x * prox * 0.03
        } else {
          pyr.currentScale += (pyr.baseScale - pyr.currentScale) * 0.08
          pyr.currentOpacity += (pyr.baseOpacity - pyr.currentOpacity) * 0.08
        }

        pyr.group.scale.set(pyr.currentScale, pyr.currentScale, pyr.currentScale)
        pyr.lineMat.opacity = pyr.currentOpacity
        pyr.faceMat.opacity = pyr.currentOpacity * 0.12
      }

      // ── Responsive Factor Calculation ──
      const currentWidth = container.clientWidth || window.innerWidth
      const responsiveFactor = Math.min(1.0, Math.max(0.45, (currentWidth - 360) / 760))

      // ── Five-Stage Waypoint Spatial Interpolation ──
      let targetX = 0
      let targetY = 0
      let targetZ = 0
      let targetScale = 1.0
      let targetRotX = 0.22
      let targetRotZ = -0.05
      let targetOpacity = 0.88

      let disperseWeight = 0
      let globeWeight = 0

      if (p < 0.18) {
        // Stage 1: Hero (Right Brain)
        const t = p / 0.18
        const baseRightX = 1.35 * responsiveFactor
        targetX = baseRightX * (1 - t * 0.3)
        targetY = -0.05 * t
        targetZ = 0
        targetScale = 1.0 - t * 0.08
        targetRotX = 0.22
        targetRotZ = -0.05
      } else if (p < 0.38) {
        // Stage 2: Features (Slides to Left Column negative space)
        const t = (p - 0.18) / 0.20
        const startX = 0.95 * responsiveFactor
        const endX = -1.85 * responsiveFactor
        targetX = startX + (endX - startX) * t
        targetY = -0.05 - t * 0.18
        targetZ = -t * 0.35
        targetScale = 0.92 - t * 0.12
        targetRotX = 0.22 - t * 0.1
        targetRotZ = -0.05 + t * 0.12
      } else if (p < 0.65) {
        // Stage 3: Curriculum / Manifesto (Expands Outward into Constellation)
        const t = (p - 0.38) / 0.27
        const startX = -1.85 * responsiveFactor
        targetX = startX * (1 - t)
        targetY = -0.23 * (1 - t)
        targetZ = -0.35 - t * 0.15
        targetScale = 0.8 + t * 0.45
        targetRotX = 0.12 * (1 - t)
        targetRotZ = 0.07 * (1 - t)
        disperseWeight = Math.min(1, Math.max(0, t * 1.15))
        targetOpacity = 0.88 - t * 0.12
      } else if (p < 0.85) {
        // Stage 4: Simulations & Cockpit (Reassembles into Wireframe Globe on Right)
        const t = (p - 0.65) / 0.20
        const endX = 1.95 * responsiveFactor
        targetX = t * endX
        targetY = t * 0.08
        targetZ = -0.5 + t * 0.3
        targetScale = 1.25 + t * 0.15
        targetRotX = t * 0.18
        targetRotZ = -t * 0.08
        disperseWeight = 1 - t
        globeWeight = Math.min(1, Math.max(0, t * 1.2))
        targetOpacity = 0.76 + t * 0.12
      } else {
        // Stage 5: FAQ & Footer (Ambient Starfield Dissolution)
        const t = (p - 0.85) / 0.15
        const startX = 1.95 * responsiveFactor
        targetX = startX * (1 - t)
        targetY = -t * 0.25
        targetZ = -0.2 - t * 0.5
        targetScale = 1.4 - t * 0.25
        targetRotX = 0.18 * (1 - t)
        targetRotZ = -0.08 * (1 - t)
        globeWeight = 1 - t
        disperseWeight = t * 0.6
        targetOpacity = Math.max(0.45, 0.88 - t * 0.4)
      }

      // Apply interpolated transform with damping
      brainGroup.position.x += (targetX - brainGroup.position.x) * 0.06
      brainGroup.position.y += (targetY - brainGroup.position.y) * 0.06
      brainGroup.position.z += (targetZ - brainGroup.position.z) * 0.06

      const curScale = brainGroup.scale.x
      const newScale = curScale + (targetScale - curScale) * 0.06
      brainGroup.scale.set(newScale, newScale, newScale)

      brainGroup.rotation.x = targetRotX - mouseY * 0.18
      brainGroup.rotation.y = mouseX * 0.25
      brainGroup.rotation.z = targetRotZ

      brainMaterial.opacity += (targetOpacity - brainMaterial.opacity) * 0.05

      // ── Vertex Position Interpolation (Morphing Brain -> Constellation -> Globe) ──
      const posAttr = brainGeometry.attributes.position as THREE.BufferAttribute
      const posArr = posAttr.array as Float32Array
      const pulse = Math.sin(elapsedTime * 1.5) * 0.015

      const hasDisperse = disperseWeight > 0.001
      const hasGlobe = globeWeight > 0.001

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const bx = brainPositions[i3]
        const by = brainPositions[i3 + 1]
        const bz = brainPositions[i3 + 2]

        // Base morph interpolation
        let mx = bx
        let my = by
        let mz = bz

        if (hasDisperse) {
          const dx = dispersePositions[i3]
          const dy = dispersePositions[i3 + 1]
          const dz = dispersePositions[i3 + 2]
          mx = mx * (1 - disperseWeight) + dx * disperseWeight
          my = my * (1 - disperseWeight) + dy * disperseWeight
          mz = mz * (1 - disperseWeight) + dz * disperseWeight
        }

        if (hasGlobe) {
          const gx = globePositions[i3]
          const gy = globePositions[i3 + 1]
          const gz = globePositions[i3 + 2]
          mx = mx * (1 - globeWeight) + gx * globeWeight
          my = my * (1 - globeWeight) + gy * globeWeight
          mz = mz * (1 - globeWeight) + gz * globeWeight
        }

        // Harmonic organic breathing ripple
        const ripple = Math.sin(elapsedTime * 2.0 + my * 2.8 + mx * 2.2) * 0.006
        const factor = 1.0 + pulse + ripple

        posArr[i3] = mx * factor
        posArr[i3 + 1] = my * factor
        posArr[i3 + 2] = mz * factor
      }

      posAttr.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    // ── 10. Cleanup & Disposal ──
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      if (ro) ro.disconnect()

      dustGeo.dispose()
      dustMat.dispose()
      tetrahedronEdgeGeo.dispose()
      tetrahedronFaceGeo.dispose()
      brainGeometry.dispose()
      brainMaterial.dispose()
      triangleTexture.dispose()

      for (const pyr of heroPyramids) {
        pyr.lineMat.dispose()
        pyr.faceMat.dispose()
      }

      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
