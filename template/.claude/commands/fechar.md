---
description: Encerrar a sessão sem perder nada do que foi feito
---

# /fechar

O que não virou arquivo morre quando este chat fecha. Faça a varredura:

1. **Releia a conversa** e liste pra você mesmo: o que foi feito, o que foi decidido, o que se aprendeu, o que ficou sem resposta, que informação nova apareceu.
2. **`_memory/current-state.md` → "Onde parei":** adicione no topo uma entrada `AAAA-MM-DD — ...` com o que foi feito e o **próximo passo concreto**. Se "Foco agora" mudou, atualize. Itens com mais de um mês em "Onde parei" descem pro "Histórico".
3. **Decisões** tomadas e não registradas → `_decisions/` (modelo em `_templates/decisao.md`).
4. **Lições** → `_learnings/`.
5. **Pendências:** o que ficou sem resposta vira P## novo. O que foi respondido nesta sessão → marque como resolvida.
6. **Informação nova** sobre pessoa, projeto ou sobre o próprio dono → na nota certa.
7. Sessão longa ou importante? Registre também em `_sessions/AAAA-MM-DD-assunto.md`.
8. Rode `node scripts/refresh-all.js` e depois `node scripts/check-consistency.js`. Conserte o que ele apontar.

## Responda

- Lista curta do que foi salvo, arquivo por arquivo.
- O próximo passo, em uma linha.
- Se existe `git remote`: pergunte se ele quer fazer backup agora (commit + push). **Não commite sem ele dizer sim.** Se disser, faça `git add` só dos arquivos listados acima (nunca `git add .`), commit com mensagem que descreve esses arquivos, e push.
