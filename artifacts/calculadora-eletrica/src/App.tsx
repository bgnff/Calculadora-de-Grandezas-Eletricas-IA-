import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import CalculatorPage from '@/pages/calculator';
import { VoltivaShell } from '@/components/voltiva-shell';
import { ProfileOnboarding } from '@/components/profile-onboarding';
import { useEnergyProfile } from '@/hooks/use-energy-profile';
import { useState } from 'react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const { profile, draft, updateDraft, beginEditing, completeProfile } = useEnergyProfile();
  const [editing, setEditing] = useState(false);
  const [skippedThisSession, setSkippedThisSession] = useState(false);

  if ((!profile && !skippedThisSession) || editing) {
    return (
      <ProfileOnboarding
        draft={draft}
        editing={editing}
        onDraftChange={updateDraft}
        onComplete={(nextDraft) => {
          completeProfile(nextDraft);
          setEditing(false);
          setSkippedThisSession(false);
        }}
        onCancel={() => setEditing(false)}
        onSkip={() => setSkippedThisSession(true)}
      />
    );
  }

  return (
    <VoltivaShell
      profileIncomplete={!profile}
      onResumeProfile={() => setSkippedThisSession(false)}
      onEditProfile={() => {
        beginEditing();
        setEditing(true);
      }}
    >
      <CalculatorPage />
    </VoltivaShell>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
