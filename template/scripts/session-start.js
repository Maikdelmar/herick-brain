#!/usr/bin/env node
// session-start.js — hook SessionStart.
//
// 1. Regenera os blocos AUTO (a sessão abre com tudo fresco).
// 2. Imprime no stdout o que o Claude precisa saber antes da primeira mensagem:
//    - se o cérebro ainda não foi configurado → manda oferecer /comecar
//    - senão → o painel e o "Onde parei" do current-state
// Tudo que sai no stdout entra no contexto da sessão. Por isso é curto.

const path = require('node:path');
const b = require('./lib/brain');

try { require('./refresh-all').run({ quiet: true }); } catch {}

const perfil = b.note(path.join(b.VAULT, '_memory', 'perfil.md'));
if (!perfil || !perfil.fm.status || perfil.fm.status === 'stub') {
  process.stdout.write(
    '[Segundo cérebro] Este cérebro AINDA NÃO FOI CONFIGURADO (_memory/perfil.md está como stub).\n' +
    'Na sua primeira resposta, cumprimente em uma linha e ofereça rodar /comecar — é uma conversa\n' +
    'de uns 10 minutos que ensina ao cérebro quem é o dono, o que ele faz e como quer ser tratado.\n' +
    'Se a pessoa pedir outra coisa antes, faça, e lembre do /comecar no fim.\n'
  );
  process.exit(0);
}

const cs = b.read(path.join(b.VAULT, '_memory', 'current-state.md')) || '';
const painel = (cs.match(/<!-- AUTO:PAINEL:START -->([\s\S]*?)<!-- AUTO:PAINEL:END -->/) || [, ''])[1].trim();
const parei = b.section(cs, 'Onde parei');

const out = ['[Segundo cérebro] Contexto de abertura (gerado de _memory/current-state.md):', ''];
if (parei) out.push('## Onde parei', parei, '');
if (painel) out.push('## Painel', painel, '');
out.push('Pra achar qualquer outra coisa, comece pelo INDEX.md.');
process.stdout.write(out.join('\n') + '\n');
process.exit(0);
