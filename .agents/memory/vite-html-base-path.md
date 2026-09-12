---
name: Vite HTML base path
description: Build behavior for root-relative HTML asset-like URLs in artifact index files
---

Em artifacts Vite com `base` definido por `BASE_PATH`, o plugin de build pode tentar ler `href="/"` em tags HTML como um arquivo local e falhar com `EISDIR`.

**Why:** URLs relativas à raiz em atributos processados pelo HTML transform do Vite podem ser interpretadas como assets, especialmente quando o build está montado em um subcaminho.

**How to apply:** Antes de adicionar canonical ou outros links HTML absolutos à raiz, validar o build com `PORT` e `BASE_PATH`. Não inventar uma URL pública; usar a URL real de deployment quando estiver disponível ou manter o atributo fora do shell estático até então.