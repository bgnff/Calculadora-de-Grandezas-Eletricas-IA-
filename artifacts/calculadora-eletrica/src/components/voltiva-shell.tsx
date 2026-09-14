import { useState, useMemo, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar001 } from '@/components/unlumen-ui/sidebar-001';
import { cn } from '@/lib/utils';
import {
  Activity,
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
      {/* Desktop Sidebar */}
      <Sidebar001
        controlledWidth={sidebarCollapsed ? 76 : 252}
        resizable={false}
        className="sticky top-3 hidden h-[calc(100dvh-1.5rem)] overflow-hidden rounded-[28px] border border-[#d8e0ea] bg-white text-[#0b1f3b] shadow-[0_10px_30px_rgba(11,31,59,.08)] md:flex"
        aria-label="Navegação principal"
      >
        <SidebarContent
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
          onEditProfile={onEditProfile}
          activePath={location}
          onClose={() => setMobileOpen(false)}
          onSignOut={() => signOut()}
          firstName={firstName}
          initials={initials}
        />
      </Sidebar001>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <button
            className="fixed inset-0 z-40 bg-[#0b1f3b]/55 backdrop-blur-[2px] md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
            data-testid="button-close-mobile-menu-overlay"
          />
          <aside className="fixed inset-y-3 left-3 z-50 flex w-[270px] flex-col overflow-hidden rounded-[28px] border border-[#d8e0ea] bg-white text-[#0b1f3b] shadow-[0_16px_40px_rgba(11,31,59,.16)] md:hidden">
            <SidebarContent
              collapsed={false}
              onEditProfile={onEditProfile}
              activePath={location}
              onClose={() => setMobileOpen(false)}
              onSignOut={() => signOut()}
              firstName={firstName}
              initials={initials}
              isMobile={true}
            />
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[hsl(var(--border))] bg-[#f5f7fa]/95 px-5 backdrop-blur-xl md:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="cursor-pointer rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] md:hidden"
              aria-label="Abrir menu"
              data-testid="button-open-mobile-menu"
            >
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
            <div
              className="hidden items-center gap-2 rounded-full border border-[#d7ebff] bg-[#d7ebff]/80 px-3 py-1.5 text-xs font-semibold text-[#0b1f3b] sm:flex"
              title={!isConfigured || isGuest ? 'Armazenamento local no navegador ativo' : 'Sincronizado com Supabase'}
            >
              <span className={`size-2 rounded-full ${!isConfigured || isGuest ? 'bg-emerald-500' : 'bg-[#1e6fff]'}`} />
              {!isConfigured || isGuest ? 'Modo Local (Offline)' : 'Supabase Conectado'}
            </div>
            <button
              onClick={onEditProfile}
              className="cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-white p-2 text-[hsl(var(--muted-foreground))] transition hover:border-[#9bbce0] hover:text-[hsl(var(--primary))]"
              aria-label="Editar perfil"
              data-testid="button-open-settings"
            >
              <Settings2 size={18} />
            </button>
            <div
              className="grid size-9 place-items-center rounded-full bg-[#d9edf0] text-sm font-bold text-[#17617a]"
              aria-label={`Perfil de ${firstName}`}
              data-testid="avatar-user"
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="voltiva-grid relative flex-1 overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-8 md:px-9 md:py-10">
            {profileIncomplete && onResumeProfile && (
              <div
                className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#d7ebff] bg-[#d7ebff] p-4 sm:flex-row sm:items-center sm:justify-between"
                data-testid="banner-profile-paused"
              >
                <div>
                  <p className="text-sm font-bold text-[#0b1f3b]">Seu perfil está pausado</p>
                  <p className="mt-1 text-xs leading-5 text-[#64748b]">
                    As respostas estão salvas neste dispositivo. Retome quando quiser para concluir o perfil.
                  </p>
                </div>
                <button
                  onClick={onResumeProfile}
                  className="focus-ring inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1e6fff] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1557d6]"
                  data-testid="button-resume-profile"
                >
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

function SidebarContent({
  collapsed,
  onToggleCollapsed,
  onEditProfile,
  activePath,
  onClose,
  onSignOut,
  firstName,
  initials,
  isMobile = false,
}: {
  collapsed: boolean;
  onToggleCollapsed?: () => void;
  onEditProfile?: () => void;
  activePath: string;
  onClose: () => void;
  onSignOut: () => void;
  firstName: string;
  initials: string;
  isMobile?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return navItems;
    const q = searchQuery.toLowerCase().trim();
    return navItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top Header */}
      <div
        className={cn(
          'flex h-[72px] shrink-0 items-center border-b border-[#edf1f6] transition-all duration-200',
          collapsed ? 'justify-center px-2' : 'justify-between px-5'
        )}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="group relative flex size-11 cursor-pointer items-center justify-center rounded-xl bg-transparent transition-all duration-200 hover:bg-[#eef4fb]"
            aria-label="Expandir barra lateral"
            title="Expandir barra lateral"
            data-testid="button-toggle-sidebar"
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Voltiva"
              className="size-8 object-contain transition-all duration-200 group-hover:scale-90 group-hover:opacity-10"
            />
            <span className="absolute inset-0 flex scale-75 items-center justify-center text-[#1e6fff] opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
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
            {isMobile ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar menu"
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-[#64748b] transition-colors hover:bg-[#eef4fb] hover:text-[#0b1f3b]"
                data-testid="button-close-mobile-menu"
              >
                <X size={19} />
              </button>
            ) : onToggleCollapsed ? (
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
            ) : null}
          </>
        )}
      </div>

      {/* Main Body */}
      <div
        className={cn(
          'no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto py-3.5 transition-all duration-200',
          collapsed ? 'px-2' : 'px-3'
        )}
      >
        {/* Search Bar */}
        {!collapsed ? (
          <div className="relative mb-3 shrink-0">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8492]" />
            <input
              type="text"
              placeholder="Buscar no espaço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9.5 w-full rounded-xl border border-transparent bg-[#f0f2f5] pl-9 pr-7 text-xs text-[#0b1f3b] placeholder-[#7a8492] transition-all hover:bg-[#e8ecf1] focus:border-[#1e6fff]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fff]/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#7a8492] hover:text-[#0b1f3b]"
                aria-label="Limpar busca"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ) : (
          <div className="mb-2 flex shrink-0 justify-center">
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-[#7a8492] transition-colors hover:bg-[#f1f5fb] hover:text-[#1e6fff]"
              title="Buscar no espaço"
              aria-label="Buscar no espaço"
            >
              <Search size={17} />
            </button>
          </div>
        )}

        {/* Section Heading */}
        {!collapsed && (
          <p className="shrink-0 select-none px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa8b9]">
            Navegação
          </p>
        )}

        {/* Nav List */}
        <nav className="space-y-1" aria-label="Navegação principal">
          {filteredNavItems.length === 0 ? (
            <p className="px-3 py-2 text-center text-xs text-[#94a3b8]">Nenhum item encontrado</p>
          ) : (
            filteredNavItems.map(({ label, icon: Icon, path }) => {
              const isActive = activePath === path;
              return (
                <div key={label} className="relative">
                  <Link
                    href={path}
                    onClick={onClose}
                    title={label}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group relative flex cursor-pointer select-none items-center rounded-xl font-medium transition-all duration-200',
                      collapsed
                        ? 'mx-auto size-10 justify-center p-0'
                        : 'h-10 w-full gap-3 px-3 text-[13.5px]',
                      isActive
                        ? 'bg-gradient-to-tr from-[#1e6fff] to-[#2e7dff] font-semibold text-white shadow-[0_4px_16px_rgba(30,111,255,0.28)]'
                        : 'text-[#64748b] hover:bg-[#f1f5fb] hover:text-[#1e6fff]'
                    )}
                    data-testid={
                      isActive
                        ? `nav-${label.toLowerCase().replaceAll(' ', '-')}-ativa`
                        : `button-nav-${label.toLowerCase().replaceAll(' ', '-')}`
                    }
                  >
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.2 : 1.9}
                      className={cn(
                        'shrink-0 transition-colors duration-200',
                        isActive ? 'text-white' : 'text-[#7a8797] group-hover:text-[#1e6fff]'
                      )}
                    />
                    {!collapsed && <span className="truncate tracking-tight">{label}</span>}
                  </Link>
                </div>
              );
            })
          )}
        </nav>

        {/* Divider */}
        <div
          className={cn(
            'my-3 h-px shrink-0 bg-[#edf1f6] transition-all duration-200',
            collapsed ? 'mx-auto w-8' : 'w-full'
          )}
        />

        {/* Settings Button */}
        <div className="relative">
          <button
            type="button"
            onClick={onEditProfile}
            title="Configurações"
            className={cn(
              'group relative flex cursor-pointer select-none items-center rounded-xl font-medium transition-all duration-200',
              collapsed
                ? 'mx-auto size-10 justify-center p-0'
                : 'h-10 w-full gap-3 px-3 text-[13.5px]',
              'text-[#64748b] hover:bg-[#f1f5fb] hover:text-[#1e6fff]'
            )}
            data-testid="button-nav-configuracoes"
          >
            <Settings2
              size={18}
              strokeWidth={1.9}
              className="shrink-0 text-[#7a8797] transition-colors duration-200 group-hover:text-[#1e6fff]"
            />
            {!collapsed && <span className="truncate">Configurações</span>}
          </button>
        </div>

        {/* Logout Button */}
        <div className="relative mt-1">
          <button
            type="button"
            onClick={onSignOut}
            title="Sair da conta"
            className={cn(
              'group relative flex cursor-pointer select-none items-center rounded-xl font-medium transition-all duration-200',
              collapsed
                ? 'mx-auto size-10 justify-center p-0'
                : 'h-10 w-full gap-3 px-3 text-[13.5px]',
              'text-[#64748b] hover:bg-[#fff2f1] hover:text-[#e11d48]'
            )}
            data-testid="button-sign-out"
          >
            <LogOut
              size={18}
              strokeWidth={1.9}
              className="shrink-0 text-[#7a8797] transition-colors duration-200 group-hover:text-[#e11d48]"
            />
            {!collapsed && <span className="truncate">Sair da conta</span>}
          </button>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto shrink-0 pt-3">
          {!collapsed && (
            <div className="mb-2.5 rounded-2xl border border-[#dbe7f4] bg-[#f6f9fd] p-2.5">
              <div className="mb-1 flex items-center gap-2 text-[#0b3558]">
                <span className="grid size-6 place-items-center rounded-lg bg-[#d7ebff] text-[#004eba]">
                  <Bolt size={13} fill="currentColor" />
                </span>
                <span className="text-xs font-bold">Dica Voltiva</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#64748b]">
                Valide uma grandeza antes de fechar seu diagnóstico.
              </p>
            </div>
          )}

          {collapsed ? (
            <div className="relative flex justify-center py-1">
              <button
                type="button"
                onClick={onEditProfile}
                className="group relative flex size-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#8fc9eb] to-[#5baad5] text-xs font-bold text-[#0b3558] shadow-xs ring-2 ring-[#e2e8f0] transition-all duration-200 hover:scale-105 hover:ring-[#1e6fff]"
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
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-2 text-left transition-all duration-200 hover:border-[#1e6fff]/40 hover:bg-[#f1f5fb]"
              data-testid="avatar-user-expanded"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8fc9eb] to-[#5baad5] text-xs font-bold text-[#0b3558] shadow-xs ring-1 ring-white">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#0b1f3b]">{firstName}</p>
                <p className="truncate text-[10.5px] text-[#7a8492]">Espaço Voltiva</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}