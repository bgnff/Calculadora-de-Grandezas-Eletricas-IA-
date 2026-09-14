# Nova Arquitetura do Sistema (Supabase + Netlify)

Este documento descreve a nova arquitetura da plataforma **Voltiva — Plataforma de Eficiência Elétrica**, projetada para ser totalmente desacoplada de fornecedores restritivos (Replit e Clerk) e pronta para produção e escalabilidade com **Supabase** e **Netlify**.

---

## 1. Diagrama Geral da Arquitetura

```text
       ┌───────────────────────────────┐
       │            USUÁRIO            │
       └──────────────┬────────────────┘
                      │ (HTTPS / Web)
                      ▼
       ┌───────────────────────────────┐
       │       NETLIFY (EDGE/CDN)      │
       │  • Hospedagem Estática        │
       │  • Rewrite SPA (/* -> index)  │
       │  • Headers de Segurança       │
       └──────────────┬────────────────┘
                      │
                      ▼
       ┌───────────────────────────────┐
       │       FRONTEND (VITE/REACT)   │
       │  • React 19 + TypeScript      │
       │  • Tailwind CSS v4            │
       │  • Wouter SPA Routing         │
       │  • Camada de Serviços         │
       │  • AuthContext Nativo         │
       └──────────────┬────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │  HTTPS / WSS (REST / RLS) │
        ▼                           ▼
┌──────────────────┐       ┌────────────────────────────────┐
│  SUPABASE AUTH   │       │     SUPABASE POSTGRESQL        │
│ • Sign In/Up     │       │ • Tabelas (profiles,           │
│ • Magic Links    │       │   calculations, devices, etc.) │
│ • Password Reset │       │ • Row Level Security (RLS)     │
│ • JWT Tokens     │       │ • Triggers & Procedures        │
└──────────────────┘       └────────────────────────────────┘
```

---

## 2. Frontend Moderno e Portável

* **Framework & Bundler**: React 19 executado via Vite 7 com `@vitejs/plugin-react` e `@tailwindcss/vite`.
* **Desacoplamento**:
  * O arquivo `vite.config.ts` foi limpo de qualquer plugin ou variável exclusiva de Replit.
  * Porta padrão local: `5173`.
  * Base path padrão: `/`.
  * Diretório de build: `dist`.
* **Roteamento SPA**:
  * Mantido com `wouter`, gerenciando rotas públicas (`/`, `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`) e rotas autenticadas sob o prefixo `/app/` (`/app/dashboard`, `/app/calculator`, `/app/consumption`, `/app/savings`, `/app/history`, `/app/reports`, `/app/settings`).
* **Camada de Autenticação Nativa**:
  * Substituição total do Clerk por um contexto nativo React (`AuthContext`) conectado ao `@supabase/supabase-js`.
  * Interface própria estilizada com os tokens Voltiva (formulários de Login, Cadastro e Recuperação de Senha) perfeitamente integrados ao `AuthLayout` split-screen.

---

## 3. Backend e Dados: Supabase

### 3.1 Autenticação (`auth.users`)
* O Supabase Auth é a autoridade de identidade da aplicação.
* Cada usuário cadastrado recebe um identificador único `auth.users(id)` (UUID).
* Credenciais, senhas encriptadas com bcrypt e confirmações são tratadas com segurança dentro do Supabase, sem nunca expor chaves administrativas (`service_role`) no frontend.

### 3.2 Banco de Dados Relacional (PostgreSQL)
A base de dados é estruturada sob o schema `public` com integridade referencial rigorosa:

1. **`profiles`**:
   - Chave Primária: `id uuid` referenciando `auth.users(id) on delete cascade`.
   - Informações cadastrais: `full_name`, `email`.
   - Perfil energético: `goal`, `interests` (array), `knowledge_level`, `completed_at`.
   - Controle temporal: `created_at`, `updated_at`.
   - Trigger automático: cria o registro do perfil na criação da conta (`on_auth_user_created`).

2. **`energy_profile_drafts`**:
   - Chave Primária: `user_id uuid` referenciando `auth.users(id) on delete cascade`.
   - Armazena o progresso do questionário de perfil do usuário (`step`, `goal`, `interests`, `knowledge_level`).

3. **`calculations`**:
   - Chave Primária: `id uuid` padrão `gen_random_uuid()`.
   - Chave Estrangeira: `user_id uuid` referenciando `auth.users(id) on delete cascade`.
   - Dados do cálculo: `type`, `result`, `unit`, `formula`, `inputs` (JSONB).
   - Índice composto: `(user_id, created_at desc)` para consultas de histórico ultrarrápidas.

4. **`energy_devices`**:
   - Chave Primária: `id uuid` padrão `gen_random_uuid()`.
   - Chave Estrangeira: `user_id uuid` referenciando `auth.users(id) on delete cascade`.
   - Dados do equipamento: `name`, `watts`, `hours_per_day`, `days_per_month`.
   - Constraints de validação: `watts > 0`, `hours_per_day > 0 AND <= 24`, `days_per_month > 0 AND <= 31`.

5. **`user_settings`**:
   - Chave Primária: `user_id uuid` referenciando `auth.users(id) on delete cascade`.
   - Preferências: `monthly_goal` (padrão 120 kWh), `currency` (padrão 'R$').

---

## 4. Segurança e Row Level Security (RLS)

Todas as tabelas possuem **Row Level Security** ativado (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).

As políticas de acesso são granulares e isoladas por usuário:
* Usuários autenticados acessam e alteram exclusivamente registros onde `auth.uid() = user_id` (ou `auth.uid() = id` no caso de `profiles`).
* Usuários anônimos são totalmente bloqueados para operações de leitura, escrita, alteração e exclusão nessas tabelas privadas.

---

## 5. Camada de Acesso a Dados no Frontend

A aplicação organiza o acesso ao banco em uma camada de serviços modular:

```text
src/
├── lib/
│   └── supabase/
│       └── client.ts          # Cliente Supabase singleton
├── contexts/
│   └── AuthContext.tsx        # Sessão, estado de auth e helpers
└── services/
    ├── authService.ts         # Login, registro, logout, recuperação
    ├── profileService.ts      # Perfis e rascunho de onboarding
    ├── calculationService.ts  # Histórico de cálculos de Ohm
    ├── deviceService.ts       # Mapeamento de equipamentos de consumo
    └── settingsService.ts     # Metas e preferências
```

Essa estrutura impede chamadas espalhadas diretamente nos componentes, facilita testes unitários e mantém o código manutenível e desacoplado.

---

## 6. Infraestrutura e Deploy na Netlify

* **Arquivo de Configuração**: `netlify.toml` na raiz do projeto.
* **Redirecionamento SPA**:
  * Regra de rewrite `/*` para `/index.html` com status HTTP `200`.
  * Arquivo suplementar `public/_redirects` com `/* /index.html 200`.
* **Variáveis de Ambiente de Produção**:
  * `VITE_SUPABASE_URL`: Endpoint da API do projeto Supabase.
  * `VITE_SUPABASE_ANON_KEY`: Chave anônima pública (publishable key) do Supabase.
* **Segurança**:
  * Nenhuma chave de privilégio administrativo (`service_role`), token de servidor ou credencial secreta reside no frontend.
