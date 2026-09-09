'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Node {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  lines: number[];
}

interface Connection {
  from: number;
  fromOutputIdx: number;
  to: number;
  toInputIdx: number;
  progress: number;
  speed: number;
}

export function NodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const nodes: Node[] = [];
    const connections: Connection[] = [];
    const colors = ['#eab308', '#3b82f6', '#22c55e', '#a855f7'];

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      nodes.length = 0;
      connections.length = 0;

      const numNodes = Math.max(5, Math.floor((width * height) / 250000));
      for (let i = 0; i < numNodes; i++) {
        const w = 140 + Math.random() * 40;
        const h = 70 + Math.random() * 100;
        
        const numLines = Math.max(1, Math.floor((h - 40) / 16));
        const lines = [];
        for (let l = 0; l < numLines; l++) {
          lines.push(20 + Math.random() * (w - 50));
        }

        nodes.push({
          id: i,
          x: Math.random() * (width - w),
          y: Math.random() * (height - h),
          w,
          h: 44 + numLines * 16 + 8, // Calculate exact height needed
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 0.06,
          vy: (Math.random() - 0.5) * 0.06,
          lines,
        });
      }

      for (let i = 0; i < numNodes * 1.2; i++) {
        const from = Math.floor(Math.random() * numNodes);
        let to = Math.floor(Math.random() * numNodes);
        while (to === from) to = Math.floor(Math.random() * numNodes);
        
        const fromOutputIdx = Math.floor(Math.random() * nodes[from].lines.length);
        const toInputIdx = Math.floor(Math.random() * nodes[to].lines.length);

        connections.push({ 
          from, 
          fromOutputIdx,
          to, 
          toInputIdx,
          progress: Math.random(), 
          speed: 0.0005 + Math.random() * 0.001
        });
      }
    };

    const drawGrid = (isDark: boolean) => {
      ctx.fillStyle = isDark ? '#ffffff10' : '#00000010';
      const dotSize = 1;
      const spacing = 24;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawBezier = (x1: number, y1: number, x2: number, y2: number, progress: number, color: string) => {
      const distance = Math.abs(x2 - x1);
      const controlDist = Math.max(distance * 0.6, 120);
      
      const cp1x = x1 + controlDist;
      const cp1y = y1;
      const cp2x = x2 - controlDist;
      const cp2y = y2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 1500]);
      ctx.lineDashOffset = -progress * 1500;
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const render = () => {
      const isDark = resolvedTheme === 'dark';
      ctx.clearRect(0, 0, width, height);

      drawGrid(isDark);

      // Draw connections below nodes
      connections.forEach((conn) => {
        conn.progress = (conn.progress + conn.speed) % 1;
        const n1 = nodes[conn.from];
        const n2 = nodes[conn.to];
        if (!n1 || !n2) return;
        
        const startX = n1.x + n1.w;
        const startY = n1.y + 44 + conn.fromOutputIdx * 16 + 2;
        const endX = n2.x;
        const endY = n2.y + 44 + conn.toInputIdx * 16 + 2;
        drawBezier(startX, startY, endX, endY, conn.progress, n1.color);
      });

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x <= 0) {
          n.x = 0;
          n.vx *= -1;
        } else if (n.x + n.w >= width) {
          n.x = width - n.w;
          n.vx *= -1;
        }

        if (n.y <= 0) {
          n.y = 0;
          n.vy *= -1;
        } else if (n.y + n.h >= height) {
          n.y = height - n.h;
          n.vy *= -1;
        }

        // Draw node body
        ctx.fillStyle = isDark ? '#111111' : '#ffffff';
        ctx.strokeStyle = isDark ? '#333333' : '#d1d5db';
        
        ctx.shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(n.x, n.y, n.w, n.h, 6);
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Draw left colored border
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.roundRect(n.x, n.y, 4, n.h, [6, 0, 0, 6]);
        ctx.fill();

        // Draw header background (faint tint)
        ctx.fillStyle = n.color + '15'; 
        ctx.beginPath();
        // Since we have a left border of 4px, let's start the header tint at 4px
        ctx.roundRect(n.x + 4, n.y, n.w - 4, 30, [0, 6, 0, 0]);
        ctx.fill();

        // Header skeleton (title only, no icon)
        ctx.fillStyle = isDark ? '#ffffff' : '#000000';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(n.x + 14, n.y + 13, n.w * 0.4, 4);
        ctx.globalAlpha = 1;

        // Draw line separator for header
        ctx.strokeStyle = isDark ? '#333333' : '#e5e7eb';
        ctx.beginPath();
        ctx.moveTo(n.x + 4, n.y + 30);
        ctx.lineTo(n.x + n.w, n.y + 30);
        ctx.stroke();

        // Draw static mock internal lines (properties) and inactive handles
        ctx.fillStyle = isDark ? '#ffffff' : '#000000';
        n.lines.forEach((lineW, i) => {
          const rowY = n.y + 44 + i * 16;
          
          ctx.globalAlpha = 0.2;
          ctx.fillRect(n.x + 12, rowY, lineW, 4);
        });
        ctx.globalAlpha = 1;
      });

      // Draw active colored handles over everything
      connections.forEach((conn) => {
        const n1 = nodes[conn.from];
        const n2 = nodes[conn.to];
        if (!n1 || !n2) return;
        
        const startX = n1.x + n1.w;
        const startY = n1.y + 44 + conn.fromOutputIdx * 16 + 2;
        const endX = n2.x;
        const endY = n2.y + 44 + conn.toInputIdx * 16 + 2;

        ctx.fillStyle = n1.color;
        
        ctx.beginPath();
        ctx.arc(startX, startY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(endX, endY, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', init);
    init();
    render();

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none [mask-image:linear-gradient(to_bottom,white_30%,transparent_100%)]">
      <canvas ref={canvasRef} className="block w-full h-full opacity-80" />
    </div>
  );
}