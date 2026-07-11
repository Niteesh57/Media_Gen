import React, { useEffect, useRef } from "react";
import { cn } from "../../../lib/utils";

export interface MovingWallpaperPreset {
  id: string;
  name: string;
  type: "aurora" | "mesh-flow" | "liquid-neon" | "cyber-grid" | "starfield" | "silk-waves" | "bokeh-lights" | "cosmic-dust" | "geometric-float" | "emerald-pulse" | "sunset-glow" | "midnight-abyss";
  previewColors: string[];
}

export const MOVING_WALLPAPER_PRESETS: MovingWallpaperPreset[] = [
  { id: "aurora", name: "Nordic Aurora Flow", type: "aurora", previewColors: ["#3b82f6", "#8b5cf6", "#10b981"] },
  { id: "mesh-flow", name: "Cap Liquid Mesh", type: "mesh-flow", previewColors: ["#6366f1", "#ec4899", "#3b82f6"] },
  { id: "liquid-neon", name: "Cyber Neon Waves", type: "liquid-neon", previewColors: ["#06b6d4", "#a855f7", "#ec4899"] },
  { id: "cyber-grid", name: "Synthwave Grid 3D", type: "cyber-grid", previewColors: ["#2563eb", "#db2777", "#1e1b4b"] },
  { id: "starfield", name: "Deep Space Stars", type: "starfield", previewColors: ["#0f172a", "#38bdf8", "#818cf8"] },
  { id: "silk-waves", name: "Smooth Silk Ribbons", type: "silk-waves", previewColors: ["#c084fc", "#f43f5e", "#fb923c"] },
  { id: "bokeh-lights", name: "Soft Cinematic Bokeh", type: "bokeh-lights", previewColors: ["#f59e0b", "#ef4444", "#8b5cf6"] },
  { id: "cosmic-dust", name: "Cosmic Nebula Dust", type: "cosmic-dust", previewColors: ["#4f46e5", "#ec4899", "#f59e0b"] },
  { id: "geometric-float", name: "Floating Prism Shapes", type: "geometric-float", previewColors: ["#10b981", "#3b82f6", "#6366f1"] },
  { id: "emerald-pulse", name: "Emerald Cyber Pulse", type: "emerald-pulse", previewColors: ["#059669", "#10b981", "#34d399"] },
  { id: "sunset-glow", name: "Golden Horizon Glow", type: "sunset-glow", previewColors: ["#ea580c", "#f97316", "#eab308"] },
  { id: "midnight-abyss", name: "Midnight Deep Waves", type: "midnight-abyss", previewColors: ["#1e293b", "#334155", "#475569"] },
];

interface MovingWallpaperProps {
  presetId: string;
  className?: string;
}

export const MovingWallpaper: React.FC<MovingWallpaperProps> = ({ presetId, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preset = MOVING_WALLPAPER_PRESETS.find((p) => p.id === presetId) || MOVING_WALLPAPER_PRESETS[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || 800;
      canvas.height = rect.height || 450;
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      time += 0.015;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      switch (preset.type) {
        case "aurora": {
          // Smooth shifting aurora gradients
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, "#0f172a");
          grad.addColorStop(0.3 + Math.sin(time * 0.8) * 0.2, "#3b82f6");
          grad.addColorStop(0.7 + Math.cos(time * 0.6) * 0.2, "#8b5cf6");
          grad.addColorStop(1, "#10b981");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Animated glow blobs
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          const blob1X = width * (0.3 + Math.sin(time) * 0.25);
          const blob1Y = height * (0.4 + Math.cos(time * 0.7) * 0.25);
          const rad1 = ctx.createRadialGradient(blob1X, blob1Y, 10, blob1X, blob1Y, width * 0.6);
          rad1.addColorStop(0, "rgba(59, 130, 246, 0.45)");
          rad1.addColorStop(1, "transparent");
          ctx.fillStyle = rad1;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
          break;
        }

        case "mesh-flow": {
          const grad = ctx.createLinearGradient(Math.sin(time) * width, 0, width, height);
          grad.addColorStop(0, "#1e1b4b");
          grad.addColorStop(0.4, "#6366f1");
          grad.addColorStop(0.8, "#ec4899");
          grad.addColorStop(1, "#3b82f6");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Liquid wave lines
          ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
          ctx.lineWidth = 3;
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            for (let x = 0; x <= width; x += 30) {
              const y = height * (0.3 + i * 0.12) + Math.sin(x * 0.005 + time + i) * 40;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          break;
        }

        case "liquid-neon": {
          ctx.fillStyle = "#090d16";
          ctx.fillRect(0, 0, width, height);

          const numOrbs = 4;
          for (let i = 0; i < numOrbs; i++) {
            const ox = (0.2 + 0.2 * i + Math.sin(time * (0.5 + i * 0.2)) * 0.25) * width;
            const oy = (0.3 + 0.15 * i + Math.cos(time * (0.4 + i * 0.3)) * 0.25) * height;
            const colors = ["#06b6d4", "#a855f7", "#ec4899", "#3b82f6"];
            const rad = ctx.createRadialGradient(ox, oy, 10, ox, oy, width * 0.45);
            rad.addColorStop(0, colors[i % colors.length]);
            rad.addColorStop(1, "transparent");
            ctx.save();
            ctx.globalCompositeOperation = "screen";
            ctx.fillStyle = rad;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
          }
          break;
        }

        case "cyber-grid": {
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, "#090914");
          grad.addColorStop(0.6, "#1e1b4b");
          grad.addColorStop(1, "#311042");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Moving 3D Perspective Grid
          ctx.strokeStyle = "rgba(236, 72, 153, 0.25)";
          ctx.lineWidth = 1.5;
          const gridOffset = (time * 40) % 40;
          for (let y = height * 0.45; y < height; y += 25 + (y - height * 0.45) * 0.1) {
            const py = (y + gridOffset) % height;
            if (py > height * 0.45) {
              ctx.beginPath();
              ctx.moveTo(0, py);
              ctx.lineTo(width, py);
              ctx.stroke();
            }
          }
          for (let x = -width; x <= width * 2; x += 60) {
            ctx.beginPath();
            ctx.moveTo(width * 0.5, height * 0.45);
            ctx.lineTo(x + Math.sin(time * 0.2) * 30, height);
            ctx.stroke();
          }
          break;
        }

        case "starfield": {
          ctx.fillStyle = "#080b14";
          ctx.fillRect(0, 0, width, height);

          ctx.fillStyle = "#e0f2fe";
          for (let i = 0; i < 80; i++) {
            const sx = ((i * 137.5 + time * (10 + (i % 5) * 8)) % width);
            const sy = ((i * 293.3) % height);
            const size = (i % 3) + 1;
            ctx.globalAlpha = 0.3 + Math.sin(time * 2 + i) * 0.3;
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1.0;
          break;
        }

        case "silk-waves": {
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, "#2e1065");
          grad.addColorStop(0.5, "#831843");
          grad.addColorStop(1, "#7c2d12");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Glowing silk folds
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(0, height * 0.5);
            for (let x = 0; x <= width; x += 20) {
              const y = height * (0.3 + i * 0.15) + Math.sin(x * 0.006 - time * (1 + i * 0.2)) * 60;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.fillStyle = i % 2 === 0 ? "rgba(192, 132, 252, 0.15)" : "rgba(251, 146, 60, 0.15)";
            ctx.fill();
          }
          ctx.restore();
          break;
        }

        case "bokeh-lights": {
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, "#1c1917");
          grad.addColorStop(1, "#451a03");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Soft bokeh circles
          for (let i = 0; i < 15; i++) {
            const bx = ((i * 211 + Math.sin(time * 0.3 + i) * 100) % width);
            const by = ((i * 167 + Math.cos(time * 0.4 + i) * 80) % height);
            const radius = 30 + (i % 5) * 20;
            const rad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
            rad.addColorStop(0, i % 2 === 0 ? "rgba(245, 158, 11, 0.35)" : "rgba(239, 68, 68, 0.3)");
            rad.addColorStop(1, "transparent");
            ctx.fillStyle = rad;
            ctx.beginPath();
            ctx.arc(bx, by, radius, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case "cosmic-dust": {
          const grad = ctx.createRadialGradient(width * 0.5, height * 0.5, 50, width * 0.5, height * 0.5, width * 0.8);
          grad.addColorStop(0, "#311042");
          grad.addColorStop(0.6, "#1e1b4b");
          grad.addColorStop(1, "#09090e");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Nebula dust swirls
          ctx.strokeStyle = "rgba(236, 72, 153, 0.18)";
          ctx.lineWidth = 2;
          for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            for (let angle = 0; angle <= Math.PI * 4; angle += 0.1) {
              const r = 30 + angle * 25 + Math.sin(time + angle + i) * 20;
              const x = width * 0.5 + Math.cos(angle + time * 0.2 + i) * r;
              const y = height * 0.5 + Math.sin(angle + time * 0.2 + i) * (r * 0.6);
              if (angle === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          break;
        }

        case "geometric-float": {
          ctx.fillStyle = "#064e3b";
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, "#064e3b");
          grad.addColorStop(1, "#1e1b4b");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Floating 3D cubes/triangles
          ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
          ctx.lineWidth = 2;
          for (let i = 0; i < 8; i++) {
            const gx = ((i * 180 + time * 20) % (width + 100)) - 50;
            const gy = height * (0.2 + (i % 4) * 0.2) + Math.sin(time + i) * 30;
            const size = 25 + (i % 3) * 15;
            ctx.save();
            ctx.translate(gx, gy);
            ctx.rotate(time * 0.5 + i);
            ctx.strokeRect(-size * 0.5, -size * 0.5, size, size);
            ctx.restore();
          }
          break;
        }

        case "emerald-pulse": {
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, "#022c22");
          grad.addColorStop(0.5, "#065f46");
          grad.addColorStop(1, "#047857");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Pulsing emerald energy lines
          ctx.strokeStyle = "rgba(52, 211, 153, 0.3)";
          ctx.lineWidth = 4;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            for (let x = 0; x <= width; x += 25) {
              const y = height * 0.5 + Math.sin(x * 0.01 + time * 2 + i * 2) * (40 + i * 25);
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          break;
        }

        case "sunset-glow": {
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, "#431407");
          grad.addColorStop(0.5, "#9a3412");
          grad.addColorStop(1, "#ca8a04");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Golden shimmering horizon
          ctx.fillStyle = "rgba(254, 240, 138, 0.25)";
          for (let i = 0; i < 5; i++) {
            const hx = (Math.sin(time * 0.5 + i) * 0.3 + 0.5) * width;
            const hy = height * (0.6 + i * 0.08);
            ctx.beginPath();
            ctx.ellipse(hx, hy, 150 + i * 40, 20 + i * 10, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case "midnight-abyss": {
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, "#020617");
          grad.addColorStop(0.5, "#0f172a");
          grad.addColorStop(1, "#1e293b");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Deep subtle ocean ripple rings
          ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
          ctx.lineWidth = 2;
          for (let i = 1; i <= 5; i++) {
            const r = ((time * 30 + i * 60) % 350);
            ctx.beginPath();
            ctx.arc(width * 0.5, height * 0.5, r, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [preset.type]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden select-none", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};
