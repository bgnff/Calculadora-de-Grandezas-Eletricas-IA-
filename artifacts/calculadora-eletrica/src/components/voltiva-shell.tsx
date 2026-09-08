import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Bolt,
  Calculator,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  LayoutDashboard,
  Menu,
  Settings2,
  X,
} from 'lucide-react';

interface VoltivaShellProps {
  children: ReactNode;
  onEditProfile?: () => void;
  profileIncomplete?: boolean;
  onResumeProfile?: () => void;
}

const navItems = [
  { label: 'Visão geral', icon: LayoutDashboard },
  { label: 'Calculadora elétrica', icon: Calculator },
  { label: 'Consumo de energia', icon: Activity },
  { label: 'Economia', icon: CircleDollarSign },
  { label: 'Histórico', icon: Clock3 },
  { label: 'Relatórios', icon: FileText },
];

export function VoltivaShell({ children, onEditProfile, profileIncomplete = false, onResumeProfile }: VoltivaShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const reducedMotion = Boolean(useReducedMotion());

  const showComingSoon = (label: string) => {
    setNotice(`${label} estará disponível em uma próxima versão.`);
    setMobileOpen(false);
    window.setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="flex min-h-[100dvh] bg-transparent text-foreground">
      <aside className="hidden w-[252px] shrink-0 flex-col bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] md:flex">
        <SidebarContent onNavigate={showComingSoon} onEditProfile={onEditProfile} reducedMotion={reducedMotion} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[#102537]/45 md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar menu"
              data-testid="button-close-mobile-menu-overlay"
            />
            <motion.aside
              initial={{ x: -270 }}
              animate={{ x: 0 }}
              exit={{ x: -270 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] md:hidden"
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white" data-testid="button-close-mobile-menu">
                  <X size={19} />
                </button>
              </div>
               <SidebarContent onNavigate={showComingSoon} onEditProfile={onEditProfile} reducedMotion={reducedMotion} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[hsl(var(--border))] bg-[#f9fbfb]/90 px-5 backdrop-blur-xl md:px-9">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] md:hidden" aria-label="Abrir menu" data-testid="button-open-mobile-menu">
              <Menu size={21} />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <span className="grid size-8 place-items-center rounded-lg bg-[hsl(var(--primary))] text-white"><Bolt size={17} fill="currentColor" /></span>
              <span className="font-display text-lg font-bold tracking-tight text-[hsl(var(--foreground))]">voltiva</span>
            </div>
            <div className="hidden items-center gap-2 text-sm md:flex">
              <span className="text-[hsl(var(--muted-foreground))]">Espaço de trabalho</span>
              <ChevronRight size={15} className="text-[hsl(var(--muted-foreground))]" />
              <span className="font-semibold text-[hsl(var(--foreground))]">Calculadora elétrica</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#cce3df] bg-[#f0faf7] px-3 py-1.5 text-xs font-semibold text-[#267867] sm:flex">
              <span className="size-1.5 rounded-full bg-[#3bab83]" />
              Sistema operacional
            </div>
            <button onClick={onEditProfile ?? (() => showComingSoon('Configurações'))} className="rounded-xl border border-[hsl(var(--border))] bg-white p-2 text-[hsl(var(--muted-foreground))] shadow-sm transition hover:border-[#a8c6c3] hover:text-[hsl(var(--primary))]" aria-label="Editar perfil" data-testid="button-open-settings">
              <Settings2 size={18} />
            </button>
            <div className="grid size-9 place-items-center rounded-full bg-[#d9edf0] text-sm font-bold text-[#17617a]" aria-label="Perfil de usuário" data-testid="avatar-user">MC</div>
          </div>
        </header>

        <main className="voltiva-grid relative flex-1 overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-7 md:px-9 md:py-10">
            {profileIncomplete && onResumeProfile && (
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#d8e3df] bg-[#f2f8f6] p-4 sm:flex-row sm:items-center sm:justify-between" data-testid="banner-profile-paused">
                <div>
                  <p className="text-sm font-bold text-[#27736d]">Seu perfil está pausado</p>
                  <p className="mt-1 text-xs leading-5 text-[#5c7e7b]">As respostas estão salvas neste dispositivo. Retome quando quiser para concluir o perfil.</p>
                </div>
                <button onClick={onResumeProfile} className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#277d7a] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1d6968]" data-testid="button-resume-profile">
                  Retomar perfil <ChevronRight size={15} />
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
      <AnimatePresence>
        {notice && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[hsl(var(--sidebar))] px-4 py-3 text-sm font-medium text-white shadow-xl" role="status" data-testid="status-coming-soon">
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({ onNavigate, onEditProfile, reducedMotion }: { onNavigate: (label: string) => void; onEditProfile?: () => void; reducedMotion: boolean }) {
  return (
    <>
      <div className="flex h-[72px] items-center gap-3 border-b border-white/10 px-7">
        <span className="grid size-9 place-items-center rounded-xl bg-[#2cc5cb] text-[#102f43] shadow-[0_0_0_5px_rgba(44,197,203,.12)]">
          <Bolt size={19} fill="currentColor" strokeWidth={2.4} />
        </span>
        <span className="font-display text-[22px] font-bold tracking-[-0.04em] text-white">voltiva</span>
      </div>
      <div className="flex flex-1 flex-col px-4 py-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Navegação</p>
        <nav className="space-y-1" aria-label="Navegação principal">
          {navItems.map(({ label, icon: Icon }) => (
            label === 'Calculadora elétrica' ? (
              <motion.div
                key={label}
                layoutId="active-nav"
                transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 34 }}
                className="mt-1 flex items-center gap-3 rounded-xl bg-[#2b647b] px-3 py-2.5 text-[13px] font-semibold text-white shadow-[inset_3px_0_0_#55d8d4]"
                aria-current="page"
                data-testid="nav-calculadora-ativa"
              >
                <Icon size={17} className="text-[#66e1dd]" />
                {label}
              </motion.div>
            ) : (
              <motion.button
                key={label}
                onClick={() => onNavigate(label)}
                whileHover={reducedMotion ? undefined : { x: 2 }}
                whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-white/65 transition-colors hover:text-white"
                data-testid={`button-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
              >
                <span className="absolute inset-1 rounded-[10px] bg-white/[.08] opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
                <Icon size={17} strokeWidth={1.8} className="relative text-white/45 transition-colors duration-200 group-hover:text-[#5bd9d7]" />
                <span className="relative">{label}</span>
              </motion.button>
            )
          ))}
        </nav>
        <div className="my-7 h-px bg-white/10" />
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Gerencie</p>
        <button onClick={onEditProfile ?? (() => onNavigate('Configurações'))} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-white/65 transition hover:bg-white/8 hover:text-white" data-testid="button-nav-configuracoes">
          <Settings2 size={17} strokeWidth={1.8} className="text-white/45 group-hover:text-[#5bd9d7]" />
          Configurações
        </button>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.06] p-4">
          <div className="mb-3 flex items-center gap-2 text-[#73e5dd]"><span className="grid size-7 place-items-center rounded-lg bg-[#2b7a84]/50"><Bolt size={14} fill="currentColor" /></span><span className="text-xs font-bold">Dica Voltiva</span></div>
          <p className="text-[11px] leading-relaxed text-white/55">Use a calculadora para validar uma grandeza antes de fechar seu diagnóstico.</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-7 py-5 text-[11px] text-white/40">Voltiva <span className="mx-1">·</span> v1.0</div>
    </>
  );
}