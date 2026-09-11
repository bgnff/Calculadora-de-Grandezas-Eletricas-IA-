import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function CursorBird() {
  const stageRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 115, damping: 18, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 115, damping: 18, mass: 0.5 });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      const bounds = stage.getBoundingClientRect();
      const relativeX = event.clientX - (bounds.left + bounds.width / 2);
      const relativeY = event.clientY - (bounds.top + bounds.height / 2);
      x.set(clamp(relativeX * 0.34, -bounds.width * 0.34, bounds.width * 0.34));
      y.set(clamp(relativeY * 0.34, -bounds.height * 0.34, bounds.height * 0.34));
    };

    const resetBird = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', resetBird);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', resetBird);
    };
  }, [x, y]);

  return (
    <div ref={stageRef} className="cursor-bird-stage" aria-hidden="true">
      <div className="cursor-bird-orbit cursor-bird-orbit-one" />
      <div className="cursor-bird-orbit cursor-bird-orbit-two" />
      <motion.div className="cursor-bird-wrap" style={{ x: springX, y: springY }}>
        <span className="cursor-bird-glow" />
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="cursor-bird" draggable={false} />
      </motion.div>
      <div className="cursor-bird-floor" />
      <p className="cursor-bird-hint">Mova o cursor para explorar</p>
    </div>
  );
}