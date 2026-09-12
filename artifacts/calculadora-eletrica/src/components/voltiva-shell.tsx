import { useState, type ReactNode } from 'react';
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
  const { user } = useUser();
  const { signOut } = useClerk();
  const activeLabel = navItems.find((item) => location === item.path)?.label ?? 'Visão geral';
  const firstName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Conta';
  const initials = (user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0] || 'V').toUpperCase();
  return (
    <div className="flex min-h-[100dvh] bg-transparent text-foreground">
      <aside
        style={{ width: sidebarCollapsed ? 76 : 252 }}
        className="sticky top-3 hidden h-[calc(100dvh-1.5rem)] shrink-0 overflow-hidden rounded-[28px] border border-[#d8e0ea] bg-white text-[#0b1f3b] shadow-[0_10px_30px_rgba(11,31,59,.08)] md:flex"
        aria-label="Navegação principal"
      >
        <div className={`h-full ${sidebarCollapsed ? 'min-w-[76px]' : 'min-w-[252px]'}`}>
          <SidebarContent collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((current) => !current)} onEditProfile={onEditProfile} activePath={location} onClose={() => setMobileOpen(false)} onSignOut={() => signOut({ redirectUrl: '/' })} firstName={firstName} initials={initials} />
        </div>
      </aside>

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
                <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="rounded-lg p-2 text-[#64748b] hover:bg-[#eef4fb] hover:text-[#0b1f3b]" data-testid="button-close-mobile-menu">
                  <X size={19} />
                </button>
              </div>
                <SidebarContent collapsed={false} onEditProfile={onEditProfile} activePath={location} onClose={() => setMobileOpen(false)} onSignOut={() => signOut({ redirectUrl: '/' })} firstName={firstName} initials={initials} />
            </aside>
          </>
      )}

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

function SidebarContent({ collapsed, onToggleCollapsed, onEditProfile, activePath, onClose, onSignOut, firstName, initials }: { collapsed: boolean; onToggleCollapsed?: () => void; onEditProfile?: () => void; activePath: string; onClose: () => void; onSignOut: () => void; firstName: string; initials: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`flex h-[72px] shrink-0 items-center border-b border-[#edf1f6] ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt=""
            className="size-9 shrink-0 object-contain"
          />
          {!collapsed && <span className="whitespace-nowrap font-display text-[22px] font-bold tracking-[-0.04em] text-[#0b1f3b]">voltiva</span>}
        </div>
        {onToggleCollapsed && (
          <button
            onClick={onToggleCollapsed}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-[#64748b] hover:bg-[#eef4fb] hover:text-[#0b1f3b]"
            aria-label={collapsed ? 'Expandir barra lateral' : 'Minimizar barra lateral'}
            title={collapsed ? 'Expandir barra lateral' : 'Minimizar barra lateral'}
            data-testid="button-toggle-sidebar"
          >
            <span className="grid place-items-center">
              {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            </span>
          </button>
        )}
      </div>

      <div className={`flex min-h-0 flex-1 flex-col overflow-y-auto py-5 ${collapsed ? 'px-2' : 'px-3'}`}>
        {!collapsed && (
            <div className="mb-5 flex h-[42px] shrink-0 items-center gap-2 rounded-xl bg-[#f0f2f5] px-3 text-sm text-[#7a8492]">
              <Search size={17} strokeWidth={1.8} />
              <span>Buscar no espaço</span>
            </div>
        )}

        {!collapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa8b9]">Navegação</p>}
        <nav className="space-y-1" aria-label="Navegação principal">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = activePath === path;
            return isActive ? (
              <div
                key={label}
                className={`group relative flex items-center rounded-xl bg-[#1e6fff] py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(30,111,255,.2)] ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`}
                aria-current="page"
                title={collapsed ? label : undefined}
                data-testid={`nav-${label.toLowerCase().replaceAll(' ', '-')}-ativa`}
              >
                <span className="grid place-items-center">
                  <Icon size={17} className="text-white" />
                </span>
                {!collapsed && <span className="whitespace-nowrap">{label}</span>}
              </div>
            ) : (
              <div
                key={label}
                className="relative"
              >
                <Link
                  href={path}
                  onClick={onClose}
                  title={collapsed ? label : undefined}
                  className={`group relative flex w-full items-center rounded-xl py-2.5 text-left text-[13px] font-medium text-[#687587] hover:bg-[#f1f5fb] hover:text-[#0b1f3b] ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`}
                  data-testid={`button-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
                >
                  <Icon size={17} strokeWidth={1.8} className="relative shrink-0 text-[#8b98a8] group-hover:text-[#1e6fff]" />
                  {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className={`my-6 h-px bg-[#edf1f6] ${collapsed ? 'mx-1' : ''}`} />
        <button
          onClick={onEditProfile}
          title={collapsed ? 'Configurações' : undefined}
          className={`group flex w-full items-center rounded-xl py-2.5 text-left text-[13px] font-medium text-[#687587] hover:bg-[#f1f5fb] hover:text-[#0b1f3b] ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`}
          data-testid="button-nav-configuracoes"
        >
          <Settings2 size={17} strokeWidth={1.8} className="shrink-0 text-[#8b98a8] group-hover:text-[#1e6fff]" />
          {!collapsed && <span className="whitespace-nowrap">Configurações</span>}
        </button>
        <button
          onClick={onSignOut}
          title={collapsed ? 'Sair da conta' : undefined}
          className={`group mt-1 flex w-full items-center rounded-xl py-2.5 text-left text-[13px] font-medium text-[#687587] hover:bg-[#fff2f1] hover:text-[#b04f4c] ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`}
          data-testid="button-sign-out"
        >
          <LogOut size={17} strokeWidth={1.8} className="shrink-0 text-[#8b98a8] group-hover:text-[#b04f4c]" />
          {!collapsed && <span className="whitespace-nowrap">Sair da conta</span>}
        </button>

        <div className="mt-auto pt-5">
          {!collapsed && (
              <div className="mb-3 rounded-2xl border border-[#dbe7f4] bg-[#f6f9fd] p-3">
                <div className="mb-2 flex items-center gap-2 text-[#0b3558]">
                  <span className="grid size-7 place-items-center rounded-lg bg-[#d7ebff] text-[#004eba]"><Bolt size={14} fill="currentColor" /></span>
                  <span className="text-xs font-bold">Dica Voltiva</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#64748b]">Valide uma grandeza antes de fechar seu diagnóstico.</p>
              </div>
          )}

          <div className={`flex items-center rounded-2xl border border-[#e2e8f0] bg-[#f1f4f8] ${collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'}`}>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#8fc9eb] text-sm font-bold text-[#0b3558]">{initials}</span>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-[#0b1f3b]">{firstName}</p>
                <p className="truncate text-[11px] text-[#7a8492]">Espaço Voltiva</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}