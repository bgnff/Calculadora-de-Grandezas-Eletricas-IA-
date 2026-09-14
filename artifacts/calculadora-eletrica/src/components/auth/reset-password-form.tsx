import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Loader2, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function ResetPasswordForm() {
  const { updatePassword } = useAuth();
  const [, setLocation] = useLocation();
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

    if (password.length < 6) {
      const msg = 'A nova senha deve possuir pelo menos 6 caracteres.';
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
      const { error } = await updatePassword(password);
      if (error) {
        const msg = error.message || 'Erro ao atualizar a senha. Tente novamente.';
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      const success = 'Senha atualizada com sucesso! Redirecionando...';
      setSuccessMessage(success);
      toast.success(success);
      setTimeout(() => {
        setLocation('/app/dashboard');
      }, 1500);
    } catch {
      const msg = 'Ocorreu um erro ao atualizar a senha.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[24px] border border-[#e2e8f0] bg-white p-7 shadow-[0_20px_60px_rgba(11,31,59,.12)] sm:p-9" data-testid="form-reset-password">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-[#0b1f3b]">
          Defina sua nova senha
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Crie uma nova senha de acesso para o seu espaço Voltiva.
        </p>
      </div>

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
            Nova senha
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
              data-testid="input-reset-password"
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
            Confirmar nova senha
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
              data-testid="input-reset-confirm-password"
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
          data-testid="button-submit-reset-password"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Atualizando...</span>
            </>
          ) : (
            <>
              <span>Salvar nova senha</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-[#edf2f7] pt-5 text-center text-xs text-slate-600">
        <Link href="/sign-in" className="cursor-pointer font-bold text-[#1e6fff] hover:underline">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
