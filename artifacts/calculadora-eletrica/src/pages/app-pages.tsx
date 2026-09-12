import { useMemo, useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calculator,
  Check,
  CircleDollarSign,
  Download,
  Gauge,
  History,
  Lightbulb,
  Plus,
  ReceiptText,
  Trash2,
  UserRound,
  Zap,
} from 'lucide-react';
import type { EnergyProfile } from '@/hooks/use-energy-profile';
import type { CalculationRecord, EnergyDevice, VoltivaData } from '@/hooks/use-voltiva-data';
import { deviceMonthlyKwh, totalMonthlyKwh } from '@/hooks/use-voltiva-data';
import { calculationMeta, formatNumber } from '@/lib/electricity';
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
              <Link href="/app/calculator" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_18px_hsl(var(--primary)/.18)] transition hover:bg-[#004eba]">
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
              <Link href={profile ? '/app/settings' : '/app/dashboard'} className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#b5cdec] bg-white px-4 py-2.5 text-sm font-bold text-[#004eba] transition hover:border-[#006bff]">
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
                  <Link href={tip.href} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1e6fff] transition hover:text-[#004eba]">
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
              <Link href="/app/history" className="text-xs font-bold text-[hsl(var(--primary))]">Ver histórico</Link>
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
                  <Link href={href} className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-[#bcd4f6] hover:bg-[#f4f8ff]">
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

export function ConsumptionPage({ data }: { data: VoltivaData }) {
  const [name, setName] = useState('');
  const [watts, setWatts] = useState('');
  const [hours, setHours] = useState('');
  const [days, setDays] = useState('30');
  const [message, setMessage] = useState('');

  const submit = () => {
    const parsed = { watts: Number(watts.replace(',', '.')), hoursPerDay: Number(hours.replace(',', '.')), daysPerMonth: Number(days.replace(',', '.')) };
    if (!name.trim() || !Number.isFinite(parsed.watts) || parsed.watts <= 0 || !Number.isFinite(parsed.hoursPerDay) || parsed.hoursPerDay <= 0 || parsed.hoursPerDay > 24 || !Number.isFinite(parsed.daysPerMonth) || parsed.daysPerMonth <= 0 || parsed.daysPerMonth > 31) {
      setMessage('Preencha nome, potência, horas por dia e dias do mês com valores válidos.');
      return;
    }
    data.addDevice({ name: name.trim(), ...parsed });
    setName(''); setWatts(''); setHours(''); setDays('30'); setMessage('Equipamento adicionado ao seu mapa de consumo.');
  };
  const total = totalMonthlyKwh(data.devices);
  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Monitoramento" title="Consumo de energia" description="Monte uma estimativa transparente a partir dos seus equipamentos. A Voltiva não inventa leituras: cada número vem do que você informar." />
      <section className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-5 sm:p-7">
          <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Novo equipamento</p><h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.035em]">Adicionar à estimativa</h2></div>
          <div className="space-y-4">
            <Field label="Nome do equipamento" value={name} onChange={setName} placeholder="Ex.: Geladeira" />
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Potência" suffix="W" value={watts} onChange={setWatts} placeholder="120" inputMode="decimal" /><Field label="Uso diário" suffix="h/dia" value={hours} onChange={setHours} placeholder="8" inputMode="decimal" /></div>
            <Field label="Dias no mês" suffix="dias" value={days} onChange={setDays} placeholder="30" inputMode="numeric" />
          </div>
          {message && <p className="mt-4 rounded-xl bg-[#eef8f5] px-3 py-2.5 text-xs font-semibold text-[#287b76]" role="status">{message}</p>}
          <button onClick={submit} className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#004eba]"><Plus size={17} /> Adicionar equipamento</button>
        </div>
        <div className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-5 sm:p-7">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Estimativa mensal</p><h2 className="mt-2 font-data text-3xl font-medium tracking-[-0.06em]">{formatNumber(total)} kWh</h2></div><span className="grid size-11 place-items-center rounded-2xl bg-[#e6f0ff] text-[#004eba]"><Activity size={21} /></span></div>
          <div className="mt-7 space-y-3">{data.devices.length ? data.devices.map((device) => <DeviceRow key={device.id} device={device} onRemove={() => data.removeDevice(device.id)} />) : <EmptyState icon={Gauge} title="Nenhum equipamento cadastrado" description="Adicione os primeiros equipamentos para formar sua estimativa." />}</div>
        </div>
      </section>
    </div>
  );
}

export function SavingsPage({ data }: { data: VoltivaData }) {
  const total = totalMonthlyKwh(data.devices);
  const target = data.settings.monthlyGoal;
  const progress = target > 0 ? Math.min(100, (total / target) * 100) : 0;
  const potential = total * 0.1;
  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Eficiência" title="Economia" description="Encontre oportunidades a partir dos dados que você cadastrou. As projeções são indicativas e ficam separadas das medições reais." />
      <section className="grid gap-4 sm:grid-cols-3"><StatCard label="Base atual" value={`${formatNumber(total)} kWh`} caption="Estimativa dos equipamentos" icon={Activity} /><StatCard label="Potencial de redução" value={`${formatNumber(potential)} kWh`} caption="Cenário indicativo de 10%" icon={CircleDollarSign} accent="amber" /><StatCard label="Meta mensal" value={`${formatNumber(target)} kWh`} caption="Ajustável em configurações" icon={Gauge} accent="blue" /></section>
       <section className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-5 sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Acompanhamento</p><h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.035em]">Uso frente à sua meta</h2></div><span className="font-data text-sm font-medium text-[#1e6fff]">{formatNumber(progress)}%</span></div><div className="mt-6 h-3 overflow-hidden rounded-full bg-[#d7ebff]"><div className="h-full rounded-full bg-[#1e6fff] transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{total ? 'Use esta referência para decidir onde investigar primeiro. Uma redução real deve ser confirmada com a sua medição ou fatura.' : 'Cadastre equipamentos na área de consumo para começar a acompanhar uma base real.'}</p></section>
      <section className="grid gap-4 md:grid-cols-2">{['Desligue cargas em espera quando não forem necessárias.', 'Compare o tempo de uso antes de trocar um equipamento.', 'Registre a potência nominal do equipamento, não uma estimativa.', 'Valide qualquer economia com uma leitura ou fatura real.'].map((tip, index) => <div key={tip} className="flex gap-3 rounded-2xl border border-[#c9dcf2] bg-[#eaf2ff] p-5"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white font-data text-xs font-bold text-[#004eba]">{String(index + 1).padStart(2, '0')}</span><p className="text-sm leading-6 text-[#476788]">{tip}</p></div>)}</section>
    </div>
  );
}

export function HistoryPage({ calculations, clearCalculations }: { calculations: CalculationRecord[]; clearCalculations: () => void }) {
  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Memória de trabalho" title="Histórico" description="Reveja os resultados que você decidiu guardar e use-os como referência para seus próximos diagnósticos." action={calculations.length ? <button onClick={() => { if (window.confirm('Limpar todo o histórico salvo neste dispositivo?')) clearCalculations(); }} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-[#efcfcc] bg-white px-4 py-3 text-sm font-bold text-[#b04f4c] transition hover:bg-[#fff5f4]"><Trash2 size={16} /> Limpar histórico</button> : undefined} />
      <div className="soft-shadow overflow-hidden rounded-2xl border border-[hsl(var(--card-border))] bg-white">{calculations.length ? <div className="divide-y divide-[hsl(var(--border))]">{calculations.map((record) => <CalculationRow key={record.id} record={record} detailed />)}</div> : <div className="p-6"><EmptyState icon={History} title="Nenhum cálculo salvo" description="Depois de calcular, selecione “Salvar no histórico” para encontrar o resultado aqui." href="/app/calculator" action="Abrir calculadora" /></div>}</div>
    </div>
  );
}

export function ReportsPage({ calculations, devices }: { calculations: CalculationRecord[]; devices: EnergyDevice[] }) {
  const [message, setMessage] = useState('');
  const exportCsv = () => {
    const rows = [['tipo', 'resultado', 'unidade', 'formula', 'data'], ...calculations.map((item) => [calculationMeta[item.type].label, String(item.result), item.unit, item.formula, item.createdAt])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'voltiva-relatorio.csv';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setMessage('Relatório exportado em CSV.');
  };
  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Saída de dados" title="Relatórios" description="Exporte um resumo dos seus registros para continuar a análise fora da Voltiva." action={<button onClick={exportCsv} disabled={!calculations.length} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#004eba] disabled:cursor-not-allowed disabled:opacity-50"><Download size={16} /> Exportar CSV</button>} />
      {message && <p className="rounded-xl border border-[#cde4df] bg-[#eef8f5] px-4 py-3 text-sm font-semibold text-[#287b76]" role="status">{message}</p>}
      <section className="grid gap-5 md:grid-cols-2"><div className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e6f0ff] text-[#004eba]"><BarChart3 size={18} /></span><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Resumo</p><h2 className="mt-1 font-display text-xl font-semibold">{calculations.length} cálculos salvos</h2></div></div><p className="mt-5 text-sm leading-6 text-[hsl(var(--muted-foreground))]">O arquivo contém os resultados e as fórmulas aplicadas, sem alterar os dados originais.</p></div><div className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#dff5ff] text-[#16658e]"><Gauge size={18} /></span><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Consumo</p><h2 className="mt-1 font-display text-xl font-semibold">{devices.length} equipamentos</h2></div></div><p className="mt-5 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Os equipamentos cadastrados ficam disponíveis na área de consumo para revisão.</p></div></section>
    </div>
  );
}

export function SettingsPage({ profile, onEditProfile, data, userEmail, onSignOut }: { profile: EnergyProfile | null; onEditProfile: () => void; data: VoltivaData; userEmail: string; onSignOut: () => void }) {
  const [goal, setGoal] = useState(String(data.settings.monthlyGoal));
  const saveGoal = () => { const value = Number(goal.replace(',', '.')); if (Number.isFinite(value) && value > 0) data.updateSettings({ monthlyGoal: value }); };
  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Conta e preferências" title="Configurações" description="Mantenha seus dados de contexto e preferências de acompanhamento sob controle." />
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-6 sm:p-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e9f0fb] text-[#37669d]"><UserRound size={18} /></span><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Conta</p><h2 className="mt-1 font-display text-xl font-semibold">Seu perfil Voltiva</h2></div></div><p className="mt-5 text-sm text-[hsl(var(--muted-foreground))]">{userEmail || 'Conta autenticada'}</p><button onClick={onEditProfile} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-xl border border-[#c4ddda] px-4 py-2.5 text-sm font-bold text-[#287873] transition hover:bg-[#f3fbf9]">Editar perfil energético <ArrowRight size={15} /></button></div>
        <div className="soft-shadow rounded-2xl border border-[hsl(var(--card-border))] bg-white p-6 sm:p-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#dff5ff] text-[#16658e]"><Gauge size={18} /></span><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Preferência</p><h2 className="mt-1 font-display text-xl font-semibold">Meta mensal de consumo</h2></div></div><div className="mt-5 flex items-center gap-3"><input value={goal} onChange={(event) => setGoal(event.target.value)} inputMode="decimal" className="focus-ring h-12 min-w-0 flex-1 rounded-lg border border-[hsl(var(--input))] px-4 font-data text-sm outline-none focus:border-[#1e6fff]" /><span className="font-data text-xs text-[hsl(var(--muted-foreground))]">kWh</span><button onClick={saveGoal} className="focus-ring rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#004eba]"><Check size={16} /></button></div><p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Essa meta também orienta as dicas exibidas na sua dashboard e a página Economia.</p></div>
      </section>
      <section className="rounded-2xl border border-[#efd0cd] bg-[#fff7f6] p-6"><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#b04f4c]">Sessão</p><h2 className="mt-2 font-display text-xl font-semibold text-[#763d3b]">Sair da Voltiva</h2><p className="mt-2 text-sm leading-6 text-[#93615f]">Você poderá entrar novamente com seu e-mail e senha. Seus registros locais permanecem neste dispositivo.</p><button onClick={onSignOut} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-xl border border-[#e4b8b5] bg-white px-4 py-2.5 text-sm font-bold text-[#b04f4c] transition hover:bg-[#fff1ef]">Encerrar sessão</button></section>
      {profile && <div className="text-xs text-[hsl(var(--muted-foreground))]">Objetivo: <strong>{goalLabels[profile.goal]}</strong> · {profile.interests.map((interest) => interestLabels[interest]).join(' · ')}</div>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, suffix, inputMode = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; suffix?: string; inputMode?: 'text' | 'decimal' | 'numeric' }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span><div className="flex h-12 items-center rounded-lg border border-[hsl(var(--input))] bg-white focus-within:border-[#006bff] focus-within:ring-4 focus-within:ring-[#006bff1f]"><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode} className="focus-ring h-full min-w-0 flex-1 rounded-lg bg-transparent px-4 text-sm font-semibold outline-none placeholder:text-[#a6bbd1]" />{suffix && <span className="pr-4 font-data text-xs text-[hsl(var(--muted-foreground))]">{suffix}</span>}</div></label>;
}

function CalculationRow({ record, detailed = false }: { record: CalculationRecord; detailed?: boolean }) {
  return <motion.div whileHover={{ x: 4, backgroundColor: 'rgba(234,242,255,.45)' }} transition={{ duration: 0.2 }} className="flex flex-col gap-3 rounded-xl px-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#e6f0ff] font-data text-xs font-bold text-[#1e6fff]">{calculationMeta[record.type].symbol}</span><div><p className="text-sm font-bold">{calculationMeta[record.type].label}</p><p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{detailed ? record.formula : 'Fórmula de Ohm'} · {new Date(record.createdAt).toLocaleDateString('pt-BR')}</p></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><span className="font-data text-base font-medium text-[#004eba]">{formatNumber(record.result)} {record.unit}</span>{detailed && <span className="hidden rounded-full bg-[#e6f0ff] px-2 py-1 text-[10px] font-bold text-[#1e6fff] sm:inline">Salvo</span>}</div></motion.div>;
}

function DeviceRow({ device, onRemove }: { device: EnergyDevice; onRemove: () => void }) {
  return <motion.div whileHover={{ x: 4, borderColor: '#9fc8c5' }} transition={{ duration: 0.2 }} className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[#fbfdff] p-3"><span className="grid size-9 place-items-center rounded-lg bg-[#dff5ff] text-[#16658e]"><Zap size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{device.name}</p><p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{device.watts} W · {device.hoursPerDay} h/dia · {formatNumber(deviceMonthlyKwh(device))} kWh/mês</p></div><button onClick={onRemove} className="focus-ring rounded-lg p-2 text-[#b47b78] transition hover:bg-[#fff0ee] hover:text-[#b04f4c]" aria-label={`Remover ${device.name}`}><Trash2 size={15} /></button></motion.div>;
}

function EmptyState({ icon: Icon, title, description, href, action }: { icon: typeof Activity; title: string; description: string; href?: string; action?: string }) {
  return <div className="flex min-h-44 flex-col items-center justify-center text-center"><span className="grid size-12 place-items-center rounded-2xl bg-[#e6f0ff] text-[#1e6fff]"><Icon size={21} /></span><h3 className="mt-4 font-display text-lg font-semibold">{title}</h3><p className="mt-1 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p>{href && action && <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]">{action} <ArrowRight size={15} /></Link>}</div>;
}