import React from "react";
import { cn } from "../../../lib/utils";

interface SparklesProps {
  children?: React.ReactNode;
  className?: string;
}

export const Sparkles: React.FC<SparklesProps> = ({ children, className }) => {
  return (
    <div className={cn("relative inline-block", className)}>
      <span className="absolute -top-1 -left-2 text-yellow-400 animate-bounce text-xs pointer-events-none">✨</span>
      <span className="absolute -bottom-1 -right-2 text-yellow-300 animate-pulse text-xs pointer-events-none">✦</span>
      {children}
    </div>
  );
};
