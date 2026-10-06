---
tags: [harness, tecnico]
status: active
---

# Harness — como os índices se mantêm sozinhos

> Documento técnico. Pra usar o cérebro você não precisa ler isto.

## A tese

Índice mantido à mão apodrece: alguém cria a nota e esquece de pôr na lista, alguém fecha a
pendência e esquece de baixar o contador. Em pouco tempo o índice mente, e o agente que confia
nele erra. O harness troca **disciplina** por **mecanismo**: todo índice, contador e resumo é
**gerado** a partir da fonte, dentro de marcadores, a cada resposta do Claude e a cada commit.

## Fontes de verdade

| Dado | Mora em | Ninguém escreve em |
|------|---------|-------------------|
| Status e prioridade de pendência | campos `Status:` e `Prioridade:` de cada `### P##` em `_memory/pendencias.md` | tabela do resumo |
| Status de projeto | `status:` no frontmatter da nota em `_projetos/` | painel |
| Título e descrição de nota | `titulo:`/`descricao:` no frontmatter (ou o primeiro `# `) | listas dos `_index.md` |

## O que é gerado

| Bloco | Arquivo | Deriva de |
|-------|---------|-----------|
| `AUTO:LISTA` | todo `_index.md` | as notas da pasta (e de subpastas sem índice próprio) |
| `AUTO:AREAS` | `INDEX.md` | todos os `_index.md` |
| `AUTO:RESUMO` | `INDEX.md` | contagem de notas, pendências, projetos |
| `AUTO:PENDENCIAS` | `_memory/pendencias.md` | os `### P##` |
| `AUTO:PAINEL` | `_memory/current-state.md` | pendências + projetos + decisões + aprendizados |

## Os scripts

Zero dependência, só Node 18+.

| Script | Faz |
|--------|-----|
| `scripts/refresh-all.js` | Regenera os blocos. `--report` só diz o que mudaria. |
| `scripts/check-consistency.js` | **Bloqueia** em nota órfã; avisa no resto. |
| `scripts/session-start.js` | Refresh + injeta "Onde parei" e o painel no início da sessão. |
| `scripts/inject-pendencias.js` | Lembra pendência aberta quando a mensagem cita o `Trigger` dela. |
| `scripts/lib/brain.js` | Utilitários (frontmatter, pendências, blocos AUTO). |

## Quando roda

| Evento | O quê | Onde está configurado |
|--------|-------|----------------------|
| Abre sessão | `session-start.js` | `.claude/settings.json` |
| Cada mensagem | `inject-pendencias.js` | `.claude/settings.json` |
| Fim de cada resposta | `refresh-all.js` + `check-consistency.js --stop` | `.claude/settings.json` |
| `git commit` | refresh + check | `.githooks/pre-commit` |

O pre-commit só funciona com `git config core.hooksPath .githooks`. O instalador já faz isso; num
clone novo, rode de novo uma vez.

## Por que só uma regra bloqueia

Nota órfã é a única falha que torna o cérebro inútil **em silêncio**: a informação existe, mas
ninguém acha. As outras (frontmatter faltando, bloco desatualizado) são visíveis e baratas de
consertar depois, então só avisam.

No hook de fim de resposta, o bloqueio devolve a mensagem pro Claude consertar. Se ele já está
consertando e ainda falha, o hook não bloqueia de novo, pra não prender a sessão num laço.

## A fronteira honesta

O harness garante que o que foi **salvo** fica consistente e achável. Ele não adivinha o que foi
só **conversado**. Se a resposta de uma pendência ficou no chat e ninguém mudou o `Status:`, o
painel continua dizendo que ela está aberta.
