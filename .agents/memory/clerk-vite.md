---
name: Clerk no Vite
description: Cuidados de estabilidade ao integrar Clerk em um artifact React/Vite com HMR.
---

Após adicionar ou alterar dependências do Clerk, reinicie o workflow antes de diagnosticar erros de hooks no navegador. Um bundle HMR antigo pode manter referências inconsistentes de React e produzir `Invalid hook call`, enquanto o build limpo funciona.

**Why:** A primeira atualização em hot reload após a mudança do grafo de dependências exibiu erro de hooks no roteador; a sessão limpa do workflow eliminou o erro sem mudança adicional no código.

**How to apply:** Sempre reinicie o workflow depois de instalar, remover ou atualizar Clerk, React ou bibliotecas de roteamento antes da validação visual.