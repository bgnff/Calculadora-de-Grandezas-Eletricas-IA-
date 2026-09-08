# Voltiva — Calculadora Elétrica

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

- `artifacts/calculadora-eletrica/src/components/voltiva-shell.tsx` — shell responsivo, header e navegação.
- `artifacts/calculadora-eletrica/src/pages/calculator.tsx` — tela principal da calculadora.
- `artifacts/calculadora-eletrica/src/lib/electricity.ts` — fórmulas, validação de entrada, formatação e conversão para bandas.
- `artifacts/calculadora-eletrica/src/components/resistor-visual.tsx` — resistor SVG dinâmico e animado.
- `artifacts/calculadora-eletrica/src/index.css` — tokens visuais, tipografia, grid de fundo e responsividade.

## Architecture decisions

- A primeira versão é frontend-only para manter o escopo visual e funcional enxuto; não há persistência, autenticação ou APIs externas.
- A resistência é convertida automaticamente em quatro bandas, com tolerância fixa de ±5% em dourado.
- A calculadora limpa o resultado ao trocar grandeza ou editar entradas, evitando exibir resultados desatualizados.

## Product

- Calcula tensão, corrente, resistência e potência usando as fórmulas de Ohm.
- Valida entradas vazias, caracteres inválidos e divisões por zero com mensagens em português.
- Exibe o valor calculado e, para resistência, o código de cores e um resistor SVG atualizado automaticamente.

## User preferences

- Nesta etapa, manter somente interface principal, calculadora e resistor automático; não implementar login, cadastro, banco, consumo, economia, relatórios, tarifas, CEP ou APIs externas.

## Gotchas

- A aplicação web é o artifact `@workspace/calculadora-eletrica` e usa o workflow gerenciado `artifacts/calculadora-eletrica: web`.
- Para validar localmente, use `pnpm --filter @workspace/calculadora-eletrica run typecheck`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
