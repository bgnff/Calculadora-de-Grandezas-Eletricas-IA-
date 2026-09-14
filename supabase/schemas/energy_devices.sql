-- ============================================================================
-- Entidade: energy_devices
-- Descrição: Equipamentos elétricos cadastrados para estimativa de consumo
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

CREATE TABLE IF NOT EXISTS public.energy_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  watts NUMERIC NOT NULL CHECK (watts > 0),
  hours_per_day NUMERIC NOT NULL CHECK (hours_per_day > 0 AND hours_per_day <= 24),
  days_per_month NUMERIC NOT NULL CHECK (days_per_month > 0 AND days_per_month <= 31),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

COMMENT ON TABLE public.energy_devices IS 'Equipamentos cadastrados no mapa de consumo do usuário';
COMMENT ON COLUMN public.energy_devices.name IS 'Identificação ou nome do equipamento (ex: Geladeira, Chuveiro)';
COMMENT ON COLUMN public.energy_devices.watts IS 'Potência nominal em Watts informada pelo usuário';
COMMENT ON COLUMN public.energy_devices.hours_per_day IS 'Tempo médio de utilização em horas por dia';
COMMENT ON COLUMN public.energy_devices.days_per_month IS 'Dias de funcionamento por mês';

DROP TRIGGER IF EXISTS set_energy_devices_updated_at ON public.energy_devices;
CREATE TRIGGER set_energy_devices_updated_at
BEFORE UPDATE ON public.energy_devices
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Índice para carregamento de equipamentos por usuário
CREATE INDEX IF NOT EXISTS idx_energy_devices_user_created
ON public.energy_devices (user_id, created_at DESC);

ALTER TABLE public.energy_devices ENABLE ROW LEVEL SECURITY;

-- Permissões básicas para roles autenticadas e anônimas
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.energy_devices TO anon, authenticated;

-- Políticas de RLS (Idempotentes)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios equipamentos" ON public.energy_devices;
CREATE POLICY "Usuários podem ver seus próprios equipamentos"
ON public.energy_devices FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem cadastrar seus próprios equipamentos" ON public.energy_devices;
CREATE POLICY "Usuários podem cadastrar seus próprios equipamentos"
ON public.energy_devices FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem alterar seus próprios equipamentos" ON public.energy_devices;
CREATE POLICY "Usuários podem alterar seus próprios equipamentos"
ON public.energy_devices FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem remover seus próprios equipamentos" ON public.energy_devices;
CREATE POLICY "Usuários podem remover seus próprios equipamentos"
ON public.energy_devices FOR DELETE
USING (auth.uid() = user_id);
