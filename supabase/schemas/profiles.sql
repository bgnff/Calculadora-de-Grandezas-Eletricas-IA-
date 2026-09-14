-- ============================================================================
-- Entidade: profiles
-- Descrição: Perfil energético do usuário vinculado a auth.users
-- ============================================================================

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

-- Comentários das colunas
COMMENT ON TABLE public.profiles IS 'Perfil de usuário e preferências energéticas da Voltiva';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário correspondente a auth.users(id)';
COMMENT ON COLUMN public.profiles.goal IS 'Objetivo principal na plataforma';
COMMENT ON COLUMN public.profiles.interests IS 'Áreas de interesse selecionadas';
COMMENT ON COLUMN public.profiles.knowledge_level IS 'Nível de conhecimento elétrico';

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::TEXT, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para criar perfil automaticamente no cadastro em auth.users
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

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem excluir seu próprio perfil"
ON public.profiles FOR DELETE
USING (auth.uid() = id);
