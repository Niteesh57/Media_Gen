import React from "react";
import { cn } from "../../../lib/utils";

interface TextMarqueeProps {
  text: string;
  speed?: number; // seconds for full loop
  className?: string;
}

export const TextMarquee: React.FC<TextMarqueeProps> = ({
  text,
  speed = 15,
  className,
}) => {
  return (
    <div className={cn("overflow-hidden whitespace-nowrap flex w-full", className)}>
      <div
        className="flex shrink-0 animate-marquee"
        style={{ animationDuration: `${speed}s` }}
      >
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
      </div>
    </div>
  );
};
