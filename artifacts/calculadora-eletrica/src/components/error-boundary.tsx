import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  /** Changing this clears a caught error. Pass the route to recover on navigation. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error(String(value));
  }
}

function DefaultFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <main className="grid min-h-[100dvh] w-full place-items-center bg-[#f5f7fa] p-6 text-[#0b1f3b]" role="alert">
      <div className="w-full max-w-lg rounded-[28px] border border-[#d8e0ea] bg-white p-8 text-center shadow-[0_18px_50px_rgba(11,31,59,.10)]">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#fff4df] text-[#b26b00]">
          <TriangleAlert size={27} />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#1e6fff]">Voltiva</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em]">
          Não foi possível carregar esta parte
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#64748b]">
          Ocorreu um erro inesperado. Tente novamente; seus outros dados continuam protegidos.
        </p>
        {/* Dev only: messages can carry API responses and other internals. */}
        {import.meta.env.DEV ? (
          <pre className="mt-4 overflow-x-auto rounded-xl bg-[#f5f7fa] p-3 text-left text-xs text-[#475569]">
            {error.message || String(error)}
          </pre>
        ) : null}
        <button
          type="button"
          onClick={resetError}
          className="focus-ring mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1e6fff] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1557d6]"
        >
          <RefreshCw size={16} /> Tentar novamente
        </button>
      </div>
    </main>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error(
        'ErrorBoundary caught an error:',
        toError(error),
        info.componentStack,
      );
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.error !== null &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }
    const Fallback = this.props.FallbackComponent ?? DefaultFallback;
    return <Fallback error={error} resetError={this.resetError} />;
  }
}
