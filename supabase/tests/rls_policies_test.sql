-- ============================================================================
-- Teste de Políticas de RLS (Row Level Security)
-- Arquivo: supabase/tests/rls_policies_test.sql
-- Descrição: Valida o isolamento de dados entre usuários e o bloqueio a anônimos
-- ============================================================================

BEGIN;

-- 1. Criação de usuários simulados para teste
DO $$
DECLARE
  user_a UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
  user_b UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
BEGIN
  -- Insere usuários de teste em auth.users se não existirem
  INSERT INTO auth.users (id, email)
  VALUES (user_a, 'usuario_a@voltiva.com'), (user_b, 'usuario_b@voltiva.com')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Teste: Inserção direta simulando usuário A
  -- Define claims de autenticação como Usuário A
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_a::text)::text, true);

  -- Inserir cálculo para Usuário A
  INSERT INTO public.calculations (id, user_id, type, result, unit, formula, inputs)
  VALUES ('c0000000-0000-0000-0000-000000000001'::UUID, user_a, 'resistance', 100, 'Ω', 'R = V / I', '{"voltage":"200","current":"2"}');

  -- Inserir equipamento para Usuário A
  INSERT INTO public.energy_devices (id, user_id, name, watts, hours_per_day, days_per_month)
  VALUES ('d0000000-0000-0000-0000-000000000001'::UUID, user_a, 'Ventilador', 60, 8, 30);

  -- Inserir configuração para Usuário A
  INSERT INTO public.user_settings (user_id, monthly_goal, currency)
  VALUES (user_a, 100, 'R$');

  -- Validar que Usuário A consegue ler seus próprios registros
  IF NOT EXISTS (SELECT 1 FROM public.calculations WHERE id = 'c0000000-0000-0000-0000-000000000001'::UUID) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Usuário A não conseguiu ler seu próprio cálculo';
  END IF;

  -- 3. Teste: Alterna para Usuário B e tenta acessar dados de Usuário A
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_b::text)::text, true);

  -- Usuário B NÃO deve conseguir ver o cálculo de Usuário A
  IF EXISTS (SELECT 1 FROM public.calculations WHERE id = 'c0000000-0000-0000-0000-000000000001'::UUID) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Vazamento de dados! Usuário B conseguiu ler o cálculo de Usuário A';
  END IF;

  -- Usuário B NÃO deve conseguir ver os equipamentos de Usuário A
  IF EXISTS (SELECT 1 FROM public.energy_devices WHERE id = 'd0000000-0000-0000-0000-000000000001'::UUID) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Vazamento de dados! Usuário B conseguiu ler o equipamento de Usuário A';
  END IF;

  -- Usuário B NÃO deve conseguir ver as configurações de Usuário A
  IF EXISTS (SELECT 1 FROM public.user_settings WHERE user_id = user_a) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Vazamento de dados! Usuário B conseguiu ler a configuração de Usuário A';
  END IF;

  -- Usuário B tenta atualizar registro de Usuário A (deve falhar ou não afetar nenhuma linha)
  UPDATE public.calculations SET result = 999 WHERE id = 'c0000000-0000-0000-0000-000000000001'::UUID;
  IF FOUND THEN
    RAISE EXCEPTION 'TESTE FALHOU: Usuário B conseguiu atualizar registro de Usuário A!';
  END IF;

  -- Usuário B tenta excluir registro de Usuário A (deve falhar ou não afetar nenhuma linha)
  DELETE FROM public.calculations WHERE id = 'c0000000-0000-0000-0000-000000000001'::UUID;
  IF FOUND THEN
    RAISE EXCEPTION 'TESTE FALHOU: Usuário B conseguiu excluir registro de Usuário A!';
  END IF;

  -- 4. Teste: Alterna para usuário anônimo (não autenticado)
  PERFORM set_config('request.jwt.claims', '', true);

  IF EXISTS (SELECT 1 FROM public.calculations WHERE id = 'c0000000-0000-0000-0000-000000000001'::UUID) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Anônimo conseguiu ler cálculos privados!';
  END IF;

  IF EXISTS (SELECT 1 FROM public.energy_devices WHERE id = 'd0000000-0000-0000-0000-000000000001'::UUID) THEN
    RAISE EXCEPTION 'TESTE FALHOU: Anônimo conseguiu ler equipamentos privados!';
  END IF;

  RAISE NOTICE 'TODOS OS TESTES DE RLS PASSARAM COM SUCESSO!';
END $$;

ROLLBACK;
