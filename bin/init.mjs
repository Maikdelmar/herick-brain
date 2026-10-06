#!/usr/bin/env node
// herick-brain — instala um segundo cérebro pro Claude Code numa pasta.
//
//   node bin/init.mjs [pasta]              instala (padrão: ~/Documents/cerebro-herick)
//   node bin/init.mjs [pasta] --atualizar  atualiza só o harness de um cérebro existente
//
// Nunca sobrescreve nota. Zero dependências.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = path.join(ROOT, 'template');

const args = process.argv.slice(2);
const update = args.includes('--atualizar') || args.includes('--update');
const positional = args.filter(a => !a.startsWith('--'));

function defaultDest() {
  const docs = path.join(os.homedir(), 'Documents');
  return path.join(fs.existsSync(docs) ? docs : os.homedir(), 'cerebro-herick');
}

const expand = p => p.replace(/^~(?=$|[\\/])/, os.homedir());
const DEST = path.resolve(expand(positional[0] || process.env.BRAIN_DIR || defaultDest()));

const today = new Date();
const HOJE = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');

const ok = m => console.log('  ✓ ' + m);
const warn = m => console.log('  ! ' + m);
const die = m => { console.error('\n  x ' + m + '\n'); process.exit(1); };

// Nome no template → nome no destino (npm descarta arquivos chamados .gitignore).
const RENAME = { gitignore: '.gitignore' };

function copyTree(src, dst, { overwrite, only } = {}) {
  let n = 0;
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, e.name);
    const to = path.join(dst, RENAME[e.name] || e.name);
    if (e.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      n += copyTree(from, to, { overwrite, only });
      continue;
    }
    if (only && !only(path.relative(TEMPLATE, from).replace(/\\/g, '/'))) continue;
    if (fs.existsSync(to) && !overwrite) continue;
    let buf = fs.readFileSync(from);
    if (e.name.endsWith('.md')) buf = Buffer.from(buf.toString('utf8').replaceAll('{{HOJE}}', HOJE), 'utf8');
    fs.writeFileSync(to, buf);
    n++;
  }
  return n;
}

function git(...a) {
  return spawnSync('git', a, { cwd: DEST, encoding: 'utf8' });
}

function hasGit() {
  return spawnSync('git', ['--version'], { encoding: 'utf8' }).status === 0;
}

function chmodHook() {
  try { fs.chmodSync(path.join(DEST, '.githooks', 'pre-commit'), 0o755); } catch {}
}

function refresh() {
  spawnSync(process.execPath, [path.join(DEST, 'scripts', 'refresh-all.js')], { cwd: DEST, stdio: 'ignore' });
}

console.log('\n  Segundo cérebro pro Claude Code\n');

// ---------- modo atualizar ----------

if (update) {
  if (!fs.existsSync(path.join(DEST, 'CLAUDE.md'))) die(`Não achei um cérebro em ${DEST}.`);
  // Harness: sobrescreve (é código, não nota).
  const harness = rel => rel.startsWith('scripts/') || rel.startsWith('.githooks/') || rel === 'HARNESS.md';
  const n1 = copyTree(TEMPLATE, DEST, { overwrite: true, only: harness });
  // Comandos e modelos: só os que faltam (o dono pode ter personalizado os dele).
  const extras = rel => rel.startsWith('.claude/commands/') || rel.startsWith('_templates/');
  const n2 = copyTree(TEMPLATE, DEST, { overwrite: false, only: extras });
  chmodHook();
  refresh();
  ok(`${n1} arquivo(s) do harness atualizados`);
  ok(`${n2} comando(s)/modelo(s) novos adicionados`);
  warn('Notas, CLAUDE.md e .claude/settings.json não foram tocados.');
  console.log('');
  process.exit(0);
}

// ---------- instalação ----------

for (const f of ['CLAUDE.md', 'INDEX.md', '_memory']) {
  if (fs.existsSync(path.join(DEST, f))) {
    die(`Já existe um cérebro (ou um ${f}) em ${DEST}.\n    Pra atualizar só o harness: npx github:Maikdelmar/herick-brain "${DEST}" --atualizar`);
  }
}

fs.mkdirSync(DEST, { recursive: true });
const copied = copyTree(TEMPLATE, DEST, { overwrite: false });
fs.mkdirSync(path.join(DEST, '_kb'), { recursive: true });
chmodHook();
ok(`${copied} arquivos criados em ${DEST}`);

refresh();
ok('índices gerados');

if (!hasGit()) {
  warn('git não encontrado: o cérebro funciona, mas sem histórico nem backup. Instale o git e rode /backup depois.');
} else if (git('rev-parse', '--is-inside-work-tree').status === 0 &&
           path.resolve(git('rev-parse', '--show-toplevel').stdout.trim()) !== DEST) {
  // A pasta caiu dentro de outro repositório: não mexe na config nem commita no repo alheio.
  warn('esta pasta está dentro de outro repositório git; pulei o git. Melhor instalar fora dele.');
} else {
  if (git('rev-parse', '--is-inside-work-tree').status !== 0) {
    if (git('init', '-b', 'main').status !== 0) { git('init'); git('symbolic-ref', 'HEAD', 'refs/heads/main'); }
    ok('repositório git criado');
  }
  git('config', 'core.hooksPath', '.githooks');
  ok('pre-commit ligado');

  const name = git('config', 'user.name').stdout.trim();
  const email = git('config', 'user.email').stdout.trim();
  if (name && email) {
    git('add', '--', '.');
    const c = git('commit', '-q', '-m', 'segundo cérebro instalado');
    if (c.status === 0) ok('primeiro commit feito');
    else warn('não consegui fazer o primeiro commit (o /backup faz depois)');
  } else {
    warn('git sem nome/e-mail configurado: o primeiro commit fica pro /backup');
  }
}

const q = DEST.includes(' ') ? `"${DEST}"` : DEST;
console.log(`
  Pronto. Agora:

    cd ${q}
    claude

  e digite  /comecar  (uma conversa de ~10 minutos pra ele te conhecer).
  Guia rápido: ${path.join(DEST, 'GUIA.md')}
`);
