import { useState, useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ColorBand } from '@/lib/electricity';
import { Sparkles, Info } from 'lucide-react';

interface ResistorVisualProps {
  bands?: {
    first: ColorBand;
    second: ColorBand;
    multiplier: ColorBand & { name?: string; exponent?: number };
    tolerance: ColorBand & { name?: string };
  };
  resistanceValue?: number;
  unit?: string;
  className?: string;
}

type ResistorBodyType = 'metal-film' | 'carbon-film';

interface BandDescriptor {
  index: number;
  title: string;
  role: string;
  x: number;
  width: number;
  band?: ColorBand & { name?: string };
}

const BODY_PATH =
  'M 140 105 C 140 72, 160 48, 186 48 L 214 48 C 230 48, 240 66, 255 66 L 345 66 C 360 66, 370 48, 386 48 L 414 48 C 440 48, 460 72, 460 105 C 460 138, 440 162, 414 162 L 386 162 C 370 162, 360 144, 345 144 L 255 144 C 240 144, 230 162, 214 162 L 186 162 C 160 162, 140 138, 140 105 Z';

export function ResistorVisual({ bands, resistanceValue, unit = 'Ω', className = '' }: ResistorVisualProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const [bodyType, setBodyType] = useState<ResistorBodyType>('metal-film');
  const [hoveredBand, setHoveredBand] = useState<number | null>(null);
  const idPrefix = useId().replace(/:/g, '_');

  const bandDescriptors: BandDescriptor[] = [
    {
      index: 0,
      title: '1ª Faixa',
      role: '1º Dígito',
      x: 190,
      width: 20,
      band: bands?.first,
    },
    {
      index: 1,
      title: '2ª Faixa',
      role: '2º Dígito',
      x: 226,
      width: 18,
      band: bands?.second,
    },
    {
      index: 2,
      title: 'Multiplicador',
      role: 'Potência de 10',
      x: 284,
      width: 18,
      band: bands?.multiplier,
    },
    {
      index: 3,
      title: 'Tolerância',
      role: 'Margem de erro',
      x: 390,
      width: 20,
      band: bands?.tolerance,
    },
  ];

  const colors = bands
    ? [bands.first.color, bands.second.color, bands.multiplier.color, bands.tolerance.color]
    : [];
  const key = colors.join('-');

  const activeHover = hoveredBand !== null ? bandDescriptors[hoveredBand] : null;

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#d6e5f3] bg-gradient-to-b from-[#f8fbfe] via-[#f1f6fc] to-[#e8f1fb] p-5 shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_8px_24px_rgba(11,31,59,0.06)] ${className}`}
      data-testid="visual-resistor"
    >
      {/* Barra superior de controle de estilo e status */}
      <div className="flex w-full items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[#0b3558]">
          <Sparkles size={14} className="text-[#1e6fff]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d5a80]">
            Resistor Axial 3D
          </span>
          {resistanceValue !== undefined && Number.isFinite(resistanceValue) && (
            <span className="rounded-full bg-[#1e6fff]/10 px-2.5 py-0.5 font-data text-[11px] font-bold text-[#004eba]">
              {resistanceValue >= 1000000
                ? `${(resistanceValue / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} M${unit}`
                : resistanceValue >= 1000
                  ? `${(resistanceValue / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} k${unit}`
                  : `${resistanceValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${unit}`}
            </span>
          )}
        </div>

        {/* Alternador de corpo de resistor */}
        <div className="flex items-center gap-1 rounded-lg border border-[#cbe0f5] bg-white/90 p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setBodyType('metal-film')}
            className={`flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition ${
              bodyType === 'metal-film'
                ? 'bg-[#1e6fff] text-white shadow-xs'
                : 'text-[#5b6f84] hover:bg-[#edf5fd] hover:text-[#0b1f3b]'
            }`}
            title="Filme Metálico (Azul alta precisão)"
          >
            <span className="size-2 rounded-full bg-[#52a5dc]" />
            <span>Azul (Metal)</span>
          </button>
          <button
            type="button"
            onClick={() => setBodyType('carbon-film')}
            className={`flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition ${
              bodyType === 'carbon-film'
                ? 'bg-[#8c6b3e] text-white shadow-xs'
                : 'text-[#5b6f84] hover:bg-[#edf5fd] hover:text-[#0b1f3b]'
            }`}
            title="Filme de Carbono (Bege padrão)"
          >
            <span className="size-2 rounded-full bg-[#d8c5a4]" />
            <span>Bege (Carbono)</span>
          </button>
        </div>
      </div>

      {/* SVG Principal do Resistor com iluminação 3D e faixas */}
      <div className="relative my-2 w-full max-w-[560px]">
        <svg
          viewBox="0 0 600 210"
          className="h-auto w-full drop-shadow-xs"
          role="img"
          aria-label="Resistor elétrico axial realista de quatro faixas de cores"
        >
          <defs>
            {/* Sombra de bancada abaixo do resistor */}
            <radialGradient id={`${idPrefix}_floor_shadow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0b1f3b" stopOpacity="0.26" />
              <stop offset="60%" stopColor="#0b1f3b" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#0b1f3b" stopOpacity="0" />
            </radialGradient>

            {/* Gradiente cilíndrico metálico dos terminais de fio de estanho/cobre */}
            <linearGradient id={`${idPrefix}_wire_metal`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#647487" />
              <stop offset="18%" stopColor="#c5d3df" />
              <stop offset="35%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#e3edf5" />
              <stop offset="78%" stopColor="#8d9ea9" />
              <stop offset="100%" stopColor="#485664" />
            </linearGradient>

            {/* Gradiente do Corpo — Filme Metálico (Azul Cyan clássico) */}
            <linearGradient id={`${idPrefix}_metal_film`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1b5987" />
              <stop offset="12%" stopColor="#3d97d9" />
              <stop offset="24%" stopColor="#a5e0ff" />
              <stop offset="38%" stopColor="#52a5dc" />
              <stop offset="70%" stopColor="#1e6b9c" />
              <stop offset="88%" stopColor="#12486d" />
              <stop offset="100%" stopColor="#092f49" />
            </linearGradient>

            {/* Gradiente do Corpo — Filme de Carbono (Bege/Ocre clássico) */}
            <linearGradient id={`${idPrefix}_carbon_film`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7a674e" />
              <stop offset="12%" stopColor="#c7b69c" />
              <stop offset="24%" stopColor="#fff8ed" />
              <stop offset="38%" stopColor="#decbb1" />
              <stop offset="70%" stopColor="#9e8969" />
              <stop offset="88%" stopColor="#6b583e" />
              <stop offset="100%" stopColor="#443521" />
            </linearGradient>

            {/* Brilho especular cilíndrico sobre as faixas de tinta brilhante */}
            <linearGradient id={`${idPrefix}_cylinder_shine`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
              <stop offset="8%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="22%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="36%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#000000" stopOpacity="0" />
              <stop offset="82%" stopColor="#000000" stopOpacity="0.3" />
              <stop offset="96%" stopColor="#000000" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
            </linearGradient>

            {/* Shader metálico de Ouro (Tolerância 5%) */}
            <linearGradient id={`${idPrefix}_gold_band`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6e4d0c" />
              <stop offset="12%" stopColor="#c89d38" />
              <stop offset="24%" stopColor="#fff8be" />
              <stop offset="40%" stopColor="#e5ba48" />
              <stop offset="72%" stopColor="#a37617" />
              <stop offset="100%" stopColor="#4d3505" />
            </linearGradient>

            {/* Shader metálico de Prata (Tolerância 10%) */}
            <linearGradient id={`${idPrefix}_silver_band`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#54606e" />
              <stop offset="12%" stopColor="#a8b5c2" />
              <stop offset="24%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#c8d3dd" />
              <stop offset="72%" stopColor="#788694" />
              <stop offset="100%" stopColor="#3b444d" />
            </linearGradient>

            {/* Gradiente de Metal Cromado para Terminais e Tampas Laterais */}
            <linearGradient id={`${idPrefix}_ferrule_metal`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3d4957" />
              <stop offset="12%" stopColor="#8e9eaf" />
              <stop offset="24%" stopColor="#ffffff" />
              <stop offset="38%" stopColor="#dbe4ed" />
              <stop offset="70%" stopColor="#758596" />
              <stop offset="88%" stopColor="#434e5a" />
              <stop offset="100%" stopColor="#232b33" />
            </linearGradient>

            {/* Máscara com o formato exato do corpo do resistor com extremidades bulbosas */}
            <clipPath id={`${idPrefix}_resistor_body_clip`}>
              <path d={BODY_PATH} />
            </clipPath>
          </defs>

          {/* Sombra de chão na bancada sob os terminais e corpo */}
          <ellipse cx="300" cy="186" rx="170" ry="11" fill={`url(#${idPrefix}_floor_shadow)`} />
          <ellipse cx="300" cy="186" rx="130" ry="7" fill="#0b1f3b" fillOpacity="0.14" />
          {/* Sombras projetadas das linhas metálicas laterais */}
          <rect x="15" y="183" width="135" height="4" rx="2" fill="#0b1f3b" fillOpacity="0.10" />
          <rect x="450" y="183" width="135" height="4" rx="2" fill="#0b1f3b" fillOpacity="0.10" />

          {/* Terminais Metálicos Laterais (Linhas laterais de metal realista) */}
          <g id="resistor-leads">
            {/* Sombra profunda do fio esquerdo */}
            <line x1="12" y1="106.5" x2="148" y2="106.5" stroke="#0b1f3b" strokeOpacity="0.25" strokeWidth="10" strokeLinecap="round" />
            {/* Corpo metálico do fio esquerdo */}
            <line
              x1="12"
              y1="105"
              x2="148"
              y2="105"
              stroke={`url(#${idPrefix}_wire_metal)`}
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Linha de brilho especular cromado no topo do fio esquerdo */}
            <line x1="16" y1="103" x2="144" y2="103" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="2.2" strokeLinecap="round" />
            {/* Linha de reflexo escuro na base do fio esquerdo */}
            <line x1="16" y1="107" x2="144" y2="107" stroke="#1f2832" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />

            {/* Sombra profunda do fio direito */}
            <line x1="452" y1="106.5" x2="588" y2="106.5" stroke="#0b1f3b" strokeOpacity="0.25" strokeWidth="10" strokeLinecap="round" />
            {/* Corpo metálico do fio direito */}
            <line
              x1="452"
              y1="105"
              x2="588"
              y2="105"
              stroke={`url(#${idPrefix}_wire_metal)`}
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Linha de brilho especular cromado no topo do fio direito */}
            <line x1="456" y1="103" x2="584" y2="103" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="2.2" strokeLinecap="round" />
            {/* Linha de reflexo escuro na base do fio direito */}
            <line x1="456" y1="107" x2="584" y2="107" stroke="#1f2832" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />

            {/* Tampas metálicas de solda/crimpagem onde o fio entra no resistor */}
            <ellipse cx="142" cy="105" rx="5" ry="9" fill={`url(#${idPrefix}_ferrule_metal)`} stroke="#2e3843" strokeWidth="0.8" />
            <ellipse cx="140" cy="104" rx="2" ry="6" fill="#ffffff" fillOpacity="0.75" />

            <ellipse cx="458" cy="105" rx="5" ry="9" fill={`url(#${idPrefix}_ferrule_metal)`} stroke="#2e3843" strokeWidth="0.8" />
            <ellipse cx="460" cy="104" rx="2" ry="6" fill="#ffffff" fillOpacity="0.75" />
          </g>

          {/* Corpo do Resistor (Dumbbell Profile) com recorte suave */}
          <g clipPath={`url(#${idPrefix}_resistor_body_clip)`}>
            {/* Base Cerâmica 3D com iluminação cilíndrica */}
            <path
              d={BODY_PATH}
              fill={bodyType === 'metal-film' ? `url(#${idPrefix}_metal_film)` : `url(#${idPrefix}_carbon_film)`}
            />

            {/* Capas Metálicas Laterais do Resistor (End Caps dos dois lados do corpo) */}
            <g id="body-metallic-caps">
              {/* Capa metálica lateral esquerda */}
              <rect x="138" y="40" width="26" height="130" fill={`url(#${idPrefix}_ferrule_metal)`} />
              <line x1="164" y1="48" x2="164" y2="162" stroke="#1a2530" strokeOpacity="0.4" strokeWidth="1.5" />

              {/* Capa metálica lateral direita */}
              <rect x="436" y="40" width="26" height="130" fill={`url(#${idPrefix}_ferrule_metal)`} />
              <line x1="436" y1="48" x2="436" y2="162" stroke="#1a2530" strokeOpacity="0.4" strokeWidth="1.5" />
            </g>

            {/* Faixas de cores ou modo standby (vazio) */}
            {bands ? (
              <motion.g
                key={key}
                initial={reducedMotion ? false : { opacity: 0.5, scaleX: 0.95 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: '300px 105px' }}
              >
                {bandDescriptors.map((b) => {
                  if (!b.band) return null;
                  const isGold = b.band.label === 'Dourado' || b.band.color.toLowerCase().includes('c9a34b');
                  const isSilver = b.band.label === 'Prata' || b.band.color.toLowerCase().includes('aeb7c2');
                  const fillSource = isGold
                    ? `url(#${idPrefix}_gold_band)`
                    : isSilver
                      ? `url(#${idPrefix}_silver_band)`
                      : b.band.color;

                  const isHovered = hoveredBand === b.index;

                  return (
                    <g
                      key={`${b.index}-${b.band.color}`}
                      className="cursor-pointer transition-opacity"
                      onMouseEnter={() => setHoveredBand(b.index)}
                      onMouseLeave={() => setHoveredBand(null)}
                    >
                      {/* Faixa colorida com pintura fosca/brilhante */}
                      <rect
                        x={b.x}
                        y="40"
                        width={b.width}
                        height="130"
                        fill={fillSource}
                      />
                      {/* Realce no hover */}
                      {isHovered && (
                        <rect
                          x={b.x}
                          y="40"
                          width={b.width}
                          height="130"
                          fill="#ffffff"
                          fillOpacity="0.25"
                        />
                      )}
                    </g>
                  );
                })}
              </motion.g>
            ) : (
              /* Guia pontilhada em modo de espera */
              <g opacity="0.35">
                {[190, 226, 284, 390].map((x, i) => (
                  <rect
                    key={x}
                    x={x}
                    y="40"
                    width={i === 0 || i === 3 ? 20 : 18}
                    height="130"
                    fill="#ffffff"
                    fillOpacity="0.2"
                    stroke="#ffffff"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                ))}
              </g>
            )}

            {/* Película de Brilho Especular Cilíndrico que une as faixas ao volume 3D */}
            <rect
              x="135"
              y="40"
              width="330"
              height="130"
              fill={`url(#${idPrefix}_cylinder_shine)`}
              style={{ pointerEvents: 'none' }}
            />

            {/* Linha de reflexo especular fino no terço superior */}
            <path
              d="M 162 62 Q 300 74 438 62"
              stroke="#ffffff"
              strokeOpacity="0.45"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              style={{ pointerEvents: 'none' }}
            />

            {/* Glints radiais de luz nas cúpulas das extremidades */}
            <ellipse cx="178" cy="85" rx="14" ry="24" fill="#ffffff" fillOpacity="0.16" style={{ pointerEvents: 'none' }} />
            <ellipse cx="422" cy="85" rx="14" ry="24" fill="#ffffff" fillOpacity="0.16" style={{ pointerEvents: 'none' }} />
          </g>

          {/* Anéis de realce externo se a faixa estiver em hover */}
          {hoveredBand !== null && bands && (
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={bandDescriptors[hoveredBand].x - 1}
                y="46"
                width={bandDescriptors[hoveredBand].width + 2}
                height="118"
                rx="2"
                fill="none"
                stroke="#1e6fff"
                strokeWidth="2"
                strokeOpacity="0.8"
              />
            </g>
          )}

          {/* Mensagem central se não houver cálculo de faixas ativo */}
          {!bands && (
            <text
              x="300"
              y="110"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="700"
              letterSpacing="0.04em"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}
            >
              Código de 4 faixas aparecerá aqui
            </text>
          )}
        </svg>
      </div>

      {/* Tooltip interativo ou legenda informativa da faixa selecionada */}
      <div className="mt-1 flex min-h-[32px] items-center justify-center">
        {activeHover && activeHover.band ? (
          <div className="flex animate-fade-in items-center gap-2 rounded-full border border-[#bfe0fb] bg-white px-3.5 py-1 text-xs font-semibold text-[#0b3558] shadow-xs">
            <span
              className="size-3 shrink-0 rounded-full border border-black/10 shadow-2xs"
              style={{ backgroundColor: activeHover.band.color }}
            />
            <span className="font-bold text-[#1e6fff]">{activeHover.title} ({activeHover.role}):</span>
            <span className="text-slate-700">
              {activeHover.band.label}
              {activeHover.band.name ? ` · ${activeHover.band.name}` : ''}
              {'value' in activeHover.band ? ` (Valor: ${activeHover.band.value})` : ''}
            </span>
          </div>
        ) : bands ? (
          <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
            <Info size={13} className="text-[#8ba8c9]" />
            <span>Passe o mouse ou toque sobre as faixas para inspecionar cada valor</span>
          </div>
        ) : (
          <div className="text-[11px] text-[#64748b]">
            Insira os valores de Tensão e Corrente para gerar a resistência e o código de cores.
          </div>
        )}
      </div>
    </div>
  );
}