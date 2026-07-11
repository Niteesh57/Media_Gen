import React from "react";
import { cn } from "../../../lib/utils";
import { Video, Disc, Share2, Download } from "lucide-react";

interface ResponsiveHeaderProps {
  isRecording?: boolean;
  recordingTime?: string;
  onStartRecord?: () => void;
  onStopRecord?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  projectTitle?: string;
  className?: string;
}

export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  isRecording = false,
  recordingTime = "00:00:00",
  onStartRecord,
  onStopRecord,
  onExport,
  onShare,
  projectTitle = "Cap Studio Pro Project",
  className,
}) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full px-4 py-2.5 bg-black/60 backdrop-blur-glass border-b border-white/10 flex items-center justify-between shadow-lg",
        className
      )}
    >
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.6)]">
          <Video className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            Cap Studio & Video Editor <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/20 text-primary-foreground border border-primary/30">PRO</span>
          </h1>
          <p className="text-[10px] text-muted-foreground">{projectTitle}</p>
        </div>
      </div>

      {/* Recording Status & Quick Controls */}
      <div className="flex items-center gap-3">
        {isRecording ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 animate-pulse">
            <Disc className="w-4 h-4 text-red-500 animate-spin" />
            <span className="font-mono text-xs font-bold text-red-400">{recordingTime}</span>
            <button
              onClick={onStopRecord}
              className="ml-2 px-2.5 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
            >
              Stop
            </button>
          </div>
        ) : (
          <button
            onClick={onStartRecord}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all scale-[1.02] hover:scale-105"
          >
            <Disc className="w-3.5 h-3.5" />
            <span>New Studio Record</span>
          </button>
        )}

        <div className="h-4 w-px bg-white/15 hidden md:block" />

        <button
          onClick={onShare}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-200 flex items-center gap-1.5 border border-white/10 transition-all"
        >
          <Share2 className="w-3.5 h-3.5 text-primary" />
          <span className="hidden md:inline">Cloud Share</span>
        </button>

        <button
          onClick={onExport}
          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_14px_rgba(99,102,241,0.4)] transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
};
