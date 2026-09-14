-- ============================================================================
-- Migração Inicial: 202609140001_initial_schema.sql
-- Projeto: Voltiva — Plataforma de Eficiência Elétrica
-- Descrição: Criação completa de tabelas, índices, triggers e RLS policies
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função genérica para atualização do timestamp updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::TEXT, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. Tabela: profiles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  goal TEXT CHECK (goal IN ('learn', 'save', 'plan', 'diagnose')),
  interests TEXT[] DEFAULT '{}'::TEXT[],
  knowledge_level TEXT CHECK (knowledge_level IN ('beginner', 'familiar', 'advanced')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Trigger automático para vincular novo usuário de auth.users ao profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem inserir seu próprio perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem excluir seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem excluir seu próprio perfil"
ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 2. Tabela: energy_profile_drafts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.energy_profile_drafts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  step INTEGER NOT NULL DEFAULT 0 CHECK (step >= 0 AND step <= 2),
  goal TEXT CHECK (goal IN ('', 'learn', 'save', 'plan', 'diagnose')) DEFAULT '',
  interests TEXT[] DEFAULT '{}'::TEXT[],
  knowledge_level TEXT CHECK (knowledge_level IN ('', 'beginner', 'familiar', 'advanced')) DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

DROP TRIGGER IF EXISTS set_energy_profile_drafts_updated_at ON public.energy_profile_drafts;
CREATE TRIGGER set_energy_profile_drafts_updated_at
BEFORE UPDATE ON public.energy_profile_drafts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.energy_profile_drafts ENABLE ROW LEVEL SECURITY;

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

-- ----------------------------------------------------------------------------
-- 3. Tabela: calculations
-- ----------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_calculations_user_created
ON public.calculations (user_id, created_at DESC);

ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;

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

-- ----------------------------------------------------------------------------
-- 4. Tabela: energy_devices
-- ----------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_energy_devices_user_created
ON public.energy_devices (user_id, created_at DESC);

DROP TRIGGER IF EXISTS set_energy_devices_updated_at ON public.energy_devices;
CREATE TRIGGER set_energy_devices_updated_at
BEFORE UPDATE ON public.energy_devices
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.energy_devices ENABLE ROW LEVEL SECURITY;

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

-- ----------------------------------------------------------------------------
-- 5. Tabela: user_settings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_goal NUMERIC NOT NULL DEFAULT 120 CHECK (monthly_goal > 0),
  currency TEXT NOT NULL DEFAULT 'R$',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

DROP TRIGGER IF EXISTS set_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER set_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

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
