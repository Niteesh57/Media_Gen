import React from "react";
import { cn } from "../../../lib/utils";

interface ColorPickerProps {
  label?: string;
  selectedColor: string;
  onChange: (color: string) => void;
  presets?: string[];
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  selectedColor,
  onChange,
  presets = [
    "#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ef4444", 
    "#3b82f6", "#8b5cf6", "#14b8a6", "#ffffff", "#000000"
  ],
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <span className="text-xs font-medium text-muted-foreground block">{label}</span>}
      <div className="flex items-center gap-2 flex-wrap">
        {presets.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              "w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110 shadow-sm",
              selectedColor === color && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        <div className="relative overflow-hidden w-6 h-6 rounded-full border border-white/20 cursor-pointer">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full rounded-full"
            style={{ backgroundColor: selectedColor }}
          />
        </div>
      </div>
    </div>
  );
};
