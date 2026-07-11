import React, { useState, useEffect } from "react";
import { Dialog } from "../../components/ui/overlays/Dialog";
import { TerminalUI } from "../../components/ui/motion/TerminalUI";
import { ShimmerLoader } from "../../components/ui/motion/ShimmerLoader";
import { MultiSelector } from "../../components/ui/forms/MultiSelector";
import { Download, Share2, Sparkles } from "lucide-react";
import type { ClipSegment, CapCanvasSettings } from "../../types";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShareModal: () => void;
  projectTitle?: string;
  duration?: number;
  videoUrl?: string | null;
  clips: ClipSegment[];
  canvasSettings: CapCanvasSettings;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onOpenShareModal,
  projectTitle = "Cap Studio Pro Project",
  duration = 5,
  videoUrl,
  clips,
  canvasSettings,
  setCurrentTime,
  setIsPlaying,
}) => {
  const [resolution, setResolution] = useState("1080p");
  const [fps, setFps] = useState("30");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [logs, setLogs] = useState<{ id: string; timestamp: string; message: string; type: "info" | "success" | "warn" | "error" }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsExporting(false);
      setExportProgress(0);
      setIsFinished(false);
      setRenderedVideoUrl(null);
      setLogs([
        { id: "init", timestamp: "00:00:01", message: `Initializing Cap Codec Engine for ${resolution}@${fps}fps...`, type: "info" },
        { id: "ready", timestamp: "00:00:01", message: "Canvas compositing pipeline ready for export.", type: "info" },
      ]);
    }
  }, [isOpen, resolution, fps]);

  const startRendering = async () => {
    setIsExporting(true);
    setIsFinished(false);
    setExportProgress(0);
    setRenderedVideoUrl(null);
    setIsPlaying(false); // Pause editor preview playback

    setLogs([
      { id: "init", timestamp: "00:00:01", message: `Initializing Cap Codec Engine for ${resolution}@${fps}fps...`, type: "info" },
      { id: "ready", timestamp: "00:00:01", message: "Canvas compositing pipeline ready for export.", type: "info" },
      { id: `s-${Date.now()}`, timestamp: "00:00:02", message: "Allocating HTML5 Canvas 2D frame buffer...", type: "info" },
      { id: `a-${Date.now()}`, timestamp: "00:00:03", message: "Merging screen + webcam streams with background canvas composition...", type: "info" },
    ]);

    // Canvas dimensions
    let width = 1920;
    let height = 1080;
    if (resolution === "720p") {
      width = 1280; height = 720;
    } else if (resolution === "4K") {
      width = 3840; height = 2160;
    }

    // Create rendering canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Capture output stream from canvas
    const renderFps = parseInt(fps) || 30;
    const stream = canvas.captureStream(renderFps);

    // Setup MediaRecorder
    const recordedChunks: Blob[] = [];
    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
    } catch (e) {
      mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    const totalFrames = Math.max(30, Math.round(duration * renderFps));
    const videos = Array.from(document.querySelectorAll("video"));

    mediaRecorder.start();

    // Deterministic frame-by-frame rendering loop
    for (let frameIndex = 0; frameIndex <= totalFrames; frameIndex++) {
      if (!isOpen) {
        mediaRecorder.stop();
        return;
      }

      const t = (frameIndex / totalFrames) * duration;
      setCurrentTime(t);

      // Wait for React to scrub & browser to seek video element frames
      await new Promise((resolve) => setTimeout(resolve, 45));

      if (ctx) {
        ctx.clearRect(0, 0, width, height);

        // 1. Draw Background style
        if (canvasSettings.backgroundType === "solid") {
          ctx.fillStyle = canvasSettings.solidColor || "#1e1e24";
          ctx.fillRect(0, 0, width, height);
        } else if (canvasSettings.backgroundType === "mesh" || canvasSettings.backgroundType === "moving") {
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, "#2d2e30");
          grad.addColorStop(0.5, "#1a73e8");
          grad.addColorStop(1, "#9c27b0");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, width, height);
        }

        // 2. Draw Screen Recording Video
        const screenClip = clips.find(c => c.type === "screen" && t >= c.startOffset && t <= c.startOffset + c.duration);
        if (screenClip) {
          const screenVideo = videos.find(v => v.src === screenClip.src) || videos.find(v => v.className.includes("object-contain")) || videos[0];
          if (screenVideo) {
            ctx.save();
            const paddingPx = canvasSettings.backgroundType === "none" ? 0 : (canvasSettings.padding / 100) * width * 0.15;
            const innerW = width - paddingPx * 2;
            const innerH = height - paddingPx * 2;
            const innerX = paddingPx;
            const innerY = paddingPx;

            // Rounded corner clipping path
            const r = canvasSettings.backgroundType === "none" ? 0 : (canvasSettings.cornerRadius / 48) * 32;
            ctx.beginPath();
            ctx.moveTo(innerX + r, innerY);
            ctx.lineTo(innerX + innerW - r, innerY);
            ctx.arcTo(innerX + innerW, innerY, innerX + innerW, innerY + r, r);
            ctx.lineTo(innerX + innerW, innerY + innerH - r);
            ctx.arcTo(innerX + innerW, innerY + innerH, innerX + innerW - r, innerY + innerH, r);
            ctx.lineTo(innerX + r, innerY + innerH);
            ctx.arcTo(innerX, innerY + innerH, innerX, innerY + innerH - r, r);
            ctx.lineTo(innerX, innerY + r);
            ctx.arcTo(innerX, innerY, innerX + r, innerY, r);
            ctx.closePath();
            ctx.clip();

            // Transform (scale + translation)
            let scale = screenClip.scale || 1;
            let transX = screenClip.positionX || 0;
            let transY = screenClip.positionY || 0;

            if (screenClip.isAutoZoomSlice && screenClip.clickCoordinates) {
              scale = Math.max(1.35, scale);
              const { x, y } = screenClip.clickCoordinates;
              transX = (50 - x) * 0.8;
              transY = (50 - y) * 0.8;
            }

            ctx.translate(innerX + innerW/2, innerY + innerH/2);
            ctx.scale(scale, scale);
            ctx.translate(transX * (innerW/100), transY * (innerH/100));
            ctx.drawImage(screenVideo, -innerW/2, -innerH/2, innerW, innerH);

            ctx.restore();
          }
        }

        // 3. Draw Webcam PiP
        const webcamClip = clips.find(c => c.type === "webcam" && t >= c.startOffset && t <= c.startOffset + c.duration);
        if (webcamClip) {
          const webcamVideo = videos.find(v => v.src === webcamClip.src) || videos.find(v => v.className.includes("object-cover")) || videos[1] || videos[0];
          if (webcamVideo) {
            ctx.save();
            const pipSize = (canvasSettings.webcamSize / 100) * width * 0.25;
            let pipX = width - pipSize - 40;
            let pipY = height - pipSize - 40;

            if (canvasSettings.webcamPosition === "top-left") {
              pipX = 40; pipY = 40;
            } else if (canvasSettings.webcamPosition === "top-right") {
              pipX = width - pipSize - 40; pipY = 40;
            } else if (canvasSettings.webcamPosition === "bottom-left") {
              pipX = 40; pipY = height - pipSize - 40;
            }

            if (canvasSettings.webcamShape === "circle") {
              ctx.beginPath();
              ctx.arc(pipX + pipSize/2, pipY + pipSize/2, pipSize/2, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
            } else if (canvasSettings.webcamShape === "rounded") {
              const r = 24;
              ctx.beginPath();
              ctx.moveTo(pipX + r, pipY);
              ctx.lineTo(pipX + pipSize - r, pipY);
              ctx.arcTo(pipX + pipSize, pipY, pipX + pipSize, pipY + r, r);
              ctx.lineTo(pipX + pipSize, pipY + pipSize - r);
              ctx.arcTo(pipX + pipSize, pipY + pipSize, pipX + pipSize - r, pipY + pipSize, r);
              ctx.lineTo(pipX + r, pipY + pipSize);
              ctx.arcTo(pipX, pipY + pipSize, pipX, pipY + pipSize - r, r);
              ctx.lineTo(pipX, pipY + r);
              ctx.arcTo(pipX, pipY, pipX + r, pipY, r);
              ctx.closePath();
              ctx.clip();
            }
            ctx.drawImage(webcamVideo, pipX, pipY, pipSize, pipSize);
            ctx.restore();
          }
        }
      }

      // Update logs & progress bar
      const progressPercent = Math.round((frameIndex / totalFrames) * 100);
      setExportProgress(progressPercent);

      if (frameIndex % 30 === 0 || frameIndex === totalFrames) {
        setLogs((prev) => [
          ...prev,
          {
            id: `l-${Date.now()}-${frameIndex}`,
            timestamp: `00:00:${Math.floor(t).toString().padStart(2, "0")}`,
            message: `Processed frame ${frameIndex}/${totalFrames} (composed desktop + layout elements)...`,
            type: "info",
          },
        ]);
      }
    }

    mediaRecorder.onstop = () => {
      const finalBlob = new Blob(recordedChunks, { type: "video/webm" });
      const finalUrl = URL.createObjectURL(finalBlob);
      setRenderedVideoUrl(finalUrl);

      setLogs((prev) => [
        ...prev,
        { id: `f-${Date.now()}`, timestamp: "00:00:15", message: `Successfully encoded all frames in VP9 codec!`, type: "success" },
        { id: `done-${Date.now()}`, timestamp: "00:00:16", message: "Video composed with custom background padding ready for download.", type: "success" },
      ]);
      setIsFinished(true);
      setIsExporting(false);
    };

    mediaRecorder.stop();
  };

  const handleDownloadFile = () => {
    const downloadUrl = renderedVideoUrl || videoUrl;
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${projectTitle.toLowerCase().replace(/\s+/g, "-")}-${resolution}-${fps}fps.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Cap Studio Video Exporter" className="max-w-2xl">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 block">Output Resolution</label>
            <MultiSelector
              selectedId={resolution}
              onChange={(id) => setResolution(id)}
              options={[
                { id: "720p", label: "720p HD" },
                { id: "1080p", label: "1080p Full HD" },
                { id: "4K", label: "4K Ultra HD" },
              ]}
              className="w-full flex"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 block">Frame Rate (FPS)</label>
            <MultiSelector
              selectedId={fps}
              onChange={(id) => setFps(id)}
              options={[
                { id: "30", label: "30 FPS" },
                { id: "60", label: "60 FPS (Cap Smooth)" },
              ]}
              className="w-full flex"
            />
          </div>
        </div>

        {(isExporting || isFinished) && (
          <div className="space-y-2 animate-fadeIn">
            <ShimmerLoader
              label={isFinished ? "Export Render Complete!" : `Compositing Video (${exportProgress}%)...`}
              progress={exportProgress}
            />
          </div>
        )}

        <TerminalUI logs={logs} title={`Cap Codec Terminal - ${projectTitle}`} />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onOpenShareModal}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1.5 border border-white/10 transition-all"
          >
            <Share2 className="w-4 h-4 text-primary" />
            <span>Generate Cloud Share Link</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-400 transition-colors"
            >
              Close
            </button>
            {!isFinished ? (
              <button
                onClick={startRendering}
                disabled={isExporting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{isExporting ? "Rendering..." : "Start Export Render"}</span>
              </button>
            ) : (
              <button
                onClick={handleDownloadFile}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Video File ({resolution}.webm)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
