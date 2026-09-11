import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';

interface ScrollHighlightTextProps {
  children: string;
  className?: string;
}

export function ScrollHighlightText({ children, className = '' }: ScrollHighlightTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'end 0.48'],
  });
  const words = children.split(' ');

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => (
        <HighlightWord key={`${word}-${index}`} word={word} index={index} total={words.length} progress={scrollYProgress} />
      ))}
    </p>
  );
}

function HighlightWord({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = start + 1 / total;
  const color = useTransform(progress, [start, end], ['rgba(255,255,255,.45)', 'rgba(255,255,255,.94)']);

  return (
    <motion.span style={{ color }} className="inline">
      {word}
      {index < total - 1 ? ' ' : ''}
    </motion.span>
  );
}