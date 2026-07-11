import React, { useState } from "react";
import { cn } from "../../lib/utils";
import type { TimelineTrack, ClipSegment, TrackType } from "../../types";
import { Scissors, Trash2, Plus, Film, Camera, Music, Type, Sliders, Search } from "lucide-react";
import { SwapyDrag } from "../../components/ui/motion/SwapyDrag";

interface TimelineEditorProps {
  tracks: TimelineTrack[];
  clips: ClipSegment[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  zoom: number;
  selectedClipId: string | null;
  onPlayPause: () => void;
  onScrub: (time: number) => void;
  onZoomChange: (zoom: number) => void;
  onClipSelect: (clipId: string | null) => void;
  onClipUpdate: (clip: ClipSegment) => void;
  onClipSplit: (clipId: string, splitTimeSec: number) => void;
  onClipDelete: (clipId: string) => void;
  onClipDuplicate: (clipId: string) => void;
  onAddTrack?: () => void;
  className?: string;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  tracks,
  clips,
  currentTime,
  duration,
  zoom,
  selectedClipId,
  onScrub,
  onClipSelect,
  onClipUpdate,
  onClipSplit,
  onClipDelete,
  onAddTrack,
  className,
}) => {
  const [activeTrackType, setActiveTrackType] = useState<string>("screen");

  const pixelsPerSecond = 45 * zoom;
  const totalTimelineWidth = Math.max(800, duration * pixelsPerSecond);

  const getTrackIcon = (type: TrackType) => {
    switch (type) {
      case "screen": return <Film className="w-3.5 h-3.5 text-[#8ab4f8]" />;
      case "webcam": return <Camera className="w-3.5 h-3.5 text-emerald-400" />;
      case "audio": return <Music className="w-3.5 h-3.5 text-amber-400" />;
      case "subtitle": return <Type className="w-3.5 h-3.5 text-purple-400" />;
      case "sticker": return <Sliders className="w-3.5 h-3.5 text-pink-400" />;
      default: return <Film className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <div className={cn("flex flex-col bg-[#2d2e30] text-[#e8eaed] select-none overflow-hidden", className)}>
      <div className="flex flex-1 relative min-h-[160px]">
        
        {/* LEFT Track Sidebar */}
        <div className="w-32 shrink-0 border-r border-[#3c4043] pr-3 flex flex-col gap-3 pt-1 bg-[#2d2e30]">
          <button
            onClick={onAddTrack}
            className="w-full py-1.5 px-3 rounded-full bg-[#3c4043] hover:bg-[#4f5357] border border-[#5f6368] text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Track</span>
          </button>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTrackType("screen")}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border transition-all",
                activeTrackType === "screen"
                  ? "bg-[#8ab4f8] border-[#8ab4f8] text-[#202124]"
                  : "bg-transparent border-[#3c4043] text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#3c4043]"
              )}
              title="Screen Recording Track"
            >
              <Film className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTrackType("sticker")}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border transition-all",
                activeTrackType === "sticker"
                  ? "bg-[#8ab4f8] border-[#8ab4f8] text-[#202124]"
                  : "bg-transparent border-[#3c4043] text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#3c4043]"
              )}
              title="Auto-Zoom Track"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT Time Ruler & Grid */}
        <div className="flex-1 overflow-x-auto relative flex flex-col scrollbar-thin pl-3 bg-[#2d2e30]">
          
          {/* Time Ruler */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left + e.currentTarget.scrollLeft;
              onScrub(Math.max(0, Math.min(duration, clickX / pixelsPerSecond)));
            }}
            className="h-8 border-b border-[#3c4043] relative cursor-pointer flex items-end shrink-0 bg-[#202124]"
            style={{ width: `${totalTimelineWidth}px` }}
          >
            {Array.from({ length: Math.max(15, Math.ceil(duration) + 2) }).map((_, sec) => {
              const leftPx = sec * pixelsPerSecond;
              return (
                <div key={sec} className="absolute bottom-0 flex flex-col items-start" style={{ left: `${leftPx}px` }}>
                  <div className="h-2 w-[1px] bg-[#3c4043]" />
                  <span className="text-[10px] font-mono text-[#9aa0a6] font-medium pl-1 -translate-y-4">
                    0:{sec.toString().padStart(2, "0")}
                  </span>
                  {zoom > 0.8 && (
                    <>
                      <div className="absolute bottom-0 h-1 w-[1px] bg-[#3c4043]/45" style={{ left: `${pixelsPerSecond * 0.25}px` }} />
                      <div className="absolute bottom-0 h-1.5 w-[1px] bg-[#3c4043]" style={{ left: `${pixelsPerSecond * 0.5}px` }} />
                      <div className="absolute bottom-0 h-1 w-[1px] bg-[#3c4043]/45" style={{ left: `${pixelsPerSecond * 0.75}px` }} />
                    </>
                  )}
                </div>
              );
            })}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 z-40 pointer-events-none flex flex-col items-center"
              style={{ left: `${currentTime * pixelsPerSecond}px` }}
            >
              <div className="w-2.5 h-2.5 bg-[#ea4335] rounded-full shadow-sm -translate-y-0.5" />
              <div className="w-[1.5px] h-full bg-[#ea4335]" />
            </div>
          </div>

          {/* Tracks list */}
          <div
            className="flex-1 flex flex-col gap-3 py-3 relative min-h-[120px]"
            style={{ width: `${totalTimelineWidth}px` }}
            onClick={() => onClipSelect(null)}
          >
            {tracks.length === 0 ? (
              <div className="flex items-center justify-center h-24 border border-dashed border-[#3c4043] rounded-xl text-[#9aa0a6] text-xs font-medium">
                No tracks loaded. Start recording to edit.
              </div>
            ) : (
              tracks.map((track) => {
                const trackClips = clips.filter((c) => c.trackId === track.id);

                return (
                  <div
                    key={track.id}
                    className="relative flex items-center h-12 bg-[#202124]/40 rounded-xl border border-[#3c4043] overflow-hidden"
                  >
                    {trackClips.map((clip) => {
                      const leftPx = clip.startOffset * pixelsPerSecond;
                      const widthPx = clip.duration * pixelsPerSecond;
                      const isSelected = selectedClipId === clip.id;

                      return (
                        <SwapyDrag
                          key={clip.id}
                          id={clip.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClipSelect(clip.id);
                          }}
                          className={cn(
                            "absolute top-1 bottom-1 rounded-xl px-3 flex items-center justify-between transition-all cursor-pointer select-none group border",
                            isSelected
                              ? "bg-[#8ab4f8] border-white text-[#202124] z-30 font-semibold shadow-sm"
                              : clip.isAutoZoomSlice
                              ? "bg-[#f28b82] border-[#ea4335] text-[#202124] z-20"
                              : "bg-[#1a73e8] border-[#8ab4f8] text-white hover:bg-[#1557b0] z-10"
                          )}
                          style={{ left: leftPx, width: Math.max(54, widthPx) }}
                        >
                          {/* Trim Left Handle */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              const startX = e.clientX;
                              const origOffset = clip.startOffset;
                              const origDuration = clip.duration;
                              const origTrim = clip.trimStart;
                              const handleMouseMove = (moveE: MouseEvent) => {
                                const deltaSec = (moveE.clientX - startX) / pixelsPerSecond;
                                if (origDuration - deltaSec >= 1 && origOffset + deltaSec >= 0) {
                                  onClipUpdate({
                                    ...clip,
                                    startOffset: origOffset + deltaSec,
                                    duration: origDuration - deltaSec,
                                    trimStart: Math.max(0, origTrim + deltaSec),
                                  });
                                }
                              };
                              const handleMouseUp = () => {
                                window.removeEventListener("mousemove", handleMouseMove);
                                window.removeEventListener("mouseup", handleMouseUp);
                              };
                              window.addEventListener("mousemove", handleMouseMove);
                              window.addEventListener("mouseup", handleMouseUp);
                            }}
                            className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/10 hover:bg-black/25 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-l-xl z-30"
                          >
                            <div className="w-0.5 h-3 bg-[#e8eaed] rounded-full" />
                          </div>

                          {/* Content label */}
                          <div className="flex items-center gap-2 overflow-hidden truncate pointer-events-none">
                            {getTrackIcon(clip.type)}
                            <span className="text-xs font-medium tracking-tight truncate">{clip.name}</span>
                          </div>

                          {/* Info & controls */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono opacity-80 shrink-0 font-medium">
                              {clip.duration.toFixed(0)}s
                            </span>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onClipSplit(clip.id, currentTime);
                                }}
                                className="p-1 rounded bg-black/30 hover:bg-black/60 transition-colors"
                                title="Split"
                              >
                                <Scissors className="w-3 h-3 text-white" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onClipDelete(clip.id);
                                }}
                                className="p-1 rounded bg-black/30 hover:bg-[#ea4335] transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          </div>

                          {/* Trim Right Handle */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              const startX = e.clientX;
                              const origDuration = clip.duration;
                              const origTrimEnd = clip.trimEnd;
                              const handleMouseMove = (moveE: MouseEvent) => {
                                const deltaSec = (moveE.clientX - startX) / pixelsPerSecond;
                                if (origDuration + deltaSec >= 1) {
                                  onClipUpdate({
                                    ...clip,
                                    duration: origDuration + deltaSec,
                                    trimEnd: Math.max(0, origTrimEnd - deltaSec),
                                  });
                                }
                              };
                              const handleMouseUp = () => {
                                window.removeEventListener("mousemove", handleMouseMove);
                                window.removeEventListener("mouseup", handleMouseUp);
                              };
                              window.addEventListener("mousemove", handleMouseMove);
                              window.addEventListener("mouseup", handleMouseUp);
                            }}
                            className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/10 hover:bg-black/25 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-r-xl z-30"
                          >
                            <div className="w-0.5 h-3 bg-[#e8eaed] rounded-full" />
                          </div>
                        </SwapyDrag>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
