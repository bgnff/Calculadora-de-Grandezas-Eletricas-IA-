import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ArrowRight, BarChart3, Calculator, CheckCircle2, CircleDollarSign, Clock3, Lightbulb, Menu, ShieldCheck, X } from 'lucide-react';
import { MotionConfig, motion, useInView } from 'framer-motion';
import { ErrorBoundary } from '@/components/error-boundary';
import Rays from '@/components/light-rays';
import { ProfileOnboarding } from '@/components/profile-onboarding';
import { VoltivaShell } from '@/components/voltiva-shell';
import { WalkingLoader } from '@/components/walking-loader';
import { AnimatedEnergyLines } from '@/components/animated-energy-lines';
import { AnimatedNavLink } from '@/components/animated-nav-link';
import { ScrollHighlightText } from '@/components/scroll-highlight-text';
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

const routeMetadata: Record<string, { title: string; description: string; robots: string }> = {
  '/': {
    title: 'Calculadora elétrica, consumo e custos | Voltiva',
    description: 'Calcule tensão, corrente, resistência e potência e organize consumo e custos para tomar decisões elétricas melhores.',
    robots: 'index, follow',
  },
  '/sign-in': {
    title: 'Entrar no seu espaço de energia | Voltiva',
    description: 'Acesse seu espaço Voltiva para acompanhar cálculos, consumo e decisões elétricas salvas.',
    robots: 'noindex, nofollow',
  },
  '/sign-up': {
    title: 'Crie seu espaço de energia | Voltiva',
    description: 'Crie sua conta Voltiva e transforme cálculos e consumo em decisões elétricas mais claras.',
    robots: 'noindex, nofollow',
  },
  '/app/dashboard': {
    title: 'Visão geral da sua energia | Voltiva',
    description: 'Acompanhe cálculos salvos, consumo estimado e próximos passos no seu espaço Voltiva.',
    robots: 'noindex, nofollow',
  },
  '/app/calculator': {
    title: 'Calculadora elétrica de Ohm | Voltiva',
    description: 'Calcule tensão, corrente, resistência e potência com fórmulas de Ohm e validação guiada.',
    robots: 'noindex, nofollow',
  },
  '/app/consumption': {
    title: 'Consumo de energia | Voltiva',
    description: 'Registre equipamentos e acompanhe uma estimativa mensal de consumo no seu espaço Voltiva.',
    robots: 'noindex, nofollow',
  },
  '/app/savings': {
    title: 'Economia de energia | Voltiva',
    description: 'Encontre oportunidades de economia e compare o uso de energia com a sua meta mensal.',
    robots: 'noindex, nofollow',
  },
  '/app/history': {
    title: 'Histórico de cálculos | Voltiva',
    description: 'Reveja os cálculos que você salvou e mantenha o contexto das suas decisões elétricas.',
    robots: 'noindex, nofollow',
  },
  '/app/reports': {
    title: 'Relatórios de energia | Voltiva',
    description: 'Exporte um resumo dos seus cálculos e equipamentos para continuar sua análise.',
    robots: 'noindex, nofollow',
  },
  '/app/settings': {
    title: 'Configurações do espaço | Voltiva',
    description: 'Atualize seu perfil energético, meta de consumo e preferências da Voltiva.',
    robots: 'noindex, nofollow',
  },
};

function updateMetaTag(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function RouteMetadata() {
  const [location] = useLocation();

  useEffect(() => {
    const pathname = location.split('?')[0].replace(/\/+$/, '') || '/';
    const meta = routeMetadata[pathname] ?? {
      title: 'Página não encontrada | Voltiva',
      description: 'A página solicitada não foi encontrada na Voltiva.',
      robots: 'noindex, nofollow',
    };
    const canonicalPath = `${basePath}${pathname === '/' ? '/' : pathname}`;
    const canonicalUrl = new URL(canonicalPath || '/', window.location.origin).href;

    document.title = meta.title;
    updateMetaTag('name', 'description', meta.description);
    updateMetaTag('name', 'robots', meta.robots);
    updateMetaTag('property', 'og:title', meta.title);
    updateMetaTag('property', 'og:description', meta.description);
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'og:type', 'website');
    updateMetaTag('property', 'og:site_name', 'Voltiva');
    updateMetaTag('name', 'twitter:title', meta.title);
    updateMetaTag('name', 'twitter:description', meta.description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [location]);

  return null;
}

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

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.12, margin: '-8% 0px -8% 0px' });
  // A landing page is an explicit showcase surface. Keep its motion visible in
  // the embedded preview even when the preview browser advertises reduced motion.
  const reducedMotion = false;
  const show = isInView || reducedMotion;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: reducedMotion ? 0 : 0.65, delay: reducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [enterState, setEnterState] = useState<'pending' | 'run' | 'done'>('pending');
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEnterState('done');
      return;
    }

    let cancelled = false;
    let finishTimer = 0;
    let firstFrame = 0;
    let secondFrame = 0;

    const start = () => {
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          if (cancelled) return;
          setEnterState('run');
          finishTimer = window.setTimeout(() => setEnterState('done'), 2600);
        });
      });
    };

    start();

    return () => {
      cancelled = true;
      window.clearTimeout(finishTimer);
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuOpen && navRef.current && !navRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) closeMenu();
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <MotionConfig reducedMotion="never">
      <a href="#landing-main" className="skip-link" data-testid="link-skip-to-content">Pular para o conteúdo principal</a>
      <main id="landing-main" className="landing-page relative min-h-[100dvh] overflow-x-hidden bg-white" data-enter={enterState}>
      <Rays backgroundColor="hsl(var(--background))" style={{ zIndex: 0 }} />

      <header ref={navRef} className="landing-nav relative z-20 mx-auto mt-5 flex h-14 max-w-[980px] items-center justify-between rounded-full bg-[#0b1f3b] px-3 pl-5 shadow-[0_16px_36px_rgba(11,31,59,.16)] md:mt-7">
        <Brand inverse />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
           <AnimatedNavLink href="#recursos" dark className="landing-nav-link">Recursos</AnimatedNavLink>
           <AnimatedNavLink href="#como-funciona" dark className="landing-nav-link">Como funciona</AnimatedNavLink>
           <AnimatedNavLink href="#plataforma" dark className="landing-nav-link">Plataforma</AnimatedNavLink>
           <AnimatedNavLink href="#clareza" dark className="landing-nav-link">Clareza dos dados</AnimatedNavLink>
          <span className="mx-2 h-4 w-px bg-white/20" />
           <span className="landing-nav-note text-[11px] font-medium text-white/55">Feito para decisões reais</span>
        </nav>
        <div className="flex items-center gap-1">
           <a href={`${basePath}/sign-in`} data-testid="link-header-entrar" className="landing-nav-account rounded-full px-3 py-2 text-xs text-white/70 transition hover:text-white">Entrar</a>
           <a href={`${basePath}/sign-up`} data-testid="link-header-cadastro" className="landing-nav-account rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#0b1f3b] transition hover:bg-[#d7ebff]">Começar grátis</a>
           <button
             type="button"
             className="landing-burger"
              ref={menuButtonRef}
             aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
             aria-expanded={menuOpen}
             aria-controls="landing-nav-menu"
             onClick={() => setMenuOpen((open) => !open)}
           >
             <span />
             <span />
           </button>
        </div>
         <nav id="landing-nav-menu" className="landing-mobile-menu" data-open={menuOpen} aria-label="Navegação da landing page" aria-hidden={!menuOpen}>
           <a href="#recursos" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>Recursos</a>
           <a href="#como-funciona" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>Como funciona</a>
           <a href="#plataforma" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>Plataforma</a>
           <a href="#clareza" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>Clareza dos dados</a>
           <a href={`${basePath}/sign-up`} onClick={closeMenu} tabIndex={menuOpen ? 0 : -1} className="landing-mobile-menu__cta">Começar grátis</a>
         </nav>
      </header>

       <section className="landing-hero-section relative z-10 mx-auto max-w-[1180px] px-5 pb-0 pt-16 md:px-8 md:pt-20">
        <div className="flex flex-col items-center">
           <div className="landing-hero-copy max-w-[820px] text-center">
             <h1 className="landing-hero-title max-w-[850px] font-display text-[clamp(2.8rem,5.4vw,5.1rem)] font-semibold leading-[1.02] tracking-[-0.065em] text-[#0b1f3b]">
               <span>Entenda sua <strong>energia.</strong></span>
               <span>Decida melhor.</span>
            </h1>
             <p className="landing-hero-sub mx-auto mt-6 max-w-[650px] text-base leading-7 text-[#64748b]">A Voltiva transforma grandezas elétricas, consumo e custos em uma leitura prática para sua casa, seu projeto ou seu negócio.</p>
             <div className="landing-hero-actions mt-8 flex flex-wrap justify-center gap-3">
               <motion.a href={`${basePath}/sign-up`} data-testid="link-hero-cadastro" whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e6fff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1557d6]">Criar meu espaço <ArrowRight size={16} /></motion.a>
               <motion.a href="#plataforma" data-testid="link-hero-plataforma" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#c8e4f7] bg-white px-5 py-3 text-sm font-medium text-[#17617a] transition hover:border-[#1e6fff] hover:text-[#0b1f3b]">Conhecer a plataforma</motion.a>
            </div>
             <div className="landing-hero-proof mx-auto mt-9 grid max-w-[560px] grid-cols-2 gap-x-6 gap-y-4 border-t border-[#dfe8ed] pt-5 text-left text-xs text-[#64748b] sm:grid-cols-4">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#1e6fff]" /> Grandezas</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#1e6fff]" /> Consumo</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#1e6fff]" /> Economia</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#1e6fff]" /> Histórico</span>
            </div>
           </div>
           <div className="landing-band relative -mx-5 mt-14 w-[calc(100%+2.5rem)] overflow-hidden bg-[#1e6fff] px-5 pt-10 sm:-mx-8 sm:w-[calc(100%+4rem)] sm:px-8 md:mt-16 md:pt-14">
             <video
               className="landing-band__video"
               autoPlay
               muted
               loop
               playsInline
               poster="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_125039_45a71f04-36dd-4620-99d8-7526316d439e.png"
               src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_125119_4963ddd4-c287-4044-b014-b68943cdd8bd.mp4"
               aria-hidden="true"
             />
            <AnimatedEnergyLines />
             <div className="landing-product-card relative z-10 mx-auto max-w-[1020px]">
               <DashboardPreview banded landingAnimated />
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="relative z-10 border-t border-[hsl(var(--border))] bg-[#eef6fb]">
        <div className="mx-auto max-w-[1180px] px-5 py-20 md:px-8 md:py-28">
          <Reveal className="max-w-[620px]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e6fff]">O que você resolve aqui</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#0b1f3b]">Da dúvida elétrica ao próximo passo.</h2>
            <p className="mt-4 text-base leading-7 text-[#64748b]">Uma plataforma para olhar os dados sem precisar atravessar planilhas, fórmulas soltas ou estimativas difíceis de conferir.</p>
          </Reveal>
          <Reveal className="mt-12" delay={0.1}>
            <div className="grid gap-4 md:grid-cols-12">
              <Feature className="md:col-span-7 md:min-h-[250px]" eyebrow="01 · Precisão" title="Calcule grandezas com confiança" text="Tensão, corrente, resistência e potência em uma calculadora guiada, com fórmulas reconhecidas e entradas que fazem sentido." icon={<Calculator size={20} />} />
              <Feature className="md:col-span-5 md:min-h-[250px]" eyebrow="02 · Leitura" title="Veja onde a energia pesa" text="Registre equipamentos, acompanhe o consumo e encontre os pontos que merecem atenção primeiro." icon={<BarChart3 size={20} />} />
              <Feature className="md:col-span-5 md:min-h-[230px]" eyebrow="03 · Ação" title="Encontre oportunidades de economia" text="Compare cenários e transforme uma conta alta em uma lista de decisões possíveis." icon={<CircleDollarSign size={20} />} />
              <Feature className="md:col-span-7 md:min-h-[230px]" eyebrow="04 · Continuidade" title="Guarde o raciocínio, não só o resultado" text="Seu histórico acompanha a evolução das escolhas para você voltar, revisar e compartilhar quando precisar." icon={<Clock3 size={20} />} />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="como-funciona" className="relative z-10 bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e6fff]">Como funciona</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#0b1f3b]">Clareza em três movimentos.</h2>
            <p className="mt-5 max-w-[430px] text-base leading-7 text-[#64748b]">Comece com uma pergunta prática. A Voltiva organiza o cálculo, dá contexto para o número e deixa o caminho salvo para a próxima decisão.</p>
            <a href={`${basePath}/sign-up`} data-testid="link-como-funciona-cadastro" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#1e6fff] hover:text-[#1557d6]">Experimentar agora <ArrowRight size={16} /></a>
          </Reveal>
          <Reveal delay={0.12} className="divide-y divide-[#dfe8ed] border-y border-[#dfe8ed]" >
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
          </Reveal>
        </div>
      </section>

      <section id="clareza" className="relative z-10 border-y border-[#dfe8ed] bg-[#0b1f3b] text-white">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8fc9eb]"><ShieldCheck size={16} /> Clareza dos dados</div>
            <h2 className="mt-5 max-w-[650px] font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.06] tracking-[-0.055em]">Número bom é número que você consegue conferir.</h2>
             <ScrollHighlightText className="mt-5 max-w-[570px] text-base leading-7">A Voltiva mostra unidade, origem do cálculo e evolução do consumo sem esconder o raciocínio atrás de um índice. Você entende o que mudou antes de escolher o que fazer.</ScrollHighlightText>
          </Reveal>
          <Reveal className="grid gap-3 sm:grid-cols-2" delay={0.12}>
            <div className="rounded-2xl bg-white/[.08] p-5"><CheckCircle2 className="text-[#8fc9eb]" size={20} /><p className="mt-10 text-sm font-semibold">Fórmulas visíveis</p><p className="mt-2 text-xs leading-5 text-white/55">Grandezas e unidades no mesmo lugar.</p></div>
            <div className="rounded-2xl bg-[#1e6fff] p-5"><Lightbulb className="text-[#ffc107]" size={20} /><p className="mt-10 text-sm font-semibold">Próximos passos</p><p className="mt-2 text-xs leading-5 text-white/70">Insights práticos para sair do número.</p></div>
            <div className="rounded-2xl bg-white/[.08] p-5 sm:col-span-2"><BarChart3 className="text-[#8fc9eb]" size={20} /><p className="mt-5 text-sm font-semibold">Histórico que conta uma história</p><p className="mt-2 text-xs leading-5 text-white/55">Compare períodos e decisões sem perder o contexto.</p></div>
          </Reveal>
        </div>
      </section>

      <section id="plataforma" className="relative z-10 bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <Reveal className="rounded-[24px] bg-[#eaf5fc] p-6 md:p-8">
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
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e6fff]">Uma plataforma, vários momentos</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#0b1f3b]">Do primeiro cálculo à decisão que você revisita.</h2>
            <p className="mt-5 max-w-[540px] text-base leading-7 text-[#64748b]">A Voltiva foi pensada para acompanhar a pergunta que aparece antes de uma compra, durante um diagnóstico ou quando a fatura pede uma explicação melhor.</p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#374151]"><span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#1e6fff]" /> Conta organizada</span><span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#1e6fff]" /> Leitura acionável</span></div>
          </Reveal>
        </div>
      </section>

      <section id="cadastro" className="relative z-10 bg-[#d7ebff]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-7 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8 md:py-20">
          <Reveal><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#17617a]">Pronto para começar?</p><h2 className="mt-3 max-w-[650px] font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#0b1f3b]">Leve mais clareza para a próxima decisão elétrica.</h2></Reveal>
          <motion.a href={`${basePath}/sign-up`} data-testid="link-final-cadastro" whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0b1f3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17345c]">Criar conta grátis <ArrowRight size={16} /></motion.a>
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
    </MotionConfig>
  );
}

function DashboardPreview({ banded = false, landingAnimated = false }: { banded?: boolean; landingAnimated?: boolean }) {
  const preview = (
    <div className="soft-shadow overflow-hidden rounded-[18px] border border-[#dfe8ed] bg-[#f9fbfd]">
      <div className="grid min-h-[500px] overflow-hidden md:min-h-[610px] lg:grid-cols-[190px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#dbe7f1] bg-white p-5 lg:block">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0b3558]"><img src={`${basePath}/logo.png`} alt="" className="size-7 object-contain" /> voltiva</div>
          <p className="mt-10 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ba8c9]">Seu espaço</p>
          <div className="mt-4 space-y-1.5 text-[11px] text-[#64748b]">
            <div className="rounded-lg bg-[#dff0ff] px-2.5 py-2 font-semibold text-[#004eba]">Visão geral</div>
            <div className="px-2.5 py-2">Calculadora</div>
            <div className="px-2.5 py-2">Consumo</div>
            <div className="px-2.5 py-2">Histórico</div>
          </div>
          <div className="mt-28 border-t border-[#dbe7f1] pt-3 text-[10px] text-[#8ba8c9]">Perfil completo</div>
        </aside>
        <div className="min-w-0 space-y-4 p-4 md:p-7">
          <div className="flex items-end justify-between gap-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1e6fff]">Visão geral</p><h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] text-[#0b1f3b] md:text-3xl">Olá, por aqui.</h2><p className="mt-1 hidden text-[11px] leading-4 text-[#64748b] md:block">Seu espaço para entender grandezas e tomar decisões elétricas.</p></div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#1e6fff] px-3 py-2.5 text-[10px] font-bold text-white">Novo cálculo <ArrowRight size={12} /></span>
          </div>
          <div className="rounded-xl border border-[#c9dcf2] bg-[#eaf2ff] p-4">
            <div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#1e6fff]"><Lightbulb size={17} /></span><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#004eba]">Seu ponto de partida</p><p className="mt-0.5 text-[13px] font-semibold text-[#0b3558]">Encontrar oportunidades</p></div><span className="ml-auto hidden rounded-lg border border-[#b5cdec] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#004eba] md:inline-flex">Ver perfil</span></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['Cálculos salvos', '12', 'No histórico', Calculator],
              ['Consumo estimado', '186,4 kWh', 'Equipamentos', BarChart3],
              ['Equipamentos', '08', 'Neste espaço', CircleDollarSign],
            ].map(([label, value, caption, Icon]) => <div key={label as string} className="rounded-xl border border-[#dbe7f1] bg-white p-3"><div className="flex items-start justify-between gap-1"><p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#64748b]">{label as string}</p><span className="hidden size-7 place-items-center rounded-md bg-[#e6f0ff] text-[#1e6fff] sm:grid"><Icon size={13} /></span></div><p className="mt-4 font-data text-base font-medium tracking-[-0.04em] text-[#0b1f3b]">{value as string}</p><p className="mt-0.5 text-[9px] text-[#64748b]">{caption as string}</p></div>)}
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-xl border border-[#dbe7f1] bg-white p-4">
              <div className="flex items-end justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#64748b]">Atividade recente</p><p className="mt-1 text-[14px] font-semibold text-[#0b1f3b]">Últimos cálculos</p></div><span className="text-[9px] font-bold text-[#1e6fff]">Ver histórico</span></div>
              <div className="mt-3 divide-y divide-[#e6eef5]">
                {[
                  ['Potência do chuveiro', 'Calculadora elétrica', 'agora'],
                  ['Consumo mensal da cozinha', 'Consumo', 'ontem'],
                  ['Economia com LED', 'Relatório', '12 jun'],
                ].map(([title, type, date]) => <div key={title} className="flex items-center gap-2 py-3 first:pt-0 last:pb-0"><span className="grid size-7 shrink-0 place-items-center rounded-md bg-[#e6f0ff] text-[#1e6fff]"><Clock3 size={12} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-[10px] font-semibold text-[#0b1f3b]">{title}</strong><span className="text-[9px] text-[#64748b]">{type}</span></span><span className="text-[9px] text-[#8ba8c9]">{date}</span></div>)}
              </div>
            </div>
            <div className="rounded-xl border border-[#dbe7f1] bg-white/80 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#64748b]">Acesso rápido</p>
              <div className="mt-3 space-y-2">
                {[
                  ['Calcular uma grandeza', 'Use as fórmulas de Ohm.', Calculator],
                  ['Mapear consumo', 'Cadastre equipamentos.', BarChart3],
                  ['Gerar relatório', 'Exporte seus dados.', Clock3],
                ].map(([title, text, Icon]) => <div key={title as string} className="flex items-center gap-2 rounded-lg p-1.5"><span className="grid size-7 shrink-0 place-items-center rounded-md bg-[#e6f0ff] text-[#1e6fff]"><Icon size={12} /></span><span className="min-w-0"><strong className="block truncate text-[10px] font-semibold text-[#0b1f3b]">{title as string}</strong><span className="block truncate text-[9px] text-[#64748b]">{text as string}</span></span></div>)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-[#dbe7f1] pt-4 text-[10px]">
            {['Visão geral', 'Calculadora', 'Consumo', 'Histórico'].map((tab, index) => <span key={tab} className={`rounded-full px-3 py-1.5 ${index === 0 ? 'bg-[#0b1f3b] font-semibold text-white' : 'border border-[#dbe7f1] text-[#64748b]'}`}>{tab}</span>)}
          </div>
        </div>
      </div>
    </div>
  );

  if (landingAnimated) {
    return <div className={`relative w-full ${banded ? 'mt-0' : 'mt-14 md:mt-20'}`}>{preview}</div>;
  }

  return (
    <Reveal className={`relative w-full ${banded ? 'mt-0' : 'mt-14 md:mt-20'}`} delay={0.1}>
      {preview}
    </Reveal>
  );
}

function Feature({ title, text, icon, eyebrow, className = '' }: { title: string; text: string; icon: ReactNode; eyebrow: string; className?: string }) {
  return <div className={`soft-shadow rounded-2xl border border-[#dfe8ed] bg-white p-6 ${className}`} data-testid={`card-feature-${eyebrow.split(' ')[0]}`}><div className="flex items-start justify-between gap-4"><span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1e6fff]">{eyebrow}</span><span className="text-[#1e6fff]">{icon}</span></div><h3 className="mt-10 font-display text-xl font-semibold tracking-[-0.035em] text-[#0b1f3b]">{title}</h3><p className="mt-3 max-w-[440px] text-sm leading-6 text-[#64748b]">{text}</p></div>;
}

function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return <div className="landing-brand flex items-center gap-2"><img src={`${basePath}/logo.png`} alt="" className={`landing-brand__logo ${compact ? 'size-8' : 'size-10'} shrink-0 object-contain`} /><span className={`landing-brand__wordmark ${compact ? 'text-lg' : 'text-[24px]'} font-display font-medium tracking-[-0.05em] ${inverse ? 'text-white' : 'text-[hsl(var(--foreground))]'}`}>voltiva</span></div>;
}

function AuthLayout({ children, mode }: { children: ReactNode; mode: 'sign-in' | 'sign-up' }) {
  const isSignIn = mode === 'sign-in';
  return (
    <main id="auth-main" className="relative min-h-[100dvh] overflow-hidden bg-[#f5f7fa] px-4 py-5 sm:px-6 lg:px-8">
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
  const validSections = ['dashboard', 'calculator', 'consumption', 'savings', 'history', 'reports', 'settings'];
  if (!validSections.includes(section)) return <NotFound />;
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
     <RouteMetadata />
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