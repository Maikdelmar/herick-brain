---
description: Fechar uma pendência e espalhar a resposta por todo o cérebro
argument-hint: P## e a resposta
---

# /responder-pendencia

Entrada: $ARGUMENTS

(Se não veio o número, mostre as pendências abertas e pergunte qual é.)

1. Ache o bloco `### P##` em `_memory/pendencias.md`.
2. Preencha **Resposta:** com o conteúdo, a data de hoje e a fonte ("dono, AAAA-MM-DD").
3. Troque o **Status** para `✅ resolvida`. Se a resposta for incompleta, use `🟡 parcial` e diga o que falta.
4. **Propague.** Procure no cérebro todo lugar onde esta pendência aparece ou onde a informação estava como `pendente` (busque por `P##` e pelo assunto). Atualize cada um com o valor real.
5. A resposta é uma decisão? Crie também a nota em `_decisions/`.
6. Rode `node scripts/refresh-all.js`.

Responda em até 4 linhas: o que foi fechado, quais arquivos mudaram por consequência, e se a resposta abriu alguma pendência nova.
