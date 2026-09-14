import { useMemo, useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  BarChart3,
  Calculator,
  Calendar,
  Check,
  CircleDollarSign,
  Copy,
  Download,
  Filter,
  Gauge,
  History,
  Lightbulb,
  Plus,
  ReceiptText,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import type { EnergyProfile } from '@/hooks/use-energy-profile';
import type { CalculationRecord, EnergyDevice, VoltivaData } from '@/hooks/use-voltiva-data';
import { deviceMonthlyKwh, totalMonthlyKwh } from '@/hooks/use-voltiva-data';
import { calculationMeta, formatNumber, resistanceToColorBands, type CalculationType } from '@/lib/electricity';
import { createDashboardTips, type DashboardTipKind } from '@/lib/dashboard-tips';

const goalLabels = {
  learn: 'Aprender os fundamentos',
  save: 'Encontrar oportunidades',
  plan: 'Planejar um projeto',
  diagnose: 'Investigar um problema',
};

const interestLabels = {
  fundamentals: 'Fundamentos elétricos',
  consumption: 'Consumo e medição',
  savings: 'Economia de energia',
  safety: 'Segurança e boas práticas',
};

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col justify-between gap-5 md:flex-row md:items-end"
    >
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">{eyebrow}</p>
        <h1 className="font-display text-[clamp(2rem,4vw,3.35rem)] font-semibold leading-[1.05] tracking-[-0.055em] text-[hsl(var(--foreground))]">{title}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[hsl(var(--muted-foreground))]">{description}</p>
      </div>
      {action}
    </motion.div>
  );
}

function StatCard({ label, value, caption, icon: Icon, accent = 'teal' }: { label: string; value: string; caption: string; icon: typeof Activity; accent?: 'teal' | 'amber' | 'blue' }) {
  const colors = {
    teal: 'bg-[#e6f0ff] text-[#004eba]',
    amber: 'bg-[#fff7df] text-[#a26700]',
    blue: 'bg-[#dff5ff] text-[#16658e]',
  };
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.012 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${colors[accent]}`}><Icon size={17} /></span>
      </div>
      <p className="mt-5 font-data text-2xl font-medium tracking-[-0.05em] text-[hsl(var(--foreground))]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{caption}</p>
    </motion.div>
  );
}

const tipIcons: Record<DashboardTipKind, typeof Lightbulb> = {
  profile: UserRound,
  consumption: Activity,
  goal: Gauge,
  calculation: Calculator,
  safety: Lightbulb,
};

export function DashboardPage({ userName, profile, data }: { userName: string; profile: EnergyProfile | null; data: VoltivaData }) {
  const kwh = totalMonthlyKwh(data.devices);
  const recent = data.calculations.slice(0, 4);
  const tips = useMemo(
    () => createDashboardTips({
      profile,
      calculations: data.calculations,
      devices: data.devices,
      settings: data.settings,
    }),
    [data.calculations, data.devices, data.settings, profile],
  );

  return (
    <MotionConfig reducedMotion="never">
      <div className="space-y-8">
        <PageIntro
          eyebrow="Visão geral"
          title={`Olá, ${userName || 'por aqui'}.`}
          description="Seu espaço para entender grandezas, acompanhar consumo e tomar decisões elétricas com mais clareza."
          action={
            <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/app/calculator" className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_18px_hsl(var(--primary)/.18)] transition hover:bg-[#004eba]">
                Novo cálculo <ArrowRight size={16} />
              </Link>
            </motion.div>
          }
        />

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="rounded-[24px] border border-[#c9dcf2] bg-[#eaf2ff] p-5 sm:p-7"
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <motion.span
                animate={{ rotate: [0, -6, 0], scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-[#006bff] shadow-sm"
              >
                <Zap size={22} fill="currentColor" />
              </motion.span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#004eba]">Seu ponto de partida</p>
                <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] text-[#0b3558]">{profile ? goalLabels[profile.goal] : 'Complete seu perfil energético'}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#476788]">{profile ? `Você marcou ${profile.interests.length} ${profile.interests.length === 1 ? 'interesse' : 'interesses'} para acompanhar na Voltiva.` : 'Responda três perguntas rápidas para ajustar sua experiência.'}</p>
              </div>
            </div>
            <motion.div whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
              <Link href={profile ? '/app/settings' : '/app/dashboard'} className="focus-ring inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#b5cdec] bg-white px-4 py-2.5 text-sm font-bold text-[#004eba] transition hover:border-[#006bff]">
                {profile ? 'Ver perfil' : 'Começar perfil'} <ArrowRight size={15} />
              </Link>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid gap-4 sm:grid-cols-3"
        >
          {[ 
            { label: 'Cálculos salvos', value: String(data.calculations.length), caption: 'Resultados disponíveis no histórico', icon: Calculator },
            { label: 'Consumo estimado', value: `${formatNumber(kwh)} kWh`, caption: 'Com base nos equipamentos cadastrados', icon: Activity, accent: 'blue' as const },
            { label: 'Equipamentos', value: String(data.devices.length), caption: 'Itens acompanhados neste espaço', icon: Gauge, accent: 'amber' as const },
          ].map((card) => (
            <motion.div key={card.label} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
              <StatCard {...card} />
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="rounded-[24px] border border-[#c9dcf2] bg-[#eaf2ff] p-5 sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#004eba]">Dicas para o seu momento</p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.035em] text-[#0b3558]">Próximas ações baseadas no que você fez</h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#476788]">As recomendações combinam seu perfil, sua meta, os equipamentos cadastrados e os cálculos salvos.</p>
            </div>
            <span className="hidden size-10 shrink-0 place-items-center rounded-xl bg-white text-[#1e6fff] shadow-sm sm:grid"><Lightbulb size={18} /></span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {tips.map((tip) => {
              const Icon = tipIcons[tip.kind];
              return (
                <motion.div key={tip.id} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }} className="flex min-h-[188px] flex-col rounded-2xl border border-[#c9dcf2] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-[#e6f0ff] text-[#1e6fff]"><Icon size={17} /></span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7b9ac1]">{tip.eyebrow}</span>
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold leading-5 text-[#0b3558]">{tip.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-5 text-[#5c7693]">{tip.text}</p>
                  <Link href={tip.href} className="mt-4 inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-[#1e6fff] transition hover:text-[#004eba]">
                    {tip.action} <ArrowRight size={14} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }} className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-5 sm:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Atividade recente</p>
                <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.035em]">Últimos cálculos</h2>
              </div>
              <Link href="/app/history" className="cursor-pointer text-xs font-bold text-[hsl(var(--primary))] hover:underline">Ver histórico</Link>
            </div>
            {recent.length ? <div className="mt-5 divide-y divide-[hsl(var(--border))]">{recent.map((record) => <CalculationRow key={record.id} record={record} />)}</div> : <EmptyState icon={History} title="Seu histórico começa aqui" description="Salve o próximo resultado da calculadora para acompanhar sua evolução." href="/app/calculator" action="Abrir calculadora" />}
          </motion.div>
          <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }} className="rounded-2xl border border-[hsl(var(--border))] bg-white/75 p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Acesso rápido</p>
            <div className="mt-4 space-y-2">
              {[
                { href: '/app/calculator', label: 'Calcular uma grandeza', icon: Calculator, text: 'Use as fórmulas de Ohm.' },
                { href: '/app/consumption', label: 'Mapear consumo', icon: Activity, text: 'Cadastre seus equipamentos.' },
                { href: '/app/reports', label: 'Gerar relatório', icon: ReceiptText, text: 'Exporte seus dados locais.' },
              ].map(({ href, label, icon: Icon, text }) => (
                <motion.div key={href} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 320, damping: 24 }}>
                  <Link href={href} className="group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-[#bcd4f6] hover:bg-[#f4f8ff]">
                    <span className="grid size-9 place-items-center rounded-lg bg-[#e6f0ff] text-[#1e6fff]"><Icon size={16} /></span>
                    <span className="min-w-0 flex-1"><strong className="block text-sm text-[hsl(var(--foreground))]">{label}</strong><span className="text-xs text-[hsl(var(--muted-foreground))]">{text}</span></span>
                    <ArrowRight size={15} className="text-[#8ba8c9] transition group-hover:translate-x-1 group-hover:text-[#1e6fff]" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>
      </div>
    </MotionConfig>
  );
}

const APPLIANCE_PRESETS = [
  { name: 'Geladeira Frost Free', watts: '150', hours: '24', days: '30' },
  { name: 'Ar Split 9000 BTUs', watts: '900', hours: '8', days: '30' },
  { name: 'Smart TV 55"', watts: '110', hours: '5', days: '30' },
  { name: 'Micro-ondas', watts: '1200', hours: '0.4', days: '30' },
  { name: 'Máquina de Lavar', watts: '500', hours: '1.5', days: '16' },
  { name: 'Home Office / PC', watts: '220', hours: '8', days: '22' },
];

export function ConsumptionPage({ data }: { data: VoltivaData }) {
  const [name, setName] = useState('');
  const [watts, setWatts] = useState('');
  const [hours, setHours] = useState('');
  const [days, setDays] = useState('30');
  const [message, setMessage] = useState('');

  const applyPreset = (preset: typeof APPLIANCE_PRESETS[number]) => {
    setName(preset.name);
    setWatts(preset.watts);
    setHours(preset.hours);
    setDays(preset.days);
    toast.info(`Preenchido com ${preset.name}`);
  };

  const submit = () => {
    const parsed = {
      watts: Number(watts.replace(',', '.')),
      hoursPerDay: Number(hours.replace(',', '.')),
      daysPerMonth: Number(days.replace(',', '.')),
    };
    if (
      !name.trim() ||
      !Number.isFinite(parsed.watts) ||
      parsed.watts <= 0 ||
      !Number.isFinite(parsed.hoursPerDay) ||
      parsed.hoursPerDay <= 0 ||
      parsed.hoursPerDay > 24 ||
      !Number.isFinite(parsed.daysPerMonth) ||
      parsed.daysPerMonth <= 0 ||
      parsed.daysPerMonth > 31
    ) {
      const err = 'Preencha nome, potência, horas por dia e dias do mês com valores válidos.';
      setMessage(err);
      toast.error(err);
      return;
    }
    data.addDevice({ name: name.trim(), ...parsed });
    setName('');
    setWatts('');
    setHours('');
    setDays('30');
    setMessage('Equipamento adicionado ao seu mapa de consumo.');
    toast.success(`Equipamento "${name.trim()}" adicionado!`);
  };

  const handleRemoveDevice = (id: string, deviceName: string) => {
    data.removeDevice(id);
    toast.info(`"${deviceName}" removido da estimativa.`);
  };

  const total = totalMonthlyKwh(data.devices);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Monitoramento"
        title="Consumo de energia"
        description="Monte uma estimativa transparente a partir dos seus equipamentos. A Voltiva não inventa leituras: cada número vem do que você informar."
      />
      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-5 sm:p-7">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Novo equipamento</p>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.035em]">Adicionar à estimativa</h2>
          </div>

          {/* Modelos rápidos */}
          <div className="mb-5 rounded-xl border border-[#d7ebff] bg-[#f5f9ff] p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#004eba]">
              <Sparkles size={14} className="text-[#1e6fff]" /> Modelos comuns
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {APPLIANCE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="focus-ring cursor-pointer rounded-lg border border-[#c9dcf2] bg-white px-2 py-1 text-[11px] font-semibold text-[#0b3558] shadow-xs transition hover:border-[#1e6fff] hover:bg-[#eaf2ff] active:scale-[0.97]"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Nome do equipamento" value={name} onChange={setName} placeholder="Ex.: Geladeira" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Potência" suffix="W" value={watts} onChange={setWatts} placeholder="120" inputMode="decimal" />
              <Field label="Uso diário" suffix="h/dia" value={hours} onChange={setHours} placeholder="8" inputMode="decimal" />
            </div>
            <Field label="Dias no mês" suffix="dias" value={days} onChange={setDays} placeholder="30" inputMode="numeric" />
          </div>
          {message && <p className="mt-4 rounded-xl bg-[#eef8f5] px-3 py-2.5 text-xs font-semibold text-[#287b76]" role="status">{message}</p>}
          <button
            type="button"
            onClick={submit}
            className="focus-ring mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#004eba] active:scale-[0.99]"
          >
            <Plus size={17} /> Adicionar equipamento
          </button>
        </div>

        <div className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-5 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Estimativa mensal</p>
              <h2 className="mt-2 font-data text-3xl font-medium tracking-[-0.06em]">{formatNumber(total)} kWh</h2>
            </div>
            <span className="grid size-11 place-items-center rounded-2xl bg-[#e6f0ff] text-[#004eba]"><Activity size={21} /></span>
          </div>
          <div className="mt-7 space-y-3">
            {data.devices.length ? (
              data.devices.map((device) => (
                <DeviceRow key={device.id} device={device} onRemove={() => handleRemoveDevice(device.id, device.name)} />
              ))
            ) : (
              <EmptyState icon={Gauge} title="Nenhum equipamento cadastrado" description="Adicione os primeiros equipamentos para formar sua estimativa." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function SavingsPage({ data }: { data: VoltivaData }) {
  const total = totalMonthlyKwh(data.devices);
  const target = data.settings.monthlyGoal;
  const progress = target > 0 ? (total / target) * 100 : 0;
  const cappedProgress = Math.min(100, progress);
  const potential = total * 0.1;

  const isOverGoal = target > 0 && total > target;
  const isNearGoal = target > 0 && total >= target * 0.8 && total <= target;

  const progressColor = isOverGoal
    ? 'bg-rose-500'
    : isNearGoal
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  const statusBadge = isOverGoal
    ? { text: 'Meta ultrapassada', bg: 'bg-rose-50 text-rose-700 border-rose-200' }
    : isNearGoal
      ? { text: 'Atenção ao limite', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
      : { text: 'Dentro da meta', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Eficiência" title="Economia" description="Encontre oportunidades a partir dos dados que você cadastrou. As projeções são indicativas e ficam separadas das medições reais." />
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Base atual" value={`${formatNumber(total)} kWh`} caption="Estimativa dos equipamentos" icon={Activity} />
        <StatCard label="Potencial de redução" value={`${formatNumber(potential)} kWh`} caption="Cenário indicativo de 10%" icon={CircleDollarSign} accent="amber" />
        <StatCard label="Meta mensal" value={`${formatNumber(target)} kWh`} caption="Ajustável em configurações" icon={Gauge} accent="blue" />
      </section>

      <section className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Acompanhamento</p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-[-0.035em]">Uso frente à sua meta</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge.bg}`}>
              {statusBadge.text}
            </span>
            <span className="font-data text-lg font-bold text-[#0b1f3b]">{formatNumber(progress)}%</span>
          </div>
        </div>

        {/* Tiered Progress Bar */}
        <div className="mt-6 h-3.5 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${cappedProgress}%` }}
          />
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          {total
            ? 'Use esta referência para decidir onde investigar primeiro. Uma redução real deve ser confirmada com a sua medição ou fatura.'
            : 'Cadastre equipamentos na área de consumo para começar a acompanhar uma base real.'}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          'Desligue cargas em espera quando não forem necessárias.',
          'Compare o tempo de uso antes de trocar um equipamento.',
          'Registre a potência nominal do equipamento, não uma estimativa.',
          'Valide qualquer economia com uma leitura ou fatura real.',
        ].map((tip, index) => (
          <div key={tip} className="flex gap-3 rounded-2xl border border-[#c9dcf2] bg-[#eaf2ff] p-5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white font-data text-xs font-bold text-[#004eba]">{String(index + 1).padStart(2, '0')}</span>
            <p className="text-sm leading-6 text-[#476788]">{tip}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export function HistoryPage({
  calculations,
  clearCalculations,
  removeCalculation,
}: {
  calculations: CalculationRecord[];
  clearCalculations: () => void;
  removeCalculation?: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CalculationType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const totalCount = calculations.length;

  const countsByType = useMemo(() => {
    return {
      voltage: calculations.filter((c) => c.type === 'voltage').length,
      current: calculations.filter((c) => c.type === 'current').length,
      resistance: calculations.filter((c) => c.type === 'resistance').length,
      power: calculations.filter((c) => c.type === 'power').length,
    };
  }, [calculations]);

  const mostFrequent = useMemo(() => {
    if (!calculations.length) return null;
    const entries = (['voltage', 'current', 'resistance', 'power'] as CalculationType[]).map((t) => ({
      type: t,
      count: countsByType[t],
    }));
    entries.sort((a, b) => b.count - a.count);
    if (entries[0].count === 0) return null;
    return entries[0];
  }, [countsByType, calculations.length]);

  const latestCalculation = useMemo(() => {
    if (!calculations.length) return null;
    return calculations[0];
  }, [calculations]);

  const filteredCalculations = useMemo(() => {
    let list = [...calculations];

    if (filterType !== 'all') {
      list = list.filter((c) => c.type === filterType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const meta = calculationMeta[c.type];
        const matchType = meta.label.toLowerCase().includes(q) || meta.symbol.toLowerCase().includes(q);
        const matchFormula = c.formula.toLowerCase().includes(q);
        const matchResult =
          String(c.result).includes(q) ||
          `${formatNumber(c.result)} ${c.unit}`.toLowerCase().includes(q);
        const matchInputs = Object.values(c.inputs || {}).some((v) =>
          String(v).toLowerCase().includes(q)
        );
        return matchType || matchFormula || matchResult || matchInputs;
      });
    }

    list.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOrder === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOrder === 'highest') return b.result - a.result;
      if (sortOrder === 'lowest') return a.result - b.result;
      return 0;
    });

    return list;
  }, [calculations, filterType, searchQuery, sortOrder]);

  const handleClear = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico salvo neste dispositivo?')) {
      clearCalculations();
      toast.success('Histórico de cálculos limpo com sucesso.');
    }
  };

  const exportHistoryCsv = () => {
    if (!filteredCalculations.length) {
      toast.error('Nenhum registro para exportar.');
      return;
    }
    const rows = [
      ['Data/Hora', 'Grandeza', 'Resultado', 'Unidade', 'Fórmula', 'Parâmetros de Entrada'],
      ...filteredCalculations.map((item) => [
        new Date(item.createdAt).toLocaleString('pt-BR'),
        calculationMeta[item.type].label,
        String(item.result),
        item.unit,
        item.formula,
        Object.entries(item.inputs || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join('; '),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `voltiva-historico-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    toast.success('Histórico exportado em CSV com sucesso!');
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Memória de trabalho"
        title="Histórico de Decisões"
        description="Consulte todos os cálculos realizados na Voltiva com parâmetros originais, código de cores do resistor e filtros avançados."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/app/calculator"
              className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1e6fff] px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-[#1e6fff]/20 transition hover:bg-[#1557d6]"
            >
              <Plus size={15} /> Novo cálculo
            </Link>
            {totalCount > 0 && (
              <>
                <button
                  type="button"
                  onClick={exportHistoryCsv}
                  className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#cbe0f5] bg-white px-3.5 py-2.5 text-xs font-bold text-[#0b3558] shadow-xs transition hover:border-[#1e6fff] hover:bg-[#f0f7ff]"
                  title="Exportar registros filtrados para planilha CSV"
                >
                  <Download size={15} className="text-[#1e6fff]" /> Exportar CSV
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#efcfcc] bg-white px-3.5 py-2.5 text-xs font-bold text-[#b04f4c] shadow-xs transition hover:bg-[#fff5f4]"
                  title="Limpar todos os registros do histórico"
                >
                  <Trash2 size={15} /> Limpar tudo
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Cards de Métricas e Resumo */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="soft-shadow rounded-2xl border border-[#dce8f3] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Cálculos Salvos</p>
            <span className="grid size-8 place-items-center rounded-lg bg-[#e6f0ff] text-[#1e6fff]">
              <History size={16} />
            </span>
          </div>
          <p className="mt-2 font-data text-3xl font-medium tracking-tight text-[#0b1f3b]">
            {totalCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {totalCount === 1 ? '1 registro persistido' : `${totalCount} registros persistidos`}
          </p>
        </div>

        <div className="soft-shadow rounded-2xl border border-[#dce8f3] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Mais Frequente</p>
            <span className="grid size-8 place-items-center rounded-lg bg-[#eaf8f4] text-[#1f8778]">
              <Calculator size={16} />
            </span>
          </div>
          <p className="mt-2 font-data text-xl font-semibold tracking-tight text-[#0b1f3b]">
            {mostFrequent ? calculationMeta[mostFrequent.type].label : '—'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {mostFrequent
              ? `${mostFrequent.count} cálculo${mostFrequent.count > 1 ? 's' : ''} (${Math.round((mostFrequent.count / totalCount) * 100)}%)`
              : 'Nenhum cálculo registrado'}
          </p>
        </div>

        <div className="soft-shadow rounded-2xl border border-[#dce8f3] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Última Atividade</p>
            <span className="grid size-8 place-items-center rounded-lg bg-[#fff4e8] text-[#d97706]">
              <Zap size={16} />
            </span>
          </div>
          <p className="mt-2 font-data text-base font-semibold tracking-tight text-[#0b1f3b] truncate">
            {latestCalculation
              ? `${calculationMeta[latestCalculation.type].label} · ${formatNumber(latestCalculation.result)} ${latestCalculation.unit}`
              : 'Sem cálculos recentes'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {latestCalculation
              ? new Date(latestCalculation.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
              : 'Faça seu primeiro cálculo'}
          </p>
        </div>
      </section>

      {/* Painel Principal de Histórico com Busca, Filtros e Lista */}
      <div className="soft-shadow overflow-hidden rounded-2xl border border-[hsl(var(--card-border))] bg-white">
        {/* Barra de Ferramentas: Busca, Filtro e Ordenação */}
        <div className="border-b border-[hsl(var(--border))] bg-[#f9fbfd] p-4 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Campo de busca */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por valor, fórmula, grandeza ou entrada..."
                className="h-10 w-full rounded-xl border border-[#d7e3ef] bg-white pl-9 pr-4 text-xs font-medium text-[#0b1f3b] shadow-2xs outline-none transition focus:border-[#1e6fff] focus:ring-2 focus:ring-[#1e6fff]/15 placeholder:text-slate-400"
                data-testid="input-search-history"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
                  aria-label="Limpar busca"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <ArrowUpDown size={13} />
                Ordenar:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="h-9 cursor-pointer rounded-xl border border-[#d7e3ef] bg-white px-3 text-xs font-semibold text-[#0b1f3b] shadow-2xs outline-none focus:border-[#1e6fff]"
                data-testid="select-history-sort"
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="highest">Maior valor</option>
                <option value="lowest">Menor valor</option>
              </select>
            </div>
          </div>

          {/* Chips de filtro por tipo */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#edf2f7]">
            <span className="mr-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Filtro:
            </span>
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterType === 'all'
                  ? 'bg-[#0b1f3b] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-[#dce8f3] hover:bg-slate-50'
              }`}
            >
              <span>Todos</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                {totalCount}
              </span>
            </button>

            {(['voltage', 'current', 'resistance', 'power'] as CalculationType[]).map((t) => {
              const count = countsByType[t];
              const meta = calculationMeta[t];
              const isActive = filterType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#1e6fff] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-[#dce8f3] hover:bg-[#f0f7ff] hover:text-[#004eba]'
                  }`}
                >
                  <span>{meta.label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Registros */}
        {filteredCalculations.length ? (
          <div className="divide-y divide-[#edf2f7]">
            {filteredCalculations.map((record) => (
              <CalculationRow
                key={record.id}
                record={record}
                detailed
                onRemove={removeCalculation}
              />
            ))}
          </div>
        ) : totalCount > 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 mb-3">
              <Search size={20} />
            </div>
            <h3 className="font-display text-base font-bold text-[#0b1f3b]">Nenhum cálculo encontrado</h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              Nenhum registro corresponde aos filtros ou à pesquisa "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="mt-4 cursor-pointer rounded-lg border border-[#cbe0f5] bg-white px-3 py-1.5 text-xs font-bold text-[#1e6fff] hover:bg-[#f0f7ff]"
            >
              Limpar filtros de pesquisa
            </button>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={History}
              title="Nenhum cálculo salvo ainda"
              description="Depois de calcular uma grandeza na calculadora elétrica, selecione “Salvar no histórico” para organizar suas decisões aqui."
              href="/app/calculator"
              action="Abrir calculadora elétrica"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ReportsPage({ calculations, devices }: { calculations: CalculationRecord[]; devices: EnergyDevice[] }) {
  const [message, setMessage] = useState('');

  const exportCsv = () => {
    const rows = [
      ['tipo', 'resultado', 'unidade', 'formula', 'data'],
      ...calculations.map((item) => [
        calculationMeta[item.type].label,
        String(item.result),
        item.unit,
        item.formula,
        item.createdAt,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'voltiva-relatorio.csv';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setMessage('Relatório exportado em CSV.');
    toast.success('Relatório CSV exportado com sucesso!');
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Saída de dados"
        title="Relatórios"
        description="Exporte um resumo dos seus registros para continuar a análise fora da Voltiva."
        action={
          <button
            onClick={exportCsv}
            disabled={!calculations.length}
            className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#004eba] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} /> Exportar CSV
          </button>
        }
      />
      {message && <p className="rounded-xl border border-[#cde4df] bg-[#eef8f5] px-4 py-3 text-sm font-semibold text-[#287b76]" role="status">{message}</p>}
      <section className="grid gap-5 md:grid-cols-2">
        <div className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#e6f0ff] text-[#004eba]"><BarChart3 size={18} /></span>
            <div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Resumo</p><h2 className="mt-1 font-display text-xl font-semibold">{calculations.length} cálculos salvos</h2></div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">O arquivo contém os resultados e as fórmulas aplicadas, sem alterar os dados originais.</p>
        </div>
        <div className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#dff5ff] text-[#16658e]"><Gauge size={18} /></span>
            <div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Consumo</p><h2 className="mt-1 font-display text-xl font-semibold">{devices.length} equipamentos</h2></div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">Os equipamentos cadastrados ficam disponíveis na área de consumo para revisão.</p>
        </div>
      </section>
    </div>
  );
}

export function SettingsPage({ profile, onEditProfile, data, userEmail, onSignOut }: { profile: EnergyProfile | null; onEditProfile: () => void; data: VoltivaData; userEmail: string; onSignOut: () => void }) {
  const [goal, setGoal] = useState(String(data.settings.monthlyGoal));

  const saveGoal = () => {
    const value = Number(goal.replace(',', '.'));
    if (Number.isFinite(value) && value > 0) {
      data.updateSettings({ monthlyGoal: value });
      toast.success('Meta mensal de consumo atualizada!');
    } else {
      toast.error('Informe um valor de meta válido.');
    }
  };

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Conta e preferências" title="Configurações" description="Mantenha seus dados de contexto e preferências de acompanhamento sob controle." />
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#e9f0fb] text-[#37669d]"><UserRound size={18} /></span>
            <div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Conta</p><h2 className="mt-1 font-display text-xl font-semibold">Seu perfil Voltiva</h2></div>
          </div>
          <p className="mt-5 text-sm text-slate-600">{userEmail || 'Conta autenticada'}</p>
          <button onClick={onEditProfile} className="focus-ring mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#c4ddda] px-4 py-2.5 text-sm font-bold text-[#287873] transition hover:bg-[#f3fbf9]">
            Editar perfil energético <ArrowRight size={15} />
          </button>
        </div>

        <div className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#dff5ff] text-[#16658e]"><Gauge size={18} /></span>
            <div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Preferência</p><h2 className="mt-1 font-display text-xl font-semibold">Meta mensal de consumo</h2></div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <input value={goal} onChange={(event) => setGoal(event.target.value)} inputMode="decimal" className="focus-ring h-12 min-w-0 flex-1 rounded-lg border border-[hsl(var(--input))] px-4 font-data text-sm outline-none focus:border-[#1e6fff]" />
            <span className="font-data text-xs text-slate-500">kWh</span>
            <button onClick={saveGoal} className="focus-ring cursor-pointer rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#004eba]" title="Salvar meta">
              <Check size={16} />
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-600">Essa meta também orienta as dicas exibidas na sua dashboard e a página Economia.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-[#efd0cd] bg-[#fff7f6] p-6">
        <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#b04f4c]">Sessão</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-[#763d3b]">Sair da Voltiva</h2>
        <p className="mt-2 text-sm leading-6 text-[#93615f]">Você poderá entrar novamente com seu e-mail e senha. Seus registros locais permanecem neste dispositivo.</p>
        <button onClick={onSignOut} className="focus-ring mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#e4b8b5] bg-white px-4 py-2.5 text-sm font-bold text-[#b04f4c] transition hover:bg-[#fff1ef]">
          Encerrar sessão
        </button>
      </section>

      {profile && <div className="text-xs text-slate-600">Objetivo: <strong>{goalLabels[profile.goal]}</strong> · {profile.interests.map((interest) => interestLabels[interest]).join(' · ')}</div>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, suffix, inputMode = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; suffix?: string; inputMode?: 'text' | 'decimal' | 'numeric' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <div className="flex h-12 items-center rounded-lg border border-[hsl(var(--input))] bg-white focus-within:border-[#006bff] focus-within:ring-4 focus-within:ring-[#006bff1f]">
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode} className="focus-ring h-full min-w-0 flex-1 rounded-lg bg-transparent px-4 text-sm font-semibold outline-none placeholder:text-[#a6bbd1]" />
        {suffix && <span className="pr-4 font-data text-xs text-[hsl(var(--muted-foreground))]">{suffix}</span>}
      </div>
    </label>
  );
}

function CalculationRow({
  record,
  detailed = false,
  onRemove,
}: {
  record: CalculationRecord;
  detailed?: boolean;
  onRemove?: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const meta = calculationMeta[record.type];
  const bands = record.type === 'resistance' && record.result > 0 ? resistanceToColorBands(record.result) : null;

  const typeTheme = {
    voltage: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-[#1e6fff] text-white',
      symbolBg: 'bg-[#e6f0ff] text-[#1e6fff]',
      accentText: 'text-[#1e6fff]',
    },
    current: {
      badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      iconBg: 'bg-[#0891b2] text-white',
      symbolBg: 'bg-[#e0f7fa] text-[#0891b2]',
      accentText: 'text-[#0891b2]',
    },
    resistance: {
      badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      iconBg: 'bg-[#4f46e5] text-white',
      symbolBg: 'bg-[#eef2ff] text-[#4f46e5]',
      accentText: 'text-[#4f46e5]',
    },
    power: {
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      iconBg: 'bg-[#d97706] text-white',
      symbolBg: 'bg-[#fef3c7] text-[#d97706]',
      accentText: 'text-[#d97706]',
    },
  }[record.type];

  const copyRow = () => {
    const text = `${meta.label}: ${formatNumber(record.result)} ${record.unit} (Fórmula: ${record.formula})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`Copiado: ${text}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedInputs = useMemo(() => {
    if (!record.inputs) return null;
    const entries = Object.entries(record.inputs).filter(([, v]) => Boolean(v));
    if (!entries.length) return null;
    return entries.map(([k, v]) => {
      const field = meta.fields.find((f) => f.key === k);
      return `${field?.label || k}: ${v} ${field?.unit || ''}`.trim();
    }).join('  ·  ');
  }, [record.inputs, meta.fields]);

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(240,247,255,0.45)' }}
      transition={{ duration: 0.15 }}
      className="p-4 sm:p-5 transition"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Identificação e Grandeza */}
        <div className="flex items-start gap-3 min-w-0">
          <span className={`grid size-10 shrink-0 place-items-center rounded-xl font-data text-sm font-bold shadow-xs ${typeTheme.symbolBg}`}>
            {meta.symbol}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-[#0b1f3b]">{meta.label}</p>
              <span className={`rounded-md border px-2 py-0.5 font-data text-[10px] font-bold ${typeTheme.badge}`}>
                {record.formula}
              </span>
              {bands && (
                <div
                  className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 shadow-2xs"
                  title="Código de cores do resistor de 4 faixas"
                >
                  <span className="size-2 rounded-full border border-black/15 shadow-2xs" style={{ backgroundColor: bands.first.color }} />
                  <span className="size-2 rounded-full border border-black/15 shadow-2xs" style={{ backgroundColor: bands.second.color }} />
                  <span className="size-2 rounded-full border border-black/15 shadow-2xs" style={{ backgroundColor: bands.multiplier.color }} />
                  <span className="size-2 rounded-full border border-black/15 shadow-2xs" style={{ backgroundColor: bands.tolerance.color }} />
                </div>
              )}
            </div>
            {formattedInputs ? (
              <p className="mt-1 text-xs text-slate-500 font-medium truncate">
                <strong className="text-slate-700">Entradas:</strong> {formattedInputs}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-slate-400">Lei de Ohm</p>
            )}
            <p className="mt-0.5 text-[11px] text-slate-400">
              Registrado em {new Date(record.createdAt).toLocaleDateString('pt-BR')} às {new Date(record.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Valor Calculado e Ações */}
        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <div className="text-left sm:text-right">
            <span className="font-data text-lg font-bold tracking-tight text-[#004eba]">
              {formatNumber(record.result)} {record.unit}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={copyRow}
              title="Copiar resultado formatado"
              className="focus-ring cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-[#d7ebff] hover:text-[#004eba]"
              aria-label="Copiar cálculo"
            >
              {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
            </button>

            <Link
              href="/app/calculator"
              title="Abrir na calculadora"
              className="focus-ring cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-[#d7ebff] hover:text-[#1e6fff]"
              aria-label="Recalcular"
            >
              <Calculator size={15} />
            </Link>

            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(record.id)}
                title="Excluir este cálculo do histórico"
                className="focus-ring cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label="Excluir cálculo"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DeviceRow({ device, onRemove }: { device: EnergyDevice; onRemove: () => void }) {
  return (
    <motion.div whileHover={{ x: 4, borderColor: '#9fc8c5' }} transition={{ duration: 0.2 }} className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[#fbfdff] p-3">
      <span className="grid size-9 place-items-center rounded-lg bg-[#dff5ff] text-[#16658e]"><Zap size={16} /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#0b1f3b]">{device.name}</p>
        <p className="mt-0.5 text-xs text-slate-600">{device.watts} W · {device.hoursPerDay} h/dia · {formatNumber(deviceMonthlyKwh(device))} kWh/mês</p>
      </div>
      <button onClick={onRemove} className="focus-ring cursor-pointer rounded-lg p-2 text-[#b47b78] transition hover:bg-[#fff0ee] hover:text-[#b04f4c]" aria-label={`Remover ${device.name}`} title="Remover equipamento">
        <Trash2 size={15} />
      </button>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, description, href, action }: { icon: typeof Activity; title: string; description: string; href?: string; action?: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#e6f0ff] text-[#1e6fff]"><Icon size={21} /></span>
      <h3 className="mt-4 font-display text-lg font-semibold text-[#0b1f3b]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600">{description}</p>
      {href && action && (
        <Link href={href} className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-[hsl(var(--primary))] hover:underline">
          {action} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}