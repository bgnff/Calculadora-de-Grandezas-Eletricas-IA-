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
  const characters = Array.from(children);
  const lastCharacterIndex = characters.length - 1;

  return (
    <span ref={ref} className={className} style={style}>
      {characters.map((character, index) => {
        const isLastCharacter = index === lastCharacterIndex;
        const content = character === ' ' ? '\u00a0' : character;

        return (
          <motion.span
            key={`${character}-${index}`}
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
                    delay: delay + index * speedSegment,
                    duration: speedReveal,
                    ease: [0.22, 1, 0.36, 1],
                  }
            }
            onAnimationStart={index === 0 ? onAnimationStart : undefined}
            onAnimationComplete={isLastCharacter ? onAnimationComplete : undefined}
          >
            {content}
          </motion.span>
        );
      })}
      <span className="sr-only">{children}</span>
    </span>
  );
}