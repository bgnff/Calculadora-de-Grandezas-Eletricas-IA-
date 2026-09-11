# Voltiva — Plataforma de Eficiência Elétrica

Dashboard responsivo para calcular grandezas elétricas e identificar automaticamente resistores de 4 bandas.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/calculadora-eletrica/src/components/voltiva-shell.tsx` — shell responsivo, header, navegação e logout.
- `artifacts/calculadora-eletrica/src/pages/calculator.tsx` — tela principal da calculadora.
- `artifacts/calculadora-eletrica/src/pages/app-pages.tsx` — visão geral, consumo, economia, histórico, relatórios e configurações.
- `artifacts/calculadora-eletrica/src/lib/electricity.ts` — fórmulas, validação de entrada, formatação e conversão para bandas.
- `artifacts/calculadora-eletrica/src/hooks/use-voltiva-data.ts` — dados locais isolados por usuário para cálculos, equipamentos e preferências.
- `artifacts/calculadora-eletrica/src/components/resistor-visual.tsx` — resistor SVG dinâmico e animado.
- `artifacts/calculadora-eletrica/src/components/profile-onboarding.tsx` — onboarding de perfil energético com retomada de rascunho.
- `artifacts/calculadora-eletrica/src/index.css` — tokens visuais, tipografia, grid de fundo e responsividade.

## Architecture decisions

- A autenticação usa Clerk gerenciado pela Replit, com login por e-mail/senha e suporte ao provedor Google habilitado pelo tenant.
- O perfil, histórico, equipamentos e preferências ficam em localStorage com namespace do ID do usuário; a camada pode ser substituída por API/DB sem misturar dados entre contas.
- O servidor Express monta o proxy Clerk em `/api/__clerk` antes dos parsers e mantém o middleware Clerk para futuras rotas protegidas.
- A resistência é convertida automaticamente em quatro bandas, com tolerância fixa de ±5% em dourado.
- A calculadora limpa o resultado ao trocar grandeza ou editar entradas, evitando exibir resultados desatualizados.

## Product

- Calcula tensão, corrente, resistência e potência usando as fórmulas de Ohm.
- Valida entradas vazias, caracteres inválidos e divisões por zero com mensagens em português.
- Exibe o valor calculado e, para resistência, o código de cores e um resistor SVG atualizado automaticamente.

## User preferences

- Manter a identidade Voltiva: sidebar azul-marinho, workspace claro com grid, acentos teal/azul e destaque âmbar.
- Não apresentar projeções indicativas como medições reais; toda estimativa de consumo deve mostrar a origem dos valores informados pelo usuário.

## Gotchas

- A aplicação web é o artifact `@workspace/calculadora-eletrica` e usa o workflow gerenciado `artifacts/calculadora-eletrica: web`.
- Para validar localmente, use `pnpm --filter @workspace/calculadora-eletrica run typecheck` e `PORT=4173 BASE_PATH=/calculadora-eletrica pnpm --filter @workspace/calculadora-eletrica run build`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
