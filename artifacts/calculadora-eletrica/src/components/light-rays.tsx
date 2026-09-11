import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, type CSSProperties } from 'react';

type RaysProps = {
  backgroundColor?: string;
  color?: string;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
};

export default function Rays({
  backgroundColor = 'hsl(var(--background))',
  color = '59, 166, 241',
  opacity = 0.18,
  className,
  style,
}: RaysProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let devicePixelRatio = 1;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * devicePixelRatio);
      canvas.height = Math.round(height * devicePixelRatio);
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);

      const sourceX = width * 0.48;
      const sourceY = height * 0.97;
      const drift = reducedMotion ? 0 : Math.sin(time * 0.00035) * width * 0.025;
      const rayCount = 11;

      context.save();
      context.globalCompositeOperation = 'screen';

      for (let index = 0; index < rayCount; index += 1) {
        const progress = index / (rayCount - 1);
        const angle = -Math.PI * 0.94 + progress * Math.PI * 0.88;
        const length = Math.max(width, height) * 1.4;
        const spread = 0.035 + Math.sin(progress * Math.PI) * 0.12;
        const startX = sourceX + drift;
        const startY = sourceY;
        const leftX = startX + Math.cos(angle - spread) * length;
        const rightX = startX + Math.cos(angle + spread) * length;
        const endY = startY + Math.sin(angle) * length;
        const gradient = context.createLinearGradient(startX, startY, (leftX + rightX) / 2, endY);

        gradient.addColorStop(0, `rgba(${color}, ${opacity * 1.1})`);
        gradient.addColorStop(0.42, `rgba(${color}, ${opacity * 0.45})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);

        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(leftX, endY);
        context.lineTo(rightX, endY);
        context.closePath();
        context.fillStyle = gradient;
        context.fill();
      }

      const glow = context.createRadialGradient(sourceX + drift, sourceY, 0, sourceX + drift, sourceY, width * 0.42);
      glow.addColorStop(0, `rgba(${color}, ${opacity * 0.9})`);
      glow.addColorStop(0.32, `rgba(${color}, ${opacity * 0.22})`);
      glow.addColorStop(1, `rgba(${color}, 0)`);
      context.fillStyle = glow;
      context.fillRect(0, height * 0.45, width, height * 0.55);
      context.restore();

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [color, opacity, reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}
      style={{ backgroundColor, ...style }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}