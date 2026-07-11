import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";
import {
  Disc, Square, Mic, Volume2, Radio, Check, ChevronDown, Monitor, Camera, Video
} from "lucide-react";

export type AudioSourceType = "system" | "mic" | "both" | "none";

interface StudioRecorderProps {
  onRecordingComplete: (screenBlobUrl: string, webcamBlobUrl: string | null, durationSec: number) => void;
  className?: string;
}

export const StudioRecorder: React.FC<StudioRecorderProps> = ({
  onRecordingComplete,
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [enableWebcam, setEnableWebcam] = useState(true);
  const [audioSource, setAudioSource] = useState<AudioSourceType>("both");
  const [micVolume, setMicVolume] = useState(0);
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);

  // States to track active stream to correctly show/hide placeholders
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isScreenActive, setIsScreenActive] = useState(false);

  // Media stream references
  const screenStreamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const mixedAudioStreamRef = useRef<MediaStream | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const webcamRecorderRef = useRef<MediaRecorder | null>(null);

  const screenChunksRef = useRef<Blob[]>([]);
  const webcamChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Video element refs for live preview
  const screenPreviewRef = useRef<HTMLVideoElement>(null);
  const webcamPreviewRef = useRef<HTMLVideoElement>(null);

  // Start webcam preview automatically if enabled before recording
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (enableWebcam && !isRecording) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
        .then((stream) => {
          activeStream = stream;
          webcamStreamRef.current = stream;
          setIsWebcamActive(true);
          if (webcamPreviewRef.current) {
            webcamPreviewRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn("Could not start live webcam preview:", err);
          setIsWebcamActive(false);
        });
    } else if (!enableWebcam) {
      if (webcamStreamRef.current && !isRecording) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
        webcamStreamRef.current = null;
      }
      setIsWebcamActive(false);
    }
    return () => {
      if (activeStream && !isRecording) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [enableWebcam, isRecording]);

  const startVolumeMonitor = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (err) {
      console.warn("AudioContext setup failed:", err);
    }
  };

  const stopVolumeMonitor = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    analyserRef.current = null;
    setMicVolume(0);
  };

  const startCountdownAndRecord = async () => {
    try {
      // 1. Request Screen + System Audio
      const needSystemAudio = audioSource === "system" || audioSource === "both";
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 60, max: 60 } },
        audio: needSystemAudio,
      });
      screenStreamRef.current = screenStream;
      setIsScreenActive(true);
      if (screenPreviewRef.current) {
        screenPreviewRef.current.srcObject = screenStream;
      }

      // 2. Request External Microphone if needed
      let micStream: MediaStream | null = null;
      if (audioSource === "mic" || audioSource === "both") {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (e) {
          console.warn("External microphone access denied:", e);
        }
      }

      // 3. Request Webcam stream if enabled
      let webcamStream = webcamStreamRef.current;
      if (enableWebcam && !webcamStream) {
        webcamStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        webcamStreamRef.current = webcamStream;
        setIsWebcamActive(true);
        if (webcamPreviewRef.current) {
          webcamPreviewRef.current.srcObject = webcamStream;
        }
      }

      // 4. Mix system audio + microphone if `both` is selected
      let finalAudioTracks: MediaStreamTrack[] = [];
      const screenAudioTracks = screenStream.getAudioTracks();
      const micAudioTracks = micStream ? micStream.getAudioTracks() : [];

      if (audioSource === "both" && screenAudioTracks.length > 0 && micAudioTracks.length > 0) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const destination = audioCtx.createMediaStreamDestination();
        const sysSource = audioCtx.createMediaStreamSource(new MediaStream(screenAudioTracks));
        const micSource = audioCtx.createMediaStreamSource(new MediaStream(micAudioTracks));
        sysSource.connect(destination);
        micSource.connect(destination);
        finalAudioTracks = destination.stream.getAudioTracks();
        mixedAudioStreamRef.current = destination.stream;
        startVolumeMonitor(destination.stream);
      } else if (audioSource === "mic" && micAudioTracks.length > 0) {
        finalAudioTracks = micAudioTracks;
        startVolumeMonitor(new MediaStream(micAudioTracks));
      } else if ((audioSource === "system" || audioSource === "both") && screenAudioTracks.length > 0) {
        finalAudioTracks = screenAudioTracks;
        startVolumeMonitor(new MediaStream(screenAudioTracks));
      } else if (micAudioTracks.length > 0) {
        finalAudioTracks = micAudioTracks;
        startVolumeMonitor(new MediaStream(micAudioTracks));
      }

      // Create combined screen stream + selected audio
      const combinedScreenStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...finalAudioTracks,
      ]);

      // 3-second countdown
      setCountdown(3);
      const cdTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(cdTimer);
            setCountdown(null);
            beginRecording(combinedScreenStream, webcamStream);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      screenStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };
    } catch (err) {
      console.error("Recording failed to start or cancelled:", err);
    }
  };

  const beginRecording = (screenStream: MediaStream, webcamStream: MediaStream | null) => {
    screenChunksRef.current = [];
    webcamChunksRef.current = [];
    setRecordingSeconds(0);
    recordingStartTimeRef.current = Date.now();
    setIsRecording(true);

    const screenRec = new MediaRecorder(screenStream, { mimeType: "video/webm; codecs=vp9" });
    screenRecorderRef.current = screenRec;
    screenRec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) screenChunksRef.current.push(e.data);
    };
    screenRec.start(250);

    if (webcamStream && enableWebcam) {
      const webcamRec = new MediaRecorder(webcamStream, { mimeType: "video/webm; codecs=vp9" });
      webcamRecorderRef.current = webcamRec;
      webcamRec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) webcamChunksRef.current.push(e.data);
      };
      webcamRec.start(250);
    }

    timerRef.current = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsScreenActive(false);
    setIsWebcamActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    stopVolumeMonitor();

    // Calculate actual elapsed duration in seconds using high precision timestamp
    const elapsedSeconds = recordingStartTimeRef.current > 0
      ? (Date.now() - recordingStartTimeRef.current) / 1000
      : 5;

    let screenBlobUrl: string | null = null;
    let webcamBlobUrl: string | null = null;
    let screenStopped = false;
    let webcamStopped = false;

    const checkComplete = () => {
      const needWebcam = enableWebcam && webcamRecorderRef.current;
      if (screenStopped && (!needWebcam || webcamStopped)) {
        onRecordingComplete(screenBlobUrl!, webcamBlobUrl, elapsedSeconds);
      }
    };

    if (screenRecorderRef.current) {
      screenRecorderRef.current.onstop = () => {
        const screenBlob = new Blob(screenChunksRef.current, { type: "video/webm" });
        screenBlobUrl = URL.createObjectURL(screenBlob);
        screenStopped = true;
        checkComplete();
      };
      if (screenRecorderRef.current.state !== "inactive") {
        screenRecorderRef.current.stop();
      } else {
        screenStopped = true;
      }
    } else {
      screenStopped = true;
    }

    if (webcamRecorderRef.current) {
      webcamRecorderRef.current.onstop = () => {
        const webcamBlob = new Blob(webcamChunksRef.current, { type: "video/webm" });
        webcamBlobUrl = URL.createObjectURL(webcamBlob);
        webcamStopped = true;
        checkComplete();
      };
      if (webcamRecorderRef.current.state !== "inactive") {
        webcamRecorderRef.current.stop();
      } else {
        webcamStopped = true;
      }
    } else {
      webcamStopped = true;
    }

    // Stop all media tracks
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (mixedAudioStreamRef.current) {
      mixedAudioStreamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getAudioSourceLabel = () => {
    switch (audioSource) {
      case "both": return "System + Microphone";
      case "system": return "System Audio Only";
      case "mic": return "Microphone Only";
      case "none": return "Muted";
    }
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto bg-[#2d2e30] border border-[#3c4043] rounded-xl p-6 shadow-xl space-y-6 text-[#e8eaed] select-none", className)}>
      
      {/* Title bar - Clean Google style */}
      <div className="flex items-center justify-between pb-4 border-b border-[#3c4043]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3c4043] flex items-center justify-center text-[#8ab4f8]">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-white tracking-tight">Cap Studio Recorder</h3>
            <p className="text-xs text-[#9aa0a6] mt-0.5">
              Simultaneous screen + webcam recording with customizable mixing
            </p>
          </div>
        </div>
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#202124]/90">
          <div className="text-8xl font-bold text-white tracking-tighter">
            {countdown}
          </div>
          <p className="text-sm text-[#9aa0a6] mt-4 tracking-widest uppercase font-mono">
            Get Ready...
          </p>
        </div>
      )}

      {/* Live Previews Grid */}
      <div className={cn("grid gap-4", enableWebcam ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1")}>
        
        {/* Screen Preview */}
        <div className={cn(
          "relative aspect-video rounded-xl bg-[#202124] border border-[#3c4043] overflow-hidden flex items-center justify-center",
          enableWebcam ? "md:col-span-2" : "w-full max-h-[460px]"
        )}>
          <video
            ref={screenPreviewRef}
            autoPlay
            muted
            playsInline
            className={cn("w-full h-full object-contain", !isScreenActive && "hidden")}
          />
          {!isScreenActive && (
            <div className="text-center space-y-3 p-6 max-w-md">
              <div className="w-12 h-12 rounded-full bg-[#2d2e30] flex items-center justify-center mx-auto text-[#9aa0a6]">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Screen Capture Preview</h4>
                <p className="text-xs text-[#9aa0a6] mt-1">
                  Ready to capture. Click "Start Recording" below to pick your screen source.
                </p>
              </div>
            </div>
          )}
          {isRecording && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#ea4335] text-white font-mono text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              RECORDING ({formatTime(recordingSeconds)})
            </div>
          )}
        </div>

        {/* Webcam Preview (Only rendered if enableWebcam is TRUE) */}
        {enableWebcam && (
          <div className="space-y-4 flex flex-col justify-between">
            <div className="relative aspect-video md:aspect-square rounded-xl bg-[#202124] border border-[#3c4043] overflow-hidden flex items-center justify-center">
              <video
                ref={webcamPreviewRef}
                autoPlay
                muted
                playsInline
                className={cn("w-full h-full object-cover", !isWebcamActive && "hidden")}
              />
              {!isWebcamActive && (
                <div className="text-center p-6 space-y-2 absolute inset-0 flex flex-col items-center justify-center bg-[#202124] z-10">
                  <Camera className="w-7 h-7 text-[#9aa0a6] mx-auto" />
                  <p className="text-xs font-medium text-white">Camera Preview</p>
                  <span className="text-[10px] text-[#9aa0a6] block">Activating stream...</span>
                </div>
              )}
              {isRecording && isWebcamActive && (
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-[#202124]/85 border border-[#3c4043] text-[10px] text-[#8ab4f8] font-mono font-medium">
                  ACTIVE
                </div>
              )}
            </div>

            {/* Audio VU Meter */}
            <div className="p-3.5 rounded-xl bg-[#202124] border border-[#3c4043] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#e8eaed] font-medium flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#8ab4f8]" /> Audio Level
                </span>
                <span className="font-mono text-xs text-[#8ab4f8] font-bold">{micVolume}%</span>
              </div>
              <div className="w-full bg-[#2d2e30] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#8ab4f8] h-full transition-all duration-100"
                  style={{ width: `${micVolume}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audio Level below screen preview (if webcam is off) */}
      {!enableWebcam && (
        <div className="p-4 rounded-xl bg-[#202124] border border-[#3c4043] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#e8eaed]">
            <Radio className="w-4 h-4 text-[#8ab4f8]" />
            <span>Audio Status ({getAudioSourceLabel()})</span>
          </div>
          <div className="flex-1 max-w-md bg-[#2d2e30] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#8ab4f8] h-full transition-all duration-100"
              style={{ width: `${micVolume}%` }}
            />
          </div>
          <span className="font-mono text-xs text-[#8ab4f8] font-bold w-12 text-right">{micVolume}%</span>
        </div>
      )}

      {/* Footer Controls - Google style pills & circles */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#3c4043]">
        
        {/* Toggle options */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEnableWebcam(!enableWebcam)}
            disabled={isRecording}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-2",
              enableWebcam
                ? "bg-[#303134] border-[#5f6368] text-white"
                : "bg-transparent border-[#3c4043] text-[#9aa0a6] hover:bg-[#303134]"
            )}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera: {enableWebcam ? "ON" : "OFF"}</span>
          </button>

          {/* Audio selector pill */}
          <div className="relative">
            <button
              onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
              disabled={isRecording}
              className="px-4 py-2 rounded-full text-xs font-medium transition-all border bg-[#303134] border-[#5f6368] text-white hover:bg-[#3c4043] flex items-center gap-2"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#8ab4f8]" />
              <span>Audio: {audioSource.toUpperCase()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#9aa0a6]" />
            </button>

            {isAudioMenuOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-64 rounded-xl bg-[#303134] border border-[#5f6368] shadow-lg p-1.5 z-50 space-y-0.5">
                {[
                  { id: "both", label: "System + Microphone" },
                  { id: "system", label: "System Audio Only" },
                  { id: "mic", label: "Microphone Only" },
                  { id: "none", label: "Mute" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAudioSource(item.id as AudioSourceType);
                      setIsAudioMenuOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors",
                      audioSource === item.id 
                        ? "bg-[#8ab4f8]/10 text-[#8ab4f8]" 
                        : "hover:bg-[#3c4043] text-[#e8eaed]"
                    )}
                  >
                    <span>{item.label}</span>
                    {audioSource === item.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Start/Stop Recording */}
        <div>
          {!isRecording ? (
            <button
              onClick={startCountdownAndRecord}
              className="px-6 py-2 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white text-xs font-medium flex items-center gap-2 transition-all shadow"
            >
              <Disc className="w-4 h-4" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-6 py-2 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white text-xs font-medium flex items-center gap-2 transition-all animate-pulse"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Recording ({formatTime(recordingSeconds)})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
