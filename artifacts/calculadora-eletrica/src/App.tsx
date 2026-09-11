import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
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
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
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
    fontFamily: 'Manrope, sans-serif',
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
    <main className="min-h-[100dvh] overflow-hidden bg-[hsl(var(--background))]">
       <div className="pointer-events-none absolute -right-20 -top-24 size-[28rem] rounded-full bg-[#dcecff]/75 blur-3xl" />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-10 md:py-8">
        <Brand />
        <div className="flex items-center gap-2">
          <a href={`${basePath}/sign-in`} className="rounded-xl px-3 py-2 text-sm font-bold text-[hsl(var(--muted-foreground))] transition hover:bg-white hover:text-[hsl(var(--foreground))]">Entrar</a>
           <a href={`${basePath}/sign-up`} className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#004eba]">Criar conta</a>
        </div>
      </header>
      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:pb-28 md:pt-20">
        <div>
           <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c9dcf2] bg-[#eaf2ff] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-[#004eba]"><span className="size-1.5 rounded-full bg-[#006bff]" /> Clareza para cada grandeza</p>
           <h1 className="max-w-3xl font-display text-[clamp(3rem,7vw,5.8rem)] font-bold leading-[0.98] tracking-[-0.075em] text-[hsl(var(--foreground))]">Energia bem entendida muda decisões.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">A Voltiva reúne cálculo elétrico, acompanhamento de consumo e histórico em um espaço simples para quem quer agir com mais confiança.</p>
           <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href={`${basePath}/sign-up`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-white shadow-[0_15px_30px_rgba(71,103,136,.12)] transition hover:-translate-y-0.5 hover:bg-[#004eba]">Começar agora <span aria-hidden="true">→</span></a><a href={`${basePath}/sign-in`} className="inline-flex items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-white px-5 py-3.5 text-sm font-bold text-[hsl(var(--foreground))] transition hover:border-[#9bbce0]">Já tenho uma conta</a></div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]"><span>Fórmulas de Ohm</span><span>Código de cores</span><span>Histórico por conta</span></div>
        </div>
        <div className="relative">
           <div className="absolute inset-8 rounded-[32px] bg-[#e55cff]/20 blur-2xl" />
          <div className="soft-shadow relative rounded-[28px] border border-[#c9e3df] bg-white p-5 sm:p-7">
             <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-5"><Brand compact /><span className="rounded-full bg-[#e6f0ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#004eba]">Ao vivo</span></div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Calculadora elétrica</p>
            <div className="mt-3 rounded-2xl bg-[#eaf2ff] p-5"><p className="text-sm font-medium text-[#004eba]">Resultado de resistência</p><div className="mt-2 flex items-end gap-2"><strong className="font-data text-5xl font-medium tracking-[-0.08em] text-[#0b3558]">600</strong><span className="mb-1 font-data text-base text-[#476788]">Ω</span></div><p className="mt-4 border-t border-[#c9dcf2] pt-3 font-data text-xs text-[#476788]">R = V ÷ I · 12 V ÷ 0,02 A</p></div>
            <div className="mt-5 grid grid-cols-4 gap-2">{['Azul', 'Preto', 'Marrom', 'Dourado'].map((item, index) => <div key={item} className="rounded-xl bg-[#f6f9f8] p-2 text-center"><span className={`mx-auto block size-5 rounded-full ${['bg-[#3466a1]', 'bg-[#202b30]', 'bg-[#8d5c32]', 'bg-[#d8a940]'][index]}`} /><span className="mt-2 block truncate text-[10px] font-bold text-[hsl(var(--muted-foreground))]">{item}</span></div>)}</div>
          </div>
        </div>
      </section>
      <section className="relative border-t border-[hsl(var(--border))] bg-white/70"><div className="mx-auto grid max-w-6xl gap-4 px-5 py-10 md:grid-cols-3 md:px-10"><Feature title="Calcule sem ruído" text="Tensão, corrente, resistência e potência com validações claras." icon="01" /><Feature title="Entenda o resultado" text="Visualização automática do resistor em quatro faixas." icon="02" /><Feature title="Continue de onde parou" text="Seu perfil, histórico e equipamentos ficam organizados na sua conta." icon="03" /></div></section>
    </main>
  );
}

function Feature({ title, text, icon }: { title: string; text: string; icon: string }) {
  return <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/80 p-5"><span className="font-data text-xs font-bold text-[#2d958c]">{icon}</span><h2 className="mt-4 font-display text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p></div>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2"><span className={`${compact ? 'size-8 rounded-lg' : 'size-10 rounded-xl'} grid place-items-center bg-[hsl(var(--sidebar))] text-[#65dfd9]`}><img src={`${basePath}/logo.svg`} alt="" className="size-full p-1.5" /></span><span className={`${compact ? 'text-lg' : 'text-[24px]'} font-display font-bold tracking-[-0.05em] text-[hsl(var(--foreground))]`}>voltiva</span></div>;
}

function SignInPage() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[hsl(var(--background))] px-4 py-8"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>;
}

function SignUpPage() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[hsl(var(--background))] px-4 py-8"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>;
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
  return <div className="grid min-h-[100dvh] place-items-center bg-[hsl(var(--background))]"><div className="text-center"><Brand /><p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">Preparando seu espaço...</p></div></div>;
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