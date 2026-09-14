-- ============================================================================
-- Entidade: energy_profile_drafts
-- Descrição: Rascunho das etapas do questionário de perfil do usuário
-- ============================================================================

-- Garante que a função de updated_at existe caso este script seja executado isoladamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::TEXT, now());
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.energy_profile_drafts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  step INTEGER NOT NULL DEFAULT 0 CHECK (step >= 0 AND step <= 2),
  goal TEXT CHECK (goal IN ('', 'learn', 'save', 'plan', 'diagnose')) DEFAULT '',
  interests TEXT[] DEFAULT '{}'::TEXT[],
  knowledge_level TEXT CHECK (knowledge_level IN ('', 'beginner', 'familiar', 'advanced')) DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

COMMENT ON TABLE public.energy_profile_drafts IS 'Rascunho temporário do onboarding energético por usuário';

DROP TRIGGER IF EXISTS set_energy_profile_drafts_updated_at ON public.energy_profile_drafts;
CREATE TRIGGER set_energy_profile_drafts_updated_at
BEFORE UPDATE ON public.energy_profile_drafts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.energy_profile_drafts ENABLE ROW LEVEL SECURITY;

-- Permissões básicas para roles autenticadas e anônimas
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.energy_profile_drafts TO anon, authenticated;

-- Políticas de RLS (Idempotentes)
DROP POLICY IF EXISTS "Usuários podem ver seu próprio rascunho" ON public.energy_profile_drafts;
CREATE POLICY "Usuários podem ver seu próprio rascunho"
ON public.energy_profile_drafts FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar seu próprio rascunho" ON public.energy_profile_drafts;
CREATE POLICY "Usuários podem criar seu próprio rascunho"
ON public.energy_profile_drafts FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio rascunho" ON public.energy_profile_drafts;
CREATE POLICY "Usuários podem atualizar seu próprio rascunho"
ON public.energy_profile_drafts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir seu próprio rascunho" ON public.energy_profile_drafts;
CREATE POLICY "Usuários podem excluir seu próprio rascunho"
ON public.energy_profile_drafts FOR DELETE
USING (auth.uid() = user_id);
