'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  baseRadius: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  vx: number;
  vy: number;
}

interface StarfieldCanvasProps {
  className?: string;
  starCount?: number;
  connectDistance?: number;
}

export function StarfieldCanvas({
  className = '',
  starCount = 140,
  connectDistance = 100,
}: StarfieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse position for subtle interactive parallax
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
      initStars();
    };

    let stars: Star[] = [];

    const initStars = () => {
      stars = [];
      const count = Math.floor((width * height) / 9000); // Responsive count
      const total = Math.min(Math.max(count, 80), starCount);

      for (let i = 0; i < total; i++) {
        const baseRadius = Math.random() < 0.2 ? Math.random() * 1.5 + 1.2 : Math.random() * 0.8 + 0.5;
        const baseAlpha = Math.random() * 0.5 + 0.2;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseRadius,
          radius: baseRadius,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: Math.random() * 0.02 + 0.008,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
        });
      }
    };

    initStars();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let time = 0;

    const render = () => {
      time += 1;
      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Check current dark mode
      const isDark = document.documentElement.classList.contains('dark');
      const starColor = isDark ? '255, 255, 255' : '15, 23, 42';
      const lineColor = isDark ? '110, 231, 183' : '16, 185, 129'; // emerald accent for links

      // 1. Draw connecting constellation lines
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectDistance) {
            const lineAlpha = (1 - dist / connectDistance) * (isDark ? 0.18 : 0.08);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${lineColor}, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      // 2. Draw stars & twinkling pulses
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Move slightly
        s.x += s.vx;
        s.y += s.vy;

        // Wrap around screen edges
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        // Twinkle sinusoidal brightness
        s.alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.25;
        const currentAlpha = Math.max(0.05, Math.min(s.alpha, 0.9));

        // Proximity to mouse raises alpha
        const distToMouse = Math.hypot(s.x - mouseX, s.y - mouseY);
        const mouseBoost = distToMouse < 180 ? (1 - distToMouse / 180) * 0.35 : 0;
        const finalAlpha = Math.min(1, currentAlpha + mouseBoost);

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius + (mouseBoost > 0 ? 0.5 : 0), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor}, ${finalAlpha})`;
        ctx.fill();

        // Extra outer glow ring for prominent stars
        if (s.baseRadius > 1.4 && isDark) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16, 185, 129, ${finalAlpha * 0.12})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [starCount, connectDistance]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 h-full w-full ${className}`}
    />
  );
}
