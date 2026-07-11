import React from "react";
import { cn } from "../../../lib/utils";

export type MaskShape = "circle" | "rounded" | "square" | "fullscreen";

interface VideoMaskingProps {
  shape: MaskShape;
  children: React.ReactNode;
  borderGlow?: boolean;
  className?: string;
}

export const VideoMasking: React.FC<VideoMaskingProps> = ({
  shape = "circle",
  children,
  borderGlow = true,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden transition-all duration-300 shadow-2xl",
        shape === "circle" && "rounded-full aspect-square",
        shape === "rounded" && "rounded-2xl aspect-video",
        shape === "square" && "rounded-lg aspect-square",
        shape === "fullscreen" && "rounded-none inset-0 w-full h-full",
        borderGlow && "border-2 border-white/40 shadow-[0_0_24px_rgba(99,102,241,0.5)]",
        className
      )}
    >
      <div className="w-full h-full object-cover">{children}</div>
      {/* Specular glass reflection on webcam bubble */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none rounded-[inherit]" />
    </div>
  );
};
