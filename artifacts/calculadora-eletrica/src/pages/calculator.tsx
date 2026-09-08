import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, CircleHelp, Eraser, Lightbulb, RotateCcw, Zap } from 'lucide-react';
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

interface CalculationResult {
  value: number;
  type: CalculationType;
  bands?: ReturnType<typeof resistanceToColorBands>;
}

type FeedbackTone = 'success' | 'error' | 'info';
type Feedback = { tone: FeedbackTone; message: string };

const initialValues: InputValues = { voltage: '', current: '', resistance: '' };

export default function CalculatorPage() {
  const [type, setType] = useState<CalculationType>('resistance');
  const [values, setValues] = useState<InputValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
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
    setFeedback({ tone: 'info', message: 'Pronto para um novo cálculo.' });
    if (resetType) setType('resistance');
  };

  const handleTypeChange = (nextType: CalculationType) => {
    setType(nextType);
    setErrors({});
    setFormError('');
    setResult(null);
    setFeedback(null);
  };

  const handleInput = (key: InputKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFormError('');
    setResult(null);
  };

  const calculate = () => {
    const nextErrors: FieldErrors = {};
    const parsed: Partial<Record<InputKey, number>> = {};

    meta.fields.forEach((field) => {
      const key = field.key as InputKey;
      if (!values[key].trim()) {
        nextErrors[key] = 'Informe um valor para continuar.';
        return;
      }
      const parsedValue = parseInput(values[key]);
      if (parsedValue === null) {
        nextErrors[key] = 'Use apenas números, com ponto ou vírgula decimal.';
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

    if (type === 'current' && resistance === 0) {
      nextErrors.resistance = 'A resistência precisa ser maior que zero.';
    }
    if (type === 'resistance' && current === 0) {
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
      type === 'voltage'
        ? calculateVoltage(resistance, current)
        : type === 'current'
          ? calculateCurrent(voltage, resistance)
          : type === 'resistance'
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
      type,
      bands: type === 'resistance' && calculatedValue > 0 ? resistanceToColorBands(calculatedValue) : undefined,
    });
    setFeedback({ tone: 'success', message: 'Cálculo realizado com sucesso.' });
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
            <span className="grid size-6 place-items-center rounded-md bg-[#d8eff0]"><Zap size={13} fill="currentColor" /></span>
            Ferramenta de precisão
          </div>
          <h1 className="font-display text-[clamp(2rem,4vw,3.35rem)] font-semibold leading-[1.05] tracking-[-0.055em] text-[hsl(var(--foreground))]">Calculadora elétrica</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-[hsl(var(--muted-foreground))]">Resolva grandezas elétricas e identifique o resistor correspondente em poucos segundos.</p>
        </div>
        <button onClick={() => reset(true)} className="focus-ring group inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-2.5 text-sm font-semibold text-[hsl(var(--foreground))] shadow-sm transition hover:border-[#9fc8c5] hover:text-[hsl(var(--primary))] md:self-end" data-testid="button-new-calculation">
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
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { delay: 0.08, duration: 0.45 }} className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-5 sm:p-7" data-testid="card-calculator-form">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">01 / Escolha a grandeza</p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.035em] text-[hsl(var(--foreground))]">O que você quer encontrar?</h2>
            </div>
            <div className="hidden size-10 place-items-center rounded-xl bg-[#edf8f6] text-[#299b8d] sm:grid"><CircleHelp size={18} /></div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Grandeza a calcular">
            {(Object.keys(calculationMeta) as CalculationType[]).map((option) => {
              const optionMeta = calculationMeta[option];
              const selected = type === option;
              return (
                <button
                  key={option}
                  onClick={() => handleTypeChange(option)}
                  role="radio"
                  aria-checked={selected}
                  className={`focus-ring rounded-xl border px-2 py-3 text-center transition ${selected ? 'border-[#42bdb5] bg-[#e9f8f5] text-[#18786e] shadow-[inset_0_0_0_1px_#42bdb5]' : 'border-[hsl(var(--border))] bg-[#fcfdfd] text-[hsl(var(--muted-foreground))] hover:border-[#afd5d1] hover:bg-[#f6fbfa]'}`}
                  data-testid={`button-select-${option}`}
                >
                  <span className="font-data block text-[17px] font-medium">{optionMeta.symbol}</span>
                  <span className="mt-1 block text-[11px] font-semibold">{optionMeta.label}</span>
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
                  <div className={`flex h-12 items-center rounded-xl border bg-white transition focus-within:ring-4 ${hasError ? 'border-[#df7774] focus-within:border-[#d85b58] focus-within:ring-[#e36c691c]' : 'border-[hsl(var(--input))] focus-within:border-[#39aaa6] focus-within:ring-[#39aaa61f]'}`}>
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
                      className="focus-ring h-full min-w-0 flex-1 rounded-xl bg-transparent px-4 text-base font-semibold text-[hsl(var(--foreground))] outline-none placeholder:text-[#bdc8c9]"
                      data-testid={`input-${key}`}
                    />
                    <span className="pr-4 font-data text-xs text-[hsl(var(--muted-foreground))]">{field.unit}</span>
                  </div>
                  {hasError && <span id={`error-${key}`} className="mt-1.5 block text-xs font-medium text-[#c44e4b]" data-testid={`error-${key}`}>{errors[key]}</span>}
                </label>
              );
            })}
          </div>

          {formError && <div className="mt-5 rounded-xl border border-[#f0c8c6] bg-[#fff6f5] px-4 py-3 text-sm font-medium text-[#b74d49]" role="alert" data-testid="alert-calculation">{formError}</div>}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[hsl(var(--border))] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button onClick={() => reset()} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]" data-testid="button-clear">
              <Eraser size={16} /> Limpar
            </button>
            <button onClick={calculate} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_18px_hsl(var(--primary)/.18)] transition hover:-translate-y-0.5 hover:bg-[#126d91] active:translate-y-0" data-testid="button-calculate">
              Calcular <ArrowRight size={17} />
            </button>
          </div>
        </motion.div>

        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { delay: 0.16, duration: 0.45 }} className="soft-shadow min-h-[530px] rounded-2xl border border-[hsl(var(--card-border))] bg-white p-5 sm:p-7" data-testid="card-calculation-result">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">03 / Resultado</p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.035em] text-[hsl(var(--foreground))]">Leitura calculada</h2>
            </div>
            {canShowResult && <span className="flex items-center gap-1.5 rounded-full bg-[#e6f7ef] px-2.5 py-1.5 text-[11px] font-bold text-[#298061]"><CheckCircle2 size={14} /> Pronto</span>}
          </div>

          {!result || !Number.isFinite(result.value) ? (
            <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
              <div className="relative mb-7 grid size-24 place-items-center rounded-[28px] bg-[#eef7f5] text-[#39a9a2]">
                <div className="absolute inset-2 rounded-[21px] border border-dashed border-[#9bd2cd]" />
                <Zap size={34} strokeWidth={1.6} />
              </div>
              <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-[hsl(var(--foreground))]">Seu resultado aparece aqui</h3>
              <p className="mt-2 max-w-[280px] text-sm leading-6 text-[hsl(var(--muted-foreground))]">Escolha uma grandeza, preencha os campos e deixe a Voltiva fazer a conta.</p>
              <div className="mt-7 flex items-center gap-2 rounded-lg bg-[#f6f9f8] px-3 py-2 text-xs font-medium text-[hsl(var(--muted-foreground))]"><Lightbulb size={14} className="text-[#dc9d26]" /> Dica: use vírgula ou ponto decimal</div>
            </div>
          ) : (
            <motion.div initial={reducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.24 }} className="mt-7">
              <div className="rounded-2xl bg-[#edf8f5] px-5 py-6">
                <p className="text-sm font-medium text-[#347d78]">Resultado de {calculationMeta[result.type].label.toLowerCase()}</p>
                <div className="mt-2 flex items-end gap-3">
                  <motion.strong key={`${result.type}-${result.value}`} initial={reducedMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.22 }} className="font-data text-[clamp(2.5rem,6vw,4.2rem)] font-medium leading-none tracking-[-0.08em] text-[#156e70]" data-testid="text-result-value">{formatNumber(result.value)}</motion.strong>
                  <span className="mb-1.5 font-data text-lg font-medium text-[#4c8d8a]">{calculationMeta[result.type].unit}</span>
                </div>
                <p className="mt-4 border-t border-[#cde9e2] pt-3 font-data text-xs text-[#568b88]" data-testid="text-result-context">{calculationMeta[result.type].formula} <span className="mx-1.5 text-[#a7c9c4]">·</span> {contextualLine}</p>
              </div>

              {result.type === 'resistance' && result.bands ? (
                <div className="mt-6">
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Identificação visual</p>
                      <h3 className="mt-1 font-display text-lg font-semibold tracking-[-0.03em] text-[hsl(var(--foreground))]">Código de cores · 4 faixas</h3>
                    </div>
                    <span className="rounded-md bg-[#f5f7f6] px-2 py-1 font-data text-[10px] text-[hsl(var(--muted-foreground))]">±5%</span>
                  </div>
                  <ResistorVisual bands={result.bands} />
                  <div className="mt-4 grid grid-cols-4 gap-1.5">
                    {[
                      { title: '1ª', value: result.bands.first },
                      { title: '2ª', value: result.bands.second },
                      { title: 'Mult.', value: result.bands.multiplier },
                      { title: 'Tol.', value: result.bands.tolerance },
                    ].map((band) => (
                      <div key={band.title} className="min-w-0 rounded-lg bg-[#f7f9f8] px-1.5 py-2 text-center" data-testid={`text-band-${band.title.toLowerCase()}`}>
                        <span className="block text-[10px] font-bold text-[hsl(var(--muted-foreground))]">{band.title}</span>
                        <span className="mt-1 block truncate text-[11px] font-semibold text-[hsl(var(--foreground))]">{String('name' in band.value ? band.value.name : band.value.label)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-[#c7d9d7] bg-[#fbfdfc] p-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                  O código de cores fica disponível quando o resultado for uma resistência.
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </section>

      <section className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-[#cfe0de] bg-[#eaf5f3] p-5 sm:p-6">
          <div className="flex gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#2c9d91] shadow-sm"><Lightbulb size={19} /></div>
            <div>
              <h3 className="font-display text-lg font-semibold tracking-[-0.03em] text-[#226c6b]">Como a Voltiva pensa</h3>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#4d7f7c]">Os valores são tratados como grandezas reais. Entradas vazias, caracteres inválidos e divisões por zero são interrompidos antes de qualquer resultado.</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/75 p-5 sm:p-6">
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
            className={`fixed bottom-5 right-5 z-40 flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-[0_16px_36px_hsl(215_41%_17%/.14)] ${
              feedback.tone === 'success'
                ? 'border-[#bfe4d2] bg-[#f0fbf5] text-[#287653]'
                : feedback.tone === 'error'
                  ? 'border-[#efc9c7] bg-[#fff7f6] text-[#b34d49]'
                  : 'border-[#cfe1e0] bg-white text-[#4f7070]'
            }`}
            role="status"
            data-testid="toast-feedback"
          >
            <span className={`size-2 rounded-full ${feedback.tone === 'success' ? 'bg-[#43aa78]' : feedback.tone === 'error' ? 'bg-[#dd6c67]' : 'bg-[#39a9a2]'}`} aria-hidden="true" />
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}