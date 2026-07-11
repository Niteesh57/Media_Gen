import React, { useEffect, useRef } from "react";
import { cn } from "../../../lib/utils";
import { Terminal as TerminalIcon } from "lucide-react";

interface TerminalLog {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warn" | "error";
}

interface TerminalUIProps {
  logs: TerminalLog[];
  title?: string;
  className?: string;
}

export const TerminalUI: React.FC<TerminalUIProps> = ({
  logs,
  title = "Cap Codec Encoder (WebCodecs & MediaRecorder)",
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-[#0d0f17]/90 font-mono text-xs overflow-hidden shadow-2xl flex flex-col",
        className
      )}
    >
      {/* Terminal bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10 text-muted-foreground select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold tracking-wide text-gray-300">{title}</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
      </div>

      {/* Terminal log window */}
      <div ref={containerRef} className="p-4 space-y-1 overflow-y-auto max-h-60 flex-1 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">$ Ready for encoding stream...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-2.5 leading-relaxed">
              <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
              <span
                className={cn(
                  log.type === "info" && "text-blue-300",
                  log.type === "success" && "text-green-400 font-semibold",
                  log.type === "warn" && "text-yellow-400",
                  log.type === "error" && "text-red-400 font-semibold"
                )}
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
