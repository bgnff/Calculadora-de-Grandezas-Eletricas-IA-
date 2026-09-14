import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  className?: string;
  onClick?: () => void;
}

export function Magnet({
  children,
  padding = 60,
  disabled = false,
  magnetStrength = 0.35,
  className = '',
  onClick,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useSpring(0, { stiffness: 350, damping: 20, mass: 0.5 });
  const y = useSpring(0, { stiffness: 350, damping: 20, mass: 0.5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distFromCenter = Math.hypot(e.clientX - centerX, e.clientY - centerY);
    const maxDist = Math.max(width, height) / 2 + padding;

    if (distFromCenter < maxDist) {
      x.set((e.clientX - centerX) * magnetStrength);
      y.set((e.clientY - centerY) * magnetStrength);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x, y }}
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}
