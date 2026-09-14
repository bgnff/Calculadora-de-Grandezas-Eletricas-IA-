-- ============================================================================
-- Entidade: user_settings
-- Descrição: Metas e preferências de acompanhamento do usuário
-- ============================================================================

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

CREATE POLICY "Usuários podem ver suas próprias configurações"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias configurações"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover suas próprias configurações"
ON public.user_settings FOR DELETE
USING (auth.uid() = user_id);
