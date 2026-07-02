param(
    [string]$CMD = "all",
    [switch]$SkipTests,
    [switch]$Force
)

# UTF-8 fix para Windows
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ==============================
# CONFIGURAÇÕES
# ==============================

$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$BACKEND_DIR = "$ROOT_DIR\Backend\deadline"
$FRONTEND_DIR = "$ROOT_DIR\Frontend\deadline"

# Nome correto do ficheiro TSV
$DATA_FILE = "$PSScriptRoot\demo-lojas.tsv"

$BACKEND_PORT = 8080
$FRONTEND_PORT = 5173

$API_URL = "http://localhost:8080"

# ==============================
# UTILS (Logs Visuais)
# ==============================

function Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "[OK] $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Fail($msg) { Write-Host "[ERRO] $msg" -ForegroundColor Red; exit 1 }

# ==============================
# BACKEND CHECK
# ==============================

function Test-Backend {
    try {
        Invoke-WebRequest "$API_URL" -TimeoutSec 2 -UseBasicParsing | Out-Null
        return $true
    } catch {
        if ($_.Exception.Response) {
            return $true # Respondeu (ex: 404, 401), logo o server está de pé
        }
        return $false
    }
}

function Wait-Backend {
    Info "Aguardando inicialização do Backend Spring Boot..."
    for ($i = 0; $i -lt 30; $i++) {
        if (Test-Backend) {
            Ok "Backend Spring Boot pronto na porta $BACKEND_PORT!"
            return
        }
        Start-Sleep -Seconds 2
    }
    Fail "Backend não respondeu após 60s"
}

# ==============================
# SEED (CARREGAR demo-lojas.tsv)
# ==============================

function Seed-DemoData {
    if (!(Test-Path $DATA_FILE)) {
        Warn "Arquivo $DATA_FILE não encontrado na raiz."
        return
    }

    Info "Lendo ficheiro TSV e populando o banco de dados..."

    # Lê o TSV pulando as linhas que começam com # (cabeçalho)
    Get-Content $DATA_FILE | Where-Object { $_ -notmatch "^#" -and $_.Trim() -ne "" } | ForEach-Object {
        $c = $_ -split "\|"

        # Mapeia para o formato exato do EmpresaCadastroDTO do Backend
        $body = @{
            emailLogin = $c[1]
            senha = "password123" # Senha padrão para testes
            cnpj = $c[2]
            nomeFantasia = $c[3]
            razaoSocial = $c[3] + " LTDA"
            idRamo = 1 # Ramo padrão (Farmácia, etc)
            horarioFuncionamento = "08:00 as 22:00"
            instrucoesRetirada = "Retire no balcão principal com o código do pedido."
            endereco = @{
                logradouro = $c[4]
                numero = $c[5]
                bairro = $c[6]
                cep = $c[7]
                cidade = $c[8]
                uf = $c[9]
            }
        } | ConvertTo-Json -Depth 4

        try {
            # Faz a chamada para a rota de cadastro pública do seu backend
            Invoke-RestMethod `
                -Uri "$API_URL/empresa/cadastro" `
                -Method POST `
                -Body $body `
                -ContentType "application/json" | Out-Null

            Ok "Loja Registrada: $($c[3])"
        } catch {
            $errResponse = $_.Exception.Response
            if ($errResponse.StatusCode -eq 409 -or $_.Exception.Message -match "já cadastrado") {
                Warn "Loja $($c[3]) já existe no banco (CNPJ duplicado)."
            } else {
                Warn "Erro ao inserir $($c[3]): $($_.Exception.Message)"
            }
        }
    }

    Ok "Seed TSV finalizado!"
}

# ==============================
# TEST API
# ==============================

function Test-API {
    Info "Executando testes básicos de saúde (Healthcheck)..."
    if (Test-Backend) {
        Ok "Conexão Localhost:8080 efetuada."
    } else {
        Fail "Servidor Web não responde."
    }
}

# ==============================
# GESTÃO DE PORTAS
# ==============================

function Kill-Port($port) {
    $procs = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($p in $procs) {
        if ($p.OwningProcess -and $p.OwningProcess -ne 0) {
            Stop-Process -Id $p.OwningProcess -Force -ErrorAction SilentlyContinue
            Warn "Processo (PID: $($p.OwningProcess)) preso na porta $port foi derrubado."
        }
    }
}

function Porta-Em-Uso($porta) {
    return (netstat -ano | Select-String ":$porta") -ne $null
}

# ==============================
# START SERVICES
# ==============================

function Start-Backend {
    if (Test-Backend) {
        Warn "O Backend já está em execução na porta $BACKEND_PORT."
        return
    }

    Kill-Port $BACKEND_PORT
    Info "Subindo o Backend (Maven/Spring Boot) num novo terminal..."
    Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$BACKEND_DIR`" && mvn spring-boot:run"
}

function Start-Frontend {
    if (Porta-Em-Uso $FRONTEND_PORT) {
        Warn "O Frontend já está em execução na porta $FRONTEND_PORT."
        return
    }

    Kill-Port $FRONTEND_PORT
    Info "Subindo o Frontend (Vite/React) num novo terminal..."
    Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$FRONTEND_DIR`" && npm run dev -- --port $FRONTEND_PORT"
}

function Stop-All {
    Info "Derrubando os processos Backend (8080) e Frontend (5173)..."
    Kill-Port $BACKEND_PORT
    Kill-Port $FRONTEND_PORT
    Ok "Ambiente finalizado com segurança."
}

# ==============================
# CONTROLADOR PRINCIPAL
# ==============================

switch ($CMD) {
    "start" {
        Start-Backend
        Wait-Backend
        Start-Frontend
        Seed-DemoData
        Test-API
    }
    "stop" {
        Stop-All
    }
    "restart" {
        Stop-All
        Start-Backend
        Wait-Backend
        Start-Frontend
        Seed-DemoData
    }
    "seed" {
        Seed-DemoData
    }
    "status" {
        if (Test-Backend) { Ok "Backend: ONLINE" } else { Warn "Backend: OFFLINE" }
        if (Porta-Em-Uso $FRONTEND_PORT) { Ok "Frontend: ONLINE" } else { Warn "Frontend: OFFLINE" }
    }
    default {
        Start-Backend
        Wait-Backend
        Start-Frontend

        if (!$SkipTests) {
            Test-API
        }
        Seed-DemoData
    }
}