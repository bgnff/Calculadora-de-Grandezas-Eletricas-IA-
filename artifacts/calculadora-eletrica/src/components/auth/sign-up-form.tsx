import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Loader2, Lock, Mail, User, AlertCircle, CheckCircle2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function SignUpForm() {
  const { signUp, signInAsGuest, isConfigured } = useAuth();
  const [, setLocation] = useLocation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      const msg = 'Por favor, preencha todos os campos obrigatórios.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'A senha deve ter pelo menos 6 caracteres.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'As senhas informadas não coincidem.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const { data: _data, error, user } = await signUp(email.trim(), password, fullName.trim()) as any;
      if (error) {
        let msg = error.message || 'Erro ao criar conta. Tente novamente.';
        if (error.message.includes('User already registered')) {
          msg = 'Já existe uma conta cadastrada com este e-mail. Faça login.';
        }
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      if (user?.identities && user.identities.length === 0) {
        const msg = 'Este e-mail já está cadastrado.';
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      const success = isConfigured
        ? 'Conta criada com sucesso! Redirecionando...'
        : 'Espaço criado em Modo Local! Redirecionando...';
      setSuccessMessage(success);
      toast.success(success);
      setTimeout(() => {
        setLocation('/app/dashboard');
      }, 800);
    } catch {
      const msg = 'Ocorreu um erro inesperado ao realizar o cadastro.';
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
    <div className="w-full rounded-[24px] border border-[#e2e8f0] bg-white p-7 shadow-[0_20px_60px_rgba(11,31,59,.12)] sm:p-9" data-testid="form-sign-up">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-[#0b1f3b]">
          Crie sua conta Voltiva
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Comece a transformar cálculos e consumo em decisões elétricas mais claras.
        </p>
      </div>

      {!isConfigured && (
        <div className="mb-5 rounded-2xl border border-[#bfe0fb] bg-[#f0f7ff] p-3.5 text-xs text-[#0b3558] shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-[#004eba]">
            <Sparkles size={15} className="text-[#1e6fff]" />
            <span>Modo Local / Convidado Ativo</span>
          </div>
          <p className="mt-1 text-slate-600 leading-relaxed">
            Sem Supabase configurado? Você pode se cadastrar localmente ou clicar em <strong>Acessar como Convidado</strong> para navegar direto.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs leading-5 text-red-700" role="alert">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs leading-5 text-emerald-700" role="status">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Nome completo
          </label>
          <div className="flex h-11 items-center rounded-xl border border-[#d7ebff] bg-[#f8fafc] px-3.5 transition focus-within:border-[#1e6fff] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e6fff]/20">
            <User size={16} className="mr-2.5 text-[#8aa2c0]" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Como quer ser chamado?"
              autoComplete="name"
              className="h-full w-full bg-transparent text-sm text-[#0b1f3b] outline-none placeholder:text-slate-400"
              data-testid="input-sign-up-name"
            />
          </div>
        </div>

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
              data-testid="input-sign-up-email"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Senha (mínimo de 6 caracteres)
          </label>
          <div className="flex h-11 items-center rounded-xl border border-[#d7ebff] bg-[#f8fafc] px-3.5 transition focus-within:border-[#1e6fff] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e6fff]/20">
            <Lock size={16} className="mr-2.5 text-[#8aa2c0]" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              className="h-full w-full bg-transparent text-sm text-[#0b1f3b] outline-none placeholder:text-slate-400"
              data-testid="input-sign-up-password"
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

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Confirmar senha
          </label>
          <div className="flex h-11 items-center rounded-xl border border-[#d7ebff] bg-[#f8fafc] px-3.5 transition focus-within:border-[#1e6fff] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e6fff]/20">
            <Lock size={16} className="mr-2.5 text-[#8aa2c0]" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              className="h-full w-full bg-transparent text-sm text-[#0b1f3b] outline-none placeholder:text-slate-400"
              data-testid="input-sign-up-confirm-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
              className="ml-2 cursor-pointer text-slate-400 transition hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1e6fff] text-sm font-bold text-white shadow-md shadow-[#1e6fff]/25 transition hover:bg-[#1557d6] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="button-submit-sign-up"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Criando conta...</span>
            </>
          ) : (
            <>
              <span>Criar conta gratuita</span>
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
          data-testid="button-guest-sign-up"
        >
          <Sparkles size={16} className="text-[#1e6fff]" />
          <span>Acessar como Convidado (Modo Local)</span>
        </button>
      </form>

      <div className="mt-6 border-t border-[#edf2f7] pt-5 text-center text-xs text-slate-600">
        Já possui uma conta?{' '}
        <Link href="/sign-in" className="cursor-pointer font-bold text-[#1e6fff] hover:underline" data-testid="link-to-sign-in">
          Fazer login
        </Link>
      </div>
    </div>
  );
}
