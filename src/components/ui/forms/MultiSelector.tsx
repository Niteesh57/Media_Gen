import React from "react";
import { cn } from "../../../lib/utils";

interface Option {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface MultiSelectorProps {
  options: Option[];
  selectedId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const MultiSelector: React.FC<MultiSelectorProps> = ({
  options,
  selectedId,
  onChange,
  className,
}) => {
  return (
    <div className={cn("inline-flex p-1 rounded-xl bg-black/40 border border-white/10 gap-1", className)}>
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
              isSelected
                ? "bg-primary text-white shadow-md scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
