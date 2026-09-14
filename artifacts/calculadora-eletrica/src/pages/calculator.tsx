import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, CheckCircle2, CircleHelp, Copy, Eraser, Lightbulb, RotateCcw, Save, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { ResistorVisual } from '@/components/resistor-visual';
import {
  calculateCurrent,
  calculatePower,
  calculateResistance,
  calculateVoltage,
  calculationMeta,
  formatNumber,
  parseInput,
  resistanceToColorBands,
  type CalculationType,
} from '@/lib/electricity';

type InputKey = 'voltage' | 'current' | 'resistance';
type InputValues = Record<InputKey, string>;
type FieldErrors = Partial<Record<InputKey, string>>;

export interface CalculationResult {
  value: number;
  type: CalculationType;
  bands?: ReturnType<typeof resistanceToColorBands>;
}

type FeedbackTone = 'success' | 'error' | 'info';
type Feedback = { tone: FeedbackTone; message: string };

const initialValues: InputValues = { voltage: '', current: '', resistance: '' };

export const CIRCUIT_PRESETS = [
  {
    label: 'LED em 5V (20mA)',
    type: 'resistance' as CalculationType,
    values: { voltage: '5', current: '0.02', resistance: '' },
    desc: 'Calcula resistor limitador (250 Ω)',
  },
  {
    label: 'Pull-up 10kΩ (3.3V)',
    type: 'current' as CalculationType,
    values: { voltage: '3.3', resistance: '10000', current: '' },
    desc: 'Corrente em lógica digital (330 µA)',
  },
  {
    label: 'Chuveiro 220V / 25A',
    type: 'power' as CalculationType,
    values: { voltage: '220', current: '25', resistance: '' },
    desc: 'Potência elétrica total (5500 W)',
  },
  {
    label: 'Resistor 1kΩ em 12V',
    type: 'current' as CalculationType,
    values: { voltage: '12', resistance: '1000', current: '' },
    desc: 'Corrente em circuito automotivo / 12V',
  },
  {
    label: 'Carga USB 5V / 2A',
    type: 'power' as CalculationType,
    values: { voltage: '5', current: '2', resistance: '' },
    desc: 'Potência de carregamento USB (10 W)',
  },
];

interface CalculatorPageProps {
  onSaveCalculation?: (record: {
    type: CalculationType;
    result: number;
    unit: string;
    formula: string;
    inputs: Record<string, string>;
  }) => void;
}

export default function CalculatorPage({ onSaveCalculation }: CalculatorPageProps) {
  const [type, setType] = useState<CalculationType>('resistance');
  const [values, setValues] = useState<InputValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const reducedMotion = Boolean(useReducedMotion());

  const meta = calculationMeta[type];
  const canShowResult = Boolean(result && Number.isFinite(result.value));

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const reset = (resetType = false) => {
    setValues(initialValues);
    setErrors({});
    setFormError('');
    setResult(null);
    setSaved(false);
    setCopied(false);
    setFeedback({ tone: 'info', message: 'Pronto para um novo cálculo.' });
    if (resetType) setType('resistance');
  };

  const handleTypeChange = (nextType: CalculationType) => {
    setType(nextType);
    setErrors({});
    setFormError('');
    setResult(null);
    setSaved(false);
    setCopied(false);
    setFeedback(null);
  };

  const handleInput = (key: InputKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFormError('');
    setResult(null);
    setSaved(false);
    setCopied(false);
  };

  const executeCalculation = (calcType: CalculationType, currentValues: InputValues) => {
    const currentMeta = calculationMeta[calcType];
    const nextErrors: FieldErrors = {};
    const parsed: Partial<Record<InputKey, number>> = {};

    currentMeta.fields.forEach((field) => {
      const key = field.key as InputKey;
      if (!currentValues[key]?.trim()) {
        nextErrors[key] = 'Informe um valor para continuar.';
        return;
      }
      const parsedValue = parseInput(currentValues[key]);
      if (parsedValue === null) {
        nextErrors[key] = 'Use um número não negativo, com ponto, vírgula ou notação científica.';
        return;
      }
      parsed[key] = parsedValue;
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setFormError('Revise os campos destacados antes de calcular.');
      setResult(null);
      setFeedback({ tone: 'error', message: 'Revise os campos destacados antes de calcular.' });
      return;
    }

    const voltage = parsed.voltage ?? 0;
    const current = parsed.current ?? 0;
    const resistance = parsed.resistance ?? 0;

    if (calcType === 'current' && resistance === 0) {
      nextErrors.resistance = 'A resistência precisa ser maior que zero.';
    }
    if (calcType === 'resistance' && current === 0) {
      nextErrors.current = 'A corrente precisa ser maior que zero.';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setFormError('Essa operação não pode ser dividida por zero.');
      setResult(null);
      setFeedback({ tone: 'error', message: 'Essa operação não pode ser dividida por zero.' });
      return;
    }

    const calculatedValue =
      calcType === 'voltage'
        ? calculateVoltage(resistance, current)
        : calcType === 'current'
          ? calculateCurrent(voltage, resistance)
          : calcType === 'resistance'
            ? calculateResistance(voltage, current)
            : calculatePower(voltage, current);

    if (!Number.isFinite(calculatedValue)) {
      setFormError('Não foi possível concluir com esses valores. Tente novamente.');
      setResult(null);
      setFeedback({ tone: 'error', message: 'Não foi possível concluir com esses valores.' });
      return;
    }

    setErrors({});
    setFormError('');
    setResult({
      value: calculatedValue,
      type: calcType,
      bands: calcType === 'resistance' && calculatedValue > 0 ? resistanceToColorBands(calculatedValue) : undefined,
    });
    setSaved(false);
    setCopied(false);
    setFeedback({ tone: 'success', message: 'Cálculo realizado com sucesso.' });
  };

  const calculate = () => {
    executeCalculation(type, values);
  };

  const applyPreset = (preset: typeof CIRCUIT_PRESETS[number]) => {
    setType(preset.type);
    setValues(preset.values);
    setErrors({});
    setFormError('');
    executeCalculation(preset.type, preset.values);
    toast.success(`Exemplo carregado: ${preset.label}`);
  };

  const copyResult = () => {
    if (!result || !Number.isFinite(result.value)) return;
    const formatted = `${formatNumber(result.value)} ${calculationMeta[result.type].unit}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    toast.success(`Copiado: ${formatted}`);
    setTimeout(() => setCopied(false), 2200);
  };

  const saveResult = () => {
    if (!result || !onSaveCalculation) return;
    onSaveCalculation({
      type: result.type,
      result: result.value,
      unit: calculationMeta[result.type].unit,
      formula: calculationMeta[result.type].formula,
      inputs: { ...values },
    });
    setSaved(true);
    setFeedback({ tone: 'success', message: 'Cálculo salvo no histórico.' });
    toast.success('Cálculo salvo no seu histórico!');
  };

  const contextualLine = useMemo(() => {
    const parts = meta.fields.map((field) => {
      const value = values[field.key as InputKey];
      return value ? `${value} ${field.unit}` : `— ${field.unit}`;
    });
    return parts.join('  ·  ');
  }, [meta.fields, values]);

  return (
    <div className="space-y-8">
       <motion.section initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.45 }} className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
             <span className="grid size-6 place-items-center rounded-md bg-[#e6f0ff]"><Zap size={13} fill="currentColor" /></span>
            Ferramenta de precisão
          </div>
           <h1 className="font-display text-[clamp(2.15rem,4vw,3.6rem)] font-normal leading-[0.98] tracking-[-0.055em] text-[hsl(var(--foreground))]">Calculadora elétrica</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-[hsl(var(--muted-foreground))]">Resolva grandezas elétricas e identifique o resistor correspondente em poucos segundos.</p>
        </div>
        <button onClick={() => reset(true)} className="focus-ring group inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-2.5 text-sm font-semibold text-[hsl(var(--foreground))] shadow-sm transition hover:border-[#9fc8c5] hover:text-[hsl(var(--primary))] md:self-end" data-testid="button-new-calculation">
          <RotateCcw size={16} className="transition-transform group-hover:-rotate-45" />
          Novo cálculo
        </button>
      </motion.section>

      <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
        <div className="h-px flex-1 bg-[hsl(var(--border))]" />
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#2cb7ae]" /> Fórmulas de Ohm</span>
        <div className="h-px max-w-10 flex-1 bg-[hsl(var(--border))]" />
      </div>

      <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(390px,1.05fr)]">
         <motion.form onSubmit={(event) => { event.preventDefault(); calculate(); }} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { delay: 0.08, duration: 0.45 }} className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-5 sm:p-7" data-testid="card-calculator-form" aria-label="Formulário de cálculo elétrico">
          {/* Exemplos Rápidos */}
          <div className="mb-6 rounded-xl border border-[#d7ebff] bg-[#f5f9ff] p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.13em] text-[#004eba]">
              <Sparkles size={14} className="text-[#1e6fff]" /> Exemplos de circuito prontos
            </div>
            <p className="mt-1 text-xs text-slate-600">Clique para carregar e calcular instantaneamente:</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {CIRCUIT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  title={preset.desc}
                  className="focus-ring inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#c9dcf2] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0b3558] shadow-xs transition hover:border-[#1e6fff] hover:bg-[#eaf2ff] hover:text-[#004eba] active:scale-[0.97]"
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">01 / Escolha a grandeza</p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.035em] text-[hsl(var(--foreground))]">O que você quer encontrar?</h2>
            </div>
                 <div className="hidden size-10 place-items-center rounded-xl bg-[#e6f0ff] text-[#006bff] sm:grid"><CircleHelp size={18} /></div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Grandeza a calcular">
            {(Object.keys(calculationMeta) as CalculationType[]).map((option) => {
              const optionMeta = calculationMeta[option];
              const selected = type === option;
              return (
                <button
                  key={option}
                   type="button"
                  onClick={() => handleTypeChange(option)}
                  role="radio"
                  aria-checked={selected}
                  aria-label={`Calcular ${optionMeta.label.toLowerCase()}`}
                  className={`cursor-pointer rounded-xl border px-2 py-3 text-center transition-all duration-200 ${selected ? 'border-[#006bff] bg-[#e6f0ff] text-[#004eba] shadow-xs ring-1 ring-[#006bff]' : 'border-[#d0dbe7] bg-[#fcfdfd] text-[#64748b] hover:border-[#9bbce0] hover:bg-[#f4f8ff]'}`}
                  data-testid={`button-select-${option}`}
                >
                  <span className="font-data block text-[17px] font-bold">{optionMeta.symbol}</span>
                  <span className="mt-1 block text-[11.5px] font-semibold">{optionMeta.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-7 rounded-xl bg-[#f5f8f8] px-4 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]">Fórmula aplicada</span>
              <span className="font-data text-sm font-medium text-[#277e81]" data-testid="text-active-formula">{meta.formula}</span>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">02 / Preencha os valores</p>
            {meta.fields.map((field) => {
              const key = field.key as InputKey;
              const hasError = Boolean(errors[key]);
              return (
                <label key={key} className="block" htmlFor={`input-${key}`}>
                  <span className="mb-2 flex items-center justify-between text-sm font-semibold text-[hsl(var(--foreground))]">
                    {field.label}
                    <span className="font-data text-xs font-normal text-[hsl(var(--muted-foreground))]">{field.unit}</span>
                  </span>
                  <div className={`flex h-12 items-center rounded-xl border bg-white transition-all duration-200 ${hasError ? 'border-[#df7774] focus-within:border-[#d85b58] focus-within:ring-2 focus-within:ring-[#df7774]/20' : 'border-[#d0dbe7] hover:border-[#9abde3] focus-within:border-[#006bff] focus-within:ring-2 focus-within:ring-[#006bff]/20 focus-within:shadow-xs'}`}>
                    <input
                      id={`input-${key}`}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={values[key]}
                      onChange={(event) => handleInput(key, event.target.value)}
                      placeholder="0,00"
                      aria-invalid={hasError}
                      aria-describedby={hasError ? `error-${key}` : undefined}
                      className="h-full min-w-0 flex-1 bg-transparent px-4 font-data text-base font-semibold text-[#0b1f3b] outline-none focus:outline-none focus:ring-0 placeholder:text-[#a0b0c0]"
                      data-testid={`input-${key}`}
                    />
                    <span className="font-data pr-4 text-xs font-bold text-[#64748b] select-none">{field.unit}</span>
                  </div>
                  {hasError && <span id={`error-${key}`} className="mt-1.5 block text-xs font-medium text-[#c44e4b]" data-testid={`error-${key}`}>{errors[key]}</span>}
                </label>
              );
            })}
          </div>

          {formError && <div className="mt-5 rounded-xl border border-[#f0c8c6] bg-[#fff6f5] px-4 py-3 text-sm font-medium text-[#b74d49]" role="alert" data-testid="alert-calculation">{formError}</div>}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[hsl(var(--border))] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => reset()} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]" data-testid="button-clear">
              <Eraser size={16} /> Limpar
            </button>
            <button type="submit" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#006bff] px-6 py-2.5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(0,107,255,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0054cc] active:translate-y-0" data-testid="button-calculate">
              Calcular <ArrowRight size={17} />
            </button>
          </div>
         </motion.form>

          <motion.div initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { delay: 0.16, duration: 0.45 }} className="min-h-[530px] rounded-2xl border border-[hsl(var(--card-border))] bg-white" data-testid="card-calculation-result" aria-live="polite">
           <div className="min-h-[530px] p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">03 / Resultado</p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.035em] text-[hsl(var(--foreground))]">Leitura calculada</h2>
            </div>
            {canShowResult && <span className="flex items-center gap-1.5 rounded-full bg-[#e6f7ef] px-2.5 py-1.5 text-[11px] font-bold text-[#298061]"><CheckCircle2 size={14} /> Pronto</span>}
          </div>

          {!result || !Number.isFinite(result.value) ? (
            <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
               <div className="relative mb-7 grid size-24 place-items-center rounded-2xl bg-[#eaf2ff] text-[#006bff]">
                 <div className="absolute inset-2 rounded-2xl border border-dashed border-[#9bbce0]" />
                <Zap size={34} strokeWidth={1.6} />
              </div>
              <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-[hsl(var(--foreground))]">Seu resultado aparece aqui</h3>
              <p className="mt-2 max-w-[280px] text-sm leading-6 text-[hsl(var(--muted-foreground))]">Escolha uma grandeza ou selecione um exemplo rápido para a Voltiva calcular.</p>
              <div className="mt-7 flex items-center gap-2 rounded-lg bg-[#f6f9f8] px-3 py-2 text-xs font-medium text-[hsl(var(--muted-foreground))]"><Lightbulb size={14} className="text-[#dc9d26]" /> Dica: use vírgula ou ponto decimal</div>
            </div>
          ) : (
            <motion.div initial={reducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.24 }} className="mt-7">
                 <div className="rounded-2xl bg-[#eaf2ff] px-5 py-6">
                 <p className="text-sm font-medium text-[#004eba]">Resultado de {calculationMeta[result.type].label.toLowerCase()}</p>
                <div className="mt-2 flex items-end gap-3">
                   <motion.strong key={`${result.type}-${result.value}`} initial={reducedMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.22 }} className="font-data text-[clamp(2.5rem,6vw,4.2rem)] font-medium leading-none tracking-[-0.08em] text-[#0b3558]" data-testid="text-result-value">{formatNumber(result.value)}</motion.strong>
                   <span className="mb-1.5 font-data text-lg font-medium text-[#476788]">{calculationMeta[result.type].unit}</span>
                </div>
                <p className="mt-4 border-t border-[#cde9e2] pt-3 font-data text-xs text-[#568b88]" data-testid="text-result-context">{calculationMeta[result.type].formula} <span className="mx-1.5 text-[#a7c9c4]">·</span> {contextualLine}</p>
              </div>

               {result.type === 'resistance' ? (
                 result.bands ? (
                   <div className="mt-6">
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Identificação visual</p>
                      <h3 className="mt-1 font-display text-lg font-semibold tracking-[-0.03em] text-[hsl(var(--foreground))]">Código de cores · 4 faixas</h3>
                    </div>
                    <span className="rounded-md bg-[#f5f7f6] px-2 py-1 font-data text-[10px] text-[hsl(var(--muted-foreground))]">±5%</span>
                  </div>
                  <ResistorVisual
                    bands={result.bands}
                    resistanceValue={result.value}
                    unit={calculationMeta[result.type].unit}
                  />
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { title: '1ª Faixa', band: result.bands.first, desc: `Dígito: ${result.bands.first.value}` },
                      { title: '2ª Faixa', band: result.bands.second, desc: `Dígito: ${result.bands.second.value}` },
                      {
                        title: 'Multiplicador',
                        band: result.bands.multiplier,
                        desc: result.bands.multiplier.name || `×10^${result.bands.multiplier.exponent}`,
                      },
                      { title: 'Tolerância', band: result.bands.tolerance, desc: '±5% de precisão' },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex min-w-0 flex-col items-center rounded-xl border border-[#dce8f3] bg-white p-2.5 text-center shadow-xs transition hover:border-[#1e6fff]/40"
                        data-testid={`text-band-${item.title.toLowerCase().replaceAll(' ', '-')}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="size-3.5 shrink-0 rounded-full border border-black/15 shadow-2xs"
                            style={{ backgroundColor: item.band.color }}
                            aria-hidden="true"
                          />
                          <span className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {item.title}
                          </span>
                        </div>
                        <span className="mt-1 block truncate text-xs font-bold text-[#0b1f3b]">
                          {item.band.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500">
                          {item.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                   </div>
                 ) : (
                   <div className="mt-6 rounded-xl border border-dashed border-[#e6c98c] bg-[#fffaf0] p-4 text-sm leading-6 text-[#8b650f]">
                     O valor foi calculado, mas está fora da faixa representável por um código padrão de 4 faixas (0,1 Ω a 99 GΩ).
                   </div>
                 )
              ) : (
               <div className="mt-6 rounded-xl border border-dashed border-[#c9dcf2] bg-[#f8fbff] p-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                  O código de cores fica disponível quando o resultado for uma resistência.
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={copyResult}
                  className="focus-ring inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#c9dcf2] bg-white px-4 py-3 text-sm font-semibold text-[#004eba] transition hover:border-[#006bff] hover:bg-[#f0f6ff] active:scale-[0.99]"
                  data-testid="button-copy-result"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  <span>{copied ? 'Copiado!' : 'Copiar valor'}</span>
                </button>

                {onSaveCalculation && (
                  <button
                    type="button"
                    onClick={saveResult}
                    disabled={saved}
                    className="focus-ring inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#b7d8d3] bg-[#f0fbf8] px-4 py-3 text-sm font-bold text-[#247772] transition hover:border-[#48aaa2] hover:bg-[#e4f7f2] active:scale-[0.99] disabled:cursor-default disabled:opacity-60"
                    data-testid="button-save-calculation"
                  >
                    <Save size={16} />
                    <span>{saved ? 'Salvo no histórico' : 'Salvar no histórico'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
           </div>
        </motion.div>
      </section>

      <section className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
         <div className="rounded-2xl border border-[#c9dcf2] bg-[#eaf2ff] p-5 sm:p-6">
          <div className="flex gap-4">
             <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#006bff]"><Lightbulb size={19} /></div>
            <div>
               <h3 className="font-display text-lg font-normal tracking-[-0.03em] text-[#0b3558]">Como a Voltiva pensa</h3>
               <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#476788]">Os valores são tratados como grandezas reais. Entradas vazias, caracteres inválidos e divisões por zero são interrompidos antes de qualquer resultado.</p>
            </div>
          </div>
        </div>
         <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Referência rápida</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-data text-sm text-[hsl(var(--foreground))]">
            <span>V = R × I</span><span>I = V ÷ R</span><span>R = V ÷ I</span><span>P = V × I</span>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
             className={`fixed bottom-5 right-5 z-40 flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
              feedback.tone === 'success'
                ? 'border-[#bfe4d2] bg-[#f0fbf5] text-[#287653]'
                : feedback.tone === 'error'
                  ? 'border-[#efc9c7] bg-[#fff7f6] text-[#b34d49]'
                  : 'border-[#cfe1e0] bg-white text-[#4f7070]'
            }`}
            role="status"
            data-testid="toast-feedback"
          >
            <span className={`size-2 rounded-full ${feedback.tone === 'success' ? 'bg-[#43aa78]' : feedback.tone === 'error' ? 'bg-[#dd6c67]' : 'bg-[#1e6fff]'}`} aria-hidden="true" />
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}