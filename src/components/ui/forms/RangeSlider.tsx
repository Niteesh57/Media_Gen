import React from "react";
import { cn } from "../../../lib/utils";

interface RangeSliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  className?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
  className,
}) => {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      {label && (
        <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
          <span>{label}</span>
          <span className="font-mono text-foreground font-semibold">
            {value}
            {unit}
          </span>
        </div>
      )}
      <div className="relative flex items-center h-5 select-none">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none z-10 opacity-0"
        />
        {/* Custom liquid glass track */}
        <div className="absolute inset-x-0 h-2 bg-white/10 rounded-full overflow-hidden pointer-events-none border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-primary via-indigo-500 to-purple-500 transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Custom liquid glass thumb */}
        <div
          className="absolute w-4 h-4 bg-white border border-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)] pointer-events-none transition-all duration-75 -ml-2"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
