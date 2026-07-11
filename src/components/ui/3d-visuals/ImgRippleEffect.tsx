import React, { useState } from "react";
import { cn } from "../../../lib/utils";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface ImgRippleEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  rippleColor?: string;
  onClickPoint?: (x: number, y: number) => void;
  className?: string;
}

export const ImgRippleEffect: React.FC<ImgRippleEffectProps> = ({
  children,
  rippleColor = "rgba(239, 68, 68, 0.8)",
  onClickPoint,
  className,
  ...props
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev, newRipple]);

    if (onClickPoint) {
      onClickPoint(x, y);
    }

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 700);
  };

  return (
    <div
      onClick={handleClick}
      className={cn("relative overflow-hidden cursor-pointer", className)}
      {...props}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full border-2 border-red-400 bg-red-500/30 pointer-events-none animate-ping"
          style={{
            left: r.x - 24,
            top: r.y - 24,
            width: 48,
            height: 48,
          }}
        />
      ))}
    </div>
  );
};
