import { useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ArrowRight, Loader2, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      const msg = 'Por favor, informe o seu e-mail cadastrado.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        const msg = error.message || 'Erro ao solicitar recuperação de senha.';
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      const success = 'Instruções enviadas! Verifique sua caixa de entrada e a pasta de spam.';
      setSuccessMessage(success);
      toast.success(success);
    } catch {
      const msg = 'Ocorreu um erro ao processar a solicitação.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[24px] border border-[#e2e8f0] bg-white p-7 shadow-[0_20px_60px_rgba(11,31,59,.12)] sm:p-9" data-testid="form-forgot-password">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-[#0b1f3b]">
          Recupere seu acesso
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Informe o e-mail da sua conta para receber um link de redefinição de senha.
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
            E-mail cadastrado
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
              data-testid="input-forgot-password-email"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1e6fff] text-sm font-bold text-white shadow-md shadow-[#1e6fff]/25 transition hover:bg-[#1557d6] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="button-submit-forgot-password"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Enviando link...</span>
            </>
          ) : (
            <>
              <span>Enviar link de recuperação</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-[#edf2f7] pt-5 text-center text-xs text-slate-600">
        <Link href="/sign-in" className="inline-flex cursor-pointer items-center gap-1.5 font-bold text-[#1e6fff] hover:underline" data-testid="link-back-to-sign-in">
          <ArrowLeft size={14} /> Voltar para o login
        </Link>
      </div>
    </div>
  );
}
