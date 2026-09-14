import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bolt,
  Calculator,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Cpu,
  FileText,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  Menu,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import {
  Squares,
  SplitText,
  ShinyText,
  CountUp,
  SpotlightCard,
  TiltedCard,
  Magnet,
  StarBorder,
} from '@/components/reactbits';
import {
  ScrollProgressBar,
  HeroScrollContainer,
  ParallaxBadge,
  ScrollTextHighlight,
  ScrollConduitLine,
} from '@/components/scroll-effects';
import { AnimatedNavLink } from '@/components/animated-nav-link';
import { AnimatedEnergyLines } from '@/components/animated-energy-lines';
import Rays from '@/components/light-rays';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <img
        src={`${basePath}/logo.png`}
        alt="Voltiva"
        className={`${compact ? 'size-7' : 'size-9'} shrink-0 object-contain drop-shadow-sm`}
      />
      <span
        className={`${compact ? 'text-lg' : 'text-[24px]'} font-display font-bold tracking-[-0.04em] ${
          inverse ? 'text-white' : 'text-[#0b1f3b]'
        }`}
      >
        voltiva
      </span>
    </div>
  );
}

// Interactive Live Mini-Calculator Demo for Landing Page
function LiveCalculatorDemo() {
  const [voltage, setVoltage] = useState(220);
  const [resistance, setResistance] = useState(44);

  const current = voltage / (resistance || 1);
  const power = voltage * current;

  return (
    <SpotlightCard
      spotlightColor="rgba(30, 111, 255, 0.18)"
      className="w-full max-w-4xl mx-auto rounded-3xl border border-[#c8e4f7] bg-white/95 p-6 md:p-8 shadow-[0_20px_50px_rgba(11,31,59,0.08)] backdrop-blur-md"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5edf5] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ebff] bg-[#eef7ff] px-3 py-1 text-xs font-bold text-[#1e6fff]">
            <Zap size={13} className="animate-pulse text-[#1e6fff]" /> Demonstração Interativa ao Vivo
          </div>
          <h3 className="mt-2 font-display text-xl md:text-2xl font-bold tracking-tight text-[#0b1f3b]">
            Experimente a Lei de Ohm em Tempo Real
          </h3>
          <p className="text-xs md:text-sm text-slate-500">
            Ajuste a tensão e a resistência para ver a corrente e potência recalculadas instantaneamente.
          </p>
        </div>
        <a
          href={`${basePath}/sign-up`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#1e6fff] hover:text-[#1557d6] transition self-start md:self-auto"
        >
          Abrir calculadora completa <ArrowRight size={14} />
        </a>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Sliders */}
        <div className="space-y-5 rounded-2xl bg-[#f8fbfe] border border-[#e2ecf5] p-5">
          <div>
            <div className="flex justify-between items-center text-sm font-semibold text-[#0b1f3b]">
              <span className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-md bg-[#e6f0ff] text-xs font-bold text-[#1e6fff]">V</span>
                Tensão Elétrica (U)
              </span>
              <span className="font-mono text-base font-bold text-[#1e6fff]">{voltage} V</span>
            </div>
            <input
              type="range"
              min="12"
              max="240"
              step="1"
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
              className="mt-3 w-full h-2 rounded-lg bg-[#d9e7f5] accent-[#1e6fff] cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-600">
              <span>12 V (Bateria)</span>
              <span>127 V (Tomada)</span>
              <span>220 V (Alta Tensão)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-sm font-semibold text-[#0b1f3b]">
              <span className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-md bg-[#eaf4eb] text-xs font-bold text-emerald-600">Ω</span>
                Resistência Elétrica (R)
              </span>
              <span className="font-mono text-base font-bold text-emerald-600">{resistance} Ω</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="1"
              value={resistance}
              onChange={(e) => setResistance(Number(e.target.value))}
              className="mt-3 w-full h-2 rounded-lg bg-[#d9e7f5] accent-emerald-600 cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-600">
              <span>5 Ω (Carga pesada)</span>
              <span>44 Ω (Resistor chuveiro)</span>
              <span>200 Ω</span>
            </div>
          </div>
        </div>

        {/* Live Calculation Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-between rounded-2xl border border-[#dce8f5] bg-gradient-to-br from-white to-[#f4f9ff] p-5 shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Corrente Calculada</span>
              <p className="mt-1 font-mono text-2xl md:text-3xl font-bold tracking-tight text-[#1e6fff]">
                {current.toFixed(2)} <span className="text-sm font-normal text-slate-600">A</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#edf3fa] text-[11px] text-slate-600">
              Fórmula: <code className="font-mono font-semibold text-[#0b1f3b]">I = U / R</code>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-[#dce8f5] bg-gradient-to-br from-white to-[#f4f9ff] p-5 shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Potência Dissipada</span>
              <p className="mt-1 font-mono text-2xl md:text-3xl font-bold tracking-tight text-amber-600">
                {power >= 1000 ? (power / 1000).toFixed(2) : power.toFixed(0)}{' '}
                <span className="text-sm font-normal text-slate-600">{power >= 1000 ? 'kW' : 'W'}</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#edf3fa] text-[11px] text-slate-600">
              Fórmula: <code className="font-mono font-semibold text-[#0b1f3b]">P = U × I</code>
            </div>
          </div>

          <div className="col-span-2 rounded-xl bg-[#eef5fc] border border-[#d2e4f5] p-3 text-xs text-[#0b3558] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#1e6fff]" />
              <strong>Status:</strong> {power > 3000 ? 'Circuito de alta potência (Ex: Chuveiro)' : 'Circuito doméstico padrão'}
            </span>
            <span className="font-mono text-[11px] text-slate-600">
              {voltage}V ÷ {resistance}Ω = {current.toFixed(1)}A
            </span>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

// FAQ Accordion
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#e2edf5] last:border-b-0 py-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left font-display text-base md:text-lg font-semibold text-[#0b1f3b] hover:text-[#1e6fff] transition cursor-pointer"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#1e6fff]' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-sm leading-relaxed text-slate-600 pr-6">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-white text-[#0b1f3b] selection:bg-[#1e6fff]/20 selection:text-[#1e6fff]">
      {/* Top Electric Energy Scroll Progress Bar */}
      <ScrollProgressBar />

      <a href="#landing-main" className="skip-link" data-testid="link-skip-to-content">
        Pular para o conteúdo principal
      </a>

      {/* Floating Header Navbar */}
      <header
        ref={navRef}
        className="fixed top-4 inset-x-4 z-50 mx-auto flex h-14 max-w-[1020px] items-center justify-between rounded-full border border-white/15 bg-[#0b1f3b]/90 px-4 pl-6 shadow-[0_16px_36px_rgba(11,31,59,.24)] backdrop-blur-xl transition-all"
      >
        <Brand inverse compact />

        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Navegação principal">
          <AnimatedNavLink href="#recursos" dark className="px-3 py-1.5 text-xs text-white/80 hover:text-white">
            Recursos
          </AnimatedNavLink>
          <AnimatedNavLink href="#demonstracao" dark className="px-3 py-1.5 text-xs text-white/80 hover:text-white">
            Simulador
          </AnimatedNavLink>
          <AnimatedNavLink href="#como-funciona" dark className="px-3 py-1.5 text-xs text-white/80 hover:text-white">
            Como funciona
          </AnimatedNavLink>
          <AnimatedNavLink href="#plataforma" dark className="px-3 py-1.5 text-xs text-white/80 hover:text-white">
            Plataforma
          </AnimatedNavLink>
          <AnimatedNavLink href="#faq" dark className="px-3 py-1.5 text-xs text-white/80 hover:text-white">
            Dúvidas
          </AnimatedNavLink>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`${basePath}/sign-in`}
            data-testid="link-header-entrar"
            className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium text-white/75 transition hover:text-white"
          >
            Entrar
          </a>
          <Magnet padding={40}>
            <a
              href={`${basePath}/sign-up`}
              data-testid="link-header-cadastro"
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0b1f3b] transition hover:bg-[#d7ebff] shadow-sm hover:scale-105 active:scale-95"
            >
              Começar grátis
            </a>
          </Magnet>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 md:hidden cursor-pointer"
            ref={menuButtonRef}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-16 mx-2 flex flex-col gap-2 rounded-2xl border border-[#d8e0ea] bg-white p-5 shadow-2xl text-[#0b1f3b] md:hidden"
            >
              <a href="#recursos" onClick={closeMenu} className="p-2 text-sm font-semibold hover:text-[#1e6fff]">Recursos</a>
              <a href="#demonstracao" onClick={closeMenu} className="p-2 text-sm font-semibold hover:text-[#1e6fff]">Simulador</a>
              <a href="#como-funciona" onClick={closeMenu} className="p-2 text-sm font-semibold hover:text-[#1e6fff]">Como funciona</a>
              <a href="#plataforma" onClick={closeMenu} className="p-2 text-sm font-semibold hover:text-[#1e6fff]">Plataforma</a>
              <a href="#faq" onClick={closeMenu} className="p-2 text-sm font-semibold hover:text-[#1e6fff]">Dúvidas</a>
              <a
                href={`${basePath}/sign-up`}
                onClick={closeMenu}
                className="mt-2 flex items-center justify-center rounded-xl bg-[#1e6fff] py-3 text-center text-sm font-bold text-white shadow-md shadow-[#1e6fff]/30"
              >
                Criar conta grátis
              </a>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section with React Bits Squares background */}
      <main id="landing-main" className="relative pt-24 md:pt-32">
        <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden px-5 md:px-8">
          {/* React Bits Squares Interactive Animated Grid */}
          <div className="absolute inset-0 z-0 opacity-45 pointer-events-auto">
            <Squares
              speed={0.3}
              squareSize={52}
              direction="diagonal"
              borderColor="rgba(200, 220, 245, 0.45)"
              hoverFillColor="rgba(30, 111, 255, 0.15)"
            />
          </div>

          {/* Ambient Glows */}
          <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 -z-10 size-[550px] rounded-full bg-[#1e6fff]/10 blur-[130px]" />
          <div className="pointer-events-none absolute right-10 top-1/3 -z-10 size-[350px] rounded-full bg-[#00d2ff]/10 blur-[100px]" />

          <div className="relative z-10 mx-auto max-w-[960px] text-center">
            {/* React Bits Shiny Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#cbe2f7] bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#004eba] shadow-xs backdrop-blur-sm"
            >
              <span className="size-2 rounded-full bg-[#1e6fff] animate-ping" />
              <ShinyText shimmerColor="rgba(30, 111, 255, 0.9)" speed={3.5}>
                ⚡ VOLTIVA 2.0 · Plataforma de Eficiência Elétrica
              </ShinyText>
            </motion.div>

            {/* Headline with React Bits SplitText */}
            <h1 className="mt-6 font-display text-[clamp(2.7rem,6vw,5.3rem)] font-extrabold leading-[1.03] tracking-[-0.055em] text-[#0b1f3b]">
              <SplitText text="Entenda sua energia." mode="words" delay={0.05} duration={0.6} textAlign="center" />
              <br />
              <span className="text-[#1e6fff]">
                <SplitText text="Decida com precisão." mode="words" delay={0.06} duration={0.6} textAlign="center" />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mt-6 max-w-[680px] text-base md:text-lg leading-relaxed text-slate-600 font-normal"
            >
              A Voltiva transforma cálculos da Lei de Ohm, mapeamento de equipamentos e custos em diagnósticos claros, rápidos e práticos para sua casa, projeto ou instalação.
            </motion.p>

            {/* Action Buttons with React Bits Magnet */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
            >
              <Magnet padding={50}>
                <a
                  href={`${basePath}/sign-up`}
                  data-testid="link-hero-cadastro"
                  className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#1e6fff] to-[#1255cc] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(30,111,255,0.35)] transition-all hover:shadow-[0_16px_34px_rgba(30,111,255,0.45)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Criar meu espaço grátis <ArrowRight size={17} />
                </a>
              </Magnet>

              <Magnet padding={50}>
                <a
                  href="#demonstracao"
                  data-testid="link-hero-plataforma"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#c8e4f7] bg-white/90 px-6 py-3.5 text-sm font-semibold text-[#0b3558] backdrop-blur-sm transition-all hover:border-[#1e6fff] hover:bg-white hover:text-[#1e6fff] shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                >
                  Testar simulador ao vivo
                </a>
              </Magnet>
            </motion.div>

            {/* Metrics Counters with React Bits CountUp */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mx-auto mt-14 grid max-w-[780px] grid-cols-2 gap-4 border-t border-[#dce7f2] pt-8 sm:grid-cols-4"
            >
              <div className="p-2 text-center sm:text-left">
                <p className="font-mono text-2xl md:text-3xl font-extrabold text-[#0b1f3b]">
                  <CountUp to={4} duration={1.5} />
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">Grandezas de Ohm</p>
              </div>

              <div className="p-2 text-center sm:text-left">
                <p className="font-mono text-2xl md:text-3xl font-extrabold text-[#1e6fff]">
                  <CountUp to={100} duration={1.8} suffix="%" />
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">Fórmulas Validadas</p>
              </div>

              <div className="p-2 text-center sm:text-left">
                <p className="font-mono text-2xl md:text-3xl font-extrabold text-[#0b1f3b]">
                  <CountUp to={12} duration={2} prefix="+" suffix="k" />
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">Cálculos Realizados</p>
              </div>

              <div className="p-2 text-center sm:text-left">
                <p className="font-mono text-2xl md:text-3xl font-extrabold text-emerald-600">
                  <CountUp to={35} duration={1.8} suffix="%" />
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">Economia Média</p>
              </div>
            </motion.div>
          </div>

          {/* 3D Tilted Dashboard Preview with HeroScrollContainer & ParallaxBadges */}
          <div className="relative z-10 mx-auto mt-14 w-full max-w-[1060px] px-2 md:mt-20">
            {/* Parallax Floating Circuit Badges */}
            <ParallaxBadge
              offset={40}
              className="hidden lg:flex absolute -left-8 top-16 z-20 items-center gap-3 rounded-2xl border border-[#c8e4f7] bg-white/95 px-4 py-2.5 shadow-[0_16px_36px_rgba(11,31,59,0.12)] backdrop-blur-md"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-[#eaf4ff] text-[#1e6fff] font-bold text-sm">
                U
              </span>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rede Elétrica</p>
                <p className="font-mono text-sm font-extrabold text-[#0b1f3b]">220 V</p>
              </div>
            </ParallaxBadge>

            <ParallaxBadge
              offset={-50}
              className="hidden lg:flex absolute -right-8 top-28 z-20 items-center gap-3 rounded-2xl border border-emerald-200 bg-white/95 px-4 py-2.5 shadow-[0_16px_36px_rgba(11,31,59,0.12)] backdrop-blur-md"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                P
              </span>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Potência Carga</p>
                <p className="font-mono text-sm font-extrabold text-emerald-600">5500 W</p>
              </div>
            </ParallaxBadge>

            <ParallaxBadge
              offset={30}
              className="hidden lg:flex absolute -left-6 bottom-16 z-20 items-center gap-3 rounded-2xl border border-indigo-200 bg-white/95 px-4 py-2.5 shadow-[0_16px_36px_rgba(11,31,59,0.12)] backdrop-blur-md"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm">
                R
              </span>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resistência</p>
                <p className="font-mono text-sm font-extrabold text-indigo-600">44,0 Ω</p>
              </div>
            </ParallaxBadge>

            <HeroScrollContainer>
              <TiltedCard maxAngle={7} scale={1.01} className="w-full">
                <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-[#c8e4f7] bg-white shadow-[0_25px_60px_rgba(11,31,59,0.14)]">
                  {/* Mockup Topbar */}
                  <div className="flex h-11 items-center justify-between border-b border-[#e2ecf5] bg-[#f8fbfe] px-5">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-[#ff5f56]" />
                      <span className="size-3 rounded-full bg-[#ffbd2e]" />
                      <span className="size-3 rounded-full bg-[#27c93f]" />
                      <span className="ml-3 font-mono text-xs text-slate-600">app.voltiva.com.br/dashboard</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      <span className="size-1.5 rounded-full bg-emerald-500" /> Supabase Conectado
                    </span>
                  </div>

                  {/* Mockup Workspace Interior */}
                  <div className="grid md:grid-cols-[210px_1fr] min-h-[380px] bg-[#fdfefe]">
                    <div className="hidden border-r border-[#e2ecf5] bg-[#f8fafc] p-4 md:block">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#0b1f3b]">
                        <img src={`${basePath}/logo.png`} alt="" className="size-6 object-contain" /> voltiva
                      </div>
                      <div className="mt-6 space-y-1 text-xs">
                        <div className="flex items-center gap-2 rounded-xl bg-[#1e6fff] px-3 py-2 font-semibold text-white">
                          <BarChart3 size={14} /> Visão geral
                        </div>
                        <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 hover:bg-[#eef4fb]">
                          <Calculator size={14} /> Calculadora de Ohm
                        </div>
                        <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 hover:bg-[#eef4fb]">
                          <Activity size={14} /> Consumo de Energia
                        </div>
                        <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 hover:bg-[#eef4fb]">
                          <CircleDollarSign size={14} /> Economia & Metas
                        </div>
                        <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 hover:bg-[#eef4fb]">
                          <Clock3 size={14} /> Histórico
                        </div>
                      </div>
                    </div>

                    <div className="p-5 md:p-7 space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-display text-lg font-bold text-[#0b1f3b]">Painel de Controle Voltiva</h4>
                          <p className="text-xs text-slate-500">Mapeamento em tempo real de grandezas e custos</p>
                        </div>
                        <span className="rounded-lg bg-[#1e6fff] px-3 py-1.5 text-xs font-bold text-white shadow-xs">
                          Novo Cálculo +
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-xl border border-[#e2ecf5] bg-white p-3.5 shadow-2xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Cálculos no Histórico</span>
                          <p className="mt-2 font-mono text-xl font-bold text-[#0b1f3b]">14 salvos</p>
                          <span className="text-[11px] text-emerald-600 font-medium">↑ 3 novos hoje</span>
                        </div>
                        <div className="rounded-xl border border-[#e2ecf5] bg-white p-3.5 shadow-2xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Consumo Mensal</span>
                          <p className="mt-2 font-mono text-xl font-bold text-[#1e6fff]">186,4 kWh</p>
                          <span className="text-[11px] text-slate-500">6 aparelhos cadastrados</span>
                        </div>
                        <div className="rounded-xl border border-[#e2ecf5] bg-white p-3.5 shadow-2xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Economia Prevista</span>
                          <p className="mt-2 font-mono text-xl font-bold text-emerald-600">R$ 142,80</p>
                          <span className="text-[11px] text-emerald-600 font-medium">Meta em 78%</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#d6e6f5] bg-gradient-to-r from-[#eef7ff] to-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 place-items-center rounded-xl bg-[#1e6fff] text-white">
                            <Cpu size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#0b1f3b]">Resistor Limitador para LED 5V / 20mA</p>
                            <p className="text-[11px] text-slate-500">Último cálculo: R = 250 Ω · Cores: Vermelho, Verde, Marrom, Dourado</p>
                          </div>
                        </div>
                        <span className="hidden sm:inline-flex text-xs font-bold text-[#1e6fff]">Ver detalhes →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltedCard>
            </HeroScrollContainer>
          </div>
        </section>

        {/* Live Interactive Simulator Section */}
        <section id="demonstracao" className="relative z-10 py-20 md:py-28 bg-[#f5f9fd] border-t border-[#e2edf5]">
          <div className="mx-auto max-w-[1180px] px-5 md:px-8">
            <div className="text-center max-w-[680px] mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1e6fff]">
                Simulação Interativa
              </span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold tracking-tight text-[#0b1f3b]">
                Teste a precisão antes mesmo de entrar.
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-600">
                A tecnologia Voltiva foi construída para dar respostas diretas e fáceis de conferir, sem enrolação.
              </p>
            </div>

            <LiveCalculatorDemo />
          </div>
        </section>

        {/* Features Section with React Bits SpotlightCard */}
        <section id="recursos" className="relative z-10 py-20 md:py-28 bg-white">
          <div className="mx-auto max-w-[1180px] px-5 md:px-8">
            <div className="max-w-[620px]">
              <div className="inline-block rounded-full border border-[#d2e5f5] bg-[#eef6fc] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1e6fff]">
                <ShinyText shimmerColor="rgba(30, 111, 255, 0.8)">Recursos & Diagnóstico</ShinyText>
              </div>
              <h2 className="mt-4 font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0b1f3b]">
                Da dúvida elétrica à decisão inteligente.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Chega de planilhas desorganizadas ou cálculos manuais sujeitos a erro. Tenha precisão profissional com interface amigável.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-12">
              {/* Feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
                className="md:col-span-7"
              >
                <SpotlightCard
                  spotlightColor="rgba(30, 111, 255, 0.16)"
                  className="h-full p-7 hover:border-[#1e6fff]/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-lg bg-[#eef6fc] px-2.5 py-1 text-xs font-bold text-[#1e6fff]">01 · Precisão</span>
                    <span className="grid size-10 place-items-center rounded-xl bg-[#1e6fff] text-white">
                      <Calculator size={20} />
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-xl md:text-2xl font-bold tracking-tight text-[#0b1f3b]">
                    Calculadora da Lei de Ohm Guiada
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Calcule Tensão, Corrente, Resistência ou Potência com suporte a grandezas combinadas, visualizador 3D realista de resistor de 4 faixas e conversão automática de unidades.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-[#edf2f7]">
                    <span className="rounded-md bg-[#f1f5fa] px-2.5 py-1 text-xs font-medium text-slate-700">Fórmulas transparentes</span>
                    <span className="rounded-md bg-[#f1f5fa] px-2.5 py-1 text-xs font-medium text-slate-700">Resistor fotorrealista</span>
                    <span className="rounded-md bg-[#f1f5fa] px-2.5 py-1 text-xs font-medium text-slate-700">Validação de limites</span>
                  </div>
                </SpotlightCard>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
                className="md:col-span-5"
              >
                <SpotlightCard
                  spotlightColor="rgba(30, 111, 255, 0.16)"
                  className="h-full p-7 hover:border-[#1e6fff]/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-lg bg-[#eef6fc] px-2.5 py-1 text-xs font-bold text-[#1e6fff]">02 · Diagnóstico</span>
                    <span className="grid size-10 place-items-center rounded-xl bg-[#004eba] text-white">
                      <BarChart3 size={20} />
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-xl md:text-2xl font-bold tracking-tight text-[#0b1f3b]">
                    Mapeamento de Aparelhos
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Cadastre aparelhos com presets prontos (geladeira, ar-condicionado, chuveiro) e descubra instantaneamente o consumo em kWh/mês e o custo na conta.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-[#edf2f7]">
                    <span className="rounded-md bg-[#f1f5fa] px-2.5 py-1 text-xs font-medium text-slate-700">Presets com 1 clique</span>
                    <span className="rounded-md bg-[#f1f5fa] px-2.5 py-1 text-xs font-medium text-slate-700">Custo estimado em R$</span>
                  </div>
                </SpotlightCard>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
                className="md:col-span-5"
              >
                <SpotlightCard
                  spotlightColor="rgba(30, 111, 255, 0.16)"
                  className="h-full p-7 hover:border-[#1e6fff]/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-lg bg-[#eef6fc] px-2.5 py-1 text-xs font-bold text-[#1e6fff]">03 · Economia</span>
                    <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white">
                      <CircleDollarSign size={20} />
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-xl md:text-2xl font-bold tracking-tight text-[#0b1f3b]">
                    Metas & Oportunidades
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Defina sua meta mensal de energia e acompanhe uma barra de progresso inteligente com cores em camadas (verde, âmbar e vermelho) para evitar surpresas no fim do mês.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-[#edf2f7]">
                    <span className="rounded-md bg-[#f1f5fa] px-2.5 py-1 text-xs font-medium text-slate-700">Alerta de meta</span>
                    <span className="rounded-md bg-[#f1f5fa] px-2.5 py-1 text-xs font-medium text-slate-700">Simulação de corte</span>
                  </div>
                </SpotlightCard>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
                className="md:col-span-7"
              >
                <SpotlightCard
                  spotlightColor="rgba(30, 111, 255, 0.16)"
                  className="h-full p-7 hover:border-[#1e6fff]/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-lg bg-[#eef6fc] px-2.5 py-1 text-xs font-bold text-[#1e6fff]">04 · Histórico Completo</span>
                    <span className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white">
                      <Clock3 size={20} />
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-xl md:text-2xl font-bold tracking-tight text-[#0b1f3b]">
                    Raciocínio Preservado & Exportação CSV
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Cada cálculo salva os parâmetros de entrada originais, as fórmulas utilizadas e os pontos de cor do resistor. Filtre por grandeza, ordene ou baixe em planilha CSV para seus relatórios técnicos.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-[#edf2f7]">
                    <span className="rounded-md bg-[#f1f5fa] px-2.5 py-1 text-xs font-medium text-slate-700">Exportação CSV</span>
                    <span className="rounded-md bg-[#f1f5fa] px-2.5 py-1 text-xs font-medium text-slate-700">Filtros dinâmicos</span>
                    <span className="rounded-md bg-[#f1f5fa] px-2.5 py-1 text-xs font-medium text-slate-700">Busca em tempo real</span>
                  </div>
                </SpotlightCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="como-funciona" className="relative z-10 py-20 md:py-28 bg-[#f6f9fc] border-y border-[#e2edf5]">
          <div className="mx-auto max-w-[1180px] px-5 md:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#1e6fff]">
                  Fluxo Direto
                </span>
                <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold tracking-tight text-[#0b1f3b]">
                  Clareza em três movimentos simples.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  Não perca tempo tentando lembrar qual fórmula aplicar. A interface da Voltiva guia cada etapa com validações inteligentes.
                </p>
                <div className="mt-8">
                  <Magnet padding={40}>
                    <a
                      href={`${basePath}/sign-up`}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0b1f3b] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1a3a63]"
                    >
                      Experimentar gratuitamente <ArrowRight size={16} />
                    </a>
                  </Magnet>
                </div>
              </div>

              <div className="relative space-y-6 md:pl-10">
                <ScrollConduitLine />
                {[
                  {
                    num: '01',
                    title: 'Selecione a grandeza ou o equipamento',
                    desc: 'Escolha se deseja calcular Tensão (V), Corrente (A), Resistência (Ω) ou Potência (W), ou selecione um eletrodoméstico para mapear.',
                    icon: Zap,
                  },
                  {
                    num: '02',
                    title: 'Insira os valores que você conhece',
                    desc: 'A Voltiva detecta as entradas fornecidas e aplica a variação exata da Lei de Ohm sem que você precise deduzir algebricamente.',
                    icon: Layers,
                  },
                  {
                    num: '03',
                    title: 'Veja o resultado, o resistor e as dicas',
                    desc: 'Receba a resposta formatada, o código de cores do resistor fotorrealista e salve no seu histórico seguro com 1 clique.',
                    icon: CheckCircle2,
                  },
                ].map((step, idx) => (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] as const }}
                  >
                    <SpotlightCard
                      spotlightColor="rgba(30, 111, 255, 0.12)"
                      className="p-6 transition-all hover:translate-x-1"
                    >
                      <div className="flex items-start gap-4">
                        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#1e6fff] text-lg font-mono font-extrabold text-white shadow-md shadow-[#1e6fff]/25">
                          {step.num}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-lg font-bold text-[#0b1f3b]">{step.title}</h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.desc}</p>
                        </div>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data Clarity Section (Dark Navy) with SpotlightCards & ScrollTextHighlight */}
        <section id="plataforma" className="relative z-10 py-20 md:py-28 bg-[#0b1f3b] text-white overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 size-[500px] rounded-full bg-[#1e6fff]/10 blur-[140px]" />
          <div className="pointer-events-none absolute right-0 bottom-0 size-[400px] rounded-full bg-[#00d2ff]/10 blur-[140px]" />

          <div className="relative z-10 mx-auto max-w-[1180px] px-5 md:px-8">
            <div className="text-center max-w-[760px] mx-auto mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold text-[#8fc9eb]">
                <ShieldCheck size={14} /> Confiança e Transparência
              </div>
              <h2 className="mt-4 font-display text-3xl md:text-5xl font-extrabold tracking-tight">
                Número bom é número que você consegue conferir.
              </h2>
              <ScrollTextHighlight
                theme="dark"
                className="mt-6 text-base md:text-lg text-slate-300 leading-relaxed font-medium"
              >
                Na Voltiva, não existem fórmulas secretas ou índices obscuros. Cada resultado apresenta sua equação de origem e referências reconhecidas da física eletrotécnica.
              </ScrollTextHighlight>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <SpotlightCard
                spotlightColor="rgba(30, 111, 255, 0.3)"
                className="border-white/10 bg-white/5 p-6 backdrop-blur-sm text-white"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-[#1e6fff] text-white">
                  <Calculator size={20} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-white">Fórmulas 100% Transparentes</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Todas as equações de Ohm (V=R·I, P=V·I, P=R·I², P=V²/R) são exibidas na íntegra ao lado dos resultados.
                </p>
              </SpotlightCard>

              <SpotlightCard
                spotlightColor="rgba(30, 111, 255, 0.3)"
                className="border-white/10 bg-white/5 p-6 backdrop-blur-sm text-white"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-amber-500 text-white">
                  <Lightbulb size={20} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-white">Próximos Passos Acionáveis</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Não entregamos só um número: o sistema avisa sobre riscos de sobrecarga e sugere ações de economia imediatas.
                </p>
              </SpotlightCard>

              <SpotlightCard
                spotlightColor="rgba(30, 111, 255, 0.3)"
                className="border-white/10 bg-white/5 p-6 backdrop-blur-sm text-white sm:col-span-2 lg:col-span-1"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-500 text-white">
                  <Lock size={20} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-white">Segurança com RLS (Supabase)</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Seus dados e cálculos são protegidos por Row Level Security no banco PostgreSQL. Ninguém tem acesso além de você.
                </p>
              </SpotlightCard>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="relative z-10 py-20 md:py-28 bg-white">
          <div className="mx-auto max-w-[860px] px-5 md:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1e6fff]">
                Tira-Dúvidas
              </span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-extrabold tracking-tight text-[#0b1f3b]">
                Perguntas Frequentes
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Respostas rápidas para as principais dúvidas sobre a plataforma Voltiva.
              </p>
            </div>

            <div className="rounded-3xl border border-[#e2ecf5] bg-[#f9fcff] p-6 md:p-8">
              <FAQItem
                question="A Voltiva é gratuita para utilizar?"
                answer="Sim! O plano inicial permite calcular grandezas da Lei de Ohm de forma ilimitada, visualizar o resistor fotorrealista e cadastrar equipamentos para acompanhar seu consumo mensal."
              />
              <FAQItem
                question="Preciso instalar algum aplicativo no meu computador ou celular?"
                answer="Não, a Voltiva é 100% web e foi projetada para funcionar com perfeição em qualquer navegador moderno no computador, tablet ou smartphone."
              />
              <FAQItem
                question="Posso usar a plataforma mesmo sem internet?"
                answer="Sim! A Voltiva conta com modo local de contingência. Se você acessar como convidado ou perder a conexão, seus cálculos e equipamentos são salvos de forma segura no navegador."
              />
              <FAQItem
                question="Como funciona o cálculo das cores do resistor?"
                answer="O sistema converte o valor da resistência calculada no padrão internacional de 4 faixas (dígito 1, dígito 2, multiplicador e tolerância dourada/prata), renderizando um modelo 3D fotorrealista com linhas metálicas de alta definição."
              />
              <FAQItem
                question="Posso exportar meu histórico de cálculos?"
                answer="Sim! Com 1 clique na página de Histórico ou Relatórios, você pode exportar todos os seus cálculos e aparelhos em formato CSV para abrir no Excel, Google Planilhas ou relatórios de engenharia."
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section with React Bits StarBorder & Magnet */}
        <section id="cadastro" className="relative z-10 py-20 md:py-28 bg-gradient-to-b from-white to-[#e8f3fe] overflow-hidden">
          <div className="mx-auto max-w-[960px] px-5 md:px-8 text-center">
            <div className="rounded-3xl border border-[#c8e2f8] bg-gradient-to-br from-white via-[#f0f7ff] to-[#e4f1fd] p-8 md:p-14 shadow-[0_20px_60px_rgba(30,111,255,0.12)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d2e4f5] bg-white px-3.5 py-1 text-xs font-bold text-[#1e6fff]">
                <Sparkles size={14} /> Comece Agora
              </span>
              <h2 className="mt-5 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-[#0b1f3b]">
                Pronto para ter total controle da sua energia?
              </h2>
              <p className="mx-auto mt-4 max-w-[560px] text-base text-slate-600 leading-relaxed">
                Junte-se aos milhares de eletricistas, estudantes, engenheiros e proprietários que usam a Voltiva todos os dias.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Magnet padding={50}>
                  <a
                    href={`${basePath}/sign-up`}
                    data-testid="link-final-cadastro"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e6fff] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#1e6fff]/30 transition hover:bg-[#1557d6] hover:scale-105 active:scale-95"
                  >
                    Criar meu espaço grátis <ArrowRight size={17} />
                  </a>
                </Magnet>
              </div>

              <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-600">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Sem cartão de crédito</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Acesso imediato</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Modo local incluso</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-[#e2edf5] bg-white py-12">
          <div className="mx-auto max-w-[1180px] px-5 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-[#eef4f9]">
              <Brand compact />
              <p className="text-xs text-slate-500 max-w-md">
                Plataforma de inteligência e cálculo elétrico guiado pela Lei de Ohm para diagnósticos precisos e eficiência energética.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Todos os sistemas operacionais
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <p>© {new Date().getFullYear()} Voltiva. Todos os direitos reservados.</p>
              <div className="flex items-center gap-5">
                <a href="#recursos" className="hover:text-[#1e6fff] transition">Recursos</a>
                <a href="#demonstracao" className="hover:text-[#1e6fff] transition">Simulador</a>
                <a href="#faq" className="hover:text-[#1e6fff] transition">Dúvidas</a>
                <a href={`${basePath}/sign-in`} className="hover:text-[#1e6fff] transition">Entrar na Conta</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
