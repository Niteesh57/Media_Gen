import React from "react";
import { cn } from "../../../lib/utils";
import { X } from "lucide-react";

interface DirectionalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  direction?: "left" | "right" | "bottom";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const DirectionalDrawer: React.FC<DirectionalDrawerProps> = ({
  isOpen,
  onClose,
  direction = "right",
  title,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm transition-opacity">
      <div
        className={cn(
          "fixed bg-card border-white/10 shadow-2xl transition-transform duration-300 flex flex-col",
          direction === "right" && "top-0 right-0 bottom-0 w-80 sm:w-96 border-l",
          direction === "left" && "top-0 left-0 bottom-0 w-80 sm:w-96 border-r",
          direction === "bottom" && "left-0 right-0 bottom-0 h-96 border-t rounded-t-2xl",
          className
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-semibold text-sm tracking-wide text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">{children}</div>
      </div>
    </div>
  );
};
