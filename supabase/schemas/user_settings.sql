-- ============================================================================
-- Entidade: user_settings
-- Descrição: Metas e preferências de acompanhamento do usuário
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

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_goal NUMERIC NOT NULL DEFAULT 120 CHECK (monthly_goal > 0),
  currency TEXT NOT NULL DEFAULT 'R$',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

COMMENT ON TABLE public.user_settings IS 'Preferências e metas de consumo energético por usuário';
COMMENT ON COLUMN public.user_settings.monthly_goal IS 'Meta de consumo mensal em kWh';
COMMENT ON COLUMN public.user_settings.currency IS 'Símbolo monetário adotado para estimativas';

DROP TRIGGER IF EXISTS set_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER set_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Permissões básicas para roles autenticadas e anônimas
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_settings TO anon, authenticated;

-- Políticas de RLS (Idempotentes)
DROP POLICY IF EXISTS "Usuários podem ver suas próprias configurações" ON public.user_settings;
CREATE POLICY "Usuários podem ver suas próprias configurações"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar suas próprias configurações" ON public.user_settings;
CREATE POLICY "Usuários podem criar suas próprias configurações"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias configurações" ON public.user_settings;
CREATE POLICY "Usuários podem atualizar suas próprias configurações"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem remover suas próprias configurações" ON public.user_settings;
CREATE POLICY "Usuários podem remover suas próprias configurações"
ON public.user_settings FOR DELETE
USING (auth.uid() = user_id);
