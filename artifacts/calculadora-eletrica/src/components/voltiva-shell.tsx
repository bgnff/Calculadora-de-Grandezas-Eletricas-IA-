import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { useClerk, useUser } from '@clerk/react';
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
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
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
  { label: 'Visão geral', icon: LayoutDashboard, path: '/app/dashboard' },
  { label: 'Calculadora elétrica', icon: Calculator, path: '/app/calculator' },
  { label: 'Consumo de energia', icon: Activity, path: '/app/consumption' },
  { label: 'Economia', icon: CircleDollarSign, path: '/app/savings' },
  { label: 'Histórico', icon: Clock3, path: '/app/history' },
  { label: 'Relatórios', icon: FileText, path: '/app/reports' },
];

export function VoltivaShell({ children, onEditProfile, profileIncomplete = false, onResumeProfile }: VoltivaShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const reducedMotion = Boolean(useReducedMotion());
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const activeLabel = navItems.find((item) => location === item.path)?.label ?? 'Visão geral';
  const firstName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Conta';
  const initials = (user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0] || 'V').toUpperCase();
  return (
    <div className="flex min-h-[100dvh] bg-transparent text-foreground">
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 76 : 252 }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 30 }}
        className="relative hidden min-h-[100dvh] shrink-0 overflow-hidden rounded-r-[28px] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] md:flex"
        aria-label="Navegação principal"
      >
        <motion.div
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
          className={`h-full ${sidebarCollapsed ? 'min-w-[76px]' : 'min-w-[252px]'}`}
        >
          <SidebarContent collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((current) => !current)} onEditProfile={onEditProfile} reducedMotion={reducedMotion} activePath={location} onClose={() => setMobileOpen(false)} onSignOut={() => signOut({ redirectUrl: '/' })} />
        </motion.div>
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
               className="fixed inset-0 z-40 bg-[#0b1f3b]/55 backdrop-blur-[2px] md:hidden"
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
                <SidebarContent collapsed={false} onEditProfile={onEditProfile} reducedMotion={reducedMotion} activePath={location} onClose={() => setMobileOpen(false)} onSignOut={() => signOut({ redirectUrl: '/' })} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
         <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[hsl(var(--border))] bg-[#f5f7fa]/95 px-5 backdrop-blur-xl md:px-9">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] md:hidden" aria-label="Abrir menu" data-testid="button-open-mobile-menu">
              <Menu size={21} />
            </button>
             <div className="flex items-center gap-2 md:hidden">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="size-8 object-contain" />
              <span className="font-display text-lg font-bold tracking-tight text-[hsl(var(--foreground))]">voltiva</span>
            </div>
             <div className="hidden items-center gap-2 text-sm md:flex">
               <span className="font-display text-base text-[hsl(var(--muted-foreground))]">Espaço de trabalho</span>
              <ChevronRight size={15} className="text-[hsl(var(--muted-foreground))]" />
               <span className="font-display text-base text-[hsl(var(--foreground))]">{activeLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
               <div className="hidden items-center gap-2 rounded-full border border-[#d7ebff] bg-[#d7ebff] px-3 py-1.5 text-xs font-semibold text-[#0b1f3b] sm:flex">
                <span className="size-1.5 rounded-full bg-[#ffc107]" />
              Sistema operacional
            </div>
             <button onClick={onEditProfile} className="rounded-xl border border-[hsl(var(--border))] bg-white p-2 text-[hsl(var(--muted-foreground))] transition hover:border-[#9bbce0] hover:text-[hsl(var(--primary))]" aria-label="Editar perfil" data-testid="button-open-settings">
              <Settings2 size={18} />
            </button>
            <div className="grid size-9 place-items-center rounded-full bg-[#d9edf0] text-sm font-bold text-[#17617a]" aria-label={`Perfil de ${firstName}`} data-testid="avatar-user">{initials}</div>
          </div>
        </header>

        <main className="voltiva-grid relative flex-1 overflow-hidden">
           <div className="mx-auto w-full max-w-[1440px] px-5 py-8 md:px-9 md:py-10">
            {profileIncomplete && onResumeProfile && (
                <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#d7ebff] bg-[#d7ebff] p-4 sm:flex-row sm:items-center sm:justify-between" data-testid="banner-profile-paused">
                <div>
                   <p className="text-sm font-bold text-[#0b1f3b]">Seu perfil está pausado</p>
                   <p className="mt-1 text-xs leading-5 text-[#64748b]">As respostas estão salvas neste dispositivo. Retome quando quiser para concluir o perfil.</p>
                </div>
                  <button onClick={onResumeProfile} className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1e6fff] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1557d6]" data-testid="button-resume-profile">
                  Retomar perfil <ChevronRight size={15} />
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ collapsed, onToggleCollapsed, onEditProfile, reducedMotion, activePath, onClose, onSignOut }: { collapsed: boolean; onToggleCollapsed?: () => void; onEditProfile?: () => void; reducedMotion: boolean; activePath: string; onClose: () => void; onSignOut: () => void }) {
  return (
    <>
      <div className={`flex h-[72px] items-center border-b border-white/10 ${collapsed ? 'justify-center gap-1 px-1' : 'justify-between px-5'}`}>
        <div className="flex min-w-0 items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="size-9 shrink-0 object-contain" />
          <span className={`overflow-hidden whitespace-nowrap font-display text-[22px] font-bold tracking-[-0.04em] text-white transition-all duration-300 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[120px] opacity-100'}`}>voltiva</span>
        </div>
        {onToggleCollapsed && (
          <button
            onClick={onToggleCollapsed}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-white"
            aria-label={collapsed ? 'Expandir barra lateral' : 'Minimizar barra lateral'}
            title={collapsed ? 'Expandir barra lateral' : 'Minimizar barra lateral'}
            data-testid="button-toggle-sidebar"
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        )}
      </div>
      <div className={`flex flex-1 flex-col py-7 transition-[padding] duration-300 ${collapsed ? 'px-2' : 'px-4'}`}>
        <p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 transition-opacity duration-200 ${collapsed ? 'pointer-events-none h-0 overflow-hidden opacity-0' : 'opacity-100'}`}>Navegação</p>
        <nav className="space-y-1" aria-label="Navegação principal">
          {navItems.map(({ label, icon: Icon, path }) => (
            activePath === path ? (
               <motion.div
                key={label}
                layoutId="active-nav"
                 whileHover={reducedMotion ? undefined : { x: 3 }}
                 whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 34 }}
                  className={`group relative mt-1 flex items-center rounded-xl bg-[#1e6fff] py-2.5 text-[13px] font-semibold text-white shadow-[inset_3px_0_0_#ffc107,0_8px_20px_rgba(30,111,255,.2)] transition-all duration-300 ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`}
                aria-current="page"
                  title={collapsed ? label : undefined}
                data-testid={`nav-${label.toLowerCase().replaceAll(' ', '-')}-ativa`}
              >
                  <motion.span animate={reducedMotion ? undefined : { rotate: [0, -5, 0], scale: [1, 1.08, 1] }} transition={{ duration: 0.5 }}>
                    <Icon size={17} className="text-[#ffc107]" />
                  </motion.span>
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[170px] opacity-100'}`}>{label}</span>
              </motion.div>
            ) : (
              <motion.div
                key={label}
                whileHover={reducedMotion ? undefined : { x: 2 }}
                whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                className="relative"
              >
                  <Link href={path} onClick={onClose} title={collapsed ? label : undefined} className={`group relative flex w-full items-center overflow-hidden rounded-xl py-2.5 text-left text-[13px] font-medium text-white/65 transition-all duration-300 hover:text-white ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`} data-testid={`button-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
                  <span className="absolute inset-1 rounded-[10px] bg-white/[.08] opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
                    <Icon size={17} strokeWidth={1.8} className="relative text-white/45 transition-colors duration-200 group-hover:text-[#ffc107]" />
                  <span className={`relative overflow-hidden whitespace-nowrap transition-all duration-200 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[170px] opacity-100'}`}>{label}</span>
                </Link>
              </motion.div>
            )
          ))}
        </nav>
        <div className={`my-7 h-px bg-white/10 ${collapsed ? 'mx-1' : ''}`} />
        <p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 transition-opacity duration-200 ${collapsed ? 'pointer-events-none h-0 overflow-hidden opacity-0' : 'opacity-100'}`}>Gerencie</p>
        <button onClick={onEditProfile} title={collapsed ? 'Configurações' : undefined} className={`group flex w-full items-center rounded-xl py-2.5 text-left text-[13px] font-medium text-white/65 transition-all duration-300 hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`} data-testid="button-nav-configuracoes">
            <Settings2 size={17} strokeWidth={1.8} className="text-white/45 group-hover:text-[#ffc107]" />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[170px] opacity-100'}`}>Configurações</span>
        </button>
        <button onClick={onSignOut} title={collapsed ? 'Sair da conta' : undefined} className={`group mt-1 flex w-full items-center rounded-xl py-2.5 text-left text-[13px] font-medium text-white/65 transition-all duration-300 hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`} data-testid="button-sign-out">
            <LogOut size={17} strokeWidth={1.8} className="text-white/45 group-hover:text-[#ffc107]" />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[170px] opacity-100'}`}>Sair da conta</span>
        </button>
        <div className={`mt-auto overflow-hidden rounded-2xl border border-white/10 bg-white/[.06] transition-all duration-300 ${collapsed ? 'max-h-0 border-transparent p-0 opacity-0' : 'max-h-40 p-4 opacity-100'}`}>
           <div className="mb-3 flex items-center gap-2 text-[#d7ebff]"><span className="grid size-7 place-items-center rounded-lg bg-[#1e6fff]/30 text-[#ffc107]"><Bolt size={14} fill="currentColor" /></span><span className="text-xs font-bold">Dica Voltiva</span></div>
          <p className="text-[11px] leading-relaxed text-white/55">Use a calculadora para validar uma grandeza antes de fechar seu diagnóstico.</p>
        </div>
      </div>
      <div className={`overflow-hidden border-t border-white/10 py-5 text-center text-[11px] text-white/40 transition-all duration-300 ${collapsed ? 'px-1 text-[0px]' : 'px-7'}`}>Voltiva <span className={`mx-1 ${collapsed ? 'hidden' : ''}`}>·</span> <span className={collapsed ? 'hidden' : ''}>v1.0</span></div>
    </>
  );
}