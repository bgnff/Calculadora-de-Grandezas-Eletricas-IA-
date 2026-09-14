import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar001 } from '@/components/unlumen-ui/sidebar-001';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
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
  Search,
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
  const [location] = useLocation();
  const { user, signOut, isConfigured, isGuest } = useAuth();
  const activeLabel = navItems.find((item) => location === item.path)?.label ?? 'Visão geral';
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Conta';
  const initials = (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'V').toUpperCase();
  return (
    <div className="flex min-h-[100dvh] bg-transparent text-foreground">
      <Sidebar001
        controlledWidth={sidebarCollapsed ? 76 : 252}
        resizable={false}
        className="sticky top-3 hidden h-[calc(100dvh-1.5rem)] overflow-hidden rounded-[28px] border border-[#d8e0ea] bg-white text-[#0b1f3b] shadow-[0_10px_30px_rgba(11,31,59,.08)] md:flex"
        aria-label="Navegação principal"
      >
        <SidebarContent collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((current) => !current)} onEditProfile={onEditProfile} activePath={location} onClose={() => setMobileOpen(false)} onSignOut={() => signOut()} firstName={firstName} initials={initials} />
      </Sidebar001>

      {mobileOpen && (
        <>
            <button
              className="fixed inset-0 z-40 bg-[#0b1f3b]/55 backdrop-blur-[2px] md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar menu"
              data-testid="button-close-mobile-menu-overlay"
            />
            <aside
              className="fixed inset-y-3 left-3 z-50 flex w-[270px] flex-col overflow-hidden rounded-[28px] border border-[#d8e0ea] bg-white text-[#0b1f3b] shadow-[0_16px_40px_rgba(11,31,59,.16)] md:hidden"
            >
              <div className="flex justify-end px-4 pt-4">
                <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="cursor-pointer rounded-lg p-2 text-[#64748b] hover:bg-[#eef4fb] hover:text-[#0b1f3b]" data-testid="button-close-mobile-menu">
                  <X size={19} />
                </button>
              </div>
                <SidebarContent collapsed={false} onEditProfile={onEditProfile} activePath={location} onClose={() => setMobileOpen(false)} onSignOut={() => signOut()} firstName={firstName} initials={initials} />
            </aside>
          </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
         <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[hsl(var(--border))] bg-[#f5f7fa]/95 px-5 backdrop-blur-xl md:px-9">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="cursor-pointer rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] md:hidden" aria-label="Abrir menu" data-testid="button-open-mobile-menu">
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
               <div className="hidden items-center gap-2 rounded-full border border-[#d7ebff] bg-[#d7ebff]/80 px-3 py-1.5 text-xs font-semibold text-[#0b1f3b] sm:flex" title={!isConfigured || isGuest ? 'Armazenamento local no navegador ativo' : 'Sincronizado com Supabase'}>
                <span className={`size-2 rounded-full ${!isConfigured || isGuest ? 'bg-emerald-500' : 'bg-[#1e6fff]'}`} />
                {!isConfigured || isGuest ? 'Modo Local (Offline)' : 'Supabase Conectado'}
            </div>
             <button onClick={onEditProfile} className="cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-white p-2 text-[hsl(var(--muted-foreground))] transition hover:border-[#9bbce0] hover:text-[hsl(var(--primary))]" aria-label="Editar perfil" data-testid="button-open-settings">
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
                  <button onClick={onResumeProfile} className="focus-ring inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1e6fff] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1557d6]" data-testid="button-resume-profile">
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

function SidebarContent({ collapsed, onToggleCollapsed, onEditProfile, activePath, onClose, onSignOut, firstName, initials }: { collapsed: boolean; onToggleCollapsed?: () => void; onEditProfile?: () => void; activePath: string; onClose: () => void; onSignOut: () => void; firstName: string; initials: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top Header */}
      <div
        className={cn(
          "flex h-[72px] shrink-0 items-center border-b border-[#edf1f6] transition-all duration-300",
          collapsed ? "justify-center px-2" : "justify-between px-5"
        )}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="group relative flex size-11 items-center justify-center rounded-xl bg-transparent transition-all duration-300 hover:bg-[#eef4fb] cursor-pointer"
            aria-label="Expandir barra lateral"
            title="Expandir barra lateral"
            data-testid="button-toggle-sidebar"
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Voltiva"
              className="size-8 object-contain transition-all duration-300 group-hover:scale-90 group-hover:opacity-10"
            />
            <span className="absolute inset-0 flex items-center justify-center text-[#1e6fff] opacity-0 scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
              <PanelLeftOpen size={20} strokeWidth={2.2} />
            </span>
          </button>
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Voltiva"
                className="size-9 shrink-0 object-contain"
              />
              <span className="whitespace-nowrap font-display text-[22px] font-bold tracking-[-0.04em] text-[#0b1f3b]">
                voltiva
              </span>
            </div>
            {onToggleCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapsed}
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-[#64748b] transition-colors hover:bg-[#eef4fb] hover:text-[#0b1f3b]"
                aria-label="Minimizar barra lateral"
                title="Minimizar barra lateral"
                data-testid="button-toggle-sidebar"
              >
                <PanelLeftClose size={18} strokeWidth={1.9} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Main Body */}
      <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto py-5 transition-all duration-300 no-scrollbar", collapsed ? "px-2" : "px-3")}>
        {/* Search Bar */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 42, marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="flex h-[42px] items-center gap-2 rounded-xl bg-[#f0f2f5] px-3 text-sm text-[#7a8492]">
                <Search size={17} strokeWidth={1.8} className="shrink-0" />
                <span className="truncate">Buscar no espaço</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Heading */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa8b9]"
            >
              Navegação
            </motion.p>
          )}
        </AnimatePresence>

        {/* Nav List */}
        <nav className="space-y-1.5" aria-label="Navegação principal">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = activePath === path;
            return (
              <div key={label} className="relative">
                <Link
                  href={path}
                  onClick={onClose}
                  title={label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center rounded-xl font-medium transition-all duration-300 cursor-pointer select-none",
                    collapsed
                      ? "mx-auto size-11 justify-center p-0"
                      : "h-11 w-full gap-3 px-3.5 text-[13.5px]",
                    isActive
                      ? "bg-gradient-to-tr from-[#1e6fff] to-[#2e7dff] text-white shadow-[0_4px_16px_rgba(30,111,255,0.32)]"
                      : "text-[#64748b] hover:bg-[#f1f5fb] hover:text-[#1e6fff]"
                  )}
                  data-testid={isActive ? `nav-${label.toLowerCase().replaceAll(' ', '-')}-ativa` : `button-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.9}
                    className={cn(
                      "shrink-0 transition-colors duration-200",
                      isActive ? "text-white" : "text-[#7a8797] group-hover:text-[#1e6fff]"
                    )}
                  />

                  {/* Text label when expanded */}
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden whitespace-nowrap truncate font-medium tracking-tight"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Divider */}
        <div className={cn("my-5 h-px bg-[#edf1f6] transition-all duration-300", collapsed ? "w-9 mx-auto" : "w-full")} />

        {/* Settings Button */}
        <div className="relative">
          <button
            type="button"
            onClick={onEditProfile}
            title="Configurações"
            className={cn(
              "group relative flex items-center rounded-xl font-medium transition-all duration-300 cursor-pointer select-none",
              collapsed
                ? "mx-auto size-11 justify-center p-0"
                : "h-11 w-full gap-3 px-3.5 text-[13.5px]",
              "text-[#64748b] hover:bg-[#f1f5fb] hover:text-[#1e6fff]"
            )}
            data-testid="button-nav-configuracoes"
          >
            <Settings2
              size={18}
              strokeWidth={1.9}
              className="shrink-0 text-[#7a8797] group-hover:text-[#1e6fff] transition-colors duration-200"
            />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden whitespace-nowrap truncate font-medium"
                >
                  Configurações
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Logout Button */}
        <div className="relative mt-1">
          <button
            type="button"
            onClick={onSignOut}
            title="Sair da conta"
            className={cn(
              "group relative flex items-center rounded-xl font-medium transition-all duration-300 cursor-pointer select-none",
              collapsed
                ? "mx-auto size-11 justify-center p-0"
                : "h-11 w-full gap-3 px-3.5 text-[13.5px]",
              "text-[#64748b] hover:bg-[#fff2f1] hover:text-[#e11d48]"
            )}
            data-testid="button-sign-out"
          >
            <LogOut
              size={18}
              strokeWidth={1.9}
              className="shrink-0 text-[#7a8797] group-hover:text-[#e11d48] transition-colors duration-200"
            />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden whitespace-nowrap truncate font-medium"
                >
                  Sair da conta
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-4">
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-[#dbe7f4] bg-[#f6f9fd] p-3">
                  <div className="mb-2 flex items-center gap-2 text-[#0b3558]">
                    <span className="grid size-7 place-items-center rounded-lg bg-[#d7ebff] text-[#004eba]">
                      <Bolt size={14} fill="currentColor" />
                    </span>
                    <span className="text-xs font-bold">Dica Voltiva</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#64748b]">
                    Valide uma grandeza antes de fechar seu diagnóstico.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed ? (
            <div className="relative flex justify-center py-1">
              <button
                type="button"
                onClick={onEditProfile}
                className="group relative flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#8fc9eb] to-[#5baad5] font-bold text-sm text-[#0b3558] shadow-sm ring-2 ring-[#e2e8f0] transition-all duration-300 hover:ring-[#1e6fff] hover:scale-105 cursor-pointer"
                aria-label={`Perfil de ${firstName}`}
                title={`Perfil de ${firstName}`}
                data-testid="avatar-user-collapsed"
              >
                <span>{initials}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onEditProfile}
              className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-2.5 text-left transition-all duration-200 hover:border-[#1e6fff]/40 hover:bg-[#f1f5fb]"
              data-testid="avatar-user-expanded"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8fc9eb] to-[#5baad5] text-sm font-bold text-[#0b3558] shadow-xs ring-1 ring-white">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#0b1f3b]">{firstName}</p>
                <p className="truncate text-[11px] text-[#7a8492]">Espaço Voltiva</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}