"use client";

import { useEffect, useRef } from "react";
import { CELEBRATE_EVENT } from "@/lib/celebrate";

const COLORS = ["#FF8A1F", "#5B5BF0", "#FFD23F", "#2FBF71", "#FF5C8A"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
  round: boolean;
  life: number;
}

export default function ConfettiLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let particles: Particle[] = [];
    let frame = 0;
    let running = false;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const step = () => {
      const h = window.innerHeight;
      ctx.clearRect(0, 0, window.innerWidth, h);
      particles = particles.filter((p) => p.life > 0 && p.y < h + 30);
      for (const p of particles) {
        p.vy += 0.28;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        p.life -= 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.min(1, p.life / 40);
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (particles.length > 0) {
        frame = requestAnimationFrame(step);
      } else {
        running = false;
        ctx.clearRect(0, 0, window.innerWidth, h);
      }
    };

    const burst = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const w = window.innerWidth;
      const originY = window.innerHeight * 0.7;
      for (const originX of [w * 0.15, w * 0.5, w * 0.85]) {
        for (let i = 0; i < 45; i += 1) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.3;
          const speed = 9 + Math.random() * 9;
          particles.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 8 + Math.random() * 8,
            rotation: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 0.35,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            round: Math.random() < 0.3,
            life: 150 + Math.random() * 70,
          });
        }
      }
      if (!running) {
        running = true;
        frame = requestAnimationFrame(step);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener(CELEBRATE_EVENT, burst);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener(CELEBRATE_EVENT, burst);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]" />;
}
