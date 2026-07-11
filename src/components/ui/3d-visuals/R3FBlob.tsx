import React from "react";
import { cn } from "../../../lib/utils";

interface R3FBlobProps {
  color?: string;
  size?: number;
  className?: string;
}

export const R3FBlob: React.FC<R3FBlobProps> = ({
  color = "#6366f1",
  size = 140,
  className,
}) => {
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden rounded-full pointer-events-none", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="w-full h-full rounded-full opacity-80 filter blur-[20px] animate-pulseGlow"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};
