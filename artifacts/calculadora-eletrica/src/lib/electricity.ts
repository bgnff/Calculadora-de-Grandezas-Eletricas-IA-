export type CalculationType = 'voltage' | 'current' | 'resistance' | 'power';

export interface ColorBand {
  label: string;
  value: number;
  color: string;
  textColor: string;
}

const digitColors = [
  { label: 'Preto', color: '#1e2730', textColor: '#f7fafb' },
  { label: 'Marrom', color: '#875333', textColor: '#fff8f1' },
  { label: 'Vermelho', color: '#d84846', textColor: '#fff' },
  { label: 'Laranja', color: '#ec8a39', textColor: '#2f2318' },
  { label: 'Amarelo', color: '#e7c84b', textColor: '#30280b' },
  { label: 'Verde', color: '#4e9a68', textColor: '#fff' },
  { label: 'Azul', color: '#3d78b8', textColor: '#fff' },
  { label: 'Violeta', color: '#8066ae', textColor: '#fff' },
  { label: 'Cinza', color: '#8d9aa3', textColor: '#17232d' },
  { label: 'Branco', color: '#f0f3f2', textColor: '#17232d' },
];

const multiplierColors: Record<number, Omit<ColorBand, 'value'>> = {
  [-2]: { label: 'Prata', color: '#aeb7c2', textColor: '#17232d' },
  [-1]: { label: 'Dourado', color: '#c9a34b', textColor: '#2b2414' },
  0: digitColors[0],
  1: digitColors[1],
  2: digitColors[2],
  3: digitColors[3],
  4: digitColors[4],
  5: digitColors[5],
  6: digitColors[6],
  7: digitColors[7],
  8: digitColors[8],
  9: digitColors[9],
};

const multiplierNames: Record<number, string> = {
  [-2]: 'Centésimos',
  [-1]: 'Décimos',
  0: 'Unidades',
  1: 'Dezenas',
  2: 'Centenas',
  3: 'Milhares',
  4: 'Dezenas de milhar',
  5: 'Centenas de milhar',
  6: 'Milhões',
  7: 'Dezenas de milhões',
  8: 'Centenas de milhões',
  9: 'Bilhões',
};

export const calculationMeta: Record<
  CalculationType,
  { label: string; symbol: string; unit: string; formula: string; fields: { key: string; label: string; unit: string }[] }
> = {
  voltage: {
    label: 'Tensão',
    symbol: 'V',
    unit: 'V',
    formula: 'V = R × I',
    fields: [
      { key: 'resistance', label: 'Resistência', unit: 'Ω' },
      { key: 'current', label: 'Corrente', unit: 'A' },
    ],
  },
  current: {
    label: 'Corrente',
    symbol: 'I',
    unit: 'A',
    formula: 'I = V ÷ R',
    fields: [
      { key: 'voltage', label: 'Tensão', unit: 'V' },
      { key: 'resistance', label: 'Resistência', unit: 'Ω' },
    ],
  },
  resistance: {
    label: 'Resistência',
    symbol: 'R',
    unit: 'Ω',
    formula: 'R = V ÷ I',
    fields: [
      { key: 'voltage', label: 'Tensão', unit: 'V' },
      { key: 'current', label: 'Corrente', unit: 'A' },
    ],
  },
  power: {
    label: 'Potência',
    symbol: 'P',
    unit: 'W',
    formula: 'P = V × I',
    fields: [
      { key: 'voltage', label: 'Tensão', unit: 'V' },
      { key: 'current', label: 'Corrente', unit: 'A' },
    ],
  },
};

export function calculateVoltage(resistance: number, current: number): number {
  return resistance * current;
}

export function calculateCurrent(voltage: number, resistance: number): number {
  return voltage / resistance;
}

export function calculateResistance(voltage: number, current: number): number {
  return voltage / current;
}

export function calculatePower(voltage: number, current: number): number {
  return voltage * current;
}

export function resistanceToColorBands(resistance: number): {
  first: ColorBand;
  second: ColorBand;
  multiplier: ColorBand & { name: string; exponent: number };
  tolerance: ColorBand & { name: string };
} | null {
  // A standard four-band code has two significant digits, with multipliers
  // from silver (×0.01) through white (×1,000,000,000).
  if (!Number.isFinite(resistance) || resistance < 0.1 || resistance > 99_000_000_000) return null;
  const safeResistance = resistance;
  let exponent = Math.floor(Math.log10(safeResistance)) - 1;
  let significant = Math.round(safeResistance / Math.pow(10, exponent));

  if (significant >= 100) {
    significant = Math.round(significant / 10);
    exponent += 1;
  }

  const firstDigit = Math.min(9, Math.floor(significant / 10));
  const secondDigit = Math.min(9, significant % 10);
  const multiplierIndex = Math.max(-2, Math.min(9, exponent));
  const multiplierColor = multiplierColors[multiplierIndex] ?? multiplierColors[0];
  const tolerance = { label: 'Dourado', value: 5, color: '#c9a34b', textColor: '#2b2414', name: '±5%' };

  return {
    first: { ...digitColors[firstDigit], value: firstDigit },
    second: { ...digitColors[secondDigit], value: secondDigit },
    multiplier: {
      ...multiplierColor,
      value: multiplierIndex,
      name: multiplierNames[multiplierIndex] ?? 'Multiplicador',
      exponent: multiplierIndex,
    },
    tolerance,
  };
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const absoluteValue = Math.abs(value);
  if (absoluteValue > 0 && (absoluteValue < 0.000001 || absoluteValue >= 1_000_000_000_000)) {
    return value
      .toExponential(6)
      .replace('.', ',')
      .replace('e+', ' × 10^')
      .replace('e-', ' × 10^-');
  }
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 8,
    useGrouping: true,
  }).format(value);
}

export function parseInput(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!normalized || !/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}