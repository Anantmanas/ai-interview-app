"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface DottedGlowBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number;
  radius?: number;
  opacity?: number;
  speed?: number;
  speedMin?: number;
  speedMax?: number;
  speedScale?: number;
  color?: string;
  darkColor?: string;
  glowColor?: string;
  darkGlowColor?: string;
  colorLightVar?: string;
  colorDarkVar?: string;
  glowColorLightVar?: string;
  glowColorDarkVar?: string;
  fadeMask?: boolean;
  children?: React.ReactNode;
  className?: string;
}

interface Dot {
  x: number;
  y: number;
  phase: number;
  speed: number;
  baseRadius: number;
}

/**
 * Resolves a CSS variable string (e.g., "var(--color-signal-green)" or "--color-signal-green")
 * to its actual computed color value in the DOM.
 */
function resolveColor(value: string | undefined, element: HTMLElement | null): string | null {
  if (!value) return null;
  if (!element || typeof window === "undefined") return value;

  if (value.startsWith("var(") || value.startsWith("--")) {
    const varName = value.startsWith("var(")
      ? value.slice(4, -1).trim()
      : value.trim();
    const computed = window.getComputedStyle(element).getPropertyValue(varName);
    return computed ? computed.trim() : null;
  }

  return value;
}

export function DottedGlowBackground({
  gap = 20,
  radius = 1.6,
  opacity = 1,
  speed = 1,
  speedMin = 0.5,
  speedMax = 1.4,
  speedScale = 1,
  color = "rgba(99, 102, 241, 0.12)",
  darkColor = "rgba(99, 102, 241, 0.18)",
  glowColor = "rgba(99, 102, 241, 0.75)",
  darkGlowColor = "rgba(129, 140, 248, 0.9)",
  colorLightVar,
  colorDarkVar,
  glowColorLightVar,
  glowColorDarkVar,
  fadeMask = true,
  children,
  className,
  ...props
}: DottedGlowBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState<boolean>(true);
  const isVisibleRef = useRef<boolean>(true);
  const animFrameId = useRef<number | null>(null);

  // 1. Theme detection and observer (dark/light support)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDark = () => {
      const isDarkMode =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(isDarkMode);
    };

    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // 2. Main canvas animation + ResizeObserver + IntersectionObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Resolve active colors with CSS variable support
    const activeDotColor = isDark
      ? resolveColor(colorDarkVar, container) || darkColor
      : resolveColor(colorLightVar, container) || color;

    const activeGlowColor = isDark
      ? resolveColor(glowColorDarkVar, container) || darkGlowColor
      : resolveColor(glowColorLightVar, container) || glowColor;

    // Init dot grid
    const initDots = () => {
      dots = [];
      const cols = Math.ceil(width / gap);
      const rows = Math.ceil(height / gap);

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          dots.push({
            x: c * gap,
            y: r * gap,
            phase: Math.random() * Math.PI * 2,
            speed: (speedMin + Math.random() * (speedMax - speedMin)) * speed * speedScale,
            baseRadius: radius,
          });
        }
      }
    };

    // Responsive resize handler
    const handleResize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      initDots();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // IntersectionObserver for performance optimization
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && animFrameId.current === null) {
          startTime = performance.now();
          render(startTime);
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    let startTime = performance.now();

    // Render loop
    const render = (now: number) => {
      if (!isVisibleRef.current) {
        animFrameId.current = null;
        return;
      }

      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Shimmer wave center moving slowly across the surface
      const waveX = width * 0.5 + Math.sin(elapsed * 0.4) * (width * 0.35);
      const waveY = height * 0.3 + Math.cos(elapsed * 0.3) * (height * 0.2);
      const maxDist = Math.hypot(width, height) * 0.5;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // Pulse intensity: combination of organic per-dot oscillation and ambient wave proximity
        const pulse = (Math.sin(elapsed * dot.speed + dot.phase) + 1) * 0.5; // 0 to 1
        const distToWave = Math.hypot(dot.x - waveX, dot.y - waveY);
        const waveProximity = Math.max(0, 1 - distToWave / maxDist);

        // Compute glow factor
        const isGlow = pulse > 0.72 || waveProximity > 0.78;
        const currentRadius = isGlow ? dot.baseRadius * 1.35 : dot.baseRadius;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, currentRadius, 0, Math.PI * 2);

        if (isGlow) {
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = activeGlowColor;
          ctx.fillStyle = activeGlowColor;
          ctx.globalAlpha = Math.min(1, 0.45 + pulse * 0.55);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = activeDotColor;
          ctx.globalAlpha = 0.25 + pulse * 0.55;
          ctx.fill();
        }
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
    gap,
    radius,
    speed,
    speedMin,
    speedMax,
    speedScale,
    color,
    darkColor,
    glowColor,
    darkGlowColor,
    colorLightVar,
    colorDarkVar,
    glowColorLightVar,
    glowColorDarkVar,
    isDark,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ opacity, ...props.style }}
      {...props}
    >
      {/* Canvas rendering the animated glowing dot grid */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        style={{ display: "block" }}
      />

      {/* Optional smooth vignette / fade mask */}
      {fadeMask && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_40%,transparent_20%,#000000_95%)]"
        />
      )}

      {/* Content slot */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

export default DottedGlowBackground;
