import { useInView, useReducedMotion, motion } from 'framer-motion';
import { useRef, type CSSProperties } from 'react';

type BlurRevealProps = {
  children: string;
  className?: string;
  delay?: number;
  speedReveal?: number;
  speedSegment?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  style?: CSSProperties;
  inView?: boolean;
  forceAnimation?: boolean;
};

export function BlurReveal({
  children,
  className,
  delay = 0,
  speedReveal = 0.7,
  speedSegment = 0.025,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
  style,
  inView = false,
  forceAnimation = false,
}: BlurRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isVisible = useInView(ref, { once: true, amount: 0.75 });
  const reducedMotion = useReducedMotion() && !forceAnimation;
  const shouldAnimate = trigger && (!inView || isVisible);
  const segments = children.match(/\S+|\s+/g) ?? [children];
  const revealableSegments = segments.filter((segment) => /\S/.test(segment));
  let revealIndex = -1;

  return (
    <span ref={ref} className={className} style={style}>
      {segments.map((segment, index) => {
        if (!/\S/.test(segment)) {
          return <span key={`space-${index}`}>{segment}</span>;
        }

        revealIndex += 1;
        const isLastSegment = revealIndex === revealableSegments.length - 1;

        return (
          <motion.span
            key={`${segment}-${index}`}
            aria-hidden="true"
            className="inline-block"
            initial={reducedMotion ? false : { opacity: 0, y: 18, filter: 'blur(12px)' }}
            animate={
              reducedMotion || shouldAnimate
                ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                : { opacity: 0, y: 18, filter: 'blur(12px)' }
            }
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    delay: delay + revealIndex * speedSegment,
                    duration: speedReveal,
                    ease: [0.22, 1, 0.36, 1],
                  }
            }
            onAnimationStart={revealIndex === 0 ? onAnimationStart : undefined}
            onAnimationComplete={isLastSegment ? onAnimationComplete : undefined}
          >
            {segment}
          </motion.span>
        );
      })}
      <span className="sr-only">{children}</span>
    </span>
  );
}