import { motion } from 'framer-motion';
import type { ColorBand } from '@/lib/electricity';

interface ResistorVisualProps {
  bands?: {
    first: ColorBand;
    second: ColorBand;
    multiplier: ColorBand;
    tolerance: ColorBand;
  };
}

export function ResistorVisual({ bands }: ResistorVisualProps) {
  const colors = bands ? [bands.first.color, bands.second.color, bands.multiplier.color, bands.tolerance.color] : [];
  const key = colors.join('-');

  return (
    <div className="relative flex min-h-[192px] items-center justify-center overflow-hidden rounded-2xl bg-[#edf4f4] px-4" data-testid="visual-resistor">
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(#b5cecf 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
      <svg viewBox="0 0 520 190" className="relative z-10 w-full max-w-[450px]" role="img" aria-label="Visual do resistor de quatro faixas">
        <defs>
          <linearGradient id="ceramic" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#f8f4e9" />
            <stop offset="0.48" stopColor="#e5ddca" />
            <stop offset="1" stopColor="#c8bda8" />
          </linearGradient>
          <linearGradient id="wire" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#bcc6c7" />
            <stop offset="0.5" stopColor="#7e8f91" />
            <stop offset="1" stopColor="#c7d0d0" />
          </linearGradient>
        </defs>
        <path d="M18 95 H132 M388 95 H502" stroke="url(#wire)" strokeWidth="8" strokeLinecap="round" />
        <path d="M132 69 C132 48 151 35 174 35 H346 C369 35 388 48 388 69 V121 C388 142 369 155 346 155 H174 C151 155 132 142 132 121 Z" fill="url(#ceramic)" stroke="#b8ae9a" strokeWidth="2" />
        <path d="M148 69 H372 M148 121 H372" stroke="#fff8" strokeWidth="3" />
        <motion.g
          key={key}
          initial={{ opacity: 0.4, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: '260px 95px' }}
        >
          {[174, 218, 262, 342].map((x, index) => (
            <rect
              key={`${x}-${colors[index] ?? 'empty'}`}
              x={x}
              y="35"
              width={index === 3 ? 18 : 28}
              height="120"
              rx="2"
              fill={colors[index] ?? '#d2d9d7'}
              stroke="rgba(38,55,57,.13)"
              strokeWidth="1"
            />
          ))}
        </motion.g>
        {!bands && <text x="260" y="101" textAnchor="middle" fill="#6f8586" fontSize="14" fontWeight="600">as faixas aparecerão aqui</text>}
      </svg>
    </div>
  );
}