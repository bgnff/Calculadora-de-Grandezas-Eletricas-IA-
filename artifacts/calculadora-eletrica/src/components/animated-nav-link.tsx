import { motion, type Transition } from 'framer-motion';

const textTransition: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 32,
  mass: 1.1,
};

const washTransition: Transition = {
  duration: 0.42,
  ease: [0.32, 0.72, 0, 1],
};

interface AnimatedNavLinkProps {
  href: string;
  children: string;
  dark?: boolean;
  className?: string;
}

export function AnimatedNavLink({ href, children, dark = false, className = '' }: AnimatedNavLinkProps) {
  return (
    <motion.a
      href={href}
      className={`group relative block overflow-hidden rounded-full px-3 py-2 text-xs ${dark ? 'text-white/70' : 'text-[hsl(var(--muted-foreground))]'} ${className}`}
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      variants={{ rest: {}, hover: {} }}
    >
      <motion.span
        className="relative z-10 block"
        variants={{
          rest: { y: 0, opacity: 1 },
          hover: { y: -18, opacity: 0, scale: 0.82, rotate: -3 },
        }}
        transition={textTransition}
      >
        {children}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 z-10 flex items-center justify-center text-[#0b1f3b]"
        initial={{ y: 18, opacity: 0, scale: 0.82, rotate: 3 }}
        variants={{
          rest: { y: 18, opacity: 0, scale: 0.82, rotate: 3 },
          hover: { y: 0, opacity: 1, scale: 1, rotate: 0 },
        }}
        transition={textTransition}
      >
        {children}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-[#d7ebff]"
        initial={{ opacity: 0, scaleX: 0.35 }}
        variants={{
          rest: { opacity: 0, scaleX: 0.35 },
          hover: { opacity: 1, scaleX: 1 },
        }}
        transition={washTransition}
      />
    </motion.a>
  );
}