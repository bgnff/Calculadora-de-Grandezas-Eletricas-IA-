import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleDollarSign,
  Gauge,
  House,
  Leaf,
  PencilLine,
  ShieldCheck,
  Sparkles,
  Target,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useState, type ComponentType, type ReactNode } from 'react';
import type {
  EnergyGoal,
  EnergyInterest,
  EnergyProfileDraft,
  KnowledgeLevel,
} from '@/hooks/use-energy-profile';

interface ProfileOnboardingProps {
  draft: EnergyProfileDraft;
  editing: boolean;
  onDraftChange: (patch: Partial<EnergyProfileDraft>) => void;
  onComplete: (draft: EnergyProfileDraft) => void;
  onCancel: () => void;
  onSkip: () => void;
}

type Icon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

const goals: { id: EnergyGoal; title: string; description: string; icon: Icon }[] = [
  { id: 'learn', title: 'Aprender os fundamentos', description: 'Entender grandezas e fórmulas elétricas.', icon: BookOpen },
  { id: 'save', title: 'Encontrar oportunidades', description: 'Olhar para consumo e economia com clareza.', icon: CircleDollarSign },
  { id: 'plan', title: 'Planejar um projeto', description: 'Organizar decisões antes de colocar a mão na massa.', icon: Target },
  { id: 'diagnose', title: 'Investigar um problema', description: 'Chegar a uma leitura técnica mais objetiva.', icon: Wrench },
];

const interests: { id: EnergyInterest; title: string; icon: Icon }[] = [
  { id: 'fundamentals', title: 'Fundamentos elétricos', icon: Zap },
  { id: 'consumption', title: 'Consumo e medição', icon: Gauge },
  { id: 'savings', title: 'Economia de energia', icon: Leaf },
  { id: 'safety', title: 'Segurança e boas práticas', icon: ShieldCheck },
];

const knowledgeLevels: { id: KnowledgeLevel; title: string; description: string }[] = [
  { id: 'beginner', title: 'Estou começando', description: 'Quero uma introdução sem pressupor conhecimento técnico.' },
  { id: 'familiar', title: 'Já conheço o básico', description: 'Reconheço alguns conceitos e quero ganhar confiança.' },
  { id: 'advanced', title: 'Tenho prática', description: 'Já trabalho com os conceitos e busco agilidade.' },
];

const stepLabels = ['Objetivo', 'Interesses', 'Conhecimento'];

export function ProfileOnboarding({
  draft,
  editing,
  onDraftChange,
  onComplete,
  onCancel,
  onSkip,
}: ProfileOnboardingProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const [direction, setDirection] = useState(1);
  const [message, setMessage] = useState('');
  const step = Math.min(Math.max(draft.step, 0), 2);

  const goToStep = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    onDraftChange({ step: nextStep });
    setMessage('');
  };

  const canContinue =
    (step === 0 && Boolean(draft.goal)) ||
    (step === 1 && draft.interests.length > 0) ||
    (step === 2 && Boolean(draft.knowledge));

  const handleContinue = () => {
    if (!canContinue) {
      setMessage(
        step === 0
          ? 'Escolha um objetivo para continuar.'
          : step === 1
            ? 'Selecione ao menos um interesse para continuar.'
            : 'Escolha seu nível de conhecimento para continuar.',
      );
      return;
    }
    if (step < 2) goToStep(step + 1);
    else onComplete(draft);
  };

  const toggleInterest = (id: EnergyInterest) => {
    const nextInterests = draft.interests.includes(id)
      ? draft.interests.filter((interest) => interest !== id)
      : [...draft.interests, id];
    onDraftChange({ interests: nextInterests });
    setMessage('');
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[hsl(var(--background))]" data-testid="screen-profile-onboarding">
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 md:px-10 md:py-8">
         <div className="flex items-center gap-3" data-testid="brand-onboarding">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="size-10 object-contain shadow-[0_0_0_5px_rgba(30,111,255,.12)]" />
          <span className="font-display text-[24px] font-bold tracking-[-0.05em] text-[hsl(var(--foreground))]">voltiva</span>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <button
              onClick={onCancel}
              className="focus-ring inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:bg-white hover:text-[hsl(var(--foreground))]"
              data-testid="button-cancel-profile-edit"
            >
              <X size={16} /> Cancelar edição
            </button>
          ) : (
            <button
              onClick={onSkip}
              className="focus-ring rounded-xl px-3 py-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:bg-white hover:text-[hsl(var(--foreground))]"
              data-testid="button-skip-onboarding"
            >
              Pular por agora
            </button>
          )}
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-col px-5 pb-10 pt-5 md:px-10 md:pb-16 md:pt-10">
        <div className="mx-auto w-full max-w-[760px]">
          <div className="mb-8 flex items-center justify-between gap-4" data-testid="progress-onboarding">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
                {editing ? 'Editar perfil' : 'Primeiro passo'}
              </p>
              <p className="mt-2 text-sm font-medium text-[hsl(var(--muted-foreground))]" data-testid="text-onboarding-step">
                Etapa {step + 1} de 3 <span className="mx-1.5 text-[#a7babd]">·</span> {stepLabels[step]}
              </p>
            </div>
            <div className="flex gap-1.5" aria-label={`Progresso: etapa ${step + 1} de 3`}>
              {stepLabels.map((label, index) => (
                <span
                  key={label}
                    className={`h-1.5 w-10 rounded-full transition-colors duration-300 sm:w-16 ${index <= step ? 'bg-[hsl(var(--primary))]' : 'bg-[#d7ebff]'}`}
                  data-testid={`progress-step-${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="overflow-hidden">
            <AnimatePresence initial={false} mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? 36 : -36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? -36 : 36 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="soft-shadow rounded-[28px] border border-[hsl(var(--card-border))] bg-white/95 p-6 sm:p-10"
                data-testid={`onboarding-step-${step + 1}`}
              >
                {step === 0 && (
                  <StepFrame
                    eyebrow="01 / Direção"
                    title="O que você quer fazer com a Voltiva?"
                    description="Uma resposta simples ajuda a dar contexto à sua jornada. Não usaremos isso para inventar dados de consumo."
                    icon={<Target size={22} />}
                  >
                    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Objetivo principal">
                      {goals.map(({ id, title, description, icon: Icon }) => {
                        const selected = draft.goal === id;
                        return (
                          <button
                            key={id}
                            onClick={() => {
                              onDraftChange({ goal: id });
                              setMessage('');
                            }}
                            role="radio"
                            aria-checked={selected}
                             className={`focus-ring group rounded-2xl border p-4 text-left transition ${selected ? 'border-[#1e6fff] bg-[#d7ebff] shadow-[inset_0_0_0_1px_#1e6fff]' : 'border-[hsl(var(--border))] bg-[#f5f7fa] hover:border-[#1e6fff] hover:bg-white'}`}
                            data-testid={`card-goal-${id}`}
                          >
                            <span className={`mb-4 grid size-10 place-items-center rounded-xl ${selected ? 'bg-[#ccece5] text-[#167e76]' : 'bg-[#eef5f5] text-[#62878a]'} transition-colors`}>
                              <Icon size={19} />
                            </span>
                            <span className="block text-sm font-bold text-[hsl(var(--foreground))]">{title}</span>
                            <span className="mt-1 block text-xs leading-5 text-[hsl(var(--muted-foreground))]">{description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </StepFrame>
                )}

                {step === 1 && (
                  <StepFrame
                    eyebrow="02 / Curiosidade"
                    title="Quais assuntos entram no seu radar?"
                    description="Escolha um ou mais temas. Você pode mudar isso depois, sem perder o que já respondeu."
                    icon={<Sparkles size={22} />}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {interests.map(({ id, title, icon: Icon }) => {
                        const selected = draft.interests.includes(id);
                        return (
                          <button
                            key={id}
                            onClick={() => toggleInterest(id)}
                            aria-pressed={selected}
                             className={`focus-ring flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${selected ? 'border-[#1e6fff] bg-[#d7ebff] shadow-[inset_0_0_0_1px_#1e6fff]' : 'border-[hsl(var(--border))] bg-[#f5f7fa] hover:border-[#1e6fff] hover:bg-white'}`}
                            data-testid={`card-interest-${id}`}
                          >
                            <span className="flex items-center gap-3">
                              <span className={`grid size-10 place-items-center rounded-xl ${selected ? 'bg-[#ccece5] text-[#167e76]' : 'bg-[#eef5f5] text-[#62878a]'}`}><Icon size={18} /></span>
                              <span className="text-sm font-bold text-[hsl(var(--foreground))]">{title}</span>
                            </span>
                            <span className={`grid size-5 place-items-center rounded-full border transition ${selected ? 'border-[#289c94] bg-[#289c94] text-white' : 'border-[#c4d4d3] text-transparent'}`}><Check size={13} strokeWidth={3} /></span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-4 text-xs font-medium text-[hsl(var(--muted-foreground))]" data-testid="text-interest-count">
                      {draft.interests.length ? `${draft.interests.length} ${draft.interests.length === 1 ? 'interesse selecionado' : 'interesses selecionados'}` : 'Nenhum interesse selecionado'}
                    </p>
                  </StepFrame>
                )}

                {step === 2 && (
                  <StepFrame
                    eyebrow="03 / Ponto de partida"
                    title="Como você se sente com o assunto?"
                    description="Não há resposta certa. Isso apenas registra o seu ponto de partida para a experiência."
                    icon={<Gauge size={22} />}
                  >
                    <div className="space-y-3" role="radiogroup" aria-label="Nível de conhecimento">
                      {knowledgeLevels.map(({ id, title, description }) => {
                        const selected = draft.knowledge === id;
                        return (
                          <button
                            key={id}
                            onClick={() => {
                              onDraftChange({ knowledge: id });
                              setMessage('');
                            }}
                            role="radio"
                            aria-checked={selected}
                             className={`focus-ring flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${selected ? 'border-[#1e6fff] bg-[#d7ebff] shadow-[inset_0_0_0_1px_#1e6fff]' : 'border-[hsl(var(--border))] bg-[#f5f7fa] hover:border-[#1e6fff] hover:bg-white'}`}
                            data-testid={`card-knowledge-${id}`}
                          >
                            <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-data font-medium ${selected ? 'bg-[#ccece5] text-[#167e76]' : 'bg-[#eef5f5] text-[#62878a]'}`}>{id === 'beginner' ? '01' : id === 'familiar' ? '02' : '03'}</span>
                            <span>
                              <span className="block text-sm font-bold text-[hsl(var(--foreground))]">{title}</span>
                              <span className="mt-1 block text-xs leading-5 text-[hsl(var(--muted-foreground))]">{description}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </StepFrame>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {step === 2 && (
            <div className="mt-5 rounded-2xl border border-[#d7ebff] bg-[#d7ebff] p-5" data-testid="card-profile-summary">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#299b8d]"><House size={17} /></span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#1e6fff]">Resumo do perfil</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[#387672]">
                    <span className="rounded-full bg-white px-2.5 py-1" data-testid="text-summary-goal">{goals.find((item) => item.id === draft.goal)?.title}</span>
                    <span className="rounded-full bg-white px-2.5 py-1" data-testid="text-summary-interests">{draft.interests.length} {draft.interests.length === 1 ? 'interesse' : 'interesses'}</span>
                    <span className="rounded-full bg-white px-2.5 py-1" data-testid="text-summary-knowledge">{knowledgeLevels.find((item) => item.id === draft.knowledge)?.title}</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#527b78]">Essas escolhas vão personalizar a experiência quando novos recursos estiverem disponíveis. Elas não alteram os cálculos nem preenchem dados automaticamente.</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-10">
              {step > 0 ? (
                <button
                  onClick={() => goToStep(step - 1)}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:bg-white hover:text-[hsl(var(--foreground))]"
                  data-testid="button-back-onboarding"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-[hsl(var(--muted-foreground))]" data-testid="text-resume-note">
                  <PencilLine size={14} /> Suas respostas são salvas automaticamente
                </span>
              )}
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:items-end">
              {message && <p className="text-right text-xs font-semibold text-[#b04f4c]" role="alert" data-testid="alert-onboarding-validation">{message}</p>}
              <button
                onClick={handleContinue}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_18px_hsl(var(--primary)/.18)] transition hover:-translate-y-0.5 hover:bg-[#1557d6] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
                data-testid={step === 2 ? 'button-finish-profile' : 'button-continue-onboarding'}
              >
                {step === 2 ? (editing ? 'Salvar perfil' : 'Finalizar perfil') : 'Continuar'} <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepFrame({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className="mb-8 flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e6f5f2] text-[#238f87]">{icon}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">{eyebrow}</p>
          <h1 className="mt-2 font-display text-[clamp(1.8rem,4vw,2.65rem)] font-semibold leading-[1.07] tracking-[-0.055em] text-[hsl(var(--foreground))]">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p>
        </div>
      </div>
      {children}
    </>
  );
}