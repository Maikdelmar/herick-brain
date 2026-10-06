#!/usr/bin/env node
// refresh-all.js — regenera todos os blocos AUTO a partir da fonte.
//
//   node scripts/refresh-all.js            aplica (escreve só o que mudou)
//   node scripts/refresh-all.js --report   não escreve, só diz o que mudaria
//
// Roda sozinho no início e no fim de cada resposta do Claude (.claude/settings.json)
// e em todo commit (.githooks/pre-commit). Idempotente: rodar 2x não muda nada.
//
// O que gera:
//   LISTA           em todo `_index.md`         → as notas daquela pasta
//   AREAS, RESUMO   em INDEX.md                 → mapa das pastas e números do cérebro
//   PENDENCIAS      em _memory/pendencias.md    → tabela das abertas
//   PAINEL          em _memory/current-state.md → o que está em aberto agora

const fs = require('node:fs');
const path = require('node:path');
const b = require('./lib/brain');

const DATED = /^\d{4}-\d{2}-\d{2}/;
const PRIO_LABEL = { alta: 'alta', media: 'média', baixa: 'baixa' };

function isIndex(f) { return path.basename(f) === '_index.md'; }

// Notas que pertencem a um `_index.md`: as da pasta dele e de subpastas sem índice próprio.
function notesOf(indexFile) {
  const out = [];
  const subAreas = [];
  (function walk(dir, prefix) {
    for (const e of b.sortedEntries(dir)) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (b.IGNORE_DIRS.has(e.name)) continue;
        if (fs.existsSync(path.join(full, '_index.md'))) subAreas.push(path.join(full, '_index.md'));
        else walk(full, prefix + e.name + '/');
      } else if (e.name.endsWith('.md') && e.name !== '_index.md') {
        out.push(full);
      }
    }
  })(path.dirname(indexFile), '');
  // Datadas (decisões, sessões) da mais nova pra mais velha; o resto em ordem alfabética.
  const dated = out.filter(f => DATED.test(path.basename(f))).sort((x, y) => (b.slug(x) < b.slug(y) ? 1 : -1));
  const plain = out.filter(f => !DATED.test(path.basename(f)));
  return { notes: [...dated, ...plain], subAreas };
}

function noteLine(f) {
  const n = b.note(f);
  if (!n) return null;
  const desc = n.fm.descricao || (n.title !== n.slug ? n.title : '');
  const status = n.fm.status && !/^(active|ativo|ativa)$/i.test(n.fm.status) ? ` · _${n.fm.status}_` : '';
  return `- [[${n.slug}]]${desc ? ' — ' + desc : ''}${status}`;
}

function genLista(indexFile) {
  const { notes, subAreas } = notesOf(indexFile);
  const lines = [];
  for (const s of subAreas) {
    const n = b.note(s);
    lines.push(`- 📁 [[${b.relPath(s).replace(/\.md$/, '')}|${n ? n.title : b.relPath(path.dirname(s))}]]`);
  }
  for (const f of notes) { const l = noteLine(f); if (l) lines.push(l); }
  return lines.length ? lines.join('\n') : '_Vazio por enquanto._';
}

function allIndexes() {
  return b.walkMd().filter(isIndex);
}

function countNotes() {
  return b.walkMd().filter(f => !isIndex(f) && !b.SELF_OK.has(path.basename(f)) && !b.relPath(f).startsWith('_templates/')).length;
}

function genAreas() {
  const rows = ['| Área | O que guarda | Notas |', '|------|--------------|-------|'];
  for (const idx of allIndexes()) {
    const n = b.note(idx);
    const link = b.relPath(idx).replace(/\.md$/, '');
    const { notes } = notesOf(idx);
    rows.push(`| [[${link}\\|${n.title}]] | ${n.fm.descricao || ''} | ${notes.length} |`);
  }
  return rows.join('\n');
}

function openPendencias() {
  return b.collectPendencias().filter(p => p.status !== 'resolvida').sort(b.byPriority);
}

function activeProjects() {
  const dir = path.join(b.VAULT, '_projetos');
  if (!fs.existsSync(dir)) return [];
  return notesOf(path.join(dir, '_index.md')).notes
    .map(b.note).filter(n => n && /^(active|ativo|ativa)$/i.test(n.fm.status || ''));
}

function latest(dirName, k) {
  const dir = path.join(b.VAULT, dirName);
  if (!fs.existsSync(dir)) return [];
  return notesOf(path.join(dir, '_index.md')).notes.filter(f => !/^_MODELO/i.test(path.basename(f))).slice(0, k).map(b.note).filter(Boolean);
}

function genResumo() {
  const open = openPendencias();
  const alta = open.filter(p => p.prio === 'alta').length;
  return [
    `- **${countNotes()}** notas no cérebro`,
    `- **${open.length}** pendência(s) em aberto${alta ? ` (${alta} de prioridade alta)` : ''} → [[pendencias]]`,
    `- **${activeProjects().length}** projeto(s) ativo(s) → [[_projetos/_index|Projetos]]`,
  ].join('\n');
}

function genPendencias() {
  const all = b.collectPendencias();
  const open = openPendencias();
  if (!all.length) return '_Nenhuma pendência registrada._';
  const lines = [
    `**${open.length}** em aberto · **${all.length - open.length}** resolvida(s) · **${all.length}** no total`,
    '',
  ];
  if (open.length) {
    lines.push('| # | Pendência | Prioridade | De quem | Status |', '|---|-----------|------------|---------|--------|');
    for (const p of open) lines.push(`| ${p.id} | ${p.title} | ${PRIO_LABEL[p.prio] || '—'} | ${p.owner || '—'} | ${p.status || 'aberta'} |`);
  }
  return lines.join('\n');
}

function genPainel() {
  const open = openPendencias();
  const proj = activeProjects();
  const dec = latest('_decisions', 5);
  const learn = latest('_learnings', 3);
  const out = [];
  out.push(`**Pendências em aberto: ${open.length}**`);
  for (const p of open.slice(0, 6)) out.push(`- ${p.id} — ${p.title}${p.prio ? ` _(${PRIO_LABEL[p.prio]})_` : ''}`);
  if (open.length > 6) out.push(`- … e mais ${open.length - 6} em [[pendencias]]`);
  out.push('', `**Projetos ativos: ${proj.length}**`);
  for (const n of proj) out.push(`- [[${n.slug}]]${n.fm.descricao ? ' — ' + n.fm.descricao : ''}`);
  out.push('', '**Últimas decisões**');
  out.push(...(dec.length ? dec.map(n => `- [[${n.slug}]]`) : ['- _nenhuma ainda_']));
  out.push('', '**Últimos aprendizados**');
  out.push(...(learn.length ? learn.map(n => `- [[${n.slug}]]`) : ['- _nenhum ainda_']));
  return out.join('\n');
}

function jobs() {
  const J = [];
  for (const idx of allIndexes()) J.push({ file: idx, name: 'LISTA', gen: () => genLista(idx) });
  const INDEX = path.join(b.VAULT, 'INDEX.md');
  J.push({ file: INDEX, name: 'AREAS', gen: genAreas });
  J.push({ file: INDEX, name: 'RESUMO', gen: genResumo });
  J.push({ file: path.join(b.VAULT, '_memory', 'pendencias.md'), name: 'PENDENCIAS', gen: genPendencias });
  J.push({ file: path.join(b.VAULT, '_memory', 'current-state.md'), name: 'PAINEL', gen: genPainel });
  return J;
}

function run({ dryRun = false, quiet = false } = {}) {
  let changed = 0, errors = 0;
  const log = m => { if (!quiet) process.stderr.write(m + '\n'); };
  for (const j of jobs()) {
    try {
      const r = b.applyAutoBlock(j.file, j.name, j.gen(), { dryRun });
      if (r.missing === 'marcador' && j.name === 'LISTA') {
        log(`⚠ ${b.relPath(j.file)}: sem os marcadores AUTO:LISTA — a lista dessa pasta não se atualiza`);
      } else if (r.changed) {
        changed++;
        log(`${dryRun ? '~ MUDARIA' : '✓ atualizado'}: ${j.name} → ${b.relPath(j.file)}`);
      }
    } catch (e) {
      errors++;
      log(`✗ ${j.name} em ${b.relPath(j.file)}: ${e.message}`);
    }
  }
  if (!changed && !errors) log('refresh-all: tudo em dia.');
  return { changed, errors };
}

module.exports = { run };

if (require.main === module) {
  run({ dryRun: process.argv.includes('--report') });
  process.exit(0); // nunca trava a sessão: quem bloqueia é o check-consistency
}
