#!/usr/bin/env bash
# claude-brain - instalador para macOS e Linux
#
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/Maikdelmar/claude-brain/main/install.sh | bash
#
# O que faz, nesta ordem:
#   1. confere (e, se faltar, tenta instalar) git e Node.js 18+
#   2. confere (e, se faltar, instala pelo instalador oficial) o Claude Code
#   3. cria o segundo cerebro na pasta escolhida
#   4. pergunta se ja quer abrir o Claude la dentro
#
# Pasta sem perguntar:  curl ... | BRAIN_DIR=~/meu-cerebro bash

set -euo pipefail
REPO="Maikdelmar/claude-brain"

say()  { printf '  %s\n' "$*"; }
die()  { printf '\n  x %s\n\n' "$*" >&2; exit 1; }
has()  { command -v "$1" >/dev/null 2>&1; }

# Com "curl | bash" o stdin e o proprio script: perguntas leem do terminal.
TTY=/dev/tty
ask() { # ask "pergunta" default
  local ans=""
  if [ -r "$TTY" ]; then read -r -p "  $1 " ans < "$TTY" || true; fi
  printf '%s' "${ans:-$2}"
}

pkg_install() { # pkg_install <brew-name> <apt-name>
  if has brew; then brew install "$1"
  elif has apt-get; then sudo apt-get update -qq && sudo apt-get install -y "$2"
  elif has dnf; then sudo dnf install -y "$2"
  elif has pacman; then sudo pacman -S --noconfirm "$2"
  else return 1
  fi
}

printf '\n  Segundo cerebro pro Claude Code - instalacao\n\n'

if has git; then say "ok   git"
else
  say "...  instalando git"
  pkg_install git git || die "Instale o git (macOS: xcode-select --install) e rode de novo."
fi

if ! has node; then
  say "...  instalando Node.js"
  pkg_install node nodejs || die "Instale o Node.js 18+ (https://nodejs.org) e rode de novo."
fi
major="$(node -v | sed -E 's/^v([0-9]+).*/\1/')"
[ "$major" -ge 18 ] || die "Node.js $(node -v) e antigo demais (precisa 18+). Atualize em https://nodejs.org"
say "ok   Node.js $(node -v)"

export PATH="$HOME/.local/bin:$PATH"
if has claude; then say "ok   Claude Code"
else
  say "...  instalando o Claude Code (instalador oficial)"
  curl -fsSL https://claude.ai/install.sh | bash
  has claude && say "ok   Claude Code" || say "!    Claude Code instalado, mas so aparece num terminal novo."
fi

if [ -d "$HOME/Documents" ]; then default="$HOME/Documents/segundo-cerebro"; else default="$HOME/segundo-cerebro"; fi
dest="${BRAIN_DIR:-}"
if [ -z "$dest" ]; then
  echo
  dest="$(ask "Onde criar o cerebro? [Enter = $default]" "$default")"
fi
dest="${dest/#\~/$HOME}"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
git clone --depth 1 -q "https://github.com/$REPO.git" "$tmp/claude-brain" \
  || die "Nao consegui baixar o modelo do GitHub. Confira a internet e tente de novo."

node "$tmp/claude-brain/bin/init.mjs" "$dest" || exit 1
rm -rf "$tmp"; trap - EXIT   # o exec abaixo nao roda o trap

open="$(ask "Abrir o Claude no cerebro agora? [S/n]" "s")"
case "$open" in
  [nN]*) say "Quando quiser: cd \"$dest\" && claude" ;;
  *)
    if has claude && [ -r "$TTY" ]; then cd "$dest" && exec claude < "$TTY"
    else say "Abra um terminal novo e rode: cd \"$dest\" && claude"
    fi ;;
esac
