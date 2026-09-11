import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ArrowRight, BarChart3, Calculator, CheckCircle2, CircleDollarSign, Clock3, Lightbulb, ShieldCheck } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { BlurReveal } from '@/components/blur-reveal';
import Rays from '@/components/light-rays';
import { ProfileOnboarding } from '@/components/profile-onboarding';
import { VoltivaShell } from '@/components/voltiva-shell';
import { WalkingLoader } from '@/components/walking-loader';
import { useEnergyProfile } from '@/hooks/use-energy-profile';
import { useVoltivaData } from '@/hooks/use-voltiva-data';
import CalculatorPage from '@/pages/calculator';
import {
  ConsumptionPage,
  DashboardPage,
  HistoryPage,
  ReportsPage,
  SavingsPage,
  SettingsPage,
} from '@/pages/app-pages';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
     logoImageUrl: `${window.location.origin}${basePath}/logo.png`,
  },
  variables: {
    colorPrimary: '#1e6fff',
    colorForeground: '#0b1f3b',
    colorMutedForeground: '#64748b',
    colorDanger: '#dc2626',
    colorBackground: '#ffffff',
    colorInput: '#f5f7fa',
    colorInputForeground: '#374151',
    colorNeutral: '#d7ebff',
    fontFamily: 'Lato, Arial, sans-serif',
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-[22px] w-[440px] max-w-full overflow-hidden shadow-[0_24px_70px_rgba(11,31,59,.14)]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'font-display text-[#0b1f3b]',
    headerSubtitle: 'text-[#64748b]',
    socialButtonsBlockButtonText: 'text-[#0b1f3b]',
    formFieldLabel: 'text-[#374151]',
    footerActionLink: 'text-[#1e6fff]',
    footerActionText: 'text-[#64748b]',
    dividerText: 'text-[#64748b]',
    formFieldSuccessText: 'text-[#15803d]',
    alertText: 'text-[#dc2626]',
     logoBox: '!rounded-none !overflow-visible !shadow-none',
    socialButtonsBlockButton: 'border-[#d7ebff] hover:bg-[#f5f7fa]',
    formButtonPrimary: 'bg-[#1e6fff] hover:bg-[#1557d6] text-white',
    formFieldInput: 'border-[#d7ebff] bg-[#f5f7fa] text-[#374151]',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-[#d7ebff]',
    alert: 'bg-[#fff7ed] border-[#fed7aa]',
    otpCodeFieldInput: 'border-[#d7ebff]',
    formFieldRow: 'gap-2',
    main: 'bg-transparent',
  },
};

const platformModules = [
  ['Calculadora elétrica', 'Grandezas para validar uma ideia', Calculator],
  ['Consumo de energia', 'Uma visão do que acontece no mês', BarChart3],
  ['Economia', 'Cenários para gastar melhor', CircleDollarSign],
  ['Histórico', 'Decisões que continuam disponíveis', Clock3],
] as const;

function LandingPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#f5f7fa]">
      <Rays backgroundColor="hsl(var(--background))" style={{ zIndex: 0 }} />

      <header className="relative z-10 mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 md:px-8 md:py-6">
        <Brand />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          <a href="#recursos" data-testid="link-nav-recursos" className="rounded-full px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">Recursos</a>
          <a href="#como-funciona" data-testid="link-nav-como-funciona" className="rounded-full px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">Como funciona</a>
          <a href="#plataforma" data-testid="link-nav-plataforma" className="rounded-full px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">Plataforma</a>
          <a href="#clareza" data-testid="link-nav-clareza" className="rounded-full px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">Clareza dos dados</a>
          <span className="mx-2 h-4 w-px bg-[hsl(var(--border))]" />
          <span className="text-[11px] font-medium text-[#64748b]">Feito para decisões reais</span>
        </nav>
        <div className="flex items-center gap-1">
          <a href={`${basePath}/sign-in`} data-testid="link-header-entrar" className="rounded-full px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">Entrar</a>
          <a href={`${basePath}/sign-up`} data-testid="link-header-cadastro" className="rounded-lg bg-[#1e6fff] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#1557d6]">Começar grátis</a>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-[1180px] px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[.86fr_1.14fr] lg:gap-16">
          <div className="max-w-[590px]">
            <h1 className="max-w-[720px] font-display text-[clamp(2.8rem,5.4vw,5.1rem)] font-semibold leading-[1.02] tracking-[-0.065em] text-[hsl(var(--foreground))]">
              <BlurReveal className="inline-block whitespace-nowrap" forceAnimation>Entenda sua </BlurReveal>
              <BlurReveal className="inline-block whitespace-nowrap rounded-md bg-[#d7ebff] px-2 text-[#0b1f3b]" delay={0.12} forceAnimation>energia.</BlurReveal>
              <span className="block">
                <BlurReveal className="inline-block whitespace-nowrap" delay={0.28} forceAnimation>Decida melhor.</BlurReveal>
              </span>
            </h1>
            <p className="mt-6 max-w-[540px] text-base leading-7 text-[hsl(var(--muted-foreground))]">A Voltiva transforma grandezas elétricas, consumo e custos em uma leitura prática para sua casa, seu projeto ou seu negócio.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`${basePath}/sign-up`} data-testid="link-hero-cadastro" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e6fff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1557d6]">Criar meu espaço <ArrowRight size={16} /></a>
              <a href="#plataforma" data-testid="link-hero-plataforma" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#c8e4f7] bg-[#f5f7fa] px-5 py-3 text-sm font-medium text-[#17617a] transition hover:border-[#1e6fff] hover:text-[#0b1f3b]">Conhecer a plataforma</a>
            </div>
            <div className="mt-9 grid max-w-[470px] grid-cols-2 gap-x-6 gap-y-4 border-t border-[#dfe8ed] pt-5 text-xs text-[#64748b] sm:grid-cols-4">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#1e6fff]" /> Grandezas</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#1e6fff]" /> Consumo</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#1e6fff]" /> Economia</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#1e6fff]" /> Histórico</span>
            </div>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section id="recursos" className="relative z-10 border-t border-[hsl(var(--border))] bg-[#eef6fb]">
        <div className="mx-auto max-w-[1180px] px-5 py-20 md:px-8 md:py-28">
          <div className="max-w-[620px]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e6fff]">O que você resolve aqui</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#0b1f3b]">Da dúvida elétrica ao próximo passo.</h2>
            <p className="mt-4 text-base leading-7 text-[#64748b]">Uma plataforma para olhar os dados sem precisar atravessar planilhas, fórmulas soltas ou estimativas difíceis de conferir.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-12">
            <Feature className="md:col-span-7 md:min-h-[250px]" eyebrow="01 · Precisão" title="Calcule grandezas com confiança" text="Tensão, corrente, resistência e potência em uma calculadora guiada, com fórmulas reconhecidas e entradas que fazem sentido." icon={<Calculator size={20} />} />
            <Feature className="md:col-span-5 md:min-h-[250px]" eyebrow="02 · Leitura" title="Veja onde a energia pesa" text="Registre equipamentos, acompanhe o consumo e encontre os pontos que merecem atenção primeiro." icon={<BarChart3 size={20} />} />
            <Feature className="md:col-span-5 md:min-h-[230px]" eyebrow="03 · Ação" title="Encontre oportunidades de economia" text="Compare cenários e transforme uma conta alta em uma lista de decisões possíveis." icon={<CircleDollarSign size={20} />} />
            <Feature className="md:col-span-7 md:min-h-[230px]" eyebrow="04 · Continuidade" title="Guarde o raciocínio, não só o resultado" text="Seu histórico acompanha a evolução das escolhas para você voltar, revisar e compartilhar quando precisar." icon={<Clock3 size={20} />} />
          </div>
        </div>
      </section>

      <section id="como-funciona" className="relative z-10 bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e6fff]">Como funciona</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#0b1f3b]">Clareza em três movimentos.</h2>
            <p className="mt-5 max-w-[430px] text-base leading-7 text-[#64748b]">Comece com uma pergunta prática. A Voltiva organiza o cálculo, dá contexto para o número e deixa o caminho salvo para a próxima decisão.</p>
            <a href={`${basePath}/sign-up`} data-testid="link-como-funciona-cadastro" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#1e6fff] hover:text-[#1557d6]">Experimentar agora <ArrowRight size={16} /></a>
          </div>
          <div className="divide-y divide-[#dfe8ed] border-y border-[#dfe8ed]" data-testid="block-como-funciona-etapas">
            {[
              ['01', 'Escolha o que você quer descobrir', 'Selecione uma grandeza, equipamento ou período de consumo para começar com o contexto certo.'],
              ['02', 'Preencha apenas o necessário', 'Os campos são guiados para você não perder tempo procurando qual fórmula usar.'],
              ['03', 'Leia, salve e compare', 'O resultado vem com unidade, explicação e um lugar no seu histórico para continuar depois.'],
            ].map(([number, title, text]) => (
              <div key={number} className="grid gap-3 py-7 sm:grid-cols-[64px_1fr] sm:gap-6">
                <span className="font-data text-sm font-medium text-[#1e6fff]">{number}</span>
                <div><h3 className="font-display text-xl font-semibold tracking-[-0.035em] text-[#0b1f3b]">{title}</h3><p className="mt-2 max-w-[520px] text-sm leading-6 text-[#64748b]">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="clareza" className="relative z-10 border-y border-[#dfe8ed] bg-[#0b1f3b] text-white">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8fc9eb]"><ShieldCheck size={16} /> Clareza dos dados</div>
            <h2 className="mt-5 max-w-[650px] font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.06] tracking-[-0.055em]">Número bom é número que você consegue conferir.</h2>
            <p className="mt-5 max-w-[570px] text-base leading-7 text-white/65">A Voltiva mostra unidade, origem do cálculo e evolução do consumo sem esconder o raciocínio atrás de um índice. Você entende o que mudou antes de escolher o que fazer.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2" data-testid="block-confianca-dados">
            <div className="rounded-2xl bg-white/[.08] p-5"><CheckCircle2 className="text-[#8fc9eb]" size={20} /><p className="mt-10 text-sm font-semibold">Fórmulas visíveis</p><p className="mt-2 text-xs leading-5 text-white/55">Grandezas e unidades no mesmo lugar.</p></div>
            <div className="rounded-2xl bg-[#1e6fff] p-5"><Lightbulb className="text-[#ffc107]" size={20} /><p className="mt-10 text-sm font-semibold">Próximos passos</p><p className="mt-2 text-xs leading-5 text-white/70">Insights práticos para sair do número.</p></div>
            <div className="rounded-2xl bg-white/[.08] p-5 sm:col-span-2"><BarChart3 className="text-[#8fc9eb]" size={20} /><p className="mt-5 text-sm font-semibold">Histórico que conta uma história</p><p className="mt-2 text-xs leading-5 text-white/55">Compare períodos e decisões sem perder o contexto.</p></div>
          </div>
        </div>
      </section>

      <section id="plataforma" className="relative z-10 bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="rounded-[24px] bg-[#eaf5fc] p-6 md:p-8" data-testid="block-plataforma-modulos">
            <div className="flex items-center justify-between border-b border-[#c8e4f7] pb-5"><span className="text-xs font-bold uppercase tracking-[0.16em] text-[#17617a]">Seu espaço Voltiva</span><span className="font-data text-xs text-[#64748b]">01 — 04</span></div>
            <div className="mt-2 divide-y divide-[#c8e4f7]">
              {platformModules.map(([title, text, Icon]) => (
                <div key={title as string} className="flex items-center gap-4 py-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#1e6fff]"><Icon size={18} /></span>
                  <div><p className="text-sm font-semibold text-[#0b1f3b]">{title as string}</p><p className="mt-1 text-xs text-[#64748b]">{text as string}</p></div>
                  <ArrowRight size={16} className="ml-auto text-[#7da5bb]" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e6fff]">Uma plataforma, vários momentos</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#0b1f3b]">Do primeiro cálculo à decisão que você revisita.</h2>
            <p className="mt-5 max-w-[540px] text-base leading-7 text-[#64748b]">A Voltiva foi pensada para acompanhar a pergunta que aparece antes de uma compra, durante um diagnóstico ou quando a fatura pede uma explicação melhor.</p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#374151]"><span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#1e6fff]" /> Conta organizada</span><span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#1e6fff]" /> Leitura acionável</span></div>
          </div>
        </div>
      </section>

      <section id="cadastro" className="relative z-10 bg-[#d7ebff]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-7 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8 md:py-20">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#17617a]">Pronto para começar?</p><h2 className="mt-3 max-w-[650px] font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#0b1f3b]">Leve mais clareza para a próxima decisão elétrica.</h2></div>
          <a href={`${basePath}/sign-up`} data-testid="link-final-cadastro" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0b1f3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17345c]">Criar conta grátis <ArrowRight size={16} /></a>
        </div>
      </section>

      <footer className="relative z-10 bg-[#f5f7fa]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-5 py-8 text-xs text-[#64748b] sm:flex-row sm:items-center sm:justify-between md:px-8">
          <Brand compact />
          <p data-testid="text-footer-description">Energia elétrica com clareza para decisões melhores.</p>
          <div className="flex gap-4"><a href="#recursos" data-testid="link-footer-recursos" className="hover:text-[#0b1f3b]">Recursos</a><a href={`${basePath}/sign-in`} data-testid="link-footer-entrar" className="hover:text-[#0b1f3b]">Entrar</a></div>
        </div>
      </footer>
    </main>
  );
}

function DashboardPreview() {
  const bars = [38, 56, 44, 72, 50, 66, 82, 58, 91, 70, 62, 78, 48, 68, 84, 54, 73, 88, 64, 79, 57, 76, 92, 69];
  return (
    <div className="relative mt-2 md:mt-6" data-testid="block-dashboard-preview">
      <div className="soft-shadow overflow-hidden rounded-[16px] bg-white">
        <div className="grid min-h-[430px] overflow-hidden bg-[#fbfbfa] sm:grid-cols-[148px_minmax(0,1fr)]">
          <aside className="hidden border-r border-[#e8e6e5] bg-white p-4 sm:block">
             <div className="flex items-center gap-2 text-xs font-medium text-[#374151]"><img src={`${basePath}/logo.png`} alt="" className="size-6 object-contain" /> voltiva</div>
            <p className="mt-8 text-[9px] uppercase tracking-[0.14em] text-[#a8a29e]">Seu espaço</p>
            <div className="mt-3 space-y-1.5 text-[11px] text-[#78716c]">
              <div className="rounded-md bg-[#d7ebff] px-2.5 py-2 font-medium text-[#0b1f3b]">Visão geral</div>
              <div className="px-2.5 py-2">Calculadora</div>
              <div className="px-2.5 py-2">Consumo</div>
              <div className="px-2.5 py-2">Histórico</div>
            </div>
            <div className="mt-20 border-t border-[#e8e6e5] pt-3 text-[10px] text-[#a8a29e]">Perfil completo</div>
          </aside>
          <div className="min-w-0 p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[9px] uppercase tracking-[0.14em] text-[#a8a29e]">Visão geral</p><h2 className="mt-1 text-lg font-medium tracking-[-0.03em] text-[#0c0a09]">Seu painel elétrico</h2></div>
              <div className="rounded-md border border-[#e8e6e5] bg-white px-2.5 py-1.5 text-[10px] text-[#78716c]">Este mês⌄</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
              {[
                ['Consumo', '186,4', 'kWh'],
                ['Custo estimado', 'R$ 142', 'mês'],
                ['Equipamentos', '08', 'ativos'],
                ['Economia', '12%', 'vs. mês anterior'],
              ].map(([label, value, helper]) => <div key={label} className="rounded-md border border-[#e8e6e5] bg-white p-3"><p className="text-[9px] text-[#78716c]">{label}</p><p className="mt-2 text-lg font-medium tracking-[-0.04em] text-[#0c0a09]">{value} <span className="text-[9px] font-normal text-[#a8a29e]">{helper}</span></p><div className="mt-2 h-1 rounded-full bg-[#eaf5fc]"><div className="h-1 w-2/3 rounded-full bg-[#3ba6f1]" /></div></div>)}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-[1.35fr_1fr]">
              <div className="rounded-md border border-[#e8e6e5] bg-white p-3">
                <div className="flex items-center justify-between"><p className="text-[11px] font-medium text-[#0c0a09]">Consumo ao longo do mês</p><span className="text-[9px] text-[#a8a29e]">kWh</span></div>
                <div className="mt-5 flex h-[132px] items-end gap-1.5 border-b border-[#e8e6e5] px-1">
                  {bars.map((height, index) => <span key={index} className={`min-w-0 flex-1 rounded-t-[2px] ${index > 17 ? 'bg-[#8fc9eb]' : 'bg-[#3ba6f1]'}`} style={{ height: `${height}%` }} />)}
                </div>
                <div className="mt-2 flex justify-between text-[8px] text-[#a8a29e]"><span>01</span><span>08</span><span>15</span><span>22</span><span>30</span></div>
              </div>
              <div className="rounded-md border border-[#e8e6e5] bg-white p-3">
                <div className="flex items-center justify-between"><p className="text-[11px] font-medium text-[#0c0a09]">Onde está o consumo</p><span className="text-[9px] text-[#a8a29e]">agora</span></div>
                <div className="mt-4 space-y-3">
                  {[['Chuveiro elétrico', '42%', 'bg-[#3ba6f1]'], ['Geladeira', '24%', 'bg-[#8fc9eb]'], ['Iluminação', '18%', 'bg-[#c1e1f7]'], ['Outros', '16%', 'bg-[#d6d3d1]']].map(([label, percentage, color]) => <div key={label}><div className="mb-1 flex justify-between text-[9px] text-[#78716c]"><span>{label}</span><span>{percentage}</span></div><div className="h-2 rounded-full bg-[#f1f0ee]"><div className={`h-2 rounded-full ${color}`} style={{ width: percentage }} /></div></div>)}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#e8e6e5] pt-3 text-[10px]">
              {['Visão geral', 'Calculadora', 'Consumo', 'Histórico'].map((tab, index) => <span key={tab} className={`rounded-full px-3 py-1.5 ${index === 0 ? 'bg-[#1c1917] text-white' : 'border border-[#e8e6e5] text-[#78716c]'}`}>{tab}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ title, text, icon, eyebrow, className = '' }: { title: string; text: string; icon: ReactNode; eyebrow: string; className?: string }) {
  return <div className={`soft-shadow rounded-2xl border border-[#dfe8ed] bg-white p-6 ${className}`} data-testid={`card-feature-${eyebrow.split(' ')[0]}`}><div className="flex items-start justify-between gap-4"><span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1e6fff]">{eyebrow}</span><span className="text-[#1e6fff]">{icon}</span></div><h3 className="mt-10 font-display text-xl font-semibold tracking-[-0.035em] text-[#0b1f3b]">{title}</h3><p className="mt-3 max-w-[440px] text-sm leading-6 text-[#64748b]">{text}</p></div>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2"><img src={`${basePath}/logo.png`} alt="" className={`${compact ? 'size-8' : 'size-10'} shrink-0 object-contain`} /><span className={`${compact ? 'text-lg' : 'text-[24px]'} font-display font-medium tracking-[-0.05em] text-[hsl(var(--foreground))]`}>voltiva</span></div>;
}

function AuthLayout({ children, mode }: { children: ReactNode; mode: 'sign-in' | 'sign-up' }) {
  const isSignIn = mode === 'sign-in';
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#f5f7fa] px-4 py-5 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -right-28 -top-32 size-[520px] rounded-full bg-[#d7ebff]/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-24 size-[420px] rounded-full bg-[#ffc107]/10 blur-3xl" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-2.5rem)] max-w-6xl overflow-hidden rounded-[28px] bg-[#f5f7fa] shadow-[0_28px_90px_rgba(11,31,59,.12)] lg:grid-cols-[.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[#0b1f3b] p-9 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-32 top-10 size-[420px] rounded-full border-[70px] border-[#1e6fff]/15" />
          <div className="pointer-events-none absolute -bottom-44 -left-20 size-[440px] rounded-full bg-[#1e6fff]/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <img src={`${basePath}/logo.png`} alt="" className="size-11 object-contain" />
              <span className="font-display text-2xl font-bold tracking-[-0.05em]">voltiva</span>
            </div>
            <span className="mt-14 inline-flex rounded-full border border-[#d7ebff]/25 bg-[#d7ebff]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d7ebff]">
              {isSignIn ? 'Seu espaço de energia' : 'Comece com a Voltiva'}
            </span>
            <h1 className="mt-5 max-w-md font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.055em]">
              {isSignIn ? 'Decisões elétricas mais claras.' : 'Organize sua energia desde o primeiro cálculo.'}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
              {isSignIn
                ? 'Acompanhe seus cálculos, consumo e próximos passos em um espaço feito para você.'
                : 'Crie seu espaço Voltiva para salvar cálculos e transformar números em decisões melhores.'}
            </p>
          </div>
          <div className="relative mt-6 min-h-[245px] flex-1 overflow-hidden rounded-[26px] bg-[#071a33]/35">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,111,255,.22),transparent_58%)]" />
            <WalkingLoader />
            <p className="absolute inset-x-0 bottom-5 text-center text-[11px] text-white/60">Mova o cursor para explorar</p>
          </div>
        </section>
        <section className="flex items-center justify-center px-3 py-6 sm:px-8 lg:px-12">
          <div className="w-full max-w-[440px]">{children}</div>
        </section>
      </div>
    </main>
  );
}

function SignInPage() {
  return <AuthLayout mode="sign-in"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></AuthLayout>;
}

function SignUpPage() {
  return <AuthLayout mode="sign-up"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></AuthLayout>;
}

function HomeRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingScreen />;
  return isSignedIn ? <Redirect to="/app/dashboard" /> : <LandingPage />;
}

function AppRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const [location] = useLocation();
  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <Redirect to="/" />;
  const section = location.split('/app/')[1]?.split('/')[0] || 'dashboard';
  return <AuthenticatedApp section={section} />;
}

function AuthenticatedApp({ section }: { section: string }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [editing, setEditing] = useState(false);
  const [skippedThisSession, setSkippedThisSession] = useState(false);
  if (!user) return <LoadingScreen />;
  const profileState = useEnergyProfile(user.id);
  const data = useVoltivaData(user.id);
  const userName = user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'por aqui';

  if ((!profileState.profile && !skippedThisSession) || editing) {
    return <ProfileOnboarding draft={profileState.draft} editing={editing} onDraftChange={profileState.updateDraft} onComplete={(draft) => { profileState.completeProfile(draft); setEditing(false); setSkippedThisSession(false); }} onCancel={() => setEditing(false)} onSkip={() => { setEditing(false); setSkippedThisSession(true); }} />;
  }

  const page = section === 'calculator' ? <CalculatorPage onSaveCalculation={data.saveCalculation} /> :
    section === 'consumption' ? <ConsumptionPage data={data} /> :
      section === 'savings' ? <SavingsPage data={data} /> :
        section === 'history' ? <HistoryPage calculations={data.calculations} clearCalculations={data.clearCalculations} /> :
          section === 'reports' ? <ReportsPage calculations={data.calculations} devices={data.devices} /> :
            section === 'settings' ? <SettingsPage profile={profileState.profile} onEditProfile={() => { profileState.beginEditing(); setEditing(true); }} data={data} userEmail={user.emailAddresses[0]?.emailAddress || ''} onSignOut={() => signOut({ redirectUrl: '/' })} /> :
              <DashboardPage userName={userName} profile={profileState.profile} data={data} />;

  return <VoltivaShell profileIncomplete={!profileState.profile} onResumeProfile={() => { setSkippedThisSession(false); }} onEditProfile={() => { profileState.beginEditing(); setEditing(true); }}>{page}</VoltivaShell>;
}

function LoadingScreen() {
  return <div className="grid min-h-[100dvh] place-items-center bg-[#fafaf9]"><div className="text-center"><Brand /><p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">Preparando seu espaço...</p></div></div>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClientRef = useRef(queryClient);
  useEffect(() => {
    const unsubscribe = addListener(() => queryClientRef.current.clear());
    return unsubscribe;
  }, [addListener]);
  return null;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function AppRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} routerPush={(to) => setLocation(stripBase(to))} routerReplace={(to) => setLocation(stripBase(to), { replace: true })} localization={{ signIn: { start: { title: 'Entre na Voltiva', subtitle: 'Acesse seu espaço de energia' } }, signUp: { start: { title: 'Crie sua conta Voltiva', subtitle: 'Comece a organizar suas decisões elétricas' } } }}>
    <QueryClientProvider client={queryClient}>
      <ClerkQueryClientCacheInvalidator />
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={HomeRoute} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/app/:section?" component={AppRoute} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </QueryClientProvider>
  </ClerkProvider>;
}

function App() {
  return <WouterRouter base={basePath}><AppRoutes /></WouterRouter>;
}

export default App;