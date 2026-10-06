---
description: Configuração inicial do cérebro — uma conversa curta pra ele aprender quem você é
---

# /comecar — configurar o segundo cérebro

Você vai entrevistar o dono deste cérebro e gravar as respostas nos arquivos certos.
Objetivo: no fim, qualquer sessão nova do Claude abre sabendo quem ele é, o que faz e como quer ser tratado.

## Como conduzir

- **Uma pergunta por vez**, ou no máximo duas curtas juntas. Nada de questionário de 15 itens de uma vez.
- Tom de conversa, não de formulário. Se a resposta abrir um assunto, pode puxar uma pergunta de follow-up.
- Pode responder "pula" em qualquer pergunta: o campo fica `pendente`.
- **Nunca invente** o que ele não disse. Na dúvida, pergunte de novo.
- Se `_memory/perfil.md` já estiver preenchido (status diferente de `stub`), avise que o cérebro já foi configurado e pergunte se ele quer **revisar** só uma parte.

## Roteiro (adapte, não leia em voz alta)

1. Como quer ser chamado? Em que cidade mora?
2. O que você faz? (trabalho, empresa, profissão, estudo)
3. Quais áreas da vida você quer que este cérebro acompanhe? Dê exemplos: trabalho, um cliente específico, uma empresa, finanças, estudo, saúde, um projeto paralelo.
4. Tem algum projeto rolando agora? (cada um vira uma nota em `_projetos/`)
5. Quem são as pessoas que mais aparecem no seu dia? (sócio, chefe, cliente, família). Nome e papel bastam.
6. Como você gosta de receber resposta? Curta e direta, em tópicos, explicada passo a passo?
7. Você programa, ou só usa o computador? (calibra o nível técnico)
8. Tem algo que te irrita numa IA, ou algo que eu nunca deveria fazer?
9. Qual é o foco dos próximos 3 meses?

## O que gravar (depois da última pergunta)

1. **`_memory/perfil.md`** — preencha todas as seções com as respostas. Troque `status: stub` por `status: active` e ajuste `updated:` pra hoje.
2. **`CLAUDE.md` §2** — troque `{{NOME}}`, `{{O_QUE_FAZ}}`, `{{AREAS}}`, `{{ESTILO}}`, `{{NUNCA}}` por versões curtas das respostas. Troque também o `{{NOME}}` do título.
3. **`_memory/current-state.md`** — em **Foco agora**, o foco dos 3 meses. Em **Onde parei**, uma linha: "AAAA-MM-DD — Cérebro configurado com /comecar".
4. **Projetos citados** → uma nota por projeto em `_projetos/`, a partir de `_templates/projeto.md`, com `status: active`.
5. **Pessoas citadas** → uma nota por pessoa em `_pessoas/`, a partir de `_templates/pessoa.md`. Só o que ele disse.
6. **Áreas que não cabem nas pastas que existem** (ex: finanças, clientes, estudos) → pergunte se ele quer uma pasta própria. Se sim, crie `_<area>/_index.md` copiando `_templates/_index-de-area.md`.
7. **`_memory/pendencias.md`** — marque a **P01** como `✅ resolvida`, com a data em **Resposta**. Tudo que ficou `pendente` e importa vira uma pendência nova (P02, P03...).
8. Rode `node scripts/refresh-all.js` e confira que não sobrou nenhum `{{` no `CLAUDE.md`.

## Fechamento

Mostre um resumo de no máximo 10 linhas do que ficou gravado e onde. Depois explique em 3 linhas como usar daqui pra frente:

- Abra o Claude **nesta pasta** sempre que for trabalhar.
- Contou algo que vale guardar? Ele salva. Quer garantir, use `/nova-info`.
- No fim do dia, `/fechar`.

E ofereça o `/backup` (guardar o cérebro num GitHub privado) se ainda não houver um `git remote`.
