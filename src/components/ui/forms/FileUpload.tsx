import React, { useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import { UploadCloud } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: FileList) => void;
  accept?: string;
  label?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  accept = "video/*,audio/*,image/*",
  label = "Drag & drop video, audio, or image files here, or browse",
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 text-center select-none group",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
        className="hidden"
      />
      <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
        <UploadCloud className="w-6 h-6 text-primary" />
      </div>
      <p className="text-xs font-semibold text-foreground tracking-wide">{label}</p>
      <p className="text-[10px] text-muted-foreground mt-1">
        Supports MP4, WebM, MOV, MP3, WAV, PNG, JPG (Cap Studio Ready)
      </p>
    </div>
  );
};
