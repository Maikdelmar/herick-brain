# herick-brain — o segundo cérebro do Herick

Herick, este é o seu. O Claude Code esquece tudo quando a conversa fecha. Este repositório instala, numa pasta sua, a
memória que ele não tem: quem você é, o que está fazendo, o que já decidiu e o que já deu errado.
Tudo em markdown, versionado no git, **seu**. Nada aqui vem preenchido: a estrutura chega vazia e
o Claude te entrevista pra montar o conteúdo.

## Instalar (um comando)

**Windows** (PowerShell):

```powershell
irm https://raw.githubusercontent.com/Maikdelmar/herick-brain/main/install.ps1 | iex
```

**macOS / Linux**:

```bash
curl -fsSL https://raw.githubusercontent.com/Maikdelmar/herick-brain/main/install.sh | bash
```

O instalador confere e instala o que faltar (**Git**, **Node.js 18+**, **Claude Code**), cria o
cérebro em `Documentos/cerebro-herick` (ele pergunta, dá pra trocar) e oferece abrir o Claude lá
dentro. Na primeira conversa, digite **`/comecar`**.

Já tem Node? Também funciona assim:

```bash
npx github:Maikdelmar/herick-brain ~/Documents/cerebro-herick
```

## O que vem dentro

```
CLAUDE.md            a lei: princípios, onde guardar cada coisa, o que nunca fazer
INDEX.md             mapa de tudo (gerado sozinho)
GUIA.md              como usar no dia a dia, sem jargão
_memory/
  current-state.md   onde parei + painel do que está em aberto
  pendencias.md      o que falta responder (P01, P02...)
  perfil.md          quem é o dono (preenchido no /comecar)
_decisions/  _learnings/  _projetos/  _pessoas/  _sessions/  _templates/
_kb/                 arquivos brutos, fora do git
.claude/commands/    /comecar /status /nova-info /pendencia /responder-pendencia
                     /decisao /aprendi /fechar /backup
.claude/settings.json  hooks do harness
scripts/             o harness (Node puro, zero dependência)
```

## O harness

Índice escrito à mão apodrece. Aqui todo índice, contador e painel é **gerado** dos arquivos, a
cada resposta do Claude e a cada commit:

- **Ao abrir a sessão**, o Claude já recebe o "onde parei" e o painel de pendências.
- **A cada mensagem**, se você tocar no assunto de uma pendência aberta, ele lembra dela.
- **No fim de cada resposta**, os índices se atualizam e uma nota que nenhum índice cita
  (**órfã**) faz o Claude parar e consertar. Memória que ninguém acha é memória que não existe.

Detalhe em [`template/HARNESS.md`](template/HARNESS.md).

## Atualizar um cérebro já instalado

Atualiza só os scripts e adiciona comandos novos. Não toca em nenhuma nota:

```bash
npx github:Maikdelmar/herick-brain ~/Documents/cerebro-herick --atualizar
```

## O que isto não faz

Não deixa o modelo mais inteligente. Deixa ele **mais bem informado**, e isso resolve a maior parte
do que parece burrice. Também não salva o que foi só conversado: o `/fechar` no fim da sessão é o
hábito que faz tudo funcionar.

## Licença

MIT
