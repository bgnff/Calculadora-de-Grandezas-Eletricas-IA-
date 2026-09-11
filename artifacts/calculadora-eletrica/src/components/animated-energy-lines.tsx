import { motion } from 'framer-motion';

const lines = [
  { width: 80, height: 58, opacity: 0.1 },
  { width: 56, height: 76, opacity: 0.13 },
  { width: 92, height: 48, opacity: 0.08 },
  { width: 64, height: 88, opacity: 0.14 },
  { width: 108, height: 64, opacity: 0.09 },
  { width: 72, height: 82, opacity: 0.12 },
  { width: 48, height: 52, opacity: 0.08 },
];

export function AnimatedEnergyLines() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 top-16 z-0 flex items-end justify-center gap-1 overflow-hidden opacity-90"
      aria-hidden="true"
    >
      {lines.map((line, index) => (
        <motion.span
          key={`${line.width}-${index}`}
          className="origin-bottom rounded-t-full bg-gradient-to-t from-[#56b8bf] to-transparent"
          style={{ width: line.width, opacity: line.opacity }}
          initial={{ height: `${line.height * 0.45}%` }}
          animate={{
            height: [
              `${line.height * 0.45}%`,
              `${line.height}%`,
              `${line.height * 0.62}%`,
              `${line.height * 0.9}%`,
              `${line.height * 0.45}%`,
            ],
          }}
          transition={{
            duration: 2.8 + index * 0.16,
            delay: index * 0.12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}