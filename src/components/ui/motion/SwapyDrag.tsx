import React, { useState } from "react";
import { cn } from "../../../lib/utils";

interface SwapyDragProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDragStart" | "onDrop"> {
  id: string;
  onDragStart?: (id: string, e: React.DragEvent) => void;
  onDrop?: (targetId: string, e: React.DragEvent) => void;
  children: React.ReactNode;
  className?: string;
  isDragging?: boolean;
  style?: React.CSSProperties;
}

export const SwapyDrag: React.FC<SwapyDragProps> = ({
  id,
  onDragStart,
  onDrop,
  children,
  className,
  isDragging: externalDragging,
  style,
  ...props
}) => {
  const [isOver, setIsOver] = useState(false);
  const [internalDragging, setInternalDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setInternalDragging(true);
    e.dataTransfer.setData("text/plain", id);
    if (onDragStart) onDragStart(id, e);
  };

  const handleDragEnd = () => {
    setInternalDragging(false);
    setIsOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const sourceId = e.dataTransfer.getData("text/plain");
    if (sourceId && sourceId !== id && onDrop) {
      onDrop(id, e);
    }
  };

  const isCurrentDragging = externalDragging || internalDragging;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200 select-none",
        isCurrentDragging && "opacity-40 scale-98 shadow-inner ring-2 ring-primary/40",
        isOver && "ring-2 ring-primary bg-primary/20 scale-[1.01]",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};
