import React from "react";
import { cn } from "../../../lib/utils";

interface MotionNumberProps {
  value: number | string;
  label?: string;
  className?: string;
}

export const MotionNumber: React.FC<MotionNumberProps> = ({
  value,
  label,
  className,
}) => {
  return (
    <div className={cn("inline-flex items-center gap-1 font-mono text-xs select-none", className)}>
      {label && <span className="text-muted-foreground">{label}:</span>}
      <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 text-primary-foreground font-semibold tracking-wider shadow-inner transition-all duration-150">
        {value}
      </span>
    </div>
  );
};
