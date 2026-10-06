#!/usr/bin/env node
// inject-pendencias.js — hook UserPromptSubmit.
//
// Se a mensagem do usuário toca numa palavra do campo **Trigger:** de alguma pendência
// em aberto, injeta um lembrete antes do Claude responder. Transforma "às vezes lembra
// da pendência" em "sempre vê".

const fs = require('node:fs');
const b = require('./lib/brain');

let prompt = '';
try { prompt = JSON.parse(fs.readFileSync(0, 'utf8')).prompt || ''; } catch {}
const text = prompt.toLowerCase();
if (!text.trim()) process.exit(0);

// Casa por palavra inteira: "casa" não casa dentro de "casamento".
function hit(t) {
  const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|[^a-z0-9à-ÿ])' + esc + '([^a-z0-9à-ÿ]|$)', 'i').test(text);
}

let open = [];
try { open = b.collectPendencias().filter(p => p.status !== 'resolvida'); } catch { process.exit(0); }
const matched = open.filter(p => p.triggers.some(hit)).slice(0, 6);
if (!matched.length) process.exit(0);

process.stdout.write(
  '[Segundo cérebro · pendências] Esta mensagem toca em assunto com pendência aberta. ' +
  'Se ela responde alguma, rode /responder-pendencia pra fechar e propagar:\n' +
  matched.map(p => `- ${p.id} — ${p.title}${p.owner ? ` (de: ${p.owner})` : ''}`).join('\n') + '\n'
);
process.exit(0);
