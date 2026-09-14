import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, type MotionValue } from 'framer-motion';

// 1. Top electric energy progress bar
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1e6fff] via-[#00d2ff] to-[#38bdf8] origin-left z-[100] shadow-[0_0_10px_rgba(30,111,255,0.7)]"
      style={{ scaleX }}
    />
  );
}

// 2. 3D Perspective Hero Container Scroll (Linear / Apple style)
export function HeroScrollContainer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Starts inclined and smaller, flattens out smoothly as user scrolls down
  const rotateX = useTransform(scrollYProgress, [0, 0.45], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.93, 1]);
  const y = useTransform(scrollYProgress, [0, 0.45], [30, 0]);
  const smoothRotateX = useSpring(rotateX, { stiffness: 180, damping: 24 });
  const smoothScale = useSpring(scale, { stiffness: 180, damping: 24 });
  const smoothY = useSpring(y, { stiffness: 180, damping: 24 });

  return (
    <div ref={containerRef} className="relative w-full [perspective:1400px]">
      <motion.div
        style={{
          rotateX: smoothRotateX,
          scale: smoothScale,
          y: smoothY,
          transformStyle: 'preserve-3d',
        }}
        className="w-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

// 3. Parallax Floating Badge / Element
export function ParallaxBadge({
  children,
  offset = 40,
  className = '',
}: {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const smoothY = useSpring(y, { stiffness: 120, damping: 20 });

  return (
    <motion.div ref={ref} style={{ y: smoothY }} className={`will-change-transform ${className}`}>
      {children}
    </motion.div>
  );
}

// 4. Scroll-Driven Text Highlight (Apple / Stripe word illumination)
export function ScrollTextHighlight({
  children,
  className = '',
  theme = 'dark',
}: {
  children: string;
  className?: string;
  theme?: 'light' | 'dark';
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.45'],
  });
  const words = children.split(' ');

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => {
        const start = index / words.length;
        const end = start + 1 / words.length;
        return (
          <HighlightWordSpan
            key={`${word}-${index}`}
            word={word}
            index={index}
            total={words.length}
            progress={scrollYProgress}
            start={start}
            end={end}
            theme={theme}
          />
        );
      })}
    </p>
  );
}

function HighlightWordSpan({
  word,
  index,
  total,
  progress,
  start,
  end,
  theme,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  start: number;
  end: number;
  theme: 'light' | 'dark';
}) {
  const opacity = useTransform(progress, [start, end], [0.3, 1]);
  const color = useTransform(
    progress,
    [start, end],
    theme === 'light' ? ['#94a3b8', '#0b1f3b'] : ['#64748b', '#ffffff']
  );

  return (
    <motion.span style={{ opacity, color }} className="inline-block transition-colors">
      {word}
      {index < total - 1 ? '\u00A0' : ''}
    </motion.span>
  );
}

// 5. Scroll-linked Step Conduit (Electric wire filling up on scroll)
export function ScrollConduitLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.7', 'end 0.5'],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 200, damping: 25 });

  return (
    <div
      ref={containerRef}
      className="absolute left-[24px] top-8 bottom-8 w-[3px] bg-[#dbe7f2] rounded-full overflow-hidden hidden md:block"
    >
      <motion.div
        style={{ scaleY }}
        className="w-full h-full bg-gradient-to-b from-[#1e6fff] via-[#00d2ff] to-[#38bdf8] origin-top shadow-[0_0_12px_#1e6fff]"
      />
    </div>
  );
}
