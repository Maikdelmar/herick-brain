---
description: Registrar uma lição pra não repetir o erro
argument-hint: o que aconteceu / o que aprendeu
---

# /aprendi

Lição: $ARGUMENTS

(Se veio vazio, olhe a conversa atual: o que deu errado e foi resolvido? Proponha a lição e confirme.)

1. Procure em `_learnings/` se já existe nota sobre o mesmo problema. Se existir, **complemente**, não duplique.
2. Crie `_learnings/<sintoma-em-kebab-case>.md` a partir de `_templates/aprendizado.md`.
   - O **título é o sintoma** que a pessoa viu ("planilha abre com acento quebrado"), não a causa técnica. É assim que ela vai procurar.
   - A seção **O que NÃO fazer** é obrigatória: a solução óbvia que não funciona.
3. Ligue com o projeto ou a ferramenta envolvidos.

Responda em uma linha com o caminho do arquivo.
