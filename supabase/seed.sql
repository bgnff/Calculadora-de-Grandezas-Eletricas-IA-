-- ============================================================================
-- Seed de Exemplo: supabase/seed.sql
-- Descrição: Dados demonstrativos para ambiente de desenvolvimento local
-- ============================================================================

DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Seleciona o primeiro usuário encontrado em auth.users (se existir)
  SELECT id INTO demo_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

  IF demo_user_id IS NOT NULL THEN
    -- Atualiza perfil
    UPDATE public.profiles
    SET goal = 'save',
        interests = ARRAY['fundamentals', 'consumption', 'savings'],
        knowledge_level = 'familiar',
        completed_at = now()
    WHERE id = demo_user_id;

    -- Limpa registros de exemplo anteriores do usuário para evitar duplicatas em re-execuções
    DELETE FROM public.energy_devices WHERE user_id = demo_user_id;
    DELETE FROM public.calculations WHERE user_id = demo_user_id;

    -- Inserção de equipamentos de exemplo
    INSERT INTO public.energy_devices (user_id, name, watts, hours_per_day, days_per_month)
    VALUES
      (demo_user_id, 'Geladeira Duplex Frost Free', 150, 12, 30),
      (demo_user_id, 'Ar-condicionado Inverter 9000 BTUs', 800, 6, 25),
      (demo_user_id, 'Micro-ondas', 1200, 0.5, 30),
      (demo_user_id, 'Computador Desktop + Monitor', 250, 8, 22);

    -- Inserção de cálculo elétrico inicial
    INSERT INTO public.calculations (user_id, type, result, unit, formula, inputs)
    VALUES
      (demo_user_id, 'resistance', 55, 'Ω', 'R = V / I', '{"voltage":"220","current":"4"}'::jsonb),
      (demo_user_id, 'power', 880, 'W', 'P = V × I', '{"voltage":"220","current":"4"}'::jsonb);

    -- Inserção de configurações
    INSERT INTO public.user_settings (user_id, monthly_goal, currency)
    VALUES (demo_user_id, 150, 'R$')
    ON CONFLICT (user_id) DO UPDATE
    SET monthly_goal = 150;

    RAISE NOTICE 'Seed aplicado com sucesso para o usuário: %', demo_user_id;
  ELSE
    RAISE NOTICE 'Nenhum usuário encontrado em auth.users. Crie uma conta pelo app ou painel de autenticação antes de rodar o seed.';
  END IF;
END $$;
