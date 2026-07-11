import React from "react";
import { cn } from "../../../lib/utils";

interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: "default" | "gradient" | "neon" | "subtle";
  glowColor?: string;
  className?: string;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  variant = "default",
  glowColor,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "liquid-glass-container relative transition-all duration-300",
        variant === "gradient" && "gradient-border-glass",
        variant === "neon" && "shadow-[0_0_30px_rgba(99,102,241,0.35)] border-primary/50",
        variant === "subtle" && "bg-white/5 backdrop-blur-md border-white/10 shadow-lg",
        className
      )}
      style={glowColor ? { boxShadow: `0 0 32px ${glowColor}` } : undefined}
      {...props}
    >
      {/* Specular layered glass shine */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none rounded-[inherit]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
