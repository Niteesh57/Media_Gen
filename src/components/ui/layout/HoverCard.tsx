import React from "react";
import { cn } from "../../../lib/utils";
import { Coffee } from "lucide-react";

interface HoverCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  title = "Support Cap Studio Open Source",
  subtitle = "Enjoying our React video editing suite? Buy us a coffee!",
  badge = "Buy Me A Coffee ☕",
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
          <Coffee className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1">
          <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold text-[10px] mb-1">
            {badge}
          </span>
          <h4 className="text-xs font-semibold text-white tracking-tight">{title}</h4>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
