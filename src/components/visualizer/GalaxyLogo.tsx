// ============================================================================
// FILE: src/components/visualizer/GalaxyLogo.tsx
// ============================================================================
'use client';

import { useEffect, useRef } from 'react';

export default function GalaxyLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 800; // Larger resolution for sharpness
    canvas.width = size;
    canvas.height = size;

    const particles: any[] = [];
    const COUNT = 400;

    for (let i = 0; i < COUNT; i++) {
      const isRing1 = i % 2 === 0;
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 180 + Math.random() * 60, // Larger Radius
        speed: 0.001 + Math.random() * 0.003, // Slower, majestic speed
        ring: isRing1 ? 1 : 2,
        color: isRing1 ? '100, 200, 255' : '255, 200, 100' // Softer Blue / Warm Gold
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      ctx.globalCompositeOperation = 'lighter'; // Super nice blending

      particles.forEach(p => {
        p.angle += p.speed;

        let x, y;
        // Ring 1
        if (p.ring === 1) {
          x = Math.cos(p.angle) * p.radius;
          y = Math.sin(p.angle) * (p.radius * 0.35);
          const r = Math.PI / 8;
          const tx = x;
          x = tx * Math.cos(r) - y * Math.sin(r);
          y = tx * Math.sin(r) + y * Math.cos(r);
        } 
        // Ring 2
        else {
          x = Math.cos(p.angle) * (p.radius * 0.35);
          y = Math.sin(p.angle) * p.radius;
          const r = -Math.PI / 8;
          const tx = x;
          x = tx * Math.cos(r) - y * Math.sin(r);
          y = tx * Math.sin(r) + y * Math.cos(r);
        }

        // Fade in/out based on angle for depth
        const opacity = 0.3 + Math.sin(p.angle * 2) * 0.3;
        const size = 1.5 * (opacity + 0.5);

        ctx.fillStyle = `rgba(${p.color}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(cx + x, cy + y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full pointer-events-none opacity-60" />;
}
