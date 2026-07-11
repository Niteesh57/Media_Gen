import React from "react";
import { cn } from "../../../lib/utils";

interface ShimmerLoaderProps {
  label?: string;
  progress?: number; // 0-100 optional
  className?: string;
}

export const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({
  label = "Processing...",
  progress,
  className,
}) => {
  return (
    <div className={cn("w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 space-y-2", className)}>
      <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        {progress !== undefined && <span>{Math.round(progress)}%</span>}
      </div>
      <div className="relative w-full h-2 rounded-full bg-black/40 overflow-hidden">
        {progress !== undefined ? (
          <div
            className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent animate-shimmer" />
        )}
      </div>
    </div>
  );
};
