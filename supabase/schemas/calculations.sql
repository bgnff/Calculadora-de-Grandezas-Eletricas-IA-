-- ============================================================================
-- Entidade: calculations
-- Descrição: Registro dos cálculos de Ohm salvos pelo usuário
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('voltage', 'current', 'resistance', 'power')),
  result NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  formula TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

COMMENT ON TABLE public.calculations IS 'Histórico de cálculos elétricos salvos pelo usuário';
COMMENT ON COLUMN public.calculations.type IS 'Grandeza calculada (voltage, current, resistance, power)';
COMMENT ON COLUMN public.calculations.result IS 'Valor numérico do resultado obtido';
COMMENT ON COLUMN public.calculations.unit IS 'Unidade de medida (V, A, Ω, W)';
COMMENT ON COLUMN public.calculations.formula IS 'Fórmula matemática da lei de Ohm utilizada';
COMMENT ON COLUMN public.calculations.inputs IS 'JSON com os parâmetros de entrada informados';

-- Índice para acelerar a busca de histórico ordenada por data mais recente
CREATE INDEX IF NOT EXISTS idx_calculations_user_created
ON public.calculations (user_id, created_at DESC);

ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;

-- Permissões básicas para roles autenticadas e anônimas
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.calculations TO anon, authenticated;

-- Políticas de RLS (Idempotentes)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios cálculos" ON public.calculations;
CREATE POLICY "Usuários podem ver seus próprios cálculos"
ON public.calculations FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem salvar seus próprios cálculos" ON public.calculations;
CREATE POLICY "Usuários podem salvar seus próprios cálculos"
ON public.calculations FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios cálculos" ON public.calculations;
CREATE POLICY "Usuários podem atualizar seus próprios cálculos"
ON public.calculations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir seus próprios cálculos" ON public.calculations;
CREATE POLICY "Usuários podem excluir seus próprios cálculos"
ON public.calculations FOR DELETE
USING (auth.uid() = user_id);
