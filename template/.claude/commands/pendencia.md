---
description: Anotar algo que falta responder ou decidir
argument-hint: o que está faltando
---

# /pendencia

Pendência: $ARGUMENTS

1. Abra `_memory/pendencias.md` e ache o **maior número P##** que já existe (inclusive as resolvidas). A nova é o próximo. **Número nunca é reaproveitado.**
2. Confira se já não existe uma pendência sobre o mesmo assunto. Se existir, atualize aquela em vez de duplicar.
3. Adicione no fim da seção **Registro**, seguindo o modelo do arquivo:
   - **Status:** ⏳ aberta
   - **Prioridade:** pergunte se não estiver claro (alta = trava alguma coisa agora)
   - **De quem:** quem precisa responder
   - **Trigger:** 2 a 4 palavras que, se aparecerem numa conversa futura, devem lembrar desta pendência
   - **Contexto:** por que importa e o que fica travado
4. Rode `node scripts/refresh-all.js`.

Responda em uma linha: "Anotado como P##: <título>".
