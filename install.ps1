# herick-brain - instalador para Windows
#
# Uso (PowerShell):
#   irm https://raw.githubusercontent.com/Maikdelmar/herick-brain/main/install.ps1 | iex
#
# O que faz, nesta ordem:
#   1. confere (e, se faltar, instala pelo winget) o Git e o Node.js LTS
#   2. confere (e, se faltar, instala pelo instalador oficial) o Claude Code
#   3. cria o segundo cerebro na pasta escolhida
#   4. pergunta se ja quer abrir o Claude la dentro
#
# Pasta sem perguntar:  $env:BRAIN_DIR = "D:\meu-cerebro"; irm ... | iex
# (Arquivo em ASCII de proposito: o PowerShell 5.1 estraga acento em script baixado.)

& {
  $ErrorActionPreference = 'Stop'
  $Repo = 'Maikdelmar/herick-brain'

  function Say($m) { Write-Host "  $m" }
  function Has($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
  function Refresh-Path {
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
                [Environment]::GetEnvironmentVariable('Path', 'User') + ';' +
                (Join-Path $HOME '.local\bin')
  }

  function Ensure($cmd, $wingetId, $label) {
    if (Has $cmd) { Say "ok   $label"; return }
    if (-not (Has 'winget')) {
      throw "$label nao encontrado e o winget nao esta disponivel. Instale o $label manualmente e rode este comando de novo."
    }
    Say "...  instalando $label pelo winget (pode pedir confirmacao)"
    winget install --id $wingetId -e --source winget
    Refresh-Path
    if (-not (Has $cmd)) {
      throw "$label foi instalado, mas este terminal ainda nao enxerga. Feche o PowerShell, abra de novo e rode o mesmo comando."
    }
    Say "ok   $label"
  }

  Write-Host ""
  Write-Host "  Segundo cerebro pro Claude Code - instalacao" -ForegroundColor Cyan
  Write-Host ""

  try {
    Refresh-Path
    Ensure 'git'  'Git.Git'           'Git'
    Ensure 'node' 'OpenJS.NodeJS.LTS' 'Node.js'

    $major = [int]((node -v) -replace '^v(\d+).*', '$1')
    if ($major -lt 18) { throw "Node.js $(node -v) e antigo demais (precisa 18+). Atualize: winget upgrade OpenJS.NodeJS.LTS" }

    if (Has 'claude') {
      Say "ok   Claude Code"
    } else {
      Say "...  instalando o Claude Code (instalador oficial)"
      Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression
      Refresh-Path
      if (Has 'claude') { Say "ok   Claude Code" }
      else { Say "!    Claude Code instalado, mas so aparece num terminal novo." }
    }

    $default = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'cerebro-herick'
    $dest = $env:BRAIN_DIR
    if (-not $dest) {
      Write-Host ""
      $resp = Read-Host "  Onde criar o cerebro? [Enter = $default]"
      $dest = if ([string]::IsNullOrWhiteSpace($resp)) { $default } else { $resp.Trim('"', ' ') }
    }

    $tmp = Join-Path ([IO.Path]::GetTempPath()) ("herick-brain-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
    git clone --depth 1 -q "https://github.com/$Repo.git" $tmp
    if ($LASTEXITCODE -ne 0) { throw "Nao consegui baixar o modelo do GitHub. Confira a internet e tente de novo." }

    node (Join-Path $tmp 'bin\init.mjs') $dest
    $code = $LASTEXITCODE
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
    if ($code -ne 0) { return }

    $open = Read-Host "  Abrir o Claude no cerebro agora? [S/n]"
    if ($open -notmatch '^[nN]') {
      Set-Location $dest
      if (Has 'claude') { claude } else { Say "Abra um terminal novo, va ate $dest e rode: claude" }
    } else {
      Set-Location $dest
    }
  } catch {
    Write-Host ""
    Write-Host "  x $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
  }
}
