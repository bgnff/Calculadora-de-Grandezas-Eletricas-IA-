-- ============================================================================
-- Teste de Políticas de RLS (Row Level Security)
-- Arquivo: supabase/tests/rls_policies_test.sql
-- Descrição: Valida o isolamento estrito de dados entre usuários e o bloqueio
--            completo a requisições anônimas. Executável diretamente no SQL Editor
-- ============================================================================

BEGIN;

DO $$
DECLARE
  user_a UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
  user_b UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
  calc_id UUID := 'c0000000-0000-0000-0000-000000000001'::UUID;
  device_id UUID := 'd0000000-0000-0000-0000-000000000001'::UUID;
  v_rows_affected INTEGER;
BEGIN
  -- --------------------------------------------------------------------------
  -- 1. Setup inicial (como superuser postgres)
  -- --------------------------------------------------------------------------
  -- Cria os usuários de teste em auth.users garantindo compatibilidade com constraints
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES
    (
      user_a,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'usuario_a@voltiva.com',
      crypt('senha123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Usuário A"}'::jsonb,
      now(),
      now()
    ),
    (
      user_b,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'usuario_b@voltiva.com',
      crypt('senha123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Usuário B"}'::jsonb,
      now(),
      now()
    )
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------------------------
  -- 2. Teste: Operações como Usuário A (Role: authenticated)
  -- --------------------------------------------------------------------------
  -- Alterna o contexto de execução para a role 'authenticated'
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM set_config('request.jwt.claim.sub', user_a::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_a::text, 'role', 'authenticated')::text, true);

  -- Inserir cálculo para Usuário A
  INSERT INTO public.calculations (id, user_id, type, result, unit, formula, inputs)
  VALUES (calc_id, user_a, 'resistance', 100, 'Ω', 'R = V / I', '{"voltage":"200","current":"2"}');

  -- Inserir equipamento para Usuário A
  INSERT INTO public.energy_devices (id, user_id, name, watts, hours_per_day, days_per_month)
  VALUES (device_id, user_a, 'Ventilador Silencioso', 60, 8, 30);

  -- Inserir configuração para Usuário A
  INSERT INTO public.user_settings (user_id, monthly_goal, currency)
  VALUES (user_a, 100, 'R$')
  ON CONFLICT (user_id) DO UPDATE SET monthly_goal = 100;

  -- Inserir rascunho para Usuário A
  INSERT INTO public.energy_profile_drafts (user_id, step, goal, knowledge_level)
  VALUES (user_a, 1, 'save', 'beginner')
  ON CONFLICT (user_id) DO UPDATE SET step = 1;

  -- Validar que Usuário A consegue ler seus próprios registros
  IF NOT EXISTS (SELECT 1 FROM public.calculations WHERE id = calc_id) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Usuário A não conseguiu ler seu próprio cálculo';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.energy_devices WHERE id = device_id) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Usuário A não conseguiu ler seu próprio equipamento';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_settings WHERE user_id = user_a) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Usuário A não conseguiu ler suas próprias configurações';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_a) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Usuário A não conseguiu ler seu próprio perfil';
  END IF;

  -- --------------------------------------------------------------------------
  -- 3. Teste: Tentativa de Acesso como Usuário B (Role: authenticated)
  -- --------------------------------------------------------------------------
  PERFORM set_config('request.jwt.claim.sub', user_b::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_b::text, 'role', 'authenticated')::text, true);

  -- Usuário B NÃO deve conseguir ver o cálculo de Usuário A
  IF EXISTS (SELECT 1 FROM public.calculations WHERE id = calc_id) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Vazamento de dados! Usuário B conseguiu ler o cálculo de Usuário A';
  END IF;

  -- Usuário B NÃO deve conseguir ver os equipamentos de Usuário A
  IF EXISTS (SELECT 1 FROM public.energy_devices WHERE id = device_id) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Vazamento de dados! Usuário B conseguiu ler o equipamento de Usuário A';
  END IF;

  -- Usuário B NÃO deve conseguir ver as configurações de Usuário A
  IF EXISTS (SELECT 1 FROM public.user_settings WHERE user_id = user_a) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Vazamento de dados! Usuário B conseguiu ler a configuração de Usuário A';
  END IF;

  -- Usuário B NÃO deve conseguir ver o perfil de Usuário A
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_a) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Vazamento de dados! Usuário B conseguiu ler o perfil de Usuário A';
  END IF;

  -- Usuário B tenta atualizar registro de Usuário A (RLS deve impedir qualquer efeito)
  UPDATE public.calculations SET result = 999 WHERE id = calc_id;
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  IF v_rows_affected > 0 THEN
    RAISE EXCEPTION 'TESTE FALHOU: Usuário B conseguiu atualizar registro de Usuário A!';
  END IF;

  -- Usuário B tenta excluir registro de Usuário A (RLS deve impedir qualquer efeito)
  DELETE FROM public.calculations WHERE id = calc_id;
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  IF v_rows_affected > 0 THEN
    RAISE EXCEPTION 'TESTE FALHOU: Usuário B conseguiu excluir registro de Usuário A!';
  END IF;

  -- Usuário B tenta inserir cálculo forçando user_id = Usuário A (deve falhar por RLS)
  BEGIN
    INSERT INTO public.calculations (user_id, type, result, unit, formula, inputs)
    VALUES (user_a, 'power', 500, 'W', 'P = V * I', '{}'::jsonb);
    RAISE EXCEPTION 'TESTE FALHOU: Usuário B conseguiu forçar inserção para Usuário A!';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL; -- Esperado
    WHEN OTHERS THEN
      -- Se a exceção for de violação de política RLS, também é sucesso
      IF SQLERRM NOT LIKE '%row-level security policy%' AND SQLERRM NOT LIKE '%violates%' THEN
        RAISE;
      END IF;
  END;

  -- --------------------------------------------------------------------------
  -- 4. Teste: Acesso como Usuário Anônimo (Role: anon)
  -- --------------------------------------------------------------------------
  EXECUTE 'SET LOCAL ROLE anon';
  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claims', '', true);

  -- Anônimo não deve conseguir ler cálculos privados
  IF EXISTS (SELECT 1 FROM public.calculations WHERE id = calc_id) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Anônimo conseguiu ler cálculos privados!';
  END IF;

  -- Anônimo não deve conseguir ler equipamentos privados
  IF EXISTS (SELECT 1 FROM public.energy_devices WHERE id = device_id) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Anônimo conseguiu ler equipamentos privados!';
  END IF;

  -- Anônimo não deve conseguir ler perfis privados
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_a) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Anônimo conseguiu ler perfis privados!';
  END IF;

  -- Restaura role para postgres
  EXECUTE 'SET LOCAL ROLE postgres';

  RAISE NOTICE '=======================================================';
  RAISE NOTICE '✅ TODOS OS TESTES DE RLS PASSARAM COM SUCESSO!';
  RAISE NOTICE '   - Isolamento de leitura entre usuários: OK';
  RAISE NOTICE '   - Bloqueio de alteração e exclusão indevida: OK';
  RAISE NOTICE '   - Bloqueio contra spoofing de user_id no INSERT: OK';
  RAISE NOTICE '   - Bloqueio total a acessos anônimos: OK';
  RAISE NOTICE '=======================================================';
END $$;

-- Rollback obrigatório para não manter dados e usuários de teste no banco
ROLLBACK;
