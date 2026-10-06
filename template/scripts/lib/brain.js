// lib/brain.js — utilitários compartilhados do harness do segundo cérebro.
//
// Princípio: índice, contador e resumo NUNCA se escrevem à mão. Todo gerador deriva
// da fonte (frontmatter das notas + campos do registry de pendências) e escreve só
// dentro de marcadores <!-- AUTO:NOME:START --> ... <!-- AUTO:NOME:END -->.
//
// A saída é função pura do conteúdo: sem data de hoje, sem ordem de readdir.
// Rodar duas vezes não muda nada, e duas máquinas geram os mesmos bytes.
//
// Zero dependências. Node 18+. Windows, macOS e Linux.

const fs = require('node:fs');
const path = require('node:path');

const VAULT = path.resolve(__dirname, '..', '..');

// Pastas que não são nota: código, config, arquivo bruto.
const IGNORE_DIRS = new Set([
  '.git', '.githooks', '.claude', '.obsidian', '.trash', 'node_modules', '.venv',
  '__pycache__', 'scripts', '_kb',
]);

// Arquivos da raiz que se explicam sozinhos e não precisam estar em índice.
const SELF_OK = new Set(['CLAUDE.md', 'INDEX.md', 'README.md', 'GUIA.md', 'HARNESS.md', '_index.md']);

// ---------- io ----------

function read(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function relPath(f) {
  return path.relative(VAULT, f).replace(/\\/g, '/');
}

function slug(f) {
  return path.basename(f).replace(/\.md$/, '');
}

function sortedEntries(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  } catch { return []; }
}

// Todo .md do cérebro (menos IGNORE_DIRS), em ordem estável.
function walkMd(dir = VAULT, acc = []) {
  for (const e of sortedEntries(dir)) {
    if (e.isDirectory()) {
      if (!IGNORE_DIRS.has(e.name)) walkMd(path.join(dir, e.name), acc);
    } else if (e.name.endsWith('.md')) {
      acc.push(path.join(dir, e.name));
    }
  }
  return acc;
}

// ---------- frontmatter ----------

// Mini-parser YAML por linha: `chave: valor` e listas `[a, b]`. Suficiente pra notas.
function frontmatter(content) {
  if (!content) return {};
  const m = content.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim().replace(/^["']|["']$/g, '');
    if (v.startsWith('[') && v.endsWith(']')) {
      v = v.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    }
    fm[mm[1]] = v;
  }
  return fm;
}

function body(content) {
  return (content || '').replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

// Título de uma nota: frontmatter `titulo`, senão o primeiro `# `, senão o nome do arquivo.
function title(f, content) {
  const fm = frontmatter(content);
  if (fm.titulo) return fm.titulo;
  const h = body(content).match(/^#\s+(.+?)\s*$/m);
  return h ? h[1] : slug(f);
}

function note(f) {
  const content = read(f);
  if (content === null) return null;
  const fm = frontmatter(content);
  return { file: f, rel: relPath(f), slug: slug(f), fm, title: title(f, content), content };
}

// ---------- pendências (P##) — fonte de verdade do status ----------

// Lê _memory/pendencias.md. Cada pendência é um bloco `### P## — Título` com campos:
//   - **Status:**     ⏳ aberta | 🟡 parcial | ✅ resolvida
//   - **Prioridade:** alta | média | baixa
//   - **De quem:**    quem precisa responder
//   - **Trigger:**    palavras, separadas, por vírgula (opcional)
// O resto do bloco é texto livre e o harness não toca.
function collectPendencias() {
  const txt = read(path.join(VAULT, '_memory', 'pendencias.md'));
  if (!txt) return [];
  // Ignora o próprio bloco AUTO e o modelo comentado.
  const clean = txt
    .replace(/<!-- AUTO:[A-Z-]+:START -->[\s\S]*?<!-- AUTO:[A-Z-]+:END -->/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const out = [];
  let cur = null;
  for (const line of clean.split(/\r?\n/)) {
    const h = line.match(/^###\s+(P(\d+))\s*[—–-]\s*(.+?)\s*$/);
    if (h) {
      if (cur) out.push(cur);
      cur = { id: h[1], num: parseInt(h[2], 10), title: h[3], status: null,
              prio: null, owner: '', triggers: [] };
      continue;
    }
    if (!cur) continue;
    const f = line.match(/^\s*-\s*\*\*([^*]+?):\*\*\s*(.*)$/);
    if (!f) continue;
    const key = f[1].toLowerCase();
    const val = f[2].trim();
    const low = val.toLowerCase();
    if (key === 'status') {
      cur.status = /parcial/.test(low) ? 'parcial' : /resolvid|respondid|feit/.test(low) ? 'resolvida' : 'aberta';
    } else if (key === 'prioridade') {
      cur.prio = /alta/.test(low) ? 'alta' : /baixa/.test(low) ? 'baixa' : /m[eé]dia/.test(low) ? 'media' : null;
    } else if (key === 'de quem') {
      cur.owner = val;
    } else if (key === 'trigger') {
      cur.triggers = low.split(',').map(t => t.trim()).filter(Boolean);
    }
  }
  if (cur) out.push(cur);
  return out;
}

const PRIO_ORDER = { alta: 0, media: 1, baixa: 2 };
function byPriority(a, b) {
  const pa = PRIO_ORDER[a.prio] ?? 1, pb = PRIO_ORDER[b.prio] ?? 1;
  return pa - pb || a.num - b.num;
}

// ---------- blocos AUTO ----------

// Troca o miolo de <!-- AUTO:NOME:START --> ... <!-- AUTO:NOME:END --> por `inner`.
// Respeita o fim de linha do arquivo (CRLF no Windows). Escreve só se mudou.
function applyAutoBlock(file, name, inner, { dryRun = false } = {}) {
  const txt = read(file);
  if (txt === null) return { missing: 'arquivo' };
  const start = `<!-- AUTO:${name}:START -->`;
  const end = `<!-- AUTO:${name}:END -->`;
  const i = txt.indexOf(start);
  const j = txt.indexOf(end);
  if (i < 0 || j < i) return { missing: 'marcador' };
  const eol = txt.includes('\r\n') ? '\r\n' : '\n';
  const block = eol + inner.replace(/\r?\n/g, eol).trimEnd() + eol;
  const next = txt.slice(0, i + start.length) + block + txt.slice(j);
  if (next === txt) return { changed: false };
  if (!dryRun) fs.writeFileSync(file, next, 'utf8');
  return { changed: true };
}

// Seção de um markdown pelo título `## Nome` (até o próximo `## `).
function section(content, heading) {
  const lines = (content || '').split(/\r?\n/);
  const at = lines.findIndex(l => l.replace(/^##\s+/, '').trim().toLowerCase() === heading.toLowerCase() && /^##\s/.test(l));
  if (at < 0) return '';
  const out = [];
  for (let k = at + 1; k < lines.length; k++) {
    if (/^##\s/.test(lines[k])) break;
    out.push(lines[k]);
  }
  return out.join('\n').trim();
}

module.exports = {
  VAULT, IGNORE_DIRS, SELF_OK,
  read, relPath, slug, sortedEntries, walkMd,
  frontmatter, body, title, note,
  collectPendencias, byPriority,
  applyAutoBlock, section,
};
