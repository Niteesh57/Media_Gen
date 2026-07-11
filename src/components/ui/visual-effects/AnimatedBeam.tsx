import React from "react";
import { cn } from "../../../lib/utils";

interface AnimatedBeamProps {
  className?: string;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({ className }) => {
  return (
    <div className={cn("relative w-full h-1 bg-white/10 overflow-hidden rounded-full", className)}>
      <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-animatedBeam" />
    </div>
  );
};
