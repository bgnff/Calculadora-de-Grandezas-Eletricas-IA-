import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { BlurReveal } from '@/components/blur-reveal';
import Rays from '@/components/light-rays';
import { ProfileOnboarding } from '@/components/profile-onboarding';
import { VoltivaShell } from '@/components/voltiva-shell';
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
    colorPrimary: '#006bff',
    colorForeground: '#0b3558',
    colorMutedForeground: '#476788',
    colorDanger: '#b04f4c',
    colorBackground: '#ffffff',
    colorInput: '#f0f3f8',
    colorInputForeground: '#0b3558',
    colorNeutral: '#d4e0ed',
    fontFamily: 'Lato, Arial, sans-serif',
    borderRadius: '0.5rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'font-display text-[#0b3558]',
    headerSubtitle: 'text-[#476788]',
    socialButtonsBlockButtonText: 'text-[#0b3558]',
    formFieldLabel: 'text-[#0b3558]',
    footerActionLink: 'text-[#006bff]',
    footerActionText: 'text-[#476788]',
    dividerText: 'text-[#476788]',
    formFieldSuccessText: 'text-[#287b76]',
    alertText: 'text-[#b04f4c]',
    logoBox: 'rounded-xl overflow-hidden',
    socialButtonsBlockButton: 'border-[#d4e0ed] hover:bg-[#f0f3f8]',
    formButtonPrimary: 'bg-[#006bff] hover:bg-[#004eba] text-white',
    formFieldInput: 'border-[#d4e0ed] bg-[#f0f3f8] text-[#0b3558]',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-[#d4e0ed]',
    alert: 'bg-[#fff6f5] border-[#efcfcc]',
    otpCodeFieldInput: 'border-[#d4e0ed]',
    formFieldRow: 'gap-2',
    main: 'bg-transparent',
  },
};

function LandingPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#fafaf9]">
      <Rays backgroundColor="hsl(var(--background))" forceAnimation style={{ zIndex: 0 }} />
      <div className="pointer-events-none absolute -left-[340px] top-10 z-[1] size-[620px] rounded-full border-[10px] border-[#e8e6e5]/55" />
      <div className="pointer-events-none absolute -right-[380px] top-[500px] z-[1] size-[700px] rounded-full border-[10px] border-[#e8e6e5]/45" />

      <header className="relative z-10 mx-auto flex max-w-[1024px] items-center justify-between px-5 py-5 md:px-8 md:py-4">
        <Brand />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          <a href="#recursos" className="rounded-full px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">Recursos</a>
          <a href="#como-funciona" className="rounded-full px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">Como funciona</a>
          <a href="#recursos" className="rounded-full px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">Plataforma <span className="ml-1 text-[10px]">⌄</span></a>
          <a href="#recursos" className="rounded-full px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">Guias</a>
          <span className="mx-2 h-4 w-px bg-[hsl(var(--border))]" />
          <div className="flex -space-x-1.5" aria-label="Comunidade Voltiva">
            {['V', 'O', 'E', 'R'].map((letter, index) => <span key={letter} className={`grid size-6 place-items-center rounded-full border-2 border-[#fafaf9] text-[9px] font-bold text-white ${['bg-[#0b3558]', 'bg-[#3ba6f1]', 'bg-[#7a9bb9]', 'bg-[#4c6f8f]'][index]}`}>{letter}</span>)}
          </div>
        </nav>
        <div className="flex items-center gap-1">
          <a href={`${basePath}/sign-in`} className="rounded-full px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">Entrar</a>
          <a href={`${basePath}/sign-up`} className="rounded-lg bg-[#3ba6f1] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#3398e1]">Começar grátis</a>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-[1024px] px-5 pb-8 pt-20 md:px-8 md:pt-24">
        <div className="max-w-[720px]">
          <h1 className="font-display text-[clamp(2.65rem,5.2vw,4.35rem)] font-normal leading-[1.05] tracking-[-0.055em] text-[hsl(var(--foreground))]">
            <BlurReveal className="inline-block" forceAnimation>A </BlurReveal>
            <BlurReveal className="inline-block rounded-md bg-[#c1e1f7] px-2 text-[#2873a8]" delay={0.12} forceAnimation>energia simples e prática</BlurReveal>
            <br />
            <BlurReveal className="inline-block" delay={0.28} forceAnimation>para decisões melhores.</BlurReveal>
          </h1>
          <p className="mt-6 max-w-[610px] text-base leading-7 text-[hsl(var(--muted-foreground))]">Calcule, acompanhe e entenda sua energia em um espaço claro, feito para transformar números elétricos em decisões do dia a dia.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={`${basePath}/sign-up`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3ba6f1] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#3398e1]">Começar grátis <span aria-hidden="true">→</span></a>
            <a href={`${basePath}/sign-in`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[#f1f0ee] px-5 py-2.5 text-sm text-[hsl(var(--muted-foreground))] transition hover:border-[#c9c6c2] hover:text-[hsl(var(--foreground))]">Ver a calculadora <span aria-hidden="true">⌁</span></a>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[hsl(var(--border))] pt-5 text-xs font-medium text-[#a8a29e] sm:border-t-0 sm:pt-0">
          <span>Fórmulas de Ohm</span>
          <span>Código de cores</span>
          <span>Consumo mensal</span>
          <span>Histórico por conta</span>
        </div>
        <p className="mt-7 text-xs text-[#a8a29e]"><span className="mr-2 tracking-[0.16em] text-[#78716c]">★★★★★</span> Uma leitura mais simples para cada grandeza elétrica.</p>

        <DashboardPreview />
      </section>

      <section id="recursos" className="relative z-10 border-t border-[hsl(var(--border))] bg-white/75">
        <div className="mx-auto grid max-w-[1024px] gap-4 px-5 py-16 md:grid-cols-3 md:px-8">
          <Feature title="Calcule sem ruído" text="Tensão, corrente, resistência e potência com validações claras." icon="01" />
          <Feature title="Entenda o resultado" text="Visualização automática e explicações para cada resposta." icon="02" />
          <Feature title="Continue de onde parou" text="Seu perfil, histórico e equipamentos ficam organizados na sua conta." icon="03" />
        </div>
      </section>
    </main>
  );
}

function DashboardPreview() {
  const bars = [38, 56, 44, 72, 50, 66, 82, 58, 91, 70, 62, 78, 48, 68, 84, 54, 73, 88, 64, 79, 57, 76, 92, 69];
  return (
    <div id="como-funciona" className="relative mt-8 md:mt-10">
       <div className="absolute -right-1 -top-7 z-10 grid size-14 rotate-6 place-items-center overflow-hidden rounded-[20px] border-4 border-[#fafaf9] bg-[#0b3558] shadow-[0_8px_18px_rgba(12,52,88,.18)]"><img src={`${basePath}/logo.png`} alt="" className="size-full object-contain p-1.5" /></div>
      <div className="soft-shadow overflow-hidden rounded-[16px] border border-[#e8e6e5] bg-white p-2 md:p-3">
        <div className="grid min-h-[430px] overflow-hidden rounded-[10px] border border-[#e8e6e5] bg-[#fbfbfa] sm:grid-cols-[148px_minmax(0,1fr)]">
          <aside className="hidden border-r border-[#e8e6e5] bg-white p-4 sm:block">
             <div className="flex items-center gap-2 text-xs font-medium text-[#0c0a09]"><span className="grid size-6 place-items-center overflow-hidden rounded-md bg-[#0b3558]"><img src={`${basePath}/logo.png`} alt="" className="size-full object-contain p-0.5" /></span> voltiva</div>
            <p className="mt-8 text-[9px] uppercase tracking-[0.14em] text-[#a8a29e]">Seu espaço</p>
            <div className="mt-3 space-y-1.5 text-[11px] text-[#78716c]">
              <div className="rounded-md bg-[#eaf5fc] px-2.5 py-2 font-medium text-[#2873a8]">Visão geral</div>
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

function Feature({ title, text, icon }: { title: string; text: string; icon: string }) {
  return <div className="soft-shadow rounded-2xl border border-[hsl(var(--border))] bg-white p-5"><span className="font-data text-xs font-bold text-[#3398e1]">{icon}</span><h2 className="mt-4 font-display text-lg">{title}</h2><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p></div>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2"><span className={`${compact ? 'size-8 rounded-lg' : 'size-10 rounded-xl'} grid shrink-0 place-items-center overflow-hidden`}><img src={`${basePath}/logo.png`} alt="" className="size-full object-cover" /></span><span className={`${compact ? 'text-lg' : 'text-[24px]'} font-display font-medium tracking-[-0.05em] text-[hsl(var(--foreground))]`}>voltiva</span></div>;
}

function SignInPage() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[#fafaf9] px-4 py-8"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>;
}

function SignUpPage() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[#fafaf9] px-4 py-8"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>;
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