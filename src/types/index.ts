export type TrackType = "screen" | "webcam" | "audio" | "subtitle" | "sticker" | "adjustment";

export interface Keyframe {
  id: string;
  timestamp: number; // in seconds relative to clip start
  scale?: number;
  positionX?: number; // % offset
  positionY?: number; // % offset
  opacity?: number;
  rotation?: number;
}

export interface AutoSubtitleWord {
  id: string;
  word: string;
  start: number; // in seconds relative to clip start
  end: number;
  highlightColor?: string;
}

export interface ClipSegment {
  id: string;
  trackId: string;
  name: string;
  type: TrackType;
  src?: string; // Blob URL or stock asset URL
  duration: number; // total duration in seconds
  startOffset: number; // when it starts on timeline in seconds
  trimStart: number; // trimmed from beginning
  trimEnd: number; // trimmed from end
  speed: number; // 0.25x to 4x
  volume: number; // 0 to 100
  fadeDuration: number; // 0 to 5s
  opacity: number; // 0 to 100
  scale: number; // 1 to 5 (100% to 500%)
  positionX: number; // percentage (-100 to 100)
  positionY: number; // percentage (-100 to 100)
  rotation: number; // degrees
  keyframes?: Keyframe[];
  words?: AutoSubtitleWord[];
  // Cap Auto-Zoom properties
  isAutoZoomSlice?: boolean;
  clickCoordinates?: { x: number; y: number };
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: TrackType;
  isMuted: boolean;
  isHidden: boolean;
  isLocked: boolean;
  height: number;
}

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "21:9";
export type WebcamShape = "circle" | "rounded" | "square" | "fullscreen";

export interface CapCanvasSettings {
  aspectRatio: AspectRatio;
  padding: number; // 0 to 160px
  cornerRadius: number; // 0 to 64px
  backgroundType: "mesh" | "liquid" | "solid" | "image" | "gradient" | "moving" | "none";
  meshPresetId: string;
  movingPresetId?: string;
  solidColor: string;
  dropShadow: "none" | "soft" | "medium" | "elevated" | "neon";
  borderGlow: boolean;
  // Webcam PiP settings
  webcamShape: WebcamShape;
  webcamPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "custom";
  webcamSize: number; // percentage of screen 15% to 50%
  // Visual & Color Grading Filters
  brightness: number; // 100% is normal
  contrast: number; // 100% is normal
  saturation: number; // 100% is normal
  blurVignette: boolean;
  lutPreset: "none" | "cinematic" | "cyberpunk" | "vintage" | "high-contrast" | "bw-noir";
  // Cap Subtitle style
  subtitleStyle: "hormozi-box" | "karaoke" | "bounce" | "neon";
  subtitleColor: string;
  subtitlePosition: "bottom" | "middle" | "top";
}

export interface ProjectState {
  id: string;
  title: string;
  duration: number; // total duration of timeline in seconds
  currentTime: number; // playhead position in seconds
  isPlaying: boolean;
  zoom: number; // timeline zoom factor
  snapToGrid: boolean;
  loopRange: { in: number | null; out: number | null };
  selectedClipId: string | null;
  tracks: TimelineTrack[];
  clips: ClipSegment[];
  canvasSettings: CapCanvasSettings;
}
