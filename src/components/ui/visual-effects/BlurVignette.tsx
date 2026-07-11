import React from "react";
import { cn } from "../../../lib/utils";

interface BlurVignetteProps {
  radius?: string;
  intensity?: number;
  className?: string;
}

export const BlurVignette: React.FC<BlurVignetteProps> = ({
  radius = "24px",
  intensity = 0.6,
  className,
}) => {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none rounded-[inherit] z-10", className)}
      style={{
        boxShadow: `inset 0 0 ${radius} rgba(0, 0, 0, ${intensity})`,
      }}
    />
  );
};
