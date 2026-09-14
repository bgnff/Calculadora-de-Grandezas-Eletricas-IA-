# Guia Completo de Deploy na Netlify com Backend Supabase

Este guia documenta o passo a passo para colocar a plataforma **Voltiva — Plataforma de Eficiência Elétrica** em produção na **Netlify** conectada ao **Supabase**.

---

## 1. Pré-requisitos

Antes de iniciar, certifique-se de possuir:
* **Node.js** 20 ou 22 instalado localmente.
* **pnpm** (recomendado: v9 ou v10) ou **npm**.
* Conta gratuita ou paga no [Supabase](https://supabase.com).
* Conta gratuita ou paga na [Netlify](https://netlify.com).
* Repositório Git configurado (GitHub, GitLab ou Bitbucket).

---

## 2. Configuração do Supabase

### 2.1 Criar o Projeto
1. Acesse o painel do [Supabase Dashboard](https://supabase.com/dashboard).
2. Clique em **New Project**.
3. Escolha uma organização, defina o nome do projeto (ex: `voltiva-producao`), uma senha forte para o banco de dados e a região geográfica mais próxima do seu público (ex: `sa-east-1` São Paulo).
4. Aguarde a conclusão da criação do banco de dados.

### 2.2 Obter as Credenciais da API
1. No painel do projeto, navegue até **Project Settings** > **API**.
2. Localize e copie os seguintes valores:
   * **Project URL**: (ex: `https://xyzcompany.supabase.co`).
   * **anon / public key**: chave longa que começa com `eyJ...`.
3. **ATENÇÃO DE SEGURANÇA**: **JAMAIS** copie ou utilize a chave `service_role` no frontend. Apenas a `anon` key deve ser usada.

### 2.3 Configurar URLs de Autenticação (Supabase Auth)
1. No painel do Supabase, vá para **Authentication** > **URL Configuration**.
2. Em **Site URL**, configure a URL final do seu site na Netlify (ex: `https://voltiva-energia.netlify.app` ou `http://localhost:5173` para testes locais).
3. Em **Redirect URLs**, adicione as seguintes entradas:
   * `https://*.netlify.app`
   * `https://*.netlify.app/*`
   * `https://seu-dominio-customizado.com/*` (se utilizar domínio próprio)
   * `http://localhost:5173/*` (para desenvolvimento local)

---

## 3. Banco de Dados e Migrations

As migrations versionadas da Voltiva estão localizadas em:
```text
supabase/migrations/202609140001_initial_schema.sql
```

### Opção A: Aplicar via Supabase CLI (Recomendado)
Se você utiliza a CLI do Supabase localmente:
```bash
# Vincular ao seu projeto remoto
supabase link --project-ref <seu-project-ref>

# Aplicar as migrations pendentes
supabase db push
```

### Opção B: Aplicar via SQL Editor do Supabase
1. No painel do Supabase, abra a aba **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo [202609140001_initial_schema.sql](file:///c:/Users/bgn/Downloads/Calculadora-Eletrica-1/Calculadora-Eletrica-1/supabase/migrations/202609140001_initial_schema.sql), copie todo o seu conteúdo e cole no editor.
4. Clique em **Run**.
5. Verifique na aba **Table Editor** se as seguintes tabelas foram criadas com o selo verde **RLS Enabled**:
   * `profiles`
   * `energy_profile_drafts`
   * `calculations`
   * `energy_devices`
   * `user_settings`

---

## 4. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (ou dentro de `artifacts/calculadora-eletrica`) para desenvolvimento local, com base no `.env.example`:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

---

## 5. Build e Teste Local

Antes de publicar na Netlify, valide se a compilação ocorre sem erros:

```bash
# 1. Instalar dependências
pnpm install

# 2. Executar checagem de tipos
pnpm run typecheck

# 3. Gerar build de produção
pnpm run build
```

O comando gerará os arquivos otimizados no diretório `artifacts/calculadora-eletrica/dist`.

---

## 6. Deploy na Netlify

### Passo a Passo pelo Painel Web:
1. Faça login na [Netlify](https://app.netlify.com).
2. Clique em **Add new site** > **Import an existing project**.
3. Conecte com o seu provedor Git (GitHub, GitLab, etc.) e selecione o repositório da Voltiva.
4. Na tela de configuração de build (**Build settings**), as configurações serão detectadas automaticamente a partir do `netlify.toml`:
   * **Base directory**: (deixe em branco para usar a raiz)
   * **Build command**: `pnpm --filter @workspace/calculadora-eletrica run build`
   * **Publish directory**: `artifacts/calculadora-eletrica/dist`
5. Na seção **Environment variables**, clique em **Add variable** e cadastre:
   * `VITE_SUPABASE_URL`: (URL do seu projeto Supabase)
   * `VITE_SUPABASE_ANON_KEY`: (Sua chave anon pública do Supabase)
6. Clique em **Deploy site**.
7. Aguarde a finalização da compilação nos logs do Deploy. Quando o status mudar para **Published**, clique no link público gerado pela Netlify para acessar a aplicação.

---

## 7. Roteamento SPA (Single Page Application)

Como a Voltiva utiliza roteamento client-side com `wouter`, rotas como `/app/dashboard`, `/app/calculator` ou `/sign-in` precisam ser redirecionadas para o `index.html` para evitar o erro HTTP 404 ao recarregar a página.

A configuração já está pronta por duas vias redundantes e seguras:
1. Arquivo `netlify.toml` na raiz com:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
2. Arquivo `public/_redirects` com:
   ```text
   /*    /index.html   200
   ```

---

## 8. Verificação Pós-Deploy

Após o deploy, teste os fluxos principais no ambiente de produção:
1. **Página Inicial**: Acesso à landing page, visualização de módulos e animações.
2. **Cadastro**: Criar uma conta nova em `/sign-up`.
3. **Login**: Entrar com e-mail e senha em `/sign-in`.
4. **Onboarding**: Preenchimento do perfil energético e verificação no Supabase.
5. **Calculadora**: Realizar cálculos de Ohm (Tensão, Corrente, Resistência, Potência) e salvar no histórico.
6. **Resistor Visual**: Verificar renderização SVG dinâmica das 4 faixas de cores.
7. **Consumo e Economia**: Adicionar equipamentos elétricos e conferir a projeção mensal em kWh frente à meta.
8. **Relatórios**: Exportar relatório CSV com os cálculos e equipamentos.
9. **Recarga de Página (F5)**: Atualizar páginas internas (ex: `/app/calculator`) e garantir que não ocorre erro 404.
10. **Logout**: Encerrar a sessão com segurança e garantir retorno à página inicial.
