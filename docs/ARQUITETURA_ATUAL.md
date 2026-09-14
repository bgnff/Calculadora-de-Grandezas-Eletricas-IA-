# Arquitetura Atual do Sistema (Auditoria Pré-Migração)

Este documento registra em detalhes o estado e a arquitetura técnica da plataforma **Voltiva — Plataforma de Eficiência Elétrica** antes do processo de migração.

---

## 1. Visão Geral da Aplicação

A Voltiva é uma aplicação web voltada para cálculo de grandezas elétricas fundamentais (Lei de Ohm: Tensão, Corrente, Resistência e Potência), identificação visual e interativa de código de cores de resistores de 4 bandas, monitoramento estimativo de consumo de energia com base em equipamentos e acompanhamento de metas de economia.

---

## 2. Frontend

* **Framework**: React 19 (`react: 19.1.0`, `react-dom: 19.1.0`)
* **Linguagem**: TypeScript 5.9
* **Bundler & Build Tool**: Vite 7 com `@tailwindcss/vite`
* **Roteamento**: `wouter` (`^3.3.5`)
* **Estilização**: Tailwind CSS v4 com sistema de tokens semânticos HSL customizados e tema shadcn em `index.css`.
* **Componentes e Animações**:
  * Radix UI primitives (`@radix-ui/react-*`)
  * Lucide React (`lucide-react`)
  * Framer Motion (`framer-motion`) e `motion`
  * Notificações via `sonner`
* **Estrutura de Pastas (`artifacts/calculadora-eletrica`)**:
  * `src/`:
    * `components/`: Shell responsivo (`voltiva-shell.tsx`), onboarding (`profile-onboarding.tsx`), visualizador de resistores (`resistor-visual.tsx`), loaders e animações, além de `ui/` e `unlumen-ui/`.
    * `hooks/`: Gerenciamento de estado e persistência (`use-voltiva-data.ts`, `use-energy-profile.ts`, `use-toast.ts`, `use-mobile.tsx`).
    * `lib/`: Lógica matemática de eletricidade (`electricity.ts`), gerador de dicas (`dashboard-tips.ts`) e utilitários (`utils.ts`).
    * `pages/`: Calculadora principal (`calculator.tsx`), módulos do aplicativo (`app-pages.tsx`: Dashboard, Consumo, Economia, Histórico, Relatórios, Configurações) e página 404 (`not-found.tsx`).
    * `App.tsx`: Definição de rotas, layouts de autenticação (`AuthLayout`), metatags de SEO dinâmicas e wrappers de provedores.
    * `index.css`: Definição de tokens de tema, fontes Google Fonts (Lato, DM Mono, DM Sans, Manrope) e importações.

---

## 3. Autenticação Atual (Clerk)

* **Biblioteca Utilizada**:
  * Frontend: `@clerk/react: ^6.15.2` e `@clerk/themes: ^2.4.57`
  * Backend API Server: `@clerk/express: ^2.1.67` e `@clerk/shared: ^4.31.1`
* **Fluxo e Componentes**:
  * O aplicativo envolvia as rotas em `<ClerkProvider>` no `App.tsx`.
  * As telas de login e cadastro eram renderizadas diretamente pelos widgets do Clerk (`<SignIn />` e `<SignUp />`) incorporados ao `AuthLayout`.
  * Os hooks `useAuth()`, `useUser()` e `useClerk()` eram utilizados no `App.tsx` e no `voltiva-shell.tsx` para recuperar os dados do usuário (`user.id`, `user.firstName`, `user.emailAddresses`) e executar o `signOut()`.
  * O CSS importava estilos externos do Clerk (`@import '@clerk/themes/shadcn.css';`).
  * O servidor Express montava um proxy reverso para o Clerk em `/api/__clerk` antes dos parsers de requisição.

---

## 4. Banco de Dados e Persistência Atual

* **Estrutura no Banco Relacional**:
  * Existia um pacote `lib/db` configurado com Drizzle ORM e driver `pg` (PostgreSQL), apontando para `process.env.DATABASE_URL`.
  * O arquivo de schema `lib/db/src/schema/index.ts` encontrava-se vazio (`export {}`), sem tabelas implementadas.
* **Persistência Real Utilizada**:
  * Os dados do usuário estavam sendo salvos exclusivamente no `localStorage` do navegador, com chaves prefixadas pelo `userId`:
    * `voltiva:${userId}:calculations`: Array de cálculos salvos (`CalculationRecord`).
    * `voltiva:${userId}:devices`: Array de equipamentos cadastrados (`EnergyDevice`).
    * `voltiva:${userId}:settings`: Meta mensal de kWh e moeda (`VoltivaSettings`).
    * `voltiva.energy-profile.v1:${userId}`: Perfil energético do usuário (`EnergyProfile`).
    * `voltiva.energy-profile-draft.v1:${userId}`: Rascunho das etapas do questionário de onboarding (`EnergyProfileDraft`).

---

## 5. Acoplamento com o Ambiente Replit

* **Arquivos e Configurações**:
  * `.replit`: Instruções de deployment e módulos (`nodejs-24`, Nix channel `stable-25_05`).
  * `.replitignore`: Ignorava pastas do store do pnpm.
  * `replit.md`: Documentação de contexto atrelada às ferramentas do Replit.
  * `pnpm-workspace.yaml`:
    * Regras de exclusão de verificação de pacotes `@replit/*`.
    * Dependências do catálogo: `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`, `@replit/vite-plugin-runtime-error-modal`.
  * `package.json` raiz:
    * Dependência `"@replit/connectors-sdk": "^0.4.1"`.
  * `artifacts/calculadora-eletrica/vite.config.ts`:
    * Lançamento forçado de exceção caso as variáveis de ambiente `PORT` ou `BASE_PATH` não fossem informadas.
    * Importação condicional e direta de plugins Replit (`cartographer`, `devBanner`, `runtimeErrorOverlay`).
    * Pasta de saída de build configurada para `dist/public`.
  * Componentes UI: Comentários de customização interna contendo `// @replit`.

---

## 6. Principais Entidades e Modelo Conceitual

1. **Usuário (`User`)**:
   - Identificado pelo `id` do Clerk (`user.id`).
2. **Perfil Energético (`EnergyProfile`)**:
   - `goal`: Objetivo ('learn' | 'save' | 'plan' | 'diagnose').
   - `interests`: Array de interesses ('fundamentals' | 'consumption' | 'savings' | 'safety').
   - `knowledge`: Nível de conhecimento ('beginner' | 'familiar' | 'advanced').
   - `completedAt`: Timestamp de conclusão.
3. **Rascunho de Perfil (`EnergyProfileDraft`)**:
   - `step`: Etapa atual (0 a 2).
   - `goal`, `interests`, `knowledge`.
4. **Cálculo Elétrico (`CalculationRecord`)**:
   - `id`: Identificador único.
   - `type`: Grandeza calculada ('voltage' | 'current' | 'resistance' | 'power').
   - `result`: Valor numérico.
   - `unit`: Unidade ('V', 'A', 'Ω', 'W').
   - `formula`: Fórmula matemática utilizada.
   - `inputs`: Valores de entrada fornecidos pelo usuário.
   - `createdAt`: Timestamp de criação.
5. **Equipamento de Consumo (`EnergyDevice`)**:
   - `id`: Identificador único.
   - `name`: Nome do equipamento.
   - `watts`: Potência nominal em Watts.
   - `hoursPerDay`: Horas de utilização diária.
   - `daysPerMonth`: Dias de utilização mensal.
6. **Configurações (`VoltivaSettings`)**:
   - `monthlyGoal`: Meta mensal em kWh.
   - `currency`: Moeda de exibição (padrão 'R$').

---

## 7. Principais Problemas Identificados

1. **Vendor Lock-in de Autenticação**: Dependência de serviços e componentes proprietários do Clerk, dificultando o controle direto sobre credenciais, sessões e modelo de dados no PostgreSQL.
2. **Fragilidade de Execução Fora do Replit**: `vite.config.ts` impedia o arranque local ou em pipelines de CI sem variáveis de ambiente específicas (`PORT`, `BASE_PATH`) e requeria plugins inexistentes em ambientes tradicionais.
3. **Ausência de Persistência em Banco Remoto**: Embora existisse a infraestrutura conceitual do Drizzle, as tabelas não estavam criadas e os dados do usuário ficavam restritos ao navegador local (`localStorage`), sem sincronização entre dispositivos.
4. **Ausência de Configurações de Deploy Estático/SPA**: Sem regras de rewrite para Netlify (`_redirects` / `netlify.toml`), o acesso direto a rotas secundárias (ex: `/app/dashboard`) gerava erro 404 em servidores estáticos.
