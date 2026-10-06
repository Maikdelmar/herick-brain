---
description: Guardar uma informação nova no lugar certo do cérebro
argument-hint: a informação, em texto livre
---

# /nova-info

Informação recebida: $ARGUMENTS

(Se veio vazio, pergunte: "O que você quer guardar?")

## Passos

1. **Classifique.** É sobre o quê? Use a tabela "O que vai onde" do `CLAUDE.md` §3. Em dúvida entre dois lugares, consulte o `INDEX.md`.
2. **Procure se já existe nota** sobre o assunto (`INDEX.md`, depois busca por palavra). **Atualizar uma nota existente é melhor que criar uma duplicada.**
3. **Grave.**
   - Nota existente: edite a seção certa e ajuste `updated:`.
   - Nota nova: parta do modelo em `_templates/`, nome em kebab-case, frontmatter completo, na pasta da área (a lista do `_index.md` se atualiza sozinha).
   - Anote a **fonte e a data** junto: "(dono, AAAA-MM-DD)".
4. **Propague.** A informação muda outra coisa? Ex: responde uma pendência → marque como resolvida. Muda o foco → `current-state`. Contradiz uma nota antiga → corrija a antiga, não deixe as duas.
5. **Ligue** com `[[links]]` as notas relacionadas.

## Responda em 3 linhas no máximo

- O que foi gravado e em qual arquivo.
- O que mais foi atualizado por consequência.
- Se ficou alguma dúvida, a pergunta.

Não invente o que não foi dito. Informação incompleta: grave o que tem e abra uma pendência com o que falta.
