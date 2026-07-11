import React, { useState } from "react";
import { cn } from "../../../lib/utils";

export interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface MagnifiedDocProps {
  items: DockItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const MagnifiedDoc: React.FC<MagnifiedDocProps> = ({
  items,
  activeId,
  onSelect,
  className,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return 1.35;
    if (distance === 1) return 1.15;
    return 1;
  };

  return (
    <div
      className={cn(
        "inline-flex items-end px-4 py-2 rounded-2xl bg-black/70 backdrop-blur-glass border border-white/15 shadow-2xl gap-2 transition-all select-none",
        className
      )}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {items.map((item, index) => {
        const scale = getScale(index);
        const isActive = activeId === item.id;

        return (
          <button
            key={item.id}
            onMouseEnter={() => setHoveredIndex(index)}
            onClick={() => onSelect(item.id)}
            className="relative flex flex-col items-center group transition-all duration-150 origin-bottom focus:outline-none"
            style={{ transform: `scale(${scale})` }}
          >
            {/* Tooltip on hover */}
            <span className="absolute -top-9 px-2.5 py-1 rounded-md bg-black/90 text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-lg z-50">
              {item.label}
            </span>

            {/* Icon box */}
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative shadow-md",
                isActive
                  ? "bg-primary text-white ring-2 ring-white/30 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                  : "bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
              )}
            >
              {item.icon}
              {item.badge && (
                <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-pink-500 text-[8px] font-bold text-white shadow">
                  {item.badge}
                </span>
              )}
            </div>

            {/* Active dot */}
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full mt-1 transition-opacity",
                isActive ? "bg-primary opacity-100" : "opacity-0"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
