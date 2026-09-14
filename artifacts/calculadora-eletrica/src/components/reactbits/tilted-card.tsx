import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  maxAngle?: number;
  scale?: number;
  glareOpacity?: number;
}

export function TiltedCard({
  children,
  className = '',
  maxAngle = 10,
  scale = 1.02,
  glareOpacity = 0.25,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useSpring(0, { stiffness: 350, damping: 25 });
  const rotateY = useSpring(0, { stiffness: 350, damping: 25 });
  const scaleSpring = useSpring(1, { stiffness: 350, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width;
    const yPct = mouseY / height;

    const rotX = (yPct - 0.5) * -maxAngle;
    const rotY = (xPct - 0.5) * maxAngle;

    rotateX.set(rotX);
    rotateY.set(rotY);
    scaleSpring.set(scale);

    setGlarePosition({ x: xPct * 100, y: yPct * 100 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    scaleSpring.set(1);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200 }}
      className={`relative will-change-transform ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale: scaleSpring,
          transformStyle: 'preserve-3d',
        }}
        className="relative h-full w-full rounded-2xl"
      >
        {children}

        {/* Specular Glare Effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            opacity: isHovered ? glareOpacity : 0,
            background: `radial-gradient(circle 350px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.45), transparent 70%)`,
          }}
        />
      </motion.div>
    </div>
  );
}
