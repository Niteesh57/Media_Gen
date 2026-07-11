import React from "react";
import { cn } from "../../../lib/utils";
import { X } from "lucide-react";

interface MacGenieModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const MacGenieModal: React.FC<MacGenieModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div
        className={cn(
          "w-full max-w-2xl bg-card border border-white/20 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.75)] overflow-hidden animate-macGenie transition-all",
          className
        )}
      >
        {/* Mac OS title bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 select-none">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center group"
              title="Close"
            >
              <X className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
            <div className="w-3.5 h-3.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
            {title || "Cap Studio"}
          </span>
          <div className="w-12" /> {/* Spacer for symmetry */}
        </div>

        <div className="p-6 relative z-10">{children}</div>
      </div>
    </div>
  );
};
