#!/usr/bin/env node
// check-consistency.js — confere se o cérebro continua achável.
//
// BLOQUEIA (exit 2 no fim da resposta do Claude, exit 1 no commit):
//   - nota órfã: .md que nenhum índice cita. Memória que ninguém acha não existe.
//
// SÓ AVISA:
//   - nota sem frontmatter
//   - pendência sem Status
//   - {{PLACEHOLDER}} esquecido no CLAUDE.md depois da configuração
//   - bloco AUTO fora de sincronia
//
//   node scripts/check-consistency.js           uso manual / pre-commit
//   node scripts/check-consistency.js --stop    usado pelo hook Stop (lê o JSON do Claude)

const fs = require('node:fs');
const path = require('node:path');
const b = require('./lib/brain');
const refresh = require('./refresh-all');

const isStopHook = process.argv.includes('--stop');
let stopHookActive = false;
if (isStopHook) {
  try { stopHookActive = !!JSON.parse(fs.readFileSync(0, 'utf8')).stop_hook_active; } catch {}
}

const warnings = [];
const all = b.walkMd();

// ---------- 1. órfãos (bloqueia) ----------

let indexBlob = '';
for (const f of all) {
  if (/^(INDEX|_index)\.md$/.test(path.basename(f))) indexBlob += '\n' + (b.read(f) || '');
}
const orphans = [];
for (const f of all) {
  const base = path.basename(f);
  if (b.SELF_OK.has(base)) continue;
  const s = b.slug(f);
  if (indexBlob.includes(`[[${s}]]`) || indexBlob.includes(`[[${s}|`) || indexBlob.includes(`${base}`)) continue;
  orphans.push(b.relPath(f));
}

// ---------- 2. avisos ----------

for (const f of all) {
  const base = path.basename(f);
  if (b.SELF_OK.has(base) || base === '_index.md') continue;
  const txt = b.read(f) || '';
  if (!/^﻿?---\r?\n/.test(txt)) warnings.push(`${b.relPath(f)}: sem frontmatter (tags/status/created/updated)`);
}

for (const p of b.collectPendencias()) {
  if (!p.status) warnings.push(`pendencias.md ${p.id}: sem campo **Status:**`);
}

const perfil = b.note(path.join(b.VAULT, '_memory', 'perfil.md'));
const configured = perfil && perfil.fm.status && perfil.fm.status !== 'stub';
const claudeMd = b.read(path.join(b.VAULT, 'CLAUDE.md')) || '';
if (configured && /\{\{[A-Z_]+\}\}/.test(claudeMd)) {
  warnings.push('CLAUDE.md ainda tem {{PLACEHOLDER}} — termine de preencher a seção 2');
}

const { changed } = refresh.run({ dryRun: true, quiet: true });
if (changed) warnings.push(`${changed} bloco(s) AUTO fora de sincronia — rode: node scripts/refresh-all.js`);

// ---------- resultado ----------

if (warnings.length) {
  process.stderr.write('⚠ Avisos do cérebro:\n' + warnings.map(w => '  - ' + w).join('\n') + '\n');
}

if (orphans.length) {
  const dirs = [...new Set(orphans.map(o => path.dirname(o)))];
  process.stderr.write(
    `\n🔴 ${orphans.length} nota(s) órfã(s) — nenhum índice cita:\n` +
    orphans.map(o => '  - ' + o).join('\n') + '\n\n' +
    'Conserte assim:\n' +
    (dirs.some(d => d === '.')
      ? '  - nota solta na raiz → mova pra uma pasta de área, ou cite no INDEX.md\n' : '') +
    (dirs.some(d => d !== '.')
      ? '  - pasta nova sem índice → crie `<pasta>/_index.md` copiando `_templates/_index-de-area.md`\n' +
        '    (a lista se preenche sozinha no próximo refresh)\n' : '')
  );
  // No Stop, sair com 2 devolve a mensagem pro Claude consertar. Se ele já está
  // consertando (stop_hook_active), não trava de novo: evita laço infinito.
  if (isStopHook && stopHookActive) process.exit(0);
  process.exit(2);
}

process.exit(0);
