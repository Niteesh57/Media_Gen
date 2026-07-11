import React, { useState } from "react";
import { Dialog } from "./Dialog";
import { Copy, Check, ExternalLink, Download, Code } from "lucide-react";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  videoTitle?: string;
  onDownload?: () => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  shareUrl = "https://cap.studio/s/cap-recording-2026-07-11",
  videoTitle = "Cap Studio Screen & Webcam Recording",
  onDownload,
}) => {
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const embedCode = `<iframe src="${shareUrl}/embed" width="1280" height="720" frameborder="0" allowfullscreen></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Cap Cloud Share Studio" className="max-w-2xl">
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white text-sm">{videoTitle}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Instant cloud preview link ready to share</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Live
          </span>
        </div>

        {/* Share URL copy bar */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-primary" /> Shareable View Page URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-gray-200 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg"
            >
              {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Embed Code copy bar */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-purple-400" /> HTML Embed iframe
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={embedCode}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-gray-400 focus:outline-none"
            />
            <button
              onClick={handleCopyEmbed}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {embedCopied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
              {embedCopied ? "Copied!" : "Copy Embed"}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition-colors"
          >
            Close
          </button>
          {onDownload && (
            <button
              onClick={onDownload}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition-all"
            >
              <Download className="w-4 h-4" /> Download Video File
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
};
