---
name: Dependências no monorepo
description: Regra prática para instalar dependências em artifacts sem contaminar a raiz.
---

Em workspaces pnpm, direcione instalações ao pacote de destino com `pnpm --filter <package> add ...`; a instalação genérica pode ser bloqueada pela proteção contra adicionar dependências na raiz.

**Why:** O instalador automático tentou operar na raiz e falhou antes que a instalação filtrada concluísse corretamente.

**How to apply:** Use o filtro do artifact ou serviço específico ao adicionar pacotes; valide o package.json do destino e os workflows após a instalação.