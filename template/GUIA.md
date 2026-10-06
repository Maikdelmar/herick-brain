---
tags: [guia]
status: active
---

# Guia — como usar o seu segundo cérebro

> Pra você, não pro Claude. Cinco minutos de leitura.

## A ideia

O Claude esquece tudo quando a conversa fecha. Esta pasta é a memória dele: quem você é, o que
está fazendo, o que já decidiu, o que deu errado. Ele lê aqui antes de responder e escreve aqui
o que aprende. Tudo em arquivos de texto (markdown) que **são seus**, ficam no seu computador e
podem ir pro seu GitHub privado.

## O dia a dia

1. **Abra o Claude nesta pasta.** No terminal: `cd` até a pasta e `claude`. No app desktop: abra a pasta como projeto.
   Abriu em outra pasta, ele não tem memória nenhuma.
2. **Converse normal.** Contou algo importante, ele guarda. Quer ter certeza: `/nova-info <a informação>`.
3. **No fim, `/fechar`.** Ele anota onde parou, as decisões e o que ficou pendente. Amanhã ele abre sabendo.

## Os comandos

| Comando | Quando usar |
|---------|-------------|
| `/comecar` | Uma vez, logo depois de instalar. Ele te entrevista. |
| `/status` | "Como estão as coisas?" Uma página. |
| `/nova-info texto` | Guardar uma informação no lugar certo. |
| `/pendencia texto` | Algo que falta responder ou decidir. |
| `/responder-pendencia P03 resposta` | Fechar uma pendência. |
| `/decisao texto` | Registrar uma decisão e o porquê. |
| `/aprendi texto` | Registrar uma lição pra não errar de novo. |
| `/fechar` | Fim da sessão. |
| `/backup` | Guardar tudo num GitHub privado. |

## Três hábitos que fazem isto funcionar

Sem eles, vira uma pasta vazia bonita.

1. **Feche a sessão com `/fechar`.** O que não vira arquivo morre com o chat.
2. **Perdeu mais de uma hora com um problema? `/aprendi`.** É o que mais economiza tempo depois.
3. **Escolheu entre dois caminhos? `/decisao`.** Daqui a 3 meses você não vai lembrar o porquê.

## Coisas que você pode querer saber

- **Posso editar os arquivos na mão?** Pode. Só não mexa no que está entre `<!-- AUTO:...` e `...END -->`: aquilo é gerado sozinho e é sobrescrito.
- **Posso criar pastas novas?** Pode. Peça ao Claude ("cria uma área de finanças") ou crie uma pasta com um `_index.md` copiado de `_templates/_index-de-area.md`.
- **Quero ver como um mapa.** Abra a pasta no [Obsidian](https://obsidian.md) (grátis) como "vault". Os `[[links]]` viram um grafo.
- **Onde ponho PDF, foto, planilha?** Em `_kb/`. Essa pasta não vai pro GitHub.
- **Senha?** Nunca aqui. Gerenciador de senhas.
- **O Claude reclamou de "nota órfã".** Ele criou ou você criou um arquivo que nenhum índice cita. Ele mesmo conserta; é só deixar.
