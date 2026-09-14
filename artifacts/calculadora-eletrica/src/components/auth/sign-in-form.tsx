import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Loader2, Lock, Mail, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function SignInForm() {
  const { signIn, signInAsGuest, isConfigured } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      const msg = 'Por favor, informe seu e-mail e sua senha.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        let msg = error.message || 'Falha ao entrar. Tente novamente.';
        if (error.message.includes('Invalid login credentials')) {
          msg = 'E-mail ou senha incorretos. Verifique suas credenciais.';
        } else if (error.message.includes('Email not confirmed')) {
          msg = 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
        }
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }
      if (!isConfigured) {
        toast.success(`Entrando em Modo Local com ${email.trim()}!`);
      } else {
        toast.success('Bem-vindo de volta!');
      }
      setLocation('/app/dashboard');
    } catch {
      const msg = 'Ocorreu um erro inesperado ao realizar o login.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await signInAsGuest();
      toast.success('Acesso liberado como Convidado (Modo Local)!');
      setLocation('/app/dashboard');
    } catch {
      toast.error('Não foi possível iniciar o modo convidado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[24px] border border-[#e2e8f0] bg-white p-7 shadow-[0_20px_60px_rgba(11,31,59,.12)] sm:p-9" data-testid="form-sign-in">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-[#0b1f3b]">
          Entre na Voltiva
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Acesse seu espaço para continuar organizando suas decisões elétricas.
        </p>
      </div>

      {!isConfigured && (
        <div className="mb-5 rounded-2xl border border-[#bfe0fb] bg-[#f0f7ff] p-3.5 text-xs text-[#0b3558] shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-[#004eba]">
            <Sparkles size={15} className="text-[#1e6fff]" />
            <span>Modo Local / Convidado Ativo</span>
          </div>
          <p className="mt-1 text-slate-600 leading-relaxed">
            O Supabase ainda não foi configurado. Você pode <strong>entrar com qualquer e-mail</strong> ou clicar no botão de acesso rápido abaixo para testar tudo sem restrições.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs leading-5 text-red-700" role="alert">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            E-mail
          </label>
          <div className="flex h-11 items-center rounded-xl border border-[#d7ebff] bg-[#f8fafc] px-3.5 transition focus-within:border-[#1e6fff] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e6fff]/20">
            <Mail size={16} className="mr-2.5 text-[#8aa2c0]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              autoComplete="email"
              required
              className="h-full w-full bg-transparent text-sm text-[#0b1f3b] outline-none placeholder:text-slate-400"
              data-testid="input-sign-in-email"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Senha
            </label>
            <Link
              href="/forgot-password"
              className="cursor-pointer text-xs font-semibold text-[#1e6fff] transition hover:text-[#1557d6] hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="flex h-11 items-center rounded-xl border border-[#d7ebff] bg-[#f8fafc] px-3.5 transition focus-within:border-[#1e6fff] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e6fff]/20">
            <Lock size={16} className="mr-2.5 text-[#8aa2c0]" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="h-full w-full bg-transparent text-sm text-[#0b1f3b] outline-none placeholder:text-slate-400"
              data-testid="input-sign-in-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              className="ml-2 cursor-pointer text-slate-400 transition hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1e6fff] text-sm font-bold text-white shadow-md shadow-[#1e6fff]/25 transition hover:bg-[#1557d6] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="button-submit-sign-in"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Entrando...</span>
            </>
          ) : (
            <>
              <span>Acessar espaço</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#e2e8f0]" />
          </div>
          <span className="relative bg-white px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            ou
          </span>
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
          className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#c8e4f7] bg-[#f0f7ff] text-sm font-bold text-[#004eba] shadow-sm transition hover:border-[#1e6fff] hover:bg-[#e1f0ff] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="button-guest-sign-in"
        >
          <Sparkles size={16} className="text-[#1e6fff]" />
          <span>Acessar como Convidado (Modo Local)</span>
        </button>
      </form>

      <div className="mt-6 border-t border-[#edf2f7] pt-5 text-center text-xs text-slate-600">
        Ainda não tem conta?{' '}
        <Link href="/sign-up" className="cursor-pointer font-bold text-[#1e6fff] hover:underline" data-testid="link-to-sign-up">
          Cadastre-se gratuitamente
        </Link>
      </div>
    </div>
  );
}
