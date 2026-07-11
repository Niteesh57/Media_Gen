import React, { useRef, useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import type { ClipSegment, CapCanvasSettings, AspectRatio } from "../../types";
import { MeshGradients } from "../../components/ui/3d-visuals/MeshGradients";
import { LiquidGradient } from "../../components/ui/visual-effects/LiquidGradient";
import { MovingWallpaper } from "../../components/ui/3d-visuals/MovingWallpapers";
import { VideoMasking } from "../../components/ui/media/VideoMasking";
import { ImgRippleEffect } from "../../components/ui/3d-visuals/ImgRippleEffect";
import { BlurVignette } from "../../components/ui/visual-effects/BlurVignette";
import { Sparkles, Maximize2 } from "lucide-react";

interface CanvasCompositorProps {
  clips: ClipSegment[];
  currentTime: number;
  isPlaying: boolean;
  settings: CapCanvasSettings;
  onSettingsChange: (settings: CapCanvasSettings) => void;
  onCanvasClickPoint?: (xPercent: number, yPercent: number) => void;
  className?: string;
}

// Helper component to play back and sync active audio clips
const AudioSyncPlayer: React.FC<{ clip: ClipSegment; currentTime: number; isPlaying: boolean }> = ({
  clip,
  currentTime,
  isPlaying,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const relativeTime = currentTime - clip.startOffset;
    if (Math.abs(audio.currentTime - relativeTime) > 0.15) {
      audio.currentTime = relativeTime;
    }
  }, [currentTime, clip.startOffset]);

  return (
    <audio
      ref={audioRef}
      src={clip.src}
      playbackRate={clip.speed || 1}
      className="hidden"
    />
  );
};

export const CanvasCompositor: React.FC<CanvasCompositorProps> = ({
  clips,
  currentTime,
  isPlaying,
  settings,
  onSettingsChange,
  onCanvasClickPoint,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);

  const [activeScreenClip, setActiveScreenClip] = useState<ClipSegment | null>(null);
  const [activeWebcamClip, setActiveWebcamClip] = useState<ClipSegment | null>(null);
  const [activeAudioClips, setActiveAudioClips] = useState<ClipSegment[]>([]);
  const [activeSubtitleWords, setActiveSubtitleWords] = useState<{ word: string; isHighlighted: boolean }[]>([]);
  const [isDraggingWebcam, setIsDraggingWebcam] = useState(false);
  const [webcamOffset, setWebcamOffset] = useState({ x: 0, y: 0 });

  // Find currently active clips at currentTime
  useEffect(() => {
    const screen = clips.find(
      (c) => c.type === "screen" && currentTime >= c.startOffset && currentTime <= c.startOffset + c.duration
    );
    const webcam = clips.find(
      (c) => c.type === "webcam" && currentTime >= c.startOffset && currentTime <= c.startOffset + c.duration
    );
    const audios = clips.filter(
      (c) => c.type === "audio" && currentTime >= c.startOffset && currentTime <= c.startOffset + c.duration
    );
    const subtitleClip = clips.find(
      (c) => c.type === "subtitle" && currentTime >= c.startOffset && currentTime <= c.startOffset + c.duration
    );

    setActiveScreenClip(screen || null);
    setActiveWebcamClip(webcam || null);
    setActiveAudioClips(audios);

    if (subtitleClip && subtitleClip.words) {
      const relTime = currentTime - subtitleClip.startOffset;
      const formatted = subtitleClip.words.map((w) => ({
        word: w.word,
        isHighlighted: relTime >= w.start && relTime <= w.end,
      }));
      setActiveSubtitleWords(formatted);
    } else {
      setActiveSubtitleWords([]);
    }
  }, [clips, currentTime]);

  // Synchronize main screen recording video
  useEffect(() => {
    const video = screenVideoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, activeScreenClip]);

  useEffect(() => {
    const video = screenVideoRef.current;
    if (!video || !activeScreenClip) return;

    const clipRelativeTime = currentTime - activeScreenClip.startOffset;
    if (Math.abs(video.currentTime - clipRelativeTime) > 0.15) {
      video.currentTime = clipRelativeTime;
    }
  }, [currentTime, activeScreenClip]);

  // Synchronize webcam picture-in-picture video
  useEffect(() => {
    const video = webcamVideoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, activeWebcamClip]);

  useEffect(() => {
    const video = webcamVideoRef.current;
    if (!video || !activeWebcamClip) return;

    const clipRelativeTime = currentTime - activeWebcamClip.startOffset;
    if (Math.abs(video.currentTime - clipRelativeTime) > 0.15) {
      video.currentTime = clipRelativeTime;
    }
  }, [currentTime, activeWebcamClip]);

  const getAspectStyle = (ratio: AspectRatio) => {
    switch (ratio) {
      case "16:9": return { aspectRatio: "16 / 9" };
      case "9:16": return { aspectRatio: "9 / 16", maxWidth: "420px" };
      case "1:1": return { aspectRatio: "1 / 1", maxWidth: "560px" };
      case "4:3": return { aspectRatio: "4 / 3" };
      case "21:9": return { aspectRatio: "21 / 9" };
    }
  };

  const getDropShadowClass = (shadow: string) => {
    switch (shadow) {
      case "soft": return "shadow-[0_10px_30px_rgba(0,0,0,0.45)]";
      case "medium": return "shadow-[0_20px_50px_rgba(0,0,0,0.65)]";
      case "elevated": return "shadow-[0_30px_70px_rgba(0,0,0,0.85)]";
      case "neon": return "shadow-[0_0_40px_rgba(99,102,241,0.6)]";
      default: return "";
    }
  };

  const handleRippleClick = (x: number, y: number) => {
    if (!containerRef.current || !onCanvasClickPoint) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPercent = Math.round((x / rect.width) * 100);
    const yPercent = Math.round((y / rect.height) * 100);
    onCanvasClickPoint(xPercent, yPercent);
  };

  const getVideoTransform = () => {
    if (!activeScreenClip) return { transform: "scale(1)" };

    let scale = activeScreenClip.scale || 1;
    let transX = activeScreenClip.positionX || 0;
    let transY = activeScreenClip.positionY || 0;

    if (activeScreenClip.isAutoZoomSlice && activeScreenClip.clickCoordinates) {
      scale = Math.max(1.35, scale);
      const { x, y } = activeScreenClip.clickCoordinates;
      transX = (50 - x) * 0.8;
      transY = (50 - y) * 0.8;
    }

    return {
      transform: `scale(${scale}) translate(${transX}%, ${transY}%) rotate(${activeScreenClip.rotation || 0}deg)`,
      filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`,
    };
  };

  const getWebcamPositionClass = () => {
    if (isDraggingWebcam) return "";
    switch (settings.webcamPosition) {
      case "top-left": return "top-4 left-4";
      case "top-right": return "top-4 right-4";
      case "bottom-left": return "bottom-4 left-4";
      case "bottom-right": return "bottom-4 right-4";
      default: return "bottom-4 right-4";
    }
  };

  return (
    <div className={cn("relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none", className)}>
      
      {/* Dynamic Audio Elements for synchronization */}
      {activeAudioClips.map((audioClip) => (
        <AudioSyncPlayer
          key={audioClip.id}
          clip={audioClip}
          currentTime={currentTime}
          isPlaying={isPlaying}
        />
      ))}

      {/* Aspect Ratio Container with Background Padding */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden transition-all duration-300 flex items-center justify-center rounded-xl border border-[#3c4043] shadow-md bg-[#202124]"
        style={{
          ...getAspectStyle(settings.aspectRatio),
          padding: settings.backgroundType === "none" ? "0px" : `${settings.padding}px`,
          backgroundColor: settings.backgroundType === "solid" ? settings.solidColor : undefined,
        }}
      >
        
        {/* ── Absolutely Positioned Background Layer Behind Video ── */}
        {settings.backgroundType === "mesh" && (
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
            <MeshGradients presetId={settings.meshPresetId} animated={isPlaying} />
          </div>
        )}
        {settings.backgroundType === "liquid" && (
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
            <LiquidGradient animated={isPlaying} />
          </div>
        )}
        {settings.backgroundType === "moving" && (
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
            <MovingWallpaper presetId={settings.movingPresetId || "aurora"} />
          </div>
        )}

        {/* Video Canvas Inner Frame */}
        <ImgRippleEffect
          onClickPoint={handleRippleClick}
          className={cn(
            "relative w-full h-full overflow-hidden transition-all duration-300 bg-black flex items-center justify-center z-10",
            getDropShadowClass(settings.dropShadow)
          )}
          style={{
            borderRadius: settings.backgroundType === "none" ? "0px" : `${settings.cornerRadius}px`,
          }}
        >
          {/* Main Screen Video Stream */}
          {activeScreenClip ? (
            activeScreenClip.src ? (
              <video
                ref={screenVideoRef}
                src={activeScreenClip.src}
                playsInline
                muted
                className="w-full h-full object-cover transition-transform duration-500"
                style={getVideoTransform()}
              />
            ) : (
              // Simulated high-fidelity Cap screen demo if no uploaded video
              <div
                className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white p-8 relative overflow-hidden transition-transform duration-500"
                style={getVideoTransform()}
              >
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 font-mono text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                  <span>CAP STUDIO SCREEN ({activeScreenClip.name})</span>
                </div>

                <div className="max-w-md w-full p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/30 border border-primary/50 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Advanced Screen Recording</h4>
                      <p className="text-[11px] text-gray-300">Auto-Zoom & Slicing Active</p>
                    </div>
                  </div>
                </div>

                {activeScreenClip.isAutoZoomSlice && activeScreenClip.clickCoordinates && (
                  <div
                    className="absolute z-30 transition-all duration-300 flex items-center gap-1 pointer-events-none"
                    style={{
                      left: `${activeScreenClip.clickCoordinates.x}%`,
                      top: `${activeScreenClip.clickCoordinates.y}%`,
                    }}
                  >
                    <div className="w-6 h-6 rounded-full bg-red-500/40 animate-ping absolute -inset-1" />
                    <svg className="w-6 h-6 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 0l16 12.279-6.914.598 4.394 10.334-3.666 1.558-4.394-10.334-5.42 5.109z" />
                    </svg>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center p-8 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#9aa0a6]">
                <Maximize2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#e8eaed]">No Clip Active</p>
              <p className="text-xs text-[#9aa0a6]">Record a screen clip to get started</p>
            </div>
          )}

          {settings.blurVignette && <BlurVignette radius="32px" intensity={0.5} />}

          {/* Webcam Overlay Picture-in-Picture */}
          {activeWebcamClip && (
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDraggingWebcam(true);
                const startX = e.clientX - webcamOffset.x;
                const startY = e.clientY - webcamOffset.y;
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  setWebcamOffset({
                    x: moveEvent.clientX - startX,
                    y: moveEvent.clientY - startY,
                  });
                };
                const handleMouseUp = () => {
                  setIsDraggingWebcam(false);
                  window.removeEventListener("mousemove", handleMouseMove);
                  window.removeEventListener("mouseup", handleMouseUp);
                };
                window.addEventListener("mousemove", handleMouseMove);
                window.addEventListener("mouseup", handleMouseUp);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                const positions = ["bottom-right", "bottom-left", "top-left", "top-right"] as const;
                const currentIdx = positions.indexOf(settings.webcamPosition as any);
                const nextPos = positions[(currentIdx + 1) % positions.length];
                onSettingsChange({ ...settings, webcamPosition: nextPos });
                setWebcamOffset({ x: 0, y: 0 });
              }}
              className={cn(
                "absolute z-30 cursor-move transition-transform hover:scale-105",
                getWebcamPositionClass()
              )}
              style={{
                width: `${settings.webcamSize}%`,
                transform: isDraggingWebcam
                  ? `translate(${webcamOffset.x}px, ${webcamOffset.y}px)`
                  : undefined,
              }}
              title="Drag to move | Double-click to snap"
            >
              <VideoMasking shape={settings.webcamShape} borderGlow={settings.borderGlow}>
                {activeWebcamClip.src ? (
                  <video
                    ref={webcamVideoRef}
                    src={activeWebcamClip.src}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-pink-600 flex flex-col items-center justify-center text-white p-2">
                    <span className="text-[10px] font-bold uppercase">Webcam</span>
                  </div>
                )}
              </VideoMasking>
            </div>
          )}

          {/* Subtitles */}
          {activeSubtitleWords.length > 0 && (
            <div
              className={cn(
                "absolute left-4 right-4 z-40 flex flex-wrap justify-center items-center gap-2 pointer-events-none transition-all",
                settings.subtitlePosition === "bottom" && "bottom-8",
                settings.subtitlePosition === "middle" && "top-1/2 -translate-y-1/2",
                settings.subtitlePosition === "top" && "top-8"
              )}
            >
              {activeSubtitleWords.map((item, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-extrabold text-lg sm:text-2xl tracking-tight transition-all duration-150 shadow-2xl",
                    settings.subtitleStyle === "hormozi-box" &&
                      (item.isHighlighted
                        ? "bg-yellow-400 text-black scale-110 shadow-[0_0_20px_rgba(250,204,21,0.8)] -rotate-1"
                        : "bg-black/70 text-white border border-white/20"),
                    settings.subtitleStyle === "karaoke" &&
                      (item.isHighlighted
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-400 scale-110"
                        : "text-gray-400"),
                    settings.subtitleStyle === "bounce" &&
                      (item.isHighlighted
                        ? "bg-indigo-600 text-white scale-125 animate-bounce shadow-xl"
                        : "bg-black/60 text-gray-200"),
                    settings.subtitleStyle === "neon" &&
                      (item.isHighlighted
                        ? "bg-black/90 text-green-400 border-2 border-green-400 shadow-[0_0_25px_rgba(74,222,128,0.8)] scale-110"
                        : "bg-black/60 text-white")
                  )}
                  style={item.isHighlighted && settings.subtitleColor ? { color: settings.subtitleColor } : undefined}
                >
                  {item.word}
                </span>
              ))}
            </div>
          )}
        </ImgRippleEffect>
      </div>
    </div>
  );
};
