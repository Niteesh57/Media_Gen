import React, { useState, useEffect } from "react";
import { cn } from "./lib/utils";
import type { TimelineTrack, ClipSegment, CapCanvasSettings } from "./types";
import { CanvasCompositor } from "./modules/editor/CanvasCompositor";
import { TimelineEditor } from "./modules/editor/TimelineEditor";
import { InspectorPanel } from "./modules/features/InspectorPanel";
import { StudioRecorder } from "./modules/studio/StudioRecorder";
import { ExportDialog } from "./modules/export/ExportDialog";
import { MediaModal } from "./components/ui/overlays/MediaModal";
import {
  Download, Disc, Video, Play, Pause,
  SkipBack, SkipForward, ZoomIn, ZoomOut,
  Scissors, Film, ChevronDown, Layout, Crop, Upload,
  Info, Settings
} from "lucide-react";

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<"editor" | "recorder">("editor");
  const [tracks, setTracks] = useState<TimelineTrack[]>([]);
  const [clips, setClips] = useState<ClipSegment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [previewQuality, setPreviewQuality] = useState<string>("Quarter");
  const [autoMode, setAutoMode] = useState<string>("Auto");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [canvasSettings, setCanvasSettings] = useState<CapCanvasSettings>({
    aspectRatio: "16:9",
    padding: 40,
    cornerRadius: 16,
    backgroundType: "moving",
    meshPresetId: "cap-purple",
    movingPresetId: "aurora",
    solidColor: "#1e1e24",
    dropShadow: "elevated",
    borderGlow: true,
    webcamShape: "circle",
    webcamPosition: "bottom-right",
    webcamSize: 20,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blurVignette: false,
    lutPreset: "cinematic",
    subtitleStyle: "hormozi-box",
    subtitleColor: "#facc15",
    subtitlePosition: "bottom",
  });

  // Playback timer
  useEffect(() => {
    if (!isPlaying || duration === 0) return;
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) { setIsPlaying(false); return 0; }
        return prev + 0.05;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  // ── Handlers ──────────────────────────────────────────
  const handleClipSelect = (id: string | null) => setSelectedClipId(id);

  const handleClipUpdate = (updated: ClipSegment) =>
    setClips((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

  const handleClipSplit = (clipId: string, splitTime: number) => {
    const clip = clips.find((c) => c.id === clipId);
    if (!clip) return;
    if (splitTime <= clip.startOffset || splitTime >= clip.startOffset + clip.duration) return;

    const left = splitTime - clip.startOffset;
    const right = clip.duration - left;

    setClips((prev) =>
      prev
        .filter((c) => c.id !== clipId)
        .concat([
          { ...clip, id: `${clip.id}-L-${Date.now()}`, duration: left },
          { ...clip, id: `${clip.id}-R-${Date.now()}`, startOffset: splitTime, duration: right, trimStart: clip.trimStart + left },
        ])
    );
    setSelectedClipId(null);
  };

  const handleClipDelete = (clipId: string) => {
    setClips((prev) => prev.filter((c) => c.id !== clipId));
    if (selectedClipId === clipId) setSelectedClipId(null);
  };

  const handleClipDuplicate = (clipId: string) => {
    const clip = clips.find((c) => c.id === clipId);
    if (!clip) return;
    const copy: ClipSegment = {
      ...clip,
      id: `${clip.id}-copy-${Date.now()}`,
      name: `${clip.name} (copy)`,
      startOffset: clip.startOffset + clip.duration,
    };
    setClips((prev) => [...prev, copy]);
    setDuration((prev) => Math.max(prev, copy.startOffset + copy.duration));
  };

  const handleRecordingComplete = (screenUrl: string, webcamUrl: string | null, recDuration: number) => {
    const screenClip: ClipSegment = {
      id: `rec-screen-${Date.now()}`,
      trackId: "t-screen",
      name: "Screen Recording",
      type: "screen",
      src: screenUrl,
      duration: recDuration,
      startOffset: 0,
      trimStart: 0,
      trimEnd: 0,
      speed: 1,
      volume: 100,
      fadeDuration: 0,
      opacity: 100,
      scale: 1,
      positionX: 0,
      positionY: 0,
      rotation: 0,
    };

    const newTracks: TimelineTrack[] = [
      { id: "t-screen", name: "Screen", type: "screen", isMuted: false, isHidden: false, isLocked: false, height: 60 },
    ];
    const newClips: ClipSegment[] = [screenClip];

    if (webcamUrl) {
      newTracks.push({ id: "t-webcam", name: "Webcam", type: "webcam", isMuted: false, isHidden: false, isLocked: false, height: 50 });
      newClips.push({
        id: `rec-webcam-${Date.now()}`,
        trackId: "t-webcam",
        name: "Webcam PiP",
        type: "webcam",
        src: webcamUrl,
        duration: recDuration,
        startOffset: 0,
        trimStart: 0,
        trimEnd: 0,
        speed: 1,
        volume: 90,
        fadeDuration: 0,
        opacity: 100,
        scale: 1,
        positionX: 0,
        positionY: 0,
        rotation: 0,
      });
    }

    setTracks(newTracks);
    setClips(newClips);
    setDuration(recDuration);
    setCurrentTime(0);
    setViewMode("editor");
    setSelectedClipId(screenClip.id);
  };

  const fmtTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const selectedClipObj = clips.find((c) => c.id === selectedClipId) || null;

  return (
    <div className="min-h-screen bg-[#202124] text-[#e8eaed] font-sans flex flex-col select-none">

      {/* ── Main Content Area (Header + Stage/Recorder + Timeline) ──────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-14 bg-[#2d2e30] border-b border-[#3c4043] px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-sm text-white tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#8ab4f8] flex items-center justify-center text-[#202124] font-bold">C</span>
              <span>Cap Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3c4043] text-[#9aa0a6] font-medium font-mono">WORKSPACE</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {viewMode === "recorder" && (
              <button
                onClick={() => setViewMode("editor")}
                className="px-4 py-1.5 rounded-full bg-[#3c4043] hover:bg-[#4f5357] text-xs font-semibold text-white transition-all"
              >
                Go to Workspace Editor
              </button>
            )}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-[#3c4043] hover:bg-[#4f5357] text-xs font-medium text-[#e8eaed] transition-all"
            >
              Share Link
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              disabled={clips.length === 0}
              className="px-5 py-1.5 rounded-full bg-[#8ab4f8] hover:bg-[#9ec2ff] disabled:opacity-30 disabled:cursor-not-allowed text-[#202124] text-xs font-semibold shadow-sm transition-all"
            >
              Export
            </button>
          </div>
        </header>

        {/* Workspace views */}
        {viewMode === "recorder" ? (
          <div className="flex-1 flex items-center justify-center p-8 bg-[#202124]">
            <StudioRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4 bg-[#202124]">

            {/* Stage + Sidebar row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[380px] flex-1 overflow-hidden">

              {/* Stage Frame (Left Column) */}
              <div className="lg:col-span-8 bg-[#2d2e30] border border-[#3c4043] rounded-xl flex flex-col overflow-hidden">
                {/* Stage header */}
                <div className="h-12 border-b border-[#3c4043] px-4 flex items-center justify-between shrink-0 bg-[#2d2e30]">
                  <span className="text-xs font-medium text-[#9aa0a6]">Preview Stage</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#9aa0a6]">Rendering Resolution</span>
                    <span className="text-xs font-semibold text-white px-2.5 py-1 bg-[#3c4043] rounded-full border border-[#5f6368]">{previewQuality}</span>
                  </div>
                </div>

                {/* Viewport Stage */}
                <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden bg-[#1e1f22]">
                  {clips.length === 0 ? (
                    <div className="max-w-sm w-full p-8 rounded-xl border border-[#3c4043] bg-[#2d2e30] text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-[#3c4043] flex items-center justify-center mx-auto text-[#8ab4f8]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">No recording loaded</h4>
                        <p className="text-xs text-[#9aa0a6] mt-1">
                          Go to Record mode and capture your screen or webcam to begin.
                        </p>
                      </div>
                      <button
                        onClick={() => setViewMode("recorder")}
                        className="px-5 py-2 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white text-xs font-medium transition-all shadow"
                      >
                        Record Screen
                      </button>
                    </div>
                  ) : (
                    <CanvasCompositor
                      clips={clips}
                      currentTime={currentTime}
                      isPlaying={isPlaying}
                      settings={canvasSettings}
                      onSettingsChange={setCanvasSettings}
                      onCanvasClickPoint={(x, y) => {
                        if (selectedClipId) {
                          const clip = clips.find((c) => c.id === selectedClipId);
                          if (clip) handleClipUpdate({ ...clip, clickCoordinates: { x, y } });
                        }
                      }}
                      className="w-full h-full max-h-[460px]"
                    />
                  )}
                </div>

                {/* Stage bottom control bar */}
                <div className="h-12 border-t border-[#3c4043] px-4 flex items-center justify-between shrink-0 bg-[#2d2e30]">
                  <div className="font-mono text-xs text-[#9aa0a6] font-medium w-36">
                    {fmtTime(currentTime)} / {fmtTime(duration)}
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentTime((p) => Math.max(0, p - 0.5))}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#e8eaed] hover:bg-[#3c4043] transition-colors"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-9 h-9 rounded-full bg-[#3c4043] hover:bg-[#4f5357] text-[#8ab4f8] flex items-center justify-center transition-all shadow-sm"
                    >
                      {isPlaying
                        ? <Pause className="w-4.5 h-4.5 fill-current" />
                        : <Play className="w-4.5 h-4.5 fill-current ml-0.5" />}
                    </button>
                    <button
                      onClick={() => setCurrentTime((p) => Math.min(duration, p + 0.5))}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#e8eaed] hover:bg-[#3c4043] transition-colors"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { if (selectedClipId) handleClipSplit(selectedClipId, currentTime); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#e8eaed] hover:bg-[#3c4043] transition-colors"
                      title="Split at playhead"
                    >
                      <Scissors className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-[1px] bg-[#3c4043]" />
                    <button 
                      onClick={() => setTimelineZoom((z) => Math.max(0.5, z - 0.25))} 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#9aa0a6] hover:text-white hover:bg-[#3c4043]"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setTimelineZoom((z) => Math.min(3, z + 0.25))} 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#9aa0a6] hover:text-white hover:bg-[#3c4043]"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Panel (Right Column) */}
              <div className="lg:col-span-4 bg-[#2d2e30] border border-[#3c4043] rounded-xl overflow-hidden flex flex-col">
                <InspectorPanel
                  selectedClip={selectedClipObj}
                  canvasSettings={canvasSettings}
                  onCanvasSettingsChange={setCanvasSettings}
                  onClipUpdate={handleClipUpdate}
                  autoMode={autoMode}
                  onAutoModeChange={setAutoMode}
                  previewQuality={previewQuality}
                  onPreviewQualityChange={setPreviewQuality}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>

            {/* Timeline Panel */}
            <div className="bg-[#2d2e30] border border-[#3c4043] rounded-xl p-4 shrink-0 shadow-lg min-h-[190px]">
              <TimelineEditor
                tracks={tracks}
                clips={clips}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                zoom={timelineZoom}
                selectedClipId={selectedClipId}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onScrub={setCurrentTime}
                onZoomChange={setTimelineZoom}
                onClipSelect={handleClipSelect}
                onClipUpdate={handleClipUpdate}
                onClipSplit={handleClipSplit}
                onClipDelete={handleClipDelete}
                onClipDuplicate={handleClipDuplicate}
                onAddTrack={() => {
                  const id = `t-${Date.now()}`;
                  setTracks((prev) => [
                    ...prev,
                    { id, name: `Track ${prev.length + 1}`, type: "screen", isMuted: false, isHidden: false, isLocked: false, height: 50 },
                  ]);
                }}
              />
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onOpenShareModal={() => { setIsExportOpen(false); setIsShareModalOpen(true); }}
        projectTitle="Cap Studio Recording"
        duration={duration}
        videoUrl={clips.find((c) => c.type === "screen")?.src}
        clips={clips}
        canvasSettings={canvasSettings}
        setCurrentTime={setCurrentTime}
        setIsPlaying={setIsPlaying}
      />
      <MediaModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl="https://cap.studio/share"
        videoTitle="Cap Studio Recording"
        onDownload={() => setIsExportOpen(true)}
      />
    </div>
  );
};

export default App;
