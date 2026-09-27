"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface AntigravityBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  ringSpacing?: number;
  dotSpacing?: number;
  minRadius?: number;
  centerShiftStrength?: number;
  dispersionRadius?: number;
  dispersionStrength?: number;
  color?: string;
  glowColor?: string;
  fadeMask?: boolean;
  interactive?: boolean;
  children?: React.ReactNode;
  className?: string;
}

interface RingParticle {
  ringIndex: number;
  radius: number;
  angle: number;
  angularSpeed: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  depthFactor: number;
  twinklePhase: number;
}

export function AntigravityBackground({
  ringSpacing = 22,
  dotSpacing = 15,
  minRadius = 28,
  centerShiftStrength = 0.42,
  dispersionRadius = 110,
  dispersionStrength = 16,
  color = "#0F52BA", // Sapphire primary
  glowColor = "#38bdf8", // Sapphire vivid glow
  fadeMask = true,
  interactive = true,
  children,
  className,
  ...props
}: AntigravityBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isVisibleRef = useRef<boolean>(true);
  const animFrameId = useRef<number | null>(null);

  const mouseRef = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  const centerOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [interactive]
  );

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: null, y: null };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!interactive || !containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    },
    [interactive]
  );

  const handleTouchEnd = useCallback(() => {
    mouseRef.current = { x: null, y: null };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: RingParticle[] = [];

    // Initialize dense concentric rings of particles inspired by Google Antigravity
    const initParticles = () => {
      particles = [];
      const centerX = width / 2;
      const centerY = height * 0.48;

      // Calculate max radius to cover entire viewport corners
      const maxRadius = Math.hypot(width, height) * 0.68;
      const numRings = Math.max(12, Math.floor((maxRadius - minRadius) / ringSpacing));

      for (let rIdx = 0; rIdx < numRings; rIdx++) {
        const radius = minRadius + rIdx * ringSpacing;
        const circumference = 2 * Math.PI * radius;
        const count = Math.max(8, Math.round(circumference / dotSpacing));
        const angleStep = (Math.PI * 2) / count;

        // Subtle alternating orbital rotation for celestial feel
        const dir = rIdx % 2 === 0 ? 1 : -1;
        const speed = (0.0003 + (rIdx * 0.00002)) * dir;

        // Depth factor for 3D tunnel shift (inner rings shift more, creating realistic 3D depth)
        const depthFactor = 1.0 - (rIdx / numRings) * 0.55;

        // Dot size based on ring depth
        const baseSize = rIdx < 4 ? 1.8 : rIdx < 16 ? 1.5 : 1.25;

        for (let i = 0; i < count; i++) {
          const angle = i * angleStep;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          particles.push({
            ringIndex: rIdx,
            radius,
            angle,
            angularSpeed: speed,
            x,
            y,
            vx: 0,
            vy: 0,
            baseSize,
            depthFactor,
            twinklePhase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const handleResize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      initParticles();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && animFrameId.current === null) {
          render();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Animation loop
    const render = () => {
      if (!isVisibleRef.current) {
        animFrameId.current = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const baseCenterX = width / 2;
      const baseCenterY = height * 0.48;
      const mouse = mouseRef.current;

      // Smooth center shifting towards cursor ("Move your cursor to shift the ring center")
      let targetOffsetX = 0;
      let targetOffsetY = 0;

      if (mouse.x !== null && mouse.y !== null) {
        targetOffsetX = (mouse.x - baseCenterX) * centerShiftStrength;
        targetOffsetY = (mouse.y - baseCenterY) * centerShiftStrength;
      }

      // Smooth lerp for center offset
      centerOffsetRef.current.x += (targetOffsetX - centerOffsetRef.current.x) * 0.07;
      centerOffsetRef.current.y += (targetOffsetY - centerOffsetRef.current.y) * 0.07;

      const offsetX = centerOffsetRef.current.x;
      const offsetY = centerOffsetRef.current.y;

      const count = particles.length;

      // Group particles for high performance batch rendering
      // Path 1: Standard dots (Deep Sapphire)
      // Path 2: Highlighted dots near cursor (Electric Sapphire Glow)
      ctx.beginPath();
      const glowingParticles: { x: number; y: number; size: number; alpha: number }[] = [];

      for (let i = 0; i < count; i++) {
        const p = particles[i];

        // Orbit update
        p.angle += p.angularSpeed;

        // Current ring center with 3D parallax depth factor
        const ringCenterX = baseCenterX + offsetX * p.depthFactor;
        const ringCenterY = baseCenterY + offsetY * p.depthFactor;

        // Target position on concentric circle
        const targetX = ringCenterX + Math.cos(p.angle) * p.radius;
        const targetY = ringCenterY + Math.sin(p.angle) * p.radius;

        // Cursor dispersion physics
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < dispersionRadius && dist > 0.001) {
            const force =
              Math.pow(1 - dist / dispersionRadius, 1.6) * dispersionStrength;
            const normX = dx / dist;
            const normY = dy / dist;

            p.vx += normX * force;
            p.vy += normY * force;
          }
        }

        // Harmonic spring return to orbital position
        p.vx += (targetX - p.x) * 0.085;
        p.vy += (targetY - p.y) * 0.085;

        // Physics damping
        p.vx *= 0.82;
        p.vy *= 0.82;

        p.x += p.vx;
        p.y += p.vy;

        // Distance from cursor for highlight detection
        let isCursorGlow = false;
        let cursorGlowFactor = 0;

        if (mouse.x !== null && mouse.y !== null) {
          const mDist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (mDist < 130) {
            isCursorGlow = true;
            cursorGlowFactor = 1 - mDist / 130;
          }
        }

        if (isCursorGlow) {
          glowingParticles.push({
            x: p.x,
            y: p.y,
            size: p.baseSize * (1 + cursorGlowFactor * 0.6),
            alpha: 0.7 + cursorGlowFactor * 0.3,
          });
        } else {
          // Add to standard batch path
          ctx.moveTo(p.x + p.baseSize, p.y);
          ctx.arc(p.x, p.y, p.baseSize, 0, Math.PI * 2);
        }
      }

      // Draw standard batch of dots (Rich Sapphire)
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.fill();

      // Draw highlighted glowing dots near mouse
      if (glowingParticles.length > 0) {
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = glowColor;
        ctx.fillStyle = glowColor;

        for (let j = 0; j < glowingParticles.length; j++) {
          const gp = glowingParticles[j];
          ctx.beginPath();
          ctx.globalAlpha = gp.alpha;
          ctx.arc(gp.x, gp.y, gp.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [
    ringSpacing,
    dotSpacing,
    minRadius,
    centerShiftStrength,
    dispersionRadius,
    dispersionStrength,
    color,
    glowColor,
  ]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn("relative w-full overflow-hidden", className)}
      {...props}
    >
      {/* High-density Concentric Ring-Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        style={{ display: "block" }}
      />

      {/* Radial vignette mask blending softly into Onyx background */}
      {fadeMask && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_48%,transparent_35%,#020202_95%)]"
        />
      )}

      {/* Content slot */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

export default AntigravityBackground;
