import React from "react";
import { cn } from "../../../lib/utils";

export interface MeshGradientPreset {
  id: string;
  name: string;
  colors: [string, string, string, string];
}

export const MESH_PRESETS: MeshGradientPreset[] = [
  { id: "cap-purple", name: "Cap Signature Purple", colors: ["#6366f1", "#a855f7", "#ec4899", "#3b82f6"] },
  { id: "cyber-neon", name: "Cyberpunk Neon", colors: ["#f43f5e", "#8b5cf6", "#06b6d4", "#ec4899"] },
  { id: "sunset-glow", name: "Sunset Gold", colors: ["#f97316", "#eab308", "#ec4899", "#ef4444"] },
  { id: "emerald-sea", name: "Emerald Sea", colors: ["#10b981", "#06b6d4", "#3b82f6", "#14b8a6"] },
  { id: "dark-aurora", name: "Dark Aurora", colors: ["#1e1b4b", "#312e81", "#4c1d95", "#111827"] },
];

interface MeshGradientsProps {
  presetId?: string;
  customColors?: [string, string, string, string];
  animated?: boolean;
  className?: string;
}

export const MeshGradients: React.FC<MeshGradientsProps> = ({
  presetId = "cap-purple",
  customColors,
  animated = true,
  className,
}) => {
  const preset = MESH_PRESETS.find((p) => p.id === presetId) || MESH_PRESETS[0];
  const colors = customColors || preset.colors;

  return (
    <div className={cn("absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none -z-10", className)}>
      <div
        className={cn(
          "absolute -inset-[35%] opacity-90 filter blur-[75px] rounded-full transition-all duration-1000",
          animated && "mesh-blob-1"
        )}
        style={{
          background: `radial-gradient(circle at 35% 35%, ${colors[0]}, transparent 55%), radial-gradient(circle at 65% 65%, ${colors[1]}, transparent 55%)`,
        }}
      />
      <div
        className={cn(
          "absolute -inset-[35%] opacity-85 filter blur-[90px] rounded-full transition-all duration-1000",
          animated && "mesh-blob-2"
        )}
        style={{
          background: `radial-gradient(circle at 75% 25%, ${colors[2]}, transparent 55%), radial-gradient(circle at 25% 75%, ${colors[3]}, transparent 55%)`,
        }}
      />
    </div>
  );
};
