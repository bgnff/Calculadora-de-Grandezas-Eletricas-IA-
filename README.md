# Voltiva — Plataforma de Eficiência Elétrica

A **Voltiva** é uma plataforma moderna para profissionais, estudantes e entusiastas de eletricidade, projetada para calcular grandezas fundamentais da Lei de Ohm, identificar automaticamente o código de cores de resistores de 4 faixas com visualização dinâmica em SVG, mapear equipamentos e estimar consumo mensal de energia com acompanhamento de metas.

---

## 🚀 Arquitetura e Tecnologias

A aplicação foi desenvolvida com foco em performance, portabilidade e segurança:

* **Frontend**:
  * [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  * [Vite](https://vitejs.dev/) + [Tailwind CSS v4](https://tailwindcss.com/)
  * [Wouter](https://github.com/molefrog/wouter) (Roteamento leve client-side)
  * [Framer Motion](https://www.framer.com/motion/) (Animações e transições)
  * [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
* **Backend & Banco de Dados**:
  * [Supabase](https://supabase.com/)
  * **Supabase Auth**: Autenticação segura por e-mail/senha com persistência de sessão e recuperação de senha.
  * **PostgreSQL Relacional**: Tabelas normalizadas (`profiles`, `calculations`, `energy_devices`, `user_settings`, `energy_profile_drafts`).
  * **Row Level Security (RLS)**: Isolamento rigoroso de dados por usuário (`auth.uid() = user_id`).
  * **Migrations Declarativas**: Versionadas em `supabase/migrations/`.
* **Hospedagem & Deploy**:
  * [Netlify](https://www.netlify.com/) com suporte nativo a rewrite SPA (`netlify.toml` e `_redirects`).

---

## 📂 Estrutura do Projeto

```text
├── artifacts/
│   └── calculadora-eletrica/      # Frontend da aplicação Voltiva
│       ├── public/                # Assets públicos e _redirects da Netlify
│       ├── src/
│       │   ├── components/        # Shell, formulários de auth, onboarding, resistor SVG
│       │   │   └── auth/          # Formulários nativos de Login, Cadastro e Redefinição
│       │   ├── contexts/          # AuthContext com Supabase Auth
│       │   ├── hooks/             # useVoltivaData e useEnergyProfile sincronizados com Supabase
│       │   ├── lib/               # Fórmulas de eletricidade e cliente Supabase
│       │   ├── pages/             # Páginas da aplicação (Dashboard, Calculadora, Consumo, etc.)
│       │   └── services/          # Camada de serviços (auth, perfil, cálculos, dispositivos, metas)
│       ├── package.json
│       └── vite.config.ts
├── docs/
│   ├── ARQUITETURA_ATUAL.md       # Auditoria técnica da arquitetura anterior
│   ├── ARQUITETURA_NOVA.md        # Especificação da nova arquitetura
│   └── DEPLOY_NETLIFY.md          # Guia passo a passo de deploy e setup
├── supabase/
│   ├── config.toml                # Configuração do Supabase CLI
│   ├── migrations/                # Migrations versionadas do PostgreSQL
│   ├── schemas/                   # Schemas SQL organizados por domínio
│   ├── seed.sql                   # Dados demonstrativos
│   └── tests/                     # Testes de isolamento de RLS
├── .env.example                   # Exemplo de variáveis de ambiente
├── netlify.toml                   # Configuração de build e SPA na Netlify
├── package.json                   # Scripts do workspace raiz
└── pnpm-workspace.yaml            # Configuração de monorepo pnpm
```

---

## 🛠️ Como Executar Localmente

### 1. Pré-requisitos
* Node.js 20+
* pnpm (`npm install -g pnpm`)

### 2. Clonar e Instalar Dependências
```bash
git clone <url-do-repositorio>
cd Calculadora-Eletrica-1
pnpm install
```

### 3. Configurar Variáveis de Ambiente
Copie o modelo de variáveis de ambiente:
```bash
cp .env.example .env
```
Preencha com as credenciais do seu projeto Supabase:
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

### 4. Executar em Modo de Desenvolvimento
```bash
pnpm run dev
```
Acesse no navegador: `http://localhost:5173`.

---

## 🗄️ Banco de Dados e Migrations

Para aplicar a estrutura do banco no seu projeto Supabase:

### Opção 1: Via Supabase CLI
```bash
supabase link --project-ref <id-do-projeto>
supabase db push
```

### Opção 2: Via SQL Editor
Abra o arquivo [`supabase/migrations/202609140001_initial_schema.sql`](supabase/migrations/202609140001_initial_schema.sql) e execute seu conteúdo no SQL Editor do painel do Supabase.

---

## 📦 Build e Publicação na Netlify

### Gerar Build Local
```bash
pnpm run build
```
O bundle compilado e otimizado é gerado em `artifacts/calculadora-eletrica/dist`.

### Deploy na Netlify
Consulte o guia completo em [docs/DEPLOY_NETLIFY.md](docs/DEPLOY_NETLIFY.md) para detalhes sobre conexão com Git, configuração de variáveis de ambiente e testes pós-deploy.
