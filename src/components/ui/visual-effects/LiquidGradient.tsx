import React from "react";
import { cn } from "../../../lib/utils";

interface LiquidGradientProps {
  colors?: string[];
  animated?: boolean;
  className?: string;
}

export const LiquidGradient: React.FC<LiquidGradientProps> = ({
  colors = ["#6366f1", "#a855f7", "#ec4899", "#3b82f6"],
  animated = true,
  className,
}) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden rounded-[inherit] -z-10", className)}>
      <div
        className={cn(
          "absolute -inset-[30%] opacity-80 filter blur-[70px] rounded-full transition-all duration-1000",
          animated && "mesh-blob-1"
        )}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors[0]}, transparent 60%), radial-gradient(circle at 70% 70%, ${colors[1]}, transparent 60%)`,
        }}
      />
      <div
        className={cn(
          "absolute -inset-[30%] opacity-70 filter blur-[85px] rounded-full transition-all duration-1000",
          animated && "mesh-blob-2"
        )}
        style={{
          background: `radial-gradient(circle at 80% 20%, ${colors[2]}, transparent 60%), radial-gradient(circle at 20% 80%, ${colors[3]}, transparent 60%)`,
        }}
      />
    </div>
  );
};
