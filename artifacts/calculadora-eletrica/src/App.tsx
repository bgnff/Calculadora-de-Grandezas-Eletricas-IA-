import { type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ArrowRight, BarChart3, Calculator, CheckCircle2, CircleDollarSign, Clock3, Lightbulb, Menu, ShieldCheck, X } from 'lucide-react';
import { MotionConfig, motion, useInView } from 'framer-motion';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/error-boundary';
import Rays from '@/components/light-rays';
import { ProfileOnboarding } from '@/components/profile-onboarding';
import { VoltivaShell } from '@/components/voltiva-shell';
import { WalkingLoader } from '@/components/walking-loader';
import { AnimatedEnergyLines } from '@/components/animated-energy-lines';
import { AnimatedNavLink } from '@/components/animated-nav-link';
import { ScrollHighlightText } from '@/components/scroll-highlight-text';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
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
import { LandingPage } from '@/pages/landing-page';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
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
  '/forgot-password': {
    title: 'Recuperar senha | Voltiva',
    description: 'Recupere o acesso ao seu espaço Voltiva.',
    robots: 'noindex, nofollow',
  },
  '/reset-password': {
    title: 'Definir nova senha | Voltiva',
    description: 'Defina uma nova senha para sua conta Voltiva.',
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




function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return <div className="landing-brand flex items-center gap-2"><img src={`${basePath}/logo.png`} alt="" className={`landing-brand__logo ${compact ? 'size-8' : 'size-10'} shrink-0 object-contain`} /><span className={`landing-brand__wordmark ${compact ? 'text-lg' : 'text-[24px]'} font-display font-medium tracking-[-0.05em] ${inverse ? 'text-white' : 'text-[hsl(var(--foreground))]'}`}>voltiva</span></div>;
}

function AuthLayout({ children, mode }: { children: ReactNode; mode: 'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password' }) {
  const isSignIn = mode === 'sign-in';
  const isSignUp = mode === 'sign-up';
  const isForgotPassword = mode === 'forgot-password';

  const badgeText = isSignIn
    ? 'Seu espaço de energia'
    : isSignUp
      ? 'Comece com a Voltiva'
      : isForgotPassword
        ? 'Recuperação de conta'
        : 'Redefinição de senha';

  const headlineText = isSignIn
    ? 'Decisões elétricas mais claras.'
    : isSignUp
      ? 'Organize sua energia desde o primeiro cálculo.'
      : isForgotPassword
        ? 'Recupere o controle do seu espaço.'
        : 'Sua segurança em primeiro lugar.';

  const descriptionText = isSignIn
    ? 'Acompanhe seus cálculos, consumo e próximos passos em um espaço feito para você.'
    : isSignUp
      ? 'Crie seu espaço Voltiva para salvar cálculos e transformar números em decisões melhores.'
      : isForgotPassword
        ? 'Enviaremos instruções seguras para você restaurar seu acesso em poucos instantes.'
        : 'Defina uma nova senha forte para manter suas decisões e dados protegidos.';

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
              {badgeText}
            </span>
            <h1 className="mt-5 max-w-md font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.055em]">
              {headlineText}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
              {descriptionText}
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
  return (
    <AuthLayout mode="sign-in">
      <SignInForm />
    </AuthLayout>
  );
}

function SignUpPage() {
  return (
    <AuthLayout mode="sign-up">
      <SignUpForm />
    </AuthLayout>
  );
}

function ForgotPasswordPage() {
  return (
    <AuthLayout mode="forgot-password">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

function ResetPasswordPage() {
  return (
    <AuthLayout mode="reset-password">
      <ResetPasswordForm />
    </AuthLayout>
  );
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Redirect to="/app/dashboard" /> : <LandingPage />;
}

function AppRoute() {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect to="/" />;
  const section = location.split('/app/')[1]?.split('/')[0] || 'dashboard';
  const validSections = ['dashboard', 'calculator', 'consumption', 'savings', 'history', 'reports', 'settings'];
  if (!validSections.includes(section)) return <NotFound />;
  return <AuthenticatedApp section={section} />;
}

function AuthenticatedApp({ section }: { section: string }) {
  const { user, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [skippedThisSession, setSkippedThisSession] = useState(false);
  if (!user) return <LoadingScreen />;
  const profileState = useEnergyProfile(user.id);
  const data = useVoltivaData(user.id);
  const userName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'por aqui';

  if ((!profileState.profile && !skippedThisSession) || editing) {
    return <ProfileOnboarding draft={profileState.draft} editing={editing} onDraftChange={profileState.updateDraft} onComplete={(draft) => { profileState.completeProfile(draft); setEditing(false); setSkippedThisSession(false); }} onCancel={() => setEditing(false)} onSkip={() => { setEditing(false); setSkippedThisSession(true); }} />;
  }

  const page = section === 'calculator' ? <CalculatorPage onSaveCalculation={data.saveCalculation} /> :
    section === 'consumption' ? <ConsumptionPage data={data} /> :
      section === 'savings' ? <SavingsPage data={data} /> :
        section === 'history' ? <HistoryPage calculations={data.calculations} clearCalculations={data.clearCalculations} removeCalculation={data.removeCalculation} /> :
          section === 'reports' ? <ReportsPage calculations={data.calculations} devices={data.devices} /> :
            section === 'settings' ? <SettingsPage profile={profileState.profile} onEditProfile={() => { profileState.beginEditing(); setEditing(true); }} data={data} userEmail={user.email || ''} onSignOut={() => signOut()} /> :
              <DashboardPage userName={userName} profile={profileState.profile} data={data} />;

  return <VoltivaShell profileIncomplete={!profileState.profile} onResumeProfile={() => { setSkippedThisSession(false); }} onEditProfile={() => { profileState.beginEditing(); setEditing(true); }}>{page}</VoltivaShell>;
}

function LoadingScreen() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-[#f8fafc]">
      <div className="flex flex-col items-center">
        <div className="relative mb-6 grid size-16 place-items-center">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-[#1e6fff]/15" />
          <div className="relative grid size-14 place-items-center rounded-2xl border border-[#c9dcf2] bg-white shadow-lg shadow-[#1e6fff]/10">
            <img src={`${basePath}/logo.png`} alt="" className="size-8 object-contain" />
          </div>
        </div>
        <Brand />
        <div className="mt-4 flex items-center gap-2">
          <span className="size-2 animate-bounce rounded-full bg-[#1e6fff]" style={{ animationDelay: '0ms' }} />
          <span className="size-2 animate-bounce rounded-full bg-[#1e6fff]" style={{ animationDelay: '150ms' }} />
          <span className="size-2 animate-bounce rounded-full bg-[#1e6fff]" style={{ animationDelay: '300ms' }} />
          <p className="ml-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Preparando seu espaço...</p>
        </div>
      </div>
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function AppRoutes() {
  return (
    <AuthProvider>
      <RouteMetadata />
      <Toaster position="top-right" richColors closeButton expand={false} />
      <QueryClientProvider client={queryClient}>
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/" component={HomeRoute} />
            <Route path="/sign-in" component={SignInPage} />
            <Route path="/sign-up" component={SignUpPage} />
            <Route path="/forgot-password" component={ForgotPasswordPage} />
            <Route path="/reset-password" component={ResetPasswordPage} />
            <Route path="/app/:section?" component={AppRoute} />
            <Route component={NotFound} />
          </Switch>
        </RoutedErrorBoundary>
      </QueryClientProvider>
    </AuthProvider>
  );
}

function App() {
  return <WouterRouter base={basePath}><AppRoutes /></WouterRouter>;
}

export default App;