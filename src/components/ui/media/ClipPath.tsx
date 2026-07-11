import React from "react";
import { cn } from "../../../lib/utils";

interface ClipPathProps {
  polygon?: string;
  children: React.ReactNode;
  className?: string;
}

export const ClipPath: React.FC<ClipPathProps> = ({
  polygon = "polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)",
  children,
  className,
}) => {
  return (
    <div
      className={cn("relative overflow-hidden transition-all duration-300", className)}
      style={{ clipPath: polygon }}
    >
      {children}
    </div>
  );
};
