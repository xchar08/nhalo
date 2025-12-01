// ============================================================================
// FILE: src/components/visualizer/StarField.tsx
// ============================================================================
'use client';

import { useEffect, useRef } from 'react';

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper to set canvas size
    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      return { width: w, height: h };
    };

    let { width, height } = setSize();

    // STAR CONFIG
    const STAR_COUNT = 2000; // Increased for ultra-wides
    const stars: { x: number; y: number; size: number; alpha: number; tOffset: number; color: string }[] = [];

    // Initialize stars randomly across the *initial* width
    for (let i = 0; i < STAR_COUNT; i++) {
      const isBlue = Math.random() > 0.7; 
      const color = isBlue ? '200, 240, 255' : '255, 245, 230';
      
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() < 0.9 ? Math.random() * 1.0 : Math.random() * 2.5,
        alpha: Math.random(),
        tOffset: Math.random() * Math.PI * 2,
        color: color
      });
    }

    let time = 0;
    let animId: number;

    const animate = () => {
      time += 0.005;
      
      // Deep Space Background
      // Re-calculate gradient center in case window resized
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
      gradient.addColorStop(0, '#050b14'); 
      gradient.addColorStop(1, '#000000'); 
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        // Twinkle Logic
        const twinkle = Math.sin(time * 2 + star.tOffset);
        const opacity = 0.3 + (Math.abs(twinkle) * 0.7 * star.alpha);
        
        // Drift
        star.y -= 0.05; 
        
        // Wrap Logic:
        // If star goes off top, reset to bottom
        if (star.y < 0) {
            star.y = height;
            star.x = Math.random() * width; // Re-roll X to fill gaps if width changed
        }
        // If star is outside current width (e.g. shrink window), wrap it back
        if (star.x > width) {
            star.x = Math.random() * width;
        }

        ctx.fillStyle = `rgba(${star.color}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      const newDims = setSize();
      width = newDims.width;
      height = newDims.height;
      // Note: We don't re-init stars here to avoid "popping",
      // the wrap logic in animate() handles moving stars into new space.
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}
