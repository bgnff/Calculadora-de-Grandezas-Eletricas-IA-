import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import './border-glow.css';

interface BorderGlowProps {
  children: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

type GlowStyle = CSSProperties & Record<`--${string}`, string | number>;

const gradientPositions = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const gradientKeys = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'] as const;
const colorMap = [0, 1, 2, 0, 1, 2, 1];

function parseHsl(hsl: string) {
  const match = hsl.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 210, s: 100, l: 68 };
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

function buildGlowVars(glowColor: string, intensity: number): GlowStyle {
  const { h, s, l } = parseHsl(glowColor);
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const suffixes = ['', '-60', '-50', '-40', '-30', '-20', '-10'];

  return Object.fromEntries(
    opacities.map((opacity, index) => [
      `--glow-color${suffixes[index]}`,
      `hsl(${h}deg ${s}% ${l}% / ${Math.min(opacity * intensity, 100)}%)`,
    ]),
  ) as GlowStyle;
}

function buildGradientVars(colors: string[]): GlowStyle {
  const safeColors = colors.length ? colors : ['#006bff'];
  const vars = Object.fromEntries(
    gradientKeys.map((key, index) => [
      key,
      `radial-gradient(at ${gradientPositions[index]}, ${safeColors[Math.min(colorMap[index], safeColors.length - 1)]} 0px, transparent 50%)`,
    ]),
  ) as GlowStyle;
  vars['--gradient-base'] = `linear-gradient(${safeColors[0]} 0 100%)`;
  return vars;
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

function easeInCubic(value: number) {
  return value ** 3;
}

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (value: number) => number;
  onUpdate: (value: number) => void;
  onEnd?: () => void;
}) {
  const startedAt = performance.now() + delay;
  const tick = () => {
    const elapsed = performance.now() - startedAt;
    const progress = Math.min(Math.max(elapsed / duration, 0), 1);
    onUpdate(start + (end - start) * ease(progress));
    if (progress < 1) requestAnimationFrame(tick);
    else onEnd?.();
  };

  window.setTimeout(() => requestAnimationFrame(tick), delay);
}

export function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '210 100 68',
  backgroundColor = '#ffffff',
  borderRadius = 24,
  glowRadius = 28,
  glowIntensity = 0.9,
  coneSpread = 25,
  animated = false,
  colors = ['#006bff', '#0099ff', '#e55cff'],
  fillOpacity = 0.16,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const getCenter = useCallback((element: HTMLDivElement) => {
    const { width, height } = element.getBoundingClientRect();
    return [width / 2, height / 2] as const;
  }, []);

  const getEdgeProximity = useCallback(
    (element: HTMLDivElement, x: number, y: number) => {
      const [centerX, centerY] = getCenter(element);
      const distanceX = x - centerX;
      const distanceY = y - centerY;
      const scaleX = distanceX === 0 ? Infinity : centerX / Math.abs(distanceX);
      const scaleY = distanceY === 0 ? Infinity : centerY / Math.abs(distanceY);
      return Math.min(Math.max(1 / Math.min(scaleX, scaleY), 0), 1);
    },
    [getCenter],
  );

  const getCursorAngle = useCallback(
    (element: HTMLDivElement, x: number, y: number) => {
      const [centerX, centerY] = getCenter(element);
      const radians = Math.atan2(y - centerY, x - centerX);
      const degrees = radians * (180 / Math.PI) + 90;
      return degrees < 0 ? degrees + 360 : degrees;
    },
    [getCenter],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty('--edge-proximity', (getEdgeProximity(card, x, y) * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', `${getCursorAngle(card, x, y).toFixed(3)}deg`);
    },
    [getCursorAngle, getEdgeProximity],
  );

  useEffect(() => {
    if (!animated || !cardRef.current) return;
    const card = cardRef.current;
    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', '110deg');

    animateValue({ duration: 500, onUpdate: (value) => card.style.setProperty('--edge-proximity', String(value)) });
    animateValue({
      duration: 1500,
      end: 50,
      ease: easeInCubic,
      onUpdate: (value) => card.style.setProperty('--cursor-angle', `${110 + 355 * (value / 100)}deg`),
    });
    animateValue({
      delay: 1500,
      duration: 2250,
      start: 50,
      end: 100,
      onUpdate: (value) => card.style.setProperty('--cursor-angle', `${110 + 355 * (value / 100)}deg`),
    });
    animateValue({
      delay: 2500,
      duration: 1500,
      start: 100,
      end: 0,
      ease: easeInCubic,
      onUpdate: (value) => card.style.setProperty('--edge-proximity', String(value)),
      onEnd: () => card.classList.remove('sweep-active'),
    });
  }, [animated]);

  const style = {
    '--card-bg': backgroundColor,
    '--edge-sensitivity': edgeSensitivity,
    '--border-radius': `${borderRadius}px`,
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    '--fill-opacity': fillOpacity,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors),
  } as GlowStyle;

  return (
    <div ref={cardRef} onPointerMove={handlePointerMove} className={`border-glow-card ${className}`} style={style}>
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}