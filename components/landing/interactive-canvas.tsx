'use client'

import React, { useEffect, useRef } from 'react'

export function InteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const mouse = {
      x: width / 2,
      y: height / 2,
      radius: 180,
      isActive: false,
    }

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.isActive = true
    }

    const handleMouseLeave = () => {
      mouse.isActive = false
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)

    // Particle system
    const particleCount = Math.min(Math.floor((width * height) / 14000), 85)
    const particles: Particle[] = []

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      baseAlpha: number
      color: string

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.6
        this.vy = (Math.random() - 0.5) * 0.6
        this.size = Math.random() * 2 + 1
        this.baseAlpha = Math.random() * 0.5 + 0.2
        const colors = ['#c084fc', '#a855f7', '#8b5cf6', '#6366f1', '#d8b4fe']
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Bounce on edges
        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1

        // Mouse interaction
        if (mouse.isActive) {
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius
            const angle = Math.atan2(dy, dx)
            this.x -= Math.cos(angle) * force * 2.5
            this.y -= Math.sin(angle) * force * 2.5
          }
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath()
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        context.fillStyle = this.color
        context.shadowBlur = 8
        context.shadowColor = this.color
        context.globalAlpha = this.baseAlpha
        context.fill()
        context.shadowBlur = 0
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    let time = 0

    const render = () => {
      time += 0.005
      ctx.clearRect(0, 0, width, height)

      // Connect particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 130) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            const alpha = (1 - dist / 130) * 0.22
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
        }
      }

      // Draw mouse connections
      if (mouse.isActive) {
        for (let i = 0; i < particles.length; i++) {
          const dx = mouse.x - particles[i].x
          const dy = mouse.y - particles[i].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < mouse.radius) {
            ctx.beginPath()
            ctx.moveTo(mouse.x, mouse.y)
            ctx.lineTo(particles[i].x, particles[i].y)
            const alpha = (1 - dist / mouse.radius) * 0.35
            ctx.strokeStyle = `rgba(192, 132, 252, ${alpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      // Update & Draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw(ctx)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Dynamic interactive canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Large Ambient Neo-Violet Orbs */}
      <div className="absolute -top-48 left-1/4 h-[700px] w-[700px] rounded-full bg-[#9333ea] opacity-[0.14] blur-[160px] animate-pulse" />
      <div className="absolute top-1/3 -right-48 h-[600px] w-[600px] rounded-full bg-[#7c3aed] opacity-[0.12] blur-[150px]" />
      <div className="absolute -bottom-48 left-1/3 h-[600px] w-[600px] rounded-full bg-[#4f46e5] opacity-[0.1] blur-[150px]" />

      {/* Subtle cyber grid and vignette overlay */}
      <div className="cyber-grid absolute inset-0 opacity-[0.35]" />
      <div className="vignette absolute inset-0" />
    </div>
  )
}
