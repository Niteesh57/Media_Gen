import React from "react";
import { cn } from "../../../lib/utils";

interface TimelineAnimationProps {
  isPlaying: boolean;
  progress: number; // 0 to 1
  onScrub?: (newProgress: number) => void;
  children?: React.ReactNode;
  className?: string;
}

export const TimelineAnimation: React.FC<TimelineAnimationProps> = ({
  isPlaying,
  progress,
  onScrub,
  children,
  className,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onScrub) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProg = Math.max(0, Math.min(1, clickX / rect.width));
    onScrub(newProg);
  };

  return (
    <div
      onClick={handleClick}
      className={cn("relative w-full overflow-hidden rounded-lg bg-black/40 cursor-pointer", className)}
    >
      {/* Animated Playhead line */}
      <div
        className={cn(
          "absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none transition-all duration-75",
          isPlaying && "shadow-[0_0_12px_rgba(239,68,68,0.8)]"
        )}
        style={{ left: `${progress * 100}%` }}
      >
        <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-red-500 rounded-sm rotate-45 shadow-md" />
      </div>
      {children}
    </div>
  );
};
