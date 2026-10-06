---
description: Guardar o cérebro num repositório PRIVADO do GitHub (e mandar as mudanças pra lá)
---

# /backup

O cérebro mora numa pasta deste computador. Se o disco morrer, vai junto. O backup é um
repositório **privado** no GitHub: só o dono vê.

## Se ainda não tem `git remote` (primeira vez)

1. Confira se o `gh` (GitHub CLI) está instalado: `gh --version`.
   - Não está? Diga como instalar e pare aqui:
     - Windows: `winget install --id GitHub.cli -e`
     - Mac: `brew install gh`
2. Confira o login: `gh auth status`. Se não estiver logado, peça pra ele rodar **ele mesmo** no terminal:
   `gh auth login` (escolhe GitHub.com → HTTPS → login pelo navegador). **Você não digita senha nem token.**
3. Antes de subir, varra o cérebro atrás de segredo (senha, token, chave de API, número de documento). Achou? Mostre ao dono e tire da nota antes de continuar.
4. Pergunte o nome do repositório (sugestão: `segundo-cerebro`) e **confirme que vai ser privado**.
5. Com o "sim" dele: `gh repo create <nome> --private --source . --push`.

## Se já tem `git remote`

1. `git status --short` e mostre o que mudou.
2. Com o "sim" dele, `git add` **arquivo por arquivo** (nunca `git add .`), commit com mensagem que descreve as mudanças, e `git push`.

## Nunca

- Criar o repositório como público.
- Fazer push sem o dono ter dito sim nesta conversa.
- Subir pasta `_kb/` (arquivos brutos): ela está no `.gitignore` de propósito.
