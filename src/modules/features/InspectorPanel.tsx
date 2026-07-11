import React, { useState } from "react";
import { cn } from "../../lib/utils";
import type { ClipSegment, CapCanvasSettings, AspectRatio } from "../../types";
import { MESH_PRESETS } from "../../components/ui/3d-visuals/MeshGradients";
import { MOVING_WALLPAPER_PRESETS } from "../../components/ui/3d-visuals/MovingWallpapers";
import { RangeSlider } from "../../components/ui/forms/RangeSlider";
import { ColorPicker } from "../../components/ui/forms/ColorPicker";
import {
  Image, Video, Volume2, Sliders, Settings,
  Palette, Circle, Ban, Info, Monitor, Layout, SlidersHorizontal
} from "lucide-react";

interface InspectorPanelProps {
  selectedClip: ClipSegment | null;
  canvasSettings: CapCanvasSettings;
  onCanvasSettingsChange: (settings: CapCanvasSettings) => void;
  onClipUpdate: (clip: ClipSegment) => void;
  autoMode: string;
  onAutoModeChange: (mode: string) => void;
  previewQuality: string;
  onPreviewQualityChange: (quality: string) => void;
  viewMode: "editor" | "recorder";
  onViewModeChange: (mode: "editor" | "recorder") => void;
  className?: string;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedClip,
  canvasSettings,
  onCanvasSettingsChange,
  onClipUpdate,
  autoMode,
  onAutoModeChange,
  previewQuality,
  onPreviewQualityChange,
  viewMode,
  onViewModeChange,
  className,
}) => {
  const [activeTabId, setActiveTabId] = useState<string>("canvas");

  const set = (key: keyof CapCanvasSettings, value: any) => {
    onCanvasSettingsChange({ ...canvasSettings, [key]: value });
  };

  const setClip = (key: keyof ClipSegment, value: any) => {
    if (!selectedClip) return;
    onClipUpdate({ ...selectedClip, [key]: value });
  };

  const tabs = [
    { id: "canvas",  label: "Canvas",       icon: <Settings className="w-4 h-4" /> },
    { id: "bg",      label: "Background",   icon: <Image className="w-4 h-4" /> },
    { id: "video",   label: "Video & PiP",  icon: <Video className="w-4 h-4" /> },
    { id: "audio",   label: "Audio & Color",icon: <Volume2 className="w-4 h-4" /> },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-[#2d2e30] text-gray-200 overflow-hidden", className)}>
      {/* Tab bar */}
      <div className="flex items-center border-b border-[#3c4043] bg-[#191a1f] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            title={tab.label}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-all relative",
              activeTabId === tab.id
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTabId === tab.id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-indigo-500" />
            )}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* ── TAB: CANVAS & STAGE PARAMETERS ────────────────── */}
        {activeTabId === "canvas" && (
          <div className="space-y-5">
            
            {/* Workspace Mode switcher */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">Workspace Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "editor", label: "Editor" },
                  { id: "recorder", label: "Record Screen" }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => onViewModeChange(mode.id as any)}
                    className={cn(
                      "py-2 rounded-xl border text-xs font-semibold text-center transition-all",
                      viewMode === mode.id
                        ? "border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]"
                        : "border-[#3c4043] bg-[#202124] text-gray-400 hover:text-white"
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-2 pt-2 border-t border-[#3c4043]">
              <label className="text-xs font-semibold text-gray-400 block">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "16:9", label: "16:9 Landscape" },
                  { id: "9:16", label: "9:16 Portrait" },
                  { id: "1:1",  label: "1:1 Square" },
                ].map((aspect) => (
                  <button
                    key={aspect.id}
                    onClick={() => set("aspectRatio", aspect.id as AspectRatio)}
                    className={cn(
                      "py-2 px-1.5 rounded-xl border text-xs font-semibold text-center transition-all",
                      canvasSettings.aspectRatio === aspect.id
                        ? "border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]"
                        : "border-[#3c4043] bg-[#202124] text-gray-400 hover:text-white"
                    )}
                  >
                    {aspect.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto / Manual Zoom Mode Toggle */}
            <div className="space-y-2 pt-2 border-t border-[#3c4043]">
              <label className="text-xs font-semibold text-gray-400 block">Zoom Behavior Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {["Auto", "Manual"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onAutoModeChange(mode)}
                    className={cn(
                      "py-2 rounded-xl border text-xs font-semibold transition-all",
                      autoMode === mode
                        ? "border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]"
                        : "border-[#3c4043] bg-[#202124] text-gray-400 hover:text-white"
                    )}
                  >
                    {mode === "Auto" ? "Auto-Zoom Focus" : "Manual Scaling"}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Quality Selector */}
            <div className="space-y-2 pt-2 border-t border-[#3c4043]">
              <label className="text-xs font-semibold text-gray-400 block">Rendering Resolution</label>
              <div className="grid grid-cols-2 gap-2">
                {["Quarter", "Full HD"].map((quality) => (
                  <button
                    key={quality}
                    onClick={() => onPreviewQualityChange(quality)}
                    className={cn(
                      "py-2 rounded-xl border text-xs font-semibold transition-all",
                      previewQuality === quality
                        ? "border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]"
                        : "border-[#3c4043] bg-[#202124] text-gray-400 hover:text-white"
                    )}
                  >
                    {quality === "Quarter" ? "Quarter (Fast)" : "Full HD (Clear)"}
                  </button>
                ))}
              </div>
            </div>
            
          </div>
        )}

        {/* ── TAB: BACKGROUND ─────────────────────────────── */}
        {activeTabId === "bg" && (
          <div className="space-y-5">
            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "moving",  label: "Wallpaper", icon: <Palette className="w-3.5 h-3.5 text-teal-400" />, preview: "from-blue-500 via-teal-400 to-emerald-500" },
                { id: "mesh",    label: "Mesh",       icon: <Palette className="w-3.5 h-3.5 text-violet-400" />, preview: "from-indigo-500 to-purple-500" },
                { id: "solid",   label: "Color",      icon: <Circle className="w-3.5 h-3.5 text-indigo-300" />, preview: "from-indigo-500 to-indigo-600" },
                { id: "none",    label: "None",       icon: <Ban className="w-3.5 h-3.5 text-gray-400" />, preview: null },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => set("backgroundType", opt.id as any)}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all",
                    canvasSettings.backgroundType === opt.id
                      ? "border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]"
                      : "border-[#3c4043] bg-[#202124] text-gray-400 hover:border-[#5f6368] hover:text-gray-200"
                  )}
                >
                  {opt.preview ? (
                    <div className={cn("w-6 h-6 rounded-md bg-gradient-to-br flex items-center justify-center", opt.preview)}>
                      {opt.icon}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-[#252730] flex items-center justify-center">
                      {opt.icon}
                    </div>
                  )}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* None: info banner */}
            {canvasSettings.backgroundType === "none" && (
              <div className="p-3 rounded-xl bg-[#8ab4f8]/10 border border-[#8ab4f8]/20 text-xs text-[#8ab4f8] flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Full-screen mode — padding and corner radius are removed so the video fills the entire canvas.</span>
              </div>
            )}

            {/* Moving wallpaper picker */}
            {canvasSettings.backgroundType === "moving" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 block">Animated Wallpaper Style</label>
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  {MOVING_WALLPAPER_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => set("movingPresetId", p.id)}
                      className={cn(
                        "w-full px-3 py-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all",
                        (canvasSettings.movingPresetId || "aurora") === p.id
                          ? "border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]"
                          : "border-[#3c4043] bg-[#202124] text-gray-400 hover:bg-[#303134] hover:text-gray-200"
                      )}
                    >
                      <span>{p.name}</span>
                      <div className="flex gap-1">
                        {p.previewColors.map((c, i) => (
                          <span key={i} className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mesh preset picker */}
            {canvasSettings.backgroundType === "mesh" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 block">Mesh Gradient Preset</label>
                <div className="space-y-1">
                  {MESH_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => set("meshPresetId", p.id)}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl border flex items-center justify-between text-xs font-medium transition-all",
                        canvasSettings.meshPresetId === p.id
                          ? "border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]"
                          : "border-[#3c4043] bg-[#202124] text-gray-400 hover:bg-[#303134]"
                      )}
                    >
                      <span>{p.name}</span>
                      <div className="flex gap-1">
                        {p.colors.map((c, i) => (
                          <span key={i} className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Solid color picker */}
            {canvasSettings.backgroundType === "solid" && (
              <ColorPicker
                label="Background Color"
                selectedColor={canvasSettings.solidColor}
                onChange={(c) => set("solidColor", c)}
              />
            )}

            {/* Padding + Corner radius */}
            {canvasSettings.backgroundType !== "none" && (
              <div className="pt-2 border-t border-[#3c4043] space-y-3">
                <RangeSlider
                  label="Canvas Padding"
                  value={canvasSettings.padding}
                  min={0}
                  max={120}
                  step={4}
                  onChange={(v) => set("padding", v)}
                  unit="px"
                />
                <RangeSlider
                  label="Corner Radius"
                  value={canvasSettings.cornerRadius}
                  min={0}
                  max={48}
                  step={2}
                  onChange={(v) => set("cornerRadius", v)}
                  unit="px"
                />
              </div>
            )}
          </div>
        )}

        {/* ── TAB: VIDEO & PiP ────────────────────────────── */}
        {activeTabId === "video" && (
          <div className="space-y-5">
            <div className="space-y-4 p-4 rounded-2xl bg-[#202124] border border-[#3c4043]">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 block">Webcam Bubble Shape</label>
                <div className="grid grid-cols-3 gap-2">
                  {["circle", "rounded", "square"].map((shape) => (
                    <button
                      key={shape}
                      onClick={() => set("webcamShape", shape)}
                      className={cn(
                        "py-2 rounded-xl border text-xs font-semibold capitalize transition-all",
                        canvasSettings.webcamShape === shape
                          ? "border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]"
                          : "border-[#3c4043] bg-[#2d2e30] text-gray-400 hover:text-white"
                      )}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              <RangeSlider
                label="Bubble Size"
                value={canvasSettings.webcamSize}
                min={12}
                max={40}
                step={2}
                onChange={(v) => set("webcamSize", v)}
                unit="%"
              />

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 block">Default Position</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "top-left", label: "Top Left" },
                    { id: "top-right", label: "Top Right" },
                    { id: "bottom-left", label: "Bottom Left" },
                    { id: "bottom-right", label: "Bottom Right" },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => set("webcamPosition", pos.id)}
                      className={cn(
                        "py-2 rounded-xl border text-xs font-medium transition-all",
                        canvasSettings.webcamPosition === pos.id
                          ? "border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]"
                          : "border-[#3c4043] bg-[#2d2e30] text-gray-400 hover:text-white"
                      )}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Per-clip transforms */}
            {selectedClip && (
              <div className="space-y-4 p-4 rounded-2xl bg-[#202124] border border-[#3c4043]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{selectedClip.name}</span>
                  <span className="text-xs font-mono text-indigo-400">{selectedClip.duration.toFixed(1)}s</span>
                </div>
                <RangeSlider
                  label="Scale"
                  value={selectedClip.scale || 1}
                  min={0.5}
                  max={3}
                  step={0.05}
                  onChange={(v) => setClip("scale", v)}
                  unit="x"
                />
                <RangeSlider
                  label="Pan X"
                  value={selectedClip.positionX || 0}
                  min={-100}
                  max={100}
                  step={2}
                  onChange={(v) => setClip("positionX", v)}
                  unit="%"
                />
                <RangeSlider
                  label="Pan Y"
                  value={selectedClip.positionY || 0}
                  min={-100}
                  max={100}
                  step={2}
                  onChange={(v) => setClip("positionY", v)}
                  unit="%"
                />
              </div>
            )}

            {!selectedClip && (
              <p className="text-xs text-gray-500 text-center py-4">
                Select a clip on the timeline to adjust its size or position.
              </p>
            )}
          </div>
        )}

        {/* ── TAB: AUDIO & COLOR GRADING ───────────────────── */}
        {activeTabId === "audio" && (
          <div className="space-y-5">
            {selectedClip ? (
              <div className="space-y-4 p-4 rounded-2xl bg-[#202124] border border-[#3c4043]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{selectedClip.name}</span>
                  <span className="text-xs font-mono text-indigo-400">{selectedClip.duration.toFixed(1)}s</span>
                </div>
                <RangeSlider
                  label="Volume"
                  value={selectedClip.volume ?? 100}
                  min={0}
                  max={100}
                  step={5}
                  onChange={(v) => setClip("volume", v)}
                  unit="%"
                />
                <RangeSlider
                  label="Playback Speed"
                  value={selectedClip.speed || 1}
                  min={0.25}
                  max={3}
                  step={0.25}
                  onChange={(v) => setClip("speed", v)}
                  unit="x"
                />
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">
                Select a clip on the timeline to adjust audio levels.
              </p>
            )}

            {/* Color Grading */}
            <div className="space-y-4 p-4 rounded-2xl bg-[#202124] border border-[#3c4043] pt-4">
              <span className="text-xs font-semibold text-white block">Color Grading & Filters</span>
              <RangeSlider
                label="Brightness"
                value={canvasSettings.brightness}
                min={50}
                max={150}
                step={5}
                onChange={(v) => set("brightness", v)}
                unit="%"
              />
              <RangeSlider
                label="Contrast"
                value={canvasSettings.contrast}
                min={50}
                max={150}
                step={5}
                onChange={(v) => set("contrast", v)}
                unit="%"
              />
              <RangeSlider
                label="Saturation"
                value={canvasSettings.saturation}
                min={0}
                max={200}
                step={10}
                onChange={(v) => set("saturation", v)}
                unit="%"
              />
              <div className="flex items-center justify-between pt-2 border-t border-[#3c4043]">
                <span className="text-xs font-medium text-gray-300">Vignette Shadow</span>
                <button
                  onClick={() => set("blurVignette", !canvasSettings.blurVignette)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                    canvasSettings.blurVignette
                      ? "bg-[#8ab4f8] text-[#202124]"
                      : "bg-[#303134] text-gray-400 hover:text-white"
                  )}
                >
                  {canvasSettings.blurVignette ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
