import React, { useEffect, useRef } from "react";
import { useTheme } from "../lib/theme";

interface AmbientCanvasProps {
  isBreathing?: boolean;
  breathePhase?: 'inhale' | 'hold' | 'exhale';
}

export default function AmbientCanvas({ isBreathing = false, breathePhase = 'inhale' }: AmbientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle network representing bio-nutritive molecules
    const particleCount = Math.min(45, Math.floor(width / 35));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      baseRadius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.25 + 0.08,
    }));

    // Mouse coordinates
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    let step = 0;
    let currentBreathScale = 1.0;
    let targetBreathScale = 1.0;

    const render = () => {
      step += 0.012;

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Adjust breath scale dynamically
      if (isBreathing) {
        if (breathePhase === 'inhale') targetBreathScale = 1.6;
        else if (breathePhase === 'hold') targetBreathScale = 1.6;
        else targetBreathScale = 0.95;
      } else {
        targetBreathScale = 1.0;
      }
      currentBreathScale += (targetBreathScale - currentBreathScale) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Organic Harmonic Ambient Waves
      const waves = [
        {
          frequency: 0.0018,
          amplitude: 38 * currentBreathScale,
          speed: 0.016,
          yOffset: height * 0.32,
          color: isDark ? "rgba(224, 146, 115, 0.04)" : "rgba(212, 132, 100, 0.06)",
        },
        {
          frequency: 0.0022,
          amplitude: 48 * currentBreathScale,
          speed: -0.012,
          yOffset: height * 0.58,
          color: isDark ? "rgba(212, 132, 100, 0.035)" : "rgba(212, 132, 100, 0.05)",
        },
        {
          frequency: 0.0015,
          amplitude: 55 * currentBreathScale,
          speed: 0.02,
          yOffset: height * 0.82,
          color: isDark ? "rgba(105, 152, 123, 0.035)" : "rgba(77, 115, 93, 0.04)",
        },
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, wave.yOffset);

        for (let x = 0; x <= width; x += 15) {
          // Subtle mouse interactive deflection
          const distToMouse = Math.hypot(x - mouseX, wave.yOffset - mouseY);
          const mouseDeflection = Math.max(0, 1 - distToMouse / 280) * 22;

          const y =
            wave.yOffset +
            Math.sin(x * wave.frequency + step * wave.speed * 60) * wave.amplitude +
            Math.cos(x * wave.frequency * 0.7 - step * wave.speed * 40) * (wave.amplitude * 0.4) -
            mouseDeflection;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      // 2. Draw Gentle Floating Micronutrient Particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse proximity reaction
        const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
        let radius = p.baseRadius * currentBreathScale;
        if (dist < 140) {
          radius *= 1.4;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        const particleColor = isDark
          ? `rgba(224, 146, 115, ${p.alpha * 1.2})`
          : `rgba(212, 132, 100, ${p.alpha})`;
        ctx.fillStyle = particleColor;
        ctx.fill();

        // Connect nearby particles with subtle strands
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 95) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isDark
              ? `rgba(224, 146, 115, ${(1 - d / 95) * 0.035})`
              : `rgba(212, 132, 100, ${(1 - d / 95) * 0.045})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDark, isBreathing, breathePhase]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full opacity-90 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
}
